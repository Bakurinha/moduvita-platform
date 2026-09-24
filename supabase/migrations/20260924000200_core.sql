begin;

create table public.core_files (
  id uuid primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  uploaded_by uuid not null references auth.users(id) on delete restrict,
  name text not null check (char_length(name) between 1 and 180),
  object_path text not null unique,
  content_type text not null,
  size_bytes integer not null check (size_bytes between 1 and 5242880),
  created_at timestamptz not null default now(),
  unique (workspace_id, id),
  check (left(object_path, char_length(workspace_id::text || '/' || id::text || '/')) = workspace_id::text || '/' || id::text || '/')
);
create index core_files_workspace_idx on public.core_files (workspace_id, created_at desc);

create table public.core_tags (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40 and name = btrim(name)),
  created_at timestamptz not null default now(),
  unique (workspace_id, id)
);
create unique index core_tags_name_idx on public.core_tags (workspace_id, lower(name));

create table public.core_file_tags (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  file_id uuid not null,
  tag_id uuid not null,
  primary key (file_id, tag_id),
  foreign key (workspace_id, file_id) references public.core_files(workspace_id, id) on delete cascade,
  foreign key (workspace_id, tag_id) references public.core_tags(workspace_id, id) on delete cascade
);
create index core_file_tags_tag_idx on public.core_file_tags (tag_id, file_id);

create table public.core_notifications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 180),
  created_at timestamptz not null default now(),
  read_at timestamptz,
  unique (workspace_id, id)
);
create index core_notifications_recipient_idx on public.core_notifications (recipient_id, workspace_id, created_at desc);

create table public.core_audit_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_id uuid not null references auth.users(id) on delete cascade,
  action text not null check (action = 'export_metadata'),
  created_at timestamptz not null default now()
);
create index core_audit_actor_idx on public.core_audit_events (actor_id, workspace_id, created_at desc);

alter table public.core_files enable row level security;
alter table public.core_tags enable row level security;
alter table public.core_file_tags enable row level security;
alter table public.core_notifications enable row level security;
alter table public.core_audit_events enable row level security;
revoke all on public.core_files, public.core_tags, public.core_file_tags, public.core_notifications, public.core_audit_events from public, anon, authenticated;
grant select, insert on public.core_files, public.core_tags, public.core_file_tags to authenticated;
grant select on public.core_notifications to authenticated;
grant update (read_at) on public.core_notifications to authenticated;
grant select on public.core_audit_events to authenticated;

create policy "members read files" on public.core_files for select to authenticated using
  (exists (select 1 from public.workspace_members wm where wm.workspace_id = public.core_files.workspace_id and wm.user_id = (select auth.uid())));
create policy "members add their files" on public.core_files for insert to authenticated with check
  (uploaded_by = (select auth.uid()) and exists (select 1 from public.workspace_members wm where wm.workspace_id = public.core_files.workspace_id and wm.user_id = (select auth.uid())));
create policy "members read tags" on public.core_tags for select to authenticated using
  (exists (select 1 from public.workspace_members wm where wm.workspace_id = public.core_tags.workspace_id and wm.user_id = (select auth.uid())));
create policy "members add tags" on public.core_tags for insert to authenticated with check
  (exists (select 1 from public.workspace_members wm where wm.workspace_id = public.core_tags.workspace_id and wm.user_id = (select auth.uid())));
create policy "members read file tags" on public.core_file_tags for select to authenticated using
  (exists (select 1 from public.workspace_members wm where wm.workspace_id = public.core_file_tags.workspace_id and wm.user_id = (select auth.uid())));
create policy "members tag files" on public.core_file_tags for insert to authenticated with check
  (exists (select 1 from public.workspace_members wm where wm.workspace_id = public.core_file_tags.workspace_id and wm.user_id = (select auth.uid())));
