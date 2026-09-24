# Prévia pública no GitHub Pages

URL prevista: `https://bakurinha.github.io/moduvita-platform/`.

A prévia reutiliza `FoundationHome` e seus CSS Modules; não mantém uma segunda interface. O script `npm run build:pages` faz o build normal com prefixo `/moduvita-platform`, extrai somente a página inicial pré-renderizada e os recursos estáticos e adiciona `.nojekyll` para servir `_next/`. Ele valida que os caminhos dos recursos estão corretos e que o HTML identifica a página como prévia sem link de login.

GitHub Pages não executa as rotas dinâmicas, a função de login, o Proxy ou as Server Actions. Portanto a prévia só permite explorar a interface, alternar tema e simular a seleção visual dos workspaces. Não oferece autenticação nem guarda workspaces reais. Para usar `/app`, é preciso hospedar a aplicação Next.js com servidor e configurar Supabase conforme o README.

## Publicação

O workflow `.github/workflows/pages-preview.yml` valida a prévia em PR e publica a cada push na `main`. No repositório, **Settings → Pages → Build and deployment → Source** deve estar em **GitHub Actions**. Após o workflow concluir, abra a URL acima e verifique estilos, alternância de tema e prévia pessoal/profissional.

Nenhuma chave Supabase é usada no build público. A saída `dist/pages/` é gerada automaticamente e não é versionada.
