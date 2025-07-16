import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Playlist,
  RecentPlayed,
} from 'src/interact/entities/interact.entities';
import { Artist, MusicItem } from './artist.entity';

@ObjectType()
export class Like {
  @Field()
  userId: string;

  @Field()
  trackId: string;

  @Field(() => MusicItem, { nullable: true })
  track?: MusicItem | null;
}

@ObjectType()
export class FollowingEntry {
  @Field()
  followingId: string;

  @Field(() => Artist, { nullable: true })
  artist?: Artist;
}

@ObjectType()
export class FollowerEntry {
  @Field()
  followerId: string;

  @Field(() => Artist, { nullable: true })
  artist?: Artist;
}

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  username: string;

  @Field(() => String, { nullable: true })
  googleId?: string;

  @Field()
  role: string;

  @Field()
  isVerified: boolean;

  @Field()
  isOurUser: boolean | true;

  @Field({ nullable: true })
  avatar?: string;

  @Field(() => [MusicItem], { nullable: true })
  tracks?: MusicItem[];

  @Field(() => [Playlist], { nullable: true })
  playlists?: Playlist[];

  @Field(() => [RecentPlayed], { nullable: true })
  recentPlayed?: RecentPlayed[];

  @Field(() => [Like], { nullable: true })
  likes?: Like[];

  @Field(() => [FollowerEntry], { nullable: true })
  followers?: FollowerEntry[];

  @Field(() => [FollowingEntry], { nullable: true })
  following?: FollowingEntry[];
}
