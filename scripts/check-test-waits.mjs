#!/usr/bin/env node
// Fixed waits make tests slow and flaky (test-plan.md §2): fail on waitForTimeout and networkidle in test/.
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const BANNED = /waitForTimeout|networkidle/;
const files = (await readdir('test', { recursive: true })).filter((file) => /\.(ts|js|mjs)$/.test(file) && !file.startsWith('fixtures/'));
const hits = [];
for (const file of files) {
  const lines = (await readFile(join('test', file), 'utf8')).split('\n');
  lines.forEach((line, index) => BANNED.test(line) && hits.push(`test/${file}:${index + 1}: ${line.trim()}`));
}
if (hits.length) {
  console.error(`Fixed waits are not allowed in test/ (use web-first assertions or expect.poll):\n${hits.join('\n')}`);
  process.exit(1);
}
