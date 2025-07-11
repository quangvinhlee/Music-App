import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Artist } from 'src/shared/entities/artist.entity';

@ObjectType()
export class TrackReference {
  @Field()
  id: string;

  @Field()
  trackId: string;

  @Field(() => String, { nullable: true })
  title: string | null;

  @Field(() => String, { nullable: true })
  artistId: string | null;

  @Field(() => String, { nullable: true })
  artwork: string | null;

  @Field(() => Int, { nullable: true })
  duration: number | null;

  @Field(() => String, { nullable: true })
  genre: string | null;

  @Field(() => Artist, { nullable: true })
  artist?: Artist | null;
}

@ObjectType()
export class RecentPlayed extends TrackReference {
  @Field()
  userId: string;

  @Field()
  playedAt: Date;

  @Field(() => Date, { nullable: true })
  createdAt: Date | null;
}

@ObjectType()
export class PlaylistTrack extends TrackReference {
  @Field()
  playlistId: string;

  @Field()
  addedAt: Date;
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
