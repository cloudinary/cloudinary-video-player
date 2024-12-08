import { getCloudinaryUrl, extendCloudinaryConfig } from 'plugins/cloudinary/common';

const fallbackFetch = async (url, fallback) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed fetching from ${url} with status code ${response.status}`);
    }
    return response;
  } catch (error) {
    console.error(error);
    if (fallback) {
      return fallbackFetch(fallback);
    }
  }
};

function pacedTranscript(config) {
  const player = this;

  const options = {
    kind: config.kind || 'captions',
    label: config.label || 'Captions',
    default: config.default,
    srclang: config.srclang,
    src: config.src,
    maxWords: config.maxWords,
    wordHighlight: config.wordHighlight,
    timeOffset: config.timeOffset || 0
  };

  const classNames = player.textTrackDisplay.el().classList;
  classNames.add('cld-paced-text-tracks');

  // Load the transcription file
  const initTranscript = async () => {

    let transcriptResponse;
    if (options.src) {
      // Fetch from src, if explicitly provided
      transcriptResponse = await fallbackFetch(options.src);
    } else {
      // If not, and provided language, try fetching translated transcript, fallback to base transcript
      const source = player.cloudinary.source();
      const basePath = getCloudinaryUrl(
        source.publicId(),
        extendCloudinaryConfig(player.cloudinary.cloudinaryConfig(), { resource_type: 'raw' })
      );
      if (options.srclang) {
        transcriptResponse = await fallbackFetch(`${basePath}.${options.srclang}.transcript`, `${basePath}.transcript`);
      } else {
        transcriptResponse = await fallbackFetch(`${basePath}.transcript`);
      }
    }
    if (!transcriptResponse?.ok) return;
    const transcriptData = await transcriptResponse.json();
    const captions = parseTranscript(transcriptData);

    const captionsTrack = player.addRemoteTextTrack({
      kind: options.kind,
      label: options.label,
      srclang: options.srclang,
      default: options.default,
      mode: options.default ? 'showing' : 'disabled'
    });

    captions.forEach(caption => {
      captionsTrack.track.addCue(new VTTCue(caption.startTime, caption.endTime, caption.text));
    });
  };

  // Generate captions from the transcription data
  const parseTranscript = transcriptionData => {
    const captions = [];

    const addCaption = ({ startTime, endTime, text }) => {
      captions.push({
        startTime: startTime + options.timeOffset,
        endTime: endTime + options.timeOffset,
        text
      });
    };

    transcriptionData.forEach(segment => {
      const words = segment.words;

      if (words) {
        const maxWords = options.maxWords || words.length;
        for (let i = 0; i < words.length; i += maxWords) {
          if (options.wordHighlight) {
            // Create a caption for every word, in which the current word is highlighted
            words.slice(i, Math.min(i + maxWords, words.length)).forEach((word, idx) => {
              addCaption({
                startTime: word.start_time,
                endTime: word.end_time,
                text: words
                  .slice(i, i + maxWords)
                  .map(w => (w === word ? `<b>${w.word}</b>` : w.word))
                  .join(' ')
              });

              // if we haven't reached the end of the words array, and there's a gap between the current word end_time and the next word start_time, add a non-highlighted caption to fill the gap
              if (words[idx + 1] && word.end_time < words[idx + 1].start_time) {
                addCaption({
                  startTime: word.end_time,
                  endTime: words[idx + 1].start_time,
                  text: words
                    .slice(i, i + maxWords)
                    .map(word => word.word)
                    .join(' ')
                });
              }
            });
          } else {
            captions.push({
              startTime: words[i].start_time,
              endTime: words[Math.min(i + maxWords - 1, words.length - 1)].end_time,
              text: words
                .slice(i, i + maxWords)
                .map(word => word.word)
                .join(' ')
            });
          }
        }
      } else {
        addCaption({
          startTime: segment.start_time,
          endTime: segment.end_time,
          text: segment.transcript
        });
      }
    });

    return captions;
  };

  player.one('loadedmetadata', () => {
    initTranscript();
  });
}

export default pacedTranscript;
