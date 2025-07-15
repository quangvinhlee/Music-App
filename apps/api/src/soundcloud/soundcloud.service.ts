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
  FetchAlbumTracksResponse,
} from './entities/soundcloud.entities';
import {
  CacheItem,
  TrackData,
  MusicItemData,
  TranscodingInfo,
  SoundCloudApiResponse,
} from './interfaces/soundcloud.interfaces';
import { InteractService } from 'src/interact/interact.service';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'prisma/prisma.service';
import { Artist } from '../shared/entities/artist.entity';
import { toMusicItem, MusicItem } from '../shared/entities/artist.entity';

@Injectable()
export class SoundcloudService {
  private readonly logger = new Logger(SoundcloudService.name);
  private readonly clientId: string;
  private readonly cache = new Map<string, CacheItem<any>>();
  private readonly MAX_CACHE_SIZE = 500;
  private cleanupInterval: NodeJS.Timeout;

  // Constants
  private readonly FALLBACK_ARTWORK = '/music-plate.jpg';
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
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
  ) {
    const clientId = this.config.get<string>('SOUNDCLOUD_CLIENT_ID');
    if (!clientId) {
      throw new GraphQLError(
        'SOUNDCLOUD_CLIENT_ID is not defined in the configuration',
      );
    }
    this.clientId = clientId;
    this.cleanupInterval = setInterval(
      () => this.cleanupCache(),
      5 * 60 * 1000,
    );
  }

  // Cache utilities
  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) return cached.data as T;
    if (cached) this.cache.delete(key);
    return null;
  }

  private setCacheData<T>(key: string, data: T, ttl = this.CACHE_TTL): void {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, { data, expires: Date.now() + ttl });
  }

  private cleanupCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (value.expires <= now) {
        this.cache.delete(key);
      }
    }
  }

  onModuleDestroy() {
    clearInterval(this.cleanupInterval);
  }

  // Simple HTTP fetch
  private async fetchData<T>(url: string): Promise<T> {
    const cacheKey = `soundcloud:${url}`;
    const cached = this.getCachedData<T>(cacheKey);
    if (cached) return cached;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    this.setCacheData(cacheKey, data);
    return data;
  }

  // Simplified stream URL resolution
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

    try {
      const streamUrl = `${url}?client_id=${this.clientId}`;
      const data = await this.fetchData<any>(streamUrl);
      const result = data?.url || null;

      if (result) {
        this.setCacheData(cacheKey, result);
        return result;
      }
    } catch (error) {
      this.logger.warn(`Stream URL resolution failed: ${error.message}`);
    }

    this.setCacheData(cacheKey, '403', this.FAILURE_CACHE_TTL);
    return null;
  }

  async fetchStreamUrl(trackId: string): Promise<string | null> {
    if (this.isInternalId(trackId)) {
      const track = await this.prisma.track.findUnique({
        where: { id: trackId },
        select: { streamUrl: true },
      });
      return track?.streamUrl || null;
    }

    const url = `https://api-v2.soundcloud.com/tracks/${trackId}?client_id=${this.clientId}`;

    try {
      const trackData = await this.fetchData<TrackData>(url);

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

  // Data processing utilities
  private getArtworkUrl(artworkUrl?: string, fallbackUrl?: string): string {
    return (
      artworkUrl?.replace('-large', '-t500x500') ||
      fallbackUrl?.replace('-large', '-t500x500') ||
      this.FALLBACK_ARTWORK
    );
  }

  private async processArtist(user: TrackData['user']): Promise<Artist | null> {
    if (!user?.id) return null;

    const cacheKey = `processed-artist:${user.id}`;
    const cached = this.getCachedData<Artist>(cacheKey);
    if (cached) return cached;

    const processedArtist: Artist = {
      id: String(user.id),
      username: user.username || 'Unknown Artist',
      avatarUrl: this.getArtworkUrl(user.avatar_url),
      verified: user.verified || false,
      city: user.city,
      countryCode: user.country_code,
      followersCount: user.followers_count,
    };

    this.setCacheData(cacheKey, processedArtist);
    return processedArtist;
  }

  public async processTrack(track?: TrackData): Promise<MusicItemData | null> {
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
        fullTrackData = (await this.fetchData<TrackData>(url)) || track;
      }

      if (!fullTrackData?.title) {
        this.logger.warn(`Track ${trackId} missing title`);
        return null;
      }

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
        artwork: this.getArtworkUrl(
          fullTrackData.artwork_url,
          fullTrackData.user?.avatar_url,
        ),
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

    const processedArtist = await this.processArtist(album.user);
    if (!processedArtist) {
      this.logger.warn(`Album ${album.id} missing artist data`);
      return null;
    }

    // Process tracks if available
    let tracks: MusicItemData[] = [];
    if (album.tracks && Array.isArray(album.tracks)) {
      const processedTracks = await Promise.all(
        album.tracks.map((track: TrackData) => this.processTrack(track)),
      );
      tracks = processedTracks.filter(
        (track): track is MusicItemData => track !== null,
      );
    }

    const processedAlbum: MusicItemData = {
      id: String(album.id),
      title: album.title || 'Unknown Album',
      artist: processedArtist,
      genre: album.genre || 'Unknown',
      artwork: this.getArtworkUrl(album.artwork_url, album.user?.avatar_url),
      duration: album.duration ? album.duration / 1000 : 0,
      trackCount: album.track_count || 0,
      createdAt: album.created_at,
      tracks: tracks.length > 0 ? tracks : undefined,
    };

    this.setCacheData(cacheKey, processedAlbum);
    return processedAlbum;
  }

  // Helper method for processing collections
  private async processCollection<T>(
    collection: T[],
    processor: (item: T) => Promise<MusicItemData | null>,
  ): Promise<MusicItemData[]> {
    const processed = await Promise.all(
      collection.map((item) => processor(item)),
    );
    return processed.filter((item): item is MusicItemData => item !== null);
  }

  // Public API methods
  async fetchTrendingSong(
    dto: FetchTrendingSongDto,
  ): Promise<FetchTrendingSongResponse> {
    const url = `https://api-v2.soundcloud.com/resolve?url=https://soundcloud.com/trending-music-${dto.CountryCode}&client_id=${this.clientId}`;
    const data = await this.fetchData<any>(url);

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
    const data = await this.fetchData<SoundCloudApiResponse<any>>(url);

    if (!data?.collection || !Array.isArray(data.collection)) {
      throw new GraphQLError('Invalid response format from API');
    }

    return data.collection.map((playlist: any) => ({
      id: playlist.id,
      name: playlist.title || 'Unknown Playlist',
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

      const data = await this.fetchData<any>(url);

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

      const tracks = await this.processCollection(
        data.tracks,
        (track: TrackData) => this.processTrack(track),
      );

      this.logger.log(`Successfully processed ${tracks.length} tracks`);

      return { tracks };
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

    // Check if this is an internal track ID (MongoDB ObjectId format)
    if (this.isInternalId(dto.id)) {
      return { tracks: [] };
    }

    const url = `https://api-v2.soundcloud.com/tracks/${dto.id}/related?client_id=${this.clientId}&limit=50`;

    const data = await this.fetchData<SoundCloudApiResponse<TrackData>>(url);

    if (!data?.collection || !Array.isArray(data.collection)) {
      throw new GraphQLError(
        'Invalid response format: "collection" field missing or not an array',
      );
    }

    const tracks = await this.processCollection(
      data.collection,
      (track: TrackData) => this.processTrack(track),
    );

    return { tracks };
  }

  async searchTracks(searchDto: SearchDto): Promise<SearchTracksResponse> {
    if (!searchDto.q) throw new GraphQLError('Missing search query');

    const url = searchDto.nextHref
      ? `${searchDto.nextHref}&client_id=${this.clientId}`
      : `https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(searchDto.q)}&client_id=${this.clientId}`;

    const data = await this.fetchData<SoundCloudApiResponse<TrackData>>(url);

    if (!data?.collection || !Array.isArray(data.collection)) {
      throw new GraphQLError(
        'Invalid response format: "collection" field missing or not an array',
      );
    }

    const tracks = await this.processCollection(
      data.collection,
      (track: TrackData) => this.processTrack(track),
    );

    return {
      tracks,
      nextHref: data.next_href || undefined,
    };
  }

  async searchUsers(searchDto: SearchDto): Promise<SearchUsersResponse> {
    if (!searchDto.q) throw new GraphQLError('Missing search query');

    const url = searchDto.nextHref
      ? `${searchDto.nextHref}&client_id=${this.clientId}`
      : `https://api-v2.soundcloud.com/search/users?q=${encodeURIComponent(searchDto.q)}&client_id=${this.clientId}`;

    const data = await this.fetchData<SoundCloudApiResponse<any>>(url);

    if (!data?.collection || !Array.isArray(data.collection)) {
      throw new GraphQLError(
        'Invalid response format: "collection" field missing or not an array',
      );
    }

    const processedUsers = await Promise.all(
      data.collection.map((user: any) => this.processArtist(user)),
    );

    const users = processedUsers.filter(
      (user): user is Artist => user !== null,
    );

    return {
      users,
      nextHref: data.next_href || undefined,
    };
  }

  async searchAlbums(searchDto: SearchDto): Promise<SearchAlbumsResponse> {
    if (!searchDto.q) throw new GraphQLError('Missing search query');

    const url = searchDto.nextHref
      ? `${searchDto.nextHref}&client_id=${this.clientId}`
      : `https://api-v2.soundcloud.com/search/albums?q=${encodeURIComponent(searchDto.q)}&client_id=${this.clientId}`;

    const data = await this.fetchData<SoundCloudApiResponse<any>>(url);

    if (!data?.collection || !Array.isArray(data.collection)) {
      throw new GraphQLError(
        'Invalid response format: "collection" field missing or not an array',
      );
    }

    // Process albums and fetch their tracks
    const processedAlbums = await Promise.all(
      data.collection.map(async (album: any) => {
        const processedAlbum = await this.processAlbum(album);
        if (!processedAlbum) return null;

        // Fetch tracks for this album
        try {
          const albumTracks = await this.fetchAlbumTracks({ id: album.id });
          return {
            ...processedAlbum,
            tracks: albumTracks.playlist.tracks,
          };
        } catch (error) {
          this.logger.warn(
            `Failed to fetch tracks for album ${album.id}: ${error.message}`,
          );
          return processedAlbum;
        }
      }),
    );

    const albums = processedAlbums.filter(
      (album): album is MusicItemData => album !== null,
    );

    return {
      albums,
      nextHref: data.next_href || undefined,
    };
  }

  async fetchGlobalTrendingSongs(
    dto: FetchGlobalTrendingSongsDto,
  ): Promise<FetchGlobalTrendingSongsResponse> {
    const url = dto.nextHref
      ? `${dto.nextHref}&client_id=${this.clientId}`
      : `https://api-v2.soundcloud.com/charts?kind=${dto.kind || 'trending'}&genre=${dto.genre || 'soundcloud:genres:all-music'}&limit=${dto.limit || 10}&client_id=${this.clientId}`;

    const data = await this.fetchData<any>(url);

    if (!data?.collection || !Array.isArray(data.collection)) {
      throw new GraphQLError('Invalid response format from API');
    }

    // Charts API returns collection items with nested 'track' property
    const tracksData = data.collection
      .map((item: any) => item.track)
      .filter(Boolean);

    const tracks = await this.processCollection(
      tracksData,
      (track: TrackData) => this.processTrack(track),
    );

    return {
      tracks,
      nextHref: data.next_href || undefined,
    };
  }

  // Helper function for normalizing track titles
  private normalizeTrackTitle(str: string): string {
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

  async recommendSongsForUser(
    userId: string,
  ): Promise<FetchRelatedSongsResponse> {
    const cacheKey = `recommendations:${userId}`;
    const cached = this.getCachedData<FetchRelatedSongsResponse>(cacheKey);
    if (cached) return cached;

    try {
      const recent = await this.interactService.getRecentPlayed(userId);
      if (!recent.length) {
        this.logger.warn(`No recent played tracks found for user ${userId}`);
        return { tracks: [] };
      }

      const relatedLists = await Promise.all(
        recent.map(async (item) => {
          try {
            const rel = await this.fetchRelatedSongs({ id: item.trackId });
            return rel.tracks;
          } catch (error) {
            this.logger.warn(
              `Failed to fetch related songs for track ${item.trackId}: ${error.message}`,
            );
            return [];
          }
        }),
      );

      // Round-robin deduplication
      const dedupSet = new Map<string, MusicItemData>();
      let added = 0;
      let i = 0;

      while (added < 50) {
        let addedThisRound = false;
        for (const list of relatedLists) {
          if (list[i]) {
            const track = list[i];
            const key =
              this.normalizeTrackTitle(track.title) +
              '|' +
              this.normalizeTrackTitle(track.artistId || '');
            if (!dedupSet.has(key)) {
              dedupSet.set(key, track as MusicItemData);
              added++;
              addedThisRound = true;
              if (added >= 50) break;
            }
          }
        }
        if (!addedThisRound) break;
        i++;
      }

      const recommended = Array.from(dedupSet.values()).slice(0, 50);
      const response: FetchRelatedSongsResponse = { tracks: recommended };

      this.setCacheData(cacheKey, response, 5 * 60 * 1000);
      return response;
    } catch (error) {
      this.logger.error(
        `Error in recommendSongsForUser for user ${userId}:`,
        error,
      );
      return { tracks: [] };
    }
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

      // Extract unique artists from processed tracks
      const artistMap = new Map<string, Artist>();

      for (const track of playlistSongs.tracks) {
        if (
          track.artist &&
          track.artist.id &&
          !artistMap.has(track.artist.id)
        ) {
          // Use the actual artist data from the processed track
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

  // Helper to check if ID is internal MongoDB ObjectId
  private isInternalId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  async fetchArtistData(
    dto: FetchArtistDataDto,
  ): Promise<FetchArtistDataResponse> {
    if (!dto.artistId) {
      throw new GraphQLError('Missing artist ID parameter');
    }

    // Check if this is an internal MongoDB ObjectId
    if (this.isInternalId(dto.artistId)) {
      this.logger.warn(
        `fetchArtistData called with internal ID: ${dto.artistId}`,
      );
      // For internal users, fetch from our database
      const user = await this.userService.getUserById(dto.artistId);
      this.logger.log(
        `fetchArtistData - user.tracks length: ${user.tracks?.length || 0}`,
      );
      this.logger.log(
        `fetchArtistData - user.tracks: ${JSON.stringify(user.tracks, null, 2)}`,
      );
      // Map tracks to MusicItem[]
      const tracks = (user.tracks || []).map((track: any) =>
        toMusicItem(track),
      );
      // Fetch track data for each like using trackId
      const likes = await Promise.all(
        (user.likes || []).map(async (like: any) => {
          try {
            // Fetch the track from database using trackId
            const track = await this.prisma.track.findUnique({
              where: { id: like.trackId },
            });

            if (!track) {
              this.logger.log(`Track not found for like ${like.trackId}`);
              return null;
            }

            return {
              ...toMusicItem(track),
              artist: {
                id: user.id,
                username: user.username,
                avatarUrl: user.avatar || '',
                verified: false,
                city: '',
                countryCode: '',
                followersCount: 0,
              },
            };
          } catch (error) {
            this.logger.error(`Error fetching track ${like.trackId}:`, error);
            return null;
          }
        }),
      );

      // Filter out null entries
      const validLikes = likes.filter((like) => like !== null);
      this.logger.log(
        `fetchArtistData - mapped likes length: ${validLikes.length}`,
      );
      this.logger.log(
        `fetchArtistData - mapped likes: ${JSON.stringify(validLikes, null, 2)}`,
      );
      // Map playlists to Playlist[] and ensure all required fields are present
      const playlists = (user.playlists || []).map((playlist: any) => ({
        id: playlist.id,
        name: playlist.name || '',
        description: playlist.description ?? null,
        isPublic: playlist.isPublic ?? true,
        genre: playlist.genre || '',
        artwork: playlist.artwork || '',
        userId: playlist.userId,
        artist: playlist.artist ?? null,
        tracks: Array.isArray(playlist.tracks) ? playlist.tracks : [],
        createdAt: playlist.createdAt,
        updatedAt: playlist.updatedAt,
      }));
      // Respect the type param (tracks, playlists, likes, etc.)
      if ((dto.type || 'tracks') === 'playlists') {
        return {
          playlists,
          nextHref: undefined,
        };
      } else if ((dto.type || 'tracks') === 'likes') {
        this.logger.log(`Returning likes with length: ${validLikes.length}`);
        return {
          likes: validLikes,
          nextHref: undefined,
        };
      } else if ((dto.type || 'tracks') === 'reposts') {
        return {
          reposts: [], // TODO: implement reposts for internal users
          nextHref: undefined,
        };
      } else {
        return {
          tracks,
          nextHref: undefined,
        };
      }
    }

    let url = '';

    if (dto.nextHref) {
      url = dto.nextHref.includes('client_id=')
        ? dto.nextHref
        : `${dto.nextHref}&client_id=${this.clientId}`;
    } else {
      const baseUrl = `https://api-v2.soundcloud.com/users/${dto.artistId}`;
      const endpoints = {
        tracks: `${baseUrl}/tracks`,
        playlists: `${baseUrl}/playlists`,
        likes: `${baseUrl}/likes`,
        reposts: `https://api-v2.soundcloud.com/stream/users/${dto.artistId}`,
      };

      url = endpoints[dto.type || 'tracks'];
      if (!url) {
        throw new GraphQLError('Invalid type parameter');
      }
      url += `?client_id=${this.clientId}`;
    }

    this.logger.debug(`Fetching artist data from: ${url}`);

    const data = await this.fetchData<any>(url);
    if (!data?.collection || !Array.isArray(data.collection)) {
      throw new GraphQLError('Invalid response format from API');
    }

    const nextHref = data.next_href || undefined;

    // For SoundCloud users, we need to fetch all data types and return them together
    // This ensures the frontend gets all the data it needs regardless of the requested type

    let tracks: any[] = [];
    let playlists: any[] = [];
    let likes: any[] = [];
    let reposts: any[] = [];

    // Fetch tracks
    if (
      (dto.type || 'tracks') === 'tracks' ||
      (dto.type || 'tracks') === 'reposts'
    ) {
      tracks = await this.processCollection(
        data.collection.map((item: any) =>
          item.track ? item.track : item.origin ? item.origin : item,
        ),
        (track: any) => this.processTrack(track),
      );
    }

    // Fetch playlists
    if ((dto.type || 'tracks') === 'playlists') {
      playlists = await Promise.all(
        data.collection.map(async (playlist: any) => {
          // Process artist for the playlist owner
          const processedArtist = await this.processArtist(playlist.user);
          // Fetch tracks for this playlist
          let playlistTracks: any[] = [];
          try {
            const playlistSongs = await this.fetchTrendingPlaylistSongs({
              id: playlist.id,
            });
            // Map tracks to PlaylistTrack[]
            playlistTracks = (playlistSongs.tracks || []).map((track: any) => ({
              id: track.id,
              trackId: track.id,
              title: track.title || null,
              artistId: track.artist?.id || null,
              artwork: track.artwork || null,
              duration:
                track.duration != null ? Math.round(track.duration) : null, // Ensure integer
              genre: track.genre || null,
              playlistId: playlist.id,
              addedAt: playlist.created_at
                ? new Date(playlist.created_at)
                : new Date(), // Use playlist createdAt or now
              artist: track.artist || null, // Include the artist object
            }));
          } catch (error) {
            this.logger.warn(
              `Failed to fetch tracks for playlist ${playlist.id}: ${error.message}`,
            );
          }
          // Map to Playlist GraphQL type
          return {
            id: playlist.id,
            name: playlist.title || 'Unknown Playlist',
            description: null, // Not available from SoundCloud
            isPublic: true, // Assume public for SoundCloud
            genre: playlist.genre || 'Unknown',
            userId: dto.artistId,
            artwork: playlist.artwork_url
              ? playlist.artwork_url.replace('-large', '-t500x500')
              : this.FALLBACK_ARTWORK,
            tracks: playlistTracks,
            createdAt: playlist.created_at
              ? new Date(playlist.created_at)
              : playlist.last_modified
                ? new Date(playlist.last_modified)
                : new Date(),
            updatedAt: playlist.last_modified
              ? new Date(playlist.last_modified)
              : playlist.created_at
                ? new Date(playlist.created_at)
                : new Date(),
          };
        }),
      );
      playlists = playlists.filter((p: any) => p !== null);
    }

    // Fetch likes
    if ((dto.type || 'tracks') === 'likes') {
      likes = await this.processCollection(
        data.collection.map((item: any) =>
          item.track ? item.track : item.origin ? item.origin : item,
        ),
        (track: any) => this.processTrack(track),
      );
    }

    // Return all data
    return { tracks, playlists, likes, reposts, nextHref };
  }

  async fetchArtistInfo(dto: FetchArtistInfoDto): Promise<Artist> {
    if (!dto.artistId) throw new GraphQLError('Missing artist ID parameter');

    // Check if it's a MongoDB ObjectId (internal user)
    if (this.isInternalId(dto.artistId)) {
      // This is an internal user, fetch from database
      try {
        const user = await this.prisma.user.findUnique({
          where: { id: dto.artistId },
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        });

        if (!user) {
          throw new GraphQLError('User not found');
        }

        return {
          id: user.id,
          username: user.username,
          avatarUrl: user.avatar || '',
          verified: false,
          city: '',
          countryCode: '',
          followersCount: 0,
        } as Artist;
      } catch (error) {
        this.logger.error(
          `Error fetching internal user info for ${dto.artistId}:`,
          error,
        );
        throw new GraphQLError(`Failed to fetch user info: ${error.message}`);
      }
    }

    // This is a SoundCloud artist ID, fetch from SoundCloud API
    const url = `https://api-v2.soundcloud.com/users/${dto.artistId}?client_id=${this.clientId}`;

    try {
      const artistData = await this.fetchData<any>(url);

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

  // Playlists
  async fetchAlbumTracks(dto: {
    id: string;
  }): Promise<FetchAlbumTracksResponse> {
    if (!dto.id) throw new GraphQLError('Missing ID parameter');

    const url = `https://api-v2.soundcloud.com/playlists/${dto.id}?client_id=${this.clientId}`;

    try {
      const data = await this.fetchData<any>(url);

      if (!data) {
        throw new GraphQLError('No data received from SoundCloud API');
      }

      if (!data.tracks) {
        throw new GraphQLError(
          `Album not found or has no tracks. Album ID: ${dto.id}`,
        );
      }

      if (!Array.isArray(data.tracks)) {
        throw new GraphQLError(
          'Invalid response format: "tracks" field is not an array',
        );
      }

      const processedTracks = await Promise.all(
        data.tracks.map((track: TrackData) => this.processTrack(track)),
      );

      const tracks = processedTracks.filter(
        (track): track is MusicItemData => track !== null,
      );

      // Return complete playlist data including metadata
      return {
        playlist: {
          id: data.id,
          title: data.title || 'Unknown Playlist',
          artwork:
            data.artwork_url?.replace('-large', '-t500x500') ||
            this.FALLBACK_ARTWORK,
          artist: {
            id: data.user?.id?.toString() || '0',
            username: data.user?.username || 'Unknown Artist',
            avatarUrl: data.user?.avatar_url || '',
            verified: data.user?.verified || false,
            city: data.user?.city || '',
            countryCode: data.user?.country_code || '',
            followersCount: data.user?.followers_count || 0,
          },
          trackCount: data.track_count || 0,
          duration: data.duration ? data.duration / 1000 : 0,
          genre: data.genre || 'Unknown',
          createdAt: data.created_at,
          tracks,
        },
      };
    } catch (error) {
      throw new GraphQLError(`Failed to fetch album tracks: ${error.message}`);
    }
  }
}
