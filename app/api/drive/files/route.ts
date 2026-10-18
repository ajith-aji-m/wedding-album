import { NextRequest, NextResponse } from "next/server";
import { getDriveAccess, saveRefreshedSession } from "@/lib/google-drive";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const driveSession = await getDriveAccess();
    if (!driveSession) return NextResponse.json({ error: "Google Drive session is missing. Connect Google Drive first.", code: "DRIVE_SESSION_MISSING" }, { status: 401 });

    const folderId = request.nextUrl.searchParams.get("folderId");
    const clauses = ["trashed = false", "(mimeType contains 'image/' or mimeType contains 'video/')"];
    if (folderId) clauses.push(`'${folderId.replace(/[^a-zA-Z0-9_-]/g, "")}' in parents`);
    const params = new URLSearchParams({
      q: clauses.join(" and "), pageSize: "100", orderBy: "createdTime desc",
      fields: "nextPageToken,files(id,name,mimeType,thumbnailLink,webViewLink,createdTime,modifiedTime,size)",
    });
    const upstream = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
      headers: { Authorization: `Bearer ${driveSession.accessToken}` }, cache: "no-store",
    });
    const data = await upstream.json();
    if (!upstream.ok) {
      const response = NextResponse.json({
        error: data?.error?.message ? `Google Drive API error: ${data.error.message}` : "Google Drive API could not list media files.",
        code: data?.error?.errors?.[0]?.reason ?? "DRIVE_LIST_FAILED",
      }, { status: upstream.status === 401 || upstream.status === 403 ? upstream.status : 502 });
      saveRefreshedSession(response, driveSession.refreshedSession);
      return response;
    }
    const response = NextResponse.json({ files: data.files ?? [], nextPageToken: data.nextPageToken ?? null });
    saveRefreshedSession(response, driveSession.refreshedSession);
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load Google Drive files.", code: "DRIVE_FILES_ROUTE_ERROR" }, { status: 500 });
  }
}
