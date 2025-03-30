import { ObjectType, Query, Resolver } from '@nestjs/graphql';

@ObjectType()
@Resolver()
export class AppResolver {
  @Query(() => String)
  getHello(): string {
    return 'Hello World!';
  }
}
