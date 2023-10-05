import videojs from 'video.js';

import './chapters.scss';

// Default options for the plugin.
let defaults = {};

/**
 * Function to invoke when the player is ready.
 *
 * This is a great place for your plugin to initialize itself. When this
 * function is called, the player will have its DOM and child components
 * in place.
 *
 * @function onPlayerReady
 * @param    {Player} player
 *           A Video.js player object.
 *
 * @param    {Object} [options={}]
 *           A plain object containing options for the plugin.
 */
const onPlayerReady = function onPlayerReady(player, options) {
  player.addClass('vjs-chapters');
  player.chapters = new ChaptersPlugin(player, options);
};

/**
 * A video.js plugin.
 *
 * In the plugin function, the value of `this` is a video.js `Player`
 * instance. You cannot rely on the player being in a "ready" state here,
 * depending on how the plugin is invoked. This may or may not be important
 * to you; if not, remove the wait for "ready"!
 *
 * @function chapters
 * @param    {Object} [options={}]
 *           An object of options left to the plugin author to define.
 */
const chapters = function chapters(options) {
  this.ready(function () {
    onPlayerReady(this, videojs.obj.merge(defaults, options));
  });
};

/**
 * Chapters
 */
const ChaptersPlugin = (function () {

  /**
   * Plugin class constructor, called by videojs on
   * ready event.
   *
   * @function  constructor
   * @param    {Player} player
   *           A Video.js player object.
   *
   * @param    {Object} [options={}]
   *           A plain object containing options for the plugin.
   */
  function ChaptersPlugin(player, options) {
    this.player = player;
    this.options = options;
    this.player.on('loadedmetadata', this.initializeChapters.bind(this));
    return this;
  }

  ChaptersPlugin.prototype.src = function src(source) {
    this.resetPlugin();
    this.options.src = source;
    this.initializeChapters();
  };

  ChaptersPlugin.prototype.detach = function detach() {
    this.resetPlugin();
  };

  ChaptersPlugin.prototype.resetPlugin = function resetPlugin() {
    delete this.chaptersTrack;
  };

  /**
   * Bootstrap the plugin.
   */
  ChaptersPlugin.prototype.initializeChapters = function initializeChapters() {
    if (this.options.url) {
      const chaptersTrack = {
        kind: 'chapters',
        src: this.options.url
      };
      const textTrack = this.player.addRemoteTextTrack(chaptersTrack);
      textTrack.addEventListener('load', () => {
        this.chaptersTrack = textTrack.track;
        this.setupProgressBarMarkers();
        this.setupProgressBarChapter();
        this.setupControlBarChapter();
      });
    } else {
      const textTrack = this.player.addTextTrack('chapters');
      const end = this.player.duration();
      Object.entries(this.options).forEach((entry, index, arr) => {
        const cue = new VTTCue(
          parseFloat(entry[0]),
          parseFloat(arr[index + 1] ? arr[index + 1][0] : end),
          entry[1]
        );
        textTrack.addCue(cue);
      });
      this.chaptersTrack = textTrack;
      this.setupProgressBarMarkers();
      this.setupProgressBarChapter();
      this.setupControlBarChapter();
    }
  };

  /**
   * Setup the controlbar chapter display.
   */
  ChaptersPlugin.prototype.setupControlBarChapter = function setupControlBarChapter() {
    const controlBarChapterHolder =
      this.player.$('.vjs-control-bar-chapter-display') || document.createElement('div');
    controlBarChapterHolder.setAttribute('class', 'vjs-control-bar-chapter-display');

    const wrapper = this.player.$('.vjs-control-bar .vjs-spacer');
    wrapper.innerHTML = '';
    wrapper.classList.add('vjs-control-bar-chapter-wrapper');
    wrapper.appendChild(controlBarChapterHolder);

    this.chaptersTrack.addEventListener('cuechange', () => {
      controlBarChapterHolder.innerHTML =
        this.chaptersTrack.activeCues_.length > 0 ? this.chaptersTrack.activeCues_[0].text : '';
    });
  };

  /**
   * Setup the progress bar markers.
   */
  ChaptersPlugin.prototype.setupProgressBarMarkers = function setupProgressBarMarkers() {
    const total = this.player.duration();
    const { seekBar } = this.player.controlBar.progressControl;
    this.chaptersTrack.cues_.forEach(marker => {
      if (marker.startTime !== 0) {
        const markerTime = marker.startTime;
        const left = (markerTime / total) * 100 + '%';

        const markerEl = videojs.dom.createEl('div', undefined, {
          class: 'vjs-chapter-marker',
          style: `left: ${left}`
        });

        seekBar.el().append(markerEl);
      }
    });
  };

  /**
   * Setup the progrees bar on-hover chapter display.
   */
  ChaptersPlugin.prototype.setupProgressBarChapter = function setupProgressBarChapter() {
    const chapterEl = videojs.dom.createEl('div', undefined, {
      class: 'vjs-chapter-display',
      style: `width: ${this.player.$('.vjs-vtt-thumbnail-display').style.width || '160px'}`
    });

    const timeTooltip = this.player.getDescendant([
      'controlBar',
      'progressControl',
      'seekBar',
      'mouseTimeDisplay',
      'timeTooltip'
    ]);

    timeTooltip.el().parentElement.prepend(chapterEl);

    const getChapterFromPoint = point => {
      const total = this.player.duration();
      const seekBarTime = point * total;
      const chapter = this.chaptersTrack.cues_.find(marker => {
        return seekBarTime >= marker.startTime  &&  seekBarTime  <= marker.endTime;
      });
      return chapter ? chapter.text : '';
    };

    timeTooltip.update = function (seekBarRect, seekBarPoint, content) {
      const originalUpdateFn = Object.getPrototypeOf(this).update;
      originalUpdateFn.call(this, seekBarRect, seekBarPoint, content);
      chapterEl.innerHTML = getChapterFromPoint(seekBarPoint);
    };
  };

  return ChaptersPlugin;
}());

export default chapters;
