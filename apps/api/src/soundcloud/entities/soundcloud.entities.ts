import { Artist, MusicItem } from '../../shared/entities/artist.entity';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class FetchTrendingSongPlaylistsResponse {
  @Field(() => ID)
  id: string;
  @Field()
  title: string;
  @Field()
  genre: string;
  @Field()
  artwork: string;
  @Field({ nullable: true })
  createdAt?: string;
}

@ObjectType()
export class FetchSoundCloudAlbumsResponse {
  @Field(() => [MusicItem])
  albums: MusicItem[];
  @Field({ nullable: true })
  nextHref?: string;
}

@ObjectType()
export class FetchGlobalTrendingSongsResponse {
  @Field(() => [MusicItem])
  tracks: MusicItem[];
  @Field({ nullable: true })
  nextHref?: string;
}

@ObjectType()
export class FetchTrendingSongResponse {
  @Field(() => ID)
  id: string;
  @Field()
  username: string;
}

@ObjectType()
export class FetchTrendingPlaylistSongsResponse {
  @Field(() => [MusicItem])
  tracks: MusicItem[];
}

@ObjectType()
export class PlaylistMetadata {
  @Field(() => ID)
  id: string;
  @Field()
  title: string;
  @Field()
  artwork: string;
  @Field()
  owner: string;
  @Field()
  trackCount: number;
  @Field()
  duration: number;
  @Field()
  genre: string;
  @Field({ nullable: true })
  createdAt?: string;
  @Field(() => [MusicItem])
  tracks: MusicItem[];
}

@ObjectType()
export class FetchAlbumTracksResponse {
  @Field(() => PlaylistMetadata)
  playlist: PlaylistMetadata;
}

@ObjectType()
export class FetchRelatedSongsResponse {
  @Field(() => [MusicItem])
  tracks: MusicItem[];
}

@ObjectType()
export class FetchSoundCloudTracksResponse {}

@ObjectType()
export class FetchSoundCloudAlbumTracksResponse {
  @Field(() => [MusicItem])
  tracks: MusicItem[];
}

@ObjectType()
export class SearchTracksResponse {
  @Field(() => [MusicItem])
  tracks: MusicItem[];
  @Field({ nullable: true })
  nextHref?: string;
}

@ObjectType()
export class SearchUsersResponse {
  @Field(() => [Artist])
  users: Artist[];
  @Field({ nullable: true })
  nextHref?: string;
}

@ObjectType()
export class SearchAlbumsResponse {
  @Field(() => [MusicItem])
  albums: MusicItem[];
  @Field({ nullable: true })
  nextHref?: string;
}

@ObjectType()
export class StreamUrlResponse {
  @Field()
  streamUrl: string;
}

@ObjectType()
export class FetchArtistResponse {
  @Field(() => Artist)
  artist: Artist;
}

@ObjectType()
export class FetchArtistsResponse {
  @Field(() => [Artist])
  artists: Artist[];
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
