import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { MusicItem } from 'src/shared/entities/artist.entity';
import { PrismaService } from 'prisma/prisma.service';
import { SoundcloudService } from 'src/soundcloud/soundcloud.service';
import { Injectable } from '@nestjs/common';
import { Like } from 'src/shared/entities/user.entity';

@Injectable()
@Resolver(() => Like)
export class TrackFieldResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly soundcloudService: SoundcloudService,
  ) {}

  @ResolveField(() => MusicItem, { nullable: true })
  async track(@Parent() parent: any): Promise<MusicItem | null> {
    const trackId = parent.trackId || parent.id;
    if (!trackId) return null;

    // If already resolved, return it
    if (parent.track) return parent.track;

    // Internal track
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(trackId);
    if (isObjectId) {
      const track = await this.prisma.track.findUnique({
        where: { id: trackId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      });
      if (!track) return null;
      // Use your toMusicItem helper if needed
      return {
        id: track.id,
        title: track.title,
        artistId: track.userId,
        artist: {
          id: track.user.id,
          username: track.user.username,
          avatarUrl: track.user.avatar || '',
          verified: false,
          city: '',
          countryCode: '',
          followersCount: 0,
        },
        genre: track.genre || '',
        artwork: track.artwork || '',
        duration: track.duration,
        streamUrl: track.streamUrl,
        playbackCount: 0,
        trackCount: 0,
        createdAt:
          typeof track.createdAt === 'string'
            ? track.createdAt
            : track.createdAt?.toISOString?.(),
      };
    } else {
      // SoundCloud track
      return await this.soundcloudService.processTrack({ id: trackId });
    }
  }
}
