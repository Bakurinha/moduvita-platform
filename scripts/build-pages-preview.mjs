import { spawnSync } from "node:child_process";
import { access, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = "/moduvita-platform";
const result = spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "build"], {
  cwd: root,
  env: { ...process.env, PAGES_PREVIEW: "1", NEXT_PUBLIC_PAGES_PREVIEW: "1" },
  stdio: "inherit",
});
if (result.status !== 0) process.exit(result.status ?? 1);

const htmlPath = path.join(root, "apps/web/.next/server/app/index.html");
const html = await readFile(htmlPath, "utf8");
const assets = [...html.matchAll(/(?:src|href)="([^"]*_next\/static\/[^\"]+)"/g)].map((match) => match[1]);
if (!assets.length || assets.some((asset) => !asset.startsWith(`${base}/_next/static/`))) {
  throw new Error("A prévia não aponta para os recursos estáticos sob o caminho do GitHub Pages.");
}
if (html.includes("/login") || !html.includes("Prévia pública da interface")) {
  throw new Error("A página publicada deve identificar a prévia e não conter um link de login.");
}

const output = path.join(root, "dist/pages");
await rm(output, { recursive: true, force: true });
await mkdir(path.join(output, "_next"), { recursive: true });
await writeFile(path.join(output, "index.html"), html);
await writeFile(path.join(output, ".nojekyll"), "");
await cp(path.join(root, "apps/web/.next/static"), path.join(output, "_next/static"), { recursive: true });
for (const asset of assets) {
  const relativePath = decodeURIComponent(asset.slice(base.length + 1).split("?")[0]);
  await access(path.join(output, relativePath));
}
console.log(`Prévia estática gerada em ${output} (${assets.length} recursos referenciados).`);
