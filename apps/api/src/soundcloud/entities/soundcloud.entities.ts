import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Artist {
  @Field() id: string;
  @Field() username: string;
  @Field() avatarUrl: string;
  @Field() verified: boolean;
  @Field({ nullable: true }) city?: string;
  @Field({ nullable: true }) countryCode?: string;
  @Field({ nullable: true }) followersCount?: number;
}

@ObjectType()
export class MusicItem {
  @Field() id: string;
  @Field() title: string;
  @Field(() => Artist) artist: Artist;
  @Field() genre: string;
  @Field() artwork: string;
  @Field() duration: number;
  @Field({ nullable: true }) streamUrl?: string;
  @Field({ nullable: true }) playbackCount?: number;
  @Field({ nullable: true }) trackCount?: number;
  @Field({ nullable: true }) createdAt?: string;
}

@ObjectType()
export class FetchTrendingSongPlaylistsResponse {
  @Field() id: string;
  @Field() title: string;
  @Field() genre: string;
  @Field() artwork: string;
  @Field({ nullable: true }) createdAt?: string;
}

@ObjectType()
export class FetchSoundCloudAlbumsResponse {
  @Field(() => [MusicItem]) albums: MusicItem[];
  @Field({ nullable: true }) nextHref?: string;
}

@ObjectType()
export class FetchGlobalTrendingSongsResponse {
  @Field(() => [MusicItem]) tracks: MusicItem[];
  @Field({ nullable: true }) nextHref?: string;
}

@ObjectType()
export class FetchTrendingSongResponse {
  @Field() id: string;
  @Field() username: string;
}

@ObjectType()
export class FetchTrendingPlaylistSongsResponse {
  @Field(() => [MusicItem]) tracks: MusicItem[];
}

@ObjectType()
export class FetchRelatedSongsResponse {
  @Field(() => [MusicItem]) tracks: MusicItem[];
}

@ObjectType()
export class FetchSoundCloudTracksResponse {}

@ObjectType()
export class FetchSoundCloudAlbumTracksResponse {
  @Field(() => [MusicItem]) tracks: MusicItem[];
}

@ObjectType()
export class SearchTracksResponse {
  @Field(() => [MusicItem]) tracks: MusicItem[];
  @Field({ nullable: true }) nextHref?: string;
}

@ObjectType()
export class SearchUsersResponse {
  @Field(() => [Artist]) users: Artist[];
  @Field({ nullable: true }) nextHref?: string;
}

@ObjectType()
export class SearchAlbumsResponse {
  @Field(() => [MusicItem]) albums: MusicItem[];
  @Field({ nullable: true }) nextHref?: string;
}

@ObjectType()
export class StreamUrlResponse {
  @Field() streamUrl: string;
}

@ObjectType()
export class FetchArtistResponse {
  @Field(() => Artist) artist: Artist;
}

@ObjectType()
export class FetchArtistsResponse {
  @Field(() => [Artist]) artists: Artist[];
}

@ObjectType()
export class FetchArtistDataResponse {
  @Field(() => [MusicItem], { nullable: true })
  tracks?: MusicItem[];

  @Field(() => [MusicItem], { nullable: true })
  playlists?: MusicItem[];

  @Field({ nullable: true })
  nextHref?: string;
}
