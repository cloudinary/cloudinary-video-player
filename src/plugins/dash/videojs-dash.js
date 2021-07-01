import window from 'global/window';
import videojs from 'video.js';
import dashjs from 'dashjs';
import setupAudioTracks from './setup-audio-tracks';
import setupTextTracks from './setup-text-tracks';
import document from 'global/document';
import {assign} from '../../utils/assign';

/**
 * videojs-contrib-dash
 *
 * Use Dash.js to playback DASH content inside of Video.js via a SourceHandler
 */

class Html5DashJS {
  constructor(source, tech, options) {
    // Get options from tech if not provided for backwards compatibility
    options = options || tech.options_;

    this.player = videojs(options.playerId);
    this.player.dash = this.player.dash || {};

    this.tech_ = tech;
    this.el_ = tech.el();
    this.elParent_ = this.el_.parentNode;
    this.hasFiniteDuration_ = false;

    // Do nothing if the src is falsey
    if (!source.src) {
      return;
    }

    // While the manifest is loading and Dash.js has not finished initializing
    // we must defer events and functions calls with isReady_ and then `triggerReady`
    // again later once everything is setup
    tech.isReady_ = false;

    if (Html5DashJS.updateSourceData) {
      videojs.log.warn('updateSourceData has been deprecated.' +
        ' Please switch to using hook("updatesource", callback).');
      source = Html5DashJS.updateSourceData(source);
    }

    // call updatesource hooks
    Html5DashJS.hooks('updatesource').forEach((hook) => {
      source = hook(source);
    });

    const manifestSource = source.src;

    this.keySystemOptions_ = Html5DashJS.buildDashJSProtData(source.keySystemOptions);

    // eslint-disable-next-line new-cap
    this.player.dash.mediaPlayer = dashjs.MediaPlayer().create();

    this.mediaPlayer_ = this.player.dash.mediaPlayer;

    // For whatever reason, we need to call setTextDefaultEnabled(false) to get
    // VTT captions to show, even though we're doing virtually the same thing
    // in setup-text-tracks.js
    this.mediaPlayer_.setTextDefaultEnabled(false);

    // Log MedaPlayer messages through video.js
    if (Html5DashJS.useVideoJSDebug) {
      videojs.log.warn('useVideoJSDebug has been deprecated.' +
        ' Please switch to using hook("beforeinitialize", callback).');
      Html5DashJS.useVideoJSDebug(this.mediaPlayer_);
    }

    if (Html5DashJS.beforeInitialize) {
      videojs.log.warn('beforeInitialize has been deprecated.' +
        ' Please switch to using hook("beforeinitialize", callback).');
      Html5DashJS.beforeInitialize(this.player, this.mediaPlayer_);
    }

    Html5DashJS.hooks('beforeinitialize').forEach((hook) => {
      hook(this.player, this.mediaPlayer_);
    });

    // Must run controller before these two lines or else there is no
    // element to bind to.
    this.mediaPlayer_.initialize();

    // Retrigger a dash.js-specific error event as a player error
    // See src/streaming/utils/ErrorHandler.js in dash.js code
    // Handled with error (playback is stopped):
    // - capabilityError
    // - downloadError
    // - manifestError
    // - mediaSourceError
    // - mediaKeySessionError
    // Not handled:
    // - timedTextError (video can still play)
    // - mediaKeyMessageError (only fires under 'might not work' circumstances)
    // eslint-disable-next-line complexity
    this.retriggerError_ = (event) => {
      if (event.type === 'error') {

        /* initialize errros for ref https://cdn.dashjs.org/latest/jsdoc/core_errors_Errors.js.html
          map to general init error
        */
        if (event.error.code >= 10 && event.error.code <= 35) {
          this.player.error({ code: 4, dashjsErrorCode: event.error.code, message: event.error.message });
        } else if (event.error.code < 10) { // network errors
          this.player.error({ code: event.error.code, dashjsErrorCode: event.error.code, message: event.error.message });
        } else if (event.error.code >= 100 && event.error.code <= 114) { // Protection Errors  https://cdn.dashjs.org/latest/jsdoc/streaming_protection_errors_ProtectionErrors.js.html
          this.player.error({ code: 5, dashjsErrorCode: event.error.code, message: event.error.message });
        } else {
          this.player.error({ code: event.error.code, message: event.error.message });
        }
      }

      // only reset the dash player in 10ms async, so that the rest of the
      // calling function finishes
      setTimeout(() => {
        this.mediaPlayer_.reset();
      }, 10);
    };

    this.mediaPlayer_.on(dashjs.MediaPlayer.events.ERROR, this.retriggerError_);

    this.getDuration_ = (event) => {
      const periods = event.data.Period_asArray;
      const oldHasFiniteDuration = this.hasFiniteDuration_;

      if (event.data.mediaPresentationDuration || periods[periods.length - 1].duration) {
        this.hasFiniteDuration_ = true;
      } else {
        // in case we run into a weird situation where we're VOD but then
        // switch to live
        this.hasFiniteDuration_ = false;
      }

      if (this.hasFiniteDuration_ !== oldHasFiniteDuration) {
        this.player.trigger('durationchange');
      }
    };

    this.mediaPlayer_.on(dashjs.MediaPlayer.events.MANIFEST_LOADED, this.getDuration_);

    // Apply all dash options that are set
    if (options.dash) {
      Object.keys(options.dash).forEach((key) => {
        const dashOptionsKey = 'set' + key.charAt(0).toUpperCase() + key.slice(1);
        let value = options.dash[key];

        // eslint-disable-next-line no-prototype-builtins
        if (this.mediaPlayer_.hasOwnProperty(dashOptionsKey)) {
          // Providing a key without `set` prefix is now deprecated.
          videojs.log.warn('Using dash options in videojs-contrib-dash without the set prefix ' +
            `has been deprecated. Change '${key}' to '${dashOptionsKey}'`);

          // Set key so it will still work
          key = dashOptionsKey;
        }

        // eslint-disable-next-line no-prototype-builtins
        if (!this.mediaPlayer_.hasOwnProperty(key)) {
          videojs.log.warn(
            `Warning: dash configuration option unrecognized: ${key}`
          );

          return;
        }

        // Guarantee `value` is an array
        if (!Array.isArray(value)) {
          value = [value];
        }

        this.mediaPlayer_[key](...value);
      });
    }

    this.mediaPlayer_.attachView(this.el_);

    // Dash.js autoplays by default, video.js will handle autoplay
    this.mediaPlayer_.setAutoPlay(false);

    // Setup audio tracks
    // eslint-disable-next-line no-useless-call
    setupAudioTracks.call(null, this.player, tech);

    // Setup text tracks
    // eslint-disable-next-line no-useless-call
    setupTextTracks.call(null, this.player, tech, options);

    // Attach the source with any protection data
    this.mediaPlayer_.setProtectionData(this.keySystemOptions_);
    this.mediaPlayer_.attachSource(manifestSource);
    this.tech_.triggerReady();
    // map videojs seek
    this.player.on(this.tech_, 'seeking', () => {
      // handle seek the same way as in dash.js
      this.mediaPlayer_.seek((this.tech_.currentTime() - 8).toFixed(2));
    });
  }

