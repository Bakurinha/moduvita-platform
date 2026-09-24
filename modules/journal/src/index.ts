/** Contrato público do módulo Diário. */
export interface JournalInput { entry_date: string; title: string; body: string }

export function parseJournalInput(form: FormData): JournalInput | null {
  const entry_date = String(form.get("entry_date") ?? "");
  const title = String(form.get("title") ?? "").trim();
  const body = String(form.get("body") ?? "").trim();
  const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(entry_date) ? new Date(entry_date + "T00:00:00Z") : null;
  if (!parsedDate || Number.isNaN(parsedDate.valueOf()) || parsedDate.toISOString().slice(0, 10) !== entry_date
    || title.length < 1 || title.length > 120 || body.length < 1 || body.length > 20000) return null;
  return { entry_date, title, body };
}
