import { NextRequest, NextResponse } from "next/server";
import { getDriveAccess, saveRefreshedSession } from "@/lib/google-drive";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ fileId: string }> },
) {
  try {
    const driveSession = await getDriveAccess();
    if (!driveSession) return NextResponse.json({ error: "Google Drive is not connected." }, { status: 401 });

    const { fileId } = await context.params;
    if (!/^[a-zA-Z0-9_-]+$/.test(fileId)) {
      return NextResponse.json({ error: "Invalid Drive file ID." }, { status: 400 });
    }

    const upstream = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`,
      { headers: { Authorization: `Bearer ${driveSession.accessToken}` }, cache: "no-store" },
    );

    if (!upstream.ok) {
      const detail = await upstream.text();
      const response = NextResponse.json(
        { error: upstream.status === 403 ? "Google Drive cannot access this file. Check its sharing permissions." : "Could not load this Drive media file.", detail },
        { status: upstream.status === 401 || upstream.status === 403 ? upstream.status : 502 },
      );
      saveRefreshedSession(response, driveSession.refreshedSession);
      return response;
    }

    const headers = new Headers();
    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    headers.set("Content-Type", contentType);
    headers.set("Cache-Control", "private, max-age=300");
    const length = upstream.headers.get("content-length");
    if (length) headers.set("Content-Length", length);
    const response = new NextResponse(upstream.body, { status: 200, headers });
    saveRefreshedSession(response, driveSession.refreshedSession);
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to stream Drive media." }, { status: 500 });
  }
}
