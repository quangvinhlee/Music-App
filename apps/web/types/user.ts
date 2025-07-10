export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  role: string;
  isVerified: boolean;
  isOurUser: boolean;
  googleId?: string;
}
