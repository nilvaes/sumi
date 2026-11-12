-- Sumi — security & performance hardening (2026-11-12)
--
-- Safe to run on the existing project (idempotent). Fixes Supabase advisor
-- warnings and tightens what the public `anon` key can do via the REST API.
--
--   * function_search_path_mutable  → pin search_path on our functions
--   * extension_in_public           → move pg_trgm into the `extensions` schema
--   * *_security_definer_function_executable → revoke RPC access to rls_auto_enable()
--   * auth_rls_initplan             → wrap auth.uid() in (select …) in policies
--   * search_anime(): clamp page size/offset/query length, escape LIKE wildcards
--   * bookmarks: positive-id check, per-user row cap, server-maintained updated_at

begin;

-- ---------------------------------------------------------------------------
-- pg_trgm out of the public (API-exposed) schema
-- ---------------------------------------------------------------------------
create schema if not exists extensions;
alter extension pg_trgm set schema extensions;

-- ---------------------------------------------------------------------------
-- Catalog trigger + search function with a fixed search_path
-- ---------------------------------------------------------------------------
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

-- Callable by anyone holding the anon key, so it must not trust its arguments:
-- page size is capped at 50, offset at 10k, the query at 100 chars, and LIKE
-- wildcards in the query are matched literally.
create or replace function public.search_anime(q text, lim int default 24, off int default 0)
returns setof public.anime
language sql
stable
set search_path = ''
as $$
  -- Expressions only reference the arguments (not a CTE) so the planner can
  -- still use the trigram index on search_text.
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

revoke execute on function public.anime_set_search_text() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- rls_auto_enable() is an event-trigger helper; it must not be an RPC endpoint.
-- (Event triggers keep working: EXECUTE is not checked when they fire.)
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'rls_auto_enable'
  ) then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Bookmarks
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'bookmarks_anilist_id_positive'
  ) then
    alter table public.bookmarks
      add constraint bookmarks_anilist_id_positive check (anilist_id > 0);
  end if;
end $$;

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

-- RLS policies: evaluate auth.uid() once per statement instead of per row.
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

commit;
