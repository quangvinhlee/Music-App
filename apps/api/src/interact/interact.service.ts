import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateRecentPlayedDto } from './dto/interact.dto';
import { RecentPlayed, ArtistOutput } from './entities/interact.entities';

@Injectable()
export class InteractService {
  private readonly MAX_RECENT_PLAYED = 20; // Configurable limit

  constructor(private readonly prisma: PrismaService) {}

  async createRecentPlayed(
    createRecentPlayedDto: CreateRecentPlayedDto,
    userId: string,
  ): Promise<RecentPlayed> {
    // First, check if this song already exists for this user
    const existingEntry = await this.prisma.recentPlayed.findFirst({
      where: {
        userId: userId,
        trackId: createRecentPlayedDto.trackId,
      },
    });

    if (existingEntry) {
      // Song already exists, just update the playedAt timestamp
      const updatedEntry = await this.prisma.recentPlayed.update({
        where: { id: existingEntry.id },
        data: {
          playedAt: new Date(),
        },
      });
      return this.convertToGraphQLType(updatedEntry);
    }

    // Song doesn't exist, check if we need to delete the oldest record
    const currentCount = await this.prisma.recentPlayed.count({
      where: { userId },
    });

    if (currentCount >= this.MAX_RECENT_PLAYED) {
      // Find and delete the oldest record
      const oldestEntry = await this.prisma.recentPlayed.findFirst({
        where: { userId },
        orderBy: { playedAt: 'asc' }, // Oldest first
      });

      if (oldestEntry) {
        await this.prisma.recentPlayed.delete({
          where: { id: oldestEntry.id },
        });
      }
    }

    // Now create the new record
    const newEntry = await this.prisma.recentPlayed.create({
      data: {
        trackId: createRecentPlayedDto.trackId,
        title: createRecentPlayedDto.title,
        artist: createRecentPlayedDto.artist as any, // Store as JSON object
        artwork: createRecentPlayedDto.artwork,
        duration: createRecentPlayedDto.duration,
        genre: createRecentPlayedDto.genre,
        userId,
        playedAt: new Date(),
        createdAt: createRecentPlayedDto.createdAt || null,
      },
    });

    // Convert the database result to match our GraphQL type
    return this.convertToGraphQLType(newEntry);
  }

  async getRecentPlayed(userId: string): Promise<RecentPlayed[]> {
    const entries = await this.prisma.recentPlayed.findMany({
      where: { userId },
      orderBy: { playedAt: 'desc' },
      take: this.MAX_RECENT_PLAYED,
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
      genre: dbEntry.genre,
      playedAt: dbEntry.playedAt,
      createdAt: dbEntry.createdAt,
    };
  }
}
