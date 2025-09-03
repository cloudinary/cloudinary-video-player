import { utf8ToBase64 } from '../../utils/utf8Base64';
import { getCloudinaryUrlPrefix } from '../cloudinary/common';
import { transcriptParser } from './parsers/transcriptParser';
import { srtParser } from './parsers/srtParser';
import { vttParser } from './parsers/vttParser';
import { addTextTrackCues, fetchFileContent, refreshTextTrack, removeAllTextTrackCues } from './utils';

const getTranscriptionFileUrl = (urlPrefix, deliveryType, publicId, languageCode = null) =>
  `${urlPrefix}/_applet_/video_service/transcription/${deliveryType}/${languageCode ? `${languageCode}/` : ''}${utf8ToBase64(publicId)}.transcript`;

function textTracksManager() {
  const player = this;
  const textTracksData = new WeakMap();
  let activeTrack = null;

  const removeAllTextTracks = () => {
    const currentTracks = player.remoteTextTracks();
    if (currentTracks) {
      for (let i = currentTracks.tracks_.length - 1; i >= 0; i--) {
        player.removeRemoteTextTrack(currentTracks.tracks_[i]);
      }
    }
  };

  const createTextTrackData = (textTrack, loadMethod) => {
    const controller = new AbortController();
    textTracksData.set(textTrack, {
      status: 'idle',
      load: async () => {
        const { status } = textTracksData.get(textTrack);
        if (status === 'idle') {
          await loadMethod(controller.signal);
          refreshTextTrack(textTrack);
        }
      },
      abortLoading: () => {
        const { status } = textTracksData.get(textTrack);
        if (status === 'pending') {
          controller.abort();
        }
      },
    });
  };

  const updateTextTrackData = (textTrack, dataToUpdate) => {
    const existingData = textTracksData.get(textTrack);
    textTracksData.set(textTrack, {
      ...existingData,
      ...dataToUpdate,
    });
  };
  const updateTextTrackStatusToPending = (textTrack) => updateTextTrackData(textTrack, { status: 'pending' });
  const updateTextTrackStatusToSuccess = (textTrack) => updateTextTrackData(textTrack, { status: 'success' });
  const updateTextTrackStatusToError = (textTrack, error) => updateTextTrackData(textTrack, { status: 'error', error });
  const updateTextTrackStatusToApplied = (textTrack) => updateTextTrackData(textTrack, { status: 'applied' });

  const addTextTrack = (type, config) => {
    const {
      kind = type === 'transcript' ? 'captions' : 'subtitles',
      label = type === 'transcript' ? 'Captions' : 'Subtitles',
      default: isDefault,
      srclang,
      src,
    } = config;

    if (type === 'transcript') {
      player.textTrackDisplay.el().classList.add('cld-paced-text-tracks');
    }

    const { track } = player.addRemoteTextTrack({
      kind,
      label,
      srclang,
      default: isDefault,
      mode: isDefault ? 'showing' : 'disabled',
    });

    const createParser = () => {
      if (type === 'srt') return srtParser;
      if (type === 'vtt') return vttParser;
      return (text) => transcriptParser(text, {
        maxWords: config.maxWords,
        wordHighlight: config.wordHighlight,
        timeOffset: config.timeOffset ?? 0,
      });
    };

    const createSourceUrl = () => {
      if (src) return src;
      if (type !== 'transcript') return undefined;

      const source = player.cloudinary.source();
      const publicId = source.publicId();
      const deliveryType = source.resourceConfig().type;
      const urlPrefix = getCloudinaryUrlPrefix(player.cloudinary.cloudinaryConfig());
      const baseUrl = getTranscriptionFileUrl(urlPrefix, deliveryType, publicId);
      const localizedUrl = srclang ? getTranscriptionFileUrl(urlPrefix, deliveryType, publicId, srclang) : null;

      return localizedUrl ? localizedUrl : baseUrl;
    };

    createTextTrackData(track, async (signal) => {
      updateTextTrackStatusToPending(track);

      const sourceUrl = createSourceUrl();
      const response = await fetchFileContent(
        sourceUrl,
        {
          signal,
          polling: type === 'transcript' && !src,
          interval: 2000,
          maxAttempts: 10,
          responseStatusAsPending: 202,
          onSuccess: () => updateTextTrackStatusToSuccess(track),
          onError: (error) => {
            updateTextTrackStatusToError(track, error);
            console.warn(`[${track.label}] Text track could not be loaded`);
          },

        }
      );

      if (response) {
        const parser = createParser();
        const data = await parser(response);
        removeAllTextTrackCues(track);
        addTextTrackCues(track, data);
        updateTextTrackStatusToApplied(track);
      }
    });
  };


  const addTextTracks = (textTracks) => {
    textTracks.forEach(textTrackConfig => {
      if (textTrackConfig.src && textTrackConfig.src.endsWith('.vtt')) {
        addTextTrack('vtt', textTrackConfig);
      } else if (textTrackConfig.src && textTrackConfig.src.endsWith('.srt')) {
        addTextTrack('srt', textTrackConfig);
      } else if (!textTrackConfig.src || textTrackConfig.src.endsWith('.transcript')) {
        addTextTrack('transcript', textTrackConfig);
      }
    });

    const defaultTextTrack = Array.from(player.remoteTextTracks()).find((textTrack) => textTrack.default);
    if (defaultTextTrack) {
      onChangeActiveTrack(defaultTextTrack);
    }
  };

  const onChangeActiveTrack = (textTrack) => {
    const prevActiveTrack = activeTrack;
    activeTrack = textTrack;

    const prevTextTrackData = textTracksData.get(prevActiveTrack);
    if (prevTextTrackData) {
      prevTextTrackData.abortLoading();
    }

    const selectedTextTrackData = textTracksData.get(activeTrack);
    if (selectedTextTrackData) {
      selectedTextTrackData.load();
    }
  };

  player.on('texttrackchange', () => {
    const textTracks = player.textTracks();
    let newActiveTrack = null;

    for (let i = 0; i < textTracks.length; i++) {
      const track = textTracks[i];

      if (track.mode === 'showing') {
        newActiveTrack = track;
        break;
      }
    }

    if (activeTrack !== newActiveTrack) {
      onChangeActiveTrack(newActiveTrack);
    }
  });

  return {
    removeAllTextTracks,
    addTextTracks: (...args) => {
      player.one('loadedmetadata', () => {
        addTextTracks(...args);
      });
    },
  };
}

export default textTracksManager;
