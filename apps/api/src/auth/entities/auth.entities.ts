import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from 'src/shared/entities/user.entity';

@ObjectType()
export class ErrorType {
  @Field()
  message: string;

  @Field({ nullable: true })
  code?: string;
}

@ObjectType()
export class GeoInfoResponse {
  @Field(() => String, { nullable: true })
  countryCode?: string;

  @Field(() => String, { nullable: true })
  countryName?: string;
}

@ObjectType()
export class RegisterResponse {
  @Field()
  message: string;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => ErrorType, { nullable: true })
  error?: ErrorType;
}

@ObjectType()
export class LoginResponse {
  @Field()
  message: string;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field()
  token: string;

  @Field(() => ErrorType, { nullable: true })
  error?: ErrorType;
}

@ObjectType()
export class VerifyResponse {
  @Field()
  message: string;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => ErrorType, { nullable: true })
  error?: ErrorType;
}

@ObjectType()
export class ResendVerificationResponse {
  @Field()
  message: string;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => ErrorType, { nullable: true })
  error?: ErrorType;
}

@ObjectType()
export class ForgotPasswordResponse {
  @Field()
  message: string;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => ErrorType, { nullable: true })
  error?: ErrorType;
}

@ObjectType()
export class VerifyResetPasswordResponse {
  @Field()
  message: string;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => ErrorType, { nullable: true })
  error?: ErrorType;
}

@ObjectType()
export class ResetPasswordResponse {
  @Field()
  message: string;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => ErrorType, { nullable: true })
  error?: ErrorType;
}

@ObjectType()
export class RefreshTokebResponse {
  @Field()
  message: string;

  @Field(() => String, { nullable: true })
  refreshToken?: string;

  @Field(() => String, { nullable: true })
  accessToken?: string;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => ErrorType, { nullable: true })
  error?: ErrorType;
}

@ObjectType()
export class GoogleLoginResponse {
  @Field()
  message: string;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field()
  token: string;

  @Field(() => ErrorType, { nullable: true })
  error?: ErrorType;
}
