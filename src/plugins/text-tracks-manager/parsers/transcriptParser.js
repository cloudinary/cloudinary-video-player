const parseTranscript = (transcriptionData, options) => {
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

export const transcriptParser = async (fileContent, options) => {
  const data = JSON.parse(fileContent);
  return parseTranscript(data, options);
};
