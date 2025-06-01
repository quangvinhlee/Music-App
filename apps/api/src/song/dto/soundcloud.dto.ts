// src/song/dto/soundcloud-request.dto.ts
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class FetchTrendingSongDto {
  @Field()
  CountryCode: string;
}

@InputType()
export class FetchTrendingSongPlaylistsDto {
  @Field()
  id: string;
}

@InputType()
export class FetchTrendingPlaylistSongsDto {
  @Field()
  id: string;

  @Field({ nullable: true, defaultValue: 10 })
  limit?: number;

  @Field({ nullable: true, defaultValue: 0 })
  offset?: number;
}

@InputType()
export class FetchRelatedSongsDto {
  @Field()
  id: string;

  @Field({ nullable: true })
  nextHref?: string;
}

@InputType()
export class FetchSongDto {
  @Field({ nullable: true })
  kind?: string; // top, trending, new_and_hot, etc.

  @Field({ nullable: true })
  genre?: string; // soundcloud:genres:pop

  @Field({ nullable: true })
  query?: string; // soundcloud:genres:pop

  @Field({ nullable: true })
  username?: string; // soundcloud:genres:pop

  @Field({ nullable: true })
  limit?: number;
}

@InputType()
export class SearchDto {
  @Field({ nullable: true })
  q?: string;

  @Field({ nullable: true })
  nextHref?: string;
}

@InputType()
export class FetchAlbumTracksDto {
  @Field()
  id: number;
}
