#!/usr/bin/env node
// Netlify build: records the commit in the examples site, so CI knows when the preview of a PR head is live.
import { writeFile } from 'node:fs/promises';

const info = { commit: process.env.COMMIT_REF ?? 'local', builtAt: new Date().toISOString() };
await writeFile('examples/dist/build-info.json', `${JSON.stringify(info, null, 2)}\n`);
