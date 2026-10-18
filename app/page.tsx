"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowLeft, ArrowRight, Heart, Maximize2, Play, Sparkles, Volume2 } from "lucide-react";

const memories = [
  { type: "photo", label: "The beginning", date: "A moment to remember", image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=85", className: "memory-tall" },
  { type: "photo", label: "A little forever", date: "The day everything changed", image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=85", className: "" },
  { type: "video", label: "A moving memory", date: "Press play in your own album", image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85", className: "" },
  { type: "photo", label: "Just us", date: "A thousand little moments", image: "https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=1200&q=85", className: "memory-tall" },
];

export default function Home() {
  const [filter, setFilter] = useState<"all" | "photo" | "video">("all");
  const [opened, setOpened] = useState(false);
  const [page, setPage] = useState(0);
  const shown = memories.filter((item) => filter === "all" || item.type === filter);

  return (
    <main>
      <nav className="nav"><a className="brand" href="#top"><span className="brand-mark"><Heart size={15} fill="currentColor" /></span> EVER AFTER<span className="brand-dot">.</span></a><div className="nav-note">YOUR STORY, BEAUTIFULLY KEPT</div><a className="nav-link" href="#memories">Explore memories <ArrowRight size={14} /></a></nav>
      <section className="hero" id="top">
        <div className="hero-image" aria-hidden="true" />
        <div className="hero-shade" />
        <div className="hero-content">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="eyebrow"><span /> A LOVE STORY IN MOTION <span /></motion.div>
          <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.15 }}>Some moments<br />become <em>forever.</em></motion.h1>
          <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>Every photograph, every little film, every feeling.<br className="desktop-break" /> One beautiful place to return to it all.</motion.p>
          <motion.button className="primary-button" onClick={() => { setOpened(true); document.getElementById("memories")?.scrollIntoView({ behavior: "smooth" }); }} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}><Heart size={16} /> Open our story <ArrowRight size={16} /></motion.button>
          <div className="hero-foot"><span>MADE OF LITTLE FOREVERS</span><span className="scroll-cue">SCROLL TO FEEL IT <ArrowDown size={13} /></span><span>EST. 24 APRIL 2026</span></div>
        </div>
        <div className="hero-side-note">A PERSONAL ARCHIVE OF LOVE <span>— 01 / 04</span></div>
      </section>
      <section className="intro section-wrap"><div className="section-kicker"><Sparkles size={14} /> NOT JUST AN ALBUM</div><h2>Life moves on.<br /><em>Love leaves a trace.</em></h2><p>A little world made for the moments you never want to lose. Wander through photographs, press play on the little films, and relive your favourite day — beautifully, on any screen.</p><div className="ornament"><span /> <Heart size={13} /> <span /></div></section>
      <section className="memories section-wrap" id="memories">
        <div className="memories-heading"><div><div className="section-kicker">THE MEMORY COLLECTION</div><h2>Pages of <em>us.</em></h2></div><div className="filters" aria-label="Filter memories">{([ ["all", "All memories"], ["photo", "Photographs"], ["video", "Films"] ] as const).map(([value, label]) => <button key={value} className={filter === value ? "filter active" : "filter"} onClick={() => setFilter(value)}>{label}</button>)}</div></div>
        <div className="memory-grid">{shown.map((item, index) => <motion.article key={item.label} className={`memory-card ${item.className}`} layout initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: index * 0.07 }}><div className="memory-photo" style={{ backgroundImage: `url(${item.image})` }}>{item.type === "video" && <button className="play-button" aria-label="Preview film" onClick={() => alert("Video playback will be connected when your Google Drive is linked.")}><Play size={20} fill="currentColor" /></button>}<span className="memory-number">{String(index + 1).padStart(2, "0")}</span></div><div className="memory-caption"><div><h3>{item.label}</h3><p>{item.date}</p></div>{item.type === "video" ? <Play size={15} /> : <Heart size={15} />}</div></motion.article>)}</div>
        <div className="collection-note"><span className="note-line" /> <span>YOUR MEMORIES WILL LIVE HERE</span> <span className="note-line" /></div>
      </section>
      <section className="album-section"><div className="album-glow" /><div className="album-copy"><div className="section-kicker"><Sparkles size={14} /> MADE TO BE REVISITED</div><h2>A book that<br /><em>feels like you.</em></h2><p>Turn the page. Stay a little longer. Let your story unfold like a keepsake album — made for your phone, your laptop, and the big screen in your living room.</p><button className="text-button" onClick={() => { setOpened(!opened); setPage(0); }}><span>{opened ? "Close album preview" : "Preview the album"}</span> <ArrowRight size={16} /></button></div><div className={`book-stage ${opened ? "book-open" : ""}`}><div className="book-shadow" /><div className="book-cover"><div className="cover-frame"><span className="cover-small">OUR MOST BEAUTIFUL DAYS</span><div className="cover-heart"><Heart size={23} /></div><div className="cover-title">Our<br /><em>Story</em></div><span className="cover-names">A LITTLE FOREVER, TOGETHER</span><span className="cover-date">24 · 04 · 2026</span></div></div><div className="book-page"><span className="page-label">CHAPTER {String(page + 1).padStart(2, "0")}</span><div className="page-photo" style={{ backgroundImage: `url(${memories[page % memories.length].image})` }} /><span className="page-caption">{memories[page % memories.length].label}</span><div className="page-controls"><button aria-label="Previous page" onClick={() => setPage((page + memories.length - 1) % memories.length)}><ArrowLeft size={15} /></button><span>{page + 1} / {memories.length}</span><button aria-label="Next page" onClick={() => setPage((page + 1) % memories.length)}><ArrowRight size={15} /></button></div></div><div className="book-hint"><Maximize2 size={12} /> {opened ? "TURN THROUGH THE MEMORIES" : "A LITTLE PREVIEW OF WHAT'S INSIDE"}</div></div></section>
      <section className="closing section-wrap"><div className="closing-heart"><Heart size={19} /></div><div className="section-kicker">THE DAY THAT BECAME FOREVER</div><h2>Ajith <em>&</em> Anusha</h2><p>24 April 2026 · and all the days that followed.</p><div className="closing-rule"><span /> <Heart size={12} /> <span /></div><p className="closing-small">A private little universe, made of the moments that matter most.</p></section>
      <footer className="footer"><a className="brand" href="#top"><span className="brand-mark"><Heart size={13} fill="currentColor" /></span> EVER AFTER<span className="brand-dot">.</span></a><span>MADE WITH LOVE, FOR THE LOVE OF IT.</span><a href="#top" className="back-top">BACK TO TOP ↑</a></footer>
    </main>
  );
}
