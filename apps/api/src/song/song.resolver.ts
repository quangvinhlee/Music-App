// src/song/song.resolver.ts
import { Resolver, Query, Args } from '@nestjs/graphql';
import { SongService } from './song.service';
import {
  FetchRelatedSongsResponse,
  FetchSoundCloudAlbumsResponse,
  FetchSoundCloudAlbumTracksResponse,
  FetchSoundCloudTracksResponse,
  FetchTrendingPlaylistSongsResponse,
  FetchTrendingSongPlaylistsResponse,
  FetchTrendingSongResponse,
} from './type/soundcloud.type';
import {
  FetchAlbumTracksDto,
  FetchRelatedSongsDto,
  FetchSongDto,
  FetchTrendingPlaylistSongsDto,
  FetchTrendingSongDto,
  FetchTrendingSongPlaylistsDto,
} from './dto/soundcloud.dto';

@Resolver()
export class SongResolver {
  constructor(private readonly songService: SongService) {}

  @Query(() => FetchTrendingSongResponse)
  async fetchTrendingSong(
    @Args('fetchTrendingSongInput')
    fetchTrendingSongDto: FetchTrendingSongDto,
  ): Promise<FetchTrendingSongResponse> {
    return this.songService.fetchTrendingSong(fetchTrendingSongDto);
  }

  @Query(() => [FetchTrendingSongPlaylistsResponse])
  async fetchTrendingSongPlaylists(
    @Args('fetchTrendingSongPlaylistsInput')
    fetchTrendingSongPlaylistsDto: FetchTrendingSongPlaylistsDto,
  ): Promise<FetchTrendingSongPlaylistsResponse[]> {
    return this.songService.fetchTrendingSongPlaylists(
      fetchTrendingSongPlaylistsDto,
    );
  }

  @Query(() => [FetchTrendingPlaylistSongsResponse])
  async fetchTrendingPlaylistSongs(
    @Args('fetchTrendingPlaylistSongsInput')
    fetchTrendingPlaylistSongsDto: FetchTrendingPlaylistSongsDto,
  ): Promise<FetchTrendingPlaylistSongsResponse[]> {
    return this.songService.fetchTrendingPlaylistSongs(
      fetchTrendingPlaylistSongsDto,
    );
  }

  @Query(() => [FetchRelatedSongsResponse])
  async fetchRelatedSongs(
    @Args('fetchRelatedSongsInput')
    fetchRelatedSongsDto: FetchRelatedSongsDto,
  ): Promise<FetchRelatedSongsResponse[]> {
    return this.songService.fetchRelatedSongs(fetchRelatedSongsDto);
  }

  @Query(() => [FetchSoundCloudTracksResponse])
  async fetchHotSoundCloudTracks(
    @Args('fetchHotSongInput') fetchSongDto: FetchSongDto,
  ): Promise<FetchSoundCloudTracksResponse[]> {
    return this.songService.fetchHotSoundCloudTracks(fetchSongDto);
  }

  @Query(() => [FetchSoundCloudAlbumsResponse])
  async fetchHotSoundCloudAlbums(): Promise<FetchSoundCloudAlbumsResponse[]> {
    return this.songService.fetchHotSoundCloudAlbums();
  }

  @Query(() => [FetchSoundCloudAlbumTracksResponse])
  async fetchSoundCloudAlbumTracks(
    @Args('fetchAlbumTracksInput') fetchAlbumTracksDto: FetchAlbumTracksDto,
  ): Promise<FetchSoundCloudAlbumTracksResponse[]> {
    return this.songService.fetchSoundCloudAlbumTracks(fetchAlbumTracksDto);
  }
}
