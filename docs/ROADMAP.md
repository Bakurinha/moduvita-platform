# Roadmap

Cada etapa gera uma entrega com critérios de aceite próprios. A numeração descreve ordem de planejamento, não prazo prometido.

| Etapa | Escopo | Estado |
| --- | --- | --- |
| 0.1.0 · fundação inicial | Regras, limites, documentação, UI inicial, tema e CI | Feito neste PR |
| 0.2.0 · identidade e dados | Autenticação real, workspaces persistidos, membership, migrations, autorização e testes de isolamento | Pendente |
| 1 · Core utilizável | Arquivos privados, tags, busca autorizada, exportação, base de notificações | Pendente |
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

## Próxima issue sugerida

**0.2.0 — Identidade e workspaces persistidos.** Definir provedor de autenticação, migrations, roles e checagem em cada operação; testar acesso permitido, negado e troca de workspace; documentar backup e implantação. Não ativar dados reais antes de cumprir esses critérios.
