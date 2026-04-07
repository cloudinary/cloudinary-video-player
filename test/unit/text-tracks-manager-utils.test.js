import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchFileContent } from '../../src/plugins/text-tracks-manager/utils.js';

describe('text-tracks-manager utils fetchFileContent', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve('WEBVTT\n\n'),
        })
      )
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses credentials omit when not specified', async () => {
    await fetchFileContent('https://example.com/captions.srt');
    expect(fetch).toHaveBeenCalledWith('https://example.com/captions.srt', {
      signal: undefined,
      credentials: 'omit',
    });
  });

  it('uses credentials include when configured', async () => {
    await fetchFileContent('https://example.com/captions.srt', { credentials: 'include' });
    expect(fetch).toHaveBeenCalledWith('https://example.com/captions.srt', {
      signal: undefined,
      credentials: 'include',
    });
  });
});
