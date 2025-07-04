import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { InteractService } from './interact.service';
import { CreateRecentPlayedDto } from './dto/interact.dto';
import { RecentPlayed } from './entities/interact.entities';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@Resolver()
export class InteractResolver {
  constructor(private readonly interactService: InteractService) {}

  @Mutation(() => RecentPlayed)
  @UseGuards(AuthGuard)
  async createRecentPlayed(
    @Args('input') createRecentPlayedDto: CreateRecentPlayedDto,
    @Context() context: any,
  ): Promise<RecentPlayed> {
    const user = context.req.user;
    if (!user) {
      throw new Error('Not authenticated');
    }
    return this.interactService.createRecentPlayed(
      createRecentPlayedDto,
      user.id,
    );
  }

  @Query(() => [RecentPlayed])
  @UseGuards(AuthGuard)
  async getRecentPlayed(@Context() context: any): Promise<RecentPlayed[]> {
    const user = context.req.user;
    if (!user) {
      throw new Error('Not authenticated');
    }
    return this.interactService.getRecentPlayed(user.id);
  }
}
