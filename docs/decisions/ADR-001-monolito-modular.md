# ADR-001 — Monólito modular e contratos

**Status:** aceita · 2026-09-24

## Contexto

O produto crescerá em módulos com ritmos e interfaces diferentes. Serviços independentes aumentariam custo e complexidade operacional prematuramente.

## Decisão

Manter um monorepo com aplicativo web e pacotes por responsabilidade. Módulos se comunicam apenas por contratos públicos do Core ou interfaces/eventos documentados. A composição pertence ao aplicativo. Testes de contratos serão adicionados quando houver um segundo módulo operacional.

## Consequências

Uma implantação inicial simples, com limites claros. O isolamento depende também de revisão de imports e de autorização de dados no servidor; separação de pastas por si só não é segurança.
