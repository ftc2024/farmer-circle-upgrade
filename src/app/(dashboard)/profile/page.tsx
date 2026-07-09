import type { Metadata } from "next";
import { ProfileClient } from "@/features/profile/profile-client";
import { getCurrentProfile, requireUser } from "@/lib/auth";
export const metadata: Metadata = { title: "Profile" };
export default async function ProfilePage() { const { user } = await requireUser(); const profile = await getCurrentProfile(); if (!profile) return null; return <ProfileClient profile={profile} email={user.email ?? ""} />; }
