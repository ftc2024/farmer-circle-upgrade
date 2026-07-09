"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { StatusMessage } from "@/components/ui/status-message";

export function LoginForm() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (!email || !password) { setMessage({ text: "Email dan password wajib diisi.", error: true }); return; }
    if (password.length < 6) { setMessage({ text: "Password minimal 6 karakter.", error: true }); return; }
    setBusy(true);
    const { error } = await createClient().auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) { setMessage({ text: "Email atau password salah.", error: true }); return; }
    router.replace("/dashboard"); router.refresh();
  }

  async function forgot(event: React.MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.form;
    const email = form?.querySelector<HTMLInputElement>('input[name="email"]')?.value.trim() ?? "";
    if (!email) { setMessage({ text: "Isi email dulu untuk reset password.", error: true }); return; }
    const { error } = await createClient().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    setMessage({ text: error ? "Gagal mengirim link reset password." : "Link reset password sudah dikirim.", error: Boolean(error) });
  }

  return <form onSubmit={submit} className="grid gap-5" noValidate>
    <label className="grid gap-2"><span className="text-sm font-semibold text-fc-muted">Email</span><input name="email" type="email" autoComplete="email" placeholder="nama@email.com" required /></label>
    <label className="grid gap-2"><span className="text-sm font-semibold text-fc-muted">Password</span><div className="relative"><input name="password" type={show ? "text" : "password"} autoComplete="current-password" className="pr-12" placeholder="••••••••" required /><button type="button" onClick={() => setShow((value) => !value)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-fc-muted" aria-label={show ? "Sembunyikan password" : "Tampilkan password"}>{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></label>
    <button type="button" onClick={forgot} className="justify-self-end text-sm font-semibold text-fc-cyan hover:underline">Lupa password?</button>
    <StatusMessage tone={message?.error ? "error" : "info"}>{message?.text}</StatusMessage>
    <button disabled={busy} className="primary-button">{busy && <Loader2 className="size-4 animate-spin" />}{busy ? "Memproses..." : "Masuk"}</button>
  </form>;
}
