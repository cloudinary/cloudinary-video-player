import type { Transformation } from '../options/types.js';

/*
 * A port of the v4 serializer: `generateTransformationString` from `@cloudinary/url-gen/backwards` (R-07).
 * Output must stay byte for byte the same as v4 (test/fixtures/url-parity), v4 quirks included.
 * Keys are snake_case only: v4 ignored camelCase keys inside a transformation.
 * Invalid input that url-gen rejected with an exception (a radius list of 0 or more than 4 values,
 * a layer without a public ID or font) gives a best-effort string here instead.
 */

type Step = Record<string, unknown>;

const OPERATORS: Record<string, string> = {
  '=': 'eq', '!=': 'ne', '<': 'lt', '>': 'gt', '<=': 'lte', '>=': 'gte', '&&': 'and', '||': 'or',
  '*': 'mul', '/': 'div', '+': 'add', '-': 'sub', '^': 'pow',
};

// The order is the url-gen order: it is the order of the regular expression alternatives.
const PREDEFINED_VARS: Record<string, string> = {
  aspect_ratio: 'ar', aspectRatio: 'ar', current_page: 'cp', currentPage: 'cp', duration: 'du', face_count: 'fc',
  faceCount: 'fc', height: 'h', initial_aspect_ratio: 'iar', initial_height: 'ih', initial_width: 'iw',
  initialAspectRatio: 'iar', initialHeight: 'ih', initialWidth: 'iw', initial_duration: 'idu', initialDuration: 'idu',
  page_count: 'pc', page_x: 'px', page_y: 'py', pageCount: 'pc', pageX: 'px', pageY: 'py', tags: 'tags', width: 'w',
};

const OPERATORS_RE = /((\|\||>=|<=|&&|!=|>|=|<|\/|-|\+|\*|\^)(?=[ _]))/g;
// A user variable (`$name`) first, so a predefined name inside it stays.
const VARIABLES_RE = new RegExp(`(\\$_*[^_ ]+)|(${Object.keys(PREDEFINED_VARS).join('|')})`, 'g');
const NUMBER = '(([0-9]*)\\.([0-9]+)|([0-9]+))([%pP])?';
const RANGE_VALUE_RE = new RegExp(`^${NUMBER}$`);
const RANGE_RE = new RegExp(`(${NUMBER})\\.\\.(${NUMBER})`);

// Parameters copied as they are, and parameters that can hold an expression.
const PLAIN_KEYS: Record<string, string> = {
  ac: 'audio_codec', af: 'audio_frequency', br: 'bit_rate', c: 'crop', cs: 'color_space', d: 'default_image',
  dl: 'delay', dn: 'density', f: 'fetch_format', g: 'gravity', p: 'prefix', pg: 'page', sp: 'streaming_profile',
  vs: 'video_sampling',
};
const EXPRESSION_KEYS: Record<string, string> = {
  ar: 'aspect_ratio', ki: 'keyframe_interval', o: 'opacity', q: 'quality', x: 'x', y: 'y', z: 'zoom',
};

const TEXT_STYLE_DEFAULTS: Record<string, string> = {
  font_weight: 'normal', font_style: 'normal', text_decoration: 'none', text_align: '', stroke: 'none',
};

const isObject = (value: unknown): value is Step => typeof value === 'object' && value !== null;

const toArray = (value: unknown): unknown[] => {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
};

const isEmptyValue = (value: unknown): boolean =>
  value == null || value === '' || (Array.isArray(value) && value.length === 0);

/** url-gen `legacyNormalizeExpression`: operators and predefined variables to their URL names, spaces to `_`. */
function normalize(expression: unknown): unknown {
  if (typeof expression !== 'string' || expression.length === 0 || /^!.+!$/.test(expression)) {
    return expression ? String(expression) : expression;
  }
  return expression
    .replace(OPERATORS_RE, (match) => OPERATORS[match] ?? match)
    .replace(VARIABLES_RE, (match) => PREDEFINED_VARS[match] ?? match)
    .replace(/[ _]+/g, '_');
}

/** `10%` → `10p`; anything that is not a number with an optional percent stays as it is. */
function normalizeRange(value: unknown): unknown {
  const match = RANGE_VALUE_RE.exec(String(value));
  return match ? `${match[1]}${match[5] ? 'p' : ''}` : value;
}

