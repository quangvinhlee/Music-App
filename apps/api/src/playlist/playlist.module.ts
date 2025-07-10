import { Module } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { PlaylistResolver } from './playlist.resolver';
import { PrismaService } from 'prisma/prisma.service';
import { AuthModule } from 'src/auth/auth.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [AuthModule],
  providers: [PlaylistResolver, PlaylistService, PrismaService, JwtService],
})
export class PlaylistModule {}
