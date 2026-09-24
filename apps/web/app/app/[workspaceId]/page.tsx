import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { hasSupabaseConfig } from "../../../lib/supabase/config";
import { signOut } from "../actions";
import styles from "../../workspace.module.css";

export const dynamic = "force-dynamic";

export default async function WorkspacePage({ params }: { params: Promise<{ workspaceId: string }> }) {
  if (!hasSupabaseConfig()) redirect("/login?status=config");
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getClaims();
  if (!user?.claims) redirect("/login");

  const { workspaceId } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workspaceId)) notFound();
  const { data: workspace, error } = await supabase.from("workspaces")
    .select("id, name, kind").eq("id", workspaceId).maybeSingle();
  if (error || !workspace) notFound(); // RLS hides other people's workspaces.

  return <main className={styles.shell}>
    <header className={styles.top}><Link className={styles.brand} href="/">✳ ModuVita</Link><form action={signOut}><button className={styles.textButton} type="submit">Sair</button></form></header>
    <div className={styles.content}>
      <Link className={styles.back} href="/app">← Todos os workspaces</Link>
      <span className={styles.eyebrow}>WORKSPACE / {workspace.kind === "professional" ? "PROFISSIONAL" : "PESSOAL"}</span>
      <h1>{workspace.name}</h1>
      <p>Seu espaço está salvo e protegido por permissões no banco. Os módulos de notas e diário chegam nas próximas etapas.</p>
      <section className={styles.createCard}><h2>Próximo passo</h2><p>O Core de arquivos, tags, busca e exportação será construído antes dos módulos de produtividade.</p></section>
    </div>
  </main>;
}
