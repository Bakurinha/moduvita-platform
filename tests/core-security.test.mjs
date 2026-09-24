import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";

const alice = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const bob = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const fileId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

test("Core RLS isolates files, tags, search, notifications and Storage objects", async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role authenticated;
      create role anon;
      create schema auth;
      create table auth.users (id uuid primary key);
      create function auth.uid() returns uuid language sql stable as
        $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      grant usage on schema auth to authenticated, anon;
      grant execute on function auth.uid() to authenticated, anon;
      insert into auth.users values ('${alice}'), ('${bob}');
      create schema storage;
      create table storage.buckets (id text primary key, name text, public boolean, file_size_limit integer, allowed_mime_types text[]);
      create table storage.objects (name text primary key, bucket_id text not null, owner_id text);
      create function storage.foldername(path text) returns text[] language sql stable as
        $$ select string_to_array(path, '/') $$;
      alter table storage.objects enable row level security;
      grant usage on schema storage to authenticated, anon;
      grant select, insert, delete on storage.objects to authenticated;
      grant execute on function storage.foldername(text) to authenticated;
    `);
    for (const name of ["20260924000100_workspaces.sql", "20260924000200_core.sql"]) {
      await db.exec(await readFile(new URL("../supabase/migrations/" + name, import.meta.url), "utf8"));
    }
    async function as(role, id) {
      await db.exec(`set role ${role}; select set_config('request.jwt.claim.sub', '${id}', false);`);
    }
    await as("authenticated", alice);
    const own = (await db.query("select public.create_workspace('Casa', 'personal') id")).rows[0].id;
    const path = `${own}/${fileId}/segredo.txt`;
    await db.query("insert into storage.objects values ($1, 'workspace-files', $2)", [path, alice]);
    await db.query("insert into public.core_files (id, workspace_id, uploaded_by, name, object_path, content_type, size_bytes) values ($1,$2,$3,'segredo.txt',$4,'text/plain',5)", [fileId, own, alice, path]);
    const tag = (await db.query("insert into public.core_tags (workspace_id, name) values ($1,'Estudos') returning id", [own])).rows[0].id;
    await db.query("insert into public.core_file_tags values ($1,$2,$3)", [own, fileId, tag]);
    assert.equal((await db.query("select title from public.core_notifications")).rows.length, 1);
    assert.equal((await db.query("select id from public.search_core_files($1,'estudos')", [own])).rows[0].id, fileId);

    await as("authenticated", bob);
    assert.deepEqual((await db.query("select * from public.core_files")).rows, []);
    assert.deepEqual((await db.query("select * from public.core_tags")).rows, []);
    assert.deepEqual((await db.query("select * from public.core_file_tags")).rows, []);
    assert.deepEqual((await db.query("select * from public.core_notifications")).rows, []);
    assert.deepEqual((await db.query("select * from public.core_audit_events")).rows, []);
    assert.deepEqual((await db.query("select * from public.search_core_files($1,'segredo')", [own])).rows, []);
    assert.deepEqual((await db.query("select * from storage.objects")).rows, []);
    await assert.rejects(db.query("insert into public.core_files (id, workspace_id, uploaded_by, name, object_path, content_type, size_bytes) values ($1,$2,$3,'intruso.txt',$4,'text/plain',5)",
      ["dddddddd-dddd-4ddd-8ddd-dddddddddddd", own, bob, own + "/dddddddd-dddd-4ddd-8ddd-dddddddddddd/intruso.txt"]), /row-level security/);
    await assert.rejects(db.query("insert into public.core_tags (workspace_id, name) values ($1,'Intrusa')", [own]), /row-level security/);
    await assert.rejects(db.query("insert into storage.objects values ($1, 'workspace-files', $2)", [own + "/other/test.txt", bob]), /row-level security/);
    const other = (await db.query("select public.create_workspace('Trabalho', 'professional') id")).rows[0].id;
    const otherTag = (await db.query("insert into public.core_tags (workspace_id, name) values ($1,'Outra') returning id", [other])).rows[0].id;
    await assert.rejects(db.query("insert into public.core_file_tags values ($1,$2,$3)", [other, fileId, otherTag]), /foreign key|row-level security/);
    assert.deepEqual((await db.query("update public.core_notifications set read_at = now() returning id")).rows, []);
    await assert.rejects(db.query("select public.log_core_export($1)", [own]), /workspace access denied/);

    await as("authenticated", alice);
    await db.query("select public.log_core_export($1)", [own]);
    assert.equal((await db.query("select * from public.core_audit_events")).rows.length, 1);
    await assert.rejects(db.query("insert into public.core_audit_events (workspace_id, actor_id, action) values ($1,$2,'export_metadata')", [own, alice]), /permission denied/);
    assert.equal((await db.query("update public.core_notifications set read_at = now() returning id")).rows.length, 1);
    await as("anon", alice);
    await assert.rejects(db.query("select * from public.core_files"), /permission denied/);
    await assert.rejects(db.query("select * from public.search_core_files($1,'')", [own]), /permission denied/);
  } finally {
    await db.close();
  }
});
