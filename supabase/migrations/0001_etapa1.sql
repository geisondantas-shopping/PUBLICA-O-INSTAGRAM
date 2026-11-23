-- =====================================================================
-- PUBLICAÇÃO Aut Geison - Etapa 1: banco de dados
-- Como usar: Supabase > SQL Editor > New query > cole TUDO e clique em Run.
-- Pode rodar mais de uma vez sem problema.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) POSTS
-- ---------------------------------------------------------------------
create table if not exists public.posts (
  id            uuid primary key default gen_random_uuid(),
  tipo          text not null check (tipo in ('IMAGE', 'CAROUSEL', 'REELS')),
  midias        text[] not null default '{}'
                check (cardinality(midias) <= 5),
  legenda       text,
  status        text not null default 'RASCUNHO'
                check (status in ('RASCUNHO', 'APROVADO', 'AGENDADO',
                                  'PUBLICANDO', 'PUBLICADO', 'ERRO')),
  agendado_para timestamptz,
  container_id  text,
  media_id      text,
  permalink     text,
  erro          text,
  criado_em     timestamptz not null default now()
);
-- Para o agendador achar rápido os posts que estão na hora.
create index if not exists posts_status_agendado_idx
  on public.posts (status, agendado_para);

-- ---------------------------------------------------------------------
-- 2) AUTOMAÇÕES (palavra-chave -> respostas)
-- ---------------------------------------------------------------------
create table if not exists public.automacoes (
  id                uuid primary key default gen_random_uuid(),
  palavra_chave     text not null,
  ativa             boolean not null default true,
  resposta_publica  text,
  mensagem_direct   text,
  link              text,
  contador_disparos integer not null default 0,
  criado_em         timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3) INTERAÇÕES (comentários e mensagens recebidos)
-- LGPD: guarda só o @ (usuario) e o texto.
-- ---------------------------------------------------------------------
create table if not exists public.interacoes (
  id           uuid primary key default gen_random_uuid(),
  tipo         text not null check (tipo in ('COMENTARIO', 'MENSAGEM')),
  ig_id        text not null,
  usuario      text,
  texto        text,
  automacao_id uuid references public.automacoes (id) on delete set null,
  respondido   boolean not null default false,
  resposta     text,
  criado_em    timestamptz not null default now(),
  -- Trava: o mesmo comentário/mensagem nunca entra (nem é respondido) duas vezes.
  constraint interacoes_tipo_ig_id_unico unique (tipo, ig_id)
);
create index if not exists interacoes_criado_em_idx
  on public.interacoes (criado_em desc);

-- ---------------------------------------------------------------------
-- 4) LOGS
-- ---------------------------------------------------------------------
create table if not exists public.logs (
  id        uuid primary key default gen_random_uuid(),
  origem    text not null,
  nivel     text not null default 'INFO' check (nivel in ('INFO', 'AVISO', 'ERRO')),
  mensagem  text not null,
  payload   jsonb,
  criado_em timestamptz not null default now()
);
create index if not exists logs_criado_em_idx on public.logs (criado_em desc);

-- ---------------------------------------------------------------------
-- 5) CONFIG (token do Instagram). Uma linha só (id = 1).
-- Ninguém lê pelo navegador: só o servidor com a chave service_role.
-- ---------------------------------------------------------------------
create table if not exists public.config (
  id              smallint primary key default 1 check (id = 1),
  token           text,
  token_expira_em timestamptz,
  atualizado_em   timestamptz not null default now()
);
insert into public.config (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- RLS ligado em TODAS as tabelas
-- ---------------------------------------------------------------------
alter table public.posts      enable row level security;
alter table public.automacoes enable row level security;
alter table public.interacoes enable row level security;
alter table public.logs       enable row level security;
alter table public.config     enable row level security;

-- Visitante sem login (anon) não acessa nada.
revoke all on public.posts, public.automacoes, public.interacoes,
              public.logs, public.config from anon;
-- O usuário logado não acessa a tabela config.
revoke all on public.config from authenticated;

-- O usuário logado (só você, porque o cadastro público fica desligado)
-- gerencia posts, automações e interações, e lê os logs.
grant select, insert, update, delete
  on public.posts, public.automacoes, public.interacoes to authenticated;
grant select on public.logs to authenticated;

-- O servidor (service_role) acessa tudo.
grant all on public.posts, public.automacoes, public.interacoes,
             public.logs, public.config to service_role;

drop policy if exists "painel_posts" on public.posts;
create policy "painel_posts" on public.posts
  for all to authenticated using (true) with check (true);

drop policy if exists "painel_automacoes" on public.automacoes;
create policy "painel_automacoes" on public.automacoes
  for all to authenticated using (true) with check (true);

drop policy if exists "painel_interacoes" on public.interacoes;
create policy "painel_interacoes" on public.interacoes
  for all to authenticated using (true) with check (true);

drop policy if exists "painel_logs_leitura" on public.logs;
create policy "painel_logs_leitura" on public.logs
  for select to authenticated using (true);

-- config: RLS ligado e NENHUMA política = bloqueado para todos,
-- menos para o servidor (service_role ignora o RLS).

-- ---------------------------------------------------------------------
-- STORAGE: bucket público "midias" (o Instagram precisa de URL pública)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('midias', 'midias', true)
on conflict (id) do update set public = true;

-- Leitura é pública (bucket público). Enviar, trocar e apagar: só logado.
drop policy if exists "midias_upload" on storage.objects;
create policy "midias_upload" on storage.objects
  for insert to authenticated with check (bucket_id = 'midias');

drop policy if exists "midias_atualizar" on storage.objects;
create policy "midias_atualizar" on storage.objects
  for update to authenticated using (bucket_id = 'midias');

drop policy if exists "midias_apagar" on storage.objects;
create policy "midias_apagar" on storage.objects
  for delete to authenticated using (bucket_id = 'midias');
