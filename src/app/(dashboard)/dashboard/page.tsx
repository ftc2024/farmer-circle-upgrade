import type { Metadata } from "next";
import { PerformanceDashboard } from "@/features/analytics/performance-dashboard";
export const metadata: Metadata = { title: "Performance" };
export default function DashboardPage() { return <PerformanceDashboard />; }
