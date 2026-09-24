import Link from "next/link";
import { requireWorkspace } from "../../../lib/core/access";
import { signOut } from "../actions";
import { createCoreTag, markCoreNotificationRead, tagCoreFile, uploadCoreFile } from "./core-actions";
import styles from "../../workspace.module.css";

export const dynamic = "force-dynamic";

type CoreFile = { id: string; name: string; size_bytes: number; created_at: string };

const messages: Record<string, string> = {
  "invalid-file": "Escolha um PDF, TXT, PNG ou JPG de até 5 MB.",
  "upload-error": "Não foi possível salvar o arquivo. Confira o bucket privado e a migração do Core.",
  uploaded: "Arquivo privado adicionado.",
  "invalid-tag": "Informe uma tag de 1 a 40 caracteres.",
  "tag-error": "Não foi possível criar ou associar a tag. Ela pode já existir neste workspace.",
  "tag-created": "Tag criada.", tagged: "Tag associada ao arquivo.",
  "notification-error": "Não foi possível marcar a notificação como lida.", read: "Notificação marcada como lida.",
};

export default async function WorkspacePage({ params, searchParams }: {
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { workspaceId } = await params;
  const { supabase, workspace, userId } = await requireWorkspace(workspaceId);
  const { q, status } = await searchParams;
  const query = typeof q === "string" ? q.trim().slice(0, 80) : "";
  const [fileResult, tagResult, notificationResult] = await Promise.all([
    supabase.rpc("search_core_files", { p_workspace_id: workspaceId, p_query: query }),
    supabase.from("core_tags").select("id, name").eq("workspace_id", workspaceId).order("name").limit(100),
    supabase.from("core_notifications").select("id, title, read_at, created_at")
      .eq("workspace_id", workspaceId).eq("recipient_id", userId).order("created_at", { ascending: false }).limit(10),
  ]);
  const files = (fileResult.data ?? []) as CoreFile[];
  const tags = tagResult.data ?? [];
  const fileIds = files.map((file) => file.id);
  const linkResult = fileIds.length ? await supabase.from("core_file_tags").select("file_id, tag_id")
    .eq("workspace_id", workspaceId).in("file_id", fileIds) : { data: [], error: null };
  const loadError = fileResult.error || tagResult.error || notificationResult.error || linkResult.error;
  const tagsById = new Map(tags.map((tag) => [tag.id, tag.name]));
  const fileTags = new Map<string, string[]>();
  for (const link of linkResult.data ?? []) {
    const name = tagsById.get(link.tag_id);
    if (name) fileTags.set(link.file_id, [...(fileTags.get(link.file_id) ?? []), name]);
  }

  return <main className={styles.shell}>
    <header className={styles.top}><Link className={styles.brand} href="/">✳ ModuVita</Link><form action={signOut}><button className={styles.textButton} type="submit">Sair</button></form></header>
    <div className={styles.content}>
      <Link className={styles.back} href="/app">← Todos os workspaces</Link>
      <span className={styles.eyebrow}>WORKSPACE / {workspace.kind === "professional" ? "PROFISSIONAL" : "PESSOAL"}</span>
      <h1>{workspace.name}</h1>
      <p>Arquivos privados, tags e busca pertencem a este workspace. A prévia pública do Pages não exibe estes dados.</p>
      {status && Object.hasOwn(messages, status) && <p className={styles.notice} role="status">{messages[status]}</p>}
      {loadError && <p className={styles.notice} role="alert">Não foi possível carregar o Core. Aplique a migração do Core no projeto Supabase.</p>}
      <section className={styles.coreSection}><h2>Produtividade</h2><p className={styles.muted}>Seus registros ficam neste workspace e são privados para você.</p>
        <div className={styles.grid}>
          <Link className={styles.workspaceCard} href={"/app/" + workspaceId + "/notes"}><span className={styles.cardIcon}>✎</span><strong>Notas</strong><span>Criar, buscar, editar e recuperar →</span></Link>
          <Link className={styles.workspaceCard} href={"/app/" + workspaceId + "/journal"}><span className={styles.cardIcon}>◷</span><strong>Diário</strong><span>Entradas datadas e lixeira →</span></Link>
        </div>
      </section>
      <div className={styles.coreGrid}>
        <section className={styles.createCard}><h2>Adicionar arquivo</h2><p>PDF, TXT, PNG ou JPG, até 5 MB. Somente membros do workspace podem acessar.</p>
          <form className={styles.form} action={uploadCoreFile}>
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <label htmlFor="core-file">Arquivo</label><input id="core-file" name="file" type="file" accept=".pdf,.txt,.png,.jpg,.jpeg" required />
            <button type="submit">Enviar arquivo</button>
          </form>
        </section>
        <section className={styles.createCard}><h2>Tags</h2><p>Organize os arquivos deste workspace.</p>
          <form className={styles.form} action={createCoreTag}>
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <label htmlFor="tag-name">Nova tag</label><input id="tag-name" name="name" maxLength={40} required placeholder="Ex.: estudo" />
            <button type="submit">Criar tag</button>
          </form>
          <p className={styles.tagList}>{tags.map((tag) => <span className={styles.tag} key={tag.id}>{tag.name}</span>)}</p>
        </section>
      </div>
      <section className={styles.coreSection}><div className={styles.sectionTop}><h2>Arquivos</h2><a href={"/app/" + workspaceId + "/export"}>Exportar dados JSON ↓</a></div>
        <form className={styles.searchForm} method="get"><label htmlFor="core-search">Buscar por nome ou tag</label><input id="core-search" name="q" defaultValue={query} maxLength={80} /><button type="submit">Buscar</button></form>
        {!loadError && files.length === 0 && <p className={styles.empty}>Nenhum arquivo encontrado neste workspace.</p>}
        <ul className={styles.fileList}>{files.map((file) => <li key={file.id}>
          <div><a href={"/app/" + workspaceId + "/files/" + file.id}>{file.name} ↓</a><small>{(file.size_bytes / 1024).toFixed(0)} KB · {new Date(file.created_at).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</small>
            <div className={styles.tagList}>{(fileTags.get(file.id) ?? []).map((tag) => <span className={styles.tag} key={tag}>{tag}</span>)}</div></div>
          {tags.length > 0 && <form className={styles.inlineForm} action={tagCoreFile}>
            <input type="hidden" name="workspaceId" value={workspaceId} /><input type="hidden" name="fileId" value={file.id} />
            <label htmlFor={"tag-" + file.id}>Associar tag</label><select id={"tag-" + file.id} name="tagId">{tags.map((tag) => <option key={tag.id} value={tag.id}>{tag.name}</option>)}</select>
            <button type="submit">Adicionar</button>
          </form>}
        </li>)}</ul>
        {files.length === 50 && <p className={styles.empty}>Mostrando até 50 arquivos. Refine a busca para encontrar outros.</p>}
      </section>
      <section className={styles.coreSection}><h2>Notificações</h2><p className={styles.muted}>Eventos internos do Core; nenhum aviso é enviado por e-mail.</p>
        {!loadError && notificationResult.data?.length === 0 && <p className={styles.empty}>Nenhuma notificação por enquanto.</p>}
        <ul className={styles.fileList}>{notificationResult.data?.map((notification) => <li key={notification.id}>
          <span>{notification.title} {notification.read_at && <small>· Lida</small>}</span>
          {!notification.read_at && <form action={markCoreNotificationRead}><input type="hidden" name="workspaceId" value={workspaceId} /><input type="hidden" name="notificationId" value={notification.id} /><button className={styles.textButton} type="submit">Marcar como lida</button></form>}
        </li>)}</ul>
      </section>
    </div>
  </main>;
}
