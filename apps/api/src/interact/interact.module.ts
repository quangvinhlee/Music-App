import { Module } from '@nestjs/common';
import { InteractService } from './interact.service';
import { InteractResolver } from './interact.resolver';
import { PrismaService } from 'prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import {
  RecentPlayedResolver,
  PlaylistTrackResolver,
} from './interact.resolver';
import { SoundcloudService } from 'src/soundcloud/soundcloud.service';

@Module({
  imports: [AuthModule],
  providers: [
    InteractResolver,
    InteractService,
    RecentPlayedResolver,
    PlaylistTrackResolver,
    SoundcloudService,
    PrismaService,
    JwtService,
  ],
  exports: [InteractService],
})
export class InteractModule {}
