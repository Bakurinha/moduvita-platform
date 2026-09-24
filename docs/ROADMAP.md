# Roadmap

Cada etapa gera uma entrega com critérios de aceite próprios. A numeração descreve ordem de planejamento, não prazo prometido.

| Etapa | Escopo | Estado |
| --- | --- | --- |
| 0.1.0 · fundação inicial | Regras, limites, documentação, UI inicial, tema e CI | Concluído |
| 0.2.0 · identidade e dados | Login por link, workspaces persistidos, membership, migração, RLS e teste de isolamento | Implementado; ativação em projeto Supabase pendente |
| 1 · Core utilizável | Arquivos privados, tags, busca autorizada, exportação, base de notificações | Implementado em 0.3.0; validação Supabase hospedado pendente |
| 2 · Produtividade | Notas e Diário utilizáveis em workspace | Pendente |
| 3 · Tempo | Agenda, rotinas e lembretes | Pendente |
| 4 · Profissional básico | Clientes, ordens de serviço, objetivos | Pendente |
| 5 · Financeiro | Receitas, despesas, contas e resumo | Pendente |
| 6 · Compras | Lista, catálogo, histórico e estoque | Pendente |
| 7 · Estudos | Biblioteca, fontes acadêmicas e arquivos próprios | Pendente |
| 8 · Escritor | Projetos longos, capítulos, referências e versões | Pendente |
| 9 · Roteiros | Cenas, personagens, atos e linhas do tempo | Pendente |
| 10 · Integrações | Google/Microsoft com OAuth e permissões mínimas | Pendente |
| 11 · Conexões | Fluxos explícitos e autorizados entre módulos | Pendente |
| 12 · Colaboração | Compartilhamento e permissões entre usuários | Pendente |

## Critérios de aceite da 0.1.0

- [x] Decisões, regras, roadmap e limites documentados.
- [x] Monorepo com frontend e contratos centrais.
- [x] Interface inicial responsiva com prévia pessoal/profissional claramente identificada como demonstração.
- [x] Temas claro, escuro e sistema, sem estilo específico de módulo vazando para outros.
- [x] Scripts e workflow para verificar tipos, lint e build.
- [ ] Checagens executadas no GitHub após a abertura do PR; acompanhar no próprio PR.

## Critérios da 0.2.0

- [x] Login e sessão SSR com checagem no servidor; callback de link de e-mail.
- [x] Criação atômica de workspace com associação do proprietário.
- [x] Listagem e acesso protegidos por sessão e RLS.
- [x] Teste de banco com duas identidades e tentativas de acesso indevido.
- [ ] Aplicar migração e testar envio de e-mail e duas contas num projeto Supabase real.

## Critérios da etapa 1

- [x] Bucket privado, tabelas, políticas de banco e Storage por workspace.
- [x] Interface e rotas autenticadas para arquivos, tags, busca, exportação e notificações.
- [x] Teste local de duas identidades, acesso anônimo e tentativas cruzadas.
- [x] Procedimento de backup/restauração documentado.
- [ ] Aplicar migrações, testar upload/download e restaurar banco e bytes no Supabase hospedado.

## Próxima issue sugerida

**2 — Produtividade.** Notas e Diário em um workspace; antes, cumprir os últimos critérios da 0.2.0 e da etapa 1 em ambiente Supabase de teste.
