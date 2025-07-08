// Playlist-related types for the web app
import { Artist } from "./music";

export interface Playlist {
  id: string;
  title: string;
  artwork: string;
  genre?: string;
  owner?: string;
}

export interface PlaylistTrack {
  id: string;
  trackId: string;
  title: string;
  artist: Artist;
  artwork?: string;
  duration: number;
  genre?: string;
  addedAt: string;
}

export interface PlaylistResponse {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  userId: string;
  tracks: PlaylistTrack[];
  createdAt: string;
  updatedAt: string;
}
