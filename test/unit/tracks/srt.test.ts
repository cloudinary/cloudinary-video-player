import { describe, expect, it } from 'vitest';
import { parseSrt } from '../../../src/core/tracks/srt.js';

describe('parseSrt', () => {
  it('parses index, timing and multi-line text into cues in seconds', () => {
    const srt = '1\n00:00:01,000 --> 00:00:02,500\nHello\nworld\n\n2\n01:02:03,040 --> 01:02:04,000\nBye\n';

    expect(parseSrt(srt)).toEqual([
      { start: 1, end: 2.5, text: 'Hello\nworld' },
      { start: 3723.04, end: 3724, text: 'Bye' },
    ]);
  });

  it('reads CRLF and CR line breaks and a byte order mark', () => {
    const cues = [
      { start: 1, end: 2, text: 'One\nline two' },
      { start: 3, end: 4, text: 'Three' },
    ];
    const lf = '1\n00:00:01,000 --> 00:00:02,000\nOne\nline two\n\n2\n00:00:03,000 --> 00:00:04,000\nThree\n';

    expect(parseSrt(`﻿${lf.replace(/\n/g, '\r\n')}`)).toEqual(cues);
    expect(parseSrt(lf.replace(/\n/g, '\r'))).toEqual(cues);
  });

  it('parses cues without index lines', () => {
    expect(parseSrt('00:00:01,000 --> 00:00:02,000\nOne\n\n00:00:03,000 --> 00:00:04,000\nTwo')).toEqual([
      { start: 1, end: 2, text: 'One' },
      { start: 3, end: 4, text: 'Two' },
    ]);
  });

  it('accepts `.` or `,` before the milliseconds, short fractions and one-digit hours (as srt-parser-2)', () => {
    const cues = parseSrt('1\n0:00:28.9 --> 00:00:29,05\nA\n\n2\n00:01:02.123 --> 00:01:03,4\nB');

    expect(cues.map(({ start, end }) => [start, end])).toEqual([
      [28.9, 29.05],
      [62.123, 63.4],
    ]);
  });

  it('ignores extra, missing and whitespace-only blank lines', () => {
    const srt = '\n\n1\n00:00:01,000 --> 00:00:02,000\n\nOne\n \n\n\n2\n00:00:03,000 --> 00:00:04,000\nTwo\n3\n00:00:05,000 --> 00:00:06,000\nThree\n\n\n';

    expect(parseSrt(srt)).toEqual([
      { start: 1, end: 2, text: 'One' },
      { start: 3, end: 4, text: 'Two' },
      { start: 5, end: 6, text: 'Three' },
    ]);
  });

  it('keeps a number as text unless a timing line follows it', () => {
    const srt = '1\n00:00:01,000 --> 00:00:02,000\nThe answer is\n42\n\n2\n00:00:03,000 --> 00:00:04,000\nYes';

    expect(parseSrt(srt).map((cue) => cue.text)).toEqual(['The answer is\n42', 'Yes']);
  });

  it('removes inline tags so the text is plain, and keeps a lone `<`', () => {
    const srt = '1\n00:00:01,000 --> 00:00:02,000\n<i>Hello</i> <font color="#ff0000">red</font>\n<b>a < b</b>\nI <3 you -> me';

    expect(parseSrt(srt)[0].text).toBe('Hello red\na < b\nI <3 you -> me');
  });

  it('skips text before the first timing line and returns no cues for a file without cues', () => {
    expect(parseSrt('garbage\n\n1\n00:00:01,000 --> 00:00:02,000\nOne')).toEqual([{ start: 1, end: 2, text: 'One' }]);
    expect(parseSrt('')).toEqual([]);
    expect(parseSrt('not an srt file')).toEqual([]);
  });
});
