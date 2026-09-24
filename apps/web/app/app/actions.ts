"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { hasSupabaseConfig } from "../../lib/supabase/config";
import type { WorkspaceKind } from "@moduvita/core";

export async function createWorkspace(formData: FormData) {
  if (!hasSupabaseConfig()) redirect("/login?status=config");
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getClaims();
  if (!user?.claims) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const kind = String(formData.get("kind") ?? "");
  if (name.length < 1 || name.length > 80 || !(["personal", "professional"] as WorkspaceKind[]).includes(kind as WorkspaceKind)) {
    redirect("/app?status=invalid");
  }

  const { data: id, error } = await supabase.rpc("create_workspace", { p_name: name, p_kind: kind });
  if (error || typeof id !== "string") redirect("/app?status=error");
  redirect(`/app/${id}`);
}

export async function signOut() {
  if (!hasSupabaseConfig()) redirect("/");
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
