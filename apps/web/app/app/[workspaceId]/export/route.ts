import { requireWorkspace } from "../../../../lib/core/access";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  const { supabase, workspace, userId } = await requireWorkspace(workspaceId);
  async function allRows(table: "core_files" | "core_tags" | "core_file_tags" | "core_notifications" | "core_audit_events" | "notes" | "journal_entries" | "productivity_audit_events") {
    const rows: Record<string, unknown>[] = [];
    for (let offset = 0; ; offset += 500) {
      let query = supabase.from(table).select("*").eq("workspace_id", workspaceId)
        .order(table === "core_file_tags" ? "file_id" : "id").range(offset, offset + 499);
      if (table === "core_file_tags") query = query.order("tag_id");
      if (table === "core_notifications") query = query.eq("recipient_id", userId);
      if (table === "core_audit_events" || table === "productivity_audit_events") query = query.eq("actor_id", userId);
      if (table === "notes" || table === "journal_entries") query = query.eq("author_id", userId);
      const { data, error } = await query;
      if (error || !data) throw new Error(`Export query failed: ${table}`);
      rows.push(...data);
      if (data.length < 500) return rows;
    }
  }
  try {
    const [files, tags, fileTags, notifications, auditEvents, notes, journalEntries, productivityAuditEvents] = await Promise.all([
      allRows("core_files"), allRows("core_tags"), allRows("core_file_tags"), allRows("core_notifications"), allRows("core_audit_events"),
      allRows("notes"), allRows("journal_entries"), allRows("productivity_audit_events"),
    ]);
    const { error: auditError } = await supabase.rpc("log_core_export", { p_workspace_id: workspaceId });
    if (auditError) throw new Error("Export audit failed");
    const payload = { format: "moduvita-workspace-v2", exported_at: new Date().toISOString(), workspace,
      files: files.map((file) => ({ ...file, download_path: `/app/${workspaceId}/files/${file.id}` })),
      tags, file_tags: fileTags, notifications, audit_events: auditEvents,
      notes, journal_entries: journalEntries, productivity_audit_events: productivityAuditEvents };
    return new Response(JSON.stringify(payload, null, 2), {
      headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="moduvita-${workspaceId}.json"`,
        "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" },
    });
  } catch {
    return new Response("Não foi possível exportar os dados.", {
      status: 503, headers: { "Cache-Control": "private, no-store", "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