create policy "recipients read notifications" on public.core_notifications for select to authenticated using
  (recipient_id = (select auth.uid()) and exists (select 1 from public.workspace_members wm where wm.workspace_id = public.core_notifications.workspace_id and wm.user_id = (select auth.uid())));
create policy "recipients mark notifications" on public.core_notifications for update to authenticated
  using (recipient_id = (select auth.uid()) and exists (select 1 from public.workspace_members wm where wm.workspace_id = public.core_notifications.workspace_id and wm.user_id = (select auth.uid())))
  with check (recipient_id = (select auth.uid()) and exists (select 1 from public.workspace_members wm where wm.workspace_id = public.core_notifications.workspace_id and wm.user_id = (select auth.uid())));
create policy "actors read own audit" on public.core_audit_events for select to authenticated using
  (actor_id = (select auth.uid()) and exists (select 1 from public.workspace_members wm where wm.workspace_id = public.core_audit_events.workspace_id and wm.user_id = (select auth.uid())));

create function public.log_core_export(p_workspace_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid();
begin
  if actor is null or not exists (select 1 from public.workspace_members wm
    where wm.workspace_id = p_workspace_id and wm.user_id = actor) then
    raise exception 'workspace access denied' using errcode = '42501';
  end if;
  insert into public.core_audit_events (workspace_id, actor_id, action)
  values (p_workspace_id, actor, 'export_metadata');
end;
$$;
revoke all on function public.log_core_export(uuid) from public, anon, authenticated;
grant execute on function public.log_core_export(uuid) to authenticated;

-- Only the database trigger creates notifications. Clients cannot insert arbitrary messages.
create function public.notify_core_file() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.core_notifications (workspace_id, recipient_id, title)
  values (new.workspace_id, new.uploaded_by, 'Arquivo adicionado: ' || left(new.name, 160));
  return new;
end;
$$;
revoke all on function public.notify_core_file() from public, anon, authenticated;
create trigger core_file_notification after insert on public.core_files for each row execute function public.notify_core_file();

-- Invoker rights retain RLS on both files and tags; no cross-workspace matches leak.
create function public.search_core_files(p_workspace_id uuid, p_query text)
returns setof public.core_files language sql stable security invoker set search_path = '' as $$
  select f.* from public.core_files f
  where f.workspace_id = p_workspace_id and (
    p_query is null or btrim(p_query) = '' or
    position(lower(btrim(p_query)) in lower(f.name)) > 0 or
    exists (select 1 from public.core_file_tags ft join public.core_tags t
      on t.workspace_id = ft.workspace_id and t.id = ft.tag_id
      where ft.workspace_id = f.workspace_id and ft.file_id = f.id
        and position(lower(btrim(p_query)) in lower(t.name)) > 0)
  ) order by f.created_at desc limit 50;
$$;
revoke all on function public.search_core_files(uuid, text) from public, anon, authenticated;
grant execute on function public.search_core_files(uuid, text) to authenticated;

-- A private bucket; Storage also enforces workspace membership on direct API calls.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('workspace-files', 'workspace-files', false, 5242880,
  array['application/pdf','text/plain','image/png','image/jpeg'])
on conflict (id) do nothing;
create policy "members read private objects" on storage.objects for select to authenticated using
  (bucket_id = 'workspace-files' and exists (select 1 from public.workspace_members wm
    where wm.workspace_id::text = (storage.foldername(name))[1] and wm.user_id = (select auth.uid())));
create policy "members upload private objects" on storage.objects for insert to authenticated with check
  (bucket_id = 'workspace-files' and exists (select 1 from public.workspace_members wm
    where wm.workspace_id::text = (storage.foldername(name))[1] and wm.user_id = (select auth.uid())));
create policy "uploader rolls back private objects" on storage.objects for delete to authenticated using
  (bucket_id = 'workspace-files' and owner_id = (select auth.uid())::text and exists
    (select 1 from public.workspace_members wm where wm.workspace_id::text = (storage.foldername(name))[1] and wm.user_id = (select auth.uid())));

commit;
