import type { CloudConfig } from '../options/types.js';
import type { QueryParams } from '../video-service.js';
import { deliveryPath, deliveryPrefix } from './cloud.js';

/** A Cloudinary asset: where it is delivered from and how. */
export interface MediaAsset {
  readonly cloud: CloudConfig;
  readonly publicId: string;
  /** `video`, `image` or `raw`. */
  readonly resourceType: string;
  /** Delivery type: `upload`, `private`, `authenticated`, `live`, … */
  readonly type: string;
}

/** The parts of a delivery URL after the asset. */
export interface MediaUrlOptions {
  /** The transformation part (see `transformationString`); `''` for none. */
  readonly transformation?: string;
  /** File extension, for example `m3u8` or `jpg`. */
  readonly format?: string;
  /** SEO suffix after the public ID. */
  readonly urlSuffix?: string;
  readonly query?: QueryParams;
}

const RAW_URL = /^https?:\/\//i;

/** True for an absolute http(s) URL: a raw media URL, not a public ID (data-model §3). */
export function isRawUrl(value: string): boolean {
  return RAW_URL.test(value);
}

/** Query parameters as URL strings; `null` and `undefined` values are left out (v4). */
export function queryParamsOf(params: Readonly<Record<string, unknown>> | undefined): QueryParams {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(params ?? {})) if (value != null) result[key] = String(value);
  return result;
}

/** `url` with `query` appended, as v4 `appendQueryParams` (the URL is re-serialized only when there is a query). */
export function withQuery(url: string, query: QueryParams | undefined): string {
  if (!query || Object.keys(query).length === 0) return url;
  const result = new URL(url);
  for (const [key, value] of Object.entries(query)) result.searchParams.append(key, value);
  return result.href;
}

// Collapses empty path segments, as url-gen did (`a//b` → `a/b`, but not `https://`).
const collapseSlashes = (value: string): string => value.replace(/([^:])\/\//g, '$1/');

// A public ID in the URL path: decoded once, then encoded with `:` and `/` kept (url-gen `finalize_source`).
const encodePublicId = (publicId: string): string => {
  let decoded = publicId;
  try {
    decoded = decodeURIComponent(publicId);
  } catch {
    // Not percent-encoded: encode it as it is.
  }
  return encodeURIComponent(decoded).replaceAll('%3A', ':').replaceAll('%2F', '/');
};

/**
 * A delivery URL as v4 built it (url-gen `createCloudinaryLegacyURL`, unsigned):
 * `{prefix}/{resource type}/{type}/{transformation}/{version}/{public ID}{/suffix}{.format}?{query}`.
 * `v1` is added to a public ID in a folder that has no version.
 */
export function mediaUrl(asset: MediaAsset, options: MediaUrlOptions = {}): string {
  const { cloud, resourceType, type } = asset;
  const { transformation = '', format, urlSuffix, query } = options;
  if (urlSuffix && /[./]/.test(urlSuffix)) throw new Error('url_suffix should not include . or /');
  const publicId = collapseSlashes(asset.publicId);
  const path = deliveryPath(resourceType, type, { urlSuffix, useRootPath: cloud.useRootPath, shorten: cloud.shorten });
  const version = publicId.includes('/') && !/^v\d+/.test(publicId) ? 'v1' : '';
  const file = `${encodePublicId(publicId)}${urlSuffix ? `/${urlSuffix}` : ''}${format ? `.${format}` : ''}`;
  const url = [deliveryPrefix(cloud), path, collapseSlashes(transformation), version, file].filter(Boolean).join('/');
  // url-gen replaced only the first space
  return withQuery(url.replace(' ', '%20'), query);
}
