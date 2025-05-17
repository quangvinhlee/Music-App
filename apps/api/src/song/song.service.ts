/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  FetchRelatedSongsDto,
  FetchTrendingPlaylistSongsDto,
  FetchTrendingSongDto,
  FetchTrendingSongPlaylistsDto,
  SearchDto,
} from './dto/soundcloud.dto';
import {
  FetchRelatedSongsResponse,
  FetchTrendingPlaylistSongsResponse,
  FetchTrendingSongPlaylistsResponse,
  FetchTrendingSongResponse,
  SearchTracksResponse,
} from './type/soundcloud.type';
import { GraphQLError } from 'graphql';

// Types for better type safety
interface CacheItem<T> {
  data: T;
  expires: number;
}

interface TranscodingInfo {
  url?: string;
  format?: {
    protocol?: string;
  };
}

interface TrackData {
  id?: string | number;
  track_id?: string | number;
  title?: string;
  media?: {
    transcodings?: TranscodingInfo[];
  };
  genre?: string;
  artwork_url?: string;
  duration?: number;
  playback_count?: number;
  user?: {
    username?: string;
    avatar_url?: string;
    id?: string | number;
  };
  publisher_metadata?: {
    artist?: string;
  };
}

interface ProcessedTrack {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  genre: string;
  artwork: string;
  duration: number;
  streamUrl: string;
  playbackCount: number;
}

@Injectable()
export class SongService {
  private readonly logger = new Logger(SongService.name);
  private readonly clientId: string;
  private readonly FALLBACK_ARTWORK = '/music-plate.jpg';
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;
  private readonly REQUEST_TIMEOUT = 10000; // 10 seconds timeout
  private readonly cache = new Map<string, CacheItem<any>>();
  private readonly CACHE_TTL = 15 * 60 * 1000; // 15 minutes cache expiry
  private readonly FAILURE_CACHE_TTL = 1 * 60 * 1000; // 1 minute for failed requests

  constructor(private readonly config: ConfigService) {
    const clientId = this.config.get<string>('SOUNDCLOUD_CLIENT_ID');
    if (!clientId) {
      throw new GraphQLError(
        'SOUNDCLOUD_CLIENT_ID is not defined in the configuration',
      );
    }
    this.clientId = clientId;
  }

