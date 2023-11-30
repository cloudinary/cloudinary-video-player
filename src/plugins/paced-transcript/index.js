import { getCloudinaryUrl, extendCloudinaryConfig } from 'plugins/cloudinary/common';

function pacedTranscript(config) {
  const player = this;
  const source = player.cloudinary.source();

  const options = {
    transcriptPath: config.transcriptPath || getCloudinaryUrl(
      source.publicId(),
      extendCloudinaryConfig(player.cloudinary.cloudinaryConfig(), { resource_type: 'raw' }),
    ) + '.transcript',
    wordsPerCaption: config.wordsPerCaption || 5 // Number of words per caption
  };

  // Load the transcription file
  const initTranscript = () => {
    fetch(options.transcriptPath)
      .then(response => response.json())
      .then(data => {
        const captions = parseTranscript(data);

        const captionsTrack = player.addRemoteTextTrack({
          kind: 'captions',
          label: 'Captions',
          default: true
        });

        captions.forEach(caption => {
          captionsTrack.track.addCue(new VTTCue(caption.startTime, caption.endTime, caption.text));
        });
      })
      .catch(error => {
        console.error('Error loading transcription file:', error);
      });
  };

  // Generate captions from the transcription data
  const parseTranscript = transcriptionData => {
    const wordsPerCaption = options.wordsPerCaption;
    const captions = [];

    transcriptionData.forEach(segment => {
      const words = segment.words;

      for (let i = 0; i < words.length; i += wordsPerCaption) {
        const startTime = words[i].start_time;
        const endTime = words[Math.min(i + wordsPerCaption - 1, words.length - 1)].end_time;

        const captionText = words
          .slice(i, i + wordsPerCaption)
          .map(word => word.word)
          .join(' ');

        captions.push({
          startTime: startTime,
          endTime: endTime,
          text: captionText
        });
      }
    });

    return captions;
  };

  player.ready(() => {
    initTranscript();
  });
}

export default pacedTranscript;
