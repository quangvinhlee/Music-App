import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID') || '',
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET') || '',
      callbackURL: config.get<string>('GOOGLE_CALLBACK_URL') || '',
      scope: ['email', 'profile'],
    } as any);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { name, emails, photos, id } = profile;
      const email = emails[0].value;
      const firstName = name.givenName || 'User';
      const picture = photos[0]?.value || null;

      // Check if user exists
      let user = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        // Create new user with firstName as username
        user = await this.prisma.user.create({
          data: {
            email: email.toLowerCase(),
            username: firstName, // Use firstName as username
            password: '', // Empty password for Google users
            avatar: picture,
            isVerified: true, // Google users are pre-verified
            googleId: id,
          },
        });
      } else {
        // Update existing user with Google info if not already set
        if (!user.googleId) {
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: {
              googleId: id,
            },
          });
        }
      }

      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
}
