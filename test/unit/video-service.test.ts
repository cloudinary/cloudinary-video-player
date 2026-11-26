import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { resolveCloudConfig } from '../../src/core/options/normalize.js';
import type { CloudConfig } from '../../src/core/options/types.js';
import { fetchTranscript as transcriptFetch } from '../../src/core/tracks/transcript.js';
import {
  type AssetTarget,
  type ConfigRequest,
  assetConfigUrl,
  builtInProfile,
  chaptersUrl,
  configUrl,
  fetchConfig,
  fetchMetadata,
  fetchTranscript,
  metadataUrl,
  posterUrl,
  profileUrl,
  transcriptUrl,
  usageQuery,
} from '../../src/core/video-service.js';

const readJson = <T>(path: string): T => JSON.parse(readFileSync(new URL(`../fixtures/${path}`, import.meta.url), 'utf8')) as T;

/** A response recorded from the live service (`test/fixtures/video-service/*.json`, demo cloud). */
interface Recorded {
  readonly request: string;
  readonly status: number;
  readonly body: unknown;
}
const recorded = (name: string): Recorded => readJson<Recorded>(`video-service/${name}.json`);

const SERVICE = 'https://res.cloudinary.com/demo/_applet_/video_service';
const cloud: CloudConfig = resolveCloudConfig({ cloudName: 'demo' });
const target = (publicId = 'sea_turtle', type = 'upload', config: CloudConfig = cloud): AssetTarget => ({ cloud: config, publicId, type, resourceType: 'video' });
const vp = usageQuery(true);
const UNICODE_ID = 'folder/été vidéo';
const UNICODE_B64 = 'Zm9sZGVyL8OpdMOpIHZpZMOpbw==';
const cname = resolveCloudConfig({ cloudinaryConfig: { cloud_name: 'demo', private_cdn: true, secure_distribution: 'media.example.com' } });

// A `fetch` that answers every request with `status` and `body`, and records each call.
const answering = (status: number, body: unknown) =>
  vi.fn<typeof fetch>(async () => new Response(typeof body === 'string' ? body : JSON.stringify(body), { status }));
const fromRecording = ({ status, body }: Recorded) => answering(status, body);

describe('usageQuery', () => {
  it('adds the usage marker when the usage report is allowed', () => {
    expect(usageQuery(true)).toEqual({ _s: 'vp' });
    expect(usageQuery(false)).toEqual({});
  });
});

