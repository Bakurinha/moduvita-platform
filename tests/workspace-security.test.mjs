import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";

const alice = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const bob = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

test("RLS separates workspaces and blocks direct membership edits", async () => {
  const db = new PGlite();
  try {
    // Minimal Supabase Auth contract for an isolated PostgreSQL integration test.
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
    const migration = await readFile(new URL("../supabase/migrations/20260924000100_workspaces.sql", import.meta.url), "utf8");
    await db.exec(migration);

    async function as(role, id) {
      await db.exec(`set role ${role}; select set_config('request.jwt.claim.sub', '${id}', false);`);
    }
    const list = () => db.query("select id, name from public.workspaces order by name");

    await as("authenticated", alice);
    const created = await db.query("select public.create_workspace($1, $2) as id", ["Casa", "personal"]);
    const aliceId = created.rows[0].id;
    assert.deepEqual((await list()).rows.map(({ name }) => name), ["Casa"]);
    assert.equal((await db.query("select role from public.workspace_members")).rows[0].role, "owner");

    await as("authenticated", bob);
    assert.deepEqual((await list()).rows, []);
    assert.deepEqual((await db.query("select * from public.workspace_members")).rows, []);
    await assert.rejects(db.exec(`insert into public.workspace_members values ('${aliceId}', '${bob}', 'owner')`), /permission denied/);
    await assert.rejects(db.exec(`insert into public.workspaces (name, kind, created_by) values ('Intruso', 'personal', '${bob}')`), /permission denied/);

    const bobWorkspace = await db.query("select public.create_workspace($1, $2) as id", ["Trabalho", "professional"]);
    assert.notEqual(bobWorkspace.rows[0].id, aliceId);
    assert.deepEqual((await list()).rows.map(({ name }) => name), ["Trabalho"]);

    await as("authenticated", alice);
    assert.deepEqual((await list()).rows.map(({ name }) => name), ["Casa"]);
    await assert.rejects(db.query("select public.create_workspace($1, $2)", ["   ", "personal"]), /invalid workspace name/);
    await assert.rejects(db.query("select public.create_workspace($1, $2)", ["Outro", "unknown"]), /invalid workspace kind/);

    await as("anon", alice);
    await assert.rejects(db.query("select public.create_workspace('Falha', 'personal')"), /permission denied/);
    await assert.rejects(list(), /permission denied/);
  } finally {
    await db.close();
  }
});
