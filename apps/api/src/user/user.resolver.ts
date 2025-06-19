/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Args, Mutation, Resolver, Context } from '@nestjs/graphql';
import { UserService } from './user.service';
import {
  ForgotPasswordResponse,
  GeoInfoResponse,
  LoginResponse,
  RegisterResponse,
  ResendVerificationResponse,
  User,
  VerifyResponse,
} from './types/user.type';
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResendVerificationDto,
  ResetPasswordDto,
  VerifyUserDto,
} from './dto/user.dto';
import { UseGuards } from '@nestjs/common';
import { Query } from '@nestjs/graphql';
import { AuthGuard } from './guard/auth.guard';

@Resolver('User')
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => GeoInfoResponse)
  async getCountryCodeByIp(@Context() context: any): Promise<GeoInfoResponse> {
    return this.userService.getCountryCodeByIp(context.req);
  }

  @Mutation(() => RegisterResponse)
  async register(
    @Args('registerInput') registerDto: RegisterDto,
  ): Promise<RegisterResponse> {
    return this.userService.register(registerDto);
  }

  @Mutation(() => LoginResponse)
  async login(@Args('loginInput') loginDto: LoginDto): Promise<LoginResponse> {
    return this.userService.login(loginDto);
  }

  @UseGuards(AuthGuard)
  @Query(() => User)
  getUser(@Context() context: any) {
    const user = context.req.user;
    if (!user) {
      throw new Error('Not authenticated');
    }
    return this.userService.getUser(user.id);
  }

  @Mutation(() => VerifyResponse)
  async verifyUser(
    @Args('verifyUserInput') verifyUserDto: VerifyUserDto,
  ): Promise<VerifyResponse> {
    return this.userService.verifyUser(verifyUserDto);
  }

  @Mutation(() => ResendVerificationResponse)
  async resendVerification(
    @Args('resendVerificationInput')
    resendVerificationDto: ResendVerificationDto,
  ): Promise<ResendVerificationResponse> {
    return this.userService.resendVerification(resendVerificationDto);
  }

  @Mutation(() => ForgotPasswordResponse)
  async forgotPassword(
    @Args('forgotPasswordInput') forgotPasswordDto: ForgotPasswordDto,
  ): Promise<ForgotPasswordResponse> {
    return this.userService.forgotPassword(forgotPasswordDto);
  }

  @Mutation(() => ResendVerificationResponse)
  async resetPassword(
    @Args('resetPasswordInput') resetPasswordDto: ResetPasswordDto,
  ): Promise<ResendVerificationResponse> {
    return this.userService.resetPassword(resetPasswordDto);
  }
}
