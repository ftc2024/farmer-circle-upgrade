import type { Metadata } from "next";
import { DailyBiasClient } from "@/features/daily-bias/daily-bias-client";
import { getCurrentProfile } from "@/lib/auth";
export const metadata: Metadata = { title: "Daily Bias" };
export default async function DailyBiasPage() { const profile = await getCurrentProfile(); return <DailyBiasClient role={profile?.role ?? "member"} />; }
