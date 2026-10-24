import { describe, it, expect, vi, beforeEach } from 'vitest';
import textTracksManager from '../../src/plugins/text-tracks-manager/index.js';
import { fetchFileContent } from '../../src/plugins/text-tracks-manager/utils.js';

vi.mock('../../src/plugins/text-tracks-manager/utils.js', () => ({
  fetchFileContent: vi.fn(() => Promise.resolve(null)),
  addTextTrackCues: vi.fn(),
  refreshTextTrack: vi.fn(),
  removeAllTextTrackCues: vi.fn(),
}));

const createPlayer = () => {
  const handlers = {};
  const tracks = [];
  const player = {
    textTrackDisplay: { el: () => ({ classList: { add: vi.fn() } }) },
    cloudinary: {
      source: () => ({
        publicId: () => 'id',
        resourceConfig: () => ({ type: 'upload' }),
        queryParams: () => ({}),
      }),
      cloudinaryConfig: () => ({ cloud_name: 'demo' }),
    },
    textTracks: () => tracks,
    remoteTextTracks: () => tracks,
    addRemoteTextTrack: ({ kind, label, mode }) => {
      const track = { kind, label, mode };
      tracks.push(track);
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
