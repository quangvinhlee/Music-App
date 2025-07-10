import { Resolver, Mutation, Args, Context, Query } from '@nestjs/graphql';
import { PlaylistService } from './playlist.service';
import { DeletePlaylistResponse, Playlist } from './entities/playlist.entity';
import {
  CreatePlaylistInput,
  AddTrackToPlaylistInput,
  UpdatePlaylistInput,
} from './dto/playlist.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guard/auth.guard';

@Resolver(() => Playlist)
export class PlaylistResolver {
  constructor(private readonly playlistService: PlaylistService) {}

  @Mutation(() => Playlist)
  @UseGuards(AuthGuard)
  async createPlaylist(
    @Args('input') input: CreatePlaylistInput,
    @Context() context,
  ): Promise<Playlist> {
    const userId = context.req.user.id || context.req.user.sub;
    return this.playlistService.createPlaylist({
      ...(input as any),
      userId,
    } as CreatePlaylistInput & { userId: string });
  }

  @Mutation(() => Playlist)
  @UseGuards(AuthGuard)
  async addTrackToPlaylist(
    @Args('input') input: AddTrackToPlaylistInput,
  ): Promise<Playlist> {
    return this.playlistService.addTrackToPlaylist(input);
  }

  @Query(() => [Playlist])
  @UseGuards(AuthGuard)
  async getMyPlaylists(@Context() context): Promise<Playlist[]> {
    const userId = context.req.user.id || context.req.user.sub;
    return this.playlistService.getPlaylistsByUser(userId);
  }

  @Query(() => Playlist, { nullable: true })
  @UseGuards(AuthGuard)
  async getPlaylist(
    @Args('playlistId') playlistId: string,
    @Context() context,
  ): Promise<Playlist | null> {
    // Optionally, you can check if the user owns the playlist here
    return this.playlistService.getPlaylistById(playlistId);
  }

  @Mutation(() => Playlist, { nullable: true })
  @UseGuards(AuthGuard)
  async updatePlaylist(
    @Args('playlistId') playlistId: string,
    @Args('input') input: UpdatePlaylistInput,
    @Context() context,
  ): Promise<Playlist | null> {
    const userId = context.req.user.id || context.req.user.sub;
    return this.playlistService.updatePlaylist(playlistId, userId, input);
  }

  @Mutation(() => DeletePlaylistResponse)
  @UseGuards(AuthGuard)
  async deletePlaylist(
    @Args('playlistId') playlistId: string,
    @Context() context,
  ): Promise<DeletePlaylistResponse> {
    const userId = context.req.user.id || context.req.user.sub;
    return this.playlistService.deletePlaylist(playlistId, userId);
  }

  @Mutation(() => Playlist, { nullable: true })
  @UseGuards(AuthGuard)
  async removeTrackFromPlaylist(
    @Args('playlistId') playlistId: string,
    @Args('trackId') trackId: string,
    @Context() context,
  ): Promise<Playlist | null> {
    const userId = context.req.user.id || context.req.user.sub;
    return this.playlistService.removeTrackFromPlaylist(
      playlistId,
      trackId,
      userId,
    );
  }
}
