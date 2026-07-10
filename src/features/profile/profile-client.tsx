"use client";

import { useState } from "react";
import { Camera, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { StatusMessage } from "@/components/ui/status-message";
import type { Profile } from "@/types/domain";

export function ProfileClient({ profile, email }: { profile: Profile; email: string }) {
  const [form, setForm] = useState({ ...profile });
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  function change<K extends keyof Profile>(key: K, value: Profile[K]) { setForm((current) => ({ ...current, [key]: value })); }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage(null); const supabase = createClient();
    const payload = { full_name: form.full_name?.trim() || null, phone: form.phone?.trim() || null, first_name: form.first_name?.trim() || null, last_name: form.last_name?.trim() || null, bio: form.bio?.trim() || null, address: form.address?.trim() || null, city: form.city?.trim() || null, country: form.country?.trim() || null };
    const table = await supabase.from("profiles").upsert({ id: profile.id, ...payload });
    const auth = await supabase.auth.updateUser({ data: { full_name: payload.full_name } }); setBusy(false);
    if (table.error && auth.error) setMessage({ text: table.error.message || auth.error.message, error: true }); else setMessage({ text: "Profile berhasil disimpan." });
  }

  async function upload(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 3 * 1024 * 1024) { setMessage({ text: "Avatar harus JPG/PNG/WebP maksimal 3MB.", error: true }); return; }
    const supabase = createClient(); const ext = file.name.split(".").pop() || "jpg"; const path = `${profile.id}/${Date.now()}.${ext}`;
    const uploaded = await supabase.storage.from("profile-photos").upload(path, file, { contentType: file.type, upsert: false });
    if (uploaded.error) { setMessage({ text: uploaded.error.message, error: true }); return; }
    const { data } = supabase.storage.from("profile-photos").getPublicUrl(path); const url = data.publicUrl;
    await supabase.from("profiles").update({ avatar_url: url, avatar_path: path }).eq("id", profile.id); await supabase.auth.updateUser({ data: { avatar_url: url, avatar_path: path } });
    change("avatar_url", url); change("avatar_path", path); setMessage({ text: "Avatar berhasil diperbarui." });
  }

  return <div className="grid gap-6"><section className="hero-card"><div><p className="eyebrow">Account Center</p><h1>Profile Trader</h1><p>Kelola identitas member dan avatar tanpa mengubah email login.</p></div><span className="role-badge">{profile.role}</span></section><form onSubmit={submit} className="panel grid gap-5"><div className="flex flex-col gap-5 sm:flex-row sm:items-center"><label className="group relative grid size-28 cursor-pointer place-items-center overflow-hidden rounded-3xl border border-fc-lime/25 bg-black">{form.avatar_url ? <img src={form.avatar_url} alt="Avatar profile" className="size-full object-cover" /> : <span className="text-2xl font-black text-fc-lime">{(form.full_name || "FC").slice(0,2).toUpperCase()}</span>}<span className="absolute inset-0 grid place-items-center bg-black/60 opacity-0 transition group-hover:opacity-100"><Camera /></span><input type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={(e) => void upload(e.target.files?.[0])} /></label><div><h2 className="text-xl font-bold">{form.full_name || "Profile Trader"}</h2><p className="text-fc-muted">{email}</p><span className="mt-2 inline-flex text-xs uppercase tracking-[.18em] text-fc-lime">Role: {profile.role}</span></div></div><div className="grid gap-4 md:grid-cols-2"><Field label="Nama Tampilan"><input value={form.full_name ?? ""} onChange={(e) => change("full_name", e.target.value)} required /></Field><Field label="Nomor Telepon"><input value={form.phone ?? ""} onChange={(e) => change("phone", e.target.value)} /></Field></div><div className="grid gap-4 md:grid-cols-2"><Field label="Nama Depan"><input value={form.first_name ?? ""} onChange={(e) => change("first_name", e.target.value)} /></Field><Field label="Nama Belakang"><input value={form.last_name ?? ""} onChange={(e) => change("last_name", e.target.value)} /></Field></div><Field label="Email Login"><input value={email} readOnly /></Field><div className="grid gap-4 md:grid-cols-2"><Field label="Kota"><input value={form.city ?? ""} onChange={(e) => change("city", e.target.value)} /></Field><Field label="Negara"><input value={form.country ?? ""} onChange={(e) => change("country", e.target.value)} /></Field></div><Field label="Alamat"><textarea rows={3} value={form.address ?? ""} onChange={(e) => change("address", e.target.value)} /></Field><Field label="Bio"><textarea rows={4} value={form.bio ?? ""} onChange={(e) => change("bio", e.target.value)} /></Field><StatusMessage tone={message?.error ? "error" : "success"}>{message?.text}</StatusMessage><button className="primary-button justify-self-start" disabled={busy}><Save className="size-4" />{busy ? "Menyimpan..." : "Simpan Profile"}</button></form></div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-2"><span className="text-sm font-semibold text-fc-muted">{label}</span>{children}</label>; }
