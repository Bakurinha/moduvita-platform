/** Contrato público do módulo Notas. O Core e outros módulos não importam seus detalhes. */
export interface NoteInput { title: string; body: string }

export function parseNoteInput(form: FormData): NoteInput | null {
  const title = String(form.get("title") ?? "").trim();
  const body = String(form.get("body") ?? "").trim();
  if (title.length < 1 || title.length > 120 || body.length < 1 || body.length > 20000) return null;
  return { title, body };
}
