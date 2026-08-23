export interface UserSummary {
  userId: string;
  email: string;
  username: string;
}

export interface LoginDto {
  login: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  username: string;
  password: string;
}

export interface AuthState {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  } | null;
  token: string | null;
  isAuthenticated: boolean;
}
