import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GraphQLError } from 'graphql';
import {
  FetchRelatedSongsDto,
  FetchTrendingPlaylistSongsDto,
  FetchTrendingSongDto,
  FetchTrendingSongPlaylistsDto,
  SearchDto,
  FetchGlobalTrendingSongsDto,
  FetchRecommendedArtistsDto,
  FetchArtistDataDto,
  FetchArtistInfoDto,
} from './dto/soundcloud.dto';
import {
  FetchRelatedSongsResponse,
  FetchTrendingPlaylistSongsResponse,
  FetchTrendingSongPlaylistsResponse,
  FetchTrendingSongResponse,
  SearchTracksResponse,
  SearchUsersResponse,
  SearchAlbumsResponse,
  FetchGlobalTrendingSongsResponse,
  FetchArtistsResponse,
  FetchArtistDataResponse,
  FetchArtistResponse,
  Artist,
} from './entities/soundcloud.entities';
import {
  CacheItem,
  TrackData,
  MusicItemData,
  ArtistData,
  TranscodingInfo,
  SoundCloudApiResponse,
} from './interfaces/soundcloud.interfaces';
import { InteractService } from 'src/interact/interact.service';

@Injectable()
export class SoundcloudService {
  private readonly logger = new Logger(SoundcloudService.name);
  private readonly clientId: string;
  private readonly cache = new Map<string, CacheItem<any>>();

  // Constants
  private readonly FALLBACK_ARTWORK = '/music-plate.jpg';
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;
  private readonly REQUEST_TIMEOUT = 10000;
  private readonly CACHE_TTL = 15 * 60 * 1000;
  private readonly FAILURE_CACHE_TTL = 1 * 60 * 1000;
  private readonly STREAM_PROTOCOL_PRIORITY: Record<string, number> = {
    progressive: 5,
    hls: 4,
    'ctr-encrypted-hls': 3,
    'cbc-encrypted-hls': 2,
    opus_0_0: 1,
  };

  constructor(
    private readonly config: ConfigService,
    private readonly interactService: InteractService,
  ) {
    const clientId = this.config.get<string>('SOUNDCLOUD_CLIENT_ID');
    if (!clientId) {
      throw new GraphQLError(
        'SOUNDCLOUD_CLIENT_ID is not defined in the configuration',
      );
    }
    this.clientId = clientId;
  }

