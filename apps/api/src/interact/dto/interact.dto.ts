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
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  soundcloudTrackId?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  internalTrackId?: string | null;

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
}
