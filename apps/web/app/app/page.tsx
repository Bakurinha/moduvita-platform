import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { hasSupabaseConfig } from "../../lib/supabase/config";
import { createWorkspace, signOut } from "./actions";
import styles from "../workspace.module.css";

export const dynamic = "force-dynamic";

export default async function AppHome({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  if (!hasSupabaseConfig()) redirect("/login?status=config");
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getClaims();
  if (!user?.claims) redirect("/login");

  const { data: workspaces, error } = await supabase.from("workspaces")
    .select("id, name, kind, created_at").order("created_at", { ascending: true });
  const status = (await searchParams).status;

  return <main className={styles.shell}>
    <header className={styles.top}><Link className={styles.brand} href="/">✳ ModuVita</Link><form action={signOut}><button className={styles.textButton} type="submit">Sair</button></form></header>
    <div className={styles.content}>
      <span className={styles.eyebrow}>SEUS ESPAÇOS</span>
      <h1>Em qual workspace vamos entrar?</h1>
      <p>Cada workspace mantém seus dados separados. Escolha um espaço ou crie outro.</p>
      {error && <p className={styles.notice} role="alert">Não foi possível consultar seus workspaces. Verifique a conexão e a migração do banco.</p>}
      {status === "invalid" && <p className={styles.notice} role="alert">Escolha um tipo e informe um nome de até 80 caracteres.</p>}
      {status === "error" && <p className={styles.notice} role="alert">Não foi possível criar o workspace. Tente novamente.</p>}
      <div className={styles.grid}>{workspaces?.map((workspace) => <Link key={workspace.id} className={styles.workspaceCard} href={`/app/${workspace.id}`}><span className={styles.cardIcon}>{workspace.kind === "professional" ? "▤" : "◌"}</span><strong>{workspace.name}</strong><span>{workspace.kind === "professional" ? "Profissional" : "Pessoal"} · Abrir →</span></Link>)}</div>
      {!error && workspaces?.length === 0 && <p className={styles.empty}>Você ainda não tem workspaces. Crie o primeiro abaixo.</p>}
      <section className={styles.createCard}><h2>Criar workspace</h2><p>O primeiro membro será você, com papel de proprietário.</p><form className={styles.form} action={createWorkspace}><label htmlFor="name">Nome do espaço</label><input id="name" name="name" minLength={1} maxLength={80} required placeholder="Ex.: Meu espaço" /><label htmlFor="kind">Tipo</label><select id="kind" name="kind" defaultValue="personal"><option value="personal">Pessoal</option><option value="professional">Profissional</option></select><button type="submit">Criar espaço →</button></form></section>
    </div>
  </main>;
}
