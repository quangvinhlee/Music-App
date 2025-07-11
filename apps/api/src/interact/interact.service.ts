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
        artistId: createRecentPlayedDto.artistId,
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

    // Use only trackId (string) for both internal and SoundCloud tracks
    const trackId = createPlaylistTrackDto.trackId;
    if (!trackId) {
      throw new Error('trackId is required');
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

    // Create the playlist track with conditional data
    const trackData: any = {
      trackId,
      playlistId,
      addedAt: new Date(),
    };

    // Only add optional fields if they have values
    if (createPlaylistTrackDto.title !== undefined) {
      trackData.title = createPlaylistTrackDto.title;
    }
    if (createPlaylistTrackDto.artistId !== undefined) {
      trackData.artistId = createPlaylistTrackDto.artistId;
    }
    if (createPlaylistTrackDto.artwork !== undefined) {
      trackData.artwork = createPlaylistTrackDto.artwork;
    }
    if (createPlaylistTrackDto.duration !== undefined) {
      trackData.duration = createPlaylistTrackDto.duration;
    }
    if (createPlaylistTrackDto.genre !== undefined) {
      trackData.genre = createPlaylistTrackDto.genre;
    }

    const playlistTrack = await this.prisma.playlistTrack.create({
      data: trackData,
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

    // Fetch track information for each playlist track
    const playlistsWithTracks = await Promise.all(
      playlists.map(async (playlist) => ({
        ...playlist,
        tracks: await Promise.all(
          playlist.tracks.map(async (track) => {
            // Check if trackId is a valid ObjectId (internal track)
            const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(track.trackId);
            if (isValidObjectId) {
              // Fetch internal track data
              const internalTrack = await this.prisma.track.findUnique({
                where: { id: track.trackId },
              });
              if (internalTrack) {
                return {
                  ...track,
                  title: internalTrack.title,
                  artistId: internalTrack.userId, // Use userId as artistId for internal tracks
                  artwork: internalTrack.artwork,
                  duration: internalTrack.duration,
                  genre: internalTrack.genre,
                };
              }
            }
            // For SoundCloud tracks or if internal track not found, return as is
            return track;
          }),
        ),
      })),
    );

    return playlistsWithTracks as any;
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

    // Fetch track information for each playlist track
    const playlistWithTracks = {
      ...playlist,
      tracks: await Promise.all(
        playlist.tracks.map(async (track) => {
          // Check if trackId is a valid ObjectId (internal track)
          const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(track.trackId);
          if (isValidObjectId) {
            // Fetch internal track data
            const internalTrack = await this.prisma.track.findUnique({
              where: { id: track.trackId },
            });
            if (internalTrack) {
              return {
                ...track,
                title: internalTrack.title,
                artistId: internalTrack.userId, // Use userId as artistId for internal tracks
                artwork: internalTrack.artwork,
                duration: internalTrack.duration,
                genre: internalTrack.genre,
              };
            }
          }
          // For SoundCloud tracks or if internal track not found, return as is
          return track;
        }),
      ),
    };

    return playlistWithTracks as any;
  }

  async updatePlaylist(
    playlistId: string,
    updateData: {
      name?: string | null;
      description?: string | null;
      isPublic?: boolean | null;
      genre?: string | null;
    },
    userId: string,
  ): Promise<Playlist> {
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

    // Filter out null values and undefined values to only update provided fields
    const cleanData = Object.fromEntries(
      Object.entries(updateData).filter(
        ([_, value]) => value !== null && value !== undefined,
      ),
    );

    // Update the playlist
    const updatedPlaylist = await this.prisma.playlist.update({
      where: { id: playlistId },
      data: {
        ...cleanData,
        updatedAt: new Date(),
      },
      include: {
        tracks: {
          orderBy: { addedAt: 'asc' },
        },
      },
    });

    return updatedPlaylist as any;
  }

  async deletePlaylist(playlistId: string, userId: string): Promise<void> {
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

    // Delete all playlist tracks first (due to foreign key constraints)
    await this.prisma.playlistTrack.deleteMany({
      where: { playlistId },
    });

    // Delete the playlist
    await this.prisma.playlist.delete({
      where: { id: playlistId },
    });
  }

  async removeTrackFromPlaylist(
    playlistId: string,
    trackId: string,
    userId: string,
  ): Promise<void> {
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

    // Find and delete the specific track from the playlist
    const playlistTrack = await this.prisma.playlistTrack.findFirst({
      where: {
        playlistId,
        trackId,
      },
    });

    if (!playlistTrack) {
      throw new Error('Track not found in playlist');
    }

    await this.prisma.playlistTrack.delete({
      where: { id: playlistTrack.id },
    });
  }
}
