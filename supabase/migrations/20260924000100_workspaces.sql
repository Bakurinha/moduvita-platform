begin;

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80 and name = btrim(name)),
  kind text not null check (kind in ('personal', 'professional')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create index workspace_members_user_idx on public.workspace_members (user_id, workspace_id);

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;

-- Supabase projects may start with broad public grants. Remove them before granting reads.
revoke all on public.workspaces from public, anon, authenticated;
revoke all on public.workspace_members from public, anon, authenticated;
grant select on public.workspaces to authenticated;
grant select on public.workspace_members to authenticated;

create policy "members see their own membership"
on public.workspace_members for select to authenticated
using (user_id = (select auth.uid()));

create policy "members see their workspaces"
on public.workspaces for select to authenticated
using (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = id and wm.user_id = (select auth.uid())
  )
);

-- A definer function makes workspace creation and its owner membership atomic.
-- Its fixed search_path prevents callers from substituting referenced objects.
create function public.create_workspace(p_name text, p_kind text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  new_id uuid;
  clean_name text := btrim(p_name);
begin
  if actor is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;
  if clean_name is null or char_length(clean_name) < 1 or char_length(clean_name) > 80 then
    raise exception 'invalid workspace name' using errcode = '22023';
  end if;
  if p_kind is null or p_kind not in ('personal', 'professional') then
    raise exception 'invalid workspace kind' using errcode = '22023';
  end if;

  insert into public.workspaces (name, kind, created_by)
  values (clean_name, p_kind, actor)
  returning id into new_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_id, actor, 'owner');

  return new_id;
end;
$$;

revoke all on function public.create_workspace(text, text) from public, anon, authenticated;
grant execute on function public.create_workspace(text, text) to authenticated;

commit;
