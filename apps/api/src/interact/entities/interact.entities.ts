import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class ArtistOutput {
  @Field()
  id: string;

  @Field()
  username: string;

  @Field()
  avatarUrl: string;

  @Field()
  verified: boolean;

  @Field(() => String, { nullable: true })
  city?: string | null;

  @Field(() => String, { nullable: true })
  countryCode?: string | null;

  @Field(() => Int, { nullable: true })
  followersCount?: number | null;
}

@ObjectType()
export class RecentPlayed {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field()
  trackId: string;

  @Field()
  title: string;

  @Field(() => ArtistOutput)
  artist: ArtistOutput;

  @Field(() => String, { nullable: true })
  artwork: string | null;

  @Field(() => Int)
  duration: number;

  @Field()
  playedAt: Date;

  @Field(() => Date, { nullable: true })
  createdAt: Date | null;
}
