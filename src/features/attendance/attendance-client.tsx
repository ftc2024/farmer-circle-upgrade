"use client";

import { useEffect, useState } from "react";
import { FileSpreadsheet, RefreshCw, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { StatusMessage } from "@/components/ui/status-message";
import type { LearningAttendance } from "@/types/domain";

function localDateTime() { const now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); return now.toISOString().slice(0, 16); }

export function AttendanceClient() {
  const [rows, setRows] = useState<LearningAttendance[]>([]);
  const [time, setTime] = useState(localDateTime());
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  async function load() { const { data, error } = await createClient().from("learning_attendance").select("*").order("created_at", { ascending: false }).limit(80); if (error) setMessage({ text: error.message, error: true }); setRows((data ?? []) as LearningAttendance[]); }
  useEffect(() => { void load(); }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage(null); const form = new FormData(event.currentTarget); const topic = String(form.get("topic") ?? "").trim(); const note = String(form.get("note") ?? "").trim(); const file = form.get("proof");
    if (!(file instanceof File) || !file.size) { setMessage({ text: "Screenshot bukti wajib diupload.", error: true }); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setMessage({ text: "Bukti harus JPG/PNG/WebP.", error: true }); return; }
    const supabase = createClient(); const { data: auth } = await supabase.auth.getUser(); if (!auth.user) return;
    const ext = file.name.split(".").pop() || "jpg"; const path = `${auth.user.id}/${Date.now()}-attendance.${ext}`;
    const upload = await supabase.storage.from("attendance-proofs").upload(path, file, { contentType: file.type, upsert: false }); if (upload.error) { setMessage({ text: upload.error.message, error: true }); return; }
    const proofUrl = supabase.storage.from("attendance-proofs").getPublicUrl(path).data.publicUrl;
    const row = { user_id: auth.user.id, email: auth.user.email ?? "", full_name: auth.user.user_metadata.full_name ?? auth.user.email?.split("@")[0] ?? "Member", topic, session_time: time, note: note || null, proof_url: proofUrl, proof_path: path };
    const insert = await supabase.from("learning_attendance").insert(row); if (insert.error) { setMessage({ text: insert.error.message, error: true }); return; }
    setMessage({ text: "Absensi berhasil disimpan." }); event.currentTarget.reset(); setTime(localDateTime()); await load();
  }

  function exportCSV() { const headers = ["created_at", "session_time", "full_name", "email", "topic", "note", "proof_url"]; const csv = [headers.join(","), ...rows.map((row) => headers.map((key) => `"${String(row[key as keyof LearningAttendance] ?? "").replaceAll('"', '""')}"`).join(","))].join("\n"); const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); const link = document.createElement("a"); link.href = url; link.download = `absensi-pembelajaran-${new Date().toISOString().slice(0,10)}.csv`; link.click(); URL.revokeObjectURL(url); }

  return <div className="grid gap-6"><section className="hero-card"><div><p className="eyebrow">Learning Attendance</p><h1>Absensi Pembelajaran</h1><p>Isi sesi pembelajaran dan upload screenshot bukti ke Supabase Storage.</p></div><span className="role-badge">Excel Ready CSV</span></section><section className="grid gap-6 xl:grid-cols-[430px_minmax(0,1fr)] xl:items-start"><form onSubmit={submit} className="panel grid gap-4"><Field label="Materi / Kelas"><input name="topic" maxLength={120} placeholder="Candlestick Pattern - Sesi 1" required /></Field><Field label="Waktu Pembelajaran"><input type="datetime-local" value={time} onChange={(e) => setTime(e.target.value)} required /></Field><Field label="Catatan"><textarea name="note" rows={4} maxLength={400} /></Field><label className="upload-zone"><Upload className="size-6 text-fc-lime" /><strong>Upload Screenshot Bukti</strong><small>PNG, JPG, atau WebP</small><input name="proof" type="file" accept="image/png,image/jpeg,image/webp" required /></label><StatusMessage tone={message?.error ? "error" : "success"}>{message?.text}</StatusMessage><div className="grid gap-3 sm:grid-cols-2"><button className="primary-button">Absen Sekarang</button><button type="button" className="ghost-button" onClick={exportCSV}><FileSpreadsheet className="size-4" />Export CSV</button></div></form><div className="panel"><div className="section-heading"><h2>Riwayat Absensi</h2><button onClick={load} className="icon-button"><RefreshCw className="size-4" /></button></div><div className="grid gap-3">{rows.length ? rows.map((row) => <article key={row.id} className="rounded-xl border border-white/10 bg-white/5 p-4"><strong className="block">{row.topic}</strong><span className="text-sm text-fc-muted">{row.full_name || row.email} · {new Date(row.session_time).toLocaleString("id-ID")}</span>{row.note && <p className="mt-2 text-sm text-fc-muted">{row.note}</p>}{row.proof_url && <a href={row.proof_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-sm font-semibold text-fc-cyan hover:underline">Lihat bukti screenshot</a>}</article>) : <div className="empty-state">Belum ada data absensi.</div>}</div></div></section></div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-2"><span className="text-sm font-semibold text-fc-muted">{label}</span>{children}</label>; }
