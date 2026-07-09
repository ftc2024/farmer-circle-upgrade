import type { Metadata } from "next";
import { LearningCenter } from "@/features/learning/learning-center";
export const metadata: Metadata = { title: "Materi & Video" };
export default function LearningPage() { return <LearningCenter />; }
