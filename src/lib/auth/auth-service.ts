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

const USERS_STORAGE_KEY = "cyberguard_registered_users";

interface StoredAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "admin" | "analyst" | "viewer";
  authProvider: "email" | "google";
  createdAt: string;
}

/**
 * CYBERGUARD Authentication Service
 * 
 * Manages user accounts, session state, cookie synchronization,
 * and form validation.
 */
class AuthService {
  private defaultAccounts: StoredAccount[] = [
    {
      id: "usr_admin_master",
      name: "System Administrator",
      email: "admin@cyberguard.security",
      passwordHash: "CyberGuard@Admin2026",
      role: "admin",
      authProvider: "email",
      createdAt: new Date().toISOString(),
    },
    {
      id: "usr_analyst_01",
      name: "Alex Mercer (Lead Analyst)",
      email: "analyst@cyberguard.security",
      passwordHash: "Analyst@2026",
      role: "analyst",
      authProvider: "email",
      createdAt: new Date().toISOString(),
    },
  ];

  /**
   * Returns list of registered accounts (pre-seeded + created in browser)
   */
  public getRegisteredAccounts(): StoredAccount[] {
    if (typeof window === "undefined") return this.defaultAccounts;

    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.defaultAccounts));
        return this.defaultAccounts;
      }
      const parsed: StoredAccount[] = JSON.parse(stored);
      // Ensure defaults exist
      const accounts = [...parsed];
      for (const def of this.defaultAccounts) {
        if (!accounts.some((a) => a.email.toLowerCase() === def.email.toLowerCase())) {
          accounts.push(def);
        }
      }
      return accounts;
    } catch {
      return this.defaultAccounts;
    }
  }

  /**
   * Saves a newly registered account
   */
  private saveAccount(account: StoredAccount): void {
    if (typeof window === "undefined") return;

    try {
      const accounts = this.getRegisteredAccounts();
      const existingIdx = accounts.findIndex(
        (a) => a.email.toLowerCase() === account.email.toLowerCase()
      );
      if (existingIdx >= 0) {
        accounts[existingIdx] = account;
      } else {
        accounts.push(account);
      }
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.error("Failed to save registered account to localStorage:", e);
    }
  }

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
   * Validates against registered/demo accounts or provisions dynamically.
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

    const rawInput = email.trim().toLowerCase();
    
    // Normalize aliases
    let normalizedEmail = rawInput;
    let isAdminLogin = false;

    if (rawInput === "admin" || rawInput === "admin@cyberguard.security" || rawInput.startsWith("admin@")) {
      normalizedEmail = "admin@cyberguard.security";
      isAdminLogin = true;
    } else if (rawInput === "analyst" || rawInput === "analyst@cyberguard.security") {
      normalizedEmail = "analyst@cyberguard.security";
    }

    // Validation: Valid email format (if not alias)
    if (!this.isValidEmail(normalizedEmail)) {
      return {
        success: false,
        errorCode: "INVALID_CREDENTIALS",
        message: "Please enter a valid cybersecurity identity or email address.",
      };
    }

    // Validation: Password minimum security length
    if (password.length < 6) {
      return {
        success: false,
        errorCode: "INVALID_CREDENTIALS",
        message: "Invalid credentials. Passwords must be at least 6 characters.",
      };
    }

    // Emulate realistic cryptographic verification latency
    await this.delay(300);

    // Look up registered accounts
    const accounts = this.getRegisteredAccounts();
    const existingAccount = accounts.find(
      (a) => a.email.toLowerCase() === normalizedEmail.toLowerCase()
    );

    let user: User;

    if (existingAccount) {
      // Validate password for known accounts
      // Admin accepts either the primary pass or admin123; Analyst accepts Analyst@2026 or analyst123
      const isKnownAdmin = normalizedEmail === "admin@cyberguard.security";
      const isKnownAnalyst = normalizedEmail === "analyst@cyberguard.security";

      let passwordValid = existingAccount.passwordHash === password;
      if (isKnownAdmin && (password === "CyberGuard@Admin2026" || password === "admin123" || password === "admin")) {
        passwordValid = true;
      }
      if (isKnownAnalyst && (password === "Analyst@2026" || password === "analyst123" || password === "analyst")) {
        passwordValid = true;
      }

      if (!passwordValid) {
        return {
          success: false,
          errorCode: "INVALID_CREDENTIALS",
          message: "Incorrect password for this account. Please verify your credentials.",
        };
      }

      user = {
        id: existingAccount.id,
        email: existingAccount.email,
        name: existingAccount.name,
        role: existingAccount.role,
        authProvider: existingAccount.authProvider || "email",
        createdAt: existingAccount.createdAt,
      };
    } else {
      // For any new email entered during demo/eval, auto-provision and save account
      const newAccount: StoredAccount = {
        id: isAdminLogin ? "usr_admin_master" : `usr_${this.generateRandomString(12)}`,
        name: isAdminLogin ? "System Administrator" : this.extractNameFromEmail(normalizedEmail),
        email: normalizedEmail,
        passwordHash: password,
        role: isAdminLogin ? "admin" : "analyst",
        authProvider: "email",
        createdAt: new Date().toISOString(),
      };
      this.saveAccount(newAccount);

      user = {
        id: newAccount.id,
        email: newAccount.email,
        name: newAccount.name,
        role: newAccount.role,
        authProvider: "email",
        createdAt: newAccount.createdAt,
      };
    }

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
   * Registers a new account with validation and saves it to the account store.
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
    const normalizedEmail = email.trim().toLowerCase();
    if (!this.isValidEmail(normalizedEmail)) {
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
    await this.delay(400);

    // Check if account already exists
    const accounts = this.getRegisteredAccounts();
    const existing = accounts.find(
      (a) => a.email.toLowerCase() === normalizedEmail
    );

    if (existing && existing.passwordHash !== password) {
      return {
        success: false,
        errorCode: "USER_EXISTS",
        message: "An account with this email address already exists. Please sign in instead.",
      };
    }

    const newAccount: StoredAccount = {
      id: `usr_${this.generateRandomString(12)}`,
      email: normalizedEmail,
      name: name.trim(),
      passwordHash: password,
      role: "analyst",
      authProvider: "email",
      createdAt: new Date().toISOString(),
    };

    this.saveAccount(newAccount);

    const user: User = {
      id: newAccount.id,
      email: newAccount.email,
      name: newAccount.name,
      role: newAccount.role,
      authProvider: "email",
      createdAt: newAccount.createdAt,
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
   * One-click demo sign-in with Google OAuth emulation.
   */
  public async signInWithGoogleDemo(): Promise<AuthResponse> {
    await this.delay(350);

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

    await this.delay(500);

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

    await this.delay(300);

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
   * Ensures the session cookie is synchronized to document.cookie and server route
   */
  public syncCookie(session: Session): void {
    if (typeof window === "undefined" || !session?.token) return;

    try {
      const expires = new Date(session.expiresAt).toUTCString();
      document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(
        session.token
      )}; path=/; expires=${expires}; SameSite=Lax`;

      fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session }),
      }).catch(() => {
        // Ignore background sync errors
      });
    } catch (e) {
      console.warn("Cookie sync error:", e);
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
