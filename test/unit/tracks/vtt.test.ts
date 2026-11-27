import { describe, expect, it } from 'vitest';
import { parseVtt, toVtt, type Cue } from '../../../src/core/tracks/vtt.js';

describe('parseVtt', () => {
  it('parses `mm:ss.ttt` and `hh:mm:ss.ttt` timings, keeps cue settings and identifiers off the text', () => {
    const vtt = [
      'WEBVTT - with a title',
      'Kind: captions',
      '',
      'intro',
      '00:01.000 --> 00:02.500 align:start line:0',
      'Hello',
      'world',
      '',
      '01:02:03.040 --> 01:02:04.000',
      'Bye',
    ].join('\n');

    expect(parseVtt(vtt)).toEqual([
      { start: 1, end: 2.5, text: 'Hello\nworld' },
      { start: 3723.04, end: 3724, text: 'Bye' },
    ]);
  });

  it('skips NOTE, STYLE and REGION blocks', () => {
    const vtt = [
      'WEBVTT',
      '',
      'STYLE',
      '::cue { color: red }',
      '',
      'REGION',
      'id:fred width:40%',
      '',
      '00:01.000 --> 00:02.000',
      'One',
      '',
      'NOTE a comment',
      'on two lines',
      '',
      '00:03.000 --> 00:04.000',
      'Two',
    ].join('\r\n');

    expect(parseVtt(vtt)).toEqual([
      { start: 1, end: 2, text: 'One' },
      { start: 3, end: 4, text: 'Two' },
    ]);
  });

  it('turns cue markup into plain text: tags removed, character references decoded', () => {
    const vtt = 'WEBVTT\n\n00:01.000 --> 00:02.000\n<v Roger>Hi <c.loud>you</c> <00:01.500>&lt;b&gt; &amp; more</v>';

    expect(parseVtt(vtt)[0].text).toBe('Hi you <b> & more');
  });

  it('starts a new cue at a timing line even without a blank line before it', () => {
    expect(parseVtt('WEBVTT\n\n00:01.000 --> 00:02.000\nOne\n00:03.000 --> 00:04.000\nTwo')).toEqual([
      { start: 1, end: 2, text: 'One' },
      { start: 3, end: 4, text: 'Two' },
    ]);
  });
});

describe('toVtt', () => {
  it('writes the header and `hh:mm:ss.ttt` timings from whole milliseconds', () => {
    const cues: Cue[] = [
      { start: 1, end: 2.5, text: 'Hello\nworld' },
      { start: 59.9996, end: 3723.04, text: 'Bye' },
    ];

    expect(toVtt(cues)).toBe('WEBVTT\n\n00:00:01.000 --> 00:00:02.500\nHello\nworld\n\n00:01:00.000 --> 01:02:03.040\nBye\n');
  });

  it('escapes the text and removes blank lines, so text cannot end a cue or become markup', () => {
    const vtt = toVtt([{ start: 0, end: 1, text: 'a <i>b</i> & c --> d\n\n \nlast' }]);

    expect(vtt).toBe('WEBVTT\n\n00:00:00.000 --> 00:00:01.000\na &lt;i&gt;b&lt;/i&gt; &amp; c --&gt; d\nlast\n');
  });

  it('wraps the highlight range in <b>, and escapes the text around it', () => {
    const vtt = toVtt([{ start: 1, end: 2, text: 'a<b now & then', highlight: [4, 7] }]);

    expect(vtt).toContain('\na&lt;b <b>now</b> &amp; then\n');
  });

  it('starts negative times at 0 and drops cues that end at or before 0', () => {
    const vtt = toVtt([
      { start: -3, end: -1, text: 'gone' },
      { start: -1, end: 0, text: 'gone too' },
      { start: -1, end: 1, text: 'kept' },
    ]);

    expect(vtt).toBe('WEBVTT\n\n00:00:00.000 --> 00:00:01.000\nkept\n');
  });

  it('round-trips plain text through parseVtt', () => {
    const cues: Cue[] = [
      { start: 0.5, end: 1.25, text: 'Tom & Jerry <3\n1 > 0 --> true' },
      { start: 2, end: 3, text: '&amp; stays literal' },
    ];

    expect(parseVtt(toVtt(cues))).toEqual(cues);
  });
});
