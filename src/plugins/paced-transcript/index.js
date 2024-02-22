import { getCloudinaryUrl, extendCloudinaryConfig } from 'plugins/cloudinary/common';

function pacedTranscript(config) {
  const player = this;
  const source = player.cloudinary.source();

  const options = {
    kind: config.kind || 'captions',
    label: config.label || 'Captions',
    default: config.default,
    srclang: config.srclang || 'en',
    src: config.src || getCloudinaryUrl(
      source.publicId(),
      extendCloudinaryConfig(player.cloudinary.cloudinaryConfig(), { resource_type: 'raw' }),
    ) + '.transcript',
    maxWords: config.maxWords || 5, // Number of words per caption
    wordHighlight: config.wordHighlight
  };

  // Load the transcription file
  const initTranscript = async () => {
    try {
      const transcriptResponse = await fetch(options.src);
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

    } catch (error) {
      console.error('Error loading transcription file:', error);
    }
  };

  // Generate captions from the transcription data
  const parseTranscript = transcriptionData => {
    const captions = [];

    const wordHighlight = options.wordHighlight;

    transcriptionData.forEach(segment => {
      const words = segment.words;
      const maxWords = options.maxWords || words.length;

      for (let i = 0; i < words.length; i += maxWords) {
        if (wordHighlight) {
          // Create a caption for every word, in which the current word is highlighted
          const slicedWords = words.slice(i, Math.min(i + maxWords, words.length));
          slicedWords.forEach(word => {
            const captionText = words
              .slice(i, i + maxWords)
              .map(w => (w === word ? `<b>${w.word}</b>` : w.word))
              .join(' ');

            captions.push({
              startTime: word.start_time,
              endTime: word.end_time,
              text: captionText
            });
          });
        } else {
          const startTime = words[i].start_time;
          const endTime = words[Math.min(i + maxWords - 1, words.length - 1)].end_time;

          const captionText = words
            .slice(i, i + maxWords)
            .map(word => word.word)
            .join(' ');

          captions.push({
            startTime: startTime,
            endTime: endTime,
            text: captionText
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
