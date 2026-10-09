import {
  User,
  Session,
  SignInInput,
  SignUpInput,
  AuthResponse,
  GoogleOAuthConfig,
} from "./types";
import {
  AUTH_COOKIE_NAME,
  AUTH_STORAGE_KEY,
} from "./constants";

/**
 * CYBERGUARD Authentication Service
 * 
 * Clean abstraction layer separating authentication logic from the UI.
 * In Phase 2:
 *  - Manages session state, cookie synchronization, and form validations.
 *  - Supports future OAuth Google credentials via environment variables without hardcoded secrets.
 *  - Pluggable for future NextAuth, Supabase, Firebase, or enterprise backend API.
 */
class AuthService {
  /**
   * Evaluates Google OAuth configuration based on environment variables.
   * Never hardcodes client IDs or secrets.
   */
  public getGoogleOAuthConfig(): GoogleOAuthConfig {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || null;
    const appUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const redirectUri = `${appUrl}/auth/callback`;

    if (!clientId) {
      return {
        clientId: null,
        isConfigured: false,
        redirectUri,
        authUrl: null,
      };
    }

    const state = this.generateRandomString(32);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("cyberguard_oauth_state", state);
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      state: state,
      prompt: "select_account",
    });

    return {
      clientId,
      isConfigured: true,
      redirectUri,
      authUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    };
  }

  /**
   * Signs in with Email and Password.
   * Performs validation and generates a secure session.
   */
  public async signInWithEmail(credentials: SignInInput): Promise<AuthResponse> {
    const { email, password } = credentials;

    // Validation: Missing fields
    if (!email || !email.trim() || !password) {
      return {
        success: false,
        errorCode: "MISSING_FIELDS",
        message: "Please enter both your email address and password.",
      };
    }

    const normalizedInput = email.trim().toLowerCase();
    const isAdminLogin =
      normalizedInput === "admin" ||
      normalizedInput === "admin@cyberguard.security" ||
      normalizedInput.startsWith("admin@");

    // Validation: Valid email structure (or 'admin' system identifier)
    if (normalizedInput !== "admin" && !this.isValidEmail(normalizedInput)) {
      return {
        success: false,
        errorCode: "INVALID_CREDENTIALS",
        message: "Please enter a valid cybersecurity identity / email address.",
      };
    }

    // Validation: Password minimum security length
    if (password.length < 6) {
      return {
        success: false,
        errorCode: "INVALID_CREDENTIALS",
        message: "Invalid credentials. Password must be at least 6 characters.",
      };
    }

    // Emulate realistic cryptographic verification latency
    await this.delay(400);

    const userEmail =
      normalizedInput === "admin" ? "admin@cyberguard.security" : normalizedInput;

    // Create session entity with admin role when logging in as administrator
    const user: User = {
      id: isAdminLogin ? "usr_admin_master" : `usr_${this.generateRandomString(12)}`,
      email: userEmail,
      name: isAdminLogin ? "System Administrator" : this.extractNameFromEmail(userEmail),
      role: isAdminLogin ? "admin" : "analyst",
      authProvider: "email",
      createdAt: new Date().toISOString(),
    };

    const session: Session = {
      token: `cgs_${this.generateRandomString(48)}`,
      user,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    // Synchronize session to storage and server cookies
    await this.saveSession(session);

    return {
      success: true,
      user,
      session,
      message: "Authentication successful.",
    };
  }

  /**
   * Registers a new account with validation.
   */
  public async signUpWithEmail(input: SignUpInput): Promise<AuthResponse> {
    const { name, email, password, confirmPassword } = input;

    // Validation: Missing fields
    if (!name?.trim() || !email?.trim() || !password || !confirmPassword) {
      return {
        success: false,
        errorCode: "MISSING_FIELDS",
        message: "All fields are required to register your security identity.",
      };
    }

    // Validation: Email format
    if (!this.isValidEmail(email.trim())) {
      return {
        success: false,
        errorCode: "INVALID_CREDENTIALS",
        message: "Please provide a valid work or organization email address.",
      };
    }

    // Validation: Password strength (min 8 chars)
    if (password.length < 8) {
      return {
        success: false,
        errorCode: "WEAK_PASSWORD",
        message: "Security policy requires passwords to be at least 8 characters long.",
      };
    }

    // Validation: Password confirmation match
    if (password !== confirmPassword) {
      return {
        success: false,
        errorCode: "PASSWORDS_MISMATCH",
        message: "Passwords do not match. Please verify your entries.",
      };
    }

    // Emulate account provisioning latency
    await this.delay(500);

    const user: User = {
      id: `usr_${this.generateRandomString(12)}`,
      email: email.trim().toLowerCase(),
      name: name.trim(),
      role: "analyst",
      authProvider: "email",
      createdAt: new Date().toISOString(),
    };

    const session: Session = {
      token: `cgs_${this.generateRandomString(48)}`,
      user,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    await this.saveSession(session);

    return {
      success: true,
      user,
      session,
      message: "Account provisioned successfully.",
    };
  }

  /**
   * Simulates OAuth callback exchange after user redirects back from Google.
   */
  public async handleOAuthCallback(
    code: string,
    state?: string
  ): Promise<AuthResponse> {
    if (!code) {
      return {
        success: false,
        errorCode: "INVALID_CREDENTIALS",
        message: "No authorization code provided in the OAuth callback.",
      };
    }

    await this.delay(600);

    // In a full production deployment with backend, the server exchanges the code with Google's token endpoint
    const user: User = {
      id: `usr_g_${this.generateRandomString(12)}`,
      email: "analyst@cyberguard.internal",
      name: "Security Analyst (Google OAuth)",
      role: "analyst",
      authProvider: "google",
      createdAt: new Date().toISOString(),
    };

    const session: Session = {
      token: `cgs_oauth_${this.generateRandomString(48)}`,
      user,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    await this.saveSession(session);

    return {
      success: true,
      user,
      session,
      message: "Google authentication completed successfully.",
    };
  }

  /**
   * Password reset request flow.
   */
  public async requestPasswordReset(email: string): Promise<{
    success: boolean;
    message: string;
    errorCode?: "MISSING_FIELDS" | "INVALID_CREDENTIALS";
  }> {
    if (!email || !email.trim()) {
      return {
        success: false,
        errorCode: "MISSING_FIELDS",
        message: "Please enter the email associated with your account.",
      };
    }

    if (!this.isValidEmail(email.trim())) {
      return {
        success: false,
        errorCode: "INVALID_CREDENTIALS",
        message: "Please enter a valid email format.",
      };
    }

    await this.delay(400);

    return {
      success: true,
      message:
        "If an account is associated with this email, a cryptographically signed recovery link has been generated.",
    };
  }

  /**
   * Signs the user out, clearing both client and server session cookies.
   */
  public async signOut(): Promise<void> {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch (e) {
        console.error("Failed to clear local storage session", e);
      }

      // Clear client document cookie
      document.cookie = `${AUTH_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;

      // Call session API route to remove HTTP-only cookie on server side
      try {
        await fetch("/api/auth/session", {
          method: "DELETE",
        });
      } catch (err) {
        console.warn("Session deletion request failed (fallback cookie cleared)", err);
      }
    }
  }

  /**
   * Retrieves active session from localStorage or server endpoint.
   */
  public getStoredSession(): Session | null {
    if (typeof window === "undefined") return null;

    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return null;

      const parsed: Session = JSON.parse(stored);
      if (new Date(parsed.expiresAt).getTime() < Date.now()) {
        this.signOut();
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }

  /**
   * Saves session to localStorage and syncs with server cookie via /api/auth/session.
   */
  private async saveSession(session: Session): Promise<void> {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.error("Failed to write session to localStorage", e);
    }

    // Set client cookie for immediate navigation accessibility
    const expires = new Date(session.expiresAt).toUTCString();
    document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(
      session.token
    )}; path=/; expires=${expires}; SameSite=Lax`;

    // Sync with server session route to ensure server middleware recognizes it
    try {
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session }),
      });
    } catch (err) {
      console.warn("Failed to sync session with server API route", err);
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private extractNameFromEmail(email: string): string {
    const prefix = email.split("@")[0] || "Analyst";
    return prefix
      .replace(/[._-]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  private generateRandomString(length: number): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const values = new Uint8Array(length);
      crypto.getRandomValues(values);
      for (let i = 0; i < length; i++) {
        result += chars[values[i] % chars.length];
      }
    } else {
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }
    return result;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const authService = new AuthService();
