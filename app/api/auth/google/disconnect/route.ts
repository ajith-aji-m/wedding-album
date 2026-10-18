import { NextResponse } from "next/server";
import { clearDriveSessionCookie } from "@/lib/google-drive";

export async function POST() {
  const response = NextResponse.json({ disconnected: true });
  clearDriveSessionCookie(response);
  return response;
}
