import { NextRequest, NextResponse } from "next/server";
import { getDriveAccessToken, saveRefreshedSession } from "@/lib/google-drive";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const token = await getDriveAccessToken();
    if (!token) return NextResponse.json({ error: "Google Drive is not connected.", connectUrl: "/api/auth/google" }, { status: 401 });

    const folderId = request.nextUrl.searchParams.get("folderId");
    const clauses = ["trashed = false", "(mimeType contains 'image/' or mimeType contains 'video/')"];
    if (folderId) clauses.push(`'${folderId.replace(/[^a-zA-Z0-9_-]/g, "")}' in parents`);
    const params = new URLSearchParams({
      q: clauses.join(" and "),
      pageSize: "100",
      orderBy: "createdTime desc",
      fields: "nextPageToken,files(id,name,mimeType,thumbnailLink,webViewLink,createdTime,modifiedTime,size)",
    });
    const upstream = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await upstream.json();
    if (!upstream.ok) {
      const response = NextResponse.json({ error: "Google Drive could not list files. Reconnect or check Drive permissions." }, { status: upstream.status === 401 ? 401 : 502 });
      saveRefreshedSession(response);
      return response;
    }
    const response = NextResponse.json({ files: data.files ?? [], nextPageToken: data.nextPageToken ?? null });
    saveRefreshedSession(response);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load Google Drive files.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
