import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from 'src/shared/entities/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        isVerified: true,
        username: true,
        avatar: true,
        isOurUser: true,
      },
    });
    if (!user) {
      throw new HttpException(
        'The user you are trying to access does not exist. Please check the user ID and try again.',
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  async updateUser(userId: string, input: UpdateUserInput): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        username: input.username,
        avatar: input.avatar,
      },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        isOurUser: true,
      },
    });

    return {
      ...updated,
    } as User;
  }
}
