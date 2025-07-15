import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from 'src/shared/entities/user.entity';
import { CloudinaryService } from '../shared/services/cloudinary.service';
import { toMusicItem } from 'src/shared/entities/artist.entity';

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
        username: true,
        role: true,
        isVerified: true,
        isOurUser: true,
        avatar: true,
        tracks: {
          orderBy: { createdAt: 'desc' },
        },
        Playlist: {
          include: {
            tracks: {
              orderBy: { addedAt: 'asc' },
            },
          },
          orderBy: { updatedAt: 'desc' },
        },
        recentPlayed: {
          orderBy: { playedAt: 'desc' },
          take: 20, // or whatever your MAX_RECENT_PLAYED is
        },
        likes: {
          orderBy: { createdAt: 'desc' },
        },
        // password and verificationCode are intentionally excluded for security
      },
    });
    if (!user) {
      throw new HttpException(
        'The user you are trying to access does not exist. Please check the user ID and try again.',
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      ...user,
      tracks: user.tracks.map(toMusicItem),
      playlists: user.Playlist,
      recentPlayed: user.recentPlayed,
      likes: user.likes,
    };
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        avatar: true,
        tracks: {
          orderBy: { createdAt: 'desc' },
        },
        Playlist: {
          where: { isPublic: true },
          include: {
            tracks: {
              orderBy: { addedAt: 'asc' },
            },
          },
          orderBy: { updatedAt: 'desc' },
        },
        likes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new HttpException(
        'The user you are trying to access does not exist. Please check the user ID and try again.',
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      ...user,
      tracks: user.tracks,
      playlists: user.Playlist,
      likes: user.likes,
    };
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

  async deleteAvatar(userId: string): Promise<User> {
    try {
      // Get current user to check if they have an existing avatar
      const currentUser = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { avatar: true },
      });

      if (!currentUser?.avatar) {
        throw new HttpException('No avatar to delete', HttpStatus.BAD_REQUEST);
      }

      // Delete avatar from Cloudinary if it's a Cloudinary URL
      if (currentUser.avatar.includes('cloudinary.com')) {
        try {
          await this.cloudinaryService.deleteImageByUrl(currentUser.avatar);
        } catch (deleteError) {
          // Log error but don't fail the deletion
          console.warn(
            `Failed to delete avatar from Cloudinary: ${deleteError.message}`,
          );
        }
      }

      // Update user's avatar to null in database
      const updated = await this.prisma.user.update({
        where: { id: userId },
        data: {
          avatar: null,
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
    } catch (error) {
      throw new HttpException(
        `Failed to delete avatar: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
