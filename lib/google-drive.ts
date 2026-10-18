import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const STATE_COOKIE = "wedding_oauth_state";
const SESSION_COOKIE = "wedding_drive_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.readonly";

type DriveSession = {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
};

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function getGoogleConfig() {
  return {
    clientId: requiredEnv("GOOGLE_CLIENT_ID"),
    clientSecret: requiredEnv("GOOGLE_CLIENT_SECRET"),
    redirectUri: requiredEnv("GOOGLE_REDIRECT_URI"),
  };
}

function encryptionKey(): Buffer {
  return createHash("sha256").update(requiredEnv("APP_SECRET")).digest();
}

function seal(value: unknown): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
}

function unseal<T>(value: string): T {
  const data = Buffer.from(value, "base64url");
  if (data.length < 29) throw new Error("Invalid encrypted session");
  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28);
  const encrypted = data.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), iv);
  decipher.setAuthTag(tag);
  return JSON.parse(Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8")) as T;
}

export function setOAuthStateCookie(response: NextResponse, state: string) {
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
    path: "/", maxAge: 10 * 60,
  });
}

export async function consumeOAuthStateCookie(): Promise<string | undefined> {
  const jar = await cookies();
  const state = jar.get(STATE_COOKIE)?.value;
  return state;
}

export function clearOAuthStateCookie(response: NextResponse) {
  response.cookies.set(STATE_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
}

export function setDriveSessionCookie(response: NextResponse, session: DriveSession) {
  response.cookies.set(SESSION_COOKIE, seal(session), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
    path: "/", maxAge: COOKIE_MAX_AGE,
  });
}

export function clearDriveSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
}

async function readSession(): Promise<DriveSession | null> {
  const jar = await cookies();
  const value = jar.get(SESSION_COOKIE)?.value;
  if (!value) return null;
  try { return unseal<DriveSession>(value); } catch { return null; }
}

async function refreshAccessToken(session: DriveSession): Promise<DriveSession> {
  if (session.expiresAt > Date.now() + 60_000) return session;
  if (!session.refreshToken) throw new Error("Google session expired. Connect Google Drive again.");
  const config = getGoogleConfig();
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: session.refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });
  const body = await response.json();
  if (!response.ok || !body.access_token) throw new Error("Google token refresh failed. Reconnect Google Drive.");
  return { ...session, accessToken: body.access_token, expiresAt: Date.now() + Number(body.expires_in ?? 3600) * 1000 };
}

export async function getDriveAccessToken(): Promise<string | null> {
  const session = await readSession();
  if (!session) return null;
  const refreshed = await refreshAccessToken(session);
  if (refreshed !== session) {
    // Route handlers persist refreshed sessions via saveRefreshedSession.
    pendingRefreshedSession = refreshed;
  }
  return refreshed.accessToken;
}

let pendingRefreshedSession: DriveSession | null = null;

export function saveRefreshedSession(response: NextResponse) {
  if (pendingRefreshedSession) {
    setDriveSessionCookie(response, pendingRefreshedSession);
    pendingRefreshedSession = null;
  }
}

export async function exchangeCode(code: string): Promise<DriveSession> {
  const config = getGoogleConfig();
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code, client_id: config.clientId, client_secret: config.clientSecret,
      redirect_uri: config.redirectUri, grant_type: "authorization_code",
    }),
    cache: "no-store",
  });
  const body = await response.json();
  if (!response.ok || !body.access_token) throw new Error("Google OAuth token exchange failed.");
  return {
    accessToken: body.access_token,
    refreshToken: body.refresh_token,
    expiresAt: Date.now() + Number(body.expires_in ?? 3600) * 1000,
  };
}

export function googleAuthorizationUrl(state: string): string {
  const config = getGoogleConfig();
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: DRIVE_SCOPE,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
