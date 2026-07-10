"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { StatusMessage } from "@/components/ui/status-message";

export function ResetPasswordForm() {
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const password = String(form.get("password") ?? ""); const confirm = String(form.get("confirm") ?? "");
    if (password.length < 6) { setMessage({ text: "Password minimal 6 karakter.", error: true }); return; }
    if (password !== confirm) { setMessage({ text: "Konfirmasi password belum sama.", error: true }); return; }
    setBusy(true); const { error } = await createClient().auth.updateUser({ password }); setBusy(false);
    setMessage({ text: error ? error.message : "Password berhasil diperbarui. Silakan kembali ke dashboard.", error: Boolean(error) });
  }
  return <form onSubmit={submit} className="grid gap-5"><label className="grid gap-2"><span>Password Baru</span><input name="password" type="password" minLength={6} required /></label><label className="grid gap-2"><span>Konfirmasi Password</span><input name="confirm" type="password" minLength={6} required /></label><StatusMessage tone={message?.error ? "error" : "success"}>{message?.text}</StatusMessage><button className="primary-button" disabled={busy}>{busy ? "Menyimpan..." : "Simpan Password Baru"}</button></form>;
}
