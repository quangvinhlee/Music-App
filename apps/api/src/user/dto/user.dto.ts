/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

@InputType()
export class RegisterDto {
  @Field()
  @IsEmail({}, { message: 'Invalid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @Field()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @Field()
  @IsNotEmpty({ message: 'Confirm Password is required' })
  confirmPassword: string;

  @Field()
  @IsNotEmpty({ message: 'Username is required' })
  username: string;
}

@InputType()
export class LoginDto {
  @Field()
  @IsEmail({}, { message: 'Invalid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @Field()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}

@InputType()
export class VerifyEmailDto {
  @Field()
  @IsNotEmpty({ message: 'Verification code is required' })
  verificationCode: string;

  @Field()
  @IsNotEmpty({ message: 'userId is required' })
  userId: string;
}

@InputType()
export class ResendVerificationDto {
  @Field()
  @IsNotEmpty({ message: 'UserId is required' })
  userId: string;

  @Field()
  @IsNotEmpty({ message: 'Verification type is required' })
  type: string; // "register" or "forgot-password"
}

@InputType()
export class ForgotPasswordDto {
  @Field()
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email' })
  email: string;
}

@InputType()
export class VerifyResetPasswordDto {
  @Field()
  @IsNotEmpty({ message: 'Verification code is required' })
  verificationCode: string;

  @Field()
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email' })
  email: string;
}

@InputType()
export class ResetPasswordDto {
  @Field()
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email' })
  email: string;

  @Field()
  @IsNotEmpty({ message: 'Verification code is required' })
  verificationCode: string;

  @Field()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @Field()
  @IsNotEmpty({ message: 'Confirm Password is required' })
  confirmPassword: string;
}