  /*
   * Iterate over the `keySystemOptions` array and convert each object into
   * the type of object Dash.js expects in the `protData` argument.
   *
   * Also rename 'licenseUrl' property in the options to an 'serverURL' property
   */
  static buildDashJSProtData(keySystemOptions) {
    const output = {};

    if (!keySystemOptions || !Array.isArray(keySystemOptions)) {
      return null;
    }

    for (let i = 0; i < keySystemOptions.length; i++) {
      const keySystem = keySystemOptions[i];
      const options = videojs.mergeOptions({}, keySystem.options);

      if (options.licenseUrl) {
        options.serverURL = options.licenseUrl;
        delete options.licenseUrl;
      }

      output[keySystem.name] = options;
    }

    return output;
  }

  dispose() {
    if (this.mediaPlayer_) {
      this.mediaPlayer_.off(dashjs.MediaPlayer.events.ERROR, this.retriggerError_);
      this.mediaPlayer_.off(dashjs.MediaPlayer.events.MANIFEST_LOADED, this.getDuration_);
      this.mediaPlayer_.reset();
    }

    if (this.player.dash) {
      delete this.player.dash;
    }
  }

  duration() {
    if (this.mediaPlayer_.isDynamic() && !this.hasFiniteDuration_) {
      return Infinity;
    }
    return this.mediaPlayer_.duration();

  }

