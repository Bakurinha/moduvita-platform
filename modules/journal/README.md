# Diário

Entradas datadas do usuário em um workspace. A tabela `public.journal_entries` é privada para o autor enquanto membro. O contrato público é `parseJournalInput`.

Comandos: criar, editar data/título/corpo, mover para lixeira e restaurar. Consulta: `search_journal`, filtrada por workspace e autor com paginação de 20 resultados. Exportação: JSON do workspace, incluindo lixeira. Aceita várias entradas na mesma data, com título até 120 caracteres e corpo até 20 mil.

O descarte é reversível e auditado sem conteúdo no log. Não há exclusão definitiva automática; retenção será definida antes de purga. Sem compartilhamento, anexos diretos, importação, histórico de versões ou sincronização offline.
