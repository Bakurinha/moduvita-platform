# Notas

Módulo de ideias e textos curtos. A tabela `public.notes` pertence a um workspace e a um autor; somente o autor, enquanto membro, pode ler e editar. O contrato público é `parseNoteInput`. A web compõe interface e ações, sem compartilhar arquivos internos com outros módulos.

Comandos: criar, editar, mover para lixeira, restaurar. Consulta: `search_notes`, com RLS, termo e paginação de 20 resultados. Exportação: incluída no JSON do workspace, inclusive lixeira. Cada nota tem título até 120 caracteres e corpo até 20 mil caracteres.

O descarte é reversível e auditado sem gravar o corpo no log. Não há exclusão definitiva automática nesta versão; o prazo de retenção será definido antes de introduzir purga. Sem compartilhamento entre autores, anexos diretos, importação, histórico de versões ou sincronização offline.
