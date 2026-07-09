"use client";

import { useEffect, useState } from "react";
import { Pencil, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { StatusMessage } from "@/components/ui/status-message";
import type { BiasDirection, DailyBias, UserRole } from "@/types/domain";

const canManage = (role: UserRole) => role === "admin" || role === "mentor";

export function DailyBiasClient({ role }: { role: UserRole }) {
  const [items, setItems] = useState<DailyBias[]>([]);
  const [editing, setEditing] = useState<DailyBias | null>(null);
  const [form, setForm] = useState({ title: "", market: "", direction: "bullish" as BiasDirection, content: "" });
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [previews, setPreviews] = useState<Record<string, string[]>>({});

  async function load() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("daily_biases")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      setMessage({ text: error.message, error: true });
      setItems([]);
      return;
    }

    const biases = (data ?? []) as DailyBias[];
    setItems(biases);
    const ids = biases.map((item) => item.id);
    if (!ids.length) {
      setPreviews({});
      return;
    }

    const files = await supabase
      .from("drive_files")
      .select("related_id, metadata")
      .eq("folder_type", "daily_bias_screenshots")
      .eq("related_table", "daily_biases")
      .in("related_id", ids);

    const previewEntries = await Promise.all(
      (files.data ?? []).map(async (file) => {
        const metadata = file.metadata as Record<string, unknown>;
        const bucket = typeof metadata.bucket === "string" ? metadata.bucket : "daily-bias-screenshots";
        const path = typeof metadata.path === "string" ? metadata.path : "";
        if (!file.related_id || !path) return null;
        const signed = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60);
        return signed.data?.signedUrl
          ? { biasId: file.related_id, url: signed.data.signedUrl }
          : null;
      })
    );

    const grouped: Record<string, string[]> = {};
    previewEntries.forEach((entry) => {
      if (!entry) return;
      grouped[entry.biasId] = [...(grouped[entry.biasId] ?? []), entry.url];
    });
    setPreviews(grouped);
  }
  useEffect(() => { void load(); }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManage(role)) return;
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const payload = { author_id: auth.user.id, title: form.title.trim(), market: form.market.trim().toUpperCase(), direction: form.direction, content: form.content.trim() };
    const query = editing
      ? supabase.from("daily_biases").update(payload).eq("id", editing.id).select("id").single()
      : supabase.from("daily_biases").insert(payload).select("id").single();
    const { data, error } = await query;
    if (error) { setMessage({ text: error.message, error: true }); return; }
    const biasId = data.id as string;

    if (file) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024) {
        setMessage({ text: "Screenshot harus JPG/PNG/WebP maksimal 10MB.", error: true });
        return;
      }
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${auth.user.id}/${biasId}/${Date.now()}.${ext}`;
      const upload = await supabase.storage.from("daily-bias-screenshots").upload(path, file, { contentType: file.type, upsert: false });
      if (upload.error) { setMessage({ text: upload.error.message, error: true }); return; }
      await supabase.from("drive_files").insert({
        owner_user_id: auth.user.id, uploaded_by: auth.user.id,
        folder_type: "daily_bias_screenshots", related_table: "daily_biases", related_id: biasId,
        title: form.title, original_filename: file.name, mime_type: file.type, file_size_bytes: file.size,
        drive_file_id: `supabase:daily-bias-screenshots:${path}`, drive_folder_id: "daily-bias-screenshots",
        visibility: "member", metadata: { provider: "supabase_storage", bucket: "daily-bias-screenshots", path }
      });
    }

    setForm({ title: "", market: "", direction: "bullish", content: "" });
    setEditing(null); setFile(null); setMessage({ text: "Daily Bias berhasil disimpan." }); await load();
  }

  function edit(item: DailyBias) {
    setEditing(item);
    setForm({ title: item.title, market: item.market, direction: item.direction, content: item.content });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(id: string) {
    if (!window.confirm("Hapus daily bias ini?")) return;
    const { error } = await createClient().from("daily_biases").delete().eq("id", id);
    if (error) setMessage({ text: error.message, error: true }); else await load();
  }

  return <div className="grid gap-6">
    <section className="hero-card"><div><p className="eyebrow">Market Intelligence</p><h1>Daily Bias</h1><p>Bias harian tim untuk market, area penting, invalidation, dan skenario entry.</p></div><button className="ghost-button" onClick={load}><RefreshCw className="size-4" />Refresh</button></section>
    {canManage(role) && <form onSubmit={submit} className="panel grid gap-4">
      <div className="section-heading"><h2>{editing ? "Edit Daily Bias" : "Upload Daily Bias"}</h2><span>{role}</span></div>
      <div className="grid gap-4 md:grid-cols-2"><label className="grid gap-2"><span>Judul</span><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label><label className="grid gap-2"><span>Market</span><input value={form.market} onChange={(e) => setForm({ ...form, market: e.target.value })} placeholder="XAUUSD / BTC / EURUSD" required /></label></div>
      <label className="grid gap-2"><span>Arah Bias</span><select value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value as BiasDirection })}><option value="bullish">Bullish</option><option value="bearish">Bearish</option><option value="neutral">Neutral</option></select></label>
      <label className="grid gap-2"><span>Konten</span><textarea rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required /></label>
      <label className="grid gap-2"><span>Screenshot Analisa (opsional)</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></label>
      <StatusMessage tone={message?.error ? "error" : "success"}>{message?.text}</StatusMessage>
      <div className="flex gap-3"><button className="primary-button"><UploadCloud className="size-4" />Publish Daily Bias</button>{editing && <button type="button" className="ghost-button" onClick={() => setEditing(null)}>Batal</button>}</div>
    </form>}
    {!canManage(role) && <StatusMessage>Role member bersifat read-only. Publish/edit/delete tetap dibatasi oleh RLS.</StatusMessage>}
    <section className="grid gap-4">{items.length ? items.map((item) => <article key={item.id} className="panel"><div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-bold">{item.title}</h2><p className="mt-1 text-sm text-fc-muted">{item.market} · {new Date(item.created_at).toLocaleDateString("id-ID")} · {item.profiles?.full_name || item.profiles?.role || "Team"}</p></div>{canManage(role) && <div className="flex gap-2"><button onClick={() => edit(item)} className="icon-button"><Pencil className="size-4" /></button><button onClick={() => remove(item.id)} className="icon-button"><Trash2 className="size-4" /></button></div>}</div><span className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-black uppercase ${item.direction === "bullish" ? "bg-emerald-500/15 text-emerald-200" : item.direction === "bearish" ? "bg-red-500/15 text-red-200" : "bg-white/10 text-fc-muted"}`}>{item.direction}</span><p className="mt-4 whitespace-pre-wrap leading-7 text-fc-muted">{item.content}</p>{previews[item.id]?.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{previews[item.id].map((url) => <a key={url} href={url} target="_blank" rel="noreferrer" className="overflow-hidden rounded-xl border border-white/10"><img src={url} alt={`Screenshot ${item.title}`} className="h-56 w-full object-cover transition hover:scale-[1.02]" loading="lazy" /></a>)}</div> : null}</article>) : <div className="empty-state">Belum ada daily bias.</div>}</section>
  </div>;
}
