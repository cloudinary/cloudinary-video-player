describe('Playlist tests', () => {

  beforeEach(async () => {
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('http://localhost:3000/playlist.html', { waitUntil: 'load' });
    await page.evaluate(() => {
      Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
        get: function() {
          return !!(this.currentTime > 0 && !this.paused && !this.ended &&
              this.readyState > 2);
        }
      });
    });
  }, 30000);

  it('Test playlist layout', async () => {
    await page.waitForSelector('#player_html5_api', { visible: true, timeout: 35000 });
    expect(await page.$('.cld-plw-col-player')).not.toBeNull();
    expect(await page.$('.cld-plw-col-list')).not.toBeNull();
  });

  /*  it('Test direction', async () => {
    await page.waitForSelector('#player_html5_api', { visible: true, timeout: 35000 });
    expect(await page.$('.cld-plw-horizontal')).not.toBeNull();
    expect(await page.$('.cld-plw-vertical')).toBeNull();
    await page.select('select#changePlaylistDirection', 'vertical');
    expect(await page.$('.cld-plw-horizontal')).toBeNull();
    expect(await page.$('.cld-plw-vertical')).not.toBeNull();
  });*/
  /*  it('Test number of items', async () => {
    await page.waitForSelector('#player_html5_api', { visible: true, timeout: 35000 });
    let numberOfItems = await page.$eval('input#changePlaylistTotal', inp => parseInt(inp.value, 10));
    let numberOfChildren = await page.$$eval('.cld-plw-panel-item', items => Array.from(items).length);
    expect(numberOfChildren).toEqual(numberOfItems);
    await page.focus('input#changePlaylistTotal');
    await page.keyboard.press('Delete');
    await page.keyboard.type('3');
    numberOfChildren = await page.$$eval('.cld-plw-panel-item', items => Array.from(items).length);
    expect(numberOfChildren).toEqual(3);
  });*/

  /*  it('Test skin', async () => {
    await page.waitForSelector('#player_html5_api', { visible: true, timeout: 35000 });
    expect(await page.$('.cld-video-player-skin-dark')).not.toBeNull();
    expect(await page.$('.cld-video-player-skin-light')).toBeNull();
    await page.select('select#changePlaylistSkin', 'light');
    expect(await page.$('.cld-video-player-skin-dark')).toBeNull();
    expect(await page.$('.cld-video-player-skin-light')).not.toBeNull();
  });*/

  it('Test video change', async () => {
    await page.waitForSelector('#player_html5_api', { visible: true, timeout: 35000 });
    const curruntVideoUrl = await page.$eval('#player_html5_api', vid => vid.src);
    await page.click('div.cld-plw-col-list > div > a:nth-child(2)');
    const nextVideoUrl = await page.$eval('#player_html5_api', vid => vid.src);
    expect(curruntVideoUrl).not.toEqual(nextVideoUrl);
  });
});


