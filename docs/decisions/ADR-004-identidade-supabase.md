# ADR-004 — Supabase Auth, PostgreSQL e isolamento no banco

**Status:** aceita para 0.2.0 · 2026-09-24

## Contexto

Precisamos de contas verificadas e workspaces persistidos antes de módulos que guardem informações pessoais. Construir sessão, envio de e-mails e recuperação de identidade por conta própria aumentaria risco e custo.

## Decisão

Usar Supabase Auth com links de e-mail e `@supabase/ssr` para cookies no Next.js. Usar PostgreSQL com RLS para bloquear leitura cruzada de workspaces. Criar workspaces exclusivamente por uma função SQL transacional; usuários comuns recebem apenas acesso de leitura às tabelas desta etapa. Não usar chave administrativa na aplicação.

## Consequências

É necessário configurar projeto, URL, chave publicável, modelos de e-mail e migração antes do primeiro uso real. A aplicação continua exibindo a página pública sem configuração. Testes locais da política usam PostgreSQL embutido, e um teste de ponta a ponta com contas e e-mail reais segue obrigatório antes do uso em produção.
