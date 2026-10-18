import { NextResponse } from "next/server";
import { getDriveAccess, saveRefreshedSession } from "@/lib/google-drive";

export const runtime = "nodejs";

export async function GET() {
  try {
    const driveSession = await getDriveAccess();
    if (!driveSession) return NextResponse.json({ error: "Google Drive is not connected.", connectUrl: "/api/auth/google" }, { status: 401 });
    const params = new URLSearchParams({
      q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false",
      pageSize: "100",
      orderBy: "name",
      fields: "files(id,name,mimeType,webViewLink)",
    });
    const upstream = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
      headers: { Authorization: `Bearer ${driveSession.accessToken}` }, cache: "no-store",
    });
    const data = await upstream.json();
    if (!upstream.ok) return NextResponse.json({ error: "Could not load Google Drive folders." }, { status: 502 });
    const response = NextResponse.json({ folders: data.files ?? [] });
    saveRefreshedSession(response, driveSession.refreshedSession);
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load folders." }, { status: 500 });
  }
}
