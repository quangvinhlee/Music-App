import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsBoolean,
  IsNumber,
} from 'class-validator';

@InputType()
export class CreateRecentPlayedDto {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  trackId: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  artistId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  artwork?: string | null;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  duration: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  genre?: string | null;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  createdAt?: Date | null;
}

@InputType()
export class CreatePlaylistDto {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @Field(() => Boolean, { defaultValue: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  genre?: string | null;
}

@InputType()
export class CreatePlaylistTrackDto {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  trackId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  artistId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  artwork?: string | null;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  genre?: string | null;
}

@InputType()
export class UpdatePlaylistDto {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  genre?: string | null;
}

@InputType()
export class CreateTrackDto {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  audioData: string; // Base64 encoded audio file

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  artworkData?: string | null; // Base64 encoded artwork image

  @Field(() => Int)
  @IsInt()
  @Min(1)
  duration: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  genre?: string | null;
}

@InputType()
export class UpdateTrackDto {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  artworkData?: string | null; // Base64 encoded artwork image

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  genre?: string | null;
}
