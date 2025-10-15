export interface User {
  id: string;
  discordId: string;
  username: string;
  discriminator: string;
  avatar: string;
  role: UserRole;
  preferredServerId?: number; // ID of the user's preferred server
  createdAt: string;
}

export type UserRole = "user" | "moderator" | "admin";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
