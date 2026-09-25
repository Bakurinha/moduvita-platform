import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";

const alice = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const bob = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

test("notes and journal remain private to the author, recoverable and auditable", async () => {
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
    `);
    for (const name of ["20260924000100_workspaces.sql", "20260924000300_productivity.sql"]) {
      await db.exec(await readFile(new URL("../supabase/migrations/" + name, import.meta.url), "utf8"));
    }
    async function as(role, id) {
      await db.exec(`set role ${role}; select set_config('request.jwt.claim.sub', '${id}', false);`);
    }
    await as("authenticated", alice);
    const workspaceId = (await db.query("select public.create_workspace('Casa', 'personal') id")).rows[0].id;
    const noteId = (await db.query("insert into public.notes (workspace_id, author_id, title, body) values ($1,$2,'Ideia','Texto privado') returning id", [workspaceId, alice])).rows[0].id;
    const journalId = (await db.query("insert into public.journal_entries (workspace_id, author_id, entry_date, title, body) values ($1,$2,'2026-09-24','Dia','Reflexão privada') returning id", [workspaceId, alice])).rows[0].id;
    assert.equal((await db.query("select id from public.search_notes($1,'ideia',false,0)", [workspaceId])).rows[0].id, noteId);
    assert.equal((await db.query("select id from public.search_journal($1,'reflexão',false,0)", [workspaceId])).rows[0].id, journalId);
    await db.query("update public.notes set body = 'Texto corrigido' where id = $1", [noteId]);
    await db.query("update public.notes set deleted_at = now() where id = $1", [noteId]);
    await db.query("update public.journal_entries set deleted_at = now() where id = $1", [journalId]);
    assert.equal((await db.query("select * from public.search_notes($1,'',false,0)", [workspaceId])).rows.length, 0);
    assert.equal((await db.query("select * from public.search_notes($1,'',true,0)", [workspaceId])).rows.length, 1);
    assert.deepEqual((await db.query("select module, action from public.productivity_audit_events order by module")).rows,
      [{ module: "journal", action: "trash" }, { module: "notes", action: "trash" }]);
    await db.query("update public.notes set deleted_at = null where id = $1", [noteId]);
    assert.equal((await db.query("select * from public.search_notes($1,'corrigido',false,0)", [workspaceId])).rows.length, 1);
    assert.equal((await db.query("select action from public.productivity_audit_events where module = 'notes' and action = 'restore'")).rows.length, 1);
    await assert.rejects(db.query("delete from public.notes where id = $1", [noteId]), /permission denied/);
    await assert.rejects(db.query("insert into public.notes (workspace_id, author_id, title, body) values ($1,$2,'Forjada','Corpo')", [workspaceId, bob]), /row-level security/);
    await assert.rejects(db.query("insert into public.notes (workspace_id, author_id, title, body, deleted_at) values ($1,$2,'Oculta','Corpo',now())", [workspaceId, alice]), /permission denied/);
    await assert.rejects(db.query("update public.notes set created_at = now() where id = $1", [noteId]), /permission denied/);

    // Even a future second member of the same workspace cannot see another author's entries.
    await db.exec(`reset role; insert into public.workspace_members values ('${workspaceId}', '${bob}', 'member', now());`);
    await as("authenticated", bob);
    assert.deepEqual((await db.query("select * from public.notes")).rows, []);
    assert.deepEqual((await db.query("select * from public.journal_entries")).rows, []);
    assert.deepEqual((await db.query("select * from public.search_notes($1,'Texto',false,0)", [workspaceId])).rows, []);
    assert.deepEqual((await db.query("select * from public.search_journal($1,'',true,0)", [workspaceId])).rows, []);
    assert.deepEqual((await db.query("select * from public.productivity_audit_events")).rows, []);
    assert.deepEqual((await db.query("update public.notes set title = 'Espiada' where id = $1 returning id", [noteId])).rows, []);
    assert.deepEqual((await db.query("update public.journal_entries set deleted_at = null where id = $1 returning id", [journalId])).rows, []);
    const bobNote = (await db.query("insert into public.notes (workspace_id, author_id, title, body) values ($1,$2,'Minha','Própria') returning id", [workspaceId, bob])).rows[0].id;
    assert.deepEqual((await db.query("select id from public.notes")).rows.map(({ id }) => id), [bobNote]);
    await assert.rejects(db.query("insert into public.productivity_audit_events (workspace_id, actor_id, module, record_id, action) values ($1,$2,'notes',$3,'trash')", [workspaceId, bob, bobNote]), /permission denied/);

    await as("anon", alice);
    await assert.rejects(db.query("select * from public.notes"), /permission denied/);
    await assert.rejects(db.query("select * from public.search_journal($1,'',false,0)", [workspaceId]), /permission denied/);
  } finally {
    await db.close();
  }
});
