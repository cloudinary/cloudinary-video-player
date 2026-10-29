import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import chapters from '../../src/plugins/chapters/chapters';

const createPlayer = ({ withCredentials = false } = {}) => ({
  addClass: vi.fn(),
  $: () => ({ remove: vi.fn() }),
  $$: () => [],
  duration: () => 10,
  one: (event, handler) => handler(),
  addRemoteTextTrack: vi.fn(() => ({ addEventListener: vi.fn(), track: {} })),
  removeRemoteTextTrack: vi.fn(),
  cloudinary: {
    currentPublicId: () => 'id',
    source: () => ({
      resourceConfig: () => ({ type: 'upload' }),
      queryParams: () => ({}),
      withCredentials,
    }),
    cloudinaryConfig: () => ({ cloud_name: 'demo' }),
  },
});

const blobResponse = () => ({ ok: true, blob: () => Promise.resolve(new Blob()) });

describe('chapters plugin with withCredentials', () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:https://example.com/abc');
    URL.revokeObjectURL = vi.fn();
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(blobResponse())));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('adds the chapters track with a blob url', async () => {
    const player = createPlayer({ withCredentials: true });
    chapters(true, player);
    await vi.waitFor(() => expect(player.addRemoteTextTrack).toHaveBeenCalledTimes(1));

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/chapters/upload/'), { credentials: 'include' });
    expect(player.addRemoteTextTrack).toHaveBeenCalledWith(expect.objectContaining({ src: 'blob:https://example.com/abc' }));
  });

  it('adds only the new source chapters when the source changes while fetching', async () => {
    let resolveFirstFetch;
    fetch.mockImplementationOnce(() => new Promise((resolve) => { resolveFirstFetch = resolve; }));
    const player = createPlayer({ withCredentials: true });
    chapters(true, player);

    player.chapters.src(true);
    resolveFirstFetch(blobResponse());
    await vi.waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1));

    expect(player.addRemoteTextTrack).toHaveBeenCalledTimes(1);
  });

  it('drops a pending fetch after a direct reset', async () => {
    let resolveFetch;
    fetch.mockImplementationOnce(() => new Promise((resolve) => { resolveFetch = resolve; }));
    const player = createPlayer({ withCredentials: true });
    chapters(true, player);

    player.chapters.resetPlugin();
    resolveFetch(blobResponse());
    await vi.waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1));

    expect(player.addRemoteTextTrack).not.toHaveBeenCalled();
  });

  it('uses the original url without withCredentials', () => {
    const player = createPlayer();
    chapters(true, player);

    expect(fetch).not.toHaveBeenCalled();
    expect(player.addRemoteTextTrack).toHaveBeenCalledWith(expect.objectContaining({ src: expect.stringContaining('/chapters/upload/') }));
  });
});
