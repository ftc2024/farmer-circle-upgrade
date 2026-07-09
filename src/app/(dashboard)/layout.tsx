import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getCurrentProfile, requireUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireUser();
  const profile = await getCurrentProfile();
  return <DashboardShell profile={profile} email={user.email ?? ""}>{children}</DashboardShell>;
}
