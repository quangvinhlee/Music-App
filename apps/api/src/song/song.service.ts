/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  FetchAlbumTracksDto,
  FetchSongDto,
  FetchTrendingPlaylistSongsDto,
  FetchTrendingSongDto,
  FetchTrendingSongPlaylistsDto,
} from './dto/soundcloud.dto';
import {
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
  private readonly FALLBACK_ARTWORK = '/default-album-art.jpg';

  constructor(private readonly config: ConfigService) {
    const clientId = this.config.get<string>('SOUNDCLOUD_CLIENT_ID');
    if (!clientId) {
      throw new GraphQLError(
        'SOUNDCLOUD_CLIENT_ID is not defined in the configuration',
      );
    }
    this.clientId = clientId;
  }

  private async fetchSoundCloudData(
    url: string,
    signal?: AbortSignal,
  ): Promise<any> {
    const response = await fetch(url, { signal }); // Pass signal to fetch
    if (!response.ok) {
      console.error('Error fetching SoundCloud data:', response.statusText);
      throw new GraphQLError(`Failed to fetch data: ${response.statusText}`);
    }
    return await response.json();
  }

  private async fetchStreamData(url: string): Promise<any> {
    const response = await fetch(`${url}?client_id=${this.clientId}`);
    if (!response.ok) {
      console.error('Failed to fetch stream data:', response.statusText);
      throw new GraphQLError('Failed to fetch stream data.');
    }
    return await response.json();
  }

  private normalizeGenre(genre: string): string {
    if (genre.toLowerCase() === 'all music') {
      return 'all-music'; // Special case for "all music"
    }
    return encodeURIComponent(
      genre
        .toLowerCase()
        .replace(/ & /g, '') // Remove " & "
        .replace(/ /g, '') // Remove spaces
        .replace(/[^a-z0-9]/g, ''), // Remove special characters
    );
  }

  private getHlsStreamUrlFromTranscodings(track: any): string | null {
    const transcodings = track?.media?.transcodings;
    if (Array.isArray(transcodings)) {
      // Look for HLS transcoding only
      const hlsTranscoding = transcodings.find(
        (t: any) => t.format.protocol === 'hls',
      );
      return hlsTranscoding?.url || null;
    }
    return null;
  }

  // Function to fetch HLS stream data
  private async getHlsStreamData(url: string): Promise<any> {
    const streamData = await this.fetchStreamData(url);
    return streamData.url || 'stream_url_not_available';
  }

  //fetching trending song id
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
    const url = `https://api-v2.soundcloud.com/users/${id}/playlists?client_id=${this.clientId}&limit=20&offset=0
`;

    try {
      const data = await this.fetchSoundCloudData(url);

      return data.collection.map((playlist: any) => ({
        id: playlist.id,
        title: playlist.title,
        genre: playlist.genre || 'Unknown',
        artwork:
          playlist.artwork_url?.replace('-large', '-t500x500') ||
          this.FALLBACK_ARTWORK,
      }));
    } catch (error) {
      console.error('Error fetching SoundCloud tracks by playlist:', error);
      throw new GraphQLError(
        'Unable to fetch SoundCloud tracks at this time. Please try again later.',
      );
    }
  }

  async fetchTrendingPlaylistSongs(
    fetchTrendingPlaylistSongsDto: FetchTrendingPlaylistSongsDto,
  ): Promise<FetchTrendingPlaylistSongsResponse[]> {
    const { id } = fetchTrendingPlaylistSongsDto;
    const url = `https://api-v2.soundcloud.com/playlists/${id}?client_id=${this.clientId}&limit=50`;

    try {
      const data = await this.fetchSoundCloudData(url);
      console.log('data:', data);

      if (!data.tracks || !Array.isArray(data.tracks)) {
        throw new GraphQLError(
          'Invalid response format: "tracks" field missing or not an array',
        );
      }

      const tracks = await Promise.all(
        data.tracks.map(async (track: any) => {
          try {
            const hlsStreamUrl = this.getHlsStreamUrlFromTranscodings(track);
            if (!hlsStreamUrl) {
              console.warn(`No HLS stream URL for track ${track.title}`);
              return null;
            }

            const streamUrl = await this.getHlsStreamData(hlsStreamUrl);

            return {
              id: track.id,
              title: track.title,
              artist: track.user?.username || 'Unknown',
              genre: track.genre || 'Unknown',
              artwork:
                track.artwork_url?.replace('-large', '-t500x500') ||
                this.FALLBACK_ARTWORK,
              duration: track.duration / 1000,
              streamUrl: streamUrl,
            };
          } catch (innerError) {
            console.error(
              `Error processing track "${track.title}" (ID: ${track.id}):`,
              innerError.message,
            );
            return null;
          }
        }),
      );

      return tracks.filter(
        (track): track is FetchTrendingPlaylistSongsResponse => track !== null,
      );
    } catch (error) {
      console.error('Error fetching SoundCloud tracks by playlist:', error);
      throw new GraphQLError(
        'Unable to fetch SoundCloud tracks at this time. Please try again later.',
      );
    }
  }

  async fetchHotSoundCloudTracks(
    fetchSongDto: FetchSongDto,
  ): Promise<FetchSoundCloudTracksResponse[]> {
    const { kind, genre, limit = 50 } = fetchSongDto;
    if (!kind || !genre) {
      throw new GraphQLError(
        'Kind and Genre are required but were not provided.',
      );
    }

    console.log('Kind:', kind);
    console.log('Genre:', genre);

    const normalizedGenre = this.normalizeGenre(genre);
    const url = `https://api-v2.soundcloud.com/charts?kind=${kind}&genre=soundcloud:genres:${normalizedGenre}&client_id=${this.clientId}&limit=${limit}`;

    console.log('URL:', url);
    try {
      const data = await this.fetchSoundCloudData(url);

      if (!data.collection) {
        throw new GraphQLError(
          'Invalid response format: "collection" field missing',
        );
      }

      const tracks = await Promise.all(
        data.collection.map(async (item: any) => {
          const track = item.track;
          const hlsStreamUrl = this.getHlsStreamUrlFromTranscodings(track);

          if (!hlsStreamUrl) return null;

          const streamUrl = await this.getHlsStreamData(hlsStreamUrl);
          return {
            id: track.id,
            title: track.title,
            artist: track.user?.username || 'Unknown',
            genre: track.genre || 'Unknown',
            artwork:
              track.artwork_url?.replace('-large', '-t500x500') ||
              this.FALLBACK_ARTWORK,
            duration: track.duration / 1000,
            streamUrl: streamUrl,
          };
        }),
      );

      return tracks.filter(
        (track): track is FetchSoundCloudTracksResponse => track !== null,
      );
    } catch (error) {
      console.error('Error fetching SoundCloud tracks:', error.message);
      throw new GraphQLError(
        'Unable to fetch SoundCloud tracks at this time. Please try again later.',
      );
    }
  }

  async fetchHotSoundCloudAlbums(): Promise<FetchSoundCloudAlbumsResponse[]> {
    const url = `https://api-v2.soundcloud.com/search/albums?q=&filter=popular&client_id=${this.clientId}&limit=10`;

    try {
      const data = await this.fetchSoundCloudData(url);

      if (!data.collection) {
        throw new GraphQLError(
          'Invalid response format: "collection" field missing',
        );
      }

      return data.collection
        .filter((item: any) => item.is_album)
        .map((album: any) => ({
          id: album.id,
          title: album.title,
          artist: album.user?.username || 'Unknown',
          artistId: album.user?.id || 'Unknown',
          genre: album.genre || 'Unknown',
          artwork:
            album.artwork_url?.replace('-large', '-t500x500') ||
            this.FALLBACK_ARTWORK,
          duration: album.duration / 1000,
        }));
    } catch (error) {
      console.error('Error fetching SoundCloud albums:', error.message);
      throw new GraphQLError(
        'Unable to fetch SoundCloud albums at this time. Please try again later.',
      );
    }
  }

  async fetchSoundCloudAlbumTracks(
    fetchAlbumTracksdto: FetchAlbumTracksDto,
  ): Promise<FetchSoundCloudAlbumTracksResponse[]> {
    const { id } = fetchAlbumTracksdto;
    const url = `https://api-v2.soundcloud.com/playlists/${id}?client_id=${this.clientId}`;

    try {
      const data = await this.fetchSoundCloudData(url);

      return data.tracks.map((track: any) => {
        const streamUrl =
          this.getHlsStreamUrlFromTranscodings(track) ||
          'stream_url_not_available';
        return {
          id: track.id || 'Unknown',
          title: track.title || 'Unknown',
          artist: track.user?.username || 'Unknown',
          avartar_url: track.user?.avatar_url || this.FALLBACK_ARTWORK,
          artistid: track.user?.id || 'Unknown',
          genre: track.genre || 'Unknown',
          artwork:
            track.artwork_url?.replace('-large', '-t500x500') ||
            this.FALLBACK_ARTWORK,
          duration: (track.duration ?? 0) / 1000,
          streamUrl: streamUrl,
        };
      });
    } catch (error) {
      console.error('Error fetching SoundCloud tracks by album:', error);
      throw new GraphQLError(
        'Unable to fetch SoundCloud tracks at this time. Please try again later.',
      );
    }
  }
}
