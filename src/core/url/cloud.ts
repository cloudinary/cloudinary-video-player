import type { CloudConfig } from '../options/types.js';

const SHARED_CDN = 'res.cloudinary.com';
/** An old shared host that v4 (url-gen) still mapped to the shared CDN. */
const OLD_AKAMAI_SHARED_CDN = 'cloudinary-a.akamaihd.net';

/**
 * The delivery prefix of every Cloudinary URL: protocol, host and, on a shared host, `/<cloudName>`.
 * The v4 rule (url-gen `unsigned_url_prefix`): `secureDistribution` wins when `secure`, `cname` only
 * over `http`, and a private CDN puts the cloud name in the host. `cdnSubdomain` and
 * `secureCdnSubdomain` had no effect in v4 and have none here.
 */
export function deliveryPrefix(cloud: CloudConfig): string {
  const { cloudName = '', privateCdn = false, secure, cname } = cloud;
  // A cloud name that starts with `/` is a local path (url-gen development mode).
  if (cloudName.startsWith('/')) return `/res${cloudName}`;
  let host: string;
  const sharedDomain = !privateCdn;
  if (secure) {
    const distribution = cloud.secureDistribution;
    const custom = distribution !== undefined && distribution !== OLD_AKAMAI_SHARED_CDN;
    host = custom ? distribution : privateCdn ? `${cloudName}-res.cloudinary.com` : SHARED_CDN;
  } else if (cname) {
    host = cname;
  } else {
    host = privateCdn ? `${cloudName}-res.cloudinary.com` : SHARED_CDN;
  }
  const prefix = `${secure ? 'https' : 'http'}://${host}`;
  return sharedDomain ? `${prefix}/${cloudName}` : prefix;
}

/** Settings that change the `<resource type>/<type>` part of a delivery URL. */
export interface PathOptions {
  readonly urlSuffix?: string;
  readonly useRootPath?: boolean;
  readonly shorten?: boolean;
}

/** The short forms an SEO suffix needs (url-gen `finalize_resource_type`). */
const SUFFIX_PATHS: Readonly<Record<string, string>> = {
  'image/upload': 'images',
  'image/private': 'private_images',
  'image/authenticated': 'authenticated_images',
  'raw/upload': 'files',
  'video/upload': 'videos',
};

/**
 * The `<resource type>/<type>` part of a delivery URL, with the v4 rules: a suffix needs a short form
 * (`videos`, `images`, …), the root path is for image uploads only (`''`), `shorten` turns an image
 * upload into `iu`. Throws, as v4, for a combination that Cloudinary does not deliver.
 */
export function deliveryPath(resourceType: string, type: string, { urlSuffix, useRootPath, shorten }: PathOptions): string {
  let path = `${resourceType}/${type}`;
  if (urlSuffix) {
    const short = SUFFIX_PATHS[path];
    if (!short) {
      throw new Error('URL Suffix only supported for image/upload, image/private, image/authenticated, video/upload and raw/upload');
    }
    path = short;
  }
  if (useRootPath) {
    if (path !== 'image/upload' && path !== 'images') throw new Error('Root path only supported for image/upload');
    return '';
  }
  return shorten && path === 'image/upload' ? 'iu' : path;
}
