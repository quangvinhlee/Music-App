import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateRecentPlayedDto } from './dto/interact.dto';
import { RecentPlayed } from './entities/interact.entities';

@Injectable()
export class InteractService {
  constructor(private readonly prisma: PrismaService) {}

  async createRecentPlayed(
    createRecentPlayedDto: CreateRecentPlayedDto,
    userId: string,
  ): Promise<RecentPlayed> {
    // Remove any existing entry for this user and track
    await this.prisma.recentPlayed.deleteMany({
      where: {
        userId,
        trackId: createRecentPlayedDto.trackId,
      },
    });

    // Add the new entry at the top (with current playedAt)
    const newEntry = await this.prisma.recentPlayed.create({
      data: {
        ...createRecentPlayedDto,
        userId,
        playedAt: new Date(),
      },
    });

    // Count how many recent songs the user has
    const count = await this.prisma.recentPlayed.count({
      where: { userId },
    });

    // If more than 20, delete the oldest ones
    if (count > 20) {
      // Find the oldest entries to delete (skip the 20 most recent)
      const toDelete = await this.prisma.recentPlayed.findMany({
        where: { userId },
        orderBy: { playedAt: 'desc' },
        skip: 20,
        select: { id: true },
      });

      const idsToDelete = toDelete.map((entry) => entry.id);

      if (idsToDelete.length > 0) {
        await this.prisma.recentPlayed.deleteMany({
          where: { id: { in: idsToDelete } },
        });
      }
    }

    return newEntry;
  }

  async getRecentPlayed(userId: string): Promise<RecentPlayed[]> {
    return this.prisma.recentPlayed.findMany({
      where: { userId },
      orderBy: { playedAt: 'desc' },
      take: 20,
    });
  }
}
