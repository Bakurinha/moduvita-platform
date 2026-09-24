# Histórico de versões

Todas as alterações relevantes deste projeto são registradas aqui. Durante a fase `0.x`, uma mudança incompatível também pode ocorrer numa versão MINOR, desde que seja explicada e migrável.

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
