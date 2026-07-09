"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { StatusMessage } from "@/components/ui/status-message";
import { calcAutoPnl, calcPips, calcRRActual, calcRRPlan, normalizeTrade } from "@/features/trades/calculations";
import { EMOTIONS, OUTCOMES, PAIR_DATA } from "@/features/trades/constants";
import type { JournalDirection, JournalMeta, NormalizedTrade, TradeCategory, TradeJournalRow, TradeOutcome } from "@/types/domain";

type FormState = { date: string; session: string; category: TradeCategory; pair: string; lot: string; direction: JournalDirection; entry: string; sl: string; tp: string; exit: string; pnl: string; balanceBefore: string; emotion: string; outcome: TradeOutcome; reason: string; review: string; };
const initialForm = (): FormState => ({ date: new Date().toISOString().slice(0, 10), session: "", category: "forex", pair: PAIR_DATA.forex.pairs[0], lot: "", direction: "BUY", entry: "", sl: "", tp: "", exit: "", pnl: "", balanceBefore: "", emotion: "Calm", outcome: "Win", reason: "", review: "" });

export function TradeJournalClient() {
  const [trades, setTrades] = useState<NormalizedTrade[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  async function load() { const { data } = await createClient().from("trade_journals").select("*").order("trade_date", { ascending: false }).order("created_at", { ascending: false }); setTrades(((data ?? []) as TradeJournalRow[]).map(normalizeTrade)); }
  useEffect(() => { void load(); }, []);
  const computed = useMemo(() => { const entry = Number(form.entry), sl = Number(form.sl), tp = Number(form.tp), exit = Number(form.exit), lot = Number(form.lot); if (![entry, sl, tp, exit, lot].every(Number.isFinite)) return { pips: 0, pnl: 0, rrPlan: null, rrActual: null }; return { pips: calcPips(entry, exit, form.pair, form.direction), pnl: calcAutoPnl(entry, exit, lot, form.pair, form.direction), rrPlan: calcRRPlan(entry, sl, tp), rrActual: calcRRActual(entry, sl, exit, form.direction) }; }, [form]);
  const visibleTrades = filter === "All" ? trades : trades.filter((trade) => trade.outcome === filter || trade.pair === filter);
  function update<K extends keyof FormState>(key: K, value: FormState[K]) { setForm((current) => ({ ...current, [key]: value })); }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage(null);
    const required = [form.date, form.session, form.pair, form.lot, form.entry, form.sl, form.tp, form.exit, form.reason];
    if (required.some((value) => !value)) { setMessage({ text: "Lengkapi semua field wajib sebelum menyimpan.", error: true }); return; }
    setBusy(true); const supabase = createClient(); const { data: authData } = await supabase.auth.getUser(); const user = authData.user;
    if (!user) { setBusy(false); setMessage({ text: "Session login tidak ditemukan.", error: true }); return; }
    const entry = Number(form.entry), sl = Number(form.sl), tp = Number(form.tp), exit = Number(form.exit), lot = Number(form.lot);
    const pnl = form.pnl ? Number(form.pnl) : computed.pnl; const balanceBefore = Number(form.balanceBefore || 0);
    const meta: JournalMeta = { _journalMeta: "fcj_supabase_v1", category: form.category, session: form.session, pair: form.pair, lot, direction: form.direction, entry, sl, tp, exit, pnl, balanceBefore, balanceAfter: balanceBefore + pnl, pips: computed.pips, rrPlan: computed.rrPlan, rrActual: computed.rrActual, pct: balanceBefore > 0 ? Number(((pnl / balanceBefore) * 100).toFixed(2)) : null, emotion: form.emotion, outcome: form.outcome, reason: form.reason.trim(), review: form.review.trim() };
    const payload = { user_id: user.id, trade_date: form.date, pair: form.pair, setup: form.session, direction: form.direction === "SELL" ? "short" as const : "long" as const, entry_price: entry, stop_loss: sl, take_profit: tp, risk_percent: meta.pct, result_r: pnl, notes: JSON.stringify(meta) };
    const query = editingId ? supabase.from("trade_journals").update(payload).eq("id", editingId).eq("user_id", user.id) : supabase.from("trade_journals").insert(payload);
    const { error } = await query; setBusy(false);
    if (error) { setMessage({ text: error.message, error: true }); return; }
    setForm(initialForm()); setEditingId(null); setMessage({ text: editingId ? "Trade berhasil diperbarui." : "Trade berhasil disimpan." }); await load();
  }

  function edit(trade: NormalizedTrade) { setEditingId(trade.dbId); setForm({ date: trade.date, session: trade.session, category: trade.category, pair: trade.pair, lot: String(trade.lot || ""), direction: trade.direction, entry: String(trade.entry || ""), sl: String(trade.sl || ""), tp: String(trade.tp || ""), exit: String(trade.exit || ""), pnl: String(trade.pnl || ""), balanceBefore: String(trade.balanceBefore || ""), emotion: trade.emotion, outcome: trade.outcome, reason: trade.reason, review: trade.review }); window.scrollTo({ top: 0, behavior: "smooth" }); }
  async function remove(id: string) { if (!window.confirm("Hapus jurnal trade ini?")) return; const { error } = await createClient().from("trade_journals").delete().eq("id", id); if (error) setMessage({ text: error.message, error: true }); else await load(); }

  return <div className="grid gap-6">
    <section className="hero-card"><div><p className="eyebrow">Advanced Journal</p><h1>Jurnal Trade</h1><p>Catat trade lengkap, kalkulasi pips, PnL, RR plan, RR actual, dan review psikologi.</p></div><button className="ghost-button" onClick={load}><RefreshCw className="size-4" />Refresh</button></section>
    <section className="grid gap-6 xl:grid-cols-[460px_minmax(0,1fr)] xl:items-start">
      <form onSubmit={submit} className="panel grid gap-4">
        <div className="section-heading"><h2>{editingId ? "Edit Trade" : "Tambah Trade"}</h2><span>Supabase synced</span></div>
        <div className="grid grid-cols-2 gap-3"><Field label="Tanggal"><input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} required /></Field><Field label="Session"><input value={form.session} onChange={(e) => update("session", e.target.value)} placeholder="London / NY" required /></Field></div>
        <div className="grid grid-cols-2 gap-3"><Field label="Kategori"><select value={form.category} onChange={(e) => { const category = e.target.value as TradeCategory; setForm((current) => ({ ...current, category, pair: PAIR_DATA[category].pairs[0] })); }}>{Object.entries(PAIR_DATA).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}</select></Field><Field label="Pair"><select value={form.pair} onChange={(e) => update("pair", e.target.value)}>{PAIR_DATA[form.category].pairs.map((pair) => <option key={pair}>{pair}</option>)}</select></Field></div>
        <div className="grid grid-cols-2 gap-3"><Field label="Lot Size"><input type="number" step="any" value={form.lot} onChange={(e) => update("lot", e.target.value)} required /></Field><Field label="Balance Sebelum"><input type="number" step="any" value={form.balanceBefore} onChange={(e) => update("balanceBefore", e.target.value)} /></Field></div>
        <div className="grid grid-cols-2 gap-2">{(["BUY", "SELL"] as const).map((direction) => <button key={direction} type="button" onClick={() => update("direction", direction)} className={form.direction === direction ? "choice active" : "choice"}>{direction}</button>)}</div>
        <div className="grid grid-cols-2 gap-3"><Field label="Entry"><input type="number" step="any" value={form.entry} onChange={(e) => update("entry", e.target.value)} required /></Field><Field label="Stop Loss"><input type="number" step="any" value={form.sl} onChange={(e) => update("sl", e.target.value)} required /></Field><Field label="Take Profit"><input type="number" step="any" value={form.tp} onChange={(e) => update("tp", e.target.value)} required /></Field><Field label="Harga Exit"><input type="number" step="any" value={form.exit} onChange={(e) => update("exit", e.target.value)} required /></Field></div>
        <Field label="PnL Manual (opsional)"><input type="number" step="any" value={form.pnl} onChange={(e) => update("pnl", e.target.value)} placeholder={`Auto ${computed.pnl.toFixed(2)}`} /></Field>
        <div className="grid grid-cols-3 gap-2 text-center text-xs"><Calc label="Pips" value={computed.pips.toFixed(1)} /><Calc label="RR Plan" value={computed.rrPlan ? `1:${computed.rrPlan}` : "—"} /><Calc label="RR Actual" value={computed.rrActual ? `1:${computed.rrActual}` : "—"} /></div>
        <Field label="Emosi"><select value={form.emotion} onChange={(e) => update("emotion", e.target.value)}>{EMOTIONS.map((emotion) => <option key={emotion}>{emotion}</option>)}</select></Field><Field label="Hasil"><select value={form.outcome} onChange={(e) => update("outcome", e.target.value as TradeOutcome)}>{OUTCOMES.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Alasan Entry"><textarea rows={3} value={form.reason} onChange={(e) => update("reason", e.target.value)} required /></Field><Field label="Review"><textarea rows={3} value={form.review} onChange={(e) => update("review", e.target.value)} /></Field>
        <StatusMessage tone={message?.error ? "error" : "success"}>{message?.text}</StatusMessage><div className="flex gap-3"><button className="primary-button flex-1" disabled={busy}>{busy && <Loader2 className="size-4 animate-spin" />}{editingId ? "Simpan Edit" : "Simpan Trade"}</button>{editingId && <button type="button" className="ghost-button" onClick={() => { setEditingId(null); setForm(initialForm()); }}>Batal</button>}</div>
      </form>
      <div className="panel min-w-0"><div className="mb-4 flex flex-wrap gap-2">{["All", "Win", "Loss", "Breakeven", ...[...new Set(trades.map((trade) => trade.pair))]].map((item) => <button key={item} className={filter === item ? "filter-pill active" : "filter-pill"} onClick={() => setFilter(item)}>{item}</button>)}</div><div className="overflow-auto rounded-xl border border-white/10"><table className="data-table"><thead><tr><th>Tanggal</th><th>Pair</th><th>Dir</th><th>Session</th><th>Pips</th><th>PnL</th><th>RR</th><th>Emosi</th><th>Hasil</th><th>Aksi</th></tr></thead><tbody>{visibleTrades.map((trade) => <tr key={trade.dbId}><td>{trade.date}</td><td>{trade.pair}</td><td>{trade.direction}</td><td>{trade.session}</td><td className={trade.pips >= 0 ? "text-emerald-300" : "text-red-300"}>{trade.pips}</td><td className={trade.pnl >= 0 ? "text-emerald-300" : "text-red-300"}>${trade.pnl.toFixed(2)}</td><td>{trade.rrActual ? `1:${trade.rrActual}` : "—"}</td><td>{trade.emotion}</td><td>{trade.outcome}</td><td><div className="flex gap-2"><button onClick={() => edit(trade)} className="icon-button" aria-label="Edit"><Pencil className="size-4" /></button><button onClick={() => remove(trade.dbId)} className="icon-button" aria-label="Hapus"><Trash2 className="size-4" /></button></div></td></tr>)}</tbody></table>{!visibleTrades.length && <div className="empty-state">Belum ada trade pada filter ini.</div>}</div></div>
    </section>
  </div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-2 text-sm font-semibold text-fc-muted"><span>{label}</span>{children}</label>; }
function Calc({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-white/10 bg-white/5 p-3"><span className="block text-fc-muted">{label}</span><strong className="text-fc-cyan">{value}</strong></div>; }
