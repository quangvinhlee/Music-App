import { Field, InputType, Int } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

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
  artist: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  artwork?: string | null;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  duration: number;
}
