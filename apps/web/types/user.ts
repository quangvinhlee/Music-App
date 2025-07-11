import { Playlist } from "./playlist";

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  role: string;
  isVerified: boolean;
  isOurUser: boolean;
  googleId?: string;
  playlists?: Playlist[];
  recentPlayed?: any[]; // Using any[] for now, can be typed more specifically later
}
