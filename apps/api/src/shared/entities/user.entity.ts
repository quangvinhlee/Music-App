import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Playlist,
  RecentPlayed,
} from 'src/interact/entities/interact.entities';

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

  @Field(() => [Playlist], { nullable: true })
  playlists?: Playlist[];

  @Field(() => [RecentPlayed], { nullable: true })
  recentPlayed?: RecentPlayed[];
}
