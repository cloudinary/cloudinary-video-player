const PuppeteerEnvironment = require('jest-environment-puppeteer');

class VideoPlayerEnvironment extends PuppeteerEnvironment {
  async setup() {
    await super.setup();
    // Your setup
  }

  async teardown() {
    // Your teardown
    await super.teardown();
  }
}

module.exports = VideoPlayerEnvironment;