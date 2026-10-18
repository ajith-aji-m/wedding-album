"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowLeft, ArrowRight, Heart, Maximize2, Play, Sparkles, X } from "lucide-react";

const memories = [
  { type: "photo", label: "The beginning", date: "A moment to remember", image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=85", className: "memory-tall" },
  { type: "photo", label: "A little forever", date: "The day everything changed", image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=85", className: "" },
  { type: "video", label: "A moving memory", date: "A sample video placeholder", image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85", className: "" },
  { type: "photo", label: "Just us", date: "A thousand little moments", image: "https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=1200&q=85", className: "memory-tall" },
];

export default function Home() {
  const [filter, setFilter] = useState<"all" | "photo" | "video">("all");
  const [opened, setOpened] = useState(false);
  const [page, setPage] = useState(0);
  const [lightbox, setLightbox] = useState<{image:string;label:string;date:string} | null>(null);
  const [driveFolders, setDriveFolders] = useState<{id:string;name:string}[]>([]);
  const [driveFiles, setDriveFiles] = useState<{id:string;name:string;mimeType:string;webViewLink?:string;size?:string}[]>([]);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [driveStatus, setDriveStatus] = useState("Connect Google Drive to load your real photos and videos.");
  const [driveBusy, setDriveBusy] = useState(false);
  const shown = memories.filter((item) => filter === "all" || item.type === filter);

  async function loadDrive(folderId = selectedFolder) {
    setDriveBusy(true);
    setDriveStatus("Loading your Drive folders and media…");
    try {
      const folderResponse = await fetch("/api/drive/folders", { cache: "no-store" });
      const folderData = await folderResponse.json();
      if (!folderResponse.ok) throw new Error(folderData.error || "Connect Google Drive to continue.");
      const folders = folderData.folders ?? [];
      setDriveFolders(folders);
      const params = folderId ? `?folderId=${encodeURIComponent(folderId)}` : "";
      const filesResponse = await fetch(`/api/drive/files${params}`, { cache: "no-store" });
      const fileData = await filesResponse.json();
      if (!filesResponse.ok) throw new Error(fileData.error || "Could not load Drive media.");
      setDriveFiles(fileData.files ?? []);
      setDriveStatus(`Loaded ${(fileData.files ?? []).length} media items from Google Drive.`);
    } catch (error) {
      setDriveStatus(error instanceof Error ? error.message : "Could not connect to Google Drive.");
    } finally {
      setDriveBusy(false);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("drive") === "connected") {
      void loadDrive("");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (params.get("drive_error")) {
      setDriveStatus("Google Drive connection was not completed. Please try again.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  return (
    <main>
      <nav className="nav"><a className="brand" href="#top"><span className="brand-mark"><Heart size={15} fill="currentColor" /></span> EVER AFTER<span className="brand-dot">.</span></a><div className="nav-note">YOUR STORY, BEAUTIFULLY KEPT</div><a className="nav-link" href="#memories">Explore memories <ArrowRight size={14} /></a></nav>
      <section className="hero" id="top">
        <div className="hero-image" aria-hidden="true" /><div className="hero-shade" />
        <div className="hero-content"><motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="eyebrow"><span /> A LOVE STORY IN MOTION <span /></motion.div>
          <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.15 }}>Some moments<br />become <em>forever.</em></motion.h1>
          <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>Every photograph, every little film, every feeling.<br className="desktop-break" /> One beautiful place to return to it all.</motion.p>
          <motion.button className="primary-button" onClick={() => { document.getElementById("memories")?.scrollIntoView({ behavior: "smooth" }); }} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}><Heart size={16} /> Open our story <ArrowRight size={16} /></motion.button>
          <div className="hero-foot"><span>MADE OF LITTLE FOREVERS</span><span className="scroll-cue">SCROLL TO FEEL IT <ArrowDown size={13} /></span><span>EST. 24 APRIL 2026</span></div>
        </div><div className="hero-side-note">A PERSONAL ARCHIVE OF LOVE <span>— 01 / 04</span></div>
      </section>
      <section className="intro section-wrap"><div className="section-kicker"><Sparkles size={14} /> NOT JUST AN ALBUM</div><h2>Life moves on.<br /><em>Love leaves a trace.</em></h2><p>A little world made for the moments you never want to lose. Wander through photographs, press play on the little films, and relive your favourite day — beautifully, on any screen.</p><div className="ornament"><span /> <Heart size={13} /> <span /></div></section>
      <section className="memories section-wrap" id="memories"><div className="memories-heading"><div><div className="section-kicker">THE MEMORY COLLECTION</div><h2>Pages of <em>us.</em></h2></div><div className="filters" aria-label="Filter memories">{([ ["all", "All memories"], ["photo", "Photographs"], ["video", "Films"] ] as const).map(([value, label]) => <button key={value} className={filter === value ? "filter active" : "filter"} onClick={() => setFilter(value)}>{label}</button>)}</div></div>
        <div className="drive-panel">
          <div className="drive-panel-copy"><div className="section-kicker">YOUR PRIVATE COLLECTION</div><h3>Bring your <em>real memories</em> in.</h3><p>{driveStatus}</p></div>
          <div className="drive-panel-actions"><a className="drive-connect" href="/api/auth/google">Connect Google Drive <ArrowRight size={15} /></a><button className="drive-refresh" disabled={driveBusy} onClick={() => void loadDrive("")}>{driveBusy ? "Loading…" : "Load my media"}</button></div>
          {driveFolders.length > 0 && <label className="drive-folder-label">Choose a folder
            <select value={selectedFolder} onChange={(event) => { setSelectedFolder(event.target.value); void loadDrive(event.target.value); }}>
              <option value="">All accessible photos and videos</option>
              {driveFolders.map((folder) => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
            </select>
          </label>}
          {driveFiles.length > 0 && <div className="drive-file-list">{driveFiles.map((file) => <a key={file.id} href={file.webViewLink || "#"} target="_blank" rel="noreferrer" className="drive-file"><span className="drive-file-kind">{file.mimeType.startsWith("video/") ? "FILM" : "PHOTO"}</span><span>{file.name}</span><ArrowRight size={13} /></a>)}</div>}
        </div>
        <div className="memory-grid">{shown.map((item, index) => <motion.article key={item.label} className={`memory-card ${item.className}`} layout initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: index * 0.07 }}><button className="memory-photo memory-photo-button" style={{ backgroundImage: `url(${item.image})` }} aria-label={`Open ${item.label}`} onClick={() => setLightbox(item)}>{item.type === "video" && <span className="play-button"><Play size={20} fill="currentColor" /></span>}<span className="memory-number">{String(index + 1).padStart(2, "0")}</span><span className="memory-open-hint">OPEN MEMORY ↗</span></button><div className="memory-caption"><div><h3>{item.label}</h3><p>{item.date}</p></div>{item.type === "video" ? <Play size={15} /> : <Heart size={15} />}</div></motion.article>)}</div>
        <div className="collection-note"><span className="note-line" /> <span>YOUR MEMORIES WILL LIVE HERE</span> <span className="note-line" /></div></section>
      {lightbox && <div className="memory-lightbox" role="dialog" aria-modal="true" aria-label={lightbox.label} onClick={() => setLightbox(null)}><button className="lightbox-close" aria-label="Close memory" onClick={() => setLightbox(null)}><X size={20} /></button><div className="lightbox-content" onClick={(event) => event.stopPropagation()}><div className="lightbox-photo" style={{ backgroundImage: `url(${lightbox.image})` }} /><div className="lightbox-caption"><span className="section-kicker">A MOMENT TO KEEP</span><h2>{lightbox.label}</h2><p>{lightbox.date}</p></div></div></div>}
      <section className="album-section"><div className="album-glow" /><div className="album-copy"><div className="section-kicker"><Sparkles size={14} /> MADE TO BE REVISITED</div><h2>A book that<br /><em>feels like you.</em></h2><p>Turn the page. Stay a little longer. Let your story unfold like a keepsake album — made for your phone, your laptop, and the big screen in your living room.</p><button className="text-button" onClick={() => { setOpened(!opened); setPage(0); }}><span>{opened ? "Close album preview" : "Preview the album"}</span> <ArrowRight size={16} /></button></div>
        <div className={`book-stage ${opened ? "book-open" : ""}`}><div className="book-shadow" /><div className="book-cover"><div className="cover-frame"><span className="cover-small">OUR MOST BEAUTIFUL DAYS</span><div className="cover-heart"><Heart size={23} /></div><div className="cover-title">Our<br /><em>Story</em></div><span className="cover-names">A LITTLE FOREVER, TOGETHER</span><span className="cover-date">24 · 04 · 2026</span></div></div><div className="book-page"><span className="page-label">CHAPTER {String(page + 1).padStart(2, "0")}</span><div className="page-photo" style={{ backgroundImage: `url(${memories[page % memories.length].image})` }} /><span className="page-caption">{memories[page % memories.length].label}</span><div className="page-controls"><button aria-label="Previous page" onClick={() => setPage((page + memories.length - 1) % memories.length)}><ArrowLeft size={15} /></button><span>{page + 1} / {memories.length}</span><button aria-label="Next page" onClick={() => setPage((page + 1) % memories.length)}><ArrowRight size={15} /></button></div></div><div className="book-hint"><Maximize2 size={12} /> {opened ? "TURN THROUGH THE MEMORIES" : "A LITTLE PREVIEW OF WHAT'S INSIDE"}</div></div></section>
      <section className="closing section-wrap"><div className="closing-heart"><Heart size={19} /></div><div className="section-kicker">THE DAY THAT BECAME FOREVER</div><h2>Ajith <em>&</em> Anusha</h2><p>24 April 2026 · and all the days that followed.</p><div className="closing-rule"><span /> <Heart size={12} /> <span /></div><p className="closing-small">A private little universe, made of the moments that matter most.</p></section>
      <footer className="footer"><a className="brand" href="#top"><span className="brand-mark"><Heart size={13} fill="currentColor" /></span> EVER AFTER<span className="brand-dot">.</span></a><span>MADE WITH LOVE, FOR THE LOVE OF IT.</span><a href="#top" className="back-top">BACK TO TOP ↑</a></footer>
    </main>
  );
}
