import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { InteractService } from './interact.service';
import { Interact } from './entities/interact.entity';
import { CreateInteractInput } from './dto/create-interact.input';
import { UpdateInteractInput } from './dto/update-interact.input';

@Resolver(() => Interact)
export class InteractResolver {
  constructor(private readonly interactService: InteractService) {}
}
