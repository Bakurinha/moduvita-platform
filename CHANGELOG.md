# Histórico de versões

Todas as alterações relevantes deste projeto são registradas aqui. Durante a fase `0.x`, uma mudança incompatível também pode ocorrer numa versão MINOR, desde que seja explicada e migrável.

## [0.4.1] - 2026-09-25

### Adicionado

- Configuração de build para o app Next.js no monorepo via Netlify e guia de ativação gratuita com Supabase, URLs de Auth e checklist hospedado.

### Limitações

- Ainda não há projeto Supabase conectado nem deploy autenticado validado; o Pages continua sendo a prévia estática.

## [0.4.0] - 2026-09-24

### Adicionado

- Módulos Notas e Diário: criação, edição, busca, lixeira e restauração por autor e workspace.
- Migração com RLS, auditoria de descarte/restauração sem conteúdo e teste de acesso entre autores do mesmo workspace.
- Exportação JSON de registros ativos e na lixeira, com documentação de módulos e decisão arquitetural.

### Migração

- Aplicar `20260924000300_productivity.sql` depois das duas migrações anteriores antes de usar as novas rotas.
- O campo `format` da exportação muda de `moduvita-core-v1` para `moduvita-workspace-v2` e passa a incluir `notes`, `journal_entries` e `productivity_audit_events`. Consumidores do formato anterior devem reconhecer o novo valor.

### Limitações

- Sem projeto Supabase hospedado, login, fluxo completo e restauração ainda não foram validados. O Pages continua sendo uma prévia estática.
- Não há compartilhamento de textos, importação, exclusão definitiva, versões anteriores ou sincronização offline.

## [0.3.0] - 2026-09-24

### Adicionado

- Core inicial por workspace: arquivos privados, tags, busca por nome/tag, exportação JSON de metadados e notificações internas.
- Migração de bucket privado, tabelas e políticas RLS, mais teste com duas identidades e tentativas de acesso indevido.
- Procedimento de backup/restauração de teste do banco e dos arquivos do Storage.

### Limitações

- Aplicação e migração ainda exigem projeto Supabase hospedado e verificação de ponta a ponta. O Pages mostra somente a página pública.
- Exportação JSON não contém bytes dos arquivos; baixe cada arquivo pela rota autenticada. Não há importação ou exclusão neste incremento.

## [0.2.1] - 2026-09-24

### Adicionado

- Prévia estática da página pública gerada a partir do mesmo componente da aplicação.
- Workflow para validar em PR e publicar a prévia no GitHub Pages após integração à `main`.
- Aviso explícito na prévia: login e dados persistidos exigem o servidor Next.js.

## [0.2.0] - 2026-09-24

### Adicionado

- Login por e-mail com link de acesso e confirmação no servidor.
- Workspaces persistidos com criação atômica, associação do proprietário e acesso por URL.
- Migração PostgreSQL com RLS, permissões mínimas e teste de isolamento com usuários simulados.
- Instruções de configuração e verificação com duas contas reais.

### Limitações

- A conexão efetiva requer projeto Supabase, aplicação da migração, configuração dos modelos de e-mail e variáveis de ambiente.
- Ainda não há convite de membros, edição/exclusão de workspaces nem dados de módulos.

## [0.1.0] - 2026-09-24

### Adicionado

- Estrutura de monorepo com aplicação web e contratos centrais.
- Tela inicial responsiva, temas claro/escuro/sistema e demonstração visual de workspaces.
- Regras, arquitetura, decisões e roadmap da plataforma.
- Verificações automatizadas de tipo, lint e build.

### Limitações

- Sem autenticação, banco, persistência de workspaces, integrações externas ou módulos de negócio nesta fase.
