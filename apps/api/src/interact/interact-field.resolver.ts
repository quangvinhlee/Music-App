import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { SoundcloudService } from 'src/soundcloud/soundcloud.service';
import {
  RecentPlayed,
  PlaylistTrack,
  Playlist,
} from './entities/interact.entities';
import { Artist } from 'src/shared/entities/artist.entity';

@Resolver(() => RecentPlayed)
@Injectable()
export class RecentPlayedFieldResolver {
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
@Injectable()
export class PlaylistTrackFieldResolver {
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

@Resolver(() => Playlist)
@Injectable()
export class PlaylistFieldResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly soundcloudService: SoundcloudService,
  ) {}

  @ResolveField(() => Artist, { nullable: true })
  async artist(@Parent() playlist: Playlist): Promise<Artist | null> {
    if (!playlist.userId) return null;

    // If userId is a local DB user, fetch from DB
    const isLocalUser = /^[0-9a-fA-F]{24}$/.test(playlist.userId);
    if (isLocalUser) {
      try {
        const user = await this.prisma.user.findUnique({
          where: { id: playlist.userId },
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

    // Otherwise, fetch from SoundCloud
    try {
      return await this.soundcloudService.fetchArtistInfo({
        artistId: playlist.userId,
      });
    } catch {
      return null;
    }
  }
}
