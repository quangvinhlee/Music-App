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
export class ArtistInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  id: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  username: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  avatarUrl: string;

  @Field(() => Boolean)
  @IsBoolean()
  verified: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  city?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  countryCode?: string | null;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  followersCount?: number | null;
}

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

  @Field(() => ArtistInput)
  @IsNotEmpty()
  artist: ArtistInput;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  artwork?: string | null;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  duration: number;
}
