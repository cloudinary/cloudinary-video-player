import videojs from 'video.js';

import SourceMenuButton from './components/SourceMenuButton';
import SourceMenuItem from './components/SourceMenuItem';

// Default options for the plugin.
const defaults = {};

// Cross-compatibility for Video.js 5 and 6.
const registerPlugin = videojs.registerPlugin || videojs.plugin;
// const dom = videojs.dom || videojs;

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
const onPlayerReady = (player) => {
  player.addClass('vjs-http-source-selector');
  console.log('videojs-http-source-selector initialized!');

  console.log('player.techName_:' + player.techName_);
  // This plugin only supports level selection for HLS playback
  if (player.techName_ !== 'Html5') {
    return false;
  }

  /**
  *
  * We have to wait for the manifest to load before we can scan renditions for resolutions/bitrates to populate selections
  *
  **/
  player.on(['loadedmetadata'], function() {
    // hack for plugin idempodency... prevents duplicate menubuttons from being inserted into the player if multiple player.httpSourceSelector() functions called.
    if (player.videojs_http_source_selector_initialized === 'undefined' || player.videojs_http_source_selector_initialized === true) {
      console.log('player.videojs_http_source_selector_initialized == true');
    } else {
      console.log('player.videojs_http_source_selector_initialized == false');
      player.videojs_http_source_selector_initialized = true;
      const controlBar = player.controlBar,
        fullscreenToggle = controlBar.getChild('fullscreenToggle').el();
      controlBar.el().insertBefore(controlBar.addChild('SourceMenuButton').el(), fullscreenToggle);
    }
  });
};

/**
  * A video.js plugin.
  *
  * In the plugin function, the value of `this` is a video.js `Player`
  * instance. You cannot rely on the player being in a "ready" state here,
  * depending on how the plugin is invoked. This may or may not be important
  * to you; if not, remove the wait for "ready"!
  *
  * @function httpSourceSelector
  * @param    {Object} [options={}]
  *           An object of options left to the plugin author to define.
  */
const httpSourceSelector = function(options) {
  this.ready(() => {
    onPlayerReady(this, videojs.mergeOptions(defaults, options));
    // this.getChild('controlBar').addChild('SourceMenuButton', {});
  });

  videojs.registerComponent('SourceMenuButton', SourceMenuButton);
  videojs.registerComponent('SourceMenuItem', SourceMenuItem);
};

// Register the plugin with video.js.
registerPlugin('httpSourceSelector', httpSourceSelector);

export default httpSourceSelector;
