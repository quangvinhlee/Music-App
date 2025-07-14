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
  @Field(() => String, { nullable: true }) artwork?: string | null;
  @Field() duration: number;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field({ nullable: true }) streamUrl?: string;
  @Field({ nullable: true }) playbackCount?: number;
  @Field({ nullable: true }) trackCount?: number;
  @Field({ nullable: true }) createdAt?: string;
  @Field(() => [MusicItem], { nullable: true }) tracks?: MusicItem[];
}

// Helper to convert a track (Prisma) to MusicItem
export function toMusicItem(track: any): MusicItem {
  return {
    id: track.id,
    title: track.title,
    artistId: track.userId,
    genre: track.genre || '',
    artwork: track.artwork || '',
    duration: track.duration,
    streamUrl: track.streamUrl,
    playbackCount: 0,
    createdAt: track.createdAt?.toISOString?.() || track.createdAt,
  };
}
