# ADR-003 — Stack inicial e decisões adiadas

**Status:** aceita para a interface; dados e autenticação pendentes · 2026-09-24

## Decisão

Usar Next.js App Router, TypeScript, npm workspaces e CSS Modules. Propor PostgreSQL para dados persistentes. Não introduzir Supabase, OAuth, cache offline, serviço pago ou IA até existir necessidade e decisão específica.

## Consequências

A 0.1.0 pode ser executada sem conta externa e sem segredos. Persistência e autenticação exigirão migrations, autorização e testes antes de armazenar dados do usuário.
