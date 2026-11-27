/**
 * SRT → cues (replaces the v4 dependency `srt-parser-2`).
 * Lenient like v4: index lines may be missing, milliseconds may use `,` or `.`, and blank lines may be
 * missing or extra. Inline tags (`<i>`, `<font …>`) are removed, so the text stays plain text.
 */
import { parseTiming, toLines, toPlainText, type Cue } from './vtt.js';

/** Parses an SRT file. A cue's text runs from its timing line to the next cue's index or timing line. */
export function parseSrt(source: string): Cue[] {
  const lines = toLines(source);
  const cues: Array<{ start: number; end: number; lines: string[] }> = [];
  lines.forEach((line, index) => {
    const timing = parseTiming(line);
    if (timing) {
      cues.push({ start: timing[0], end: timing[1], lines: [] });
      return;
    }
    // A number right before a timing line is the next cue's index, not text.
    const isIndex = /^\s*\d+\s*$/.test(line) && parseTiming(lines[index + 1] ?? '') !== null;
    if (!isIndex) cues.at(-1)?.lines.push(line);
  });
  return cues.map(({ start, end, lines: text }) => ({ start, end, text: toPlainText(text) }));
}
