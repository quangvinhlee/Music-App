import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Track {
  @Field() id: string;
  @Field() title: string;
  @Field() artist: string;
  @Field() genre: string;
  @Field() artwork: string;
  @Field() duration: number;
}

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
  @Field() title: string;
  @Field() artist: string;
  @Field() genre: string;
  @Field() artwork: string;
  @Field() duration: number;
}

@ObjectType()
export class FetchRelatedSongsResponse {
  @Field(() => [Track]) tracks: Track[];
}

@ObjectType()
export class FetchSoundCloudTracksResponse {}

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

@ObjectType()
export class SearchTrack {
  @Field() id: string;
  @Field() title: string;
  @Field() artist: string;
  @Field() artistId: string;
  @Field() genre: string;
  @Field() artwork: string;
  @Field() duration: number;
  @Field() playbackCount: number;
}

@ObjectType()
export class SearchUser {
  @Field() id: string;
  @Field() username: string;
  @Field() avatarUrl: string;
  @Field() followersCount: number;
}

@ObjectType()
export class SearchAlbum {
  @Field() id: string;
  @Field() title: string;
  @Field() artist: string;
  @Field() artistId: string;
  @Field() genre: string;
  @Field() artwork: string;
  @Field() duration: number;
  @Field() trackCount: number;
}

@ObjectType()
export class SearchTracksResponse {
  @Field(() => [SearchTrack]) tracks: SearchTrack[];
  @Field({ nullable: true }) nextHref?: string;
}

@ObjectType()
export class SearchUsersResponse {
  @Field(() => [SearchUser]) users: SearchUser[];
  @Field({ nullable: true }) nextHref?: string;
}

@ObjectType()
export class SearchAlbumsResponse {
  @Field(() => [SearchAlbum]) albums: SearchAlbum[];
  @Field({ nullable: true }) nextHref?: string;
}

@ObjectType()
export class StreamUrlResponse {
  @Field() streamUrl: string;
}
