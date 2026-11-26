# v5 Phase 0 spikes

Throwaway proofs for `specs/001-v5-videojs10-rewrite/research.md` → "Phase 0 spikes" (S-1 … S-7).
Each folder has a `README.md` with the question, the method, the result (yes / no / not verified here) and the numbers.
The summary is in `specs/001-v5-videojs10-rewrite/log.md`. Nothing here ships; Phase 1 (T013) deletes this folder with the v4 tree.

## Install

The spikes run on top of the v4 tree, so the root `package.json` stays v4. Install the spike packages from the repository root without saving them (the repository `.npmrc` selects the public npm registry):

```bash
npm ci
npm i --no-save @videojs/html@10.7.0 @videojs/hlsjs-video@10.7.0 @videojs/dash-video@10.7.0 rolldown@1.3.3 tsdown@0.23.7 oxlint@1.95.0 ts-json-schema-generator@2.10.0 typescript7@npm:typescript@7.0.2
```

All are approved v5 dependencies (`plan.md` → "Approvals"); Rolldown is the bundler inside tsdown. Browser checks use the Playwright already in the v4 dev dependencies.
