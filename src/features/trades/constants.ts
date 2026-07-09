import type { TradeCategory } from "@/types/domain";

export const PAIR_DATA: Record<
  TradeCategory,
  { label: string; pairs: string[] }
> = {
  forex: {
    label: "Forex",
    pairs: [
      "EUR/USD", "GBP/USD", "USD/JPY", "GBP/JPY", "USD/CAD", "AUD/USD",
      "NZD/USD", "EUR/GBP", "EUR/JPY", "AUD/JPY", "USD/CHF", "EUR/CHF",
      "CAD/JPY", "GBP/CAD", "EUR/AUD"
    ],
  },
  commodity: { label: "Commodity", pairs: ["XAU/USD", "XAG/USD"] },
  index: { label: "Index", pairs: ["US30", "NASDAQ", "USOIL"] },
  crypto: { label: "Crypto", pairs: ["BTC/USD", "DOGE/USD", "SOL/USD", "TRX/USD"] },
};

export const PIP_VALUE_PER_LOT: Record<string, number> = {
  "EUR/USD": 10, "GBP/USD": 10, "AUD/USD": 10, "NZD/USD": 10, "EUR/GBP": 10,
  "GBP/CAD": 10, "EUR/AUD": 10, "USD/JPY": 9.3, "GBP/JPY": 9.3, "EUR/JPY": 9.3,
  "AUD/JPY": 9.3, "CAD/JPY": 9.3, "USD/CAD": 10, "USD/CHF": 10, "EUR/CHF": 10,
  "XAU/USD": 1, "XAG/USD": 0.5, "US30": 1, "NASDAQ": 1, "USOIL": 1,
  "BTC/USD": 1, "DOGE/USD": 1, "SOL/USD": 1, "TRX/USD": 1,
};

export const EMOTIONS = ["Calm", "Confident", "Fear", "FOMO", "Greedy", "Revenge"];
export const OUTCOMES = ["Win", "Loss", "Breakeven"] as const;
