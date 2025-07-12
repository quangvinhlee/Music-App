import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { SoundcloudService } from 'src/soundcloud/soundcloud.service';
import { RecentPlayed, PlaylistTrack } from './entities/interact.entities';
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

  @ResolveField(() => String, { nullable: true })
  async streamUrl(@Parent() track: RecentPlayed): Promise<string | null> {
    return this.resolveStreamUrl(track);
  }

  private async resolveStreamUrl(track: {
    trackId: string;
  }): Promise<string | null> {
    if (!track.trackId) return null;

    // Check if trackId looks like a MongoDB ObjectId (24 hex chars) - internal track
    const isInternalTrack = /^[0-9a-fA-F]{24}$/.test(track.trackId);

    if (isInternalTrack) {
      // This is an internal track, fetch stream URL from tracks table
      try {
        const trackData = await this.prisma.track.findUnique({
          where: { id: track.trackId },
          select: { streamUrl: true },
        });
        return trackData?.streamUrl || null;
      } catch {
        return null;
      }
    }

    // This is a SoundCloud track, fetch stream URL from SoundCloud API
    try {
      return await this.soundcloudService.fetchStreamUrl(track.trackId);
    } catch {
      return null;
    }
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

  // Stream URL for recent played and playlist tracks for internal tracks
  @ResolveField(() => String, { nullable: true })
  async streamUrl(@Parent() track: PlaylistTrack): Promise<string | null> {
    return this.resolveStreamUrl(track);
  }

  private async resolveStreamUrl(track: {
    trackId: string;
  }): Promise<string | null> {
    if (!track.trackId) return null;

    // Check if trackId looks like a MongoDB ObjectId (24 hex chars) - internal track
    const isInternalTrack = /^[0-9a-fA-F]{24}$/.test(track.trackId);

    if (isInternalTrack) {
      // This is an internal track, fetch stream URL from tracks table
      try {
        const trackData = await this.prisma.track.findUnique({
          where: { id: track.trackId },
          select: { streamUrl: true },
        });
        return trackData?.streamUrl || null;
      } catch {
        return null;
      }
    }

    // This is a SoundCloud track, fetch stream URL from SoundCloud API
    try {
      return await this.soundcloudService.fetchStreamUrl(track.trackId);
    } catch {
      return null;
    }
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