  // Cache operations
  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data as T;
    }
    if (cached) this.cache.delete(key); // Clear expired cache
    return null;
  }

  private setCacheData<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + (ttl || this.CACHE_TTL),
    });
  }

  // HTTP request helpers
  private async fetchWithRetry(
    url: string,
    retries = this.MAX_RETRIES,
  ): Promise<any> {
    const cacheKey = `fetch:${url}`;
    const cached = this.getCachedData<string>(cacheKey);
    if (cached && !cached.includes('403')) return cached;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.REQUEST_TIMEOUT,
      );

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.status === 403) {
        throw new Error('URL not ready (403)');
      }

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      this.setCacheData(cacheKey, data);
      return data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new GraphQLError('Request timed out');
      }

      if (retries > 0) {
        const delay = this.RETRY_DELAY * (this.MAX_RETRIES - retries + 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.fetchWithRetry(url, retries - 1);
      }

      if (error.message && error.message.includes('403')) {
        this.setCacheData(cacheKey, '403', this.FAILURE_CACHE_TTL);
      }
      this.logger.error(`Fetch error: ${error.message || 'Unknown error'}`);
      throw new GraphQLError(
        `Failed to fetch: ${error.message || 'Unknown error'}`,
      );
    }
  }

  private async fetchSoundCloudData<T>(
    url: string,
    signal?: AbortSignal,
  ): Promise<T> {
    const cacheKey = `soundcloud:${url}`;
    const cached = this.getCachedData<T>(cacheKey);
    if (cached) return cached;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.REQUEST_TIMEOUT,
      );

      const response = await fetch(url, {
        signal: signal || controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();

      this.setCacheData<T>(cacheKey, data);
      return data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new GraphQLError('Request timed out');
      }
      this.logger.error(
        `SoundCloud API error: ${error.message || 'Unknown error'}`,
      );
      throw new GraphQLError(
        `Failed to fetch data: ${error.message || 'Unknown error'}`,
      );
    }
  }

  // Stream handling methods
  private async fetchStreamData(url: string): Promise<any> {
    if (!url) return null;

    const cacheKey = `stream:${url}`;
    const cached = this.getCachedData<string>(cacheKey);
    if (cached && !cached.includes('403')) return cached;

    try {
      const streamUrl = `${url}?client_id=${this.clientId}`;
      const data = await this.fetchWithRetry(streamUrl);
      this.setCacheData(cacheKey, data);
      return data;
    } catch (error: any) {
      if (error.message && error.message.includes('403')) {
        this.setCacheData(cacheKey, '403', this.FAILURE_CACHE_TTL);
      }
      this.logger.warn(`Stream fetch failed: ${error.message}`);
      throw new GraphQLError('Failed to fetch stream data.');
    }
  }

  private normalizeGenre(genre?: string): string {
    if (!genre) return 'unknown';
    if (genre.toLowerCase() === 'all music') return 'all-music';

    return encodeURIComponent(
      genre
        .toLowerCase()
        .replace(/ & /g, '')
        .replace(/ /g, '')
        .replace(/[^a-z0-9]/g, ''),
    );
  }

  private getBestStreamUrl(transcodings?: TranscodingInfo[]): string | null {
    if (
      !transcodings ||
      !Array.isArray(transcodings) ||
      transcodings.length === 0
    )
      return null;

    const protocolPriority: Record<string, number> = {
      progressive: 5,
      hls: 4,
      'ctr-encrypted-hls': 3,
      'cbc-encrypted-hls': 2,
      opus_0_0: 1,
    };

    return (
      transcodings.sort((a, b) => {
        const priorityA = protocolPriority[a?.format?.protocol || ''] || 0;
        const priorityB = protocolPriority[b?.format?.protocol || ''] || 0;
        return priorityB - priorityA;
      })[0]?.url || null
    );
  }

  private async resolveStreamUrl(
    url: string,
    retries = 3,
  ): Promise<string | null> {
    if (!url) return null;

    const cacheKey = `resolved:${url}`;
    const cached = this.getCachedData<string>(cacheKey);
    if (cached && !cached.includes('403')) return cached;

    try {
      // Try primary stream
      const streamData = await this.fetchStreamData(url);
      if (streamData?.url) {
        this.setCacheData(cacheKey, streamData.url);
        return streamData.url;
      }

      // Try alternative progressive stream if available
      if (url.includes('/stream/')) {
        const altUrl = url.replace('/stream/', '/stream/progressive/');
        const altStreamData = await this.fetchStreamData(altUrl);
        if (altStreamData?.url) {
          this.setCacheData(cacheKey, altStreamData.url);
          return altStreamData.url;
        }
      }

      // Retry if we still have attempts left
      if (retries > 0) {
        await this.delay(this.RETRY_DELAY * (this.MAX_RETRIES - retries + 1));
        return this.resolveStreamUrl(url, retries - 1);
      }

      this.setCacheData(cacheKey, '403', this.FAILURE_CACHE_TTL);
      return null;
    } catch (error) {
      if (retries > 0) {
        await this.delay(this.RETRY_DELAY * (this.MAX_RETRIES - retries + 1));
        return this.resolveStreamUrl(url, retries - 1);
      }
      this.setCacheData(cacheKey, '403', this.FAILURE_CACHE_TTL);
      return null;
    }
  }

  // Track processing methods
  private async fetchCompleteTrackData(
    trackId?: string | number,
  ): Promise<TrackData | null> {
    if (!trackId) return null;

    const cacheKey = `track:${trackId}`;
    const cached = this.getCachedData<TrackData>(cacheKey);
    if (cached) return cached;

    try {
      const url = `https://api-v2.soundcloud.com/tracks/${trackId}?client_id=${this.clientId}`;
      const data = await this.fetchSoundCloudData<TrackData>(url);
      this.setCacheData(cacheKey, data);
      return data;
    } catch (error) {
      this.logger.warn(`Failed to fetch complete track data for ID ${trackId}`);
      return null;
    }
  }

  private async processTrack(
    track?: TrackData,
  ): Promise<ProcessedTrack | null> {
    if (!track) return null;

    try {
      const trackId = track.id || track.track_id;
      if (!trackId) return null;

      const cacheKey = `processed:${trackId}`;
      const cached = this.getCachedData<ProcessedTrack>(cacheKey);
      if (cached) return cached;

      // Get complete track data if needed
      let fullTrackData = track;
      if (!track.title || !track.media || !track.playback_count) {
        fullTrackData = (await this.fetchCompleteTrackData(trackId)) || track;
      }

      if (!fullTrackData?.title || !fullTrackData?.media) return null;

      // Get stream URL
      const transcodings = fullTrackData.media?.transcodings;
      const streamUrl = this.getBestStreamUrl(transcodings);
      if (!streamUrl) return null;

      // Resolve the final streaming URL
      const finalStreamUrl = await this.resolveStreamUrlWithRetries(streamUrl);
      if (!finalStreamUrl) return null;

      // Ensure artistId is present
      if (!fullTrackData.user?.id) {
        this.logger.warn(`No user ID found for track ${trackId}`);
        return null;
      }

      // Create processed track object
      const processedTrack: ProcessedTrack = {
        id: String(trackId),
        title: fullTrackData.title || 'Unknown Title',
        artist:
          fullTrackData.publisher_metadata?.artist ||
          fullTrackData.user?.username ||
          'Unknown Artist',
        artistId: String(fullTrackData.user.id),
        genre: fullTrackData.genre || 'Unknown',
        artwork: this.getArtworkUrl(fullTrackData),
        duration: this.calculateDuration(fullTrackData.duration),
        streamUrl: finalStreamUrl,
        playbackCount: fullTrackData.playback_count || 0,
      };

      this.setCacheData(cacheKey, processedTrack);
      return processedTrack;
    } catch (error) {
      this.logger.warn(`Failed to process track: ${error}`);
      return null;
    }
  }

  // Helper methods
  private async resolveStreamUrlWithRetries(
    url: string,
  ): Promise<string | null> {
    let finalStreamUrl: string | null = null;
    let attempts = 0;

    while (attempts < this.MAX_RETRIES && !finalStreamUrl) {
      attempts++;
      if (attempts > 1) {
        await this.delay(this.RETRY_DELAY * attempts);
      }
      finalStreamUrl = await this.resolveStreamUrl(url);
    }

    return finalStreamUrl;
  }

  private getArtworkUrl(track: TrackData): string {
    return (
      track.artwork_url?.replace('-large', '-t500x500') ||
      track.user?.avatar_url?.replace('-large', '-t500x500') ||
      this.FALLBACK_ARTWORK
    );
  }

  private calculateDuration(durationMs?: number): number {
    return durationMs ? durationMs / 1000 : 0;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Public API methods
  async fetchTrendingSong(
    fetchTrendingSongDto: FetchTrendingSongDto,
  ): Promise<FetchTrendingSongResponse> {
    const { CountryCode } = fetchTrendingSongDto;
    const url = `https://api-v2.soundcloud.com/resolve?url=https://soundcloud.com/trending-music-${CountryCode}&client_id=${this.clientId}`;
    const data = await this.fetchSoundCloudData<any>(url);

    if (!data?.id) {
      throw new GraphQLError('Failed to fetch trending song data');
    }

    return {
      id: data.id,
      username: data.username || 'Unknown',
    };
  }

  async fetchTrendingSongPlaylists(
    fetchTrendingSongPlaylistsDto: FetchTrendingSongPlaylistsDto,
  ): Promise<FetchTrendingSongPlaylistsResponse[]> {
    const { id } = fetchTrendingSongPlaylistsDto;
    if (!id) {
      throw new GraphQLError('Missing ID parameter');
    }

    const url = `https://api-v2.soundcloud.com/users/${id}/playlists?client_id=${this.clientId}`;
    const data = await this.fetchSoundCloudData<any>(url);

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
    fetchTrendingPlaylistSongsDto: FetchTrendingPlaylistSongsDto,
  ): Promise<FetchTrendingPlaylistSongsResponse[]> {
    const { id } = fetchTrendingPlaylistSongsDto;
    if (!id) {
      throw new GraphQLError('Missing ID parameter');
    }

    const url = `https://api-v2.soundcloud.com/playlists/${id}?client_id=${this.clientId}`;
    const data = await this.fetchSoundCloudData<any>(url);

    if (!data?.tracks || !Array.isArray(data.tracks)) {
      throw new GraphQLError(
        'Invalid response format: "tracks" field missing or not an array',
      );
    }

    const processedTracks = await Promise.all(
      data.tracks.map((track: TrackData) => this.processTrack(track)),
    );

    return processedTracks.filter(
      (track): track is FetchTrendingPlaylistSongsResponse =>
        track !== null &&
        track.id !== undefined &&
        track.title !== undefined &&
        track.streamUrl !== undefined,
    );
  }

  async fetchRelatedSongs(
    fetchRelatedSongsDto: FetchRelatedSongsDto,
  ): Promise<FetchRelatedSongsResponse[]> {
    const { id } = fetchRelatedSongsDto;
    if (!id) {
      throw new GraphQLError('Missing ID parameter');
    }

    const url = `https://api-v2.soundcloud.com/tracks/${id}/related?client_id=${this.clientId}&limit=20`;
    const data = await this.fetchSoundCloudData<any>(url);

    if (!data?.collection || !Array.isArray(data.collection)) {
      throw new GraphQLError(
        'Invalid response format: "collection" field missing or not an array',
      );
    }

    const processedTracks = await Promise.all(
      data.collection.map((track: TrackData) => this.processTrack(track)),
    );

    return processedTracks.filter(
      (track): track is FetchRelatedSongsResponse => track !== null,
    );
  }

  async searchTracks(searchDto: SearchDto): Promise<SearchTracksResponse> {
    const { q } = searchDto;
    if (!q) {
      throw new GraphQLError('Missing search query');
    }
    const url = `https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(q)}&client_id=${this.clientId}`;

    const data = await this.fetchSoundCloudData<any>(url);
    if (!data?.collection || !Array.isArray(data.collection)) {
      throw new GraphQLError(
        'Invalid response format: "collection" field missing or not an array',
      );
    }

    const processedTracks = await Promise.all(
      data.collection.map((track: TrackData) => this.processTrack(track)),
    );

    const tracks = processedTracks.filter(
      (track): track is ProcessedTrack =>
        track !== null &&
        track.id !== undefined &&
        track.title !== undefined &&
        track.streamUrl !== undefined &&
        track.artistId !== undefined,
    );

    return {
      tracks,
      nextHref: data.next_href || undefined,
    };
  }
}
