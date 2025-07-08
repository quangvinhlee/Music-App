import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  username: string;

  @Field()
  role: string;

  @Field()
  isVerified: boolean;

  @Field()
  isOurUser: boolean | true;

  @Field({ nullable: true })
  avatar?: string;
}
