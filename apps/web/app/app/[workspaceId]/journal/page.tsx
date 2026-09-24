import { ProductivityPage } from "../../../../components/productivity-page";
import { createJournalEntry, updateJournalEntry, trashJournalEntry, restoreJournalEntry } from "./actions";

export const dynamic = "force-dynamic";

export default async function JournalPage({ params, searchParams }: {
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ q?: string; page?: string; trash?: string; status?: string }>;
}) {
  const { workspaceId } = await params;
  return <ProductivityPage module="journal" workspaceId={workspaceId} searchParams={searchParams}
    actions={{ create: createJournalEntry, update: updateJournalEntry, trash: trashJournalEntry, restore: restoreJournalEntry }} />;
}
