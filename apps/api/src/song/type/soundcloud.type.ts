import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class FetchSoundCloudTracksResponse {
  @Field() id: string;
  @Field() title: string;
  @Field() artist: string;
  @Field() genre: string;
  @Field() artwork: string;
  @Field() streamUrl: string;
  @Field() duration: number;
}

@ObjectType()
export class FetchSoundCloudAlbumsResponse {
  @Field() id: string;
  @Field() artist: string;
  @Field() artistId: string;
  @Field() title: string;
  @Field() genre: string;
  @Field() artwork: string;
  @Field() duration: number;
}

@ObjectType()
export class FetchSoundCloudAlbumTracksResponse {
  @Field() id: string;
  @Field() title: string;
  @Field() artist: string;
  @Field() artistid: string;
  @Field() avartar_url: string;
  @Field() genre: string;
  @Field() artwork: string;
  @Field() streamUrl: string;
  @Field() duration: number;
}
