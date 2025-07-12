import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { SoundcloudService } from 'src/soundcloud/soundcloud.service';
import { MusicItem, Artist } from './artist.entity';

@Resolver(() => MusicItem)
@Injectable()
export class MusicItemFieldResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly soundcloudService: SoundcloudService,
  ) {}

  @ResolveField(() => Artist, { nullable: true })
  async artist(@Parent() musicItem: MusicItem): Promise<Artist | null> {
    return this.resolveArtist(musicItem);
  }

  private async resolveArtist(musicItem: {
    artistId?: string | null;
  }): Promise<Artist | null> {
    if (!musicItem.artistId) return null;

    // Check if artistId looks like a MongoDB ObjectId (24 hex chars)
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(musicItem.artistId);
    if (isObjectId) {
      // This is an internal user ID, fetch user as artist
      try {
        const user = await this.prisma.user.findUnique({
          where: { id: musicItem.artistId },
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        });

        if (user) {
          return {
            id: user.id,
            username: user.username,
            avatarUrl: user.avatar || '',
            verified: true,
            city: '',
            countryCode: '',
            followersCount: 0,
          } as Artist;
        }
      } catch {
        return null;
      }
      return null;
    }

    // This is a SoundCloud artist ID
    try {
      return await this.soundcloudService.fetchArtistInfo({
        artistId: musicItem.artistId,
      });
    } catch {
      return null;
    }
  }
}
