import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchTranscript, parseTranscript, type TranscriptSegment } from '../../../src/core/tracks/transcript.js';
import { parseVtt, toVtt } from '../../../src/core/tracks/vtt.js';

// The video-service shape (leading space in `transcript`, as the service sends it).
const word = (text: string, start: number, end: number) => ({ word: text, start_time: start, end_time: end });
const segments: TranscriptSegment[] = [
  {
    transcript: ' Sea turtles glide through',
    words: [word('Sea', 1, 1.5), word('turtles', 1.5, 2), word('glide', 2.5, 3), word('through', 3, 3.5)],
  },
  { transcript: ' and breathe', words: [word('and', 5, 5.5), word('breathe', 5.5, 6)] },
];

const timesAndText = (cues: ReturnType<typeof parseTranscript>) => cues.map(({ start, end, text }) => [start, end, text]);

describe('parseTranscript', () => {
  it('makes one cue per segment from its words, with the time of each word', () => {
    const cues = parseTranscript(segments);

    expect(timesAndText(cues)).toEqual([
      [1, 3.5, 'Sea turtles glide through'],
      [5, 6, 'and breathe'],
    ]);
    expect(cues[1].words).toEqual([
      { text: 'and', start: 5, end: 5.5 },
      { text: 'breathe', start: 5.5, end: 6 },
    ]);
  });

  it('splits segments into cues of at most `maxWords` words; 0 means the whole segment', () => {
    expect(timesAndText(parseTranscript(segments, { maxWords: 3 }))).toEqual([
      [1, 3, 'Sea turtles glide'],
      [3, 3.5, 'through'],
      [5, 6, 'and breathe'],
    ]);
    expect(parseTranscript(segments, { maxWords: 0 })).toEqual(parseTranscript(segments));
  });

  it('adds `timeOffset` to every time, also without word highlight (v4 skipped it there)', () => {
    const cues = parseTranscript(segments, { maxWords: 2, timeOffset: -1 });

    expect(timesAndText(cues)).toEqual([
      [0, 1, 'Sea turtles'],
      [1.5, 2.5, 'glide through'],
      [4, 5, 'and breathe'],
    ]);
    expect(cues[0].words[1]).toEqual({ text: 'turtles', start: 0.5, end: 1 });
  });

  it('with word highlight: one cue per word with its range highlighted, plus a cue for each gap', () => {
    const cues = parseTranscript([segments[0]], { wordHighlight: true, timeOffset: 10 });

    expect(cues.map(({ start, end, highlight }) => [start, end, highlight])).toEqual([
      [11, 11.5, [0, 3]],
      [11.5, 12, [4, 11]],
      [12, 12.5, undefined],
      [12.5, 13, [12, 17]],
      [13, 13.5, [18, 25]],
    ]);
    expect(new Set(cues.map((cue) => cue.text))).toEqual(new Set(['Sea turtles glide through']));
  });

  it('with word highlight and `maxWords`: fills the gaps of later groups too (v4 used the group index)', () => {
    const transcript = [{ transcript: '', words: [word('a', 0, 1), word('b', 1, 2), word('c', 3, 4), word('d', 5, 6)] }];

    expect(timesAndText(parseTranscript(transcript, { wordHighlight: true, maxWords: 2 }))).toEqual([
      [0, 1, 'a b'],
      [1, 2, 'a b'],
      [2, 3, 'a b'],
      [3, 4, 'c d'],
      [4, 5, 'c d'],
      [5, 6, 'c d'],
    ]);
  });

  it('uses the segment times for a segment without words, and skips it without times', () => {
    const json = '[{ "transcript": " No words", "start_time": 7, "end_time": 8 }, { "transcript": "Null words", "words": null }]';
    const cues = parseTranscript(JSON.parse(json), { timeOffset: 1 });

    expect(cues).toEqual([{ start: 8, end: 9, text: 'No words', words: [] }]);
  });

  it('keeps word text literal through WebVTT, with only the current word in <b>', () => {
    const cues = parseTranscript([{ transcript: '', words: [word('a<b', 0, 1), word('&', 1, 2)] }], { wordHighlight: true });
    const vtt = toVtt(cues);

    expect(vtt).toContain('\n<b>a&lt;b</b> &amp;\n');
    expect(vtt).toContain('\na&lt;b <b>&amp;</b>\n');
    expect(parseVtt(vtt).map((cue) => cue.text)).toEqual(['a<b &', 'a<b &']);
  });
});

