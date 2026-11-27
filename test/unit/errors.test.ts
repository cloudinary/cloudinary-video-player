import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ERROR_CODE,
  LIVE_NOT_STARTED_ERROR,
  mapCloudinaryError,
  NOT_READY_ERROR,
  probeCloudinaryError,
  startLiveRetry,
  startNotReadyWatchdog,
} from '../../src/core/errors.js';

const ids = { publicId: 'dog', cloudName: 'demo' };
// The values the layer passes after normalization (DEFAULTS: 3 tries, 55 s).
const defaults = { maxTries: 3, videoTimeout: 55_000 };
const URL = 'https://res.cloudinary.com/demo/video/upload/dog.mp4';

describe('mapCloudinaryError', () => {
  it.each([
    ['Unknown customer', ERROR_CODE.UNKNOWN_CUSTOMER, 'Video cannot be played Unknown cloud-name demo'],
    ['Resource not found - dog', ERROR_CODE.RESOURCE_NOT_FOUND, 'Video cannot be played Public ID dog not found'],
    ['Private Resource', ERROR_CODE.PRIVATE_RESOURCE, 'Video cannot be played Private video'],
    ['Unauthenticated access', ERROR_CODE.UNAUTHENTICATED, 'Video cannot be played Requires authentication'],
    ['Quota exceeded', ERROR_CODE.CUSTOM, 'Video cannot be played- Quota exceeded'],
    ['', ERROR_CODE.CUSTOM, 'Video cannot be played'],
  ])('maps the header %j to code %i with the v4 message', (errorHeader, code, message) => {
    expect(mapCloudinaryError({ errorHeader, statusCode: 404, ...ids })).toEqual({ code, message, statusCode: 404 });
  });

  it('maps 423 (still processing) to a plain-text, retryable error', () => {
    const error = mapCloudinaryError({ errorHeader: '', statusCode: 423, ...ids });
    expect(error).toEqual({
      code: ERROR_CODE.CUSTOM,
      message: 'Video is being processed. Try again in a moment.',
      statusCode: 423,
      retryable: true,
    });
    expect(error.message).not.toContain('<');
  });
});

describe('probeCloudinaryError', () => {
  const respond = (status: number, headers: Record<string, string> = {}) =>
    vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status, headers }));

  it('sends HEAD without credentials by default, with the signal', async () => {
    const fetch = respond(200);
    const { signal } = new AbortController();
    await probeCloudinaryError(URL, { fetch, signal, ...ids });
    expect(fetch).toHaveBeenCalledWith(URL, { method: 'HEAD', credentials: 'omit', signal });
  });

  it('sends HEAD with credentials when withCredentials is set', async () => {
    const fetch = respond(200);
    await probeCloudinaryError(URL, { fetch, withCredentials: true, ...ids });
    expect(fetch.mock.calls[0]?.[1]).toMatchObject({ method: 'HEAD', credentials: 'include' });
  });

  it('sends GET with a one-byte Range header when fetchErrorUsingGet is set', async () => {
    const fetch = respond(206);
    await probeCloudinaryError(URL, { fetch, fetchErrorUsingGet: true, ...ids });
    const init = fetch.mock.calls[0]?.[1];
    expect(init).toMatchObject({ method: 'GET', credentials: 'omit', headers: { Range: 'bytes=0-0' } });
    // v4 sent Content-Range, which does not limit the response.
    expect(init?.headers).not.toHaveProperty('Content-Range');
  });

  it('returns null when the URL answers successfully', async () => {
    await expect(probeCloudinaryError(URL, { fetch: respond(200), ...ids })).resolves.toBeNull();
  });

  it('maps the x-cld-error header of a failed response', async () => {
    const fetch = respond(404, { 'x-cld-error': 'Resource not found - dog' });
    await expect(probeCloudinaryError(URL, { fetch, ...ids })).resolves.toEqual({
      code: ERROR_CODE.RESOURCE_NOT_FOUND,
      message: 'Video cannot be played Public ID dog not found',
      statusCode: 404,
    });
  });

  it('returns null instead of throwing when the request fails', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(probeCloudinaryError(URL, { fetch, ...ids })).resolves.toBeNull();
  });

  it('returns null when the request is aborted', async () => {
    const controller = new AbortController();
    const fetch = vi.fn<typeof globalThis.fetch>((_url, init) =>
      init?.signal?.aborted ? Promise.reject(new DOMException('Aborted', 'AbortError')) : Promise.resolve(new Response(null, { status: 404 })),
    );
    controller.abort();
    await expect(probeCloudinaryError(URL, { fetch, signal: controller.signal, ...ids })).resolves.toBeNull();
  });
});

