# Ativação gratuita: Netlify + Supabase

Este procedimento publica a aplicação Next.js com rotas protegidas e banco hospedado. O [GitHub Pages](PAGES.md) continua como prévia pública estática. O custo inicial pode ser zero dentro das cotas gratuitas; confira os limites atuais nos painéis antes de criar cada projeto. Nenhum plano pago é necessário para o teste.

## 1. Banco e autenticação

1. Crie um projeto **Free** no Supabase. Guarde a senha do banco na sua conta, não no Git ou numa issue.
2. No SQL Editor do projeto, execute **uma vez e nesta ordem** as migrações da pasta `supabase/migrations/`: `20260924000100_workspaces.sql`, `20260924000200_core.sql` e `20260924000300_productivity.sql`. Confira se tabelas e bucket privado foram criados sem erros. Num projeto com migrações já aplicadas, não as execute novamente.
3. Copie **Project URL** e **publishable key** das configurações de API. O app não usa `service_role` nem uma secret key.

## 2. App com servidor

1. Na Netlify, importe o repositório `Bakurinha/moduvita-platform` pela integração com GitHub e escolha o plano **Free** e a branch `main`.
2. Selecione `apps/web` como **Package directory** e deixe **Base directory** vazia, para instalar os workspaces na raiz. O arquivo [`apps/web/netlify.toml`](../apps/web/netlify.toml) define build `npm run build`, publish `apps/web/.next` e Node.js 22. Confira esses valores antes de publicar. Não selecione `dist/pages/`, que contém somente a prévia estática.
3. Defina as variáveis de ambiente do site na Netlify, para build e funções:

   | Variável | Valor |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL do Supabase |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key do Supabase |
   | `NEXT_PUBLIC_APP_URL` | URL HTTPS final do site Netlify, sem barra no fim |

   Os nomes `NEXT_PUBLIC_*` indicam valores públicos. Nunca configure `service_role`, secret key ou senha do banco com esse prefixo. Use o domínio definitivo antes do primeiro teste de login; ao renomear o site, atualize esta variável, a configuração do Auth e refaça o deploy.

4. Publique e confirme que a rota `/login` abre no domínio Netlify. Verifique os logs de build se o adaptador Next.js não for aplicado automaticamente. Não marque o deploy como validado só porque a página inicial abre.

## 3. Link por e-mail

No Supabase, em **Authentication → URL Configuration**, use a URL HTTPS da Netlify como **Site URL** e adicione `<URL-DO-SITE>/auth/callback` em **Redirect URLs**. Em **Authentication → Email Templates**, faça **Magic Link** e **Confirm signup** apontarem ao callback do aplicativo conforme o [README](../README.md); o botão deve usar:

```html
<a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email">Entrar no ModuVita</a>
```

Não cole links recebidos por e-mail, cookies, tokens ou dados de contas reais em issues ou logs. Para previews de PR, mantenha login desabilitado ou use um Supabase de teste separado com URLs permitidas explicitamente; `NEXT_PUBLIC_APP_URL` deve corresponder ao domínio que recebe o link.

## 4. Verificação antes de dados reais

1. Teste o link recebido por e-mail e o logout com duas contas suas. Confirme que a conta B recebe 404 ao acessar pela URL um workspace exclusivo da A.
2. Teste arquivo privado (envio e download), tags, busca, Notas, Diário, lixeira e restauração. A conta B não pode ler arquivos ou textos da A, mesmo por URL direta. Teste a exportação JSON com cuidado: ela contém todo o texto, inclusive itens na lixeira, e os bytes dos arquivos devem ser obtidos à parte.
3. Faça uma restauração de ensaio do banco **e** dos bytes do Storage em outro projeto de teste, conforme [CORE.md](CORE.md). Só então use dados importantes.

As issues [#3](https://github.com/Bakurinha/moduvita-platform/issues/3), [#8](https://github.com/Bakurinha/moduvita-platform/issues/8), [#10](https://github.com/Bakurinha/moduvita-platform/issues/10) e [#12](https://github.com/Bakurinha/moduvita-platform/issues/12) registram o que ainda falta validar. O Supabase Free pode pausar um projeto com pouca atividade; a Netlify Free tem cota mensal. Consulte os painéis antes de passar a depender da disponibilidade do serviço.
