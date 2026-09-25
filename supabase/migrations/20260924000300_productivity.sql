begin;

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete restrict,
  title text not null check (char_length(title) between 1 and 120 and title = btrim(title)),
  body text not null check (char_length(body) between 1 and 20000 and char_length(btrim(body)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index notes_owner_list_idx on public.notes (workspace_id, author_id, deleted_at, updated_at desc, id desc);

create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete restrict,
  entry_date date not null,
  title text not null check (char_length(title) between 1 and 120 and title = btrim(title)),
  body text not null check (char_length(body) between 1 and 20000 and char_length(btrim(body)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index journal_owner_list_idx on public.journal_entries (workspace_id, author_id, deleted_at, entry_date desc, id desc);

create table public.productivity_audit_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_id uuid not null references auth.users(id) on delete cascade,
  module text not null check (module in ('notes', 'journal')),
  record_id uuid not null,
  action text not null check (action in ('trash', 'restore')),
  created_at timestamptz not null default now()
);
create index productivity_audit_owner_idx on public.productivity_audit_events (workspace_id, actor_id, created_at desc);

alter table public.notes enable row level security;
alter table public.journal_entries enable row level security;
alter table public.productivity_audit_events enable row level security;
revoke all on public.notes, public.journal_entries, public.productivity_audit_events from public, anon, authenticated;
grant select on public.notes, public.journal_entries to authenticated;
grant insert (workspace_id, author_id, title, body) on public.notes to authenticated;
grant insert (workspace_id, author_id, entry_date, title, body) on public.journal_entries to authenticated;
grant update (title, body, deleted_at) on public.notes to authenticated;
grant update (title, body, entry_date, deleted_at) on public.journal_entries to authenticated;
grant select on public.productivity_audit_events to authenticated;

create policy "authors read notes" on public.notes for select to authenticated using
  (author_id = (select auth.uid()) and exists (select 1 from public.workspace_members wm
    where wm.workspace_id = public.notes.workspace_id and wm.user_id = (select auth.uid())));
create policy "authors create notes" on public.notes for insert to authenticated with check
  (deleted_at is null and author_id = (select auth.uid()) and exists (select 1 from public.workspace_members wm
    where wm.workspace_id = public.notes.workspace_id and wm.user_id = (select auth.uid())));
create policy "authors edit notes" on public.notes for update to authenticated
  using (author_id = (select auth.uid()) and exists (select 1 from public.workspace_members wm
    where wm.workspace_id = public.notes.workspace_id and wm.user_id = (select auth.uid())))
  with check (author_id = (select auth.uid()) and exists (select 1 from public.workspace_members wm
    where wm.workspace_id = public.notes.workspace_id and wm.user_id = (select auth.uid())));

create policy "authors read journal" on public.journal_entries for select to authenticated using
  (author_id = (select auth.uid()) and exists (select 1 from public.workspace_members wm
    where wm.workspace_id = public.journal_entries.workspace_id and wm.user_id = (select auth.uid())));
create policy "authors create journal" on public.journal_entries for insert to authenticated with check
  (deleted_at is null and author_id = (select auth.uid()) and exists (select 1 from public.workspace_members wm
    where wm.workspace_id = public.journal_entries.workspace_id and wm.user_id = (select auth.uid())));
create policy "authors edit journal" on public.journal_entries for update to authenticated
  using (author_id = (select auth.uid()) and exists (select 1 from public.workspace_members wm
    where wm.workspace_id = public.journal_entries.workspace_id and wm.user_id = (select auth.uid())))
  with check (author_id = (select auth.uid()) and exists (select 1 from public.workspace_members wm
    where wm.workspace_id = public.journal_entries.workspace_id and wm.user_id = (select auth.uid())));
create policy "actors read productivity audit" on public.productivity_audit_events for select to authenticated using
  (actor_id = (select auth.uid()) and exists (select 1 from public.workspace_members wm
    where wm.workspace_id = public.productivity_audit_events.workspace_id and wm.user_id = (select auth.uid())));

-- A database-generated timestamp cannot be spoofed through an update grant.
create function public.touch_productivity_record() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function public.touch_productivity_record() from public, anon, authenticated;
create trigger notes_touch before update on public.notes for each row execute function public.touch_productivity_record();
create trigger journal_touch before update on public.journal_entries for each row execute function public.touch_productivity_record();

-- Audit the recoverable deletion transition without persisting the private text.
create function public.audit_productivity_trash() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if old.deleted_at is distinct from new.deleted_at then
    insert into public.productivity_audit_events (workspace_id, actor_id, module, record_id, action)
    values (new.workspace_id, auth.uid(),
      case when tg_table_name = 'notes' then 'notes' else 'journal' end,
      new.id, case when new.deleted_at is null then 'restore' else 'trash' end);
  end if;
  return new;
end;
$$;
revoke all on function public.audit_productivity_trash() from public, anon, authenticated;
create trigger notes_audit after update on public.notes for each row execute function public.audit_productivity_trash();
create trigger journal_audit after update on public.journal_entries for each row execute function public.audit_productivity_trash();

create function public.search_notes(p_workspace_id uuid, p_query text, p_deleted boolean, p_offset integer)
returns setof public.notes language sql stable security invoker set search_path = '' as $$
  select n.* from public.notes n where n.workspace_id = p_workspace_id
  and (n.deleted_at is not null) = coalesce(p_deleted, false)
  and (p_query is null or btrim(p_query) = ''
    or position(lower(btrim(p_query)) in lower(n.title)) > 0
    or position(lower(btrim(p_query)) in lower(n.body)) > 0)
  order by n.updated_at desc, n.id desc limit 21 offset greatest(0, least(coalesce(p_offset, 0), 10000));
$$;
create function public.search_journal(p_workspace_id uuid, p_query text, p_deleted boolean, p_offset integer)
returns setof public.journal_entries language sql stable security invoker set search_path = '' as $$
  select j.* from public.journal_entries j where j.workspace_id = p_workspace_id
  and (j.deleted_at is not null) = coalesce(p_deleted, false)
  and (p_query is null or btrim(p_query) = ''
    or position(lower(btrim(p_query)) in lower(j.title)) > 0
    or position(lower(btrim(p_query)) in lower(j.body)) > 0)
  order by j.entry_date desc, j.id desc limit 21 offset greatest(0, least(coalesce(p_offset, 0), 10000));
$$;
revoke all on function public.search_notes(uuid, text, boolean, integer) from public, anon, authenticated;
revoke all on function public.search_journal(uuid, text, boolean, integer) from public, anon, authenticated;
grant execute on function public.search_notes(uuid, text, boolean, integer) to authenticated;
grant execute on function public.search_journal(uuid, text, boolean, integer) to authenticated;

commit;
