"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { calculateStats, equityCurve, monthlyPerformance, pairBreakdown } from "@/features/analytics/calculations";
import { normalizeTrade } from "@/features/trades/calculations";
import type { NormalizedTrade, TradeJournalRow } from "@/types/domain";

const money = (value: number) => `${value >= 0 ? "+" : "-"}$${Math.abs(value).toFixed(2)}`;

export function PerformanceDashboard() {
  const [trades, setTrades] = useState<NormalizedTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [pair, setPair] = useState("all");
  const [outcome, setOutcome] = useState("all");

  async function load() {
    setLoading(true);
    const { data } = await createClient().from("trade_journals").select("*").order("trade_date", { ascending: false }).order("created_at", { ascending: false });
    setTrades(((data ?? []) as TradeJournalRow[]).map(normalizeTrade));
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);
  const filtered = useMemo(() => trades.filter((trade) => (pair === "all" || trade.pair === pair) && (outcome === "all" || trade.outcome === outcome)), [trades, pair, outcome]);
  const stats = calculateStats(filtered);
  const equity = equityCurve(filtered);
  const monthly = monthlyPerformance(filtered);
  const pairs = pairBreakdown(filtered);
  const pairOptions = [...new Set(trades.map((trade) => trade.pair))].sort();

  return <div className="grid gap-6">
    <section className="hero-card"><div><p className="eyebrow">Trading Analytics</p><h1>Performance Dashboard</h1><p>Ringkasan performa sistem berdasarkan jurnal trade yang tersimpan di Supabase.</p></div><button onClick={load} className="ghost-button" disabled={loading}><RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} />Refresh</button></section>
    <section className="panel grid gap-4 md:grid-cols-2"><label className="grid gap-2"><span>Pair</span><select value={pair} onChange={(e) => setPair(e.target.value)}><option value="all">Semua pair</option>{pairOptions.map((item) => <option key={item}>{item}</option>)}</select></label><label className="grid gap-2"><span>Hasil</span><select value={outcome} onChange={(e) => setOutcome(e.target.value)}><option value="all">Semua hasil</option><option>Win</option><option>Loss</option><option>Breakeven</option></select></label></section>
    <section className="stats-grid"><article className="stat-card"><span>Total Trade</span><strong>{stats.total}</strong><small>{stats.wins}W / {stats.losses}L / {stats.breakeven}BE</small></article><article className="stat-card"><span>Win Rate</span><strong>{stats.winRate.toFixed(1)}%</strong><small>Outcome terklasifikasi</small></article><article className="stat-card accent"><span>Net PnL</span><strong>{money(stats.netPnl)}</strong><small>Avg {money(stats.avgPnl)} / trade</small></article><article className="stat-card"><span>Profit Factor</span><strong>{stats.profitFactor === Infinity ? "∞" : stats.profitFactor.toFixed(2)}</strong><small>Best {money(stats.best)} · Worst {money(stats.worst)}</small></article></section>
    <section className="analytics-grid">
      <article className="panel xl:col-span-2"><div className="section-heading"><h2>Equity Curve</h2><span>Cumulative PnL</span></div>{equity.length ? <EquityChart values={equity.map((item) => item.value)} /> : <Empty />}</article>
      <article className="panel"><div className="section-heading"><h2>Monthly Performance</h2><span>6 bulan terakhir</span></div><div className="grid gap-3">{monthly.length ? monthly.map((item) => <div key={item.month} className="flex items-center justify-between rounded-xl bg-white/5 p-3"><span>{item.month}</span><strong className={item.value >= 0 ? "text-emerald-300" : "text-red-300"}>{money(item.value)}</strong></div>) : <Empty />}</div></article>
      <article className="panel"><div className="section-heading"><h2>Pair Breakdown</h2><span>Top pair</span></div><div className="grid gap-3">{pairs.length ? pairs.map((item) => <div key={item.pair} className="flex items-center justify-between rounded-xl bg-white/5 p-3"><div><strong className="block">{item.pair}</strong><small className="text-fc-muted">{item.count} trade · {item.winRate.toFixed(0)}% WR</small></div><strong className={item.pnl >= 0 ? "text-emerald-300" : "text-red-300"}>{money(item.pnl)}</strong></div>) : <Empty />}</div></article>
    </section>
  </div>;
}

function Empty() { return <div className="empty-state">Belum ada data untuk ditampilkan.</div>; }
function EquityChart({ values }: { values: number[] }) {
  const width = 720, height = 240, pad = 24;
  const min = Math.min(0, ...values), max = Math.max(0, ...values), range = max - min || 1;
  const points = values.map((value, index) => { const x = values.length === 1 ? width / 2 : pad + (index / (values.length - 1)) * (width - pad * 2); const y = height - pad - ((value - min) / range) * (height - pad * 2); return `${x},${y}`; }).join(" ");
  return <div className="h-64 w-full overflow-hidden"><svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-full w-full"><polyline points={points} fill="none" stroke="currentColor" strokeWidth="4" className="text-fc-cyan" /></svg></div>;
}
