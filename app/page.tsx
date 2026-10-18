"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Heart, Link2, LoaderCircle, Play, X } from "lucide-react";

type DriveFile = { id: string; name: string; mimeType: string; webViewLink?: string; thumbnailLink?: string };

export default function Home() {
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [folderUrl, setFolderUrl] = useState("");
  const [driveStatus, setDriveStatus] = useState("Connect Google Drive and paste your wedding album folder link.");
  const [busy, setBusy] = useState(false);
  const [connected, setConnected] = useState(false);
  const [spread, setSpread] = useState(-1);
  const [preview, setPreview] = useState<DriveFile | null>(null);
  const touchStart = useRef<number | null>(null);
  const totalSpreads = Math.max(1, Math.ceil(driveFiles.length / 2));

  function extractDriveFolderId(value: string): string | null {
    const trimmed = value.trim();
    try {
      const url = new URL(trimmed);
      if (url.hostname === "drive.google.com" || url.hostname.endsWith(".drive.google.com")) {
        const parts = url.pathname.split("/").filter(Boolean);
        const index = parts.indexOf("folders");
        if (index >= 0 && parts[index + 1]) return parts[index + 1];
      }
    } catch {}
    return /^[a-zA-Z0-9_-]{10,}$/.test(trimmed) ? trimmed : null;
  }

  async function loadFolder(event?: React.FormEvent) {
    event?.preventDefault();
    const id = extractDriveFolderId(folderUrl);
    if (!id) { setDriveStatus("Paste a valid Google Drive folder link."); return; }
    setBusy(true);
    setDriveStatus("Loading your wedding memories…");
    try {
      const response = await fetch("/api/drive/files?folderId=" + encodeURIComponent(id), { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load this folder.");
      const files = (data.files ?? []) as DriveFile[];
      setDriveFiles(files);
      setSpread(-1);
      setDriveStatus(files.length ? "Loaded " + files.length + " photos and videos. Scroll to open your album." : "This folder has no accessible photos or videos. Check the folder and sharing permissions.");
    } catch (error) {
      setDriveStatus(error instanceof Error ? error.message : "Could not load your Google Drive folder.");
    } finally { setBusy(false); }
  }

  const changeSpread = useCallback((direction: number) => {
    setPreview(null);
    setSpread((current) => Math.min(totalSpreads - 1, Math.max(-1, current + direction)));
  }, [totalSpreads]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("drive") === "connected") {
      setConnected(true);
      setDriveStatus("Google Drive connected. Paste your wedding folder link below.");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (params.get("drive_error")) {
      setDriveStatus("Google Drive connection was not completed. Please connect again.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      if (preview || Math.abs(event.deltaY) < 18) return;
      event.preventDefault();
      changeSpread(event.deltaY > 0 ? 1 : -1);
    };
    const onTouchStart = (event: TouchEvent) => { touchStart.current = event.touches[0]?.clientY ?? null; };
    const onTouchEnd = (event: TouchEvent) => {
      if (touchStart.current === null) return;
      const delta = touchStart.current - (event.changedTouches[0]?.clientY ?? touchStart.current);
      if (Math.abs(delta) > 35) changeSpread(delta > 0 ? 1 : -1);
      touchStart.current = null;
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (preview) return;
      if (["ArrowDown", "PageDown", " "].includes(event.key)) { event.preventDefault(); changeSpread(1); }
      if (["ArrowUp", "PageUp"].includes(event.key)) { event.preventDefault(); changeSpread(-1); }
      if (event.key === "Escape") setPreview(null);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [changeSpread, preview]);

  const visibleFiles = driveFiles.slice(Math.max(0, spread) * 2, Math.max(0, spread) * 2 + 2);
  const mediaUrl = (file: DriveFile) => "/api/drive/media/" + encodeURIComponent(file.id);

  function renderPageMedia(file: DriveFile | undefined) {
    if (spread < 0 || !file) return null;
    return <button className="album-media-button" onClick={() => setPreview(file)} aria-label={"View " + file.name}>
      {file.mimeType.startsWith("video/") ? <><video src={mediaUrl(file)} preload="metadata" muted /><span className="album-video-mark"><Play size={20} fill="currentColor" /></span></> : <img src={mediaUrl(file)} alt={file.name} />}
      <span className="album-photo-caption">{file.name}</span>
    </button>;
  }

  return <main className="album-experience">
    <div className="album-atmosphere" />
    <div className="album-topline"><span><Heart size={13} fill="currentColor" /> OUR STORY</span><span>24 · 04 · 2026</span></div>
    <section className={"immersive-book " + (spread >= 0 ? "is-open" : "is-closed")} aria-label="Ajith and Anusha wedding album">
      <div className="book-ground-shadow" />
      <div className="wedding-book">
        <div className="book-pages-edge" /><div className="book-back-cover" />
        <div className="book-spread">
          <div className="album-page left-page">
            {renderPageMedia(visibleFiles[0]) || <div className="page-intro"><span className="page-ornament">✦</span><p>Every little moment<br />led us here.</p><Heart size={15} /></div>}
            <span className="page-number">{spread >= 0 ? spread * 2 + 1 : ""}</span>
          </div>
          <div className="book-gutter" />
          <div className="album-page right-page">
            {renderPageMedia(visibleFiles[1]) || <div className="page-intro right-intro"><span className="page-ornament">✦</span><p>Our forever<br /><em>starts here.</em></p><span className="page-date">AJITH & ANUSHA · 2026</span></div>}
            <span className="page-number">{spread >= 0 ? spread * 2 + 2 : ""}</span>
          </div>
        </div>
        <button className="book-cover" onClick={() => changeSpread(1)} aria-label="Open the wedding album">
          <span className="cover-border" /><span className="cover-topline">A KEEPSAKE OF OUR LOVE</span>
          <span className="cover-emblem"><Heart size={25} strokeWidth={1.2} /></span>
          <span className="cover-title">Our<br /><em>Wedding</em><br />Story</span>
          <span className="cover-divider"><i /> ✦ <i /></span>
          <span className="cover-names">AJITH <b>&</b> ANUSHA</span><span className="cover-date">24 APRIL 2026</span>
          <span className="cover-hint">{driveFiles.length ? "SCROLL TO OPEN" : "ADD YOUR MEMORIES BELOW"}</span>
        </button>
      </div>
    </section>
    <div className="album-footer">
      <div className="album-status">{busy && <LoaderCircle size={13} className="spin" />}<span>{driveStatus}</span></div>
      <form className="album-folder-form" onSubmit={loadFolder}>
        <input value={folderUrl} onChange={(event) => setFolderUrl(event.target.value)} aria-label="Google Drive wedding folder link" placeholder="Paste your Google Drive wedding folder link" />
        <button type="submit" disabled={busy || !folderUrl.trim()}>{busy ? "LOADING…" : "LOAD ALBUM"}</button>
      </form>
      <div className="album-footer-actions">
        {!connected ? <a href="/api/auth/google" className="connect-drive-link"><Link2 size={13} /> CONNECT GOOGLE DRIVE</a> : <span className="connected-label"><span /> GOOGLE DRIVE CONNECTED</span>}
        {driveFiles.length > 0 && <span className="album-count">{Math.min(Math.max(spread + 1, 0) * 2, driveFiles.length)} / {driveFiles.length} MEMORIES</span>}
      </div>
    </div>
    {preview && <div className="album-preview-overlay" role="dialog" aria-modal="true" aria-label={preview.name} onClick={() => setPreview(null)}>
      <button className="album-preview-close" onClick={() => setPreview(null)} aria-label="Close preview"><X size={20} /></button>
      <div className="album-preview-content" onClick={(event) => event.stopPropagation()}>
        {preview.mimeType.startsWith("video/") ? <video src={mediaUrl(preview)} controls autoPlay playsInline /> : <img src={mediaUrl(preview)} alt={preview.name} />}
        <p>{preview.name}</p>
      </div>
    </div>}
  </main>;
}
