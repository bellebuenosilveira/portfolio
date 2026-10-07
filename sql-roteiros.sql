-- =====================================================================
-- ABA "ROTEIROS" DO PAINEL (biblioteca de transcrições)
--
-- ONDE COLAR: no Supabase, menu da esquerda > SQL Editor > New query.
-- Cole este arquivo inteiro e clique em "Run".
-- Pode rodar mais de uma vez: não apaga nada que já existe.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. QUEM É A DONA (a mesma regra do banco.sql)
-- Responde "sim" só quando quem está logado é a Isabelle.
-- ---------------------------------------------------------------------
create or replace function public.eh_dona()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'bellevital@icloud.com';
$$;


-- ---------------------------------------------------------------------
-- 2. TABELA ROTEIROS
-- Cada vídeo transcrito (seu ou de outra creator) vira uma linha.
-- de_quem: 'minha' ou 'outra'.
-- status: 'processando' (transcrevendo), 'pronto' ou 'falhou'.
-- segmentos: os trechos com tempo, quando o serviço manda.
-- ---------------------------------------------------------------------
create table if not exists public.roteiros (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  fonte        text not null default 'manual'
               check (fonte in ('instagram', 'tiktok', 'youtube', 'manual')),
  url          text,
  perfil       text,
  de_quem      text not null default 'outra'
               check (de_quem in ('minha', 'outra')),
  titulo       text,
  transcricao  text,
  legenda      text,
  postado_em   date,
  tags         text[] not null default '{}',
  obs          text,
  status       text not null default 'pronto'
               check (status in ('processando', 'pronto', 'falhou')),
  erro         text,
  segmentos    jsonb
);

create index if not exists roteiros_created_at_idx on public.roteiros (created_at desc);


-- ---------------------------------------------------------------------
-- 3. TABELA CONFIGURACOES
-- Guarda configurações do painel, como a chave da Supadata.
-- Fica no banco (e não no navegador) para funcionar em qualquer computador.
-- ---------------------------------------------------------------------
create table if not exists public.configuracoes (
  chave       text primary key,
  valor       text,
  updated_at  timestamptz not null default now()
);


-- ---------------------------------------------------------------------
-- 4. "ATUALIZADO EM" AUTOMÁTICO
-- Toda vez que uma linha muda, o campo updated_at ganha a hora de agora.
-- ---------------------------------------------------------------------
create or replace function public.marca_atualizacao()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists roteiros_atualizado on public.roteiros;
create trigger roteiros_atualizado before update on public.roteiros
  for each row execute function public.marca_atualizacao();

drop trigger if exists configuracoes_atualizado on public.configuracoes;
create trigger configuracoes_atualizado before update on public.configuracoes
  for each row execute function public.marca_atualizacao();


-- ---------------------------------------------------------------------
-- 5. A TRANCA (RLS)
-- Ligada nas duas tabelas. Só você, logada, lê e escreve.
-- Quem não está logado (anon) não tem permissão nenhuma.
-- ---------------------------------------------------------------------
alter table public.roteiros      enable row level security;
alter table public.configuracoes enable row level security;

revoke all on public.roteiros, public.configuracoes from anon;
grant select, insert, update, delete on public.roteiros, public.configuracoes to authenticated;

drop policy if exists "dona le roteiros"      on public.roteiros;
drop policy if exists "dona cria roteiros"    on public.roteiros;
drop policy if exists "dona edita roteiros"   on public.roteiros;
drop policy if exists "dona apaga roteiros"   on public.roteiros;
drop policy if exists "dona le config"        on public.configuracoes;
drop policy if exists "dona cria config"      on public.configuracoes;
drop policy if exists "dona edita config"     on public.configuracoes;
drop policy if exists "dona apaga config"     on public.configuracoes;

create policy "dona le roteiros"    on public.roteiros for select to authenticated using (public.eh_dona());
create policy "dona cria roteiros"  on public.roteiros for insert to authenticated with check (public.eh_dona());
create policy "dona edita roteiros" on public.roteiros for update to authenticated using (public.eh_dona()) with check (public.eh_dona());
create policy "dona apaga roteiros" on public.roteiros for delete to authenticated using (public.eh_dona());

create policy "dona le config"      on public.configuracoes for select to authenticated using (public.eh_dona());
create policy "dona cria config"    on public.configuracoes for insert to authenticated with check (public.eh_dona());
create policy "dona edita config"   on public.configuracoes for update to authenticated using (public.eh_dona()) with check (public.eh_dona());
create policy "dona apaga config"   on public.configuracoes for delete to authenticated using (public.eh_dona());


-- ---------------------------------------------------------------------
-- 6. AVISA O SUPABASE QUE TEM TABELA NOVA
-- Faz o painel enxergar as tabelas na hora.
-- ---------------------------------------------------------------------
notify pgrst, 'reload schema';