describe('timers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('startNotReadyWatchdog', () => {
    it('reports the error after maxTries × videoTimeout (3 × 55 s by default)', () => {
      const isReady = vi.fn(() => false);
      const onNotReady = vi.fn();
      startNotReadyWatchdog({ ...defaults, isReady, onNotReady, timers: globalThis });
      vi.advanceTimersByTime(3 * 55_000 - 1);
      expect(onNotReady).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);
      expect(onNotReady).toHaveBeenCalledExactlyOnceWith(NOT_READY_ERROR);
      expect(isReady).toHaveBeenCalledTimes(3);
      expect(vi.getTimerCount()).toBe(0);
    });

    it('uses the maxTries and videoTimeout options', () => {
      const onNotReady = vi.fn();
      startNotReadyWatchdog({ maxTries: 2, videoTimeout: 1000, isReady: () => false, onNotReady, timers: globalThis });
      vi.advanceTimersByTime(2000);
      expect(onNotReady).toHaveBeenCalledOnce();
    });

    it('stops at the first check that finds the media ready', () => {
      const isReady = vi.fn().mockReturnValueOnce(false).mockReturnValue(true);
      const onNotReady = vi.fn();
      startNotReadyWatchdog({ ...defaults, isReady, onNotReady, timers: globalThis });
      vi.advanceTimersByTime(10 * 55_000);
      expect(isReady).toHaveBeenCalledTimes(2);
      expect(onNotReady).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    });

    it('leaves no timer after stop', () => {
      const onNotReady = vi.fn();
      const stop = startNotReadyWatchdog({ ...defaults, isReady: () => false, onNotReady, timers: globalThis });
      vi.advanceTimersByTime(55_000);
      stop();
      expect(vi.getTimerCount()).toBe(0);
      vi.advanceTimersByTime(10 * 55_000);
      expect(onNotReady).not.toHaveBeenCalled();
    });
  });

  describe('startLiveRetry', () => {
    it('has the v4 live error message', () => {
      expect(LIVE_NOT_STARTED_ERROR).toEqual({ code: ERROR_CODE.CUSTOM, message: 'Live Stream not started' });
    });

    it('checks every 5 s until the stream starts, then reloads once', async () => {
      const isAvailable = vi.fn<(signal: AbortSignal) => Promise<boolean>>()
        .mockResolvedValueOnce(false)
        .mockRejectedValueOnce(new Error('probe failed'))
        .mockResolvedValue(true);
      const onAvailable = vi.fn();
      startLiveRetry({ isAvailable, onAvailable, timers: globalThis });
      await vi.advanceTimersByTimeAsync(4999);
      expect(isAvailable).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(10_001);
      expect(isAvailable).toHaveBeenCalledTimes(3);
      expect(onAvailable).toHaveBeenCalledOnce();
      expect(vi.getTimerCount()).toBe(0);
    });

    it('stops a check in progress: aborts it, never reloads, leaves no timer', async () => {
      let resolve: (available: boolean) => void = () => {};
      const isAvailable = vi.fn((_signal: AbortSignal) => new Promise<boolean>((done) => (resolve = done)));
      const onAvailable = vi.fn();
      const stop = startLiveRetry({ isAvailable, onAvailable, timers: globalThis });
      await vi.advanceTimersByTimeAsync(5000);
      expect(isAvailable).toHaveBeenCalledOnce();
      stop();
      expect(isAvailable.mock.calls[0]?.[0].aborted).toBe(true);
      resolve(true);
      await vi.advanceTimersByTimeAsync(60_000);
      expect(onAvailable).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    });
  });
});
