# ModuVita

Plataforma modular para gestão pessoal, profissional, estudos, escrita e organização diária.

**Versão 0.1.0 — fundação.** A aplicação já abre uma tela inicial responsiva com escolha de tema e uma demonstração visual de workspaces. Ainda não há contas, banco, dados persistidos ou módulos operacionais. A seleção de workspace nesta versão só altera a apresentação da tela.

## Executar

Requisitos: Node.js 20.9 ou superior e npm.

```bash
npm ci
npm run dev
```

Abra `http://localhost:3000`. Para validar uma entrega:

```bash
npm run check
npm run build
```

Não há variáveis de ambiente obrigatórias nesta versão. Nunca envie credenciais ou arquivos `.env` reais ao repositório.

## Organização

```text
apps/web/             Interface Next.js e tema
packages/core/        Contratos compartilhados; sem lógica de um módulo específico
modules/              Documentação e, futuramente, implementação isolada dos módulos
docs/                 Regras, arquitetura, decisões e roadmap
.github/workflows/     Verificação de cada push e pull request
```

## Regras de trabalho

Leia [as regras do projeto](docs/REGRAS.md) antes de alterar código. Mudanças grandes começam por uma issue com critérios de aceite; são feitas em branch, verificadas e entregues via PR. O [roadmap](docs/ROADMAP.md) delimita cada etapa. Mudanças estruturais exigem um registro em `docs/decisions/`.

## Estado e próximo passo

A fase 0.1.0 entrega o esqueleto, os limites entre módulos, a definição de workspaces, o design inicial e a documentação. A próxima entrega deve definir autenticação e identidade, modelar workspaces e permissões no banco, implementar migrations e testar isolamento no servidor antes de guardar dados reais. Consulte [arquitetura](docs/ARQUITETURA.md).

## Licença

Nenhuma licença de código aberto foi definida até agora. O repositório público pode ser lido, mas a ausência de licença não concede permissão geral de reutilização.
