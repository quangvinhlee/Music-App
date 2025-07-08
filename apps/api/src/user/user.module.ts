import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [AuthModule],
  providers: [
    UserResolver,
    PrismaService,
    UserService,
    AuthService,
    JwtService,
    MailService,
  ],
})
export class UserModule {}
