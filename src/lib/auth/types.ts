export interface User {
  id: string;
  email: string;
  name: string;
  role: "analyst" | "admin" | "viewer";
  authProvider: "email" | "google";
  avatarUrl?: string;
  createdAt: string;
}

export interface Session {
  token: string;
  user: User;
  expiresAt: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  session?: Session;
  errorCode?: "INVALID_CREDENTIALS" | "MISSING_FIELDS" | "USER_EXISTS" | "PASSWORDS_MISMATCH" | "WEAK_PASSWORD" | "OAUTH_UNCONFIGURED" | "SERVER_ERROR";
}

export interface GoogleOAuthConfig {
  clientId: string | null;
  isConfigured: boolean;
  redirectUri: string;
  authUrl: string | null;
}
