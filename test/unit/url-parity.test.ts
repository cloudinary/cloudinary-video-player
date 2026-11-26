// URL parity with v4 (SC-002, FR-011): every recorded case matches, or is listed with a reason in
// test/fixtures/url-parity/intentional-changes.json (`{ "<file>:<case id>": "<reason>" }`).
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { cleanOptions, normalizeOptions, resolveCloudConfig } from '../../src/core/options/normalize.js';
import type { SourceOptions } from '../../src/core/options/types.js';
import { buildSource, resolveSource, thumbnailSpriteUrl, type Display } from '../../src/core/source/build-source.js';
import type { Source } from '../../src/core/source/types.js';

const FIXTURES = 'test/fixtures/url-parity';
const read = (name: string): unknown => JSON.parse(readFileSync(`${FIXTURES}/${name}`, 'utf8'));
const changes = (existsSync(`${FIXTURES}/intentional-changes.json`) ? read('intentional-changes.json') : {}) as Record<string, string>;

interface RecordedSource { type: string; src: string; isAdaptive?: boolean; withCredentials?: boolean }
interface Case<I, O> { id: string; input: I; output: O }
interface Fixture<I, O> { cases: Case<I, O>[] }

/** Runs each case, or skips it with the reason when it is a listed intentional change. */
function eachCase<I, O>(file: string, run: (input: I, output: O) => void): void {
  const { cases } = read(file) as Fixture<I, O>;
  for (const { id, input, output } of cases) {
    const reason = changes[`${file}:${id}`];
    if (reason) it.skip(`${id} (intentional change: ${reason})`, () => {});
    else it(id, () => run(input, output));
  }
}

// The v4 source shape of a rendition
const v4Sources = (source: Source, withFlags: boolean): RecordedSource[] =>
  source.renditions.map(({ url, mimeType, engine }) => ({
    type: mimeType,
    src: url,
    ...(withFlags && { isAdaptive: engine !== 'native', withCredentials: source.withCredentials }),
  }));

type SourceInput = { publicId: string; options: Record<string, unknown>; sourceTypes?: string[]; display: { hdr: boolean } };
type SourceOutput = { sources: RecordedSource[]; poster: string | null } | { error: string };

describe('URL parity: source level (v4 VideoSource)', () => {
  eachCase<SourceInput, SourceOutput>('source.json', ({ publicId, options, sourceTypes, display }, output) => {
    const own = cleanOptions({ ...options, publicId, ...(sourceTypes && { sourceTypes }) }) as SourceOptions;
    const resolve = () => resolveSource(own, resolveCloudConfig(own), display);
    if ('error' in output) {
      expect(resolve).toThrow(output.error);
      return;
    }
    const source = resolve();
    // Sources first, so a poster-only change shows that the renditions matched
    expect(v4Sources(source, true)).toEqual(output.sources);
    expect(source.poster?.url ?? null).toBe(output.poster);
  });
});

type PlayerInput = { player: Record<string, unknown>; publicId: string; source: Record<string, unknown>; display: Display };
type PlayerOutput = { sources: RecordedSource[]; poster: string | null; requests: string[] };

describe('URL parity: player level (v4 player, buildSource)', () => {
  eachCase<PlayerInput, PlayerOutput>('player.json', ({ player, publicId, source, display }, output) => {
    const playerOptions = normalizeOptions([{ cloudinaryConfig: { cloud_name: 'demo' }, ...player }]);
    const built = buildSource({ ...source, publicId } as SourceOptions, playerOptions, display);
    expect(v4Sources(built, false)).toEqual(output.sources);
    // The seek-thumbnail sprite that v4 requested (`seekThumbnails` is on by default)
    const sprite = output.requests.find((url) => url.includes('/fl_sprite/')) ?? null;
    expect(playerOptions.seekThumbnails ? thumbnailSpriteUrl(built) : null).toBe(sprite);
    expect(built.poster?.url ?? null).toBe(output.poster);
  });
});
