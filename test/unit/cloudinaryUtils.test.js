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

import { filterAndAddTextTracks } from '../../src/utils/cloudinary';

describe('video source tests', () => {
  it('test filter out bad vtt', async (done) => {
    let vjs = jest.createMockFromModule('video.js');
    vjs.addRemoteTextTrack = jest.fn();
    jest.spyOn(vjs, 'addRemoteTextTrack');
    filterAndAddTextTracks(tracks, vjs);
    setTimeout(() => {
      expect(vjs.addRemoteTextTrack).toBeCalledTimes(2);
      done();
    }, 1000);
  });

});
