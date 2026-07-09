import type { Metadata } from "next";
import { AttendanceClient } from "@/features/attendance/attendance-client";
export const metadata: Metadata = { title: "Absensi" };
export default function AttendancePage() { return <AttendanceClient />; }
