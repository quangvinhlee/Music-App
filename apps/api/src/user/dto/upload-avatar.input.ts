import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UploadAvatarInput {
  @Field(() => String)
  file: string; // Base64 encoded file data
}
