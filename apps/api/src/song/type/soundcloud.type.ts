import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class FetchTrendingSongResponse {
  @Field() id: string;
  @Field() username: string;
}

@ObjectType()
export class FetchTrendingSongPlaylistsResponse {
  @Field() id: string;
  @Field() title: string;
  @Field() genre: string;
  @Field() artwork: string;
}

@ObjectType()
export class FetchTrendingPlaylistSongsResponse {
  @Field() id: string;
  @Field({ nullable: true }) title?: string;
  @Field({ nullable: true }) artist?: string;
  @Field({ nullable: true }) genre?: string;
  @Field({ nullable: true }) artwork?: string;
  @Field({ nullable: true }) streamUrl?: string;
  @Field({ nullable: true }) duration?: number;
}

@ObjectType()
export class FetchRelatedSongsResponse {
  @Field() id: string;
  @Field({ nullable: true }) title?: string;
  @Field({ nullable: true }) artist?: string;
  @Field({ nullable: true }) genre?: string;
  @Field({ nullable: true }) artwork?: string;
  @Field({ nullable: true }) streamUrl?: string;
  @Field({ nullable: true }) duration?: number;
}

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
