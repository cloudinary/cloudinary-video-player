import { utf8ToBase64 } from '../../utils/utf8Base64';
import { getCloudinaryUrlPrefix } from '../cloudinary/common';
import { transcriptParser } from './parsers/transcriptParser';
import { srtParser } from './parsers/srtParser';
import { addTextTrackCues, fetchFileContent, refreshTextTrack, removeAllTextTrackCues } from './utils';
import { appendQueryParams } from '../../utils/querystring';
import { toCredentialedBlobUrl, revokeBlobUrls } from '../../utils/credentialed-blob-url';

const getTranscriptionFileUrl = (urlPrefix, deliveryType, publicId, languageCode = null) =>
  `${urlPrefix}/_applet_/video_service/transcription/${deliveryType}/${languageCode ? `${languageCode}/` : ''}${utf8ToBase64(publicId)}.transcript`;

function textTracksManager() {
  const player = this;
  const textTracksData = new WeakMap();
  const blobUrls = new Set();
  let showingTracks = new Set();
  let generation = 0;

  const removeAllTextTracks = () => {
    generation++;
    revokeBlobUrls(blobUrls);
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

  const addNativeVttTrack = (config) => {
    const {
      kind = 'subtitles',
      label = 'Subtitles',
      default: isDefault,
      srclang,
      src,
    } = config;

    player.addRemoteTextTrack({
      kind,
      label,
      srclang,
      src,
      default: isDefault,
      mode: isDefault ? 'showing' : 'disabled',
    });
  };

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
      const queryParams = source.queryParams();
      const baseUrl = appendQueryParams(getTranscriptionFileUrl(urlPrefix, deliveryType, publicId), queryParams);
      const localizedUrl = srclang ? appendQueryParams(getTranscriptionFileUrl(urlPrefix, deliveryType, publicId, srclang), queryParams) : null;

      return localizedUrl ? localizedUrl : baseUrl;
    };

    createTextTrackData(track, async (signal) => {
      updateTextTrackStatusToPending(track);

      const sourceUrl = createSourceUrl();
      const response = await fetchFileContent(
        sourceUrl,
        {
          signal,
          credentials: player.cloudinary.source?.().withCredentials ? 'include' : 'omit',
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


  const isNativeVtt = (textTrackConfig) => textTrackConfig.src && textTrackConfig.src.endsWith('.vtt');

  const addResolvedTextTracks = (textTracks, nativeVttSrcs) => {
    textTracks.forEach((textTrackConfig, index) => {
      if (isNativeVtt(textTrackConfig)) {
        addNativeVttTrack({ ...textTrackConfig, src: nativeVttSrcs[index] });
      } else if (textTrackConfig.src && textTrackConfig.src.endsWith('.srt')) {
        addTextTrack('srt', textTrackConfig);
      } else if (!textTrackConfig.src || textTrackConfig.src.endsWith('.transcript')) {
        addTextTrack('transcript', textTrackConfig);
      }
    });

    syncShowingTracks();
  };

  // Credentialed VTT files are fetched up front, in parallel, so Video.js loads them from
  // same-origin Blob URLs. Tracks are added only once all are resolved to keep their order,
  // and skipped when the source changed meanwhile.
  const addTextTracks = (textTracks) => {
    const withCredentials = player.cloudinary.source?.().withCredentials;
    if (!withCredentials || !textTracks.some(isNativeVtt)) {
      addResolvedTextTracks(textTracks, textTracks.map((textTrackConfig) => textTrackConfig.src));
      return;
    }

    const currentGeneration = generation;
    const pendingBlobUrls = new Set();
    Promise.all(textTracks.map((textTrackConfig) => (
      isNativeVtt(textTrackConfig) ? toCredentialedBlobUrl(textTrackConfig.src, pendingBlobUrls) : textTrackConfig.src
    ))).then((srcs) => {
      if (currentGeneration !== generation) {
        revokeBlobUrls(pendingBlobUrls);
        return;
      }
      pendingBlobUrls.forEach((blobUrl) => blobUrls.add(blobUrl));
      addResolvedTextTracks(textTracks, srcs);
    });
  };

  // Several tracks can show at once (e.g. descriptions + captions), so each one needs its cues loaded
  const syncShowingTracks = () => {
    const textTracks = Array.from(player.textTracks());
    // texttrackchange can fire inside addRemoteTextTrack, before the track's data exists - skip it until then
    const nowShowing = new Set(textTracks.filter((track) => track.mode === 'showing' && textTracksData.has(track)));

    showingTracks.forEach((track) => {
      if (!nowShowing.has(track)) {
        textTracksData.get(track)?.abortLoading();
      }
    });

    nowShowing.forEach((track) => {
      if (!showingTracks.has(track)) {
        textTracksData.get(track)?.load();
      }
    });

    showingTracks = nowShowing;
  };

  player.on('texttrackchange', syncShowingTracks);

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
