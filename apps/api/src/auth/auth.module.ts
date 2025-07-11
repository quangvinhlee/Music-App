import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';
import { AuthGuard } from './guard/auth.guard';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UserService } from 'src/user/user.service';
import { CloudinaryService } from 'src/user/cloudinary.service';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Ensure type safety
        signOptions: {
          expiresIn: '12h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    AuthResolver,
    ConfigService,
    PrismaService,
    JwtService,
    MailService,
    AuthGuard,
    UserService,
    CloudinaryService,
    GoogleStrategy,
  ],
})
export class AuthModule {}
