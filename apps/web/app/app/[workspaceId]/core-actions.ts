"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { requireWorkspace, uuidPattern } from "../../../lib/core/access";

const allowedTypes = new Set(["application/pdf", "text/plain", "image/png", "image/jpeg"]);
const maxFileSize = 5 * 1024 * 1024;

function destination(workspaceId: string, status: string): never {
  redirect(`/app/${workspaceId}?status=${status}`);
}

export async function uploadCoreFile(formData: FormData) {
  const workspaceId = String(formData.get("workspaceId") ?? "");
  const { supabase, userId } = await requireWorkspace(workspaceId);
  const file = formData.get("file");
  if (!(file instanceof File) || file.size < 1 || file.size > maxFileSize || !allowedTypes.has(file.type)) {
    destination(workspaceId, "invalid-file");
  }
  const name = file.name.replace(/[\\/\u0000-\u001f\u007f]/g, "_").trim().slice(0, 180);
  if (!name) destination(workspaceId, "invalid-file");
  const id = randomUUID();
  const objectPath = `${workspaceId}/${id}/${name}`;
  const { error: uploadError } = await supabase.storage.from("workspace-files").upload(objectPath, file, {
    contentType: file.type, upsert: false,
  });
  if (uploadError) destination(workspaceId, "upload-error");
  const { error } = await supabase.from("core_files").insert({
    id, workspace_id: workspaceId, uploaded_by: userId, name,
    object_path: objectPath, content_type: file.type, size_bytes: file.size,
  });
  if (error) {
    await supabase.storage.from("workspace-files").remove([objectPath]);
    destination(workspaceId, "upload-error");
  }
  revalidatePath(`/app/${workspaceId}`);
  destination(workspaceId, "uploaded");
}

export async function createCoreTag(formData: FormData) {
  const workspaceId = String(formData.get("workspaceId") ?? "");
  const { supabase } = await requireWorkspace(workspaceId);
  const name = String(formData.get("name") ?? "").trim();
  if (!name || name.length > 40) destination(workspaceId, "invalid-tag");
  const { error } = await supabase.from("core_tags").insert({ workspace_id: workspaceId, name });
  if (error) destination(workspaceId, "tag-error");
  revalidatePath(`/app/${workspaceId}`);
  destination(workspaceId, "tag-created");
}

export async function tagCoreFile(formData: FormData) {
  const workspaceId = String(formData.get("workspaceId") ?? "");
  const { supabase } = await requireWorkspace(workspaceId);
  const fileId = String(formData.get("fileId") ?? "");
  const tagId = String(formData.get("tagId") ?? "");
  if (!uuidPattern.test(fileId) || !uuidPattern.test(tagId)) destination(workspaceId, "tag-error");
  const { error } = await supabase.from("core_file_tags").insert({ workspace_id: workspaceId, file_id: fileId, tag_id: tagId });
  if (error) destination(workspaceId, "tag-error");
  revalidatePath(`/app/${workspaceId}`);
  destination(workspaceId, "tagged");
}

export async function markCoreNotificationRead(formData: FormData) {
  const workspaceId = String(formData.get("workspaceId") ?? "");
  const { supabase, userId } = await requireWorkspace(workspaceId);
  const id = String(formData.get("notificationId") ?? "");
  if (!uuidPattern.test(id)) destination(workspaceId, "notification-error");
  const { error } = await supabase.from("core_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id).eq("workspace_id", workspaceId).eq("recipient_id", userId).is("read_at", null);
  if (error) destination(workspaceId, "notification-error");
  revalidatePath(`/app/${workspaceId}`);
  destination(workspaceId, "read");
}
