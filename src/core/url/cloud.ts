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
