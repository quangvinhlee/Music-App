import { Playlist } from "./playlist";
import { Track } from "./playlist";

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  role: string;
  isVerified: boolean;
  isOurUser: boolean;
  googleId?: string;
  tracks?: Track[];
  playlists?: Playlist[];
  recentPlayed?: any[]; // Using any[] for now, can be typed more specifically later
}
