describe('Adaptive streaming tests', () => {
  beforeAll(async () => {
    jest.setTimeout(35000);
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('http://localhost:3000/docs/adaptive-streaming.html', { waitUntil: 'load' });
    await page.evaluate(() => {
      Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
        get: function () {
          return !!(this.currentTime > 0 && !this.paused && !this.ended &&
            this.readyState > 2);
        }
      });
    });
  }, 10000);
  it('Should not throw an error when setting new hls source', async () => {
    jest.setTimeout(35000);
    await page.waitFor(1000);

    // async function not working without being put inside a template string,
    // See https://github.com/puppeteer/puppeteer/issues/1665
    const error = await page.evaluate(`(async () => {
      let error = null;
      
      // Get any error into error variable
      playerHls.on('error', (e) => (error = e.Player.videojs.error()));
      
      // Set new hls source
      playerHls.source('snow_horses', {sourceTypes: ['hls'], transformation: { streaming_profile: 'hd' }});
      
      // wait a second for error event
      await new Promise(resolve=>setTimeout(resolve, 1000));
      
      // Return null or an error object
      return JSON.stringify(error);
    })()`);
    expect(JSON.parse(error)).toEqual(null); // expect no error
  });

  it('Should support withCredentials for hls sources', async () => {
    jest.setTimeout(35000);
    await page.waitFor(1000);

    const result = await page.evaluate(`(async () => {
      // Create a new player with withCredentials
      const testPlayer = cloudinary.videoPlayer('test-player', {
        cloud_name: 'demo',
        withCredentials: true
      });

      // Set hls source
      testPlayer.source('snow_horses', {
        sourceTypes: ['hls'],
        transformation: { streaming_profile: 'hd' }
      });

      // Wait for adaptive streaming to load
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if hlsjsConfig has xhrSetup
      const tech = testPlayer.videojs.tech();
      const hlsjsConfig = tech.options_.hlsjsConfig;
      
      return {
        hasXhrSetup: typeof hlsjsConfig.xhrSetup === 'function',
        withCredentials: hlsjsConfig.withCredentials
      };
    })()`);

    expect(result.hasXhrSetup).toBe(true);
  });

  it('Should not configure xhrSetup when withCredentials is false', async () => {
    jest.setTimeout(35000);
    await page.waitFor(1000);

    const result = await page.evaluate(`(async () => {
      // Create a new player without withCredentials
      const testPlayer = cloudinary.videoPlayer('test-player-2', {
        cloud_name: 'demo',
        withCredentials: false
      });

      // Set hls source
      testPlayer.source('snow_horses', {
        sourceTypes: ['hls'],
        transformation: { streaming_profile: 'hd' }
      });

      // Wait for adaptive streaming to load
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if hlsjsConfig has xhrSetup
      const tech = testPlayer.videojs.tech();
      const hlsjsConfig = tech.options_.hlsjsConfig;
      
      return {
        hasXhrSetup: typeof hlsjsConfig.xhrSetup === 'function',
        configExists: !!hlsjsConfig
      };
    })()`);

    expect(result.hasXhrSetup).toBe(false);
    expect(result.configExists).toBe(true);
  });
});
