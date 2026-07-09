export type UserRole = "member" | "mentor" | "admin";
export type TradeDirection = "long" | "short";
export type JournalDirection = "BUY" | "SELL";
export type TradeOutcome = "Win" | "Loss" | "Breakeven";
export type TradeCategory = "forex" | "commodity" | "index" | "crypto";
export type BiasDirection = "bullish" | "bearish" | "neutral";

export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  avatar_url: string | null;
  avatar_path: string | null;
}

export interface TradeJournalRow {
  id: string;
  user_id: string;
  trade_date: string;
  pair: string;
  setup: string;
  direction: TradeDirection;
  entry_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  risk_percent: number | null;
  result_r: number | null;
  notes: string | null;
  created_at: string;
}

export interface JournalMeta {
  _journalMeta: "fcj_supabase_v1";
  category: TradeCategory;
  session: string;
  pair: string;
  lot: number;
  direction: JournalDirection;
  entry: number;
  sl: number;
  tp: number;
  exit: number;
  pnl: number;
  balanceBefore: number;
  balanceAfter: number;
  pips: number;
  rrPlan: number | null;
  rrActual: number | null;
  pct: number | null;
  emotion: string;
  outcome: TradeOutcome;
  reason: string;
  review: string;
}

export interface NormalizedTrade extends JournalMeta {
  dbId: string;
  createdAt: string;
  date: string;
}

export interface DailyBias {
  id: string;
  author_id: string;
  title: string;
  market: string;
  direction: BiasDirection;
  content: string;
  created_at: string;
  profiles?: { full_name: string | null; role: UserRole } | null;
}

export interface LearningAttendance {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  topic: string;
  session_time: string;
  note: string | null;
  proof_url: string | null;
  proof_path: string | null;
  created_at: string;
}

export interface CalendarEvent {
  date: string;
  datetime: string;
  time: string;
  currency: string;
  impact: "high" | "medium" | "low";
  event: string;
  actual: string | number | null;
  forecast: string | number | null;
  previous: string | number | null;
  country: string;
}
