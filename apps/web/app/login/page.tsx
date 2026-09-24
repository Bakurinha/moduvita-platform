import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { hasSupabaseConfig } from "../../lib/supabase/config";
import { sendSignInLink } from "./actions";
import styles from "../workspace.module.css";

export const dynamic = "force-dynamic";

const messages: Record<string, string> = {
  sent: "Enviamos um link para seu e-mail. Verifique sua caixa de entrada.",
  error: "Não foi possível enviar o link agora. Tente novamente em alguns minutos.",
  email: "Digite um endereço de e-mail válido.",
  expired: "O link expirou ou não pôde ser validado. Solicite outro.",
  config: "A autenticação ainda não foi configurada neste ambiente.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const configured = hasSupabaseConfig();
  if (configured) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    if (data?.claims) redirect("/app");
  }
  const status = (await searchParams).status;

  return <main className={styles.shell}>
    <Link className={styles.back} href="/">← Voltar ao início</Link>
    <section className={styles.authCard}>
      <span className={styles.eyebrow}>MODUVITA / ACESSO</span>
      <h1>Entre no seu espaço.</h1>
      <p>Use seu e-mail para receber um link de acesso. Não é preciso criar uma senha.</p>
      {status && messages[status] && <p className={styles.notice} role="status">{messages[status]}</p>}
      {configured ? <form action={sendSignInLink} className={styles.form}>
        <label htmlFor="email">Seu e-mail</label>
        <input id="email" name="email" type="email" autoComplete="email" maxLength={254} required placeholder="voce@exemplo.com" />
        <button type="submit">Enviar link de acesso →</button>
      </form> : <p className={styles.notice}>Para ativar o login, configure o Supabase conforme o README.</p>}
    </section>
  </main>;
}
