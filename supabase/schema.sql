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
