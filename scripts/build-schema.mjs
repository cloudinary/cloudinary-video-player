#!/usr/bin/env node
// Generates schema.json (committed, FR-007) from the single options definition.
// `--check` fails when the committed file differs from a fresh run (schema drift).
import { readFile, writeFile } from 'node:fs/promises';
import { createGenerator } from 'ts-json-schema-generator';

const OUT = 'schema.json';
const schema = createGenerator({
  path: 'src/core/options/types.ts',
  tsconfig: 'tsconfig.schema.json',
  type: 'PlayerOptions',
  functions: 'hide',
}).createSchema('PlayerOptions');
// Unknown top-level options are reported in debug mode, not rejected (contracts/options.md).
schema.definitions.PlayerOptions.additionalProperties = true;
const json = `${JSON.stringify(schema, null, 2)}\n`;

if (process.argv.includes('--check')) {
  const committed = await readFile(OUT, 'utf8').catch(() => '');
  if (committed !== json) {
    console.error(`${OUT} is out of date. Run \`npm run schema\` and commit the result.`);
    process.exit(1);
  }
} else {
  await writeFile(OUT, json);
}
