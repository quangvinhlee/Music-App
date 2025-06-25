import { Field, ObjectType, Int } from '@nestjs/graphql';

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

  @Field()
  artist: string;

  @Field(() => String, { nullable: true })
  artwork: string | null;

  @Field(() => Int)
  duration: number;

  @Field()
  playedAt: Date;
}
