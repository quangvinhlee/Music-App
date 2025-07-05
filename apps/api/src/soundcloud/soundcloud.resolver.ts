/* eslint-disable @typescript-eslint/no-unsafe-return */
// src/song/song.resolver.ts
import { Resolver, Query, Args, Context } from '@nestjs/graphql';
import { SoundcloudService } from './soundcloud.service';
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
  FetchRelatedSongsDto,
  FetchTrendingPlaylistSongsDto,
  FetchTrendingSongDto,
  FetchTrendingSongPlaylistsDto,
  SearchDto,
  FetchStreamUrlDto,
  FetchGlobalTrendingSongsDto,
  FetchRecommendedArtistsDto,
  FetchArtistDataDto,
  FetchArtistInfoDto,
} from './dto/soundcloud.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@Resolver()
export class SoundcloudResolver {
  constructor(private readonly soundcloudService: SoundcloudService) {}

  @Query(() => FetchTrendingSongResponse)
  async fetchTrendingSong(
    @Args('fetchTrendingSongInput')
    fetchTrendingSongDto: FetchTrendingSongDto,
  ): Promise<FetchTrendingSongResponse> {
    return this.soundcloudService.fetchTrendingSong(fetchTrendingSongDto);
  }

  @Query(() => [FetchTrendingSongPlaylistsResponse])
  async fetchTrendingSongPlaylists(
    @Args('fetchTrendingSongPlaylistsInput')
    fetchTrendingSongPlaylistsDto: FetchTrendingSongPlaylistsDto,
  ): Promise<FetchTrendingSongPlaylistsResponse[]> {
    return this.soundcloudService.fetchTrendingSongPlaylists(
      fetchTrendingSongPlaylistsDto,
    );
  }

  @Query(() => FetchTrendingPlaylistSongsResponse)
  async fetchTrendingPlaylistSongs(
    @Args('fetchTrendingPlaylistSongsInput')
    fetchTrendingPlaylistSongsDto: FetchTrendingPlaylistSongsDto,
  ): Promise<FetchTrendingPlaylistSongsResponse> {
    return this.soundcloudService.fetchTrendingPlaylistSongs(
      fetchTrendingPlaylistSongsDto,
    );
  }

  @Query(() => FetchGlobalTrendingSongsResponse)
  async fetchGlobalTrendingSongs(
    @Args('fetchGlobalTrendingSongsInput')
    fetchGlobalTrendingSongsDto: FetchGlobalTrendingSongsDto,
  ): Promise<FetchGlobalTrendingSongsResponse> {
    return this.soundcloudService.fetchGlobalTrendingSongs(
      fetchGlobalTrendingSongsDto,
    );
  }

  @Query(() => FetchRelatedSongsResponse)
  async fetchRelatedSongs(
    @Args('fetchRelatedSongsInput')
    fetchRelatedSongsDto: FetchRelatedSongsDto,
  ): Promise<FetchRelatedSongsResponse> {
    return this.soundcloudService.fetchRelatedSongs(fetchRelatedSongsDto);
  }

  @Query(() => SearchTracksResponse)
  async searchTracks(
    @Args('searchTracksInput') searchDto: SearchDto,
  ): Promise<SearchTracksResponse> {
    return this.soundcloudService.searchTracks(searchDto);
  }

  @Query(() => SearchUsersResponse)
  async searchUsers(
    @Args('searchUsersInput') searchDto: SearchDto,
  ): Promise<SearchUsersResponse> {
    return this.soundcloudService.searchUsers(searchDto);
  }

  @Query(() => SearchAlbumsResponse)
  async searchAlbums(
    @Args('searchAlbumsInput') searchDto: SearchDto,
  ): Promise<SearchAlbumsResponse> {
    return this.soundcloudService.searchAlbums(searchDto);
  }

  @Query(() => String, { nullable: true })
  async fetchStreamUrl(
    @Args('fetchStreamUrlInput') fetchStreamUrlDto: FetchStreamUrlDto,
  ): Promise<string | null> {
    return this.soundcloudService.fetchStreamUrl(fetchStreamUrlDto.trackId);
  }

  @Query(() => FetchArtistDataResponse, {
    description:
      'Fetch artist data from SoundCloud (tracks, playlists, likes, reposts)',
  })
  async fetchArtistData(
    @Args('fetchArtistDataInput') fetchArtistDataDto: FetchArtistDataDto,
  ): Promise<FetchArtistDataResponse> {
    return this.soundcloudService.fetchArtistData(fetchArtistDataDto);
  }

  @UseGuards(AuthGuard)
  @Query(() => FetchRelatedSongsResponse)
  async recommendSongs(
    @Context() context: any,
  ): Promise<FetchRelatedSongsResponse> {
    return this.soundcloudService.recommendSongsForUser(context.req.user.id);
  }

  @Query(() => FetchArtistsResponse)
  async fetchRecommendedArtists(
    @Args('fetchRecommendedArtistsInput')
    fetchRecommendedArtistsDto: FetchRecommendedArtistsDto,
  ): Promise<FetchArtistsResponse> {
    return this.soundcloudService.fetchRecommendedArtists(
      fetchRecommendedArtistsDto,
    );
  }

  @Query(() => FetchArtistResponse, {
    description: 'Fetch detailed artist information from SoundCloud',
  })
  async fetchArtistInfo(
    @Args('fetchArtistInfoInput') fetchArtistInfoDto: FetchArtistInfoDto,
  ): Promise<FetchArtistResponse> {
    const artist =
      await this.soundcloudService.fetchArtistInfo(fetchArtistInfoDto);
    return { artist };
  }
}
