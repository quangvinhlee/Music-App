import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Artist } from '../../shared/entities/artist.entity';

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

  @Field(() => Artist)
  artist: Artist;

  @Field(() => String, { nullable: true })
  artwork: string | null;

  @Field(() => Int)
  duration: number;

  @Field(() => String, { nullable: true })
  genre: string | null;

  @Field()
  playedAt: Date;

  @Field(() => Date, { nullable: true })
  createdAt: Date | null;
}
