import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import {
  CreateRecentPlayedDto,
  CreatePlaylistDto,
  CreatePlaylistTrackDto,
  CreateTrackDto,
  UpdateTrackDto,
} from './dto/interact.dto';
import {
  RecentPlayed,
  Playlist,
  PlaylistTrack,
} from './entities/interact.entities';
import { MusicItem } from 'src/shared/entities/artist.entity';
import { toMusicItem } from 'src/shared/entities/artist.entity';
import { CloudinaryService } from 'src/shared/services/cloudinary.service';
import { User } from 'src/shared/entities/user.entity';

@Injectable()
export class InteractService {
  private readonly MAX_RECENT_PLAYED = 20; // Configurable limit

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private isMongoObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

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

  async createTrack(
    createTrackDto: CreateTrackDto,
    userId: string,
  ): Promise<MusicItem> {
    try {
      // Upload audio file to Cloudinary
      const audioUrl = await this.cloudinaryService.uploadAudioFromBase64(
        createTrackDto.audioData,
        `${userId}_${Date.now()}.mp3`,
      );

      // Upload artwork if provided
      let artworkUrl: string | null = null;
      if (createTrackDto.artworkData) {
        artworkUrl = await this.cloudinaryService.uploadBase64Image(
          createTrackDto.artworkData,
        );
      }

      // Create track in database
      const track = await this.prisma.track.create({
        data: {
          title: createTrackDto.title,
          description: createTrackDto.description,
          artwork: artworkUrl,
          duration: createTrackDto.duration,
          genre: createTrackDto.genre,
          streamUrl: audioUrl,
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

      // Convert to MusicItem format
      return toMusicItem(track);
    } catch (error) {
      // If track creation fails, clean up uploaded files
      if (error.message.includes('Failed to upload audio')) {
        throw new Error(`Failed to upload audio: ${error.message}`);
      }
      throw new Error(`Failed to create track: ${error.message}`);
    }
  }

  async updateTrack(
    trackId: string,
    updateTrackDto: UpdateTrackDto,
    userId: string,
  ): Promise<MusicItem> {
    // Verify the track belongs to the user
    const existingTrack = await this.prisma.track.findFirst({
      where: {
        id: trackId,
        userId,
      },
    });

    if (!existingTrack) {
      throw new Error('Track not found or access denied');
    }

    const updateData: any = {};

    // Update basic fields
    if (updateTrackDto.title !== undefined) {
      updateData.title = updateTrackDto.title;
    }
    if (updateTrackDto.description !== undefined) {
      updateData.description = updateTrackDto.description;
    }
    if (updateTrackDto.genre !== undefined) {
      updateData.genre = updateTrackDto.genre;
    }

    // Handle artwork update
    if (updateTrackDto.artworkData !== undefined) {
      let artworkUrl: string | null = null;

      if (updateTrackDto.artworkData) {
        // Upload new artwork
        artworkUrl = await this.cloudinaryService.uploadBase64Image(
          updateTrackDto.artworkData,
        );

        // Delete old artwork if it exists
        if (existingTrack.artwork) {
          try {
            await this.cloudinaryService.deleteImageByUrl(
              existingTrack.artwork,
            );
          } catch (error) {
            console.error('Failed to delete old artwork:', error);
          }
        }
      } else {
        // Delete existing artwork
        if (existingTrack.artwork) {
          try {
            await this.cloudinaryService.deleteImageByUrl(
              existingTrack.artwork,
            );
          } catch (error) {
            console.error('Failed to delete artwork:', error);
          }
        }
      }

      updateData.artwork = artworkUrl;
    }

    const updatedTrack = await this.prisma.track.update({
      where: { id: trackId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    // Convert to MusicItem format
    return toMusicItem(updatedTrack);
  }

  async deleteTrack(trackId: string, userId: string): Promise<void> {
    // Verify the track belongs to the user
    const track = await this.prisma.track.findFirst({
      where: {
        id: trackId,
        userId,
      },
    });

    if (!track) {
      throw new Error('Track not found or access denied');
    }

    // Delete files from Cloudinary
    const deletePromises: Promise<void>[] = [];

    // Delete audio file
    deletePromises.push(
      this.cloudinaryService
        .deleteAudioByUrl(track.streamUrl)
        .catch((error) => {
          console.error('Failed to delete audio from Cloudinary:', error);
        }),
    );

    // Delete artwork if it exists
    if (track.artwork && track.artwork.trim() !== '') {
      deletePromises.push(
        this.cloudinaryService
          .deleteImageByUrl(track.artwork)
          .catch((error) => {
            console.error('Failed to delete artwork from Cloudinary:', error);
          }),
      );
    }

    // Wait for all deletions to complete (but don't fail if they don't)
    await Promise.allSettled(deletePromises);

    // Delete track from database
    await this.prisma.track.delete({
      where: { id: trackId },
    });
  }

  async getTrack(trackId: string): Promise<MusicItem | null> {
    const track = await this.prisma.track.findUnique({
      where: { id: trackId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    if (!track) return null;

    return toMusicItem(track);
  }

  async getAllTracks(
    limit: number = 50,
    offset: number = 0,
  ): Promise<MusicItem[]> {
    const tracks = await this.prisma.track.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return tracks.map((track) => toMusicItem(track)) as MusicItem[];
  }

  async searchTracks(query: string, limit: number = 20): Promise<MusicItem[]> {
    const tracks = await this.prisma.track.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { genre: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return tracks.map((track) => toMusicItem(track)) as MusicItem[];
  }

  async likeTrack(trackId: string, userId: string): Promise<void> {
    // First, check if the track exists in the internal tracks collection
    let internalTrack: any = null;
    if (this.isMongoObjectId(trackId)) {
      internalTrack = await this.prisma.track.findUnique({
        where: { id: trackId },
      });
    }

    // Check if already liked (for both internal and SoundCloud tracks)
    const existingLike = await this.prisma.like.findUnique({
      where: {
        userId_trackId: {
          userId,
          trackId,
        },
      },
    });

    if (existingLike) {
      throw new Error('Track already liked');
    }

    // Create like
    await this.prisma.like.create({
      data: {
        userId,
        trackId,
      },
    });
  }

  async unlikeTrack(trackId: string, userId: string): Promise<void> {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_trackId: {
          userId,
          trackId,
        },
      },
    });

    if (!like) {
      throw new Error('Track not liked');
    }

    await this.prisma.like.delete({
      where: { id: like.id },
    });
  }

  async isTrackLiked(trackId: string, userId: string): Promise<boolean> {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_trackId: {
          userId,
          trackId,
        },
      },
    });

    return !!like;
  }

  // --- FOLLOW SYSTEM ---
  async followUser(followerId: string, followingId: string): Promise<void> {
    console.log('followerId', followerId);
    console.log('followingId', followingId);

    if (followerId === followingId) throw new Error('Cannot follow yourself');
    // Check if already following
    const existing = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    if (existing) throw new Error('Already following');
    await this.prisma.follow.create({
      data: { followerId, followingId },
    });
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    const follow = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    if (!follow) throw new Error('Not following');
    await this.prisma.follow.delete({
      where: { id: follow.id },
    });
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    return !!follow;
  }

  async getFollowers(userId: string): Promise<User[]> {
    const followers = await this.prisma.follow.findMany({
      where: { followingId: userId },
      include: { follower: true },
    });
    return followers.map((f) => f.follower as User);
  }

  async getFollowing(userId: string): Promise<User[]> {
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      include: { following: true },
    });
    return following.map((f) => f.following as User);
  }
}
