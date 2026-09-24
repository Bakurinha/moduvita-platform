"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { hasSupabaseConfig } from "../../lib/supabase/config";

export async function sendSignInLink(formData: FormData) {
  if (!hasSupabaseConfig()) redirect("/login?status=config");

  const email = String(formData.get("email") ?? "").trim();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect("/login?status=email");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL!.replace(/\/$/, "")}/auth/callback`,
      shouldCreateUser: true,
    },
  });

  redirect(error ? "/login?status=error" : "/login?status=sent");
}
