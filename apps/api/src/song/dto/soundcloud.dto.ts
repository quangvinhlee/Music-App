// src/song/dto/soundcloud-request.dto.ts
import { Field, InputType, Int } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

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
}

@InputType()
export class FetchGlobalTrendingSongsDto {
  @Field({ nullable: true, defaultValue: 'trending' })
  kind?: string; // trending, top, new_and_hot, etc.

  @Field({ nullable: true, defaultValue: 'soundcloud:genres:all-music' })
  genre?: string; // soundcloud:genres:all-music, soundcloud:genres:pop, etc.

  @Field({ nullable: true, defaultValue: 10 })
  limit?: number;

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

@InputType()
export class FetchStreamUrlDto {
  @Field()
  trackId: string;
}

@InputType()
export class FetchRecommendedArtistsDto {
  @Field({ nullable: true, defaultValue: 10 })
  limit?: number;

  @Field({ nullable: true, defaultValue: 'US' })
  countryCode?: string;
}

@InputType()
export class FetchArtistDataDto {
  @Field()
  artistId: string;

  @Field({ nullable: true, defaultValue: 'tracks' })
  type?: string; // tracks, playlists, likes, reposts

  @Field({ nullable: true })
  nextHref?: string;
}
