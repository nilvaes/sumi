-- Sumi — anime catalog mirror used for fast partial/fuzzy search.
-- Run once against the Supabase project (psql or the SQL editor).

-- Trigram matching for substring/fuzzy search (ILIKE '%term%').
create extension if not exists pg_trgm;

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

drop trigger if exists anime_set_search_text_trg on public.anime;
create trigger anime_set_search_text_trg
  before insert or update on public.anime
  for each row execute function public.anime_set_search_text();

create index if not exists anime_search_trgm
  on public.anime using gin (search_text gin_trgm_ops);

create index if not exists anime_popularity_idx
  on public.anime (popularity desc);

-- Ranked search used by the app: exact title > prefix > trigram similarity > shortest.
create or replace function public.search_anime(q text, lim int default 24, off int default 0)
returns setof public.anime
language sql
stable
as $$
  select *
  from public.anime
  where search_text ilike '%' || q || '%'
  order by
    (lower(coalesce(title_romaji, '')) = lower(q)) desc,
    (lower(coalesce(title_romaji, '')) like lower(q) || '%') desc,
    similarity(coalesce(title_romaji, ''), q) desc,
    length(coalesce(title_romaji, '')) asc
  limit greatest(lim, 1) offset greatest(off, 0);
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
-- Run this block once in the Supabase SQL editor after auth is configured.
-- ---------------------------------------------------------------------------

create type public.bookmark_status as enum ('watching', 'planning', 'completed');

create table if not exists public.bookmarks (
  user_id     uuid not null references auth.users (id) on delete cascade,
  anilist_id  integer not null,
  status      public.bookmark_status not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (user_id, anilist_id)
);

create index if not exists bookmarks_user_status_idx
  on public.bookmarks (user_id, status);

alter table public.bookmarks enable row level security;

drop policy if exists "Users read own bookmarks" on public.bookmarks;
create policy "Users read own bookmarks"
  on public.bookmarks for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users insert own bookmarks" on public.bookmarks;
create policy "Users insert own bookmarks"
  on public.bookmarks for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users update own bookmarks" on public.bookmarks;
create policy "Users update own bookmarks"
  on public.bookmarks for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users delete own bookmarks" on public.bookmarks;
create policy "Users delete own bookmarks"
  on public.bookmarks for delete
  to authenticated
  using (user_id = auth.uid());
