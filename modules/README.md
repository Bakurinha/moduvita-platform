# Módulos

Esta pasta contém os módulos de negócio. Notas e Diário têm contratos e documentação próprios a partir da 0.4.0; os demais seguem planejados.

Antes de criar um módulo: abrir issue com critérios de aceite; documentar proprietário dos dados, tabela com `workspace_id`, comandos/consultas públicos, permissões, eventos, importação/exportação, testes e limites; implementar MVP isolado com CSS Modules. Módulos jamais importam arquivos privados de outros módulos.

Ordem planejada: `notes`, `journal`, `calendar`, `routines`, `clients`, `service-orders`, `goals`, `finance`, `shopping`, `inventory`, `study`, `writer`, `screenplay`. Não criar pastas vazias para funcionalidades não iniciadas.
