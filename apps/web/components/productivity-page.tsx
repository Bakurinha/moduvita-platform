import Link from "next/link";
import { requireWorkspace } from "../lib/core/access";
import styles from "./productivity.module.css";

type ProductModule = "notes" | "journal";
type Action = (form: FormData) => Promise<void>;
type ProductRecord = {
  id: string; title: string; body: string; created_at: string; updated_at: string;
  deleted_at: string | null; entry_date?: string;
};

const messages: Record<string, string> = {
  created: "Registro salvo.", updated: "Alterações salvas.", trashed: "Registro na lixeira.",
  restored: "Registro restaurado.", invalid: "Preencha título e texto. Limites: 120 e 20 mil caracteres.",
  error: "Não foi possível salvar. Confira a conexão e a migração de Produtividade.",
  confirm: "Confirme o envio para a lixeira antes de continuar.",
};

function Editor({ module, workspaceId, action, record }: {
  module: ProductModule; workspaceId: string; action: Action; record?: ProductRecord;
}) {
  const suffix = record?.id ?? "new";
  return <form className={styles.form} action={action}>
    <input type="hidden" name="workspaceId" value={workspaceId} />
    {record && <input type="hidden" name="recordId" value={record.id} />}
    {module === "journal" && <><label htmlFor={"date-" + suffix}>Data</label>
      <input id={"date-" + suffix} name="entry_date" type="date" required defaultValue={record?.entry_date ?? new Date().toISOString().slice(0, 10)} /></>}
    <label htmlFor={"title-" + suffix}>Título</label>
    <input id={"title-" + suffix} name="title" maxLength={120} required defaultValue={record?.title ?? ""} />
    <label htmlFor={"body-" + suffix}>Texto</label>
    <textarea id={"body-" + suffix} name="body" rows={record ? 6 : 8} maxLength={20000} required defaultValue={record?.body ?? ""} />
    <button type="submit">{record ? "Salvar alterações" : module === "notes" ? "Criar nota" : "Registrar o dia"}</button>
  </form>;
}

export async function ProductivityPage({ module, workspaceId, searchParams, actions }: {
  module: ProductModule; workspaceId: string;
  searchParams: Promise<{ q?: string; page?: string; trash?: string; status?: string }>;
  actions: { create: Action; update: Action; trash: Action; restore: Action };
}) {
  const { supabase, workspace } = await requireWorkspace(workspaceId);
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 80) : "";
  const page = typeof params.page === "string" && /^\d{1,3}$/.test(params.page)
    ? Math.min(Number(params.page), 500) : 0;
  const trashed = params.trash === "1";
  const title = module === "notes" ? "Notas" : "Diário";
  const route = "/app/" + workspaceId + "/" + module;
  const pageUrl = (target: number, trash = trashed) => {
    const search = new URLSearchParams();
    if (query) search.set("q", query);
    if (trash) search.set("trash", "1");
    if (target) search.set("page", String(target));
    return route + (search.size ? "?" + search.toString() : "");
  };
  const { data, error } = await supabase.rpc(module === "notes" ? "search_notes" : "search_journal", {
    p_workspace_id: workspaceId, p_query: query, p_deleted: trashed, p_offset: page * 20,
  });
  const rows = (data ?? []) as ProductRecord[];
  const hasNext = rows.length > 20;
  const records = rows.slice(0, 20);

  return <main className={styles.shell}>
    <nav className={styles.nav}><Link href={"/app/" + workspaceId}>← {workspace.name}</Link><span>{title}</span></nav>
    <header className={styles.heading}><span className={styles.eyebrow}>WORKSPACE / {workspace.kind === "professional" ? "PROFISSIONAL" : "PESSOAL"}</span>
      <h1>{title}</h1><p>{module === "notes" ? "Guarde ideias e textos no seu espaço." : "Registre seus dias com a data que escolher."} Somente você pode acessar seus registros neste workspace.</p></header>
    {params.status && Object.hasOwn(messages, params.status) && <p className={styles.notice} role="status">{messages[params.status]}</p>}
    {error ? <p className={styles.notice} role="alert">Este módulo ainda não está disponível. Aplique a migração de Produtividade no Supabase.</p> : <>
      {!trashed && <section className={styles.panel}><h2>{module === "notes" ? "Nova nota" : "Nova entrada"}</h2>
        <Editor module={module} workspaceId={workspaceId} action={actions.create} /></section>}
      <section className={styles.records}><div className={styles.listHeader}><h2>{trashed ? "Lixeira" : "Registros"}</h2>
        <Link href={pageUrl(0, !trashed)}>{trashed ? "Ver ativos" : "Abrir lixeira"}</Link></div>
        <form className={styles.search} method="get">
          {trashed && <input type="hidden" name="trash" value="1" />}
          <label htmlFor="product-search">Buscar por título ou texto</label>
          <input id="product-search" name="q" maxLength={80} defaultValue={query} /><button type="submit">Buscar</button>
        </form>
        {records.length === 0 && <p className={styles.empty}>Nenhum registro encontrado.</p>}
        <ul className={styles.list}>{records.map((record) => <li className={styles.record} key={record.id}>
          <div className={styles.recordTop}><div><h3>{record.title}</h3><small>{module === "journal" ? record.entry_date + " · " : ""}Atualizado em {new Date(record.updated_at).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</small></div></div>
          <p className={styles.body}>{record.body}</p>
          {trashed ? <form action={actions.restore}><input type="hidden" name="workspaceId" value={workspaceId} /><input type="hidden" name="recordId" value={record.id} /><button type="submit">Restaurar</button></form>
            : <div className={styles.controls}><details><summary>Editar</summary><Editor module={module} workspaceId={workspaceId} action={actions.update} record={record} /></details>
              <form action={actions.trash}><input type="hidden" name="workspaceId" value={workspaceId} /><input type="hidden" name="recordId" value={record.id} />
                <label><input type="checkbox" name="confirm" value="yes" required /> Confirmo mover para a lixeira</label><button type="submit">Mover</button></form></div>}
        </li>)}</ul>
        <div className={styles.pages}>{page > 0 && <Link href={pageUrl(page - 1)}>← Anterior</Link>}{hasNext && page < 500 && <Link href={pageUrl(page + 1)}>Próxima →</Link>}</div>
      </section>
    </>}
  </main>;
}
