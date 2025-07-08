import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { PlaylistService } from './playlist.service';
import { Playlist } from './entities/playlist.entity';
import {
  CreatePlaylistInput,
  AddTrackToPlaylistInput,
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
}
