import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const req = gqlContext.getContext().req; // GraphQL request context
    const res = gqlContext.getContext().res as Response;

    if (!req || !req.headers) {
      throw new UnauthorizedException('Invalid request context');
    }

    const token = this.extractTokenFromHeader(req);

    if (!token) {
      throw new UnauthorizedException('Authorization token missing');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });
      req.user = payload; // Attach user info to the request

      // Only refresh if token expires in less than 5 days
      const now = Math.floor(Date.now() / 1000);
      const fiveDays = 60 * 60 * 24 * 5;
      if (payload.exp && payload.exp - now < fiveDays) {
        // Create new payload without exp property to avoid conflict
        const { exp, iat, ...newPayload } = payload;
        const newToken = this.jwtService.sign(newPayload, {
          secret: this.config.get<string>('JWT_SECRET'),
          expiresIn: '7d',
        });
        if (res) {
          res.cookie('token', newToken, {
            httpOnly: true,
            secure: this.config.get<string>('NODE_ENV') === 'production',
            sameSite:
              this.config.get<string>('NODE_ENV') === 'production'
                ? 'none'
                : 'lax',
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
          });
        }
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  private extractTokenFromHeader(req: any): string | undefined {
    // First check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const [type, token] = authHeader.split(' ');
      if (type === 'Bearer') return token;
    }

    // Then check cookies
    if (req.cookies && req.cookies.token) {
      return req.cookies.token;
    }

    return undefined;
  }
}
