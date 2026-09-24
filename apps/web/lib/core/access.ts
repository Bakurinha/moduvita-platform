import { notFound, redirect } from "next/navigation";
import { createClient } from "../supabase/server";
import { hasSupabaseConfig } from "../supabase/config";

export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function requireWorkspace(workspaceId: string) {
  if (!hasSupabaseConfig()) redirect("/login?status=config");
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getClaims();
  if (!user?.claims) redirect("/login");
  if (!uuidPattern.test(workspaceId)) notFound();
  const { data: workspace, error } = await supabase.from("workspaces")
    .select("id, name, kind").eq("id", workspaceId).maybeSingle();
  if (error || !workspace) notFound();
  return { supabase, workspace, userId: user.claims.sub };
}
