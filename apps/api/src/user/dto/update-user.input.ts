import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true }) username?: string;
  @Field({ nullable: true }) email?: string;
  @Field({ nullable: true }) avatar?: string;
}
