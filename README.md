# ModuVita

Plataforma modular para gestão pessoal, profissional, estudos, escrita e organização diária.

**Versão 0.4.1 — preparação para deploy gratuito.** A [prévia no GitHub Pages](https://bakurinha.github.io/moduvita-platform/) mostra apenas a interface pública, sem login. Em `/app`, depois de configurar o Supabase num servidor Next.js, é possível entrar por link de e-mail, criar workspaces, usar o Core e acessar Notas e Diário. A ativação e os testes com dados reais ainda estão pendentes.

## Executar

Requisitos: Node.js 20.9 ou superior e npm.

```bash
npm ci
npm run dev
```

Abra `http://localhost:3000`. Para validar uma entrega:

```bash
npm run check
npm run build
```

Para gerar a mesma prévia estática publicada no Pages, rode `npm run build:pages`. O resultado fica em `dist/pages/`. Veja [docs/PAGES.md](docs/PAGES.md) para os limites e a publicação.

Para publicar o aplicativo completo num plano gratuito, siga o [guia Netlify + Supabase](docs/DEPLOY-NETLIFY.md). O deploy funcional ainda depende de criar/conectar as contas e validar o fluxo hospedado; o Pages permanece só como prévia.

Sem configuração, a página pública abre normalmente e `/login` mostra o que falta. Nunca envie credenciais nem `.env.local` ao repositório.

## Ativar login e workspaces

1. Crie um projeto Supabase de teste. Na configuração de autenticação, habilite login por e-mail. Anote **Project URL** e **publishable key** (não use `service_role` ou `secret`).
2. No SQL Editor do projeto, execute a migração [`supabase/migrations/20260924000100_workspaces.sql`](supabase/migrations/20260924000100_workspaces.sql) uma única vez. Num fluxo com Supabase CLI, aplique migrations versionadas em vez de repetir comandos manuais.
   Depois, execute [`supabase/migrations/20260924000200_core.sql`](supabase/migrations/20260924000200_core.sql) para ativar o Core e o bucket privado.
   Por fim, execute [`supabase/migrations/20260924000300_productivity.sql`](supabase/migrations/20260924000300_productivity.sql) para Notas e Diário.
3. Na configuração de URL do Auth, defina **Site URL** como `http://localhost:3000` e permita `http://localhost:3000/auth/callback` como **Redirect URL**. Para outro domínio, use o endereço HTTPS correspondente nos três lugares (Site URL, Redirect URL e variável da aplicação).
4. Em **Authentication → Email Templates**, ajuste **Magic Link** e **Confirm signup** para que o link aponte diretamente ao endpoint do aplicativo. Substitua a URL padrão do botão por:

   ```html
   <a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email">Entrar no ModuVita</a>
   ```

   Preserve o restante do conteúdo do e-mail conforme necessário. O endpoint também aceita `code` em um fluxo PKCE compatível. O modelo padrão que retorna tokens no fragmento da URL não entrega uma sessão legível ao servidor.
5. Copie [`.env.example`](.env.example) para `apps/web/.env.local` e preencha URL, chave publicável e `NEXT_PUBLIC_APP_URL=http://localhost:3000`.
6. Execute `npm ci` e `npm run dev`. Acesse `/login`, solicite o link, abra o e-mail e crie seu primeiro workspace.

**Verificação com duas contas:** crie um workspace com a conta A; saia e entre com a conta B. A conta B não deve listá-lo nem conseguir abri-lo pela URL direta (404). A conta A deve continuar enxergando-o. Antes de usar dados reais, valide também envio de e-mail, expiração de link e procedimento de backup/restauração no projeto hospedado.

No Core, envie um arquivo com a conta A e tente baixá-lo com a conta B pela URL direta: o acesso deve falhar. Faça a exportação JSON e o backup/restauração de teste de **banco e bytes do Storage** conforme [docs/CORE.md](docs/CORE.md). A exportação não inclui os bytes.

Em Notas e Diário, crie um registro, edite, procure, mova para a lixeira e restaure. A segunda conta não deve ler nem alterar registros da primeira, mesmo se ambas forem membros do mesmo workspace. O JSON exportado contém **todo o texto** desses módulos, inclusive a lixeira: trate o download como dado privado. Veja [Notas](modules/notes/README.md) e [Diário](modules/journal/README.md).

O teste automatizado de RLS roda em PostgreSQL embutido: `npm run test:db`. Ele verifica identidades diferentes, acesso anônimo, associação ao workspace, privacidade por autor e bloqueio de alterações diretas. Esse teste não substitui a verificação de e-mail, sessão e Storage no Supabase hospedado.

## Organização

```text
apps/web/             Interface Next.js e tema
packages/core/        Contratos compartilhados; sem lógica de um módulo específico
modules/              Contratos e documentação isolados de Notas e Diário
supabase/migrations/  Estrutura e políticas de banco versionadas
tests/               Teste de isolamento no banco
docs/                 Regras, arquitetura, decisões e roadmap
.github/workflows/     Verificação e publicação da prévia no Pages
```

## Regras de trabalho

Leia [as regras do projeto](docs/REGRAS.md) antes de alterar código. Mudanças grandes começam por uma issue com critérios de aceite; são feitas em branch, verificadas e entregues via PR. O [roadmap](docs/ROADMAP.md) delimita cada etapa. Mudanças estruturais exigem um registro em `docs/decisions/`.

## Estado e próximo passo

A 0.4.1 inclui a configuração e o guia de deploy gratuito. A ativação e os testes de ponta a ponta de login, arquivos, módulos e backup/restauração dependem de um projeto Supabase configurado e da publicação do app com servidor. Consulte [arquitetura](docs/ARQUITETURA.md), [operação do Core](docs/CORE.md) e [roadmap](docs/ROADMAP.md).

## Licença

Nenhuma licença de código aberto foi definida até agora. O repositório público pode ser lido, mas a ausência de licença não concede permissão geral de reutilização.
