#!/usr/bin/env node
// CI: waits until the Netlify deploy preview (PREVIEW_URL) serves the PR head commit (HEAD_SHA).
const { PREVIEW_URL, HEAD_SHA } = process.env;
const TIMEOUT_MS = 10 * 60_000;
const INTERVAL_MS = 15_000;

if (!PREVIEW_URL || !HEAD_SHA) {
  console.error('PREVIEW_URL and HEAD_SHA are required.');
  process.exit(1);
}

const url = new URL('build-info.json', PREVIEW_URL);
const deadline = Date.now() + TIMEOUT_MS;
let seen = 'none';
while (Date.now() < deadline) {
  const info = await fetch(url, { cache: 'no-store' }).then((response) => (response.ok ? response.json() : null), () => null);
  seen = info?.commit ?? 'none';
  if (seen === HEAD_SHA) {
    console.log(`Preview is live for ${HEAD_SHA}.`);
    process.exit(0);
  }
  await new Promise((resolve) => setTimeout(resolve, INTERVAL_MS));
}
console.error(`Timed out after ${TIMEOUT_MS / 60_000} min: ${url} shows commit ${seen}, not ${HEAD_SHA}.`);
process.exit(1);
