import { Module } from '@nestjs/common';
import { InteractService } from './interact.service';
import { InteractResolver } from './interact.resolver';
import { PrismaService } from 'prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import {
  RecentPlayedFieldResolver,
  PlaylistTrackFieldResolver,
} from './interact-field.resolver';
import { SoundcloudService } from 'src/soundcloud/soundcloud.service';
import { CloudinaryService } from 'src/shared/services/cloudinary.service';

@Module({
  imports: [AuthModule],
  providers: [
    InteractResolver,
    InteractService,
    RecentPlayedFieldResolver,
    PlaylistTrackFieldResolver,
    SoundcloudService,
    CloudinaryService,
    PrismaService,
    JwtService,
  ],
  exports: [InteractService],
})
export class InteractModule {}
