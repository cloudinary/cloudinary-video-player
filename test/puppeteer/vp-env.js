const PuppeteerEnvironment = require('jest-environment-puppeteer');

class VideoPlayerEnvironment extends PuppeteerEnvironment {
  async setup() {
    await super.setup();
    // Your setup
  }

  async teardown() {
    // Your teardown
    try {
      await super.teardown();
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = VideoPlayerEnvironment;
