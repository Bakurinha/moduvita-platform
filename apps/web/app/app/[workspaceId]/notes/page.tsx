import { ProductivityPage } from "../../../../components/productivity-page";
import { createNote, updateNote, trashNote, restoreNote } from "./actions";

export const dynamic = "force-dynamic";

export default async function NotesPage({ params, searchParams }: {
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ q?: string; page?: string; trash?: string; status?: string }>;
}) {
  const { workspaceId } = await params;
  return <ProductivityPage module="notes" workspaceId={workspaceId} searchParams={searchParams}
    actions={{ create: createNote, update: updateNote, trash: trashNote, restore: restoreNote }} />;
}
