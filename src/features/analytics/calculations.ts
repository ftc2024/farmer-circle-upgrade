import type { NormalizedTrade } from "@/types/domain";

export interface TradeStats {
  total: number;
  wins: number;
  losses: number;
  breakeven: number;
  winRate: number;
  netPnl: number;
  avgPnl: number;
  profitFactor: number;
  best: number;
  worst: number;
}

export function calculateStats(rows: NormalizedTrade[]): TradeStats {
  const pnls = rows.map((row) => Number(row.pnl || 0));
  const wins = pnls.filter((v) => v > 0);
  const losses = pnls.filter((v) => v < 0);
  const netPnl = pnls.reduce((sum, value) => sum + value, 0);
  const grossProfit = wins.reduce((sum, value) => sum + value, 0);
  const grossLoss = Math.abs(losses.reduce((sum, value) => sum + value, 0));

  return {
    total: rows.length,
    wins: wins.length,
    losses: losses.length,
    breakeven: pnls.filter((v) => v === 0).length,
    winRate: rows.length ? (wins.length / rows.length) * 100 : 0,
    netPnl,
    avgPnl: rows.length ? netPnl / rows.length : 0,
    profitFactor:
      grossLoss === 0 ? (grossProfit > 0 ? Number.POSITIVE_INFINITY : 0) : grossProfit / grossLoss,
    best: pnls.length ? Math.max(...pnls) : 0,
    worst: pnls.length ? Math.min(...pnls) : 0,
  };
}

export function equityCurve(rows: NormalizedTrade[]) {
  let cumulative = 0;
  return [...rows]
    .sort(
      (a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime() ||
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    .map((row) => ({
      date: row.date,
      value: (cumulative += Number(row.pnl || 0)),
    }));
}

export function monthlyPerformance(rows: NormalizedTrade[]) {
  const map = new Map<string, number>();
  rows.forEach((row) => {
    const key = row.date.slice(0, 7);
    map.set(key, (map.get(key) ?? 0) + Number(row.pnl || 0));
  });
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, value]) => ({ month, value }));
}

export function pairBreakdown(rows: NormalizedTrade[]) {
  const map = new Map<string, { count: number; wins: number; pnl: number }>();
  rows.forEach((row) => {
    const item = map.get(row.pair) ?? { count: 0, wins: 0, pnl: 0 };
    item.count += 1;
    item.pnl += Number(row.pnl || 0);
    if (row.pnl > 0) item.wins += 1;
    map.set(row.pair, item);
  });
  return [...map.entries()]
    .map(([pair, value]) => ({
      pair,
      ...value,
      winRate: value.count ? (value.wins / value.count) * 100 : 0,
    }))
    .sort((a, b) => b.pnl - a.pnl)
    .slice(0, 6);
}
