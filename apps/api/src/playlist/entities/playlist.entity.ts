import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Artist } from '../../shared/entities/artist.entity';

@ObjectType()
export class PlaylistTrack {
  @Field(() => ID) id: string;
  @Field() trackId: string;
  @Field() title: string;
  @Field(() => Artist) artist: Artist;
  @Field({ nullable: true }) artwork?: string;
  @Field() duration: number;
  @Field({ nullable: true }) genre?: string;
  @Field() addedAt: Date;
}

@ObjectType()
export class Playlist {
  @Field(() => ID) id: string;
  @Field() name: string;
  @Field({ nullable: true }) description?: string;
  @Field() isPublic: boolean;
  @Field() userId: string;
  @Field(() => [PlaylistTrack], { nullable: 'itemsAndList' })
  tracks?: PlaylistTrack[];
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
}

@ObjectType()
export class DeletePlaylistResponse {
  @Field() success: boolean;
  @Field() message: string;
}
