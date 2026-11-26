// S-6 criterion 3: cross-origin loading of the IIFE loader + ESM chunks + CSS.
// Run from the repository root after build.mjs:  node spikes/s6-build/cors.mjs
//
// Origin A (page)  = http://127.0.0.1:<portA>  — the customer page.
// Origin B (CDN)   = http://127.0.0.1:<portB>  — serves dist/: player.min.js, esm/*.js, esm/*.css.
//   B+ sends `Access-Control-Allow-Origin: *`; B- sends no CORS header.
// The loader computes its base from document.currentScript.src, so the loader
// and its chunks always come from the same origin (B), as on jsDelivr.
import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { writeFileSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { chromium, firefox, webkit } from '@playwright/test';

const here = import.meta.dirname;
const dist = join(here, 'dist');
const types = { '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8' };
const cssFiles = (await readdir(join(dist, 'esm'))).filter((f) => f.endsWith('.css'));

function listen(handler) {
  const server = createServer(handler);
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, origin: `http://127.0.0.1:${server.address().port}` })));
}

/** CDN origin. `log` records path, Origin header and whether ACAO was sent. */
async function cdn(cors) {
  const log = [];
  const res = await listen(async (req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
    const headers = { 'Cache-Control': 'no-store', 'Content-Type': types[extname(path)] ?? 'application/octet-stream' };
    if (cors) headers['Access-Control-Allow-Origin'] = '*';
    log.push({ path, origin: req.headers.origin ?? null, secFetchMode: req.headers['sec-fetch-mode'] ?? null, acao: cors });
    try {
      const body = await readFile(join(dist, path));
      res.writeHead(200, headers).end(body);
    } catch {
      res.writeHead(404, headers).end('not found');
    }
  });
  return { ...res, log };
}

function page(mode, cdnOrigin, cdnName) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>S-6 ${mode} ${cdnName}</title>
<script>
  window.__s6 = {};
  document.addEventListener('ready', (e) => { __s6.ready = e.detail; }, true);
  document.addEventListener('error', (e) => { if (e.detail) __s6.error = e.detail; }, true);
</script>
<script ${mode} src="${cdnOrigin}/player.min.js"></script>
</head><body>
<cld-video-player cloud-name="demo" public-id="dog" features="chapters title"></cld-video-player>
</body></html>`;
}

const pages = await listen((req, res) => {
  const url = new URL(req.url, 'http://x');
  res.writeHead(200, { 'Content-Type': types['.html'], 'Cache-Control': 'no-store' })
    .end(page(url.searchParams.get('mode'), url.searchParams.get('cdn'), url.searchParams.get('name')));
});
const cdnCors = await cdn(true);
const cdnNoCors = await cdn(false);

const engines = { chromium, firefox, webkit };
const runs = [];
for (const [engineName, engine] of Object.entries(engines)) {
  const browser = await engine.launch({ headless: true });
  for (const mode of ['defer', 'async']) {
    for (const target of [{ name: 'B+cors', server: cdnCors }, { name: 'B-nocors', server: cdnNoCors }]) {
      const context = await browser.newContext(); // fresh cache per case
      const p = await context.newPage();
      const consoleErrors = [];
      p.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
      p.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));
      const failed = [];
      p.on('requestfailed', (r) => failed.push({ url: r.url().replace(target.server.origin, 'B'), error: r.failure()?.errorText }));
      target.server.log.length = 0;
      const url = `${pages.origin}/?mode=${mode}&name=${target.name}&cdn=${encodeURIComponent(target.server.origin)}`;
      await p.goto(url, { waitUntil: 'load' });
      await p.waitForFunction(() => window.__s6.ready || window.__s6.error, null, { timeout: 10000 }).catch(() => {});
      const state = await p.evaluate(() => {
        const color = (sel) => { const el = document.querySelector(sel); return el ? getComputedStyle(el).color : null; };
        return {
          ready: window.__s6.ready ?? null,
          error: window.__s6.error ?? null,
          elementUpgraded: !!customElements.get('cld-video-player'),
          windowCloudinary: typeof window.cloudinary,
          chaptersColor: color('.cld-chapters'),
          titleColor: color('.cld-title'),
          links: [...document.querySelectorAll('link[rel=stylesheet]')].map((l) => l.href.replace(/^.*\/esm\//, 'esm/')),
        };
      });
      // CSS alone, cross-origin, by <link> (no crossorigin attribute): does it need CORS?
      const cssProbe = await p.evaluate(async (href) => {
        const probe = document.createElement('div');
        probe.className = 'cld-chapters';
        document.body.append(probe);
        const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href });
        const ok = await new Promise((resolve) => { link.onload = () => resolve(true); link.onerror = () => resolve(false); document.head.append(link); });
        return { loaded: ok, color: getComputedStyle(probe).color };
      }, `${target.server.origin}/esm/${cssFiles.find((f) => f.startsWith('chapters'))}`);
      // B+cors: layer, both feature chunks and their CSS load and run.
      // B-nocors: the classic loader runs, import() of the layer is blocked, a CSS <link> still loads.
      const loaded = JSON.stringify(state.ready) === '["chapters","title"]' && state.chaptersColor === 'rgb(1, 2, 3)' && state.titleColor === 'rgb(7, 8, 9)';
      const outcome = loaded ? 'loaded' : state.error ? 'blocked' : 'unknown';
      const expected = target.server === cdnCors ? 'loaded' : 'blocked';
      const asExpected = outcome === expected && state.elementUpgraded && cssProbe.color === 'rgb(1, 2, 3)';
      runs.push({
        engine: engineName, version: browser.version(), mode, cdn: target.name, outcome, expected, asExpected, ...state, cssProbe,
        requests: target.server.log.map((r) => `${r.path} origin=${r.origin ?? '-'} mode=${r.secFetchMode ?? '-'}`),
        failed, consoleErrors,
      });
      await context.close();
    }
  }
  await browser.close();
}

pages.server.close();
cdnCors.server.close();
cdnNoCors.server.close();

writeFileSync(join(here, 'results-cors.json'), `${JSON.stringify(runs, null, 2)}\n`);
for (const r of runs) {
  console.log(`${r.asExpected ? 'ok' : 'UNEXPECTED'} ${r.engine.padEnd(8)} ${r.version.padEnd(14)} ${r.mode.padEnd(5)} ${r.cdn.padEnd(8)} ${r.outcome.padEnd(7)} loader=${r.elementUpgraded ? 'ran' : 'no'} ready=${JSON.stringify(r.ready)} chapters=${r.chaptersColor} title=${r.titleColor} cssProbe=${r.cssProbe.loaded}/${r.cssProbe.color}${r.error ? `  error=${r.error}` : ''}`);
}
