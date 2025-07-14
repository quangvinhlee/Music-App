import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  Context,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { InteractService } from './interact.service';
import {
  CreateRecentPlayedDto,
  CreatePlaylistDto,
  CreatePlaylistTrackDto,
  UpdatePlaylistDto,
  CreateTrackDto,
  UpdateTrackDto,
} from './dto/interact.dto';
import {
  RecentPlayed,
  Playlist,
  PlaylistTrack,
} from './entities/interact.entities';
import { MusicItem } from 'src/shared/entities/artist.entity';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { SoundcloudService } from 'src/soundcloud/soundcloud.service';
import { Artist } from 'src/shared/entities/artist.entity';
import { PrismaService } from 'prisma/prisma.service';

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

  @UseGuards(AuthGuard)
  @Mutation(() => Playlist)
  async updatePlaylist(
    @Args('playlistId', { type: () => String }) playlistId: string,
    @Args('data') data: UpdatePlaylistDto,
    @Context() context: any,
  ) {
    return this.interactService.updatePlaylist(
      playlistId,
      data,
      context.req.user.id,
    );
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  async deletePlaylist(
    @Args('playlistId', { type: () => String }) playlistId: string,
    @Context() context: any,
  ) {
    await this.interactService.deletePlaylist(playlistId, context.req.user.id);
    return true;
  }

  // Track mutations
  @Mutation(() => MusicItem)
  @UseGuards(AuthGuard)
  async createTrack(
    @Args('input') createTrackDto: CreateTrackDto,
    @Context() context: any,
  ): Promise<MusicItem> {
    const user = context.req.user;
    if (!user) {
      throw new Error('Not authenticated');
    }
    return this.interactService.createTrack(createTrackDto, user.id);
  }

  @Mutation(() => MusicItem)
  @UseGuards(AuthGuard)
  async updateTrack(
    @Args('trackId') trackId: string,
    @Args('input') updateTrackDto: UpdateTrackDto,
    @Context() context: any,
  ): Promise<MusicItem> {
    const user = context.req.user;
    if (!user) {
      throw new Error('Not authenticated');
    }
    return this.interactService.updateTrack(trackId, updateTrackDto, user.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async deleteTrack(
    @Args('trackId') trackId: string,
    @Context() context: any,
  ): Promise<boolean> {
    const user = context.req.user;
    if (!user) {
      throw new Error('Not authenticated');
    }
    await this.interactService.deleteTrack(trackId, user.id);
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async likeTrack(
    @Args('trackId') trackId: string,
    @Context() context: any,
  ): Promise<boolean> {
    const user = context.req.user;
    if (!user) {
      throw new Error('Not authenticated');
    }
    await this.interactService.likeTrack(trackId, user.id);
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async unlikeTrack(
    @Args('trackId') trackId: string,
    @Context() context: any,
  ): Promise<boolean> {
    const user = context.req.user;
    if (!user) {
      throw new Error('Not authenticated');
    }
    await this.interactService.unlikeTrack(trackId, user.id);
    return true;
  }

  // Track queries
  @Query(() => MusicItem, { nullable: true })
  async getTrack(@Args('trackId') trackId: string): Promise<MusicItem | null> {
    return this.interactService.getTrack(trackId);
  }

  @Query(() => [MusicItem])
  async getAllTracks(
    @Args('limit', { type: () => Int, defaultValue: 50 }) limit: number,
    @Args('offset', { type: () => Int, defaultValue: 0 }) offset: number,
  ): Promise<MusicItem[]> {
    return this.interactService.getAllTracks(limit, offset);
  }

  @Query(() => [MusicItem])
  async searchTracks(
    @Args('query') query: string,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
  ): Promise<MusicItem[]> {
    return this.interactService.searchTracks(query, limit);
  }

  @Query(() => Boolean)
  @UseGuards(AuthGuard)
  async isTrackLiked(
    @Args('trackId') trackId: string,
    @Context() context: any,
  ): Promise<boolean> {
    const user = context.req.user;
    if (!user) {
      throw new Error('Not authenticated');
    }
    return this.interactService.isTrackLiked(trackId, user.id);
  }
}
