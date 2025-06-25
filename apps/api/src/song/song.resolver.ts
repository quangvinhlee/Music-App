/* eslint-disable @typescript-eslint/no-unsafe-return */
// src/song/song.resolver.ts
import { Resolver, Query, Args, Mutation, Context } from '@nestjs/graphql';
import { SongService } from './song.service';
import {
  FetchRelatedSongsResponse,
  FetchTrendingPlaylistSongsResponse,
  FetchTrendingSongPlaylistsResponse,
  FetchTrendingSongResponse,
  SearchTracksResponse,
  SearchUsersResponse,
  SearchAlbumsResponse,
} from './entities/soundcloud.entities';
import {
  FetchRelatedSongsDto,
  FetchTrendingPlaylistSongsDto,
  FetchTrendingSongDto,
  FetchTrendingSongPlaylistsDto,
  SearchDto,
  FetchStreamUrlDto,
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

  @Query(() => FetchRelatedSongsResponse)
  async fetchRelatedSongs(
    @Args('fetchRelatedSongsInput')
    fetchRelatedSongsDto: FetchRelatedSongsDto,
  ): Promise<FetchRelatedSongsResponse> {
    return this.songService.fetchRelatedSongs(fetchRelatedSongsDto);
  }

  @Query(() => SearchTracksResponse)
  async searchTracks(
    @Args('searchTracksInput') searchDto: SearchDto,
  ): Promise<SearchTracksResponse> {
    return this.songService.searchTracks(searchDto);
  }

  @Query(() => SearchUsersResponse)
  async searchUsers(
    @Args('searchUsersInput') searchDto: SearchDto,
  ): Promise<SearchUsersResponse> {
    return this.songService.searchUsers(searchDto);
  }

  @Query(() => SearchAlbumsResponse)
  async searchAlbums(
    @Args('searchAlbumsInput') searchDto: SearchDto,
  ): Promise<SearchAlbumsResponse> {
    return this.songService.searchAlbums(searchDto);
  }

  @Query(() => String, { nullable: true })
  async fetchStreamUrl(
    @Args('fetchStreamUrlInput') fetchStreamUrlDto: FetchStreamUrlDto,
  ): Promise<string | null> {
    return this.songService.fetchStreamUrl(fetchStreamUrlDto.trackId);
  }

  // @Query(() => [FetchSoundCloudTracksResponse])
  // async fetchHotSoundCloudTracks(
  //   @Args('fetchHotSongInput') fetchSongDto: FetchSongDto,
  // ): Promise<FetchSoundCloudTracksResponse[]> {
  //   return this.songService.fetchHotSoundCloudTracks(fetchSongDto);
  // }

  // @Query(() => [FetchSoundCloudAlbumsResponse])
  // async fetchHotSoundCloudAlbums(): Promise<FetchSoundCloudAlbumsResponse[]> {
  //   return this.songService.fetchHotSoundCloudAlbums();
  // }

  // @Query(() => [FetchSoundCloudAlbumTracksResponse])
  // async fetchSoundCloudAlbumTracks(
  //   @Args('fetchAlbumTracksInput') fetchAlbumTracksDto: FetchAlbumTracksDto,
  // ): Promise<FetchSoundCloudAlbumTracksResponse[]> {
  //   return this.songService.fetchSoundCloudAlbumTracks(fetchAlbumTracksDto);
  // }
}
