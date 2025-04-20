/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import {
  ForgotPasswordResponse,
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
import { Res, UseGuards } from '@nestjs/common';
import { Query } from '@nestjs/graphql';
import { AuthGuard } from './guard/auth.guard';

@Resolver('User')
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => RegisterResponse)
  async register(
    @Args('registerInput') registerDto: RegisterDto,
    @Context() context: any,
  ): Promise<RegisterResponse> {
    return this.userService.register(registerDto, context.res);
  }

  @Mutation(() => LoginResponse)
  async login(
    @Args('loginInput') loginDto: LoginDto,
    @Context() context: any,
  ): Promise<LoginResponse> {
    return this.userService.login(loginDto, context.res);
  }

  @UseGuards(AuthGuard)
  @Query(() => User)
  getUser(@Context() context: any) {
    const user = context?.req?.user;
    if (!user) {
      throw new Error('Invalid context or user not authenticated');
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
