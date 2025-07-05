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
  created_at?: string; // Raw data from SoundCloud API
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

export interface ArtistData {
  id: string;
  username: string;
  avatarUrl: string;
  verified: boolean;
  city?: string;
  countryCode?: string;
  followersCount?: number;
}

export interface MusicItemData {
  id: string;
  title: string;
  artist: ArtistData;
  genre: string;
  artwork: string;
  duration: number;
  streamUrl?: string;
  playbackCount?: number;
  trackCount?: number;
  createdAt?: string;
}

export interface SoundCloudApiResponse<T> {
  collection?: T[];
  next_href?: string;
}
