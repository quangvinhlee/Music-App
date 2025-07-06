import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class AppResolver {
  @Query(() => String)
  getHello(): string {
    return 'Hello World!';
  }

  @Query(() => String)
  health(): string {
    return 'Service is healthy and running!';
  }

  @Query(() => String)
  ping(): string {
    return 'pong';
  }

  @Query(() => String)
  keepAlive(): string {
    return 'Service is alive and will not sleep!';
  }
}
