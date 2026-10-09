"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, Session, SignInInput, SignUpInput, AuthResponse, GoogleOAuthConfig } from "./types";
import { authService } from "./auth-service";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (credentials: SignInInput) => Promise<AuthResponse>;
  signUp: (data: SignUpInput) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string; errorCode?: string }>;
  googleOAuthConfig: GoogleOAuthConfig;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [googleConfig, setGoogleConfig] = useState<GoogleOAuthConfig>({
    clientId: null,
    isConfigured: false,
    redirectUri: "",
    authUrl: null,
  });

  // Initialize session from storage on mount
  useEffect(() => {
    try {
      const stored = authService.getStoredSession();
      if (stored) {
        setSession(stored);
      }
      setGoogleConfig(authService.getGoogleOAuthConfig());
    } catch (e) {
      console.error("Error initializing auth context:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(async (credentials: SignInInput): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.signInWithEmail(credentials);
      if (response.success && response.session) {
        setSession(response.session);
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (data: SignUpInput): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.signUpWithEmail(data);
      if (response.success && response.session) {
        setSession(response.session);
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestPasswordReset = useCallback(
    async (email: string) => {
      return await authService.requestPasswordReset(email);
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        session,
        isLoading,
        isAuthenticated: !!session?.token,
        signIn,
        signUp,
        signOut,
        requestPasswordReset,
        googleOAuthConfig: googleConfig,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
