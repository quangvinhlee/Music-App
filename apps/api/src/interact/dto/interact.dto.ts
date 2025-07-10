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
import { ArtistInput } from 'src/shared/dto/artist.input';

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

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  genre?: string | null;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  createdAt?: Date | null;
}
