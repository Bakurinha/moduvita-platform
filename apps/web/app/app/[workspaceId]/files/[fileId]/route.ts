import { notFound } from "next/navigation";
import { requireWorkspace, uuidPattern } from "../../../../../lib/core/access";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ workspaceId: string; fileId: string }> }) {
  const { workspaceId, fileId } = await params;
  const { supabase } = await requireWorkspace(workspaceId);
  if (!uuidPattern.test(fileId)) notFound();
  const { data: file, error } = await supabase.from("core_files")
    .select("name, object_path").eq("workspace_id", workspaceId).eq("id", fileId).maybeSingle();
  if (error || !file) notFound();
  const { data, error: downloadError } = await supabase.storage.from("workspace-files").download(file.object_path);
  if (downloadError || !data) notFound();
  return new Response(data, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
