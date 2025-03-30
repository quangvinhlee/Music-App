import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

// Define Role Enum for GraphQL
export enum Role {
  ADMIN = 'ADMIN',
  ARTIST = 'ARTIST',
  USER = 'USER',
}

registerEnumType(Role, { name: 'Role' });

@ObjectType()
export class User {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  username: string;

  @Field()
  password: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field(() => Role)
  role: Role;

  @Field()
  isVerified: boolean;

  @Field({ nullable: true })
  verificationCode?: string;

  @Field({ nullable: true })
  verificationCodeExpiresAt?: Date;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
