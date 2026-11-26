// S-1 size spike: bundle each entry with Rolldown (minified ESM, browser), then
// measure gzip (level 9) and brotli of the entry chunk and of the lazy chunks.
// Run from the repository root: node spikes/s1-size/build.mjs
import { build } from 'rolldown';
import { readdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const entries = readdirSync(join(here, 'entries')).filter((f) => f.endsWith('.js'));
const version = JSON.parse(readFileSync(new URL(import.meta.resolve('@videojs/html/package.json')), 'utf8')).version;
const kb = (n) => Math.round((n / 1024) * 10) / 10;
const results = { videojs: version, method: 'rolldown minify, gzip -9 (node:zlib), brotli q11', entries: {} };

for (const file of entries) {
  const name = file.replace(/\.js$/, '');
  const outDir = join(here, 'dist', version, name);
  rmSync(outDir, { recursive: true, force: true });
  const { output } = await build({
    input: join(here, 'entries', file),
    platform: 'browser',
    logLevel: 'warn',
    output: { dir: outDir, format: 'esm', minify: true },
    write: true,
  });
  const chunks = output.filter((o) => o.type === 'chunk');
  const sizeOf = (c) => ({ raw: kb(c.code.length), gzip: kb(gzipSync(c.code, { level: 9 }).length), brotli: kb(brotliCompressSync(c.code).length) });
  const entry = chunks.find((c) => c.isEntry);
  const statics = chunks.filter((c) => !c.isEntry && entry.imports.includes(c.fileName));
  const lazy = chunks.filter((c) => !c.isEntry && !entry.imports.includes(c.fileName));
  const initial = [entry, ...statics].map((c) => c.code).join('\n');
  results.entries[name] = {
    initial: { raw: kb(initial.length), gzip: kb(gzipSync(initial, { level: 9 }).length), brotli: kb(brotliCompressSync(initial).length) },
    lazyChunks: lazy.length,
    lazyGzipTotal: kb(lazy.reduce((n, c) => n + gzipSync(c.code, { level: 9 }).length, 0)),
    largestLazy: lazy.map((c) => ({ name: c.fileName, ...sizeOf(c) })).sort((a, b) => b.gzip - a.gzip).slice(0, 3),
  };
}

writeFileSync(join(here, `results-${version}.json`), `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results, null, 2));
