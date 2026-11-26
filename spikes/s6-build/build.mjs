// S-6 build checks (criteria 1, 2, 4). Run from the repository root:
//   node spikes/s6-build/build.mjs
// Writes dist/ (tsdown: ESM + IIFE loader), dist/rolldown/ (plain Rolldown
// fallback), dist/names/ (chunk-name variants) and results-build.json.
import { build as tsdown } from 'tsdown';
import { build as rolldown } from 'rolldown';
import { readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { cssSplit } from './css-split-plugin.mjs';

const here = import.meta.dirname;
const rel = (p) => relative(here, p);
const pkgVersion = (name) => JSON.parse(readFileSync(join(here, '../../node_modules', name, 'package.json'), 'utf8')).version;
const gz = (buf) => gzipSync(buf, { level: 9 }).length;
const br = (buf) => brotliCompressSync(buf).length;
const list = (dir) => readdirSync(dir, { recursive: true, withFileTypes: true }).filter((d) => d.isFile()).map((d) => rel(join(d.parentPath, d.name))).sort();
const errorText = (e) => String(e.message ?? e).split('\n').filter((l) => /UNSUPPORTED|not installed|Error/.test(l)).slice(0, 2).map((l) => l.replace(here, '.')).join(' | ');
const target = ['chrome111', 'firefox121', 'safari16.4'];
const results = {
  versions: { tsdown: pkgVersion('tsdown'), rolldown: pkgVersion('rolldown'), 'rolldown-plugin-dts': pkgVersion('rolldown-plugin-dts'), lightningcss: pkgVersion('lightningcss') },
  target,
};

for (const dir of ['dist']) rmSync(join(here, dir), { recursive: true, force: true });

// 1. Main build: the tsdown config (ESM with .d.ts + IIFE loader).
await tsdown({ config: join(here, 'tsdown.config.mts'), logLevel: 'warn' });
results.tsdownFiles = list(join(here, 'dist'));

// Unminified loader and the mechanism-only loader (no shell), same IIFE setup.
const iife = (entry, outDir, minify) => tsdown({
  config: false, cwd: here, tsconfig: 'tsconfig.json', platform: 'browser', target, logLevel: 'warn',
  entry, format: 'iife', outDir, minify, clean: false, dts: false, report: false,
  outputOptions: { entryFileNames: '[name].js' },
});
await iife({ 'player.debug': 'src/entries/cdn-loader.ts' }, 'dist/names/iife', false);
await iife({ 'min-loader': 'cases/min-loader.ts' }, 'dist/names/iife', true);

// Criterion 1: the import() line in the IIFE, and no layer code in it.
const loader = readFileSync(join(here, 'dist/player.min.js'));
const loaderDebug = readFileSync(join(here, 'dist/names/iife/player.debug.js'), 'utf8');
results.iife = {
  minifiedImportCall: loader.toString().match(/.{0,80}import\([^)]*\).{0,40}/)?.[0],
  unminifiedImportLines: loaderDebug.split('\n').filter((l) => /import\(|currentScript|layerUrl =/.test(l)).map((l) => l.trim()),
  layerCodeAbsent: !/video\/upload|cld-chapters|cld-title|createElement\(.video/.test(loader.toString()),
  staticImportOrRequire: /\bimport\s*[{*"']|\brequire\(/.test(loader.toString()),
};

// Criterion 4: loader size (gzip -9, as S-1).
const minLoader = readFileSync(join(here, 'dist/names/iife/min-loader.js'));
results.size = {
  loader: { file: 'dist/player.min.js', raw: loader.length, gzip: gz(loader), brotli: br(loader) },
  mechanismOnly: { file: 'dist/names/iife/min-loader.js', raw: minLoader.length, gzip: gz(minLoader), code: minLoader.toString().trim() },
  budgetGzip: 10 * 1024,
};

// Criterion 2a: tsdown CSS without @tsdown/css (default `css` option).
try {
  await tsdown({
    config: false, cwd: here, tsconfig: 'tsconfig.json', platform: 'browser', logLevel: 'silent',
    entry: { player: 'src/player/index.ts' }, format: 'esm', outDir: 'dist/names/tsdown-css-default', dts: false, report: false, clean: false,
  });
  results.tsdownCssDefault = 'built (unexpected)';
} catch (e) {
  results.tsdownCssDefault = `error: ${errorText(e)}`;
}

// Criterion 2b: plain Rolldown, no CSS plugin.
const rolldownBase = { cwd: here, tsconfig: join(here, 'tsconfig.json'), platform: 'browser', logLevel: 'silent', transform: { target } };
try {
  await rolldown({ ...rolldownBase, input: { player: 'src/player/index.ts' }, write: false, output: { format: 'esm' } });
  results.rolldownNoPlugin = 'built (unexpected)';
} catch (e) {
  results.rolldownNoPlugin = `error: ${errorText(e)}`;
}

// Criterion 2c: plain Rolldown fallback with the own CSS plugin: ESM + IIFE.
await rolldown({
  ...rolldownBase, plugins: [cssSplit()], input: { index: 'src/entries/index.ts', player: 'src/player/index.ts' },
  output: { dir: join(here, 'dist/rolldown/esm'), format: 'esm', minify: true },
});
await rolldown({
  ...rolldownBase, input: { 'player.min': 'src/entries/cdn-loader.ts' },
  output: { dir: join(here, 'dist/rolldown'), format: 'iife', minify: true },
});
const rdLoader = readFileSync(join(here, 'dist/rolldown/player.min.js'), 'utf8');
results.rolldownFallback = {
  files: list(join(here, 'dist/rolldown')),
  iifeKeepsImport: /import\(\w+\)/.test(rdLoader),
  iifeGzip: gz(Buffer.from(rdLoader)),
};

// Criterion 2d: chunk and CSS names per naming option (tsdown + own plugin).
const variants = {
  'tsdown-default': {},
  'hash-false': { hash: false },
  'name-only': { outputOptions: { chunkFileNames: '[name].js' } },
};
results.naming = {};
for (const [name, extra] of Object.entries(variants)) {
  const outDir = join(here, 'dist/names', name);
  await tsdown({
    config: false, cwd: here, tsconfig: 'tsconfig.json', platform: 'browser', target, logLevel: 'silent', minify: true,
    entry: { index: 'src/entries/index.ts', player: 'src/player/index.ts' }, format: 'esm', outDir, dts: false, report: false, clean: false,
    css: false, plugins: [cssSplit()], outExtensions: () => ({ js: '.js' }), ...extra,
  });
  results.naming[name] = readdirSync(outDir).sort();
}

// Stability: same input → same names. CSS-only change → does the CSS name change?
const namesWith = async (readCss) => {
  const { output } = await rolldown({
    ...rolldownBase, input: { player: 'src/player/index.ts' }, write: false, plugins: [cssSplit({ readCss })],
    output: { format: 'esm', minify: true },
  });
  return output.map((o) => o.fileName).sort();
};
const first = await namesWith();
const second = await namesWith();
const cssChanged = await namesWith((id) => readFileSync(id, 'utf8') + (id.endsWith('chapters.css') ? '.changed{color:red}' : ''));
results.stability = {
  sameInputSameNames: JSON.stringify(first) === JSON.stringify(second),
  names: first,
  afterCssOnlyChange: cssChanged,
  cssNameChangesWithCss: JSON.stringify(first) !== JSON.stringify(cssChanged),
};

writeFileSync(join(here, 'results-build.json'), `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results, null, 2));
