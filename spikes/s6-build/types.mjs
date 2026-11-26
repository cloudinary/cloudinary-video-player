// S-6 criterion 5: TypeScript 7 (isolatedDeclarations) + ts-json-schema-generator.
// Run from the repository root:  node spikes/s6-build/types.mjs
// Each compiler is called by its explicit path (node_modules/.bin/tsc is TS 7 here).
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const here = import.meta.dirname;
const root = join(here, '../..');
const clean = (s) => s.split(root + '/').join('').trim();
const run = (args) => {
  const r = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8' });
  return { exitCode: r.status, output: clean(`${r.stdout}${r.stderr}`).split('\n').slice(0, 4).join('\n') };
};

const tsc7 = join(root, 'node_modules/typescript7/bin/tsc');
const generatorBin = join(root, 'node_modules/ts-json-schema-generator/bin/ts-json-schema-generator.js');
const generatorRequire = createRequire(join(root, 'node_modules/ts-json-schema-generator/package.json'));
const generatorTs = generatorRequire.resolve('typescript');
const pkg = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));

const results = {
  typescript7: run([tsc7, '--version']).output,
  generator: pkg('node_modules/ts-json-schema-generator/package.json').version,
  generatorTypeScriptPeer: pkg('node_modules/ts-json-schema-generator/package.json').dependencies.typescript,
  generatorResolvesTypeScript: { path: relative(root, generatorTs), version: generatorRequire('typescript').version },
  // 1. TS 7 type check of the fixture (isolatedDeclarations: true).
  tsc7Fixture: run([tsc7, '-p', join(here, 'tsconfig.json')]),
  // 2. Negative control: a file that breaks isolatedDeclarations must fail.
  tsc7NegativeControl: run([tsc7, '-p', join(here, 'cases/tsconfig.json')]),
};

// 3. Schema from the options type, with the separate tsconfig (TS 5.9 options only).
const schemaArgs = ['-p', join(here, 'src/core/options.ts'), '-t', 'PlayerOptions', '--functions', 'hide'];
results.schemaSeparateTsconfig = run([generatorBin, '-f', join(here, 'tsconfig.schema.json'), ...schemaArgs, '-o', join(here, 'schema.json')]);
// 4. Same with the main (TS 7) tsconfig: the generator drops `declaration`, so
//    `isolatedDeclarations` alone gives TS5069 and the run stops.
results.schemaMainTsconfig = run([generatorBin, '-f', join(here, 'tsconfig.json'), ...schemaArgs]);
{
  // The CLI hides the diagnostic; replay the generator's option handling to show it.
  const ts = generatorRequire('typescript');
  const file = join(here, 'tsconfig.json');
  const parsed = ts.parseJsonConfigFileContent(ts.readConfigFile(file, ts.sys.readFile).config, ts.sys, here);
  parsed.options.noEmit = true;
  delete parsed.options.declaration; // as ts-json-schema-generator/dist/factory/program.js does
  const program = ts.createProgram([join(here, 'src/core/options.ts')], parsed.options);
  results.schemaMainTsconfig.cause = ts.getPreEmitDiagnostics(program).map((d) => `TS${d.code}: ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`);
}

// 5. Which Video.js entry points export the @internal names (TS2305 = not exported there).
results.videojsInternalNameProbe = run([tsc7, '-p', join(here, 'cases/tsconfig.videojs.json')]);
results.videojsInternalNameProbe.output = clean(spawnSync(process.execPath, [tsc7, '-p', join(here, 'cases/tsconfig.videojs.json')], { cwd: root, encoding: 'utf8' }).stdout).split('\n');

const schema = JSON.parse(readFileSync(join(here, 'schema.json'), 'utf8'));
const props = schema.definitions.PlayerOptions.properties;
results.schemaChecks = {
  skinEnum: schema.definitions.Skin.enum,
  autoplayModeEnum: schema.definitions.AutoplayMode.enum,
  skinDefault: props.skin.default,
  volume: { default: props.volume.default, minimum: props.volume.minimum, maximum: props.volume.maximum },
  deprecated: props.autoplayOnScroll.deprecated,
  functionHidden: !('onReady' in props),
  required: schema.definitions.PlayerOptions.required,
};

writeFileSync(join(here, 'results-types.json'), `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results, null, 2));
