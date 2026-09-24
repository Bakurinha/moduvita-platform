"use server";

import { parseNoteInput } from "@moduvita/notes";
import { createProductRecord, moveProductRecord, updateProductRecord } from "../../../../lib/productivity/records";

export async function createNote(form: FormData) { await createProductRecord("notes", form, parseNoteInput(form)); }
export async function updateNote(form: FormData) { await updateProductRecord("notes", form, parseNoteInput(form)); }
export async function trashNote(form: FormData) { await moveProductRecord("notes", form, false); }
export async function restoreNote(form: FormData) { await moveProductRecord("notes", form, true); }
