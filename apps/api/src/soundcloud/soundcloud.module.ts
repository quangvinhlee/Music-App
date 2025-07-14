import { forwardRef, Module } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { InteractModule } from 'src/interact/interact.module';
import { AuthModule } from 'src/auth/auth.module';
import { SoundcloudResolver } from './soundcloud.resolver';
import { SoundcloudService } from './soundcloud.service';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { MusicItemFieldResolver } from '../shared/entities/artist-field.resolver';

@Module({
  imports: [AuthModule, forwardRef(() => InteractModule), UserModule],
  providers: [
    SoundcloudResolver,
    SoundcloudService,
    PrismaService,
    JwtService,
    MusicItemFieldResolver,
  ],
  exports: [SoundcloudService],
})
export class SoundcloudModule {}
