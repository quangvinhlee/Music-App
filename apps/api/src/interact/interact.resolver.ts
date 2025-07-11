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
} from './dto/interact.dto';
import {
  RecentPlayed,
  Playlist,
  PlaylistTrack,
  TrackReference,
} from './entities/interact.entities';
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
}

@Resolver(() => RecentPlayed)
export class RecentPlayedResolver {
  constructor(
    private readonly soundcloudService: SoundcloudService,
    private readonly prisma: PrismaService,
  ) {}

  @ResolveField(() => Artist, { nullable: true })
  async artist(@Parent() track: RecentPlayed): Promise<Artist | null> {
    return this.resolveArtist(track);
  }

  private async resolveArtist(track: {
    artistId: string | null;
  }): Promise<Artist | null> {
    if (!track.artistId) return null;

    // Check if artistId looks like a MongoDB ObjectId (24 hex chars)
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(track.artistId);
    if (isObjectId) {
      // This is an internal user ID, fetch user as artist
      try {
        const user = await this.prisma.user.findUnique({
          where: { id: track.artistId },
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        });

        if (user) {
          return {
            id: user.id,
            username: user.username,
            avatarUrl: user.avatar || '',
            verified: false,
            city: '',
            countryCode: '',
            followersCount: 0,
          } as Artist;
        }
      } catch {
        return null;
      }
      return null;
    }

    // This is a SoundCloud artist ID
    try {
      return await this.soundcloudService.fetchArtistInfo({
        artistId: track.artistId,
      });
    } catch {
      return null;
    }
  }
}

@Resolver(() => PlaylistTrack)
export class PlaylistTrackResolver {
  constructor(
    private readonly soundcloudService: SoundcloudService,
    private readonly prisma: PrismaService,
  ) {}

  @ResolveField(() => Artist, { nullable: true })
  async artist(@Parent() track: PlaylistTrack): Promise<Artist | null> {
    return this.resolveArtist(track);
  }

  private async resolveArtist(track: {
    artistId: string | null;
  }): Promise<Artist | null> {
    if (!track.artistId) return null;

    // Check if artistId looks like a MongoDB ObjectId (24 hex chars)
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(track.artistId);
    if (isObjectId) {
      // This is an internal user ID, fetch user as artist
      try {
        const user = await this.prisma.user.findUnique({
          where: { id: track.artistId },
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        });

        if (user) {
          return {
            id: user.id,
            username: user.username,
            avatarUrl: user.avatar || '',
            verified: true,
            city: '',
            countryCode: '',
            followersCount: 0,
          } as Artist;
        }
      } catch {
        return null;
      }
      return null;
    }

    // This is a SoundCloud artist ID
    try {
      return await this.soundcloudService.fetchArtistInfo({
        artistId: track.artistId,
      });
    } catch {
      return null;
    }
  }
}
