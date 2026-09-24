# Core 0.3.0 — uso e operação

Depois de configurar o Supabase conforme o README, aplique **na ordem** a migração de workspaces e `supabase/migrations/20260924000200_core.sql`. Esta última cria um bucket privado `workspace-files`, tabelas de metadados/tags/notificações e políticas RLS no banco e no Storage. Não coloque arquivos, dumps, chaves ou `.env.local` no GitHub.

Em `/app/<workspaceId>`, membros podem enviar PDFs, TXT, PNG e JPG de até 5 MB, associar tags, buscar pelo nome ou tag, baixar arquivos e exportar um JSON. O JSON contém metadados, tags, notificações e eventos de auditoria do usuário naquele workspace; **não contém os bytes dos arquivos**. Cada arquivo deve ser baixado pelo link autenticado. A exportação registra um evento de auditoria no banco. Não há importação automática. A exportação não inclui dados de outros workspaces.

Notificações internas são geradas ao adicionar arquivo e podem ser marcadas como lidas pelo destinatário. Não há e-mail ou push. A busca exibe os primeiros 50 resultados; refine o termo para outros. A lista exibe até 100 tags e 10 notificações recentes.

## Backup e restauração de teste

1. Em ambiente de teste, faça backup do **banco** seguindo [Backup and Restore using the CLI](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore), guardando o arquivo fora do repositório e protegendo a string de conexão.
2. Baixe separadamente os objetos do bucket privado `workspace-files` seguindo a seção **Migrating storage objects** do mesmo guia. Registre caminho, tamanho e hash de cada objeto. [Backups do banco não incluem os bytes do Storage](https://supabase.com/docs/guides/platform/backups).
3. Em **outro projeto de teste**, restaure banco, políticas e objetos com os mesmos caminhos. Reconfigure URL, chave pública e autenticação; confirme que o bucket permanece privado.
4. Entre com duas contas; confira listagem, busca, download e JSON no workspace próprio. Tente o ID do workspace e do arquivo da outra conta: devem ficar inacessíveis. Compare hashes dos arquivos restaurados.

Não use a exportação JSON como substituta de backup. Antes de produção, teste a restauração completa e trate objetos órfãos de uploads interrompidos. A interface pública no GitHub Pages é estática e não executa estas rotas.