  // Cache utilities
  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) return cached.data as T;
    if (cached) this.cache.delete(key);
    return null;
  }

  private setCacheData<T>(key: string, data: T, ttl = this.CACHE_TTL): void {
    this.cache.set(key, { data, expires: Date.now() + ttl });
  }

  // HTTP utilities
  private async fetchWithRetry<T>(
    url: string,
    operationName = 'operation',
  ): Promise<T> {
    const cacheKey = `soundcloud:${url}`;
    const cached = this.getCachedData<T>(cacheKey);
    if (cached) return cached;

    let lastError: Error;
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          this.REQUEST_TIMEOUT,
        );

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.status === 403) throw new Error('URL not ready (403)');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        this.setCacheData(cacheKey, data);
        return data;
      } catch (error: any) {
        lastError = error;
        this.logger.warn(
          `${operationName} failed on attempt ${attempt}/${this.MAX_RETRIES}: ${error.message}`,
        );

        if (attempt < this.MAX_RETRIES) {
          await new Promise((resolve) =>
            setTimeout(resolve, this.RETRY_DELAY * attempt),
          );
        }
      }
    }
    throw lastError!;
  }

  // Stream URL resolution
  private getBestStreamUrl(transcodings?: TranscodingInfo[]): string | null {
    if (!transcodings?.length) return null;

    return (
      transcodings.sort((a, b) => {
        const priorityA =
          this.STREAM_PROTOCOL_PRIORITY[a?.format?.protocol || ''] || 0;
        const priorityB =
          this.STREAM_PROTOCOL_PRIORITY[b?.format?.protocol || ''] || 0;
        return priorityB - priorityA;
      })[0]?.url || null
    );
  }

  private async resolveStreamUrl(url: string): Promise<string | null> {
    if (!url) return null;

    const cacheKey = `resolved:${url}`;
    const cached = this.getCachedData<string>(cacheKey);
    if (cached && !cached.includes('403')) return cached;

    // Try multiple approaches to resolve the stream URL
    const approaches = [
      // Primary approach: Direct resolution
      async () => {
        const streamUrl = `${url}?client_id=${this.clientId}`;
        const data = await this.fetchWithRetry<any>(
          streamUrl,
          'Stream URL resolution',
        );
        return data?.url || null;
      },
      // Alternative 1: Progressive stream
      async () => {
        if (url.includes('/stream/')) {
          const altUrl = url.replace('/stream/', '/stream/progressive/');
          const altData = await this.fetchWithRetry<any>(
            `${altUrl}?client_id=${this.clientId}`,
            'Alternative progressive stream',
          );
          return altData?.url || null;
        }
        return null;
      },
      // Alternative 2: Different transcoding format
      async () => {
        if (url.includes('/stream/')) {
          const altUrl = url.replace('/stream/', '/stream/hls/');
          const altData = await this.fetchWithRetry<any>(
            `${altUrl}?client_id=${this.clientId}`,
            'Alternative HLS stream',
          );
          return altData?.url || null;
        }
        return null;
      },
    ];

    for (let i = 0; i < approaches.length; i++) {
      try {
        const result = await approaches[i]();
        if (result) {
          this.setCacheData(cacheKey, result);
          return result;
        }
      } catch (error) {
        this.logger.warn(
          `Stream URL resolution approach ${i + 1} failed: ${error.message}`,
        );
        continue;
      }
    }

    // If all approaches fail, cache the failure
    this.setCacheData(cacheKey, '403', this.FAILURE_CACHE_TTL);
    return null;
  }

  async fetchStreamUrl(trackId: string): Promise<string | null> {
    const url = `https://api-v2.soundcloud.com/tracks/${trackId}?client_id=${this.clientId}`;

    try {
      const trackData = await this.fetchWithRetry<TrackData>(
        url,
        `Stream URL for track ${trackId}`,
      );

      if (!trackData?.media?.transcodings) {
        return null;
      }

      const streamUrl = this.getBestStreamUrl(trackData.media.transcodings);
      if (!streamUrl) return null;

      const finalStreamUrl = await this.resolveStreamUrl(streamUrl);
      return finalStreamUrl;
    } catch (error) {
      this.logger.warn(
        `Failed to fetch stream URL for track ${trackId}: ${error}`,
      );
      return null;
    }
  }

  // Data processing
  private async processArtist(
    user: TrackData['user'],
  ): Promise<ArtistData | null> {
    if (!user?.id) return null;

    const cacheKey = `processed-artist:${user.id}`;
    const cached = this.getCachedData<ArtistData>(cacheKey);
    if (cached) return cached;

    const processedArtist: ArtistData = {
      id: String(user.id),
      username: user.username || 'Unknown Artist',
      avatarUrl:
        user.avatar_url?.replace('-large', '-t500x500') ||
        this.FALLBACK_ARTWORK,
      verified: user.verified || false,
      city: user.city,
      countryCode: user.country_code,
      followersCount: user.followers_count,
    };

    this.setCacheData(cacheKey, processedArtist);
    return processedArtist;
  }

  private async processTrack(track?: TrackData): Promise<MusicItemData | null> {
    if (!track) return null;

    const trackId = track.id || track.track_id;
    if (!trackId) return null;

    const cacheKey = `processed:${trackId}`;
    const cached = this.getCachedData<MusicItemData>(cacheKey);
    if (cached) return cached;

    try {
      // Get complete track data if needed
      let fullTrackData = track;
      if (!track.title || !track.media || !track.playback_count) {
        const url = `https://api-v2.soundcloud.com/tracks/${trackId}?client_id=${this.clientId}`;
        fullTrackData =
          (await this.fetchWithRetry<TrackData>(
            url,
            `Complete track data for ${trackId}`,
          )) || track;
      }

      // Be more flexible with required fields - charts API might not have all fields
      if (!fullTrackData?.title) {
        this.logger.warn(`Track ${trackId} missing title`);
        return null;
      }

      // Process artist data
      const processedArtist = await this.processArtist(fullTrackData.user);
      if (!processedArtist) {
        this.logger.warn(`Track ${trackId} missing artist data`);
        return null;
      }

      const processedTrack: MusicItemData = {
        id: String(trackId),
        title: fullTrackData.title,
        artist: processedArtist,
        genre: fullTrackData.genre || 'Unknown',
        artwork:
          fullTrackData.artwork_url?.replace('-large', '-t500x500') ||
          fullTrackData.user?.avatar_url?.replace('-large', '-t500x500') ||
          this.FALLBACK_ARTWORK,
        duration: fullTrackData.duration ? fullTrackData.duration / 1000 : 0,
        playbackCount: fullTrackData.playback_count || 0,
        createdAt: fullTrackData.created_at,
      };

      this.setCacheData(cacheKey, processedTrack);
      return processedTrack;
    } catch (error) {
      this.logger.warn(`Failed to process track ${trackId}: ${error}`);
      return null;
    }
  }

  private async processAlbum(album: TrackData): Promise<MusicItemData | null> {
    if (!album?.id) return null;

    const cacheKey = `processed-album:${album.id}`;
    const cached = this.getCachedData<MusicItemData>(cacheKey);
    if (cached) return cached;

    // Process artist data
    const processedArtist = await this.processArtist(album.user);
    if (!processedArtist) {
      this.logger.warn(`Album ${album.id} missing artist data`);
      return null;
    }

    const processedAlbum: MusicItemData = {
      id: String(album.id),
      title: album.title || 'Unknown Album',
      artist: processedArtist,
      genre: album.genre || 'Unknown',
      artwork:
        album.artwork_url?.replace('-large', '-t500x500') ||
        album.user?.avatar_url?.replace('-large', '-t500x500') ||
        this.FALLBACK_ARTWORK,
      duration: album.duration ? album.duration / 1000 : 0,
      trackCount: album.track_count || 0,
    };

    this.setCacheData(cacheKey, processedAlbum);
    return processedAlbum;
  }

  // Public API methods
  async fetchTrendingSong(
    dto: FetchTrendingSongDto,
  ): Promise<FetchTrendingSongResponse> {
    const url = `https://api-v2.soundcloud.com/resolve?url=https://soundcloud.com/trending-music-${dto.CountryCode}&client_id=${this.clientId}`;
    const data = await this.fetchWithRetry<any>(url, 'Trending song fetch');

    if (!data?.id) {
      throw new GraphQLError('Failed to fetch trending song data');
    }

    return {
      id: data.id,
      username: data.username || 'Unknown',
    };
  }

  async fetchTrendingSongPlaylists(
    dto: FetchTrendingSongPlaylistsDto,
  ): Promise<FetchTrendingSongPlaylistsResponse[]> {
    if (!dto.id) throw new GraphQLError('Missing ID parameter');

    const url = `https://api-v2.soundcloud.com/users/${dto.id}/playlists?client_id=${this.clientId}&limit=50`;
    const data = await this.fetchWithRetry<SoundCloudApiResponse<any>>(
      url,
      'Trending song playlists fetch',
    );

    if (!data?.collection || !Array.isArray(data.collection)) {
      throw new GraphQLError('Invalid response format from API');
    }

    return data.collection.map((playlist: any) => ({
      id: playlist.id,
      title: playlist.title || 'Unknown Playlist',
      genre: playlist.genre || 'Unknown',
      artwork:
        playlist.artwork_url?.replace('-large', '-t500x500') ||
        this.FALLBACK_ARTWORK,
    }));
  }

  async fetchTrendingPlaylistSongs(
    dto: FetchTrendingPlaylistSongsDto,
  ): Promise<FetchTrendingPlaylistSongsResponse> {
    if (!dto.id) throw new GraphQLError('Missing ID parameter');

    const url = `https://api-v2.soundcloud.com/playlists/${dto.id}?client_id=${this.clientId}`;

    try {
      this.logger.log(`Fetching playlist songs for ID: ${dto.id}`);

      const data = await this.fetchWithRetry<any>(
        url,
        'Trending playlist songs fetch',
      );

      this.logger.log(
        `Playlist data received: ${JSON.stringify(data, null, 2)}`,
      );

      if (!data) {
        throw new GraphQLError('No data received from SoundCloud API');
      }

      if (!data.tracks) {
        throw new GraphQLError(
          `Playlist not found or has no tracks. Playlist ID: ${dto.id}`,
        );
      }

      if (!Array.isArray(data.tracks)) {
        throw new GraphQLError(
          'Invalid response format: "tracks" field is not an array',
        );
      }

      this.logger.log(`Processing ${data.tracks.length} tracks from playlist`);

      const processedTracks = await Promise.all(
        data.tracks.map((track: TrackData) => this.processTrack(track)),
      );

      const tracks = processedTracks.filter(
        (track): track is MusicItemData => track !== null,
      );

      this.logger.log(`Successfully processed ${tracks.length} tracks`);

      return {
        tracks,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching playlist songs for ID ${dto.id}:`,
        error,
      );
      throw new GraphQLError(
        `Failed to fetch playlist songs: ${error.message}`,
      );
    }
  }

  async fetchRelatedSongs(
    dto: FetchRelatedSongsDto,
  ): Promise<FetchRelatedSongsResponse> {
    if (!dto.id) throw new GraphQLError('Missing ID parameter');

    const url = `https://api-v2.soundcloud.com/tracks/${dto.id}/related?client_id=${this.clientId}&limit=50`;

    const data = await this.fetchWithRetry<SoundCloudApiResponse<TrackData>>(
      url,
      'Related songs fetch',
    );

    if (!data?.collection || !Array.isArray(data.collection)) {
      throw new GraphQLError(
        'Invalid response format: "collection" field missing or not an array',
      );
    }

    const processedTracks = await Promise.all(
      data.collection.map((track: TrackData) => this.processTrack(track)),
    );

    const tracks = processedTracks.filter(
      (track): track is MusicItemData => track !== null,
    );

    return {
      tracks,
    };
  }

  async searchTracks(searchDto: SearchDto): Promise<SearchTracksResponse> {
    if (!searchDto.q) throw new GraphQLError('Missing search query');

    let url: string;
    if (searchDto.nextHref) {
      // Add client_id to the nextHref when making the request
      url = `${searchDto.nextHref}&client_id=${this.clientId}`;
    } else {
      url = `https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(searchDto.q)}&client_id=${this.clientId}`;
    }

    const data = await this.fetchWithRetry<SoundCloudApiResponse<TrackData>>(
      url,
      'Track search',
    );

    if (!data?.collection || !Array.isArray(data.collection)) {
      throw new GraphQLError(
        'Invalid response format: "collection" field missing or not an array',
      );
    }

    const processedTracks = await Promise.all(
      data.collection.map((track: TrackData) => this.processTrack(track)),
    );

    const tracks = processedTracks.filter(
      (track): track is MusicItemData => track !== null,
    );

    return {
      tracks,
      nextHref: data.next_href || undefined, // Return nextHref without client_id
    };
  }

  async searchUsers(searchDto: SearchDto): Promise<SearchUsersResponse> {
    if (!searchDto.q) throw new GraphQLError('Missing search query');

    let url: string;
    if (searchDto.nextHref) {
      // Add client_id to the nextHref when making the request
      url = `${searchDto.nextHref}&client_id=${this.clientId}`;
    } else {
      url = `https://api-v2.soundcloud.com/search/users?q=${encodeURIComponent(searchDto.q)}&client_id=${this.clientId}`;
    }

    const data = await this.fetchWithRetry<SoundCloudApiResponse<any>>(
      url,
      'User search',
    );

    if (!data?.collection || !Array.isArray(data.collection)) {
      throw new GraphQLError(
        'Invalid response format: "collection" field missing or not an array',
      );
    }

    const processedUsers = await Promise.all(
      data.collection.map((user: any) => this.processArtist(user)),
    );

    const users = processedUsers.filter(
      (user): user is ArtistData => user !== null,
    );

    return {
      users,
      nextHref: data.next_href || undefined, // Return nextHref without client_id
    };
  }

  async searchAlbums(searchDto: SearchDto): Promise<SearchAlbumsResponse> {
    if (!searchDto.q) throw new GraphQLError('Missing search query');

    let url: string;
    if (searchDto.nextHref) {
      // Add client_id to the nextHref when making the request
      url = `${searchDto.nextHref}&client_id=${this.clientId}`;
    } else {
      url = `https://api-v2.soundcloud.com/search/albums?q=${encodeURIComponent(searchDto.q)}&client_id=${this.clientId}`;
    }

    const data = await this.fetchWithRetry<SoundCloudApiResponse<any>>(
      url,
      'Album search',
    );

    if (!data?.collection || !Array.isArray(data.collection)) {
      throw new GraphQLError(
        'Invalid response format: "collection" field missing or not an array',
      );
    }

    const processedAlbums = await Promise.all(
      data.collection.map((album: any) => this.processAlbum(album)),
    );

    const albums = processedAlbums.filter(
      (album): album is MusicItemData => album !== null,
    );

    return {
      albums,
      nextHref: data.next_href || undefined, // Return nextHref without client_id
    };
  }

  async fetchGlobalTrendingSongs(
    dto: FetchGlobalTrendingSongsDto,
  ): Promise<FetchGlobalTrendingSongsResponse> {
    let url: string;
    if (dto.nextHref) {
      // Add client_id to the nextHref when making the request
      url = `${dto.nextHref}&client_id=${this.clientId}`;
    } else {
      // Try the charts API with a simpler URL format
      url = `https://api-v2.soundcloud.com/charts?kind=${dto.kind || 'trending'}&genre=${dto.genre || 'soundcloud:genres:all-music'}&limit=${dto.limit || 10}&client_id=${this.clientId}`;
    }

    const data = await this.fetchWithRetry<any>(
      url,
      'Global trending songs fetch',
    );

    if (!data?.collection || !Array.isArray(data.collection)) {
      throw new GraphQLError('Invalid response format from API');
    }

    // Charts API returns collection items with nested 'track' property
    const tracksData = data.collection
      .map((item: any) => item.track)
      .filter(Boolean);

    const processedTracks = await Promise.all(
      tracksData.map((track: TrackData) => this.processTrack(track)),
    );

    const tracks = processedTracks.filter(
      (track): track is MusicItemData => track !== null,
    );

    return {
      tracks,
      nextHref: data.next_href || undefined,
    };
  }

  /**
   * Recommend up to 50 songs for a user based on their recent played history.
   * Fetches related songs for each recent track, deduplicates, caches, and returns the result.
   */
  async recommendSongsForUser(
    userId: string,
  ): Promise<FetchRelatedSongsResponse> {
    // Try cache first
    const cacheKey = `recommendations:${userId}`;
    const cached = this.getCachedData<FetchRelatedSongsResponse>(cacheKey);
    if (cached) return cached;

    // Get recent played songs
    const recent = await this.interactService.getRecentPlayed(userId);
    if (!recent.length) return { tracks: [] };

    // Fetch related songs for each recent track (in parallel)
    const relatedLists = await Promise.all(
      recent.map(async (item) => {
        const rel = await this.fetchRelatedSongs({ id: item.trackId });
        return rel.tracks;
      }),
    );

    // Round-robin deduplication by normalized title+artist
    function normalize(str: string): string {
      return str
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/\(.*?\)/g, '')
        .replace(/feat\..*/g, '')
        .replace(/\|.*/g, '')
        .replace(/[-_].*/g, '')
        .replace(/\.mp3|\.m4a|\.wav|\.flac/gi, '')
        .replace(/[^a-z0-9 ]/g, '')
        .trim();
    }

    const dedupSet = new Map<string, MusicItemData>();
    let added = 0;
    let i = 0;
    while (added < 50) {
      let addedThisRound = false;
      for (const list of relatedLists) {
        if (list[i]) {
          const track = list[i];
          const key =
            normalize(track.title) + '|' + normalize(track.artist.username);
          if (!dedupSet.has(key)) {
            dedupSet.set(key, track);
            added++;
            addedThisRound = true;
            if (added >= 50) break;
          }
        }
      }
      if (!addedThisRound) break; // no more songs to add
      i++;
    }

    // Return up to 50 tracks
    const recommended = Array.from(dedupSet.values()).slice(0, 50);
    const response: FetchRelatedSongsResponse = { tracks: recommended };
    // Cache for exactly 5 minutes, do not extend on repeated loads
    this.setCacheData(cacheKey, response, 5 * 60 * 1000); // 5 min cache
    return response;
  }

  /**
   * Fetch recommended artists from trending playlists.
   * This is much more efficient than fetching all songs first.
   */
  async fetchRecommendedArtists(
    dto: FetchRecommendedArtistsDto,
  ): Promise<FetchArtistsResponse> {
    const limit = dto.limit || 10;
    const countryCode = dto.countryCode || 'US';

    // Try cache first
    const cacheKey = `recommended-artists:${countryCode}:${limit}`;
    const cached = this.getCachedData<FetchArtistsResponse>(cacheKey);
    if (cached) return cached;

    try {
      // Get trending playlists first
      const trendingId = await this.fetchTrendingSong({
        CountryCode: countryCode,
      });
      const playlists = await this.fetchTrendingSongPlaylists({
        id: trendingId.id,
      });

      // Find the "All Genres" playlist
      const allGenresPlaylist = playlists.find((p) => p.genre === 'All Genres');
      if (!allGenresPlaylist) {
        return { artists: [] };
      }

      // Fetch songs from the "All Genres" playlist
      const playlistSongs = await this.fetchTrendingPlaylistSongs({
        id: allGenresPlaylist.id,
        limit: 50, // Get more songs to have more artists to choose from
      });

      // Extract unique artists
      const artistMap = new Map<string, ArtistData>();

      for (const track of playlistSongs.tracks) {
        if (track.artist && !artistMap.has(track.artist.id)) {
          artistMap.set(track.artist.id, track.artist);
        }
      }

      // Convert to array and limit
      const artists = Array.from(artistMap.values()).slice(0, limit);

      const response: FetchArtistsResponse = { artists };

      // Cache for 10 minutes since artist data doesn't change frequently
      this.setCacheData(cacheKey, response, 10 * 60 * 1000);

      return response;
    } catch (error) {
      this.logger.error('Error fetching recommended artists:', error);
      return { artists: [] };
    }
  }

  async fetchArtistData(
    dto: FetchArtistDataDto,
  ): Promise<FetchArtistDataResponse> {
    let url = '';
    if (dto.nextHref) {
      // Use nextHref directly (append client_id if not present)
      url = dto.nextHref.includes('client_id=')
        ? dto.nextHref
        : `${dto.nextHref}&client_id=${this.clientId}`;
    } else {
      switch (dto.type) {
        case 'tracks':
          url = `https://api-v2.soundcloud.com/users/${dto.artistId}/tracks?client_id=${this.clientId}`;
          break;
        case 'playlists':
          url = `https://api-v2.soundcloud.com/users/${dto.artistId}/playlists?client_id=${this.clientId}`;
          break;
        case 'likes':
          url = `https://api-v2.soundcloud.com/users/${dto.artistId}/likes?client_id=${this.clientId}`;
          break;
        case 'reposts':
          url = `https://api-v2.soundcloud.com/stream/users/${dto.artistId}?client_id=${this.clientId}`;
          break;
        default:
          throw new GraphQLError('Invalid type parameter');
      }
    }

    const data = await this.fetchWithRetry<any>(
      url,
      `Artist ${dto.type || 'tracks'} fetch`,
    );
    if (!data?.collection || !Array.isArray(data.collection)) {
      throw new GraphQLError('Invalid response format from API');
    }
    const nextHref = data.next_href || undefined;

    if ((dto.type || 'tracks') === 'playlists') {
      const playlists = await Promise.all(
        data.collection.map((playlist: any) => this.processAlbum(playlist)),
      );
      return { playlists: playlists.filter((p: any) => p !== null), nextHref };
    } else {
      const tracks = await Promise.all(
        data.collection
          .map((item: any) =>
            item.track ? item.track : item.origin ? item.origin : item,
          )
          .map((track: any) => this.processTrack(track)),
      );
      return { tracks: tracks.filter((t: any) => t !== null), nextHref };
    }
  }

  async fetchArtistInfo(dto: FetchArtistInfoDto): Promise<Artist> {
    if (!dto.artistId) throw new GraphQLError('Missing artist ID parameter');

    const url = `https://api-v2.soundcloud.com/users/${dto.artistId}?client_id=${this.clientId}`;

    try {
      const artistData = await this.fetchWithRetry<any>(
        url,
        `Artist info fetch for ${dto.artistId}`,
      );

      if (!artistData?.id) {
        throw new GraphQLError('Artist not found');
      }

      const processedArtist = await this.processArtist(artistData);
      if (!processedArtist) {
        throw new GraphQLError('Failed to process artist data');
      }

      return processedArtist;
    } catch (error) {
      this.logger.error(
        `Error fetching artist info for ${dto.artistId}:`,
        error,
      );
      throw new GraphQLError(`Failed to fetch artist info: ${error.message}`);
    }
  }
}
