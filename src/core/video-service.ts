/**
 * The one client of the Cloudinary video service (`{prefix}/_applet_/video_service/…`), D-08.
 * URL shapes, query parameters and encodings follow v4 byte for byte (`contracts/video-service.md`).
 */
import { defaultProfiles } from 'cloudinary-video-player-profiles';
import type { CloudConfig } from './options/types.js';
import { deliveryPrefix } from './url/cloud.js';
import { utf8ToBase64 } from './utf8-base64.js';

export { fetchTranscript } from './tracks/transcript.js';

/** The asset a video-service resource belongs to. */
export interface AssetTarget {
  readonly cloud: CloudConfig;
  readonly publicId: string;
  /** Delivery type (`upload`, `private`, …). */
  readonly type: string;
  readonly resourceType: string;
}

/** Query parameters, in the order they appear in the URL. */
export type QueryParams = Readonly<Record<string, string>>;

/** `{ _s: 'vp' }` (the usage marker) when `allowUsageReport` is on, else no parameter. */
export function usageQuery(allowUsageReport: boolean): QueryParams {
  return allowUsageReport ? { _s: 'vp' } : {};
}

const servicePrefix = (cloud: CloudConfig): string => `${deliveryPrefix(cloud)}/_applet_/video_service`;

// `{prefix}/{resource}/{type}/{lang/}{base64 public ID}` (v4 `utf8ToBase64`: standard alphabet, not URL-safe).
const assetPath = (resource: string, { cloud, type, publicId }: AssetTarget, language?: string): string =>
  `${servicePrefix(cloud)}/${resource}/${type}/${language ? `${language}/` : ''}${utf8ToBase64(publicId)}`;

const withQuery = (url: string, query: QueryParams): string => {
  const search = new URLSearchParams(query).toString();
  return search ? `${url}?${search}` : url;
};

/** The saved poster, or the default still. `tx` (a transformation string) travels in `query` when set. */
export function posterUrl(target: AssetTarget, query: QueryParams): string {
  return withQuery(`${assetPath('elements', target)}/poster`, query);
}

/** The auto-generated chapters (VTT). */
export function chaptersUrl(target: AssetTarget, query: QueryParams): string {
  return withQuery(`${assetPath('chapters', target)}.vtt`, query);
}

/** The auto-generated transcript, in `language` when set. */
export function transcriptUrl(target: AssetTarget, language: string | undefined, query: QueryParams): string {
  return withQuery(`${assetPath('transcription', target, language)}.transcript`, query);
}

/** The configuration saved for the asset (`{ playerOptions, sourceOptions }`). Always under `video/`, as v4. */
export function assetConfigUrl(target: AssetTarget, query: QueryParams): string {
  return withQuery(`${assetPath('video_player_config/video', target)}.json`, query);
}

/** The asset's metadata (`{ title, description, … }`). */
export function metadataUrl(target: AssetTarget, query: QueryParams): string {
  return withQuery(`${assetPath('video_metadata', target)}.json`, query);
}

const RAW_URL = /^https?:\/\//i;

/** The saved configuration of a built-in profile (`cld-default`, …), bundled, or `undefined`. */
export function builtInProfile(name: string): ServiceConfig | undefined {
  return defaultProfiles.find((profile) => profile.name === name)?.config;
}

/** A profile URL: `null` for a built-in profile (no request), a raw URL as is, else a named profile. */
export function profileUrl(cloud: CloudConfig, profile: string, query: QueryParams): string | null {
  if (builtInProfile(profile)) return null;
  if (RAW_URL.test(profile)) return profile;
  return withQuery(`${servicePrefix(cloud)}/video_player_profiles/${profile.replaceAll(' ', '+')}.json`, query);
}

/** A saved configuration, from a profile or an asset. */
export interface ServiceConfig {
  readonly playerOptions?: Readonly<Record<string, unknown>>;
  readonly sourceOptions?: Readonly<Record<string, unknown>>;
}

/** The asset's metadata, as the video service sends it. */
export interface VideoMetadata {
  readonly title?: string;
  readonly description?: string;
  readonly [key: string]: unknown;
}

/** Options of every video-service fetch. */
export interface ServiceFetchOptions {
  /** Stops the request (source change, dispose). */
  readonly signal?: AbortSignal;
  /** Sends credentials (`credentials: 'include'`), for private assets. */
  readonly withCredentials?: boolean;
  /** For tests. @default globalThis.fetch */
  readonly fetch?: typeof fetch;
  /** Gets a debug message when the request fails (not when `signal` aborts it). v4 was silent. */
  readonly onError?: (message: string) => void;
}

// A JSON object (JSON.parse makes no other prototypes, so no prototype check is needed).
const isJsonObject = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

// GET `url` and parse its JSON. Resolves `undefined`, and never rejects, when the request fails or `signal` aborts.
async function fetchJson(url: string, headers: Readonly<Record<string, string>>, options: ServiceFetchOptions): Promise<unknown> {
  const { signal, withCredentials = false, fetch: request = globalThis.fetch, onError } = options;
  try {
    const response = await request(url, { headers, signal, credentials: withCredentials ? 'include' : 'omit' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data: unknown = await response.json();
    signal?.throwIfAborted();
    return data;
  } catch (error) {
    if (!signal?.aborted) onError?.(`Video service request failed (${url}): ${error instanceof Error ? error.message : String(error)}`);
    return undefined;
  }
}

/** What decides the configuration request (v4 `fetchConfig`). */
export interface ConfigRequest {
  readonly cloud: CloudConfig;
  readonly profile?: string;
  readonly publicId?: string;
  /** Delivery type. @default 'upload' */
  readonly type?: string;
  readonly videoConfig?: boolean;
  readonly allowUsageReport: boolean;
}

/**
 * The configuration URL, or `null` for no request. A profile wins (also over `videoConfig: false`);
 * without one, the asset configuration when a public ID is set and `videoConfig` is not `false`.
 */
export function configUrl({ cloud, profile, publicId, type = 'upload', videoConfig, allowUsageReport }: ConfigRequest): string | null {
  const query = usageQuery(allowUsageReport);
  if (profile) return profileUrl(cloud, profile, query);
  if (!publicId || videoConfig === false) return null;
  return assetConfigUrl({ cloud, publicId, type, resourceType: 'video' }, query);
}

/**
 * The saved configuration: the bundled one of a built-in profile (no request), else the fetched one.
 * `{}` when there is none, the request fails or `signal` aborts; never rejects.
 */
export async function fetchConfig(request: ConfigRequest, options: ServiceFetchOptions = {}): Promise<ServiceConfig> {
  const builtIn = request.profile && builtInProfile(request.profile);
  if (builtIn) return builtIn;
  const url = configUrl(request);
  if (url === null) return {};
  const data = await fetchJson(url, {}, options);
  return isJsonObject(data) ? data : {};
}

/** Options of `fetchMetadata`. */
export interface FetchMetadataOptions extends ServiceFetchOptions {
  /** The player version, sent in the `X-Cld-Video-Player-Version` header (as v4; only this request sends it). */
  readonly version: string;
}

/** The asset's metadata from `metadataUrl()`. `null` when the request fails or `signal` aborts; never rejects. */
export async function fetchMetadata(url: string, { version, ...options }: FetchMetadataOptions): Promise<VideoMetadata | null> {
  const data = await fetchJson(url, { 'X-Cld-Video-Player-Version': version }, options);
  return isJsonObject(data) ? data : null;
}