/** url-gen `splitRange`, bugs included: a string without `..` is returned as is, so `[0]` is its first character. */
function splitRange(range: unknown): unknown[] | string {
  if (typeof range === 'string' && range) return RANGE_RE.test(range) ? range.split('..') : range;
  if (Array.isArray(range)) return [[range], range[range.length - 1]];
  return [];
}

const isNumberLike = (value: unknown): boolean => value != null && !Number.isNaN(parseFloat(String(value)));

const offset = (value: unknown, range: unknown, index: 0 | 1): unknown =>
  normalizeRange(value || isNumberLike(value) ? value : splitRange(range)[index]);

/** The url-gen browser `base64Encode`: URL-safe characters, padding kept. */
const base64 = (input: unknown): string =>
  btoa(encodeURI(decodeURI(String(input)))).replace(/\+/g, '-').replace(/\//g, '_');

function smartEscape(text: string, unsafe = /([^a-zA-Z0-9_.\-/:]+)/g): string {
  return text.replace(unsafe, (match) =>
    match.split('').map((char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`).join(''));
}

function textStyle(layer: Step): string {
  const keywords: unknown[] = [];
  for (const [key, defaultValue] of Object.entries(TEXT_STYLE_DEFAULTS)) {
    const value = layer[key] || defaultValue;
    if (value !== defaultValue) keywords.push(value);
  }
  for (const [key, value] of Object.entries(layer)) {
    if (key === 'letter_spacing' || key === 'line_spacing') keywords.push(`${key}_${String(value)}`);
    if (key === 'font_hinting') keywords.push(`hinting_${String(value)}`);
    if (key === 'font_antialiasing') keywords.push(`antialias_${String(value)}`);
  }
  // url-gen quirk: without a `font_size` key, the keywords alone give no style.
  if (!Object.hasOwn(layer, 'font_size') && keywords.length > 0) return '';
  return [layer.font_family, layer.font_size, ...keywords].filter(Boolean).join('_');
}

/** A layer text: `,` and `/` escaped twice, `$(variable)` references kept. */
function layerText(text: string): string {
  const source = smartEscape(decodeURIComponent(text), /[,/]/g);
  const variableRe = /\$\([a-zA-Z]\w*\)/g;
  let result = '';
  let start = 0;
  for (let match = variableRe.exec(source); match; match = variableRe.exec(source)) {
    result += smartEscape(source.slice(start, match.index)) + match[0];
    start = match.index + match[0].length;
  }
  return result + encodeURIComponent(source.slice(start));
}

/** An overlay or underlay: a string as it is (`fetch:` URLs in base64), or a layer object. */
function layer(value: unknown): unknown {
  if (!isObject(value)) {
    return typeof value === 'string' && /^fetch:.+/.test(value) ? `fetch:${base64(value.slice(6))}` : value;
  }
  if (value.resource_type === 'fetch' || value.url != null) return `fetch:${base64(value.url)}`;
  let publicId = value.public_id ? String(value.public_id).replace(/\//g, ':') : value.public_id;
  if (publicId && value.format != null) publicId = `${String(publicId)}.${String(value.format)}`;
  let text = value.text;
  let resourceType = value.resource_type || 'image';
  let type: unknown = value.type || 'upload';
  let style: string | null = null;
  if (!text && resourceType !== 'text') {
    if (resourceType === 'subtitles') style = textStyle(value);
  } else {
    resourceType = 'text';
    type = null;
    style = textStyle(value);
    if (typeof text === 'string') text = layerText(text);
  }
  return [resourceType === 'image' ? '' : resourceType, type === 'upload' ? '' : type, style, publicId, text]
    .filter(Boolean).join(':');
}

function customFunction(value: unknown): unknown {
  if (!isObject(value)) return value;
  const source = value.function_type === 'remote' ? base64(value.source).replace(/=+$/, '') : value.source;
  return [value.function_type, source].join(':');
}

function customPreFunction(value: unknown): string | null {
  const result = customFunction(value);
  return typeof result === 'string' ? `pre:${result}` : null;
}

function videoCodec(value: unknown): unknown {
  if (typeof value === 'string') return value;
  if (!isObject(value) || value.constructor !== Object) return null;
  if (!('codec' in value)) return '';
  if (!('profile' in value)) return value.codec;
  return 'level' in value
    ? `${String(value.codec)}:${String(value.profile)}:${String(value.level)}`
    : `${String(value.codec)}:${String(value.profile)}`;
}

function radius(value: unknown): unknown {
  return value ? toArray(value).map(normalize).join(':') : value;
}

function dpr(value: unknown): unknown {
  if (value == null) return value;
  const text = String(value);
  return /^\d+$/.test(text) ? `${text}.0` : normalize(text);
}

function effect(value: unknown): unknown {
  if (Array.isArray(value)) return value.join(':');
  return isObject(value) ? Object.entries(value).map(([key, item]) => `${key}:${String(item)}`) : value;
}

function border(value: unknown): unknown {
  if (isObject(value)) {
    const color = String(value.color ?? 'black').replace(/^#/, 'rgb:');
    return `${String(value.width ?? 2)}px_solid_${color}`;
  }
  // A number alone was an HTML attribute in url-gen.
  return /^\d+$/.test(String(value)) ? undefined : value;
}

/** Child transformations: objects are steps of their own; strings alone are one `t_` parameter. */
function children(value: unknown): { steps: string[]; named: string } {
  const list = toArray(value || []);
  if (!list.some((item) => typeof item === 'object')) return { steps: [], named: list.join('.') };
  const steps = list.map((item) => serialize(isObject(item) ? item : { transformation: item })).filter(Boolean);
  return { steps, named: '' };
}

function serializeStep(options: Step): string {
  const [width, height] = options.size ? String(options.size).split('x') : [options.width, options.height];
  const { steps, named } = children(options.transformation);
  const fps = Array.isArray(options.fps) ? options.fps.join('-') : options.fps;
  const params: [string, unknown][] = [
    ['a', normalize(toArray(options.angle).join('.'))],
    ['b', String(options.background || '').replace(/^#/, 'rgb:')],
    ['bo', border(options.border)],
    ['co', String(options.color || '').replace(/^#/, 'rgb:')],
    ['dpr', normalize(dpr(options.dpr))],
    ['du', normalizeRange(options.duration)],
    ['e', normalize(effect(options.effect))],
    ['eo', offset(options.end_offset, options.offset, 1)],
    ['fl', toArray(options.flags || []).join('.')],
    ['fn', customFunction(options.custom_function) || customPreFunction(options.custom_pre_function)],
    ['fps', fps],
    ['h', normalize(height)],
    ['l', layer(options.overlay)],
    ['r', radius(options.radius)],
    ['so', offset(options.start_offset, options.offset, 0)],
    ['t', named],
    ['u', layer(options.underlay)],
    ['vc', videoCodec(options.video_codec)],
    ['w', normalize(width)],
    ...Object.entries(PLAIN_KEYS).map(([short, key]): [string, unknown] => [short, options[key]]),
    ...Object.entries(EXPRESSION_KEYS).map(([short, key]): [string, unknown] => [short, normalize(options[key])]),
  ];
  const variables = Object.entries(options)
    .filter(([key]) => key.startsWith('$'))
    .map(([key, value]) => `${key}_${String(normalize(value))}`)
    .sort()
    .concat(
      (Array.isArray(options.variables) ? (options.variables as unknown[][]) : [])
        .map(([name, value]) => `${String(name)}_${String(normalize(value))}`),
    );
  const step = [
    options.if ? `if_${String(normalize(options.if))}` : '',
    variables.join(','),
    params.filter(([, value]) => !isEmptyValue(value)).map(([key, value]) => `${key}_${String(value)}`).sort().join(','),
    options.raw_transformation,
  ].filter(Boolean).join(',');
  return [...steps, step].filter(Boolean).join('/');
}

/** url-gen `generateTransformationString`: a string as it is, a list as `/`-joined steps, an object as one or more steps. */
function serialize(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(serialize).filter(Boolean).join('/');
  return isObject(value) ? serializeStep(value) : '';
}

/**
 * The transformation part of a delivery URL, in the v4 (url-gen `backwards`) format: steps joined
 * with `/`, parameters in a step joined with `,`. `''` for an empty transformation.
 *
 * As in v4 (which nested the source transformation as `{ transformation: [...] }`), a string is a
 * named transformation (`'hd'` → `t_hd`), not a raw string; raw strings go in `raw_transformation`.
 * Player parameters join the step of a named transformation when they share the object:
 * `{ transformation: 'hd', fetch_format: 'auto:video' }` → `f_auto:video,t_hd`.
 */
export function transformationString(transformation: Transformation): string {
  return serialize({ transformation });
}
