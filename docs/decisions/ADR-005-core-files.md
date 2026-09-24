# ADR-005 — Arquivos privados e capacidades compartilhadas

**Status:** aceita para implementação em 0.3.0 · 2026-09-24

## Contexto

O Core precisa guardar arquivos de um workspace sem expô-los pela prévia pública, e oferecer tags, busca e notificações comuns a módulos futuros. A entrega anterior já vincula usuários a workspaces sob RLS.

## Decisão

Usar bucket privado do Supabase Storage para os bytes e tabelas PostgreSQL para metadados, tags e notificações. O caminho de um objeto começa pelo ID do workspace. Storage e tabelas verificam associação ao workspace por políticas próprias; a aplicação consulta a associação antes de responder. O upload ocorre com a sessão do usuário, sem chave administrativa, e registra metadados após o envio. Se esse registro falhar, tenta remover o objeto. Downloads passam por rota autenticada com resposta sem cache e como anexo.

A busca é uma função SQL com direitos do invocador e RLS, filtrada por workspace; procura nome e tags, até 50 resultados. Uma trigger cria notificação interna para quem enviou o arquivo. A exportação JSON inclui metadados e links para baixar os arquivos um a um, sem incluir seus bytes; uma função protegida registra sua auditoria.

## Consequências

O Storage e o banco exigem backup e restauração separados. Um upload interrompido pode deixar um objeto sem metadados; antes de usar com dados reais, validar rollback e conciliação em Supabase hospedado. Limites iniciais: 5 MB por arquivo, PDF/TXT/PNG/JPG, 50 resultados de busca e até 100 tags listadas. Não há exclusão, quota total, compartilhamento externo, envio de notificações ou importação neste incremento. A confirmação de segurança em projeto hospedado ainda depende da issue #3.
