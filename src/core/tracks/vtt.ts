/**
 * WebVTT helpers: parse a WebVTT file into cues, and write cues as a WebVTT file
 * (SRT and transcripts become a track this way). Text is plain text, never markup.
 */

/** One timed text cue. */
export interface Cue {
  /** Start time, in seconds. */
  readonly start: number;
  /** End time, in seconds. */
  readonly end: number;
  /** Plain text, never markup. Lines are separated by `\n`. */
  readonly text: string;
  /** Range `[from, to)` of `text` to highlight (the current word with word highlight). `toVtt` wraps it in `<b>`. */
  readonly highlight?: readonly [from: number, to: number];
}

const TIMESTAMP = String.raw`(?:\d+:)?\d{1,2}:\d{1,2}(?:[.,]\d+)?`;
const TIMING = new RegExp(String.raw`^\s*(${TIMESTAMP})\s*-->\s*(${TIMESTAMP})(?:\s|$)`);
// A tag starts with a letter or `/`, or is a WebVTT timestamp tag, so a lone `<` (`I <3 you`) stays text.
const TAG = /<\/?[a-z][^<>]*>|<\d[\d:.]*>/gi;
const ENTITIES: Readonly<Record<string, string>> = { amp: '&', lt: '<', gt: '>', nbsp: ' ', lrm: '‎', rlm: '‏' };
const ENTITY = /&(amp|lt|gt|nbsp|lrm|rlm);/g;

// `hh:mm:ss.ttt`, `mm:ss.ttt` or SRT `hh:mm:ss,ttt` → seconds.
const toSeconds = (timestamp: string): number =>
  timestamp.replace(',', '.').split(':').reduce((seconds, part) => seconds * 60 + Number(part), 0);

/** `[start, end]` in seconds when `line` is a cue timing line (cue settings after it are ignored), else `null`. */
export function parseTiming(line: string): [start: number, end: number] | null {
  const match = TIMING.exec(line);
  return match ? [toSeconds(match[1]), toSeconds(match[2])] : null;
}

/** The lines of a text file, without a byte order mark; CRLF and CR count as line breaks. */
export function toLines(source: string): string[] {
  return source.replace(/^﻿/, '').split(/\r\n?|\n/);
}

/** Cue text lines → plain text: tags removed, character references decoded, empty lines dropped. */
export function toPlainText(lines: readonly string[]): string {
  return lines
    .map((line) => line.replace(TAG, '').replace(ENTITY, (_, name: string) => ENTITIES[name]).trim())
    .filter(Boolean)
    .join('\n');
}

/** Parses a WebVTT file. Cue identifiers, cue settings and NOTE, STYLE and REGION blocks are skipped. */
export function parseVtt(source: string): Cue[] {
  const cues: Cue[] = [];
  let cue: { start: number; end: number; lines: string[] } | null = null;
  const close = (): void => {
    if (cue) cues.push({ start: cue.start, end: cue.end, text: toPlainText(cue.lines) });
    cue = null;
  };
  for (const line of toLines(source)) {
    const timing = parseTiming(line);
    if (timing) {
      // A timing line also ends the cue before it, as in the WebVTT parser.
      close();
      cue = { start: timing[0], end: timing[1], lines: [] };
    } else if (!line.trim()) {
      close();
    } else {
      cue?.lines.push(line);
    }
  }
  close();
  return cues;
}

const escapeText = (text: string): string => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Whole milliseconds, so 59.9996 s gives `00:01:00.000`, not `00:00:60.000`. WebVTT has no negative times.
function formatTimestamp(seconds: number): string {
  const ms = Math.max(0, Math.round(seconds * 1000));
  const pad = (value: number, length = 2): string => String(value).padStart(length, '0');
  return `${pad(Math.floor(ms / 3_600_000))}:${pad(Math.floor(ms / 60_000) % 60)}:${pad(Math.floor(ms / 1000) % 60)}.${pad(ms % 1000, 3)}`;
}

function cueBody({ text, highlight }: Cue): string {
  const body = highlight
    ? `${escapeText(text.slice(0, highlight[0]))}<b>${escapeText(text.slice(...highlight))}</b>${escapeText(text.slice(highlight[1]))}`
    : escapeText(text);
  // A blank line would end the cue early.
  return body
    .split('\n')
    .filter((line) => line.trim())
    .join('\n');
}

/** Writes cues as a WebVTT file. Text is escaped; cues that end at or before 0 are dropped. */
export function toVtt(cues: readonly Cue[]): string {
  const blocks = cues
    .filter((cue) => cue.end > 0)
    .map((cue) => `${formatTimestamp(cue.start)} --> ${formatTimestamp(cue.end)}\n${cueBody(cue)}`);
  return `${['WEBVTT', ...blocks].join('\n\n')}\n`;
}
