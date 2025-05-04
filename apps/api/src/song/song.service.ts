/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  FetchAlbumTracksDto,
  FetchRelatedSongsDto,
  FetchSongDto,
  FetchTrendingPlaylistSongsDto,
  FetchTrendingSongDto,
  FetchTrendingSongPlaylistsDto,
} from './dto/soundcloud.dto';
import {
  FetchRelatedSongsResponse,
  FetchSoundCloudAlbumsResponse,
  FetchSoundCloudAlbumTracksResponse,
  FetchSoundCloudTracksResponse,
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

  constructor(private readonly config: ConfigService) {
    const clientId = this.config.get<string>('SOUNDCLOUD_CLIENT_ID');
    if (!clientId) {
      throw new GraphQLError(
        'SOUNDCLOUD_CLIENT_ID is not defined in the configuration',
      );
    }
    this.clientId = clientId;
  }

  private async fetchWithRetry(
    url: string,
    retries = this.MAX_RETRIES,
  ): Promise<any> {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
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
    try {
      const response = await fetch(url, { signal });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw new GraphQLError(`Failed to fetch data: ${error.message}`);
    }
  }

  private async fetchStreamData(url: string): Promise<any> {
    try {
      const streamUrl = `${url}?client_id=${this.clientId}`;
      return await this.fetchWithRetry(streamUrl);
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
    if (!Array.isArray(transcodings)) return null;
    const protocolPriority = [
      'progressive',
      'hls',
      'ctr-encrypted-hls',
      'cbc-encrypted-hls',
      'opus_0_0',
    ];
    for (const protocol of protocolPriority) {
      const found = transcodings.find((t) => t.format?.protocol === protocol);
      if (found) return found.url;
    }
    return transcodings[0]?.url || null;
  }

  private async resolveStreamUrl(url: string): Promise<string | null> {
    try {
      const streamData = await this.fetchStreamData(url);
      if (streamData.url) return streamData.url;
      if (url.includes('/stream/')) {
        const altUrl = url.replace('/stream/', '/stream/progressive/');
        const altStreamData = await this.fetchStreamData(altUrl);
        return altStreamData.url || null;
      }
      return null;
    } catch {
      return null;
    }
  }

  private async fetchCompleteTrackData(trackId: string | number): Promise<any> {
    try {
      const url = `https://api-v2.soundcloud.com/tracks/${trackId}?client_id=${this.clientId}`;
      return await this.fetchSoundCloudData(url);
    } catch {
      return null;
    }
  }

  private async processTrack(track: any): Promise<any> {
    try {
      const trackId = track.id || track.track_id;
      if (!trackId) return null;

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

      return {
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

    const tracks = await Promise.all(
      data.tracks.map(async (track) => this.processTrack(track)),
    );

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

    const tracks = await Promise.all(
      data.collection.map((track) => this.processTrack(track)),
    );

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
