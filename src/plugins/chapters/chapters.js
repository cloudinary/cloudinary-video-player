import videojs from 'video.js';

import './chapters.scss';
import { getCloudinaryUrlPrefix } from '../cloudinary/common';
import { utf8ToBase64 } from '../../utils/utf8Base64';

/**
 * Chapters plugin.
 *
 * @function chapters
 * @param    {Object} [options={}]
 *           An object of options left to the plugin author to define.
 * @param    {Player} player
 *           A Video.js player object.
 */
const chapters = function chapters(options, player) {
  player.addClass('vjs-chapters');
  player.chapters = new ChaptersPlugin(player, options);
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
    this.player.one('loadedmetadata', this.initializeChapters.bind(this));
    return this;
  }

  ChaptersPlugin.prototype.src = function src(options) {
    this.resetPlugin();
    this.options = options;
    this.player.one('loadedmetadata', this.initializeChapters.bind(this));
  };

  ChaptersPlugin.prototype.detach = function detach() {
    this.resetPlugin();
  };

  ChaptersPlugin.prototype.resetPlugin = function resetPlugin() {
    if (this.chaptersTrack) {
      this.player.$('.vjs-control-bar-chapter-display').remove();
      this.player.$('.vjs-chapter-display').remove();
      this.player.$$('.vjs-chapter-marker').forEach((el) => el.remove());
      this.player.removeRemoteTextTrack(this.chaptersTrack);
      delete this.chaptersTrack;
    }
  };

  ChaptersPlugin.prototype.getChaptersFileUrlByName = function getChaptersFileUrlByName() {
    const currentPublicId = this.player.cloudinary.currentPublicId();

    if (!currentPublicId) {
      return null;
    }

    const { type: deliveryType } = this.player.cloudinary.source().resourceConfig();
    const urlPrefix = getCloudinaryUrlPrefix(this.player.cloudinary.cloudinaryConfig());
    return `${urlPrefix}/_applet_/video_service/chapters/${deliveryType}/${utf8ToBase64(currentPublicId)}.vtt`;
  };

  /**
   * Bootstrap the plugin.
   */
  ChaptersPlugin.prototype.initializeChapters = async function initializeChapters() {
    const chaptersUrl = this.options === true ? this.getChaptersFileUrlByName() : this.options.url;

    if (chaptersUrl) {
      // Fetch chapters VTT from URL
      const chaptersTrack = {
        kind: 'chapters',
        src: chaptersUrl,
        default: true
      };
      const textTrack = this.player.addRemoteTextTrack(chaptersTrack);

      textTrack.addEventListener('load', () => {
        this.chaptersTrack = textTrack.track;
        this.setupChaptersDisplays();
      });
    } else if (Object.entries(this.options).length) {
      // Setup chapters from options
      const textTrack = this.player.addRemoteTextTrack({
        kind: 'chapters',
        default: true
      });

      const end = this.player.duration();
      Object.entries(this.options).forEach((entry, index, arr) => {
        const cue = new VTTCue(
          parseFloat(entry[0]),
          parseFloat(arr[index + 1] ? arr[index + 1][0] : end),
          entry[1]
        );
        textTrack.track.addCue(cue);
      });

      this.chaptersTrack = textTrack.track;
      this.setupChaptersDisplays();
      if (this.player.controlBar.chaptersButton) {
        this.player.controlBar.chaptersButton.update();
      }
    }
  };

  /**
   * Setup chapter displays.
   */
  ChaptersPlugin.prototype.setupChaptersDisplays = function initializeChapters() {
    this.setupProgressBarMarkers();
    this.setupProgressBarChapter();
    this.setupControlBarChapter();
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
      const activeCues = Array.from(this.chaptersTrack.activeCues); // Safari needs Array.from()
      controlBarChapterHolder.innerText =
        activeCues.length > 0 ? activeCues[0].text : '';
    });
  };

  /**
   * Setup the progress bar markers.
   */
  ChaptersPlugin.prototype.setupProgressBarMarkers = function setupProgressBarMarkers() {
    const total = this.player.duration();
    const { seekBar } = this.player.controlBar.progressControl;

    Array.from(this.chaptersTrack.cues).forEach(marker => { // Safari needs Array.from()
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
      style: `max-width: ${this.player.$('.vjs-vtt-thumbnail-display') ? this.player.$('.vjs-vtt-thumbnail-display').style.width : '160px'}`
    });

    const mouseTimeDisplay = this.player.getDescendant([
      'controlBar',
      'progressControl',
      'seekBar',
      'mouseTimeDisplay'
    ]);
    const timeTooltip = mouseTimeDisplay.getDescendant([
      'timeTooltip'
    ]);

    timeTooltip.el().parentElement.prepend(chapterEl);

    const getChapterFromPoint = point => {
      const total = this.player.duration();
      const seekBarTime = point * total;
      const chapter = Array.from(this.chaptersTrack?.cues || []).find(marker => {
        return seekBarTime >= marker.startTime && seekBarTime <= marker.endTime;
      });
      return chapter ? chapter.text : '';
    };

    timeTooltip.update = function (seekBarRect, seekBarPoint, content) {
      const originalUpdateFn = Object.getPrototypeOf(this).update;
      originalUpdateFn.call(this, seekBarRect, seekBarPoint, content);
      chapterEl.innerText = getChapterFromPoint(seekBarPoint);
    };

    // Handle case of no seek-thumbnails
    if (typeof this.player.vttThumbnails !== 'object') {
      mouseTimeDisplay.update = function (seekBarRect, seekBarPoint) {
        const time = seekBarPoint * this.player_.duration();
        const width = seekBarRect.width;
        const size = chapterEl.clientWidth / 2;

        timeTooltip.updateTime(seekBarRect, seekBarPoint, time, () => {
          // Make sure it doesn't exit the player
          if ((seekBarRect.width * seekBarPoint) < size) {
            this.el_.style.left = `${size}px`;
          } else if ((seekBarRect.width * seekBarPoint) + size > width) {
            this.el_.style.left = `${seekBarRect.width - size}px`;
          } else {
            this.el_.style.left = `${seekBarRect.width * seekBarPoint}px`;
          }
        });
        timeTooltip.write(videojs.time.formatTime(time));
      };
    }
  };

  return ChaptersPlugin;
}());

export default chapters;
