import srtParser2 from 'srt-parser-2';

export const srtParser = async (fileContent) => {
  const SRTParser = new srtParser2();
  const cues = SRTParser.fromSrt(fileContent);
  return cues.filter((v) => v).map(cue => ({
    startTime: cue.startSeconds,
    endTime: cue.endSeconds,
    text: cue.text
  }));
};
