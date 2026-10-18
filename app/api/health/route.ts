import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "wedding-album",
    integrations: { googleDrive: "not-configured", qrSharing: "not-configured" },
  });
}
