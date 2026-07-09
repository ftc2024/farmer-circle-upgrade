"use client";

import { Lock, Star } from "lucide-react";
import { useMemo, useState } from "react";

const categories = [
  { title: "Candlestick Pattern", materials: 2, locked: 1, status: "active", category: "technical" },
  { title: "Support and Resistance", materials: 1, locked: 0, status: "active", category: "technical" },
  { title: "Fundamental", materials: 8, locked: 7, status: "active", category: "fundamental" },
  { title: "Trading Psychology", materials: 7, locked: 0, status: "active", category: "psychology" },
  { title: "Fundamental Intermarket", materials: 1, locked: 1, status: "locked", category: "fundamental" },
  { title: "Struktur Market", materials: 1, locked: 1, status: "locked", category: "technical" },
  { title: "Chart Pattern All", materials: 4, locked: 0, status: "active", category: "technical" },
  { title: "Price Action", materials: 1, locked: 1, status: "locked", category: "technical" },
];

export function LearningCenter() {
  const [filter, setFilter] = useState("all");
  const visible = useMemo(() => categories.filter((item) => filter === "all" || item.category === filter || item.status === filter), [filter]);
  return <div className="grid gap-6"><section className="hero-card"><div><p className="eyebrow">Learning Center</p><h1>Materi & Video Pembelajaran</h1><p>Layer pembelajaran untuk PDF, video, dan modul. Struktur kategori mempertahankan acuan legacy Farmer Circle.</p></div></section><section className="panel flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><label className="grid gap-2 sm:w-80"><span>Kategori</span><select value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">Semua kategori</option><option value="technical">Technical</option><option value="fundamental">Fundamental</option><option value="psychology">Psychology</option><option value="locked">Locked</option></select></label><strong className="text-sm uppercase tracking-[.18em] text-fc-cyan">{visible.length} kategori tersedia</strong></section><section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{visible.map((item, index) => <article key={item.title} className="overflow-hidden rounded-2xl border border-white/10 bg-fc-panel/70"><div className="relative grid h-44 place-items-center bg-[radial-gradient(circle_at_25%_35%,rgba(198,255,0,.30),transparent_34%),linear-gradient(135deg,#07100b,#10162a,#050712)] p-5 text-center"><span className="absolute left-4 top-4 rounded bg-black/70 px-2 py-1 text-xs font-black text-fc-lime">#{index + 1}</span>{item.status === "locked" && <div className="absolute inset-0 grid place-items-center bg-black/55"><Lock className="text-fc-lime" /></div>}<strong className="text-lg uppercase">{item.title}</strong></div><div className="flex min-h-52 flex-col p-5"><span className="text-xs uppercase tracking-[.15em] text-fc-muted">{item.materials} Materi{item.locked ? ` · ${item.locked} Terkunci` : ""}</span><h2 className="mt-3 font-black uppercase">{item.title}</h2><p className="mt-3 text-sm leading-6 text-fc-muted">{item.status === "locked" ? "Upgrade paket untuk membuka kategori materi ini." : "Materi PDF dan video siap disambungkan dari metadata learning."}</p><div className="mt-auto flex items-center gap-1 pt-5 text-fc-lime">{Array.from({length:5}).map((_, i) => <Star key={i} className="size-3 fill-current" />)}</div></div></article>)}</section></div>;
}
