import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreatePlaylistInput,
  AddTrackToPlaylistInput,
} from './dto/playlist.dto';
import { DeletePlaylistResponse, Playlist } from './entities/playlist.entity';
import { Artist } from 'src/shared/entities/artist.entity';

@Injectable()
export class PlaylistService {
  constructor(private readonly prisma: PrismaService) {}

  private convertTrackToGraphQLType(track: any): any {
    let artistData: Artist;
    if (typeof track.artist === 'string') {
      artistData = {
        id: 'unknown',
        username: track.artist,
        avatarUrl: '/music-plate.jpg',
        verified: false,
        city: null,
        countryCode: null,
        followersCount: null,
      };
    } else if (track.artist && typeof track.artist === 'object') {
      artistData = {
        id: track.artist.id || 'unknown',
        username: track.artist.username || 'Unknown Artist',
        avatarUrl: track.artist.avatarUrl || '/music-plate.jpg',
        verified: track.artist.verified || false,
        city: track.artist.city || null,
        countryCode: track.artist.countryCode || null,
        followersCount: track.artist.followersCount || null,
      };
    } else {
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
    return { ...track, artist: artistData };
  }

  async createPlaylist(
    input: CreatePlaylistInput & { userId: string },
  ): Promise<Playlist> {
    const playlist = await this.prisma.playlist.create({
      data: {
        name: input.name,
        description: input.description ?? undefined,
        isPublic: input.isPublic ?? true,
        userId: input.userId,
      },
      include: { tracks: true },
    });
    return {
      ...playlist,
      description: playlist.description ?? undefined,
      tracks:
        playlist.tracks?.map((track) =>
          this.convertTrackToGraphQLType(track),
        ) ?? [],
    };
  }

  async addTrackToPlaylist(input: AddTrackToPlaylistInput): Promise<Playlist> {
    await this.prisma.playlistTrack.create({
      data: {
        playlistId: input.playlistId,
        trackId: input.trackId,
        title: input.title,
        artist: { ...input.artist }, // store as plain object
        artwork: input.artwork,
        duration: input.duration,
        genre: input.genre,
      },
    });
    // Return the updated playlist with tracks
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: input.playlistId },
      include: { tracks: true },
    });
    if (!playlist) throw new Error('Playlist not found');
    return {
      ...playlist,
      description: playlist.description ?? undefined,
      tracks:
        playlist.tracks?.map((track) =>
          this.convertTrackToGraphQLType(track),
        ) ?? [],
    };
  }

  async getPlaylistsByUser(userId: string): Promise<Playlist[]> {
    const playlists = await this.prisma.playlist.findMany({
      where: { userId },
      include: { tracks: true },
    });
    return playlists.map((playlist) => ({
      ...playlist,
      description: playlist.description ?? undefined,
      tracks:
        playlist.tracks?.map((track) =>
          this.convertTrackToGraphQLType(track),
        ) ?? [],
    }));
  }

  async getPlaylistById(playlistId: string): Promise<Playlist | null> {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
      include: { tracks: true },
    });
    if (!playlist) return null;
    return {
      ...playlist,
      description: playlist.description ?? undefined,
      tracks:
        playlist.tracks?.map((track) =>
          this.convertTrackToGraphQLType(track),
        ) ?? [],
    };
  }

  async updatePlaylist(
    playlistId: string,
    userId: string,
    input: any,
  ): Promise<Playlist | null> {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
    });
    if (!playlist || playlist.userId !== userId) return null;
    const updated = await this.prisma.playlist.update({
      where: { id: playlistId },
      data: {
        name: input.name ?? playlist.name,
        description: input.description ?? playlist.description,
        isPublic: input.isPublic ?? playlist.isPublic,
      },
      include: { tracks: true },
    });
    return {
      ...updated,
      description: updated.description ?? undefined,
      tracks:
        updated.tracks?.map((track) => this.convertTrackToGraphQLType(track)) ??
        [],
    };
  }

  async deletePlaylist(
    playlistId: string,
    userId: string,
  ): Promise<DeletePlaylistResponse> {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
    });
    if (!playlist || playlist.userId !== userId) {
      return {
        success: false,
        message: 'Playlist not found or not owned by user',
      };
    }
    await this.prisma.playlist.delete({ where: { id: playlistId } });
    return { success: true, message: 'Playlist deleted' };
  }

  async removeTrackFromPlaylist(
    playlistId: string,
    trackId: string,
    userId: string,
  ): Promise<Playlist | null> {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
      include: { tracks: true },
    });
    if (!playlist || playlist.userId !== userId) return null;
    await this.prisma.playlistTrack.deleteMany({
      where: { playlistId, trackId },
    });
    const updated = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
      include: { tracks: true },
    });
    if (!updated) return null;
    return {
      ...updated,
      description: updated.description ?? undefined,
      tracks:
        updated.tracks?.map((track) => this.convertTrackToGraphQLType(track)) ??
        [],
    };
  }
}
