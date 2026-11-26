import type { PlayerOptions } from './types.js';

/**
 * Options from element attributes (FR-036, contracts/element.md). Input is name/value pairs and the
 * class string, not an element, so the core has no DOM dependency.
 */

/** Option keys whose type includes `string`: a numeric attribute value stays a string for them. */
type StringOptionKey = {
  [K in keyof PlayerOptions]-?: string extends NonNullable<PlayerOptions[K]> ? K : never;
}[keyof PlayerOptions];

/** `tsc` fails when a string-typed option is missing here (a public ID like "12345" must stay a string). */
const STRING_OPTIONS: Readonly<Record<StringOptionKey, true>> = {
  cloudName: true,
  cloud_name: true,
  secureDistribution: true,
  secure_distribution: true,
  cname: true,
  urlSuffix: true,
  url_suffix: true,
  publicId: true,
  type: true,
  resourceType: true,
  transformation: true,
  rawTransformation: true,
  aspectRatio: true,
  cropPadColor: true,
  poster: true,
  chapters: true,
  title: true,
  description: true,
  fontFace: true,
  logoImageUrl: true,
  logoOnclickUrl: true,
  profile: true,
};

const PREFIX = 'data-cld-';
const NATIVE = new Set(['autoplay', 'muted', 'loop', 'controls', 'playsinline', 'preload', 'poster']);
const FLUID_CLASSES = ['cld-fluid', 'vjs-fluid'];
const DECIMAL = /^-?\d+(\.\d+)?$/;

/** `public-id` → `publicId` (also `cloud_name` → `cloudName`, as v4). */
export const toOptionName = (attribute: string): string =>
  attribute.replace(/[-_]+([a-z0-9])/g, (_, letter: string) => letter.toUpperCase());

/**
 * One attribute value as an option value: `""` and `"true"` → `true`, `"false"` → `false`, a decimal
 * number → number (not for string options), `{…}`/`[…]` → JSON (throws on invalid JSON), else the string.
 */
export function parseAttributeValue(option: string, value: string): unknown {
  if (value === '' || value === 'true') return true;
  if (value === 'false') return false;
  if (DECIMAL.test(value) && !(option in STRING_OPTIONS)) return Number(value);
  if (value.startsWith('{') || value.startsWith('[')) return JSON.parse(value);
  return value;
}

export interface ParsedAttributes {
  options: Record<string, unknown>;
  /** Debug messages: attributes skipped for invalid JSON. */
  errors: string[];
}

/**
 * Options from a `<video>` element: `data-cld-*` attributes, the native media attributes, and the
 * `cld-fluid`/`vjs-fluid` class. Other attributes (`id`, `class`, `style`, …) are not options.
 */
export function parseAttributes(
  attributes: Iterable<{ readonly name: string; readonly value: string }>,
  className = '',
): ParsedAttributes {
  const options: Record<string, unknown> = {};
  const errors: string[] = [];
  for (const { name, value } of attributes) {
    const isCld = name.startsWith(PREFIX);
    if (!isCld && !NATIVE.has(name)) continue;
    const option = isCld ? toOptionName(name.slice(PREFIX.length)) : name;
    try {
      options[option] = parseAttributeValue(option, value);
    } catch {
      errors.push(`Attribute "${name}" is skipped: its value is not valid JSON.`);
    }
  }
  if (className.split(/\s+/).some((name) => FLUID_CLASSES.includes(name))) options.fluid = true;
  return { options, errors };
}
