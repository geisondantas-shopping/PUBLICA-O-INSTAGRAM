# PUBLICAÇÃO Aut Geison

Painel para publicar no Instagram automaticamente e responder comentários e Direct por palavra-chave.

Stack: Next.js (App Router) hospedado na Hostinger (app Node.js), Supabase (banco, login e Storage), API do Instagram e API da Anthropic.

## Etapas

| Etapa | Conteúdo | Situação |
|---|---|---|
| 1 | Projeto, login e banco | pronta |
| 2 | Upload e publicação de imagem ("Publicar agora") | a fazer |
| 3 | Carrossel e Reels | a fazer |
| 4 | Aprovação, agenda e cron | a fazer |
| 5 | Renovação do token | a fazer |
| 6 | Webhook e automações | a fazer |
| 7 | Tela de saúde e deploy final na Hostinger | a fazer |

## Configuração da Etapa 1

### 1. Supabase

1. **Criar as tabelas:** no Supabase, abra **SQL Editor > New query**, cole todo o conteúdo de `supabase/migrations/0001_etapa1.sql` e clique em **Run**. Pode rodar de novo sem problema.
2. **Desligar o cadastro público:** em **Authentication > Sign In / Providers**, desligue **Allow new users to sign up**. Assim ninguém consegue criar conta no seu painel.
3. **Criar o seu usuário:** em **Authentication > Users > Add user > Create new user**, informe seu e-mail e uma senha forte e marque **Auto Confirm User**.
4. **Pegar as chaves:** em **Project Settings > API** (ou **API Keys**), copie:
   - **Project URL**: vai em `NEXT_PUBLIC_SUPABASE_URL` e em `SUPABASE_URL`
   - chave **anon / publishable**: vai em `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - chave **service_role / secret**: vai em `SUPABASE_SERVICE_ROLE_KEY` (secreta, só no servidor)

### 2. Hostinger (app Node.js)

No hPanel, no app Node.js ligado a este repositório do GitHub:

- Comando de build: `npm run build`
- Comando de início: `npm start`
- Versão do Node: 20 ou mais nova
- Em **Variáveis de ambiente**, cadastre as variáveis do arquivo `.env.example`. Na Etapa 1 bastam estas:
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL` (o seu e-mail de login).

Importante: as variáveis que começam com `NEXT_PUBLIC_` são lidas no momento do build. Se você alterar alguma delas, faça um novo deploy.

### 3. Como testar

1. Abra o endereço do site sem estar logado: deve aparecer a tela de login.
2. Tente abrir `/saude` direto: deve voltar para o login.
3. Entre com seu e-mail e senha: deve abrir o painel com o menu.
4. A tela **Início** mostra uma verificação: todas as linhas devem estar com ✅ (4 tabelas, a tabela `config` protegida e o bucket `midias`).
5. No Supabase, em **Table Editor**, as 5 tabelas aparecem sem o aviso "RLS disabled".

## Segurança

- Nenhuma chave fica no código. O arquivo `.env.example` só tem os nomes.
- Só o e-mail de `ADMIN_EMAIL` entra no painel, e o cadastro público fica desligado.
- RLS ligado em todas as tabelas. A tabela `config` (token do Instagram) só é acessível pelo servidor.
- LGPD: das interações, guardamos apenas o @ e o texto.

## Rodar no computador (opcional)

```bash
cp .env.example .env.local   # preencha os valores
npm install
npm run dev                  # abre em http://localhost:3000
```
