// S-6 criterion 6: oxlint ring rules and the Video.js @internal name ban.
// Run from the repository root:  node spikes/s6-build/lint.mjs
// Every `*.bad.ts` file must have at least one error; every other file none.
import { spawnSync } from 'node:child_process';
import { readdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const here = import.meta.dirname;
const root = join(here, '../..');
const oxlint = join(root, 'node_modules/oxlint/bin/oxlint');
const rel = (p) => relative(here, join(root, p));

function lint(config, extra = []) {
  const r = spawnSync(process.execPath, [oxlint, '-c', join(here, config), '-f', 'json', ...extra, join(here, 'src')], { cwd: root, encoding: 'utf8' });
  const json = JSON.parse(r.stdout);
  const byFile = {};
  for (const d of json.diagnostics) (byFile[rel(d.filename)] ??= []).push(`${d.code}: ${d.message}`);
  return { exitCode: r.status, files: json.number_of_files, byFile };
}

const files = readdirSync(join(here, 'src'), { recursive: true })
  .filter((f) => /\.ts$/.test(f)).map((f) => join('src', f)).sort();

const main = lint('.oxlintrc.json');
const cases = files.map((file) => {
  const errors = main.byFile[file] ?? [];
  const expectError = file.endsWith('.bad.ts');
  return { file, expectError, caught: errors.length > 0, ok: expectError === errors.length > 0, errors };
});

// Does a folder override replace the base rule options (ESLint semantics)?
const noRepeat = lint('oxlintrc.no-repeat.json');
const overrideProbe = 'src/features/chapters/internal-name.bad.ts';

// --type-aware needs an extra package (oxlint-tsgolint or tsrs); record the real message.
const typeAware = spawnSync(process.execPath, [oxlint, '-c', join(here, '.oxlintrc.json'), '--type-aware', join(here, 'src/core/cloud.ts')], { cwd: root, encoding: 'utf8' });

const results = {
  oxlint: spawnSync(process.execPath, [oxlint, '--version'], { encoding: 'utf8' }).stdout.trim(),
  filesLinted: main.files,
  exitCode: main.exitCode,
  allOk: cases.every((c) => c.ok),
  cases,
  overrideReplacesBaseOptions: {
    probe: overrideProbe,
    caughtWithPathsRepeated: (main.byFile[overrideProbe] ?? []).length > 0,
    caughtWithoutRepeat: (noRepeat.byFile[overrideProbe] ?? []).length > 0,
  },
  typeAware: { exitCode: typeAware.status, output: `${typeAware.stdout}${typeAware.stderr}`.trim() },
};
writeFileSync(join(here, 'results-lint.json'), `${JSON.stringify(results, null, 2)}\n`);
for (const c of cases) console.log(`${c.ok ? 'ok  ' : 'FAIL'} ${c.expectError ? 'bad  ' : 'clean'} ${c.file}${c.errors.length ? `\n       ${c.errors.join('\n       ')}` : ''}`);
console.log(JSON.stringify({ ...results, cases: undefined }, null, 2));
