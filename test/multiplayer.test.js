describe('Multi-player tests', () => {

  beforeEach(async () => {
    await page.setViewport({ width: 1280, height: 1800 });
    await page.goto('http://localhost:3000/multiple-players.html', { waitUntil: 'load' });
    await page.evaluate(() => {
      Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
        get: function() {
          return !!(this.currentTime > 0 && !this.paused && !this.ended &&
              this.readyState > 2);
        }
      });
    });
  }, 10000);

  it('Test play', async () => {
    page.waitFor(1500);
    const players = await page.$$eval('video', v => v);
    for (const player of players) {
      const id = '#' + player.playerId + '_html5_api';
      await page.waitFor(1500);
      expect(await page.$eval(id, el => el.playing)).toBe(true);
    }
  });
});
