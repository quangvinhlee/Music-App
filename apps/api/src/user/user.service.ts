import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from 'src/shared/entities/user.entity';
import { CloudinaryService } from './cloudinary.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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
        role: true,
        isVerified: true,
        isOurUser: true,
      },
    });

    return {
      ...updated,
    } as User;
  }

  async uploadAvatar(userId: string, fileData: string): Promise<User> {
    try {
      // Get current user to check if they have an existing avatar
      const currentUser = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { avatar: true },
      });

      // Upload new image to Cloudinary
      const imageUrl = await this.cloudinaryService.uploadBase64Image(fileData);

      // Update user's avatar in database
      const updated = await this.prisma.user.update({
        where: { id: userId },
        data: {
          avatar: imageUrl,
        },
        select: {
          id: true,
          email: true,
          username: true,
          avatar: true,
          role: true,
          isVerified: true,
          isOurUser: true,
        },
      });

      // Delete old avatar from Cloudinary if it exists and is not the default
      if (
        currentUser?.avatar &&
        currentUser.avatar !== '' &&
        currentUser.avatar.includes('cloudinary.com') &&
        currentUser.avatar !== imageUrl
      ) {
        try {
          await this.cloudinaryService.deleteImageByUrl(currentUser.avatar);
        } catch (deleteError) {
          // Log error but don't fail the upload
          console.warn(`Failed to delete old avatar: ${deleteError.message}`);
        }
      }

      return {
        ...updated,
      } as User;
    } catch (error) {
      throw new HttpException(
        `Failed to upload avatar: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
