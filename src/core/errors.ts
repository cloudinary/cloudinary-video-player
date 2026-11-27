/**
 * Cloudinary errors (FR-016): the error-header probe and its mapping, the not-ready watchdog
 * and the live "not started" retry. Pure: `fetch`, timers and media checks are injected,
 * and every timer stops through the returned stop function (FR-005).
 */
import type { PlayerErrorData } from './events.js';

/** Error codes (v4 values). */
export const ERROR_CODE = {
  NO_SUPPORTED_MEDIA: 6,
  CUSTOM: 10,
  UNKNOWN_CUSTOMER: 11,
  RESOURCE_NOT_FOUND: 12,
  PRIVATE_RESOURCE: 13,
  UNAUTHENTICATED: 14,
} as const;

export interface CloudinaryError extends PlayerErrorData {
  /** The same source can work if loaded again (still processing): the error display offers "Try again". */
  readonly retryable?: boolean;
}

/** Timer functions (for example `window`), injected so that the core stays pure. */
export interface Timers {
  setTimeout(callback: () => void, ms: number): unknown;
  clearTimeout(id: unknown): void;
}

/** v4 interval between two checks of a live stream that has not started, in milliseconds. */
export const LIVE_RETRY_INTERVAL = 5000;

export const NOT_READY_ERROR: CloudinaryError = { code: ERROR_CODE.CUSTOM, message: 'Video is not ready please try later' };
export const LIVE_NOT_STARTED_ERROR: CloudinaryError = { code: ERROR_CODE.CUSTOM, message: 'Live Stream not started' };

const CANNOT_PLAY = 'Video cannot be played';
const PROCESSING_MESSAGE = 'Video is being processed. Try again in a moment.';

export interface CloudinaryErrorInput {
  /** The `x-cld-error` response header, `''` when absent. */
  readonly errorHeader: string;
  readonly statusCode: number;
  readonly publicId: string;
  readonly cloudName: string;
}

// v4 messages, kept as they are: they reach integrators in `error` `eventData.message`.
const errorFromHeader = ({ errorHeader, publicId, cloudName }: CloudinaryErrorInput): PlayerErrorData => {
  const header = errorHeader.toLowerCase();
  if (header.startsWith('unknown customer')) {
    return { code: ERROR_CODE.UNKNOWN_CUSTOMER, message: `${CANNOT_PLAY} Unknown cloud-name ${cloudName}` };
  }
  if (header.startsWith('resource not found')) {
    return { code: ERROR_CODE.RESOURCE_NOT_FOUND, message: `${CANNOT_PLAY} Public ID ${publicId} not found` };
  }
  if (header.startsWith('private resource')) {
    return { code: ERROR_CODE.PRIVATE_RESOURCE, message: `${CANNOT_PLAY} Private video` };
  }
  if (header.startsWith('unauthenticated access')) {
    return { code: ERROR_CODE.UNAUTHENTICATED, message: `${CANNOT_PLAY} Requires authentication` };
  }
  return { code: ERROR_CODE.CUSTOM, message: errorHeader ? `${CANNOT_PLAY}- ${errorHeader}` : CANNOT_PLAY };
};

/** Maps a failed media response to a Cloudinary error (v4 `cloudinaryErrorsConverter`, plain text). */
export function mapCloudinaryError(input: CloudinaryErrorInput): CloudinaryError {
  const { code, message } = errorFromHeader(input);
  const { statusCode } = input;
  // 423 Locked: the asset is still being processed. v4 showed an HTML "Try again" link here.
  return statusCode === 423
    ? { code, message: PROCESSING_MESSAGE, statusCode, retryable: true }
    : { code, message, statusCode };
}

export interface ErrorProbeOptions extends Omit<CloudinaryErrorInput, 'errorHeader' | 'statusCode'> {
  readonly fetch: typeof fetch;
  readonly signal?: AbortSignal;
  /** `GET` with a one-byte `Range` instead of `HEAD`. */
  readonly fetchErrorUsingGet?: boolean;
  /** Send cookies with the probe (FR-015). */
  readonly withCredentials?: boolean;
}