describe('video-service URLs (shapes from test/fixtures/url-parity/player.json)', () => {
  it('builds the poster URL, with `tx` before `_s` and the query encoded as v4 did with `_s=vp`', () => {
    expect(posterUrl(target(), { tx: 'c_limit,w_700', ...vp })).toBe(`${SERVICE}/elements/upload/c2VhX3R1cnRsZQ==/poster?tx=c_limit%2Cw_700&_s=vp`);
    expect(posterUrl(target(), { tx: 'ar_1:1,c_limit,w_700', ...vp })).toBe(`${SERVICE}/elements/upload/c2VhX3R1cnRsZQ==/poster?tx=ar_1%3A1%2Cc_limit%2Cw_700&_s=vp`);
    expect(posterUrl(target(), { tx: '', ...vp })).toBe(`${SERVICE}/elements/upload/c2VhX3R1cnRsZQ==/poster?tx=&_s=vp`);
    expect(posterUrl(target(UNICODE_ID, 'private'), { tx: 'c_limit,w_700', ...vp })).toBe(
      `${SERVICE}/elements/private/${UNICODE_B64}/poster?tx=c_limit%2Cw_700&_s=vp`,
    );
    expect(posterUrl(target('sea_turtle', 'upload', cname), { tx: 'c_limit,w_700', ...vp })).toBe(
      'https://media.example.com/_applet_/video_service/elements/upload/c2VhX3R1cnRsZQ==/poster?tx=c_limit%2Cw_700&_s=vp',
    );
  });

  it('builds the poster URL without a query (source.json poster-saved)', () => {
    expect(posterUrl(target(), {})).toBe(`${SERVICE}/elements/upload/c2VhX3R1cnRsZQ==/poster`);
  });

  it('encodes `tx` also without `_s` (v4 sent it raw then: an intentional change, same 302 from the service)', () => {
    expect(posterUrl(target(), { tx: 'c_scale,w_400' })).toBe(`${SERVICE}/elements/upload/c2VhX3R1cnRsZQ==/poster?tx=c_scale%2Cw_400`);
  });

  it('builds the chapters URL', () => {
    expect(chaptersUrl(target(), vp)).toBe(`${SERVICE}/chapters/upload/c2VhX3R1cnRsZQ==.vtt?_s=vp`);
    expect(chaptersUrl(target(UNICODE_ID, 'private'), vp)).toBe(`${SERVICE}/chapters/private/${UNICODE_B64}.vtt?_s=vp`);
    expect(chaptersUrl(target('sea_turtle', 'upload', cname), vp)).toBe(
      'https://media.example.com/_applet_/video_service/chapters/upload/c2VhX3R1cnRsZQ==.vtt?_s=vp',
    );
  });

  it('builds the transcript URL, with the language before the public ID', () => {
    expect(transcriptUrl(target(), undefined, vp)).toBe(`${SERVICE}/transcription/upload/c2VhX3R1cnRsZQ==.transcript?_s=vp`);
    expect(transcriptUrl(target(), 'fr', vp)).toBe(`${SERVICE}/transcription/upload/fr/c2VhX3R1cnRsZQ==.transcript?_s=vp`);
  });

  it('builds the asset configuration URL under `video/`, keeping an extension in the public ID (as v4)', () => {
    expect(assetConfigUrl(target(), vp)).toBe(`${SERVICE}/video_player_config/video/upload/c2VhX3R1cnRsZQ==.json?_s=vp`);
    expect(assetConfigUrl(target('clip.mp4', 'authenticated'), {})).toBe(`${SERVICE}/video_player_config/video/authenticated/Y2xpcC5tcDQ=.json`);
  });

  it('builds the metadata URL with the source query parameters', () => {
    expect(metadataUrl(target(), { ...vp, foo: 'a b&c' })).toBe(`${SERVICE}/video_metadata/upload/c2VhX3R1cnRsZQ==.json?_s=vp&foo=a+b%26c`);
  });

  it('builds the profile URL: `null` for a built-in profile, a raw URL as is, else a named profile with spaces as `+`', () => {
    expect(profileUrl(cloud, 'cld-looping', vp)).toBeNull();
    expect(profileUrl(cloud, 'https://example.com/p.json', vp)).toBe('https://example.com/p.json');
    expect(profileUrl(cloud, 'My Profile', vp)).toBe(`${SERVICE}/video_player_profiles/My+Profile.json?_s=vp`);
    expect(profileUrl(cloud, 'My Profile', {})).toBe(`${SERVICE}/video_player_profiles/My+Profile.json`);
  });
});

describe('configUrl (v4 fetchConfig precedence)', () => {
  const request = (fields: Partial<ConfigRequest>): ConfigRequest => ({ cloud, allowUsageReport: true, ...fields });

  it('uses the profile over the asset configuration, also with `videoConfig: false`', () => {
    expect(configUrl(request({ profile: 'My Profile', publicId: 'sea_turtle', videoConfig: false }))).toBe(
      `${SERVICE}/video_player_profiles/My+Profile.json?_s=vp`,
    );
  });

  it('makes no request for a built-in profile, and does not fall back to the asset configuration', () => {
    expect(configUrl(request({ profile: 'cld-default', publicId: 'sea_turtle' }))).toBeNull();
  });

  it('uses the asset configuration with the `upload` type by default', () => {
    expect(configUrl(request({ publicId: 'sea_turtle' }))).toBe(`${SERVICE}/video_player_config/video/upload/c2VhX3R1cnRsZQ==.json?_s=vp`);
  });

  it('makes no request without a profile and a public ID, or with `videoConfig: false`', () => {
    expect(configUrl(request({}))).toBeNull();
    expect(configUrl(request({ publicId: 'sea_turtle', videoConfig: false }))).toBeNull();
  });
});

interface ConfigCase {
  readonly id: string;
  readonly input: { readonly options: Readonly<Record<string, unknown>> };
  readonly output: { readonly requests: readonly string[] };
}

describe('url-parity: config.json', () => {
  const { cases } = readJson<{ cases: readonly ConfigCase[] }>('url-parity/config.json');

  it.each(cases.map((testCase) => [testCase.id, testCase] as const))('%s', async (_id, { input, output }) => {
    const options = input.options as {
      readonly profile?: string;
      readonly publicId?: string;
      readonly type?: string;
      readonly videoConfig?: boolean;
      readonly allowUsageReport?: boolean;
    };
    const { profile, publicId, type, videoConfig, allowUsageReport = true } = options;
    // The recording environment answered every request with 404.
    const request = answering(404, {});
    await fetchConfig(
      { cloud: resolveCloudConfig(input.options as Parameters<typeof resolveCloudConfig>[0]), profile, publicId, type, videoConfig, allowUsageReport },
      { fetch: request },
    );
    expect(request.mock.calls.map(([url]) => url)).toEqual(output.requests);
  });
});

