import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateRecentPlayedDto } from './dto/interact.dto';
import { RecentPlayed, ArtistOutput } from './entities/interact.entities';

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
        trackId: createRecentPlayedDto.trackId,
        title: createRecentPlayedDto.title,
        artist: createRecentPlayedDto.artist as any, // Store as JSON object
        artwork: createRecentPlayedDto.artwork,
        duration: createRecentPlayedDto.duration,
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

    // Convert the database result to match our GraphQL type
    return this.convertToGraphQLType(newEntry);
  }

  async getRecentPlayed(userId: string): Promise<RecentPlayed[]> {
    const entries = await this.prisma.recentPlayed.findMany({
      where: { userId },
      orderBy: { playedAt: 'desc' },
      take: 20,
    });

    return entries.map((entry) => this.convertToGraphQLType(entry));
  }

  private convertToGraphQLType(dbEntry: any): RecentPlayed {
    // Handle migration from old string data to new object data
    let artistData: ArtistOutput;

    if (typeof dbEntry.artist === 'string') {
      // Old format: artist is a string
      artistData = {
        id: 'unknown', // Generate a fallback ID
        username: dbEntry.artist,
        avatarUrl: '/music-plate.jpg',
        verified: false,
        city: null,
        countryCode: null,
        followersCount: null,
      };
    } else if (dbEntry.artist && typeof dbEntry.artist === 'object') {
      // New format: artist is an object
      artistData = {
        id: dbEntry.artist.id || 'unknown',
        username: dbEntry.artist.username || 'Unknown Artist',
        avatarUrl: dbEntry.artist.avatarUrl || '/music-plate.jpg',
        verified: dbEntry.artist.verified || false,
        city: dbEntry.artist.city || null,
        countryCode: dbEntry.artist.countryCode || null,
        followersCount: dbEntry.artist.followersCount || null,
      };
    } else {
      // Fallback for any other case
      artistData = {
        id: 'unknown',
        username: 'Unknown Artist',
        avatarUrl: '/music-plate.jpg',
        verified: false,
        city: null,
        countryCode: null,
        followersCount: null,
      };
    }

    return {
      id: dbEntry.id,
      userId: dbEntry.userId,
      trackId: dbEntry.trackId,
      title: dbEntry.title,
      artist: artistData,
      artwork: dbEntry.artwork,
      duration: dbEntry.duration,
      playedAt: dbEntry.playedAt,
    };
  }
}
