import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { MusicItem, Artist } from './artist.entity';
import { SoundcloudService } from '../../soundcloud/soundcloud.service';

@Resolver(() => MusicItem)
export class MusicItemFieldResolver {
  constructor(private readonly soundcloudService: SoundcloudService) {}

  @ResolveField(() => Artist, { nullable: true })
  async artist(@Parent() musicItem: MusicItem): Promise<Artist | null> {
    // If artist is already loaded, return it
    if (musicItem.artist) {
      return musicItem.artist;
    }

    // If we have artistId, fetch the artist data
    if (musicItem.artistId) {
      try {
        const artist = await this.soundcloudService.fetchArtistInfo({
          artistId: musicItem.artistId,
        });
        return artist;
      } catch (error) {
        console.warn(
          `Failed to fetch artist for ${musicItem.artistId}:`,
          error,
        );
        return null;
      }
    }

    return null;
  }
}