/**
 * Requests the media URL again to read Cloudinary's error header after a media error.
 * Never throws: `null` when the URL answers successfully or the request fails.
 */
export async function probeCloudinaryError(url: string, options: ErrorProbeOptions): Promise<CloudinaryError | null> {
  const { fetch, signal, fetchErrorUsingGet, withCredentials, publicId, cloudName } = options;
  // v4 sent cookies only with `withCredentials`: `include` with `Access-Control-Allow-Origin: *` fails CORS.
  const credentials: RequestCredentials = withCredentials ? 'include' : 'omit';
  const init: RequestInit = fetchErrorUsingGet
    ? { method: 'GET', credentials, headers: { Range: 'bytes=0-0' }, signal }
    : { method: 'HEAD', credentials, signal };
  try {
    const response = await fetch(url, init);
    const succeeded = response.status >= 200 && response.status < 399;
    return succeeded
      ? null
      : mapCloudinaryError({ errorHeader: response.headers.get('x-cld-error') ?? '', statusCode: response.status, publicId, cloudName });
  } catch {
    return null;
  }
}

export interface NotReadyWatchdogOptions {
  /** The normalized `maxTries` option. */
  readonly maxTries: number;
  /** The normalized `videoTimeout` option: milliseconds between two checks. */
  readonly videoTimeout: number;
  /** `true` when the media can play (v4: `readyState` ≥ 4, or ≥ 1 on iOS). */
  readonly isReady: () => boolean;
  /** Called once with {@link NOT_READY_ERROR} when the media is still not ready after `maxTries` checks. */
  readonly onNotReady: (error: CloudinaryError) => void;
  readonly timers: Timers;
}

/**
 * Starts the watchdog for a new source: checks every `videoTimeout`, stops at the first ready check,
 * and reports the error at check number `maxTries`. Returns the stop function (call it on `play`,
 * `canplaythrough`, error, source change and dispose).
 */
export function startNotReadyWatchdog(options: NotReadyWatchdogOptions): () => void {
  const { maxTries, videoTimeout, isReady, onNotReady, timers } = options;
  let tries = 0;
  let timer: unknown;
  const check = (): void => {
    if (isReady()) {
      return;
    }
    tries += 1;
    if (tries >= maxTries) {
      onNotReady(NOT_READY_ERROR);
    } else {
      timer = timers.setTimeout(check, videoTimeout);
    }
  };
  timer = timers.setTimeout(check, videoTimeout);
  return () => timers.clearTimeout(timer);
}

export interface LiveRetryOptions {
  /** Resolves `true` when the live stream has started (the layer probes with a media element). Stop aborts `signal`. */
  readonly isAvailable: (signal: AbortSignal) => Promise<boolean>;
  /** Called once when the stream has started: load the source again. */
  readonly onAvailable: () => void;
  /** Default {@link LIVE_RETRY_INTERVAL}. */
  readonly interval?: number;
  readonly timers: Timers;
}

/**
 * Keeps checking a live stream that has not started, every `interval`, until it starts (FR-016).
 * Show {@link LIVE_NOT_STARTED_ERROR} meanwhile. Returns the stop function; it also aborts a check in progress.
 */
export function startLiveRetry(options: LiveRetryOptions): () => void {
  const { isAvailable, onAvailable, interval = LIVE_RETRY_INTERVAL, timers } = options;
  const controller = new AbortController();
  let timer: unknown;
  const attempt = async (): Promise<void> => {
    const available = await isAvailable(controller.signal).catch(() => false);
    if (controller.signal.aborted) {
      return;
    }
    if (available) {
      onAvailable();
    } else {
      timer = timers.setTimeout(() => void attempt(), interval);
    }
  };
  timer = timers.setTimeout(() => void attempt(), interval);
  return () => {
    controller.abort();
    timers.clearTimeout(timer);
  };
}
