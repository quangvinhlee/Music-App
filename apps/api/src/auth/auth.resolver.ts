/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Args, Mutation, Resolver, Context } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import {
  ForgotPasswordResponse,
  GeoInfoResponse,
  LoginResponse,
  RegisterResponse,
  ResendVerificationResponse,
  User,
  VerifyResponse,
} from './types/auth.type';
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResendVerificationDto,
  ResetPasswordDto,
  VerifyUserDto,
} from './dto/auth.dto';
import { UseGuards } from '@nestjs/common';
import { Query } from '@nestjs/graphql';
import { AuthGuard } from './guard/auth.guard';

@Resolver('User')
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => GeoInfoResponse)
  async getCountryCodeByIp(@Context() context: any): Promise<GeoInfoResponse> {
    return this.authService.getCountryCodeByIp(context.req);
  }

  @Mutation(() => RegisterResponse)
  async register(
    @Args('registerInput') registerDto: RegisterDto,
  ): Promise<RegisterResponse> {
    return this.authService.register(registerDto);
  }

  @Mutation(() => LoginResponse)
  async login(
    @Args('loginInput') loginDto: LoginDto,
    @Context() context: any,
  ): Promise<LoginResponse> {
    const result = await this.authService.login(loginDto);
    // Set token as HttpOnly cookie
    const isProduction = process.env.NODE_ENV === 'production';

    context.res.cookie('token', result.token, {
      httpOnly: true,
      secure: isProduction, // true in production, false locally
      sameSite: isProduction ? 'none' : 'lax', // 'none' in production, 'lax' locally
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
    return result;
  }

  @UseGuards(AuthGuard)
  @Query(() => User)
  getUser(@Context() context: any) {
    const user = context.req.user;
    if (!user) {
      throw new Error('Not authenticated');
    }
    return this.authService.getUser(user.id);
  }

  // New query to check auth status without requiring authentication
  @Query(() => User, { nullable: true })
  async checkAuth(@Context() context: any) {
    try {
      // Extract token from request
      const token = this.extractTokenFromRequest(context.req);
      if (token) {
        // Verify token and get user
        const payload = await this.authService.verifyToken(token);
        if (payload) {
          return this.authService.getUser(payload.id);
        }
      }

      return null; // No valid token found
    } catch (error) {
      return null; // Return null instead of throwing error
    }
  }

  private extractTokenFromRequest(req: any): string | undefined {
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

  @Mutation(() => VerifyResponse)
  async verifyUser(
    @Args('verifyUserInput') verifyUserDto: VerifyUserDto,
  ): Promise<VerifyResponse> {
    return this.authService.verifyUser(verifyUserDto);
  }

  @Mutation(() => ResendVerificationResponse)
  async resendVerification(
    @Args('resendVerificationInput')
    resendVerificationDto: ResendVerificationDto,
  ): Promise<ResendVerificationResponse> {
    return this.authService.resendVerification(resendVerificationDto);
  }

  @Mutation(() => ForgotPasswordResponse)
  async forgotPassword(
    @Args('forgotPasswordInput') forgotPasswordDto: ForgotPasswordDto,
  ): Promise<ForgotPasswordResponse> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Mutation(() => ResendVerificationResponse)
  async resetPassword(
    @Args('resetPasswordInput') resetPasswordDto: ResetPasswordDto,
  ): Promise<ResendVerificationResponse> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Mutation(() => Boolean)
  async logout(@Context() context: any): Promise<boolean> {
    context.res.clearCookie('token');
    return true;
  }
}
