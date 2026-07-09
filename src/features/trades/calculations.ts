import { PAIR_DATA, PIP_VALUE_PER_LOT } from "@/features/trades/constants";
import type {
  JournalDirection,
  JournalMeta,
  NormalizedTrade,
  TradeJournalRow,
} from "@/types/domain";

function getPipFactor(pair: string): number {
  if (pair.includes("JPY")) return 100;
  if (pair === "XAU/USD") return 10;
  if (pair === "XAG/USD") return 100;
  if (["US30", "NASDAQ", "USOIL", "BTC/USD"].includes(pair)) return 1;
  return 10000;
}

export function inferCategory(pair: string) {
  return (
    Object.entries(PAIR_DATA).find(([, value]) =>
      value.pairs.includes(pair)
    )?.[0] ?? "forex"
  );
}

export function calcPips(
  entry: number,
  exit: number,
  pair: string,
  direction: JournalDirection
): number {
  const raw = direction === "SELL" ? entry - exit : exit - entry;
  return Number((raw * getPipFactor(pair)).toFixed(1));
}

export function calcAutoPnl(
  entry: number,
  exit: number,
  lot: number,
  pair: string,
  direction: JournalDirection
): number {
  return Number(
    (calcPips(entry, exit, pair, direction) *
      (PIP_VALUE_PER_LOT[pair] ?? 10) *
      lot).toFixed(2)
  );
}

export function calcRRPlan(entry: number, sl: number, tp: number) {
  const risk = Math.abs(entry - sl);
  return risk > 0 ? Number((Math.abs(tp - entry) / risk).toFixed(2)) : null;
}

export function calcRRActual(
  entry: number,
  sl: number,
  exit: number,
  direction: JournalDirection
) {
  const risk = Math.abs(entry - sl);
  const reward = direction === "SELL" ? entry - exit : exit - entry;
  return risk > 0 ? Number((reward / risk).toFixed(2)) : null;
}

export function parseJournalMeta(notes: string | null): Partial<JournalMeta> {
  if (!notes) return {};
  try {
    const parsed = JSON.parse(notes) as Partial<JournalMeta>;
    return parsed._journalMeta === "fcj_supabase_v1" ? parsed : {};
  } catch {
    return {};
  }
}

export function normalizeTrade(row: TradeJournalRow): NormalizedTrade {
  const meta = parseJournalMeta(row.notes);
  const direction: JournalDirection =
    meta.direction ?? (row.direction === "short" ? "SELL" : "BUY");
  const entry = Number(meta.entry ?? row.entry_price ?? 0);
  const sl = Number(meta.sl ?? row.stop_loss ?? 0);
  const tp = Number(meta.tp ?? row.take_profit ?? 0);
  const exit = Number(meta.exit ?? 0);
  const pnl = Number(meta.pnl ?? row.result_r ?? 0);

  return {
    dbId: row.id,
    createdAt: row.created_at,
    date: row.trade_date,
    _journalMeta: "fcj_supabase_v1",
    category: (meta.category ?? inferCategory(row.pair)) as JournalMeta["category"],
    session: meta.session ?? row.setup ?? "—",
    pair: meta.pair ?? row.pair,
    lot: Number(meta.lot ?? 0),
    direction,
    entry,
    sl,
    tp,
    exit,
    pnl,
    balanceBefore: Number(meta.balanceBefore ?? 0),
    balanceAfter: Number(meta.balanceAfter ?? 0),
    pips: Number(meta.pips ?? (exit ? calcPips(entry, exit, row.pair, direction) : 0)),
    rrPlan: meta.rrPlan ?? calcRRPlan(entry, sl, tp),
    rrActual: meta.rrActual ?? (exit ? calcRRActual(entry, sl, exit, direction) : null),
    pct: meta.pct ?? row.risk_percent ?? null,
    emotion: meta.emotion ?? "—",
    outcome:
      meta.outcome ??
      (pnl > 0 ? "Win" : pnl < 0 ? "Loss" : "Breakeven"),
    reason: meta.reason ?? row.setup ?? "",
    review: meta.review ?? "",
  };
}
