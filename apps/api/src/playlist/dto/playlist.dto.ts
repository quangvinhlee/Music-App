import { Field, InputType } from '@nestjs/graphql';
import { ArtistInput } from 'src/shared/entities/artist.input';

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
