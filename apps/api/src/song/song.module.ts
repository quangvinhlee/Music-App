import { Module } from '@nestjs/common';
import { SongResolver } from './song.resolver';
import { SongService } from './song.service';
import { PrismaService } from 'prisma/prisma.service';
import { UserModule } from 'src/user/user.module';
import { JwtService } from '@nestjs/jwt';
import { InteractModule } from 'src/interact/interact.module';

@Module({
  imports: [UserModule, InteractModule],
  providers: [SongResolver, SongService, PrismaService, JwtService],
})
export class SongModule {}
