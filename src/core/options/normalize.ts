import { warn } from '../log.js';
import { DEFAULTS } from './defaults.js';
import { OPTION_CHANGES, SECRETS } from './renames.js';
import type { CloudConfig, CloudinaryConfig, InternalOptions, PlayerOptions, SourceOptions } from './types.js';

/** Options as an integrator, an attribute or a saved configuration gives them. */
export type RawOptions = Record<string, unknown>;

/** The camelCase delivery keys; they move from the options into `cloud`. */
type CloudKey = keyof CloudConfig;

/** Options after `normalizeOptions`: defaults applied, aliases converted, delivery keys in `cloud`, frozen. */
export type NormalizedOptions = Readonly<
  Omit<PlayerOptions, keyof CloudinaryConfig | 'cloudinaryConfig'> & InternalOptions & { cloud: CloudConfig }
>;

/** Facts about the page that change defaults; inputs, so the core stays pure. */
export interface Environment {
  /** iOS: `playsinline` defaults to `true` (v4). */
  ios: boolean;
}

const CLOUD_KEYS: Readonly<Record<CloudKey, true>> = {
  cloudName: true,
  secure: true,
  privateCdn: true,
  secureDistribution: true,
  cname: true,
  cdnSubdomain: true,
  secureCdnSubdomain: true,
  useRootPath: true,
  urlSuffix: true,
  shorten: true,
};

const isPlainObject = (value: unknown): value is RawOptions =>
  typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype;

/**
 * One layer of options: secrets dropped with a warning, removed options dropped, aliases converted.
 * Also cleans `cloudinaryConfig` and the v4 `source` object. Never changes the input.
 */
export function cleanOptions(raw: RawOptions): RawOptions {
  const result: RawOptions = {};
  for (const [key, value] of Object.entries(raw)) {
    if (SECRETS.includes(key)) {
      warn(`"${key}" is ignored. Never put secrets in a web page: sign URLs on your server.`);
      continue;
    }
    const change = OPTION_CHANGES[key];
    if (change && !change.to) continue;
    const name = change?.to ?? key;
    const isNested = (name === 'cloudinaryConfig' || name === 'source') && isPlainObject(value);
    result[name] = isNested ? cleanOptions(value) : value;
  }
  return result;
}

/**
 * Delivery settings of `options`: top-level keys and `cloudinaryConfig` (it wins per key), snake_case
 * or camelCase, over `base` (the player's settings for a source override, FR-009). Returns a new object.
 */
export function resolveCloudConfig(options: SourceOptions, base?: CloudConfig): CloudConfig {
  const top = cleanOptions(options as RawOptions);
  const nested = isPlainObject(top.cloudinaryConfig) ? top.cloudinaryConfig : {};
  const cloud: CloudConfig = { secure: true, ...base };
  for (const source of [top, nested]) {
    for (const key of Object.keys(CLOUD_KEYS) as CloudKey[]) {
      if (source[key] !== undefined) Object.assign(cloud, { [key]: source[key] });
    }
  }
  return Object.freeze(cloud);
}

/** A copy of plain objects and arrays, frozen; other values (functions, elements) as they are. */
function freezeCopy<T>(value: T): T {
  if (Array.isArray(value)) return Object.freeze(value.map(freezeCopy)) as T;
  if (!isPlainObject(value)) return value;
  const copy: RawOptions = {};
  for (const [key, item] of Object.entries(value)) copy[key] = freezeCopy(item);
  return Object.freeze(copy) as T;
}

/**
 * The one normalization at entry (FR-006). `layers` are in increasing precedence, for example
 * `[saved.playerOptions, saved.sourceOptions, attributes, options]` (data-model §12, contracts/element.md).
 * Merging is shallow, as in v4; only default objects (`colors`, …) merge one level deep.
 */
export function normalizeOptions(
  layers: ReadonlyArray<RawOptions | undefined>,
  env: Environment = { ios: false },
): NormalizedOptions {
  const given: RawOptions = {};
  for (const layer of layers) if (layer) Object.assign(given, cleanOptions(layer));

  const merged: RawOptions = { ...DEFAULTS, playsinline: env.ios };
  for (const [key, value] of Object.entries(given)) {
    const fallback = merged[key];
    merged[key] = isPlainObject(fallback) && isPlainObject(value) ? { ...fallback, ...value } : value;
  }

  const cloud = resolveCloudConfig(merged);
  for (const key of Object.keys(CLOUD_KEYS)) delete merged[key];
  delete merged.cloudinaryConfig;
  return freezeCopy({ ...merged, cloud }) as NormalizedOptions;
}
