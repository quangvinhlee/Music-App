// Unified music types for the entire web app
// These types should match the backend GraphQL schema

export interface Artist {
  id: string;
  username: string;
  avatarUrl: string;
  verified: boolean;
  city?: string;
  countryCode?: string;
  followersCount?: number;
}

export interface MusicItem {
  id: string;
  title: string;
  artist: Artist;
  genre: string;
  description?: string;
  artwork: string;
  duration: number;
  streamUrl?: string;
  playbackCount?: number;
  trackCount?: number;
  createdAt?: string;
  tracks?: MusicItem[];
}

// Track upload and management types
export interface CreateTrackInput {
  title: string;
  description?: string;
  audioData: string; // Base64 encoded audio file
  artworkData?: string; // Base64 encoded artwork image
  duration: number;
  genre?: string;
}

export interface UpdateTrackInput {
  title?: string;
  description?: string;
  artworkData?: string; // Base64 encoded artwork image
  genre?: string;
}

export interface TrackUploadFormData {
  title: string;
  description: string;
  genre: string;
  duration: number;
}

export interface TrackEditFormData {
  title: string;
  description: string;
  genre: string;
}

// Extended types for specific use cases
export interface RecentPlayedSong {
  id: string;
  trackId: string;
  title: string;
  artist: Artist; // Always an object now
  artwork: string;
  duration: number;
  playedAt: string;
  createdAt?: string;
  userId: string;
  genre?: string;
}
// API Response types
export interface SearchTracksResponse {
  tracks: MusicItem[];
  nextHref?: string;
}

export interface SearchUsersResponse {
  users: Artist[];
  nextHref?: string;
}

export interface SearchAlbumsResponse {
  albums: MusicItem[];
  nextHref?: string;
}

export interface FetchGlobalTrendingSongsResponse {
  tracks: MusicItem[];
  nextHref?: string;
}

export interface FetchRelatedSongsResponse {
  tracks: MusicItem[];
}

export interface FetchTrendingPlaylistSongsResponse {
  tracks: MusicItem[];
}

export interface FetchRecommendedArtistsResponse {
  artists: Artist[];
}

export interface FetchTrendingSongPlaylistsResponse {
  id: string;
  title: string;
  genre: string;
  artwork: string;
}

export interface FetchTrendingSongResponse {
  id: string;
  username: string;
}

export interface FetchArtistInfoResponse {
  artist: Artist;
}

export interface StreamUrlResponse {
  streamUrl: string;
}

export interface DeletePlaylistResponse {
  success: boolean;
  message?: string;
}

// Legacy type aliases for backward compatibility
export type GlobalTrendingSong = MusicItem;
export type TrendingIdData = { id: string };
