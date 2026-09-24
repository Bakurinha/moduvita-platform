# ModuVita

Plataforma modular para gestão pessoal, profissional, estudos, escrita e organização diária.

**Versão 0.2.0 — identidade e workspaces.** A página pública tem uma prévia visual. Em `/app`, após configurar o Supabase, é possível entrar por link de e-mail, criar workspaces persistidos e acessar somente os seus. Os módulos de produtividade ainda não existem.

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

Sem configuração, a página pública abre normalmente e `/login` mostra o que falta. Nunca envie credenciais nem `.env.local` ao repositório.

## Ativar login e workspaces

1. Crie um projeto Supabase de teste. Na configuração de autenticação, habilite login por e-mail. Anote **Project URL** e **publishable key** (não use `service_role` ou `secret`).
2. No SQL Editor do projeto, execute a migração [`supabase/migrations/20260924000100_workspaces.sql`](supabase/migrations/20260924000100_workspaces.sql) uma única vez. Num fluxo com Supabase CLI, aplique migrations versionadas em vez de repetir comandos manuais.
3. Na configuração de URL do Auth, defina **Site URL** como `http://localhost:3000` e permita `http://localhost:3000/auth/callback` como **Redirect URL**. Para outro domínio, use o endereço HTTPS correspondente nos três lugares (Site URL, Redirect URL e variável da aplicação).
4. Em **Authentication → Email Templates**, ajuste **Magic Link** e **Confirm signup** para que o link aponte diretamente ao endpoint do aplicativo. Substitua a URL padrão do botão por:

   ```html
   <a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email">Entrar no ModuVita</a>
   ```

   Preserve o restante do conteúdo do e-mail conforme necessário. O endpoint também aceita `code` em um fluxo PKCE compatível. O modelo padrão que retorna tokens no fragmento da URL não entrega uma sessão legível ao servidor.
5. Copie [`.env.example`](.env.example) para `apps/web/.env.local` e preencha URL, chave publicável e `NEXT_PUBLIC_APP_URL=http://localhost:3000`.
6. Execute `npm ci` e `npm run dev`. Acesse `/login`, solicite o link, abra o e-mail e crie seu primeiro workspace.

**Verificação com duas contas:** crie um workspace com a conta A; saia e entre com a conta B. A conta B não deve listá-lo nem conseguir abri-lo pela URL direta (404). A conta A deve continuar enxergando-o. Antes de usar dados reais, valide também envio de e-mail, expiração de link e procedimento de backup/restauração no projeto hospedado.

O teste automatizado de RLS roda em PostgreSQL embutido: `npm run test:db`. Ele verifica duas identidades, acesso anônimo, associação automática do proprietário e bloqueio de alterações diretas. Esse teste não substitui a verificação de e-mail e sessão no Supabase hospedado.

## Organização

```text
apps/web/             Interface Next.js e tema
packages/core/        Contratos compartilhados; sem lógica de um módulo específico
modules/              Documentação e, futuramente, implementação isolada dos módulos
supabase/migrations/  Estrutura e políticas de banco versionadas
tests/               Teste de isolamento no banco
docs/                 Regras, arquitetura, decisões e roadmap
.github/workflows/     Verificação de cada push e pull request
```

## Regras de trabalho

Leia [as regras do projeto](docs/REGRAS.md) antes de alterar código. Mudanças grandes começam por uma issue com critérios de aceite; são feitas em branch, verificadas e entregues via PR. O [roadmap](docs/ROADMAP.md) delimita cada etapa. Mudanças estruturais exigem um registro em `docs/decisions/`.

## Estado e próximo passo

A 0.2.0 implementa autenticação e isolamento de workspaces em código e migração. A ativação e teste de ponta a ponta dependem de um projeto Supabase configurado. A próxima etapa é o Core utilizável, com arquivos privados, tags, busca autorizada e exportação. Consulte [arquitetura](docs/ARQUITETURA.md) e [roadmap](docs/ROADMAP.md).

## Licença

Nenhuma licença de código aberto foi definida até agora. O repositório público pode ser lido, mas a ausência de licença não concede permissão geral de reutilização.
