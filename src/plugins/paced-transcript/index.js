import { getCloudinaryUrl, extendCloudinaryConfig } from 'plugins/cloudinary/common';

function pacedTranscript(config) {
  const player = this;
  const source = player.cloudinary.source();
  const baseUrl = getCloudinaryUrl(
    source.publicId(),
    extendCloudinaryConfig(player.cloudinary.cloudinaryConfig(), { resource_type: 'raw' })
  );

  const options = {
    kind: config.kind || 'captions',
    label: config.label || 'Captions',
    default: config.default,
    srclang: config.srclang || 'en',
    src: config.src || baseUrl + (config.srclang ? '.' + config.srclang : '') + '.transcript',
    fallbackSrc: config.src || baseUrl + '.transcript',
    maxWords: config.maxWords,
    wordHighlight: config.wordHighlight,
    timeOffset: config.timeOffset || 0
  };

  const classNames = player.textTrackDisplay.el().classList;
  classNames.add('cld-paced-text-tracks');

  // Load the transcription file
  const initTranscript = async () => {
    let transcriptResponse;
    try {
      transcriptResponse = await fetch(options.src);
      if (!transcriptResponse.ok) {
        throw new Error(`loading transcription from ${options.src} failed, trying fallback URL`);
      }
    } catch (error) {
      console.error(error);
      transcriptResponse = await fetch(options.fallbackSrc);
    }
    if (!transcriptResponse.ok) return;
    const transcriptData = await transcriptResponse.json();
    const captions = parseTranscript(transcriptData);

    const captionsTrack = player.addRemoteTextTrack({
      kind: options.kind,
      label: options.label,
      srclang: options.srclang,
      default: options.default,
      mode: options.default ? 'showing' : 'disabled'
    });

    // required for Safari to display the captions
    // https://github.com/videojs/video.js/issues/8519
    await new Promise(resolve => setTimeout(resolve, 100));

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
    });

    return captions;
  };

  player.one('loadedmetadata', () => {
    initTranscript();
  });
}

export default pacedTranscript;
