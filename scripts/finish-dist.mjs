#!/usr/bin/env node
// Runs after tsdown: the CDN file names that are copies (contracts/distribution.md) and schema.json.
import { copyFile } from 'node:fs/promises';

const COPIES = [
  ['dist/player.min.js', 'dist/cld-video-player.min.js'],
  ['dist/player.min.js', 'dist/player-full.min.js'],
  ['dist/player.min.css', 'dist/cld-video-player.min.css'],
  ['schema.json', 'dist/schema.json'],
];

for (const [from, to] of COPIES) {
  await copyFile(from, to);
}
