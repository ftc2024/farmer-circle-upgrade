import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = { title: "Masuk" };

export default function LoginPage() {
  return <main className="min-h-screen bg-fc-bg text-fc-text lg:grid lg:grid-cols-[1.2fr_.8fr]">
    <section className="relative hidden overflow-hidden border-r border-white/10 p-12 lg:flex lg:flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(117,92,246,.28),transparent_35%),radial-gradient(circle_at_70%_70%,rgba(37,212,206,.18),transparent_35%)]" />
      <div className="relative z-10 flex items-center gap-3"><div className="grid size-12 place-items-center rounded-xl border border-fc-lime/30 bg-black font-black text-fc-lime">FC</div><strong className="text-xl">Farmer <span className="text-fc-cyan">Circle</span></strong></div>
      <div className="relative z-10 my-auto max-w-2xl"><p className="eyebrow">FTC Jember · Trading Command Center</p><h1 className="mt-4 text-5xl font-black leading-[1.08]">Sistem yang konsisten selalu menang lawan <span className="text-fc-cyan">feeling yang naik-turun.</span></h1><p className="mt-6 max-w-xl text-lg leading-8 text-fc-muted">Satu tempat buat jurnal trade, analisa intraday, review performa, daily bias, absensi, dan learning center.</p></div>
      <footer className="relative z-10 flex justify-between text-xs text-fc-muted"><span>© 2026 Farmer Trader Community</span><span>Jember · Lumajang · Probolinggo · Banyuwangi</span></footer>
    </section>
    <section className="flex min-h-screen items-center justify-center p-5 sm:p-8"><div className="w-full max-w-md rounded-3xl border border-white/10 bg-fc-panel/75 p-6 shadow-2xl backdrop-blur-xl sm:p-8"><p className="eyebrow">Secure Login · Supabase Auth</p><h1 className="mt-3 text-3xl font-black">Selamat balik, Bro</h1><p className="mt-2 mb-8 text-fc-muted">Masuk buat lanjutin sistem trading lo.</p><LoginForm /><p className="mt-6 text-center text-xs text-fc-muted">Tidak ada halaman daftar publik.</p></div></section>
  </main>;
}
