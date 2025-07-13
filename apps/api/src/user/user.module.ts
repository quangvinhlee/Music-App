import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { UserFieldResolver } from './user-field.resolver';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';
import { CloudinaryService } from '../shared/services/cloudinary.service';
@Module({
  imports: [AuthModule],
  providers: [
    UserResolver,
    UserFieldResolver,
    PrismaService,
    UserService,
    AuthService,
    JwtService,
    MailService,
    CloudinaryService,
  ],
  exports: [UserService],
})
export class UserModule {}
