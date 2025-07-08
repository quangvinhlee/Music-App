import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class ArtistInput {
  @Field() id: string;
  @Field() username: string;
  @Field() avatarUrl: string;
  @Field() verified: boolean;
  @Field({ nullable: true }) city?: string;
  @Field({ nullable: true }) countryCode?: string;
  @Field(() => Int, { nullable: true }) followersCount?: number;
}
