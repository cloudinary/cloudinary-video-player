import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import textTracksManager from '../../src/plugins/text-tracks-manager/index.js';
import { fetchFileContent } from '../../src/plugins/text-tracks-manager/utils.js';

vi.mock('../../src/plugins/text-tracks-manager/utils.js', () => ({
  fetchFileContent: vi.fn(() => Promise.resolve(null)),
  addTextTrackCues: vi.fn(),
  refreshTextTrack: vi.fn(),
  removeAllTextTrackCues: vi.fn(),
}));

const createPlayer = ({ withCredentials = false } = {}) => {
  const handlers = {};
  const tracks = [];
  const player = {
    textTrackDisplay: { el: () => ({ classList: { add: vi.fn() } }) },
    cloudinary: {
      source: () => ({
        publicId: () => 'id',
        resourceConfig: () => ({ type: 'upload' }),
        queryParams: () => ({}),
        withCredentials,
      }),
      cloudinaryConfig: () => ({ cloud_name: 'demo' }),
    },
    textTracks: () => tracks,
    remoteTextTracks: () => ({ tracks_: tracks }),
    removeRemoteTextTrack: (track) => tracks.splice(tracks.indexOf(track), 1),
    addRemoteTextTrack: ({ kind, label, mode, src }) => {
      const track = { kind, label, mode, src };
      tracks.push(track);
      // Video.js fires texttrackchange synchronously while adding the track
      handlers.texttrackchange?.();
      return { track };
    },
    on: (event, handler) => { handlers[event] = handler; },
    one: (event, handler) => handler(),
  };
  return { player, tracks, fireTextTrackChange: () => handlers.texttrackchange() };
};

describe('textTracksManager', () => {
  let player, tracks, fireTextTrackChange, manager;

  beforeEach(() => {
    fetchFileContent.mockClear();
    ({ player, tracks, fireTextTrackChange } = createPlayer());
    manager = textTracksManager.call(player);
    manager.addTextTracks([
      { kind: 'descriptions', label: 'AD', srclang: 'en-US' },
      { kind: 'subtitles', label: 'French', srclang: 'fr' },
    ]);
  });

  it('loads cues for a track that starts showing while another track is already showing', () => {
    const [descriptions, subtitles] = tracks;

    descriptions.mode = 'showing';
    fireTextTrackChange();
    expect(fetchFileContent).toHaveBeenCalledTimes(1);

    subtitles.mode = 'showing';
    fireTextTrackChange();
    expect(fetchFileContent).toHaveBeenCalledTimes(2);
  });

  it('does not reload a track that is still showing', () => {
    tracks[0].mode = 'showing';
    fireTextTrackChange();
    fireTextTrackChange();

    expect(fetchFileContent).toHaveBeenCalledTimes(1);
  });

  describe('native VTT tracks with withCredentials', () => {
    const vttUrl = 'https://example.com/captions.vtt';

    beforeEach(() => {
      URL.createObjectURL = vi.fn(() => 'blob:https://example.com/abc');
      vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true, blob: () => Promise.resolve(new Blob()) })));
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('loads the VTT with credentials and adds the track with a blob url', async () => {
      ({ player, tracks } = createPlayer({ withCredentials: true }));
      textTracksManager.call(player).addTextTracks([
        { kind: 'subtitles', label: 'EN', srclang: 'en', src: vttUrl },
        { kind: 'captions', label: 'Transcript', srclang: 'en' },
      ]);
      await vi.waitFor(() => expect(tracks).toHaveLength(2));

      expect(fetch).toHaveBeenCalledWith(vttUrl, { credentials: 'include' });
      expect(tracks[0].src).toBe('blob:https://example.com/abc');
      expect(tracks[1].src).toBeUndefined();
    });

    it('does not add tracks when the source changed while fetching', async () => {
      let resolveFetch;
      fetch.mockImplementationOnce(() => new Promise((resolve) => { resolveFetch = resolve; }));
      URL.revokeObjectURL = vi.fn();
      ({ player, tracks } = createPlayer({ withCredentials: true }));
      const manager = textTracksManager.call(player);
      manager.addTextTracks([{ kind: 'subtitles', label: 'EN', srclang: 'en', src: vttUrl }]);

      manager.removeAllTextTracks();
      resolveFetch({ ok: true, blob: () => Promise.resolve(new Blob()) });
      await vi.waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:https://example.com/abc'));

      expect(tracks).toHaveLength(0);
    });

    it('keeps the original url without withCredentials', () => {
      ({ player, tracks } = createPlayer());
      textTracksManager.call(player).addTextTracks([{ kind: 'subtitles', label: 'EN', srclang: 'en', src: vttUrl }]);

      expect(fetch).not.toHaveBeenCalled();
      expect(tracks[0].src).toBe(vttUrl);
    });
  });

  it('loads a default track on init', () => {
    ({ player, tracks } = createPlayer());
    fetchFileContent.mockClear();
    textTracksManager.call(player).addTextTracks([
      { kind: 'captions', label: 'EN', srclang: 'en', default: true },
    ]);

    expect(fetchFileContent).toHaveBeenCalledTimes(1);
  });

  it('aborts loading for a track that leaves showing', () => {
    let signal;
    fetchFileContent.mockImplementationOnce((url, options) => {
      signal = options.signal;
      return new Promise(() => {});
    });

    tracks[0].mode = 'showing';
    fireTextTrackChange();
    tracks[0].mode = 'disabled';
    fireTextTrackChange();

    expect(signal.aborted).toBe(true);
  });
});
