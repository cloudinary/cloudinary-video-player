const tracks = [
  {
    default: false,
    kind: 'subtitles',
    label: 'German subtitles',
    src: 'https://res.cloudinary.com/yaronr/raw/upload/v1558966008/Meetup_german.vtt',
    srclang: 'de'
  },
  {
    default: false,
    kind: 'subtitles',
    label: 'Hebrew subtitles',
    src: 'https://res.cloudinary.com/yaronr/raw/upload/v1558966008/Meetup_hebrew.vtt',
    srclang: 'he'
  },
  {
    default: false,
    kind: 'subtitles',
    label: 'Swedish subtitles',
    src: 'https://res.cloudinary.com/yaronr/raw/upload/v1558966008/Meetup_swedish.vtt',
    srclang: 'se'
  }
];

global.fetch = jest.fn((url, options) => {
  return new Promise((resolve) => {
    if (url === tracks[2].src) {
      resolve({ status: 404 });
    } else {
      resolve({ status: 200 });
    }
  });
});

import { addTextTracks } from '../../src/utils/cloudinary';

describe('video source tests', () => {
  it('test filter out bad vtt', async () => {
    let vjs = jest.createMockFromModule('video.js');
    vjs.addRemoteTextTrack = jest.fn();
    jest.spyOn(vjs, 'addRemoteTextTrack');
    addTextTracks(tracks, vjs);
    setTimeout(() => {
      expect(vjs.addRemoteTextTrack).toBeCalledTimes(2);
    }, 1000);
  });

});
