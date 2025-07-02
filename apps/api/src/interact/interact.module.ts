import { Module } from '@nestjs/common';
import { InteractService } from './interact.service';
import { InteractResolver } from './interact.resolver';
import { PrismaService } from 'prisma/prisma.service';
import { UserModule } from 'src/user/user.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [UserModule],
  providers: [InteractResolver, InteractService, PrismaService, JwtService],
  exports: [InteractService],
})
export class InteractModule {}
