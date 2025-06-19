import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { InteractService } from './interact.service';

@Resolver()
export class InteractResolver {
  constructor(private readonly interactService: InteractService) {}
}
