import type { Metadata } from "next";
import { TradeJournalClient } from "@/features/trades/trade-journal-client";
export const metadata: Metadata = { title: "Jurnal Trade" };
export default function JournalPage() { return <TradeJournalClient />; }
