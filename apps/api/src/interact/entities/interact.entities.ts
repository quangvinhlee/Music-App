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
  artistId: string;

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

@ObjectType()
export class Playlist {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field()
  isPublic: boolean;

  @Field(() => String, { nullable: true })
  genre: string | null;

  @Field()
  userId: string;

  @Field(() => [PlaylistTrack], { defaultValue: [] })
  tracks: PlaylistTrack[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class PlaylistTrack {
  @Field()
  id: string;

  @Field()
  trackId: string;

  @Field()
  title: string;

  @Field()
  artistId: string;

  @Field(() => String, { nullable: true })
  artwork: string | null;

  @Field(() => Int)
  duration: number;

  @Field(() => String, { nullable: true })
  genre: string | null;

  @Field()
  addedAt: Date;

  @Field()
  playlistId: string;

  @Field(() => String, { nullable: true })
  internalTrackId: string | null;

  @Field()
  trackType: 'soundcloud' | 'internal';
}
