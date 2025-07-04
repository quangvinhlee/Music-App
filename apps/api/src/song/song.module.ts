import { Module } from '@nestjs/common';
import { SongResolver } from './song.resolver';
import { SongService } from './song.service';
import { PrismaService } from 'prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { InteractModule } from 'src/interact/interact.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule, InteractModule],
  providers: [SongResolver, SongService, PrismaService, JwtService],
})
export class SongModule {}
