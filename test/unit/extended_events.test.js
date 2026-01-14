import VideoPlayer from '../../src/video-player';
import { getResolveVideoElement, extractOptions } from '../../src/video-player.utils';

describe('ExtendedEvents', () => {
  let originalFetch;

  beforeAll(() => {
    originalFetch = global.fetch;
    global.fetch = jest.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('should trigger percentsplayed event with correct payload type', async () => {
    document.body.innerHTML = '<div><video id="test-player-2" class="video-js"></video></div>';
    const elem = getResolveVideoElement('test-player-2');
    const options = extractOptions(elem, {
      cloudinaryConfig: { cloud_name: 'demo' },
      playedEventPercents: [10]
    });

    const vp = new VideoPlayer(elem, options);
    
    // Wait for player to be ready so ExtendedEvents are initialized
    await new Promise(resolve => vp.videojs.ready(resolve));

    const triggerSpy = jest.spyOn(vp.videojs, 'trigger');

    // Simulate playback params
    jest.spyOn(vp.videojs, 'currentTime').mockReturnValue(10);
    jest.spyOn(vp.videojs, 'duration').mockReturnValue(100);

    // Trigger timeupdate
    vp.videojs.trigger('timeupdate');

    // ExtendedEvents should emit percentsplayed
    // VideoPlayer should catch and re-trigger with payload
    expect(triggerSpy).toHaveBeenCalledWith(expect.objectContaining({
      type: 'percentsplayed',
      percent: 10
    }));
  });
});