describe('fetchTranscript', () => {
  const url = 'https://res.cloudinary.com/demo/_applet_/video_service/transcription/upload/c2Vh.transcript';
  const ok = (body: unknown = segments) => new Response(JSON.stringify(body), { status: 200 });
  const pending = () => new Response(null, { status: 202 });
  const fetchReturning = (...responses: Response[]) => {
    const fetch = vi.fn<typeof globalThis.fetch>();
    responses.forEach((response) => fetch.mockResolvedValueOnce(response));
    return fetch;
  };
  const noWait = () => vi.fn(async (_ms: number, _signal?: AbortSignal) => {});

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the segments, without credentials by default (as v4)', async () => {
    const fetch = fetchReturning(ok());

    await expect(fetchTranscript(url, { fetch })).resolves.toEqual(segments);
    expect(fetch).toHaveBeenCalledWith(url, { signal: undefined, credentials: 'omit' });
  });

  it('sends credentials and the signal with `withCredentials`', async () => {
    const fetch = fetchReturning(ok());
    const { signal } = new AbortController();

    await fetchTranscript(url, { fetch, signal, withCredentials: true });

    expect(fetch).toHaveBeenCalledWith(url, { signal, credentials: 'include' });
  });

  it('asks again after each retry delay while the service answers 202', async () => {
    const fetch = fetchReturning(pending(), pending(), ok());
    const wait = noWait();

    await expect(fetchTranscript(url, { fetch, wait, retryDelays: [100, 200, 300] })).resolves.toEqual(segments);
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(wait.mock.calls.map(([ms]) => ms)).toEqual([100, 200]);
  });

  it('returns null when the transcript is still pending after the last delay', async () => {
    const fetch = fetchReturning(pending(), pending(), pending());

    await expect(fetchTranscript(url, { fetch, wait: noWait(), retryDelays: [100, 200] })).resolves.toBeNull();
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('polls 10 times, 2 s apart, by default (as v4)', async () => {
    vi.useFakeTimers();
    const fetch = vi.fn<typeof globalThis.fetch>(async () => pending());

    const result = fetchTranscript(url, { fetch });
    for (let calls = 1; calls < 10; calls++) {
      await vi.advanceTimersByTimeAsync(1999);
      expect(fetch).toHaveBeenCalledTimes(calls);
      await vi.advanceTimersByTimeAsync(1);
    }

    await expect(result).resolves.toBeNull();
    expect(fetch).toHaveBeenCalledTimes(10);
  });

  it('stops polling when the signal aborts during a wait', async () => {
    const controller = new AbortController();
    const fetch = fetchReturning(pending(), ok());
    const wait = vi.fn(async () => controller.abort());

    await expect(fetchTranscript(url, { fetch, wait, signal: controller.signal })).resolves.toBeNull();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('ends the default wait at once when the signal aborts', async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const fetch = vi.fn<typeof globalThis.fetch>(async () => pending());

    const result = fetchTranscript(url, { fetch, signal: controller.signal });
    await vi.advanceTimersByTimeAsync(0);
    controller.abort();

    await expect(result).resolves.toBeNull();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('does not fetch when the signal has already aborted', async () => {
    const fetch = fetchReturning(ok());

    await expect(fetchTranscript(url, { fetch, signal: AbortSignal.abort() })).resolves.toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('returns null, and never rejects, on an error status, a network error, invalid JSON or a non-list body', async () => {
    const results = await Promise.all([
      fetchTranscript(url, { fetch: fetchReturning(new Response('', { status: 404 })) }),
      fetchTranscript(url, { fetch: vi.fn<typeof globalThis.fetch>().mockRejectedValue(new TypeError('Failed to fetch')) }),
      fetchTranscript(url, { fetch: fetchReturning(new Response('{not json', { status: 200 })) }),
      fetchTranscript(url, { fetch: fetchReturning(ok({ error: 'nope' })) }),
    ]);

    expect(results).toEqual([null, null, null, null]);
  });
});
