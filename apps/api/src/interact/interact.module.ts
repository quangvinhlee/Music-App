import { Module, forwardRef } from '@nestjs/common';
import { InteractService } from './interact.service';
import { InteractResolver } from './interact.resolver';
import { PrismaService } from 'prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import {
  RecentPlayedFieldResolver,
  PlaylistTrackFieldResolver,
  PlaylistFieldResolver,
} from './interact-field.resolver';
import { CloudinaryService } from 'src/shared/services/cloudinary.service';
import { SoundcloudModule } from 'src/soundcloud/soundcloud.module';

@Module({
  imports: [AuthModule, forwardRef(() => SoundcloudModule)],
  providers: [
    InteractResolver,
    InteractService,
    RecentPlayedFieldResolver,
    PlaylistTrackFieldResolver,
    PlaylistFieldResolver,
    CloudinaryService,
    PrismaService,
    JwtService,
  ],
  exports: [InteractService],
})
export class InteractModule {}
