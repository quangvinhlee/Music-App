import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';
import { CloudinaryService } from './cloudinary.service';
import { SoundcloudService } from 'src/soundcloud/soundcloud.service';
import { InteractService } from 'src/interact/interact.service';
@Module({
  imports: [AuthModule],
  providers: [
    UserResolver,
    PrismaService,
    UserService,
    AuthService,
    JwtService,
    MailService,
    CloudinaryService,
    SoundcloudService,
    InteractService,
  ],
})
export class UserModule {}
