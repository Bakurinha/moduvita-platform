"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { WorkspaceKind } from "@moduvita/core";
import styles from "./foundation-home.module.css";

type Theme = "system" | "light" | "dark";

const themeLabels: Record<Theme, string> = {
  system: "Sistema", light: "Claro", dark: "Escuro",
};

function currentTheme(): Theme {
  try {
    const saved = localStorage.getItem("moduvita-theme");
    return saved === "light" || saved === "dark" ? saved : "system";
  } catch { return "system"; }
}

function subscribeTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("moduvita-theme-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("moduvita-theme-change", callback);
  };
}

function ThemePicker() {
  const theme = useSyncExternalStore(subscribeTheme, currentTheme, () => "system");

  function changeTheme(next: Theme) {
    if (next === "system") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = next;
    try {
      if (next === "system") localStorage.removeItem("moduvita-theme");
      else localStorage.setItem("moduvita-theme", next);
      window.dispatchEvent(new Event("moduvita-theme-change"));
    } catch { /* O tema segue funcionando até a página ser recarregada. */ }
  }

  return <label className={styles.themeLabel}>Tema <select aria-label="Tema" value={theme} onChange={(event) => changeTheme(event.target.value as Theme)}>{(Object.keys(themeLabels) as Theme[]).map((option) => <option value={option} key={option}>{themeLabels[option]}</option>)}</select></label>;
}

const modules = [
  { icon: "✎", title: "Notas", description: "Ideias e referências em um lugar só.", phase: "Etapa 2" },
  { icon: "◷", title: "Diário", description: "Espaço para registrar seus dias.", phase: "Etapa 2" },
  { icon: "▦", title: "Agenda", description: "Compromissos no tempo certo.", phase: "Etapa 3" },
  { icon: "◎", title: "Objetivos", description: "Planos com passos concretos.", phase: "Etapa 4" },
];

export function FoundationHome() {
  const [workspace, setWorkspace] = useState<WorkspaceKind>("personal");
  const isPagesPreview = process.env.NEXT_PUBLIC_PAGES_PREVIEW === "1";

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        {isPagesPreview ? <a className={styles.brand} href="/moduvita-platform/" aria-label="ModuVita, início"><span className={styles.brandMark}>✳</span> ModuVita<span className={styles.brandDot}>.</span></a> : <Link className={styles.brand} href="/" aria-label="ModuVita, início"><span className={styles.brandMark}>✳</span> ModuVita<span className={styles.brandDot}>.</span></Link>}
        <div className={styles.headerRight}>
          <span className={styles.version}>{isPagesPreview ? "PRÉVIA PÚBLICA" : "VERSÃO 0.4.0"}</span>
          <ThemePicker />
        </div>
      </header>

      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}><span className={styles.pulse} /> UM ESPAÇO PARA CADA PARTE DA SUA VIDA</span>
          <h1 id="hero-title">Organize o hoje.<br /><em>Abra espaço</em> para o amanhã.</h1>
          <p>Notas, planos, estudos e trabalho poderão viver juntos — cada um no seu lugar. Estamos construindo essa base, um módulo de cada vez.</p>
          {isPagesPreview && <p className={styles.previewNotice}>Prévia pública da interface. O login e os dados salvos exigem a aplicação com servidor.</p>}
          <div className={styles.heroActions}>{isPagesPreview ? <a className={styles.primaryAction} href="#visao">Explorar a prévia <span aria-hidden="true">↓</span></a> : <Link className={styles.primaryAction} href="/login">Acessar meu espaço <span aria-hidden="true">↗</span></Link>}{!isPagesPreview && <a className={styles.secondaryAction} href="#visao">Conheça a estrutura ↓</a>}<a className={styles.secondaryAction} href="https://github.com/Bakurinha/moduvita-platform" target="_blank" rel="noopener noreferrer">GitHub ↗</a></div>
        </div>
        <div className={styles.orbit} aria-hidden="true"><div className={styles.orbitOuter}><div className={styles.orbitInner}><div className={styles.orbitCore}>✳</div></div></div><span className={`${styles.orbitTag} ${styles.tagA}`}>pessoal</span><span className={`${styles.orbitTag} ${styles.tagB}`}>trabalho</span><span className={`${styles.orbitTag} ${styles.tagC}`}>estudos</span></div>
      </section>

      <section id="visao" className={styles.content} aria-labelledby="content-title">
        <div className={styles.sectionIntro}><div><span className={styles.kicker}>UMA PLATAFORMA, VÁRIOS CONTEXTOS</span><h2 id="content-title">O seu espaço, do seu jeito.</h2></div><p>Esta é uma prévia da organização do ModuVita. Notas e Diário foram implementados em código, mas o uso real exige a aplicação com servidor e Supabase configurado.</p></div>
        <div className={styles.workspacePicker} role="group" aria-label="Prévia de workspace"><span className={styles.pickerLabel}>VISUALIZAR WORKSPACE</span><div className={styles.pickerButtons}><button type="button" aria-pressed={workspace === "personal"} className={workspace === "personal" ? styles.active : ""} onClick={() => setWorkspace("personal")}>◉ &nbsp; Pessoal</button><button type="button" aria-pressed={workspace === "professional"} className={workspace === "professional" ? styles.active : ""} onClick={() => setWorkspace("professional")}>▣ &nbsp; Profissional</button></div><span className={styles.previewLabel}>Prévia visual · sem dados salvos</span></div>
        <div className={styles.panel}><div className={styles.panelTop}><div><span className={styles.panelOverline}>WORKSPACE / {workspace === "personal" ? "PESSOAL" : "PROFISSIONAL"}</span><h3>{workspace === "personal" ? "Seu dia começa aqui." : "Seu trabalho, organizado."}</h3><p>{workspace === "personal" ? "Um lugar para suas ideias, rotinas e próximos passos." : "Um lugar para organizar clientes, serviços e projetos."}</p></div><span className={styles.panelGlyph} aria-hidden="true">{workspace === "personal" ? "◌" : "▤"}</span></div><div className={styles.cards}>{(workspace === "personal" ? modules : [{ icon: "♧", title: "Clientes", description: "Relações e histórico no contexto certo.", phase: "Etapa 4" }, { icon: "▤", title: "Ordens de serviço", description: "Do atendimento à entrega.", phase: "Etapa 4" }, { icon: "◷", title: "Agenda", description: "Seus compromissos em um só lugar.", phase: "Etapa 3" }, { icon: "◈", title: "Financeiro", description: "Entradas e saídas com clareza.", phase: "Etapa 5" }]).map((module) => <article className={styles.card} key={module.title}><span className={styles.cardIcon} aria-hidden="true">{module.icon}</span><span className={styles.phase}>{module.phase}</span><h4>{module.title}</h4><p>{module.description}</p><span className={styles.coming}>{module.phase === "Etapa 2" ? "Implementado em código · requer servidor" : "Em planejamento ↗"}</span></article>)}</div></div>
      </section>
      <footer className={styles.footer}><span>✳ ModuVita · Construído por etapas.</span><span>Versão 0.4.0 · 2026</span></footer>
    </main>
  );
}
