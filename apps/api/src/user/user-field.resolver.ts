import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { User } from 'src/shared/entities/user.entity';
import { MusicItem } from 'src/shared/entities/artist.entity';

@Resolver(() => User)
export class UserFieldResolver {
  @ResolveField(() => [MusicItem])
  async tracks(@Parent() user: User) {
    if (!user.tracks) return [];

    return user.tracks.map((track: any) => ({
      id: track.id,
      title: track.title,
      artistId: user.id, // Map user ID to artistId since user is the artist
      artist: {
        id: user.id,
        username: user.username,
        avatarUrl: user.avatar || '',
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
      createdAt: track.createdAt.toISOString(),
    }));
  }
}
