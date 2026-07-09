import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types/domain";

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  return { supabase, user };
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const { supabase, user } = await requireUser();
  const { data } = await supabase
    .from("profiles")
    .select(
      "id, full_name, role, phone, first_name, last_name, bio, address, city, country, avatar_url, avatar_path"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (!data) {
    return {
      id: user.id,
      full_name: user.user_metadata.full_name ?? null,
      role: (user.user_metadata.role as UserRole | undefined) ?? "member",
      phone: null,
      first_name: null,
      last_name: null,
      bio: null,
      address: null,
      city: null,
      country: null,
      avatar_url: user.user_metadata.avatar_url ?? null,
      avatar_path: user.user_metadata.avatar_path ?? null,
    };
  }

  return data as Profile;
}
