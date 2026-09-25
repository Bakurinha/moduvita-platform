"use server";

import { parseJournalInput } from "@moduvita/journal";
import { createProductRecord, moveProductRecord, updateProductRecord } from "../../../../lib/productivity/records";

export async function createJournalEntry(form: FormData) { await createProductRecord("journal", form, parseJournalInput(form)); }
export async function updateJournalEntry(form: FormData) { await updateProductRecord("journal", form, parseJournalInput(form)); }
export async function trashJournalEntry(form: FormData) { await moveProductRecord("journal", form, false); }
export async function restoreJournalEntry(form: FormData) { await moveProductRecord("journal", form, true); }
