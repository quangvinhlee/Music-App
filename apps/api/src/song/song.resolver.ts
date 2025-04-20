// src/song/song.resolver.ts
import { Resolver, Query, Args } from '@nestjs/graphql';
import { SongService } from './song.service';
import {
  FetchSoundCloudAlbumsResponse,
  FetchSoundCloudAlbumTracksResponse,
  FetchSoundCloudTracksResponse,
} from './type/soundcloud.type';
import { FetchAlbumTracksDto, FetchSongDto } from './dto/soundcloud.dto';

@Resolver()
export class SongResolver {
  constructor(private readonly songService: SongService) {}

  @Query(() => [FetchSoundCloudTracksResponse])
  async fetchHotSoundCloudTracks(
    @Args('fetchHotSongInput') fetchSongDto: FetchSongDto,
  ): Promise<FetchSoundCloudTracksResponse[]> {
    return this.songService.fetchHotSoundCloudTracks(fetchSongDto);
  }

  @Query(() => [FetchSoundCloudAlbumsResponse])
  async fetchHotSoundCloudAlbums(): Promise<FetchSoundCloudAlbumsResponse[]> {
    return this.songService.fetchHotSoundCloudAlbums();
  }

  @Query(() => [FetchSoundCloudAlbumTracksResponse])
  async fetchSoundCloudAlbumTracks(
    @Args('fetchAlbumTracksInput') fetchAlbumTracksDto: FetchAlbumTracksDto,
  ): Promise<FetchSoundCloudAlbumTracksResponse[]> {
    return this.songService.fetchSoundCloudAlbumTracks(fetchAlbumTracksDto);
  }
}
