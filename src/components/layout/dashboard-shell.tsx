"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  ClipboardCheck,
  LogOut,
  Menu,
  NotebookPen,
  Radar,
  UserCog,
  X,
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";
import type { Profile } from "@/types/domain";

const items = [
  { href: "/dashboard", label: "Performance", icon: BarChart3 },
  { href: "/journal", label: "Jurnal Trade", icon: NotebookPen },
  { href: "/daily-bias", label: "Daily Bias", icon: Radar },
  { href: "/attendance", label: "Absensi", icon: ClipboardCheck },
  { href: "/calendar", label: "Kalender Ekonomi", icon: CalendarDays },
  { href: "/learning", label: "Materi & Video", icon: BookOpenCheck },
  { href: "/profile", label: "Profile", icon: UserCog },
];

export function DashboardShell({
  profile,
  email,
  children,
}: {
  profile: Profile | null;
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const name = profile?.full_name?.trim() || email.split("@")[0] || "Trader";

  return (
    <div className="min-h-screen bg-fc-bg text-fc-text lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-white/10 bg-[#090d18]/95 p-5 backdrop-blur-xl transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mb-8 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl border border-fc-lime/30 bg-black font-black text-fc-lime">FC</div>
            <div><strong className="block">Farmer Circle</strong><span className="text-xs uppercase tracking-[.18em] text-fc-muted">{profile?.role ?? "member"}</span></div>
          </Link>
          <button className="rounded-lg p-2 lg:hidden" onClick={() => setOpen(false)} aria-label="Tutup navigasi"><X className="size-5" /></button>
        </div>
        <nav className="grid gap-2">
          {items.map((item) => { const active = pathname === item.href; const Icon = item.icon; return <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={cn("flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-fc-muted transition", active ? "border border-fc-cyan/30 bg-fc-cyan/10 text-white" : "hover:bg-white/5 hover:text-white")}><Icon className="size-4" />{item.label}</Link>; })}
        </nav>
        <div className="mt-auto border-t border-white/10 pt-5">
          <Link href="/profile" className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 p-3"><div className="grid size-10 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-fc-purple to-fc-cyan text-sm font-black text-black">{name.slice(0, 2).toUpperCase()}</div><div className="min-w-0"><strong className="block truncate text-sm">{name}</strong><span className="block truncate text-xs text-fc-muted">{email}</span></div></Link>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-fc-muted hover:bg-white/5 hover:text-white"><LogOut className="size-4" />Keluar</button>
        </div>
      </aside>
      {open && <button className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={() => setOpen(false)} aria-label="Tutup menu" />}
      <main className="min-w-0"><header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-white/10 bg-fc-bg/85 px-4 backdrop-blur-xl md:px-7"><button className="rounded-xl border border-white/10 p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Buka navigasi"><Menu className="size-5" /></button><div className="ml-auto text-right"><span className="block text-xs uppercase tracking-[.18em] text-fc-muted">Trading Command Center</span><strong className="text-sm">{name}</strong></div></header><div className="p-4 md:p-7 xl:p-9">{children}</div></main>
    </div>
  );
}
