import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { toCredentialedBlobUrl, revokeBlobUrls } from '../../src/utils/credentialed-blob-url';

describe('credentialed blob url', () => {
  const url = 'https://example.com/captions.vtt';
  let blobUrls;

  beforeEach(() => {
    blobUrls = new Set();
    URL.createObjectURL = vi.fn(() => 'blob:https://example.com/abc');
    URL.revokeObjectURL = vi.fn();
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true, blob: () => Promise.resolve(new Blob()) })));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches with credentials and returns a blob url', async () => {
    const result = await toCredentialedBlobUrl(url, blobUrls);

    expect(fetch).toHaveBeenCalledWith(url, { credentials: 'include' });
    expect(result).toBe('blob:https://example.com/abc');
    expect(blobUrls.has(result)).toBe(true);
  });

  it('returns the original url when the response is not ok', async () => {
    fetch.mockResolvedValue({ ok: false, status: 401 });

    expect(await toCredentialedBlobUrl(url, blobUrls)).toBe(url);
    expect(blobUrls.size).toBe(0);
  });

  it('returns the original url when fetch throws', async () => {
    fetch.mockRejectedValue(new TypeError('Failed to fetch'));

    expect(await toCredentialedBlobUrl(url, blobUrls)).toBe(url);
  });

  it('revokes and clears blob urls', async () => {
    const blobUrl = await toCredentialedBlobUrl(url, blobUrls);
    revokeBlobUrls(blobUrls);

    expect(URL.revokeObjectURL).toHaveBeenCalledWith(blobUrl);
    expect(blobUrls.size).toBe(0);
  });
});