  /**
   * Get a list of hooks for a specific lifecycle
   *
   * @param {string} type the lifecycle to get hooks from
   * @param {Function=|Function[]=} hook Optionally add a hook tothe lifecycle
   * @return {Array} an array of hooks or epty if none
   * @method hooks
   */
  static hooks(type, hook) {
    Html5DashJS.hooks_[type] = Html5DashJS.hooks_[type] || [];

    if (hook) {
      Html5DashJS.hooks_[type] = Html5DashJS.hooks_[type].concat(hook);
    }

    return Html5DashJS.hooks_[type];
  }

  /**
   * Add a function hook to a specific dash lifecycle
   *
   * @param {string} type the lifecycle to hook the function to
   * @param {Function|Function[]} hook the function or array of functions to attach
   * @method hook
   */
  static hook(type, hook) {
    Html5DashJS.hooks(type, hook);
  }

  /**
   * Remove a hook from a specific dash lifecycle.
   *
   * @param {string} type the lifecycle that the function hooked to
   * @param {Function} hook The hooked function to remove
   * @return {boolean} True if the function was removed, false if not found
   * @method removeHook
   */
  static removeHook(type, hook) {
    const index = Html5DashJS.hooks(type).indexOf(hook);

    if (index === -1) {
      return false;
    }

    Html5DashJS.hooks_[type] = Html5DashJS.hooks_[type].slice();
    Html5DashJS.hooks_[type].splice(index, 1);

    return true;
  }
}

Html5DashJS.hooks_ = {};

const canHandleKeySystems = function(source) {
  // copy the source
  source = JSON.parse(JSON.stringify(source));

  if (Html5DashJS.updateSourceData) {
    videojs.log.warn('updateSourceData has been deprecated.' +
      ' Please switch to using hook("updatesource", callback).');
    source = Html5DashJS.updateSourceData(source);
  }

  // call updatesource hooks
  Html5DashJS.hooks('updatesource').forEach((hook) => {
    source = hook(source);
  });

  const videoEl = document.createElement('video');

  if (source.keySystemOptions &&
    !(window.navigator.requestMediaKeySystemAccess ||
      // IE11 Win 8.1
      videoEl.msSetMediaKeys)) {
    return false;
  }

  return true;
};

videojs.DashSourceHandler = function() {
  return {
    canHandleSource(source) {
      const dashExtRE = /\.mpd/i;

      if (!canHandleKeySystems(source)) {
        return '';
      }

      if (videojs.DashSourceHandler.canPlayType(source.type)) {
        return 'probably';
      } else if (dashExtRE.test(source.src)) {
        return 'maybe';
      }
      return '';

    },

    handleSource(source, tech, options) {
      return new Html5DashJS(source, tech, options);
    },

    canPlayType(type) {
      return videojs.DashSourceHandler.canPlayType(type);
    }
  };
};

videojs.DashSourceHandler.canPlayType = function(type) {
  const dashTypeRE = /^application\/dash\+xml/i;

  if (dashTypeRE.test(type)) {
    return 'probably';
  }

  return '';
};

// Only add the SourceHandler if the browser supports MediaSourceExtensions
if (window.MediaSource) {
  // eslint-disable-next-line new-cap
  videojs.getTech('Html5').registerSourceHandler(videojs.DashSourceHandler(), 0);
}

videojs.Html5DashJS = Html5DashJS;
export default Html5DashJS;
