import { Module } from '@nestjs/common';
import { SongResolver } from './song.resolver';
import { SongService } from './song.service';

@Module({
  providers: [SongResolver, SongService],
})
export class SongModule {}
