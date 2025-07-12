import { Field, InputType, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class Artist {
  @Field() id: string;
  @Field() username: string;
  @Field() avatarUrl: string;
  @Field() verified: boolean;
  @Field(() => String, { nullable: true }) city?: string | null;
  @Field(() => String, { nullable: true }) countryCode?: string | null;
  @Field(() => Int, { nullable: true }) followersCount?: number | null;
}

@ObjectType()
export class MusicItem {
  @Field() id: string;
  @Field() title: string;
  @Field(() => String, { nullable: true }) artistId?: string | null;
  @Field(() => Artist, { nullable: true }) artist?: Artist | null;
  @Field() genre: string;
  @Field() artwork: string;
  @Field() duration: number;
  @Field({ nullable: true }) streamUrl?: string;
  @Field({ nullable: true }) playbackCount?: number;
  @Field({ nullable: true }) trackCount?: number;
  @Field({ nullable: true }) createdAt?: string;
  @Field(() => [MusicItem], { nullable: true }) tracks?: MusicItem[];
}
