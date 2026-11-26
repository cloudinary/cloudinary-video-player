/**
 * Cloudinary auto-generated transcripts (video service `transcription/…transcript`): fetch, then turn into cues.
 * Follows v4 `transcriptParser` with the `maxWords`, `timeOffset` and `wordHighlight` options (data-model §6).
 */
import type { Cue } from './vtt.js';

/** A word of a transcript, as the video service sends it. */
export interface TranscriptWord {
  readonly word: string;
  readonly start_time: number;
  readonly end_time: number;
}

/** A segment of a transcript. The transcript file is an array of segments. */
export interface TranscriptSegment {
  readonly transcript: string;
  readonly words?: readonly TranscriptWord[];
  /** Used only when `words` is missing (as v4). */
  readonly start_time?: number;
  readonly end_time?: number;
}

/** A word with its times, in seconds. */
export interface TimedWord {
  readonly text: string;
  readonly start: number;
  readonly end: number;
}

/** A transcript cue. `text` is its words joined by spaces; `words` gives the time of each word. */
export interface TranscriptCue extends Cue {
  readonly words: readonly TimedWord[];
}

/** The `textTracks` options that shape transcript cues. */
export interface TranscriptOptions {
  /** Most words in one cue. Unset or 0: the whole segment. */
  readonly maxWords?: number;
  /** Seconds added to every time. @default 0 */
  readonly timeOffset?: number;
  /** One cue per word with that word highlighted, plus a cue without highlight for each gap between words. */
  readonly wordHighlight?: boolean;
}

// One cue per group of words; with word highlight, one cue per word plus one per gap before the next word.
function wordCues(words: readonly TimedWord[], size: number, wordHighlight: boolean): TranscriptCue[] {
  const cues: TranscriptCue[] = [];
  for (let first = 0; first < words.length; first += size) {
    const group = words.slice(first, first + size);
    const text = group.map((word) => word.text).join(' ');
    if (!wordHighlight) {
      cues.push({ start: group[0].start, end: group[group.length - 1].end, text, words: group });
      continue;
    }
    let from = 0;
    group.forEach((word, index) => {
      const to = from + word.text.length;
      cues.push({ start: word.start, end: word.end, text, words: group, highlight: [from, to] });
      // v4 read `words[index + 1]` with the group index here, which is wrong after the first group.
      const next = words[first + index + 1];
      if (next && word.end < next.start) cues.push({ start: word.end, end: next.start, text, words: group });
      from = to + 1;
    });
  }
  return cues;
}

/** Transcript segments → cues. Unlike v4, `timeOffset` applies to every cue, also without word highlight. */
export function parseTranscript(segments: readonly TranscriptSegment[], options: TranscriptOptions = {}): TranscriptCue[] {
  const { maxWords = 0, timeOffset = 0, wordHighlight = false } = options;
  return segments.flatMap(({ transcript, words, start_time, end_time }) => {
    // `?.`, not a default value: the JSON is not validated and may hold `words: null` (v4 checked `if (words)`).
    if (!words?.length) {
      return start_time === undefined || end_time === undefined
        ? []
        : [{ start: start_time + timeOffset, end: end_time + timeOffset, text: transcript.trim(), words: [] }];
    }
    const timed = words.map((word) => ({ text: word.word, start: word.start_time + timeOffset, end: word.end_time + timeOffset }));
    return wordCues(timed, maxWords >= 1 ? Math.floor(maxWords) : timed.length, wordHighlight);
  });
}

/** Options of `fetchTranscript`. */
export interface FetchTranscriptOptions {
  /** Stops the request and the polling (source change, dispose). */
  readonly signal?: AbortSignal;
  /** Sends credentials (`credentials: 'include'`), for private assets. */
  readonly withCredentials?: boolean;
  /** For tests. @default globalThis.fetch */
  readonly fetch?: typeof fetch;
  /** Milliseconds to wait before each new attempt while the service answers 202 (still generating). @default nine waits of 2000 ms (v4: 10 attempts, 2 s apart) */
  readonly retryDelays?: readonly number[];
  /** For tests. Waits `ms`, or less when `signal` aborts. */
  readonly wait?: (ms: number, signal?: AbortSignal) => Promise<void>;
}

const RETRY_DELAYS: readonly number[] = Array.from({ length: 9 }, () => 2000);

const waitFor = (ms: number, signal?: AbortSignal): Promise<void> =>
  new Promise((resolve) => {
    const done = (): void => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', done);
      resolve();
    };
    const timer = setTimeout(done, signal?.aborted ? 0 : ms);
    signal?.addEventListener('abort', done);
  });

/**
 * Fetches a transcript. While the service answers 202 (still generating), asks again after each of `retryDelays`.
 * Resolves `null`, and never rejects, when the request fails, the transcript is not ready after the last wait,
 * the JSON is not a list of segments, or `signal` aborts.
 */
export async function fetchTranscript(url: string, options: FetchTranscriptOptions = {}): Promise<TranscriptSegment[] | null> {
  const { signal, withCredentials = false, fetch: request = globalThis.fetch, retryDelays = RETRY_DELAYS, wait = waitFor } = options;
  const attempt = (): Promise<Response> => {
    signal?.throwIfAborted();
    return request(url, { signal, credentials: withCredentials ? 'include' : 'omit' });
  };
  try {
    let response = await attempt();
    for (const ms of retryDelays) {
      if (response.status !== 202) break;
      await wait(ms, signal);
      response = await attempt();
    }
    if (response.status === 202 || !response.ok) return null;
    const data: unknown = await response.json();
    signal?.throwIfAborted();
    return Array.isArray(data) ? data : null;
  } catch {
    // Network error, abort or invalid JSON: no transcript.
    return null;
  }
}
