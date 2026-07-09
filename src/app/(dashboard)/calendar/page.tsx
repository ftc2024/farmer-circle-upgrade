import type { Metadata } from "next";
import { CalendarClient } from "@/features/calendar/calendar-client";
export const metadata: Metadata = { title: "Kalender Ekonomi" };
export default function CalendarPage() { return <CalendarClient />; }
