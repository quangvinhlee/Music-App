import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { InteractService } from './interact.service';
import {
  CreateRecentPlayedDto,
  CreatePlaylistDto,
  CreatePlaylistTrackDto,
} from './dto/interact.dto';
import {
  RecentPlayed,
  Playlist,
  PlaylistTrack,
} from './entities/interact.entities';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@Resolver()
export class InteractResolver {
  constructor(private readonly interactService: InteractService) {}

  @Mutation(() => RecentPlayed)
  @UseGuards(AuthGuard)
  async createRecentPlayed(
    @Args('input') createRecentPlayedDto: CreateRecentPlayedDto,
    @Context() context: any,
  ): Promise<RecentPlayed> {
    const user = context.req.user;
    if (!user) {
      throw new Error('Not authenticated');
    }
    return this.interactService.createRecentPlayed(
      createRecentPlayedDto,
      user.id,
    );
  }

  @Query(() => [RecentPlayed])
  @UseGuards(AuthGuard)
  async getRecentPlayed(@Context() context: any): Promise<RecentPlayed[]> {
    const user = context.req.user;
    if (!user) {
      throw new Error('Not authenticated');
    }
    return this.interactService.getRecentPlayed(user.id);
  }

  @Mutation(() => Playlist)
  @UseGuards(AuthGuard)
  async createPlaylist(
    @Args('input') createPlaylistDto: CreatePlaylistDto,
    @Context() context: any,
  ): Promise<Playlist> {
    const user = context.req.user;
    if (!user) {
      throw new Error('Not authenticated');
    }
    return this.interactService.createPlaylist(createPlaylistDto, user.id);
  }

  @Mutation(() => PlaylistTrack)
  @UseGuards(AuthGuard)
  async addTrackToPlaylist(
    @Args('playlistId') playlistId: string,
    @Args('input') createPlaylistTrackDto: CreatePlaylistTrackDto,
    @Context() context: any,
  ): Promise<PlaylistTrack> {
    const user = context.req.user;
    if (!user) {
      throw new Error('Not authenticated');
    }
    return this.interactService.addTrackToPlaylist(
      playlistId,
      createPlaylistTrackDto,
      user.id,
    );
  }

  @Query(() => [Playlist])
  @UseGuards(AuthGuard)
  async getPlaylists(@Context() context: any): Promise<Playlist[]> {
    const user = context.req.user;
    if (!user) {
      throw new Error('Not authenticated');
    }
    return this.interactService.getPlaylists(user.id);
  }

  @Query(() => Playlist)
  @UseGuards(AuthGuard)
  async getPlaylist(
    @Args('playlistId') playlistId: string,
    @Context() context: any,
  ): Promise<Playlist> {
    const user = context.req.user;
    if (!user) {
      throw new Error('Not authenticated');
    }
    return this.interactService.getPlaylist(playlistId, user.id);
  }
}
