# ADR-006 — Notas e Diário isolados por autor

**Status:** aceita para implementação em 0.4.0 · 2026-09-24

## Contexto

O Core guarda arquivos e organiza workspaces. Para validar a fronteira modular, Notas e Diário precisam armazenar conteúdo pessoal sem presumir que dois membros de um workspace compartilhem automaticamente seus textos. Compartilhamento será tratado em etapa própria.

## Decisão

Cada módulo tem pacote, contrato de entrada e documentação próprios. A camada web compõe as rotas e usa o serviço público de autorização do workspace; módulos não importam detalhes uns dos outros. Tabelas separadas guardam `workspace_id`, `author_id` e texto. RLS exige associação ao workspace **e** identidade do autor em leitura, escrita e atualização.

As consultas SQL usam direitos do invocador e RLS, termo literal e páginas de 20 registros. O descarte grava `deleted_at`; só há restauração, sem purga automática. Triggers registram descarte e restauração com ID, ator, módulo e data, sem texto. A exportação JSON do workspace inclui registros ativos e na lixeira do autor.

## Consequências

Membros do mesmo workspace não enxergam textos uns dos outros. Não existe edição simultânea, histórico de revisões, anexos diretos, importação nem uso offline. Retenção será definida antes de introduzir exclusão definitiva. O formato JSON de exportação passa de `moduvita-core-v1` para `moduvita-workspace-v2`, acrescentando Notas e Diário; consumidores devem reconhecer o novo valor do campo `format`. A ativação real segue dependente de Supabase hospedado e validação com duas contas.
