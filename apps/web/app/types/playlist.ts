// Playlist-related types for the web app
import { Artist } from "./music";

export interface Track {
  id: string;
  title: string;
  description?: string;
  artwork?: string;
  duration: number;
  genre?: string;
  streamUrl: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Playlist {
  title: string;
  duration: any;
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  artwork?: string;
  genre?: string;
  userId: string;
  artist?: Artist | null;
  tracks: PlaylistTrack[];
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistTrack {
  id: string;
  trackId: string;
  title?: string;
  artistId?: string;
  artwork?: string;
  duration?: number;
  genre?: string;
  addedAt: string;
  playlistId: string;
  artist?: Artist | null;
  Track?: Track | null;
  streamUrl?: string;
}

export interface CreatePlaylistInput {
  name: string;
  description?: string;
  isPublic?: boolean;
  genre?: string;
}

export interface CreatePlaylistTrackInput {
  trackId: string;
  title?: string;
  artistId?: string;
  artwork?: string;
  duration?: number;
  genre?: string;
}

export interface UpdatePlaylistInput {
  name?: string;
  description?: string;
  isPublic?: boolean;
  genre?: string;
}

export interface PlaylistResponse {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  genre?: string;
  userId: string;
  artist?: Artist | null;
  tracks: PlaylistTrack[];
  createdAt: string;
  updatedAt: string;
}
