// Playlist-related types for the web app
import { Artist } from "./music";

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  genre?: string;
  userId: string;
  tracks: PlaylistTrack[];
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistTrack {
  id: string;
  trackId: string;
  title: string;
  artistId: string;
  artwork?: string;
  duration: number;
  genre?: string;
  trackType: "soundcloud" | "internal";
  addedAt: string;
  playlistId: string;
  internalTrackId?: string;
}

export interface CreatePlaylistInput {
  name: string;
  description?: string;
  isPublic?: boolean;
  genre?: string;
}

export interface CreatePlaylistTrackInput {
  soundcloudTrackId?: string;
  internalTrackId?: string;
  title: string;
  artistId: string;
  artwork?: string;
  duration: number;
  genre?: string;
}

export interface PlaylistResponse {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  genre?: string;
  userId: string;
  tracks: PlaylistTrack[];
  createdAt: string;
  updatedAt: string;
}
