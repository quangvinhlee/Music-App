import { Resolver, Query, Context, Mutation, Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from 'src/shared/entities/user.entity';
import { AuthGuard } from '../auth/guard/auth.guard';
import { UseGuards } from '@nestjs/common';
import { UpdateUserInput } from './dto/update-user.input';
import { UploadAvatarInput } from './dto/upload-avatar.input';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Query(() => User)
  async getUser(@Context() context: any) {
    const user = context.req.user;
    if (!user) {
      throw new Error('Not authenticated');
    }
    return this.userService.getUser(user.id);
  }

  @UseGuards(AuthGuard)
  @Query(() => User, { name: 'getUserById' })
  async getUserById(@Args('userId') userId: string) {
    return this.userService.getUser(userId);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => User)
  async updateUserProfile(
    @Args('input') input: UpdateUserInput,
    @Context() context: any,
  ) {
    const user = context.req.user;
    if (!user) {
      throw new Error('Not authenticated');
    }
    return this.userService.updateUser(user.id, input);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => User, { name: 'updateUserById' })
  async updateUserById(
    @Args('userId') userId: string,
    @Args('input') input: UpdateUserInput,
  ) {
    return this.userService.updateUser(userId, input);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => User)
  async uploadAvatar(
    @Args('input') input: UploadAvatarInput,
    @Context() context: any,
  ) {
    const user = context.req.user;
    if (!user) {
      throw new Error('Not authenticated');
    }
    return this.userService.uploadAvatar(user.id, input.file);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => User)
  async deleteAvatar(@Context() context: any) {
    const user = context.req.user;
    if (!user) {
      throw new Error('Not authenticated');
    }
    return this.userService.deleteAvatar(user.id);
  }
}
