-- Sumi — full database schema (fresh project setup).
-- Run once against the Supabase project (psql or the SQL editor). Every statement
-- is idempotent, so re-running the whole file is safe.
--
-- Existing projects: apply the files in supabase/migrations/ instead.

-- Trigram matching for substring/fuzzy search (ILIKE '%term%').
-- Lives in `extensions`, not the API-exposed `public` schema.
create schema if not exists extensions;
create extension if not exists pg_trgm with schema extensions;

create table if not exists public.anime (
  anilist_id    integer primary key,
  title_romaji  text,
  title_english text,
  title_native  text,
  synonyms      text[] not null default '{}',
  cover_image   text,
  cover_color   text,
  format        text,
  season_year   integer,
  episodes      integer,
  average_score integer,
  popularity    integer not null default 0,
  genres        text[] not null default '{}',
  updated_at    timestamptz not null default now()
);

-- Combined searchable text across all title variants + synonyms.
-- Maintained by a trigger (array_to_string isn't IMMUTABLE, so a generated
-- column can't be used here).
alter table public.anime add column if not exists search_text text;

create or replace function public.anime_set_search_text()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.search_text :=
    coalesce(new.title_romaji, '') || ' ' ||
    coalesce(new.title_english, '') || ' ' ||
    coalesce(new.title_native, '') || ' ' ||
    coalesce(array_to_string(new.synonyms, ' '), '');
  return new;
end;
$$;

revoke execute on function public.anime_set_search_text() from public, anon, authenticated;

drop trigger if exists anime_set_search_text_trg on public.anime;
create trigger anime_set_search_text_trg
  before insert or update on public.anime
  for each row execute function public.anime_set_search_text();

create index if not exists anime_search_trgm
  on public.anime using gin (search_text extensions.gin_trgm_ops);

create index if not exists anime_popularity_idx
  on public.anime (popularity desc);

-- Ranked search used by the app: exact title > prefix > trigram similarity > shortest.
-- Callable by anyone holding the anon key, so it must not trust its arguments:
-- page size is capped at 50, offset at 10k, the query at 100 chars, and LIKE
-- wildcards in the query are matched literally. Expressions only reference the
-- arguments (not a CTE) so the planner can still use the trigram index.
create or replace function public.search_anime(q text, lim int default 24, off int default 0)
returns setof public.anime
language sql
stable
set search_path = ''
as $$
  select a.*
  from public.anime a
  where length(btrim(coalesce(q, ''))) >= 2
    and a.search_text ilike
      '%' || replace(replace(replace(left(btrim(q), 100), '\', '\\'), '%', '\%'), '_', '\_') || '%'
  order by
    (lower(coalesce(a.title_romaji, '')) = lower(left(btrim(q), 100))) desc,
    (lower(coalesce(a.title_romaji, '')) like
      replace(replace(replace(lower(left(btrim(q), 100)), '\', '\\'), '%', '\%'), '_', '\_') || '%') desc,
    extensions.similarity(coalesce(a.title_romaji, ''), left(btrim(q), 100)) desc,
    length(coalesce(a.title_romaji, '')) asc
  limit least(greatest(coalesce(lim, 24), 1), 50)
  offset least(greatest(coalesce(off, 0), 0), 10000);
$$;

-- RLS: anyone can read; writes only via the service-role key (which bypasses RLS).
alter table public.anime enable row level security;

drop policy if exists "Public read anime" on public.anime;
create policy "Public read anime"
  on public.anime for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Bookmarks (Phase 2a) — per-user anime lists stored in Sumi (not AniList).
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'bookmark_status'
  ) then
    create type public.bookmark_status as enum ('watching', 'planning', 'completed');
  end if;
end $$;

create table if not exists public.bookmarks (
  user_id     uuid not null references auth.users (id) on delete cascade,
  anilist_id  integer not null,
  status      public.bookmark_status not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (user_id, anilist_id)
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'bookmarks_anilist_id_positive'
  ) then
    alter table public.bookmarks
      add constraint bookmarks_anilist_id_positive check (anilist_id > 0);
  end if;
end $$;

create index if not exists bookmarks_user_status_idx
  on public.bookmarks (user_id, status);

-- Per-user cap so a single account can't fill the database via the REST API.
create or replace function public.bookmarks_enforce_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Upserts on an existing row are updates, not new rows.
  if exists (
    select 1 from public.bookmarks
    where user_id = new.user_id and anilist_id = new.anilist_id
  ) then
    return new;
  end if;

  if (select count(*) from public.bookmarks where user_id = new.user_id) >= 5000 then
    raise exception 'bookmark limit reached' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create or replace function public.bookmarks_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke execute on function public.bookmarks_enforce_limit() from public, anon, authenticated;
revoke execute on function public.bookmarks_touch_updated_at() from public, anon, authenticated;

drop trigger if exists bookmarks_enforce_limit_trg on public.bookmarks;
create trigger bookmarks_enforce_limit_trg
  before insert on public.bookmarks
  for each row execute function public.bookmarks_enforce_limit();

drop trigger if exists bookmarks_touch_updated_at_trg on public.bookmarks;
create trigger bookmarks_touch_updated_at_trg
  before update on public.bookmarks
  for each row execute function public.bookmarks_touch_updated_at();

alter table public.bookmarks enable row level security;

-- `(select auth.uid())` is evaluated once per statement instead of per row.
drop policy if exists "Users read own bookmarks" on public.bookmarks;
create policy "Users read own bookmarks"
  on public.bookmarks for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users insert own bookmarks" on public.bookmarks;
create policy "Users insert own bookmarks"
  on public.bookmarks for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Users update own bookmarks" on public.bookmarks;
create policy "Users update own bookmarks"
  on public.bookmarks for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Users delete own bookmarks" on public.bookmarks;
create policy "Users delete own bookmarks"
  on public.bookmarks for delete
  to authenticated
  using (user_id = (select auth.uid()));
