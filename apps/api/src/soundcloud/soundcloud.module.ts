import { Module } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { InteractModule } from 'src/interact/interact.module';
import { AuthModule } from 'src/auth/auth.module';
import { SoundcloudResolver } from './soundcloud.resolver';
import { SoundcloudService } from './soundcloud.service';

@Module({
  imports: [AuthModule, InteractModule],
  providers: [SoundcloudResolver, SoundcloudService, PrismaService, JwtService],
})
export class SoundcloudModule {}