describe('fetchConfig', () => {
  const request: ConfigRequest = { cloud, publicId: 'sea_turtle', allowUsageReport: true };

  it('resolves the recorded asset configuration, without credentials or the version header', async () => {
    const fixture = recorded('asset-config');
    const fetchMock = fromRecording(fixture);
    const signal = new AbortController().signal;
    expect(await fetchConfig(request, { fetch: fetchMock, signal })).toEqual(fixture.body);
    expect(fetchMock).toHaveBeenCalledWith(fixture.request, { headers: {}, signal, credentials: 'omit' });
  });

  it('sends credentials with `withCredentials`', async () => {
    const fetchMock = fromRecording(recorded('asset-config'));
    await fetchConfig(request, { fetch: fetchMock, withCredentials: true });
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ credentials: 'include' });
  });

  it('resolves the bundled configuration of a built-in profile without a request', async () => {
    const fetchMock = answering(200, {});
    expect(await fetchConfig({ ...request, profile: 'cld-looping' }, { fetch: fetchMock })).toBe(builtInProfile('cld-looping'));
    expect(builtInProfile('cld-looping')?.playerOptions).toMatchObject({ loop: true, autoplay: true, muted: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('resolves `{}` without a request when there is nothing to fetch', async () => {
    const fetchMock = answering(200, {});
    expect(await fetchConfig({ cloud, allowUsageReport: true }, { fetch: fetchMock })).toEqual({});
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(['asset-config-unknown-asset', 'profile-not-found'])('resolves `{}` and reports the recorded failure %s', async (name) => {
    const fixture = recorded(name);
    const onError = vi.fn();
    const profile = name === 'profile-not-found' ? 'My Profile' : undefined;
    const publicId = name === 'profile-not-found' ? 'sea_turtle' : 'no_such_asset_xyz';
    const fetchMock = fromRecording(fixture);
    expect(await fetchConfig({ ...request, profile, publicId }, { fetch: fetchMock, onError })).toEqual({});
    expect(fetchMock.mock.calls[0][0]).toBe(fixture.request);
    expect(onError).toHaveBeenCalledOnce();
    expect(onError.mock.calls[0][0]).toContain('HTTP 404');
  });

  it.each([
    ['invalid JSON', answering(200, 'not json')],
    ['a JSON array', answering(200, [])],
    ['a network error', vi.fn<typeof fetch>(async () => Promise.reject(new TypeError('Failed to fetch')))],
  ])('resolves `{}` on %s, and never rejects', async (_name, fetchMock) => {
    expect(await fetchConfig(request, { fetch: fetchMock })).toEqual({});
  });

  it('resolves `{}` without a debug message when the signal aborts', async () => {
    const controller = new AbortController();
    const onError = vi.fn();
    const fetchMock = vi.fn<typeof fetch>(async () => {
      controller.abort();
      return new Response('{"playerOptions":{"loop":true}}');
    });
    expect(await fetchConfig(request, { fetch: fetchMock, signal: controller.signal, onError })).toEqual({});
    expect(onError).not.toHaveBeenCalled();
  });
});

describe('fetchMetadata', () => {
  const url = metadataUrl(target(), vp);

  it('sends the `X-Cld-Video-Player-Version` header, the signal and the credentials', async () => {
    // Synthetic body: the demo cloud answered 404 for every metadata request (see metadata-not-found.json).
    const fetchMock = answering(200, { title: 'Sea turtle', description: 'Swimming' });
    const signal = new AbortController().signal;
    expect(await fetchMetadata(url, { version: '5.0.0', fetch: fetchMock, signal, withCredentials: true })).toEqual({
      title: 'Sea turtle',
      description: 'Swimming',
    });
    expect(fetchMock).toHaveBeenCalledWith(url, { headers: { 'X-Cld-Video-Player-Version': '5.0.0' }, signal, credentials: 'include' });
  });

  it('resolves `null` and reports the recorded 404', async () => {
    const fixture = recorded('metadata-not-found');
    const onError = vi.fn();
    expect(await fetchMetadata(fixture.request, { version: '5.0.0', fetch: fromRecording(fixture), onError })).toBeNull();
    expect(onError).toHaveBeenCalledOnce();
  });

  it('resolves `null` on a JSON value that is not an object', async () => {
    expect(await fetchMetadata(url, { version: '5.0.0', fetch: answering(200, 'null') })).toBeNull();
  });
});

describe('fetchTranscript', () => {
  it('is the one transcript fetch of src/core/tracks/transcript.ts', () => {
    expect(fetchTranscript).toBe(transcriptFetch);
  });
});
