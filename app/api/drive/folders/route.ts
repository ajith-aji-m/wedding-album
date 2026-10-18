import { NextResponse } from "next/server";
import { getDriveAccess, saveRefreshedSession } from "@/lib/google-drive";

export const runtime = "nodejs";

export async function GET() {
  try {
    const driveSession = await getDriveAccess();
    if (!driveSession) {
      return NextResponse.json(
        { error: "Google Drive session cookie was not found. Please connect Google Drive again.", code: "DRIVE_SESSION_MISSING" },
        { status: 401 },
      );
    }

    const params = new URLSearchParams({
      q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false",
      pageSize: "100",
      orderBy: "name",
      fields: "files(id,name,mimeType,webViewLink)",
    });
    const upstream = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
      headers: { Authorization: `Bearer ${driveSession.accessToken}` },
      cache: "no-store",
    });
    const data = await upstream.json();

    if (!upstream.ok) {
      const response = NextResponse.json({
        error: data?.error?.message
          ? `Google Drive API error: ${data.error.message}`
          : "Google Drive API could not list folders.",
        code: data?.error?.errors?.[0]?.reason ?? "DRIVE_LIST_FAILED",
      }, { status: upstream.status === 401 || upstream.status === 403 ? upstream.status : 502 });
      saveRefreshedSession(response, driveSession.refreshedSession);
      return response;
    }

    const response = NextResponse.json({ folders: data.files ?? [] });
    saveRefreshedSession(response, driveSession.refreshedSession);
    return response;
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unable to load Google Drive folders.",
      code: "DRIVE_FOLDER_ROUTE_ERROR",
    }, { status: 500 });
  }
}
