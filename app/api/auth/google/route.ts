import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { googleAuthorizationUrl, setOAuthStateCookie } from "@/lib/google-drive";

export const runtime = "nodejs";

export async function GET() {
  try {
    const state = randomBytes(32).toString("hex");
    const response = NextResponse.redirect(googleAuthorizationUrl(state));
    setOAuthStateCookie(response, state);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Google OAuth is not configured.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
