# Contract: Cloudinary video service client

**Requirements**: FR-010, FR-011, FR-015, FR-017, FR-037, FR-038, SC-012. **Decision**: D-08 — every request to the video service goes through one core module, `src/core/video-service.ts`.

v4 builds these URLs in five files (`utils/fetch-config.js`, `video-source.js`, `chapters.js`, `text-tracks-manager/index.js`, `title-bar.js`). v5 has one module with one function per resource. Each function is pure (returns a URL) except `fetchConfig`, `fetchTranscript` and `fetchMetadata`, which also fetch.

## Common rules

| Rule | Value |
|---|---|
| Prefix | `{urlPrefix}/_applet_/video_service`, where `urlPrefix` comes from `CloudConfig` exactly as v4 `getCloudinaryUrlPrefix` (secure, private CDN, CNAME, secure distribution). |
| Delivery type | Source `type`, default `upload`. |
| Public ID encoding | `base64(utf8(publicId))`, standard alphabet (`+`, `/`, `=`), **as v4**. Not URL-safe; kept for URL parity (FR-011). Changing it needs server confirmation first. |
| Usage marker | `_s=vp` query parameter when `allowUsageReport` is not `false` (config and profile requests, as v4). |
| Credentials | `credentials: 'include'` on every request when the source has `withCredentials` (FR-015). |
| Abort | Every fetch takes the source's `AbortSignal`; a source change or `dispose()` aborts it (FR-005). |
| Errors | A failed request never throws to the integrator. It yields "no data" plus a debug message. |

## Resources

| Function | URL | Response | Used by |
|---|---|---|---|
| `profileUrl(name)` | `{prefix}/video_player_profiles/{name, spaces → '+'}.json[?_s=vp]` | `{ playerOptions, sourceOptions }` | `player()`, element |
| `assetConfigUrl(publicId, type)` | `{prefix}/video_player_config/video/{type}/{b64}.json[?_s=vp]` | `{ playerOptions, sourceOptions }` | `player()`, element (when `videoConfig !== false`, a public ID is set and no `profile`) |
| `posterUrl(publicId, type, tx?)` | `{prefix}/elements/{type}/{b64}/poster[?tx={transformation string}]` | 302 to the saved poster, else to the default still (`video/upload/{id}.jpg`); 400 for an unknown asset; `no-store` | Every entry point (FR-038) |
| `chaptersUrl(publicId, type)` | `{prefix}/chapters/{type}/{b64}.vtt` | VTT | Chapters feature (`chapters: true`) |
| `transcriptUrl(publicId, type, lang?)` | `{prefix}/transcription/{type}/[{lang}/]{b64}.transcript` | Transcript JSON; **202** while generation is in progress | Captions (`origin: 'transcript'`) |
| `metadataUrl(publicId, type)` | `{prefix}/video_metadata/{type}/{b64}.json` + source `queryParams` | `{ title, description, … }` | Title bar (`title: true` / `description: true`) |

## Profiles

| Profile value | Behavior |
|---|---|
| Built-in name (`cld-default`, `cld-looping`, `cld-adaptive-stream`, `cld-live-streaming`, from `cloudinary-video-player-profiles`) | No request; the bundled config is used. |
| Raw URL | Fetched as is; its JSON is merged (FR-037, v4 behavior). |
| Any other string | `profileUrl(name)`. |

## Merge order (v4 `fetchAndMergeConfig`)

```text
effective = { ...rename(fetched.playerOptions), ...rename(fetched.sourceOptions), ...localOptions }
```

Local options win. `rename()` is the one rename table (`contracts/options.md` rule 3). Secrets inside fetched JSON are dropped and warned like local ones (FR-029).

## Poster precedence and timing (FR-038, SC-012)

1. The poster URL is known synchronously from the public ID, so the shell can show it before any request finishes. No poster flash.
2. The per-asset configuration, when it arrives, changes the poster only if it sets `poster` or `posterOptions`.
3. Not used for raw URLs or audio sources.

## Intentional differences from v4

| Item | v4 | v5 |
|---|---|---|
| Failure of a config request | Silent | Silent for viewers; debug message for integrators. |

Everything else is byte-identical to v4 (URL-parity fixtures, R-07). Two possible improvements stay out of 5.0 unless the server team confirms them: encoding the `tx` value (v4 sends it unencoded, audit H), and dropping the `X-Cld-Video-Player-Version` header on the metadata request (a custom header forces a CORS preflight).
