import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import {
  CreateRecentPlayedDto,
  CreatePlaylistDto,
  CreatePlaylistTrackDto,
} from './dto/interact.dto';
import {
  RecentPlayed,
  Playlist,
  PlaylistTrack,
} from './entities/interact.entities';

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
      return updatedEntry as any;
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
        artist: { id: createRecentPlayedDto.artistId } as any, // Store as JSON object
        artwork: createRecentPlayedDto.artwork,
        duration: createRecentPlayedDto.duration,
        genre: createRecentPlayedDto.genre,
        userId,
        playedAt: new Date(),
        createdAt: createRecentPlayedDto.createdAt || null,
      },
    });

    return newEntry as any;
  }

  async getRecentPlayed(userId: string): Promise<RecentPlayed[]> {
    const entries = await this.prisma.recentPlayed.findMany({
      where: { userId },
      orderBy: { playedAt: 'desc' },
      take: this.MAX_RECENT_PLAYED,
    });

    return entries as any;
  }

  async createPlaylist(
    createPlaylistDto: CreatePlaylistDto,
    userId: string,
  ): Promise<Playlist> {
    const playlist = await this.prisma.playlist.create({
      data: {
        name: createPlaylistDto.name,
        description: createPlaylistDto.description,
        isPublic: createPlaylistDto.isPublic ?? true,
        genre: createPlaylistDto.genre,
        userId,
      },
      include: {
        tracks: {
          orderBy: { addedAt: 'asc' },
        },
      },
    });

    return playlist as any;
  }

  async addTrackToPlaylist(
    playlistId: string,
    createPlaylistTrackDto: CreatePlaylistTrackDto,
    userId: string,
  ): Promise<PlaylistTrack> {
    // Verify the playlist belongs to the user
    const playlist = await this.prisma.playlist.findFirst({
      where: {
        id: playlistId,
        userId,
      },
    });

    if (!playlist) {
      throw new Error('Playlist not found or access denied');
    }

    // Determine trackId and track type
    const trackId =
      createPlaylistTrackDto.soundcloudTrackId ||
      createPlaylistTrackDto.internalTrackId;
    if (!trackId) {
      throw new Error(
        'Either soundcloudTrackId or internalTrackId must be provided',
      );
    }

    // Check if track already exists in playlist
    const existingTrack = await this.prisma.playlistTrack.findFirst({
      where: {
        playlistId,
        trackId,
      },
    });

    if (existingTrack) {
      throw new Error('Track already exists in playlist');
    }

    // Check if this is an internal track
    let internalTrackId: string | null = null;
    if (createPlaylistTrackDto.internalTrackId) {
      const internalTrack = await this.prisma.track.findFirst({
        where: {
          id: createPlaylistTrackDto.internalTrackId,
        },
      });
      internalTrackId = internalTrack ? internalTrack.id : null;
    }

    const playlistTrack = await this.prisma.playlistTrack.create({
      data: {
        trackId,
        title: createPlaylistTrackDto.title,
        artistId: createPlaylistTrackDto.artistId,
        duration: createPlaylistTrackDto.duration,
        genre: createPlaylistTrackDto.genre || 'unknown',
        playlistId,
        internalTrackId,
        trackType: createPlaylistTrackDto.soundcloudTrackId
          ? 'soundcloud'
          : 'internal',
      },
    });

    return playlistTrack as any;
  }

  async getPlaylists(userId: string): Promise<Playlist[]> {
    const playlists = await this.prisma.playlist.findMany({
      where: { userId },
      include: {
        tracks: {
          orderBy: { addedAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return playlists as any;
  }

  async getPlaylist(playlistId: string, userId: string): Promise<Playlist> {
    const playlist = await this.prisma.playlist.findFirst({
      where: {
        id: playlistId,
        userId,
      },
      include: {
        tracks: {
          orderBy: { addedAt: 'asc' },
        },
      },
    });

    if (!playlist) {
      throw new Error('Playlist not found or access denied');
    }

    return playlist as any;
  }
}
