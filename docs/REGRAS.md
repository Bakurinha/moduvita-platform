# Regras de negócio e desenvolvimento

**Status:** aprovadas como princípios do projeto em 2026-09-24. Estas regras orientam as entregas; funcionalidades previstas aqui não estão necessariamente implementadas. Em caso de conflito, preservar dados e segurança e registrar a decisão em uma issue/ADR.

## Arquitetura e evolução

1. O ModuVita é um monólito modular. Módulos dependem de contratos públicos, serviços ou eventos documentados, nunca de arquivos internos alheios.
2. Cada entrega deve ser pequena, utilizável e passar por requisitos, modelo de dados, desenvolvimento, validação, documentação e versão.
3. Mudanças relevantes são rastreáveis em issue, PR, documentação ou `CHANGELOG.md`; mudanças de instalação e arquitetura atualizam o README.
4. Usar versões `MAJOR.MINOR.PATCH`; releases têm changelog. Em `0.x`, mudanças incompatíveis requerem nota de migração.
5. Priorizar código legível, nomes claros e responsabilidades pequenas.
6. Comentar decisões e regras não óbvias, explicando o motivo em vez de repetir o código.
7. Cada entrega relata o que mudou, motivo, funcionamento, verificação, riscos e limites.
8. Cada módulo tem fronteira própria; sua implementação privada não é importada por outros.
9. Estilos de um módulo não alcançam outros módulos. Estilos globais só para reset e tokens compartilhados.
10. Tema claro, escuro e sistema pertencem ao Core visual; módulos usam seus tokens.
11. O Core contém só capacidades compartilhadas; regras específicas ficam nos módulos.
12. Cada registro de negócio pertence a um workspace. Um usuário pode participar de vários workspaces.
13. Dados não atravessam workspaces sem ação explícita e autorização, inclusive em busca, exportação e integrações.
14. Ações entre módulos são explícitas, com contrato, autorização e efeito documentado.
15. Relacionar objetos por referência quando pertinente; duplicar apenas valores históricos que devem permanecer imutáveis.

## Dados e integrações

16. Exclusões importantes devem permitir confirmação, recuperação e política de retenção definida por módulo quando aplicável.
17. Mudanças de esquema são migrations reproduzíveis e revisáveis.
18. Atualizações preservam dados; operações destrutivas exigem plano de migração, validação e cópia de segurança quando necessária.
19. Dados criados pelo usuário devem ser exportáveis em formato apropriado ao módulo, com escopo e permissões verificados.
20. Importações registram origem, data e identificador externo quando disponíveis; reimportações evitam duplicatas.
21. APIs externas são adaptadores sobre interfaces do sistema, com contratos que possam ser substituídos.
22. Funcionalidades locais continuam úteis sem serviços externos sempre que tecnicamente possível.
23. Dependência paga obrigatória requer análise registrada de custo, alternativa, limites e portabilidade.
24. IA é opcional; fluxos essenciais funcionam sem ela.
25. Nunca versionar segredos nem expô-los ao navegador; chaves privadas permanecem no servidor.
26. OAuth e outras integrações pedem apenas os escopos necessários.
27. Cada módulo recebe apenas dados autorizados; autorização é aplicada no servidor e no banco, além da interface.
28. Ações sensíveis (exclusão, importação, exportação, compartilhamento, finanças, permissões e integrações) geram auditoria adequada sem registrar segredos.
29. Contratos publicados exigem análise dos consumidores e migração/compatibilidade antes de mudanças incompatíveis.
30. Regras de negócio, permissões, finanças, dados, integrações e correções críticas recebem testes proporcionais ao risco.

## Entregas e produto

31. `main` permanece funcional; trabalhar em branches e revisar por PR, com verificações passando.
32. Commits descrevem a ação (`feat(modulo): ...`, `fix(modulo): ...`).
33. Mudanças grandes nascem em issue com problema, objetivo, requisitos, impacto e critérios de aceite.
34. Uma funcionalidade só está pronta quando seus critérios foram demonstrados, testados e documentados.
35. Antes de adicionar algo, confirmar problema real, módulo responsável e necessidade nesta etapa.
36. Ideias no backlog não autorizam implementação imediata; priorizar valor, custo, dependências e risco.
37. Módulos extensos, como Escritor, Roteiros, Estudos, Financeiro e Estoque, crescem sem exigir evolução conjunta dos demais.
38. Modelar consulta e escala com índices, paginação e filtros para listas grandes; medir antes de otimizações complexas.
39. Catálogo amplo de produtos mora em dados ou fontes externas, não em milhares de constantes no frontend.
40. Mudança no preço atual não reescreve preços e condições de compras passadas.
41. Registros financeiros mantêm os valores e condições vigentes no momento da operação.
42. Falha de serviço externo informa o usuário e não impede trabalho local independente.
43. Recursos incompletos permanecem indisponíveis; usar feature flags quando houver implementação parcial.
44. Entregar primeiro um MVP funcional de cada módulo; recursos avançados seguem por etapas.
45. Cada módulo documenta finalidade, dados, contratos, dependências, limites e regras de negócio.
46. Decisões de arquitetura importantes geram ADR com contexto, decisão e consequências.
47. Refatoração interna preserva comportamento observável, salvo mudança explicitamente aprovada.
48. Arquivos têm responsabilidade clara; dividir quando misturam assuntos, sem meta arbitrária de linhas.
49. Nova biblioteca exige justificativa de manutenção, segurança, peso e necessidade.
50. Priorizar preservação de dados, segurança e estabilidade antes de ampliar recursos. Não liberar funcionalidades que quebrem as já aceitas.

## Critério transversal de aceite

Uma entrega que manipule dados reais só pode ser chamada de pronta quando separar dados por workspace, aplicar autorização no servidor, não expor segredos, testar fluxos críticos e documentar migração/recuperação. As capacidades da 0.4.0 estão implementadas em código; a validação em Supabase hospedado ainda é necessária antes de usá-las com dados reais.
