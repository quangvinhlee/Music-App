/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
  GlobalTrendingTrack,
} from './entities/soundcloud.entities';
import {
  CacheItem,
  TrackData,
  ProcessedTrack,
  ProcessedUser,
  ProcessedAlbum,
  TranscodingInfo,
  SoundCloudApiResponse,
} from './types/interfaces';

@Injectable()
export class SongService {
  private readonly logger = new Logger(SongService.name);
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

  constructor(private readonly config: ConfigService) {
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

    try {
      const streamUrl = `${url}?client_id=${this.clientId}`;
      const data = await this.fetchWithRetry<any>(
        streamUrl,
        'Stream URL resolution',
      );

      if (data?.url) {
        this.setCacheData(cacheKey, data.url);
        return data.url;
      }

      // Try alternative progressive stream
      if (url.includes('/stream/')) {
        const altUrl = url.replace('/stream/', '/stream/progressive/');
        const altData = await this.fetchWithRetry<any>(
          `${altUrl}?client_id=${this.clientId}`,
          'Alternative stream',
        );
        if (altData?.url) {
          this.setCacheData(cacheKey, altData.url);
          return altData.url;
        }
      }

      this.setCacheData(cacheKey, '403', this.FAILURE_CACHE_TTL);
      return null;
    } catch (error) {
      this.setCacheData(cacheKey, '403', this.FAILURE_CACHE_TTL);
      return null;
    }
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
  private async processTrack(
    track?: TrackData,
  ): Promise<ProcessedTrack | null> {
    if (!track) return null;

    const trackId = track.id || track.track_id;
    if (!trackId) return null;

    const cacheKey = `processed:${trackId}`;
    const cached = this.getCachedData<ProcessedTrack>(cacheKey);
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

      const processedTrack: ProcessedTrack = {
        id: String(trackId),
        title: fullTrackData.title,
        artist:
          fullTrackData.publisher_metadata?.artist ||
          fullTrackData.user?.username ||
          'Unknown Artist',
        artistId: String(fullTrackData.user?.id || '0'),
        genre: fullTrackData.genre || 'Unknown',
        artwork:
          fullTrackData.artwork_url?.replace('-large', '-t500x500') ||
          fullTrackData.user?.avatar_url?.replace('-large', '-t500x500') ||
          this.FALLBACK_ARTWORK,
        duration: fullTrackData.duration ? fullTrackData.duration / 1000 : 0,
        playbackCount: fullTrackData.playback_count || 0,
      };

      this.setCacheData(cacheKey, processedTrack);
      return processedTrack;
    } catch (error) {
      this.logger.warn(`Failed to process track ${trackId}: ${error}`);
      return null;
    }
  }

  private async processUser(
    user: TrackData['user'],
  ): Promise<ProcessedUser | null> {
    if (!user?.id) return null;

    const cacheKey = `processed-user:${user.id}`;
    const cached = this.getCachedData<ProcessedUser>(cacheKey);
    if (cached) return cached;

    const processedUser: ProcessedUser = {
      id: String(user.id),
      username: user.username || 'Unknown User',
      avatarUrl:
        user.avatar_url?.replace('-large', '-t500x500') ||
        this.FALLBACK_ARTWORK,
      followersCount: user.followers_count || 0,
    };

    this.setCacheData(cacheKey, processedUser);
    return processedUser;
  }

  private async processAlbum(album: TrackData): Promise<ProcessedAlbum | null> {
    if (!album?.id) return null;

    const cacheKey = `processed-album:${album.id}`;
    const cached = this.getCachedData<ProcessedAlbum>(cacheKey);
    if (cached) return cached;

    const processedAlbum: ProcessedAlbum = {
      id: String(album.id),
      title: album.title || 'Unknown Album',
      artist: album.user?.username || 'Unknown Artist',
      artistId: String(album.user?.id || ''),
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

    const url = `https://api-v2.soundcloud.com/users/${dto.id}/playlists?client_id=${this.clientId}`;
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
  ): Promise<FetchTrendingPlaylistSongsResponse[]> {
    if (!dto.id) throw new GraphQLError('Missing ID parameter');

    const url = `https://api-v2.soundcloud.com/playlists/${dto.id}?client_id=${this.clientId}`;
    const data = await this.fetchWithRetry<any>(
      url,
      'Trending playlist songs fetch',
    );

    if (!data?.tracks || !Array.isArray(data.tracks)) {
      throw new GraphQLError(
        'Invalid response format: "tracks" field missing or not an array',
      );
    }

    const processedTracks = await Promise.all(
      data.tracks.map((track: TrackData) => this.processTrack(track)),
    );

    return processedTracks.filter(
      (track): track is ProcessedTrack => track !== null,
    ) as FetchTrendingPlaylistSongsResponse[];
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
      (track): track is ProcessedTrack => track !== null,
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
      (track): track is ProcessedTrack => track !== null,
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
      data.collection.map((user: any) => this.processUser(user)),
    );

    const users = processedUsers.filter(
      (user): user is ProcessedUser => user !== null,
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
      (album): album is ProcessedAlbum => album !== null,
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
      (track): track is ProcessedTrack => track !== null,
    );

    return {
      tracks,
      nextHref: data.next_href || undefined,
    };
  }
}
