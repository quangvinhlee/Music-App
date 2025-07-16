import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { Artist, MusicItem } from 'src/shared/entities/artist.entity';
import { PrismaService } from 'prisma/prisma.service';
import { SoundcloudService } from 'src/soundcloud/soundcloud.service';
import { Injectable } from '@nestjs/common';
import {
  FollowerEntry,
  FollowingEntry,
  Like,
} from 'src/shared/entities/user.entity';
import { User } from 'src/shared/entities/user.entity';
import { Field, ObjectType } from '@nestjs/graphql';

// Add more resolver exports here as you create them

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

@Injectable()
@Resolver(() => User)
export class UserFollowFieldResolver {
  soundcloudService: any;
  constructor(private readonly prisma: PrismaService) {}

  @ResolveField(() => [Artist], { nullable: true })
  async followers(@Parent() parent: any): Promise<Artist[]> {
    // user.followers is an array of { followerId: string }
    const ids = parent.followers.map((f: any) => f.id);
    // Only internal users can be followers
    const users = await this.prisma.user.findMany({
      where: { id: { in: ids } },
    });
    return users.map((u) => ({
      id: u.id,
      username: u.username,
      avatarUrl: u.avatar || '',
      verified: u.isVerified || false,
      city: '',
      countryCode: '',
      followersCount: 0,
    }));
  }

  @ResolveField(() => [Artist], { nullable: true })
  async following(@Parent() user: any): Promise<Artist[]> {
    console.log('following resolver called', user.following);
    const ids = user.following.map((f: any) => f.id);
    console.log('ids', ids);
    const internalIds = ids.filter((id: string) =>
      /^[0-9a-fA-F]{24}$/.test(id),
    );
    const soundcloudIds = ids.filter(
      (id: string) => !/^[0-9a-fA-F]{24}$/.test(id),
    );

    // Internal users
    const users = await this.prisma.user.findMany({
      where: { id: { in: internalIds } },
    });
    const internalArtists: Artist[] = users.map((u) => ({
      id: u.id,
      username: u.username,
      avatarUrl: u.avatar || '',
      verified: u.isVerified || false,
      city: '',
      countryCode: '',
      followersCount: 0,
    }));

    // SoundCloud users
    const soundcloudArtists = await Promise.all(
      soundcloudIds.map((id) =>
        this.soundcloudService
          .fetchArtistInfo({ artistId: id })
          .catch(() => null),
      ),
    );
    const validSoundcloudArtists = soundcloudArtists.filter(
      Boolean,
    ) as Artist[];

    return [...internalArtists, ...validSoundcloudArtists];
  }
}

@Injectable()
@Resolver(() => FollowingEntry)
export class FollowingEntryFieldResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly soundcloudService: SoundcloudService,
  ) {}

  @ResolveField(() => Artist, { nullable: true })
  async artist(@Parent() entry: any): Promise<Artist | null> {
    console.log('artist resolver called', entry);
    const id = entry.followingId;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      // Internal user
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) return null;
      return {
        id: user.id,
        username: user.username,
        avatarUrl: user.avatar || '',
        verified: user.isVerified || false,
        city: '',
        countryCode: '',
        followersCount: 0,
      };
    } else {
      // SoundCloud user
      return await this.soundcloudService.fetchArtistInfo({ artistId: id });
    }
  }
}

@Injectable()
@Resolver(() => FollowerEntry)
export class FollowerEntryFieldResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly soundcloudService: SoundcloudService,
  ) {}

  @ResolveField(() => Artist, { nullable: true })
  async artist(@Parent() entry: any): Promise<Artist | null> {
    const id = entry.followerId;
    // Only internal users can be followers
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      avatarUrl: user.avatar || '',
      verified: user.isVerified || false,
      city: '',
      countryCode: '',
      followersCount: 0,
    };
  }
}
