import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireWorkspace, uuidPattern } from "../core/access";

export type ProductModule = "notes" | "journal";
type RecordInput = { title: string; body: string; entry_date?: string };

const tableFor = { notes: "notes", journal: "journal_entries" } as const;

function listUrl(module: ProductModule, workspaceId: string, status: string, trashed = false): never {
  redirect("/app/" + workspaceId + "/" + module + "?status=" + status + (trashed ? "&trash=1" : ""));
}

export async function createProductRecord(module: ProductModule, form: FormData, input: RecordInput | null) {
  const workspaceId = String(form.get("workspaceId") ?? "");
  const { supabase, userId } = await requireWorkspace(workspaceId);
  if (!input) listUrl(module, workspaceId, "invalid");
  const { error } = await supabase.from(tableFor[module]).insert({
    ...input, workspace_id: workspaceId, author_id: userId,
  });
  if (error) listUrl(module, workspaceId, "error");
  revalidatePath("/app/" + workspaceId + "/" + module);
  listUrl(module, workspaceId, "created");
}

export async function updateProductRecord(module: ProductModule, form: FormData, input: RecordInput | null) {
  const workspaceId = String(form.get("workspaceId") ?? "");
  const { supabase, userId } = await requireWorkspace(workspaceId);
  if (!input) listUrl(module, workspaceId, "invalid");
  const id = String(form.get("recordId") ?? "");
  if (!uuidPattern.test(id)) notFound();
  const { data, error } = await supabase.from(tableFor[module]).update(input)
    .eq("id", id).eq("workspace_id", workspaceId).eq("author_id", userId).is("deleted_at", null)
    .select("id").maybeSingle();
  if (error) listUrl(module, workspaceId, "error");
  if (!data) notFound();
  revalidatePath("/app/" + workspaceId + "/" + module);
  listUrl(module, workspaceId, "updated");
}

export async function moveProductRecord(module: ProductModule, form: FormData, restore: boolean) {
  const workspaceId = String(form.get("workspaceId") ?? "");
  const { supabase, userId } = await requireWorkspace(workspaceId);
  const id = String(form.get("recordId") ?? "");
  if (!uuidPattern.test(id)) notFound();
  if (!restore && form.get("confirm") !== "yes") listUrl(module, workspaceId, "confirm");
  let query = supabase.from(tableFor[module])
    .update({ deleted_at: restore ? null : new Date().toISOString() })
    .eq("id", id).eq("workspace_id", workspaceId).eq("author_id", userId);
  query = restore ? query.not("deleted_at", "is", null) : query.is("deleted_at", null);
  const { data, error } = await query.select("id").maybeSingle();
  if (error) listUrl(module, workspaceId, "error", !restore);
  if (!data) notFound();
  revalidatePath("/app/" + workspaceId + "/" + module);
  listUrl(module, workspaceId, restore ? "restored" : "trashed", !restore);
}
