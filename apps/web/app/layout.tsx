import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ModuVita — sua vida, no seu ritmo",
  description: "Uma plataforma modular para organizar o que importa.",
};

// Aplica a preferência salva antes da hidratação para evitar piscar o tema errado.
const themeBootstrap = `try{var t=localStorage.getItem('moduvita-theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t}}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeBootstrap }} /></head>
      <body>{children}</body>
    </html>
  );
}
