import videojs from 'video.js';
import Hls from 'hls.js';

const qualityLevels = (player, options) => {
  console.log('qualityLevels', player, options);

  const levelToRenditionHls = level => {
    let levelUrl =
      Array.isArray(level.url) && level.url.length > 1 ? level.url[level.urlId] : level.url;
    let rendition = {
      id: levelUrl,
      width: level.width,
      height: level.height,
      bandwidth: level.bitrate, // documentation bug (bitrate: )
      frameRate: 0,
      enabled: enableRendition => {
        var tech = player.tech({ IWillNotUseThisInPlugins: true });
        if (
          typeof tech.sourceHandler_ != 'undefined' &&
          typeof tech.sourceHandler_.hls != 'undefined' &&
          tech.sourceHandler_.hls != null
        ) {
          const hls = tech.sourceHandler_.hls;
          // Find the level index that matches this rendition
          const levelIndex = hls.levels.findIndex(l => 
            (Array.isArray(l.url) && l.url.length > 1 ? l.url[l.urlId] : l.url) === levelUrl
          );
          
          if (levelIndex >= 0) {
            if (enableRendition) {
              console.log('Setting HLS quality level to:', levelIndex, 'for rendition:', levelUrl);
              hls.currentLevel = levelIndex;
            } else if (hls.autoLevelEnabled) {
              // If disabling and auto level is enabled, don't do anything
              console.log('Ignoring disable request for rendition when auto level is enabled');
            } else {
              // If disabling the current rendition, switch to auto level
              if (hls.currentLevel === levelIndex) {
                console.log('Switching to auto level selection');
                hls.currentLevel = -1; // -1 means auto level
              }
            }
          } else {
            console.warn('Could not find matching level for rendition:', levelUrl);
          }
        }
        return enableRendition;
      }
    };
    return rendition;
  };

  const levelToRenditionDash = level => {
    let rendition = {
      id: level.id,
      width: level.width,
      height: level.height,
      bandwidth: level.bandwidth,
      frameRate: level.frameRate,
      enabled: enableRendition => {
        var dash = player.dash;
        if (
          typeof dash != 'undefined' &&
          dash != null &&
          typeof dash.mediaPlayer != 'undefined' &&
          dash.mediaPlayer != null
        ) {
          if (enableRendition) {
            console.log('Setting DASH quality level to:', level.id);
            // Disable auto bitrate switching first
            dash.mediaPlayer.updateSettings({
              streaming: {
                abr: {
                  autoSwitchBitrate: { video: false }
                }
              }
            });
            // Set quality for the specific stream (usually 0 for video)
            dash.mediaPlayer.setQualityFor('video', parseInt(level.id, 10));
          } else {
            const settings = dash.mediaPlayer.getSettings();
            const isAutoSwitchEnabled = settings?.streaming?.abr?.autoSwitchBitrate?.video;
            
            if (isAutoSwitchEnabled) {
              // If disabling and auto switch is enabled, don't do anything
              console.log('Ignoring disable request for rendition when auto quality is enabled');
            } else {
              // If disabling the current rendition, switch to auto quality
              const currentQuality = dash.mediaPlayer.getQualityFor('video');
              if (currentQuality === parseInt(level.id, 10)) {
                console.log('Switching to auto quality selection');
                dash.mediaPlayer.updateSettings({
                  streaming: {
                    abr: {
                      autoSwitchBitrate: { video: true }
                    }
                  }
                });
              }
            }
          }
        }
        return enableRendition;
      }
    };
    return rendition;
  };

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
        //console.log("adaptation = ", adaptation.Representation_asArray)
      }
      return adaptation.Representation_asArray;
    }
    return [];
  };

  // const sortHLSLevels = (levels)=>{
  //     const videoRangeOrder = { "HLG": 1, "PQ": 2, "SDR": 3 };

  //     return [...levels].sort((a, b) => {  // Creates a new sorted array
  //         if (b.bitrate !== a.bitrate) return b.bitrate - a.bitrate;
  //         if (b.width !== a.width) return b.width - a.width;
  //         if (b.height !== a.height) return b.height - a.height;
  //         const rangeA = videoRangeOrder[a.attrs["VIDEO-RANGE"]] || 4;
  //         const rangeB = videoRangeOrder[b.attrs["VIDEO-RANGE"]] || 4;
  //         return rangeA - rangeB;  // Lower number = higher priority
  //     });
  // }

  // update the QualityLevels list of renditions
  // TODO: populate audio levels
  const populateLevels = (levels, abrType) => {
    let qualityLevels = player.qualityLevels;
    if (typeof qualityLevels === 'function') {
      qualityLevels = player.qualityLevels();
      console.warn('populate levels = ', levels);
      switch (abrType) {
        case 'hls':
          for (let l = 0; l < levels.length; l++) {
            let level = levels[l];
            let rendition = levelToRenditionHls(level);
            qualityLevels.addQualityLevel(rendition);
            //console.log("adding rendition = ", rendition)
          }
          break;
        case 'dash':
          // TODO: support HDR
          for (let l = 0; l < levels.length; l++) {
            let level = levels[l];
            let rendition = levelToRenditionDash(level);
            qualityLevels.addQualityLevel(rendition);
            //console.log("adding rendition = ", rendition)
          }
          break;
        default:
          return;
      }
    } else {
      console.warn('QualityLevels not supported');
    }
  };

  let previousResolution = null; // for qualitychanged event data

  // update the selected rendition
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

  // custom 'qualitychanged' event
  const populateQualityChangedEvent = currentLevel => {
    if (currentLevel < 0) {
      return;
    }

    let qualityLevels = player.qualityLevels;
    let level = null;
    // using using videojs-contrib-quality-levels
    if (typeof qualityLevels === 'function') {
      qualityLevels = player.qualityLevels();
      level = qualityLevels.levels_[currentLevel];
      console.log('custom qualitychanged using videojs-contrib-quality-levels');
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
        console.log('level = ', level);
        console.log('custom qualitychanged using hls.js directly');
        if (currentLevel !== hls.currentLevel)
          console.log('ERROR - new level differs from hls.js !!!');
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
        }
      }
    }

    console.log('DEBUG ql=', qualityLevels, 'cl=', currentLevel, 'level=', level);
    let currentRes = { width: level.width, height: level.height };
    if (previousResolution !== currentRes) {
      let data = {
        from: previousResolution,
        to: currentRes
      };
      player.trigger({ type: 'qualitychanged', eventData: data }); // Generate custom 'qualitychanged' event on videojs
    }
    previousResolution = currentRes;
    
    // Add detailed logging of current rendition
    logCurrentRendition();
  };

  const logCurrentRendition = () => {
    let tech = player.tech({ IWillNotUseThisInPlugins: true });
    if (
      typeof tech.sourceHandler_ != 'undefined' &&
      typeof tech.sourceHandler_.hls != 'undefined' &&
      tech.sourceHandler_.hls != null
    ) {
      // HLS playback
      const hls = tech.sourceHandler_.hls;
      const currentLevel = hls.currentLevel;
      
      if (currentLevel >= 0 && currentLevel < hls.levels.length) {
        const level = hls.levels[currentLevel];
        console.log('%c Current HLS Rendition', 'background: #3498db; color: white; padding: 2px 4px; border-radius: 2px;', {
          index: currentLevel,
          resolution: `${level.width}x${level.height}`,
          bitrate: `${Math.round(level.bitrate / 1000)} kbps`,
          url: Array.isArray(level.url) ? level.url[level.urlId] : level.url,
          details: level
        });
      } else if (currentLevel === -1) {
        console.log('%c HLS Auto Level Mode', 'background: #2ecc71; color: white; padding: 2px 4px; border-radius: 2px;', {
          currentLevel: hls.currentLevel,
          levels: hls.levels.length
        });
      }
    } else {
      // Check for DASH playback
      var dash = player.dash;
      if (
        typeof dash != 'undefined' &&
        dash != null &&
        typeof dash.mediaPlayer != 'undefined' &&
        dash.mediaPlayer != null
      ) {
        const currentQuality = dash.mediaPlayer.getQualityFor('video');
        const renditions = getRenditionsDash();
        const settings = dash.mediaPlayer.getSettings();
        const isAutoMode = settings?.streaming?.abr?.autoSwitchBitrate?.video;
        
        if (currentQuality >= 0 && currentQuality < renditions.length) {
          const rendition = renditions[currentQuality];
          console.log('%c Current DASH Rendition', 'background: #9b59b6; color: white; padding: 2px 4px; border-radius: 2px;', {
            index: currentQuality,
            resolution: `${rendition.width}x${rendition.height}`,
            bandwidth: `${Math.round(rendition.bandwidth / 1000)} kbps`,
            frameRate: rendition.frameRate,
            autoMode: isAutoMode,
            details: rendition
          });
        } else if (isAutoMode) {
          console.log('%c DASH Auto Quality Mode', 'background: #2ecc71; color: white; padding: 2px 4px; border-radius: 2px;');
        }
      }
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
          console.log(`audio track [${i}] ${hls.audioTracks[i].name} - enabled`);
        } else {
          console.log(`audio track [${i}] ${hls.audioTracks[i].name} - disabled`);
        }
      }
    }
  };

  const addAudioTrackVideojs = track => {
    var vjsTrack = new videojs.AudioTrack({
      id: `${track.type}-id_${track.id}-groupId_${track.groupId}-${track.name}`,
      kind: 'translation',
      label: track.name,
      language: track.lang,
      enabled: track.enabled,
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
        addAudioTrackVideojs(hls.audioTracks[i]);
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
        const hls = tech.sourceHandler_.hls;
        for (var i = 0; i < audioTrackList.length; i++) {
          var track = audioTrackList[i];
          if (track.enabled) {
            hls.audioTrack = i;
            //console.log("Player video js to hls track = ", track.label, "idx=", i);
            return;
          }
        }
      }
    });
  };

  // map hls.js events to QualityLevels
  // note: should run before setting source
  const initQualityLevels = () => {
    console.warn('DEBUG - initQualityLevels()');

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
      hls.on(Hls.Events.MANIFEST_LOADED, (eventName, data) => {
        console.warn('hls event = ', eventName, 'Data =', data);
        //console.log("hls levels = ", hls.levels);
        // event data returns the manifest levels as in main manifest
        // we want to get the levels according to the order in hls.levels
        //populateLevels(data.levels, "hls")
        populateLevels(hls.levels, 'hls');
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (eventName, data) => {
        console.log('hls event = ', eventName, 'Data =', data);
        //console.log("hls current level=", hls.currentLevel)
        //console.log("hls next level=", hls.nextLevel)
        populateQualityLevelsChange(data.level);
        populateQualityChangedEvent(data.level);
      });

      hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, (eventName, data) => {
        console.log('No of audio tracks found: ' + data.audioTracks.length);
        initAudioTrackInfo();
      });

      hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (eventName, data) => {
        console.log('hls event = ', eventName, 'Data =', data);
        logAudioTrackInfo();
      });

      console.log('HLS config = ', hls.config);

      hls.on(Hls.Events.ERROR, (eventName, data) => {
        console.log('hls event = ', eventName, 'Data =', data);
        if (data.fatal) {
          console.log('triggering error');
          player.trigger({ type: 'error', eventData: data });
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
        //console.log("populate DASH = ", dash)

        let renditions = getRenditionsDash();
        populateLevels(renditions, 'dash');

        dash.mediaPlayer.on('qualityChangeRendered', evt => {
          //console.log("DASH qualityChangeRendered evt =", evt)
          //console.log("DASH level=", evt.newQuality)
          populateQualityLevelsChange(evt.newQuality);
          populateQualityChangedEvent(evt.newQuality);
        });
      }
    }
  };

  return {
    init: initQualityLevels
  };
};

export { qualityLevels };
