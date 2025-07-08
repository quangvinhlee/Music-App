import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { ArtistInput } from 'src/shared/dto/artist.input';

@InputType()
export class CreatePlaylistInput {
  @Field() name: string;
  @Field({ nullable: true }) description?: string;
  @Field({ nullable: true }) isPublic?: boolean;
}

@InputType()
export class AddTrackToPlaylistInput {
  @Field() playlistId: string;
  @Field() trackId: string;
  @Field() title: string;
  @Field(() => ArtistInput) artist: ArtistInput;
  @Field({ nullable: true }) artwork?: string;
  @Field() duration: number;
  @Field({ nullable: true }) genre?: string;
}

@InputType()
export class UpdatePlaylistInput {
  @Field({ nullable: true }) name?: string;
  @Field({ nullable: true }) description?: string;
  @Field({ nullable: true }) isPublic?: boolean;
}

@InputType()
export class DeletePlaylistInput {
  @Field() playlistId: string;
}

@InputType()
export class RemoveTrackFromPlaylistInput {
  @Field() playlistId: string;
  @Field() trackId: string;
}
