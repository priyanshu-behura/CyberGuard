export const AUTH_COOKIE_NAME = "cyberguard_session";
export const AUTH_STORAGE_KEY = "cyberguard_auth_session";
export const AUTH_REDIRECT_COOKIE = "cyberguard_redirect";

export const PROTECTED_ROUTES = [
  "/dashboard",
  "/admin",
  "/analyze",
  "/identity",
  "/monitor",
  "/attack-chains",
  "/incidents",
  "/response",
  "/ai",
  "/advanced",
  "/settings",
] as const;

export const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
] as const;

export const DEFAULT_LOGIN_REDIRECT = "/dashboard";
export const DEFAULT_LOGOUT_REDIRECT = "/login";
