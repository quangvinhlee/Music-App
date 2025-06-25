export interface CacheItem<T> {
  data: T;
  expires: number;
}

export interface TranscodingInfo {
  url?: string;
  format?: { protocol?: string };
}

export interface TrackData {
  id?: string | number;
  track_id?: string | number;
  title?: string;
  genre?: string;
  artwork_url?: string;
  duration?: number;
  streamUrl?: string;
  playback_count?: number;
  track_count?: number;
  media?: {
    transcodings?: TranscodingInfo[];
  };
  user?: {
    id?: string | number;
    username?: string;
    avatar_url?: string;
    followers_count?: number;
    verified?: boolean;
    city?: string;
    country_code?: string;
  };
  publisher_metadata?: {
    artist?: string;
  };
}

export interface ProcessedArtist {
  id: string;
  username: string;
  avatarUrl: string;
  verified: boolean;
  city?: string;
  countryCode?: string;
}

export interface ProcessedTrack {
  id: string;
  title: string;
  artist: ProcessedArtist;
  genre: string;
  artwork: string;
  duration: number;
  streamUrl?: string;
  playbackCount: number;
}

export interface ProcessedAlbum {
  id: string;
  title: string;
  artist: ProcessedArtist;
  genre: string;
  artwork: string;
  duration: number;
  trackCount: number;
}

export interface SoundCloudApiResponse<T> {
  collection?: T[];
  next_href?: string;
}
