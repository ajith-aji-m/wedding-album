import { NextRequest, NextResponse } from "next/server";
import {
  clearOAuthStateCookie,
  exchangeCode,
  setDriveSessionCookie,
  consumeOAuthStateCookie,
} from "@/lib/google-drive";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const returnedState = searchParams.get("state");
  const oauthError = searchParams.get("error");
  const savedState = await consumeOAuthStateCookie();

  if (oauthError) return NextResponse.redirect(new URL(`/?drive_error=${encodeURIComponent(oauthError)}`, origin));
  if (!code || !returnedState || !savedState || returnedState !== savedState) {
    return NextResponse.json({ error: "Invalid or expired OAuth state. Please try connecting Google Drive again." }, { status: 400 });
  }

  try {
    const session = await exchangeCode(code);
    const response = NextResponse.redirect(new URL("/?drive=connected", origin));
    setDriveSessionCookie(response, session);
    clearOAuthStateCookie(response);
    return response;
  } catch {
    const response = NextResponse.redirect(new URL("/?drive_error=oauth_failed", origin));
    clearOAuthStateCookie(response);
    return response;
  }
}
