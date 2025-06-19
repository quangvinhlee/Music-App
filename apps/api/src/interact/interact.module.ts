import { Module } from '@nestjs/common';
import { InteractService } from './interact.service';
import { InteractResolver } from './interact.resolver';

@Module({
  providers: [InteractResolver, InteractService],
})
export class InteractModule {}
