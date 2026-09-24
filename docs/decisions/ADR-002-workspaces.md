# ADR-002 — Workspace como limite de dados

**Status:** aceita como modelo; implementação pendente · 2026-09-24

## Contexto

O usuário pode separar vida pessoal, profissional e outros contextos; vários usuários poderão colaborar futuramente.

## Decisão

Cada registro de negócio terá `workspace_id`. Uma tabela de associação entre usuário e workspace determina acesso e papel. Toda consulta e comando filtram e autorizam o workspace no servidor e no banco. Transferir, copiar ou compartilhar dados entre workspaces exige ação explícita e auditoria.

## Consequências

Permite ampliar tipos de workspace sem recriar módulos. A prévia local da 0.1.0 não implementa essas garantias; nenhuma informação pessoal deve ser inserida nela.
