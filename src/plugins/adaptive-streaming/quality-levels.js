import videojs from 'video.js';
import Hls from 'hls.js';

const qualityLevels = (player, options) => {
  const levelToRenditionHls = level => {
    let levelUrl =
      Array.isArray(level.url) && level.url.length > 1 ? level.url[level.urlId] : level.url;
    let rendition = {
      id: levelUrl,
      width: level.width,
      height: level.height,
      bandwidth: level.bitrate, // bitrate => bandwidth
      frameRate: 0,
      enabled: enableRendition => {
        var tech = player.tech({ IWillNotUseThisInPlugins: true });
        if (
          typeof tech.sourceHandler_ != 'undefined' &&
          typeof tech.sourceHandler_.hls != 'undefined' &&
          tech.sourceHandler_.hls != null
        ) {
          const hls = tech.sourceHandler_.hls;
          const levelIndex = hls.levels.findIndex(
            l => (Array.isArray(l.url) && l.url.length > 1 ? l.url[l.urlId] : l.url) === levelUrl
          );

          if (levelIndex >= 0 && enableRendition) {
            hls.currentLevel = levelIndex;
          }
        }
        return enableRendition;
      }
    };
    return rendition;
  };

  const levelToRenditionDash = level => ({
    id: level.id,
    width: level.width,
    height: level.height,
    bandwidth: level.bandwidth,
    enabled: enableRendition => {
      const dash = player.dash;
      if (dash && dash.mediaPlayer) {
        if (enableRendition) {
          dash.mediaPlayer.updateSettings({
            streaming: { abr: { autoSwitchBitrate: { video: false, audio: false } } }
          });
          // Find the correct quality index by resolution
          const targetQualityIndex = findDashQualityIndex(level.width, level.height);
          if (targetQualityIndex >= 0) {
            dash.mediaPlayer.setQualityFor('video', targetQualityIndex);
            // Set audio quality if mapping exists
            if (dash.audioMapper && dash.audioMapper[targetQualityIndex] !== undefined) {
              dash.mediaPlayer.setQualityFor('audio', dash.audioMapper[targetQualityIndex]);
            }
          }
        }
      }
      return enableRendition;
    }
  });

  const getRenditionsDash = () => {
    var dash = player.dash;
    if (
      typeof dash != 'undefined' &&
      dash != null &&
      typeof dash.mediaPlayer != 'undefined' &&
      dash.mediaPlayer != null
    ) {
      var streamInfo = dash.mediaPlayer.getActiveStream().getStreamInfo();
      var dashAdapter = dash.mediaPlayer.getDashAdapter();
      if (dashAdapter && streamInfo) {
        const periodIdx = streamInfo.index;
        var adaptation = dashAdapter.getAdaptationForType(periodIdx, 'video', streamInfo);
      }
      return adaptation.Representation_asArray;
    }
    return [];
  };

  // Helper function to find DASH quality index by resolution
  const findDashQualityIndex = (targetWidth, targetHeight) => {
    var dash = player.dash;
    if (dash && dash.mediaPlayer) {
      const availableQualities = dash.mediaPlayer.getBitrateInfoListFor('video');
      const targetQuality = availableQualities.find(q => 
        q.width === targetWidth && q.height === targetHeight
      );
      return targetQuality ? targetQuality.qualityIndex : -1;
    }
    return -1;
  };

  // Clean up quality levels and reset state for new source
  const cleanupQualityLevels = () => {
    let qualityLevels = player.qualityLevels;
    if (typeof qualityLevels === 'function') {
      qualityLevels = player.qualityLevels();
      // Clear all existing quality levels
      qualityLevels.dispose();
      debugLog('Quality levels cleaned up for new source');
    }
    
    // Clean up audio tracks from previous source
    const audioTrackList = player.audioTracks();
    if (audioTrackList && audioTrackList.length > 0) {
      // Remove all existing audio tracks
      for (let i = audioTrackList.length - 1; i >= 0; i--) {
        audioTrackList.removeTrack(audioTrackList[i]);
      }
      debugLog('Audio tracks cleaned up for new source');
    }
    
    // Clean up DASH-specific state
    const dash = player.dash;
    if (dash && dash.audioMapper) {
      delete dash.audioMapper;
      debugLog('DASH audio mapper cleaned up for new source');
    }
    
    // Reset previous resolution for qualitychanged events
    previousResolution = null;
  };

  // Update the QualityLevels list of renditions
  const populateLevels = (levels, abrType) => {
    // Clean up existing quality levels before adding new ones
    cleanupQualityLevels();
    
    let qualityLevels = player.qualityLevels;
    if (typeof qualityLevels === 'function') {
      qualityLevels = player.qualityLevels();
      debugLog('QualityLevels', qualityLevels);
      switch (abrType) {
        case 'hls':
          for (let l = 0; l < levels.length; l++) {
            let level = levels[l];
            let rendition = levelToRenditionHls(level);
            qualityLevels.addQualityLevel(rendition);
          }
          break;
        case 'dash': {
          // Set up audio mapping for DASH
          const dash = player.dash;
          if (!dash) break;
          const videoRates = levels;
          const audioRates = dash.mediaPlayer.getBitrateInfoListFor('audio') || [];
          const normalizeFactor = videoRates.length > 0 ? videoRates[videoRates.length - 1].bandwidth : 1;
          dash.audioMapper = videoRates.map((rate) =>
            Math.round((rate.bandwidth / normalizeFactor) * (audioRates.length - 1))
          );
          for (let l = 0; l < levels.length; l++) {
            let level = levels[l];
            let rendition = levelToRenditionDash(level);
            qualityLevels.addQualityLevel(rendition);
          }
          break;
        }
        default:
          return;
      }
    } else {
      console.warn('QualityLevels not supported');
    }
  };

  let previousResolution = null; // for qualitychanged event data

  // Update the selected rendition
  const populateQualityLevelsChange = currentLevel => {
    let qualityLevels = player.qualityLevels;
    if (typeof qualityLevels === 'function') {
      qualityLevels = player.qualityLevels();
      if (qualityLevels.length == 0) {
        console.warn('ERROR - no quality levels found! Patching populate levels first');
        var tech = player.tech({ IWillNotUseThisInPlugins: true });
        if (
          typeof tech.sourceHandler_ != 'undefined' &&
          typeof tech.sourceHandler_.hls != 'undefined' &&
          tech.sourceHandler_.hls != null
        ) {
          const hls = tech.sourceHandler_.hls;
          populateLevels(hls.levels, 'hls');
        }
      }
      qualityLevels.selectedIndex_ = currentLevel;
      qualityLevels.trigger({ type: 'change', selectedIndex: currentLevel });
    }
  };

  // Custom 'qualitychanged' event
  const populateQualityChangedEvent = currentLevel => {
    if (currentLevel < 0) {
      return;
    }

    let qualityLevels = player.qualityLevels;
    let level = null;
    // Using videojs-contrib-quality-levels
    if (typeof qualityLevels === 'function') {
      qualityLevels = player.qualityLevels();
      level = qualityLevels.levels_[currentLevel];
      debugLog('Custom qualitychanged', 'using videojs-contrib-quality-levels');
    } else {
      // hls.js directly
      var tech = player.tech({ IWillNotUseThisInPlugins: true });
      if (
        typeof tech.sourceHandler_ != 'undefined' &&
        typeof tech.sourceHandler_.hls != 'undefined' &&
        tech.sourceHandler_.hls != null
      ) {
        const hls = tech.sourceHandler_.hls;
        level = hls.levels[currentLevel];
        debugLog('Custom qualitychanged', 'using hls.js directly');
        if (currentLevel !== hls.currentLevel) {
          debugLog('ERROR - new level differs from hls.js');
        }
      } else {
        // dash.js directly
        var dash = player.dash;
        if (
          typeof dash != 'undefined' &&
          dash != null &&
          typeof dash.mediaPlayer != 'undefined' &&
          dash.mediaPlayer != null
        ) {
          let renditions = getRenditionsDash();
          level = renditions[currentLevel];
          debugLog('Custom qualitychanged', 'using dash.js directly');
        }
      }
    }

    // Add null check for level
    if (!level) {
      debugLog('Warning: Level is undefined in populateQualityChangedEvent', { currentLevel });
      return;
    }

    let currentRes = { width: level.width, height: level.height };
    if (previousResolution !== currentRes) {
      let data = {
        from: previousResolution,
        to: currentRes
      };
      // Trigger custom 'qualitychanged' event on videojs
      player.trigger({ type: 'qualitychanged', eventData: data });
    }
    previousResolution = currentRes;

    // Add detailed logging of current rendition
    debugLog('Current Rendition', {
      index: currentLevel,
      resolution: `${level.width}x${level.height}`,
      bitrate: `${Math.round(level.bitrate / 1000)} kbps`,
      url: Array.isArray(level.url) ? level.url[level.urlId] : level.url,
      details: level
    });
  };

  const debugLog = (label, data) => {
    if (options.debug) {
      console.log(
        `%c ${label}`,
        'background: #3498db; color: white; padding: 2px 4px; border-radius: 2px;',
        data
      );
    }
  };

  const logAudioTrackInfo = () => {
    var tech = player.tech({ IWillNotUseThisInPlugins: true });
    if (
      typeof tech.sourceHandler_ != 'undefined' &&
      typeof tech.sourceHandler_.hls != 'undefined' &&
      tech.sourceHandler_.hls != null
    ) {
      const hls = tech.sourceHandler_.hls;
      const audioTrackId = hls.audioTrack;
      const len = hls.audioTracks.length;

      for (let i = 0; i < len; i++) {
        if (audioTrackId === i) {
          debugLog(`audio track [${i}] ${hls.audioTracks[i].name} - enabled`, hls.audioTracks[i]);
        } else {
          debugLog(`audio track [${i}] ${hls.audioTracks[i].name} - disabled`, hls.audioTracks[i]);
        }
      }
    }
  };

  // Helper to synchronise Video.js AudioTrackList with hls.js active track
  const updateVjsAudioTracksEnabled = activeIndex => {
    const list = player.audioTracks();
    if (!list) return;
    for (let i = 0; i < list.length; i++) {
      list[i].enabled = i === activeIndex;
    }
    // Sync complete – log for debug
    logAudioTrackInfo();
  };

  // Flush buffered audio by performing a tiny seek outside current range
  const flushBufferedAudio = () => {
    try {
      const cur = player.currentTime();
      const delta = 0.5; // 500 ms gap to escape current buffer
      const target = Math.min(cur + delta, player.duration() - 0.1);
      player.currentTime(target);
      player.currentTime(cur);
    } catch (e) {
      debugLog('Error while flushing buffered audio', e);
    }
  };

  // Force hls.js to switch track and immediately start loading fragments for it
  const selectAudioTrack = index => {
    var tech = player.tech({ IWillNotUseThisInPlugins: true });
    if (
      typeof tech.sourceHandler_ != 'undefined' &&
      typeof tech.sourceHandler_.hls != 'undefined' &&
      tech.sourceHandler_.hls != null
    ) {
      const hls = tech.sourceHandler_.hls;
      if (hls.audioTrack === index) {
        return;
      }
      hls.audioTrack = index;
      // Quickly restart loading to fill the buffer of the new audio group
      if (hls.media) {
        try {
          hls.stopLoad();
          hls.startLoad(0);
        } catch (e) {
          debugLog('Error while reloading after audioTrack switch', e);
        }
      }

      logAudioTrackInfo();
      // will flush once switch is confirmed (AUDIO_TRACK_SWITCHED)
      hls.once(Hls.Events.AUDIO_TRACK_SWITCHED, () => {
        flushBufferedAudio();
      });
    }
  };

  // Audio track handling
  const addAudioTrackVideojs = (track, hls) => {
    const vjsTrack = new videojs.AudioTrack({
      id: `${track.type}-id_${track.id}-groupId_${track.groupId}-${track.name}`,
      kind: 'translation',
      label: track.name,
      language: track.lang,
      enabled: hls.audioTrack === hls.audioTracks.indexOf(track),
      default: track.default
    });

    // Add the track to the player's audio track list.
    player.audioTracks().addTrack(vjsTrack);
  };

  const initAudioTrackInfo = () => {
    var tech = player.tech({ IWillNotUseThisInPlugins: true });
    if (
      typeof tech.sourceHandler_ != 'undefined' &&
      typeof tech.sourceHandler_.hls != 'undefined' &&
      tech.sourceHandler_.hls != null
    ) {
      const hls = tech.sourceHandler_.hls;
      const len = hls.audioTracks.length;
      for (let i = 0; i < len; i++) {
        addAudioTrackVideojs(hls.audioTracks[i], hls);
      }
    }

    // Listen to the "change" event.
    var audioTrackList = player.audioTracks();
    audioTrackList.addEventListener('change', function () {
      var tech = player.tech({ IWillNotUseThisInPlugins: true });
      if (
        typeof tech.sourceHandler_ != 'undefined' &&
        typeof tech.sourceHandler_.hls != 'undefined' &&
        tech.sourceHandler_.hls != null
      ) {
        for (var i = 0; i < audioTrackList.length; i++) {
          var track = audioTrackList[i];
          if (track.enabled) {
            selectAudioTrack(i);
            return;
          }
        }
      }
    });
  };

  // Map hls.js events to QualityLevels
  const initQualityLevels = () => {
    var tech = player.tech({ IWillNotUseThisInPlugins: true });
    if (typeof tech == 'undefined') {
      console.warn('ERROR - tech not found!');
    }

    // HLS
    if (
      typeof tech.sourceHandler_ != 'undefined' &&
      typeof tech.sourceHandler_.hls != 'undefined' &&
      tech.sourceHandler_.hls != null
    ) {
      const hls = tech.sourceHandler_.hls;
      
      const manifestLoadedHandler = (eventName, data) => {
        debugLog(`HLS event: ${eventName}`, data);
        populateLevels(hls.levels, 'hls');
        initAudioTrackInfo();
        hls.off(Hls.Events.MANIFEST_LOADED, manifestLoadedHandler);
      };

      // If manifest is already loaded, populate levels immediately.
      if (hls.levels && hls.levels.length > 0) {
        manifestLoadedHandler('MANUAL_MANIFEST_LOADED', {});
      } else {
        hls.on(Hls.Events.MANIFEST_LOADED, manifestLoadedHandler);
      }

      hls.on(Hls.Events.LEVEL_SWITCHED, (eventName, data) => {
        debugLog(`HLS event: ${eventName}`, data);
        populateQualityLevelsChange(data.level);
        populateQualityChangedEvent(data.level);
      });

      hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (eventName, data) => {
        debugLog(`HLS event: ${eventName}`, data);
        // Make sure Video.js AudioTracks reflect the newly-selected HLS track
        if (typeof data.id !== 'undefined') {
          updateVjsAudioTracksEnabled(data.id);
        }
        // Ensure buffer flushed when switch originates from hls.js (e.g. default track)
        flushBufferedAudio();
      });

      hls.on(Hls.Events.ERROR, (eventName, data) => {
        debugLog(`HLS event: ${eventName}`, data);
        if (data.fatal) {
          player.error({
            code: 4, // MEDIA_ERR_SRC_NOT_SUPPORTED will trigger Utils.handleCldError
            ...data
          });
        }
      });
    } else {
      // DASH
      var dash = player.dash;
      if (
        typeof dash != 'undefined' &&
        dash != null &&
        typeof dash.mediaPlayer != 'undefined' &&
        dash.mediaPlayer != null
      ) {
        let renditions = getRenditionsDash();
        populateLevels(renditions, 'dash');
        
        dash.mediaPlayer.on('qualityChangeRendered', evt => {
          const currentVideoQuality = dash.mediaPlayer.getQualityFor('video');
          const availableQualities = dash.mediaPlayer.getBitrateInfoListFor('video');
          const currentQualityInfo = availableQualities[currentVideoQuality];
          const renditionIndex = findDashQualityIndex(currentQualityInfo.width, currentQualityInfo.height);
          if (renditionIndex >= 0) {
            debugLog(`DASH event: ${evt.type}`, evt, renditions[renditionIndex]);
            populateQualityLevelsChange(renditionIndex);
            populateQualityChangedEvent(renditionIndex);
          } else {
            console.warn('Could not find matching rendition for DASH quality change');
          }
        });
      }
    }
  };

  return {
    init: initQualityLevels
  };
};

export { qualityLevels };
