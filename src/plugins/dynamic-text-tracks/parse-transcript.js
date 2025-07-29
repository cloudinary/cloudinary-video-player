/* eslint-disable */
export const parseTranscript = (transcriptionData) => {
  const captions = [];

  const addCaption = ({ startTime, endTime, text }) => {
    captions.push({
      startTime: startTime,
      endTime: endTime,
      text
    });
  };

  transcriptionData.forEach(segment => {
    const words = segment.words;

    if (words) {
      const maxWords = words.length;
      for (let i = 0; i < words.length; i += maxWords) {
        captions.push({
          startTime: words[i].start_time,
          endTime: words[Math.min(i + maxWords - 1, words.length - 1)].end_time,
          text: words
            .slice(i, i + maxWords)
            .map(word => word.word)
            .join(' ')
        });
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
