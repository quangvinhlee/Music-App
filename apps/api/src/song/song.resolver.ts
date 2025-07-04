/* eslint-disable @typescript-eslint/no-unsafe-return */
// src/song/song.resolver.ts
import { Resolver, Query, Args, Context } from '@nestjs/graphql';
import { SongService } from './song.service';
import {
  FetchRelatedSongsResponse,
  FetchTrendingPlaylistSongsResponse,
  FetchTrendingSongPlaylistsResponse,
  FetchTrendingSongResponse,
  SearchTracksResponse,
  SearchUsersResponse,
  SearchAlbumsResponse,
  FetchGlobalTrendingSongsResponse,
  FetchRecommendedArtistsResponse,
  FetchArtistDataResponse,
} from './entities/soundcloud.entities';
import {
  FetchRelatedSongsDto,
  FetchTrendingPlaylistSongsDto,
  FetchTrendingSongDto,
  FetchTrendingSongPlaylistsDto,
  SearchDto,
  FetchStreamUrlDto,
  FetchGlobalTrendingSongsDto,
  FetchRecommendedArtistsDto,
  FetchArtistDataDto,
} from './dto/soundcloud.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guard/auth.guard';

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

  @Query(() => FetchTrendingPlaylistSongsResponse)
  async fetchTrendingPlaylistSongs(
    @Args('fetchTrendingPlaylistSongsInput')
    fetchTrendingPlaylistSongsDto: FetchTrendingPlaylistSongsDto,
  ): Promise<FetchTrendingPlaylistSongsResponse> {
    return this.songService.fetchTrendingPlaylistSongs(
      fetchTrendingPlaylistSongsDto,
    );
  }

  @Query(() => FetchGlobalTrendingSongsResponse)
  async fetchGlobalTrendingSongs(
    @Args('fetchGlobalTrendingSongsInput')
    fetchGlobalTrendingSongsDto: FetchGlobalTrendingSongsDto,
  ): Promise<FetchGlobalTrendingSongsResponse> {
    return this.songService.fetchGlobalTrendingSongs(
      fetchGlobalTrendingSongsDto,
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

  @Query(() => FetchArtistDataResponse, {
    description:
      'Fetch artist data from SoundCloud (tracks, playlists, likes, reposts)',
  })
  async fetchArtistData(
    @Args('fetchArtistDataInput') fetchArtistDataDto: FetchArtistDataDto,
  ): Promise<FetchArtistDataResponse> {
    return this.songService.fetchArtistData(fetchArtistDataDto);
  }

  @UseGuards(AuthGuard)
  @Query(() => FetchRelatedSongsResponse)
  async recommendSongs(
    @Context() context: any,
  ): Promise<FetchRelatedSongsResponse> {
    return this.songService.recommendSongsForUser(context.req.user.id);
  }

  @Query(() => FetchRecommendedArtistsResponse)
  async fetchRecommendedArtists(
    @Args('fetchRecommendedArtistsInput')
    fetchRecommendedArtistsDto: FetchRecommendedArtistsDto,
  ): Promise<FetchRecommendedArtistsResponse> {
    return this.songService.fetchRecommendedArtists(fetchRecommendedArtistsDto);
  }
}
