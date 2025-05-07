/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  FetchRelatedSongsDto,
  FetchTrendingPlaylistSongsDto,
  FetchTrendingSongDto,
  FetchTrendingSongPlaylistsDto,
} from './dto/soundcloud.dto';
import {
  FetchRelatedSongsResponse,
  FetchTrendingPlaylistSongsResponse,
  FetchTrendingSongPlaylistsResponse,
  FetchTrendingSongResponse,
} from './type/soundcloud.type';
import { GraphQLError } from 'graphql';

@Injectable()
export class SongService {
  private readonly clientId: string;
  private readonly FALLBACK_ARTWORK = '/music-plate.jpg';
  private readonly MAX_RETRIES = 2;
  private readonly RETRY_DELAY = 500;
  private readonly REQUEST_TIMEOUT = 5000; // 5 seconds timeout
  private readonly cache = new Map<string, { data: any; expires: number }>();
  private readonly CACHE_TTL = 15 * 60 * 1000; // 15 minutes cache expiry

  constructor(private readonly config: ConfigService) {
    const clientId = this.config.get<string>('SOUNDCLOUD_CLIENT_ID');
    if (!clientId) {
      throw new GraphQLError(
        'SOUNDCLOUD_CLIENT_ID is not defined in the configuration',
      );
    }
    this.clientId = clientId;
  }

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    if (cached) this.cache.delete(key); // Clear expired cache
    return null;
  }

  private setCacheData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + this.CACHE_TTL,
    });
  }

  private async fetchWithRetry(
    url: string,
    retries = this.MAX_RETRIES,
  ): Promise<any> {
    const cacheKey = `fetch:${url}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.REQUEST_TIMEOUT,
      );

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      this.setCacheData(cacheKey, data);
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new GraphQLError('Request timed out');
      }

      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY));
        return this.fetchWithRetry(url, retries - 1);
      }
      throw new GraphQLError(`Failed to fetch: ${error.message}`);
    }
  }

  private async fetchSoundCloudData(
    url: string,
    signal?: AbortSignal,
  ): Promise<any> {
    const cacheKey = `soundcloud:${url}`;
    const cached = this.getCachedData(cacheKey);
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

      this.setCacheData(cacheKey, data);
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new GraphQLError('Request timed out');
      }
      throw new GraphQLError(`Failed to fetch data: ${error.message}`);
    }
  }

  private async fetchStreamData(url: string): Promise<any> {
    const cacheKey = `stream:${url}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const streamUrl = `${url}?client_id=${this.clientId}`;
      const data = await this.fetchWithRetry(streamUrl);
      this.setCacheData(cacheKey, data);
      return data;
    } catch (error) {
      throw new GraphQLError('Failed to fetch stream data.');
    }
  }

  private normalizeGenre(genre: string): string {
    if (genre.toLowerCase() === 'all music') return 'all-music';
    return encodeURIComponent(
      genre
        .toLowerCase()
        .replace(/ & /g, '')
        .replace(/ /g, '')
        .replace(/[^a-z0-9]/g, ''),
    );
  }

  private getBestStreamUrl(transcodings: any[]): string | null {
    if (!Array.isArray(transcodings) || transcodings.length === 0) return null;

    // Optimized protocol matching by using object lookup instead of array iteration
    const protocolPriority = {
      progressive: 5,
      hls: 4,
      'ctr-encrypted-hls': 3,
      'cbc-encrypted-hls': 2,
      opus_0_0: 1,
    };

    // Sort once and take first (best) match
    return (
      transcodings.sort((a, b) => {
        const priorityA = protocolPriority[a.format?.protocol] || 0;
        const priorityB = protocolPriority[b.format?.protocol] || 0;
        return priorityB - priorityA;
      })[0]?.url || null
    );
  }

  private async resolveStreamUrl(url: string): Promise<string | null> {
    const cacheKey = `resolved:${url}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const streamData = await this.fetchStreamData(url);
      if (streamData.url) {
        this.setCacheData(cacheKey, streamData.url);
        return streamData.url;
      }

      if (url.includes('/stream/')) {
        const altUrl = url.replace('/stream/', '/stream/progressive/');
        const altStreamData = await this.fetchStreamData(altUrl);
        if (altStreamData.url) {
          this.setCacheData(cacheKey, altStreamData.url);
          return altStreamData.url;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  private async fetchCompleteTrackData(trackId: string | number): Promise<any> {
    const cacheKey = `track:${trackId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const url = `https://api-v2.soundcloud.com/tracks/${trackId}?client_id=${this.clientId}`;
      const data = await this.fetchSoundCloudData(url);
      this.setCacheData(cacheKey, data);
      return data;
    } catch {
      return null;
    }
  }

  private async processTrack(track: any): Promise<any> {
    try {
      const trackId = track.id || track.track_id;
      if (!trackId) return null;

      // Use a cache key based on track ID to avoid redundant processing
      const cacheKey = `processed:${trackId}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      let fullTrackData = track;
      if (!track.title || !track.media) {
        fullTrackData = (await this.fetchCompleteTrackData(trackId)) || track;
      }

      if (!fullTrackData.title || !fullTrackData.media) return null;

      const transcodings = fullTrackData.media?.transcodings || [];
      const streamUrl = this.getBestStreamUrl(transcodings);
      if (!streamUrl) return null;

      const finalStreamUrl = await this.resolveStreamUrl(streamUrl);
      if (!finalStreamUrl) return null;

      const processedTrack = {
        id: String(trackId),
        title: fullTrackData.title,
        artist:
          fullTrackData.publisher_metadata?.artist ||
          fullTrackData.user?.username ||
          'Unknown Artist',
        genre: fullTrackData.genre || 'Unknown',
        artwork:
          fullTrackData.artwork_url?.replace('-large', '-t500x500') ||
          fullTrackData.user?.avatar_url?.replace('-large', '-t500x500') ||
          this.FALLBACK_ARTWORK,
        duration: fullTrackData.duration ? fullTrackData.duration / 1000 : 0,
        streamUrl: finalStreamUrl,
      };

      this.setCacheData(cacheKey, processedTrack);
      return processedTrack;
    } catch {
      return null;
    }
  }

  async fetchTrendingSong(
    fetchTrendingSongDto: FetchTrendingSongDto,
  ): Promise<FetchTrendingSongResponse> {
    const { CountryCode } = fetchTrendingSongDto;
    const url = `https://api-v2.soundcloud.com/resolve?url=https://soundcloud.com/trending-music-${CountryCode}&client_id=${this.clientId}`;
    const data = await this.fetchSoundCloudData(url);
    return {
      id: data.id,
      username: data.username,
    };
  }

  async fetchTrendingSongPlaylists(
    fetchTrendingSongPlaylistsDto: FetchTrendingSongPlaylistsDto,
  ): Promise<FetchTrendingSongPlaylistsResponse[]> {
    const { id } = fetchTrendingSongPlaylistsDto;
    const url = `https://api-v2.soundcloud.com/users/${id}/playlists?client_id=${this.clientId}&limit=20&offset=0`;
    const data = await this.fetchSoundCloudData(url);
    return data.collection.map((playlist: any) => ({
      id: playlist.id,
      title: playlist.title,
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
    const url = `https://api-v2.soundcloud.com/playlists/${id}?client_id=${this.clientId}&limit=20`;
    const data = await this.fetchSoundCloudData(url);

    if (!data.tracks || !Array.isArray(data.tracks)) {
      throw new GraphQLError(
        'Invalid response format: "tracks" field missing or not an array',
      );
    }

    // Use Promise.allSettled instead of Promise.all for more resilience
    const trackResults = await Promise.allSettled(
      data.tracks.map(async (track) => this.processTrack(track)),
    );

    const tracks = trackResults
      .filter(
        (result) => result.status === 'fulfilled' && result.value !== null,
      )
      .map((result) => (result as PromiseFulfilledResult<any>).value);

    return tracks.filter(
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
    const url = `https://api-v2.soundcloud.com/tracks/${id}/related?client_id=${this.clientId}&limit=20`;
    const data = await this.fetchSoundCloudData(url);

    if (!data.collection || !Array.isArray(data.collection)) {
      throw new GraphQLError(
        'Invalid response format: "collection" field missing or not an array',
      );
    }

    // Use Promise.allSettled for more resilient processing
    const trackResults = await Promise.allSettled(
      data.collection.map((track) => this.processTrack(track)),
    );

    const tracks = trackResults
      .filter(
        (result) => result.status === 'fulfilled' && result.value !== null,
      )
      .map((result) => (result as PromiseFulfilledResult<any>).value);

    return tracks.filter(
      (track): track is FetchRelatedSongsResponse => track !== null,
    );
  }

  //   async fetchHotSoundCloudTracks(
  //     fetchSongDto: FetchSongDto,
  //   ): Promise<FetchSoundCloudTracksResponse[]> {
  //     // Not shown in provided code; implement if needed.
  //     throw new GraphQLError('Method not implemented.');
  //   }

  //   async fetchAlbumTracks(
  //     dto: FetchAlbumTracksDto,
  //   ): Promise<FetchSoundCloudAlbumTracksResponse[]> {
  //     // Not shown in provided code; implement if needed.
  //     throw new GraphQLError('Method not implemented.');
  //   }
}
