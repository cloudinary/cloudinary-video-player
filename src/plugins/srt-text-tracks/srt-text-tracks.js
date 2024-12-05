import srtParser2 from 'srt-parser-2';

function srtTextTracks(config, player) {
  // Load the SRT file and convert it to WebVTT
  const initSRT = async () => {
    let srtResponse;
    if (config.src) {
      try {
        srtResponse = await fetch(config.src);
        if (!srtResponse.ok) {
          throw new Error(`Failed fetching from ${config.src} with status code ${srtResponse.status}`);
        }
      } catch (error) {
        console.error(error);
      }
    }
    if (!srtResponse.ok) return;

    const srtData = await srtResponse.text();
    const webvttCues = srt2webvtt(srtData); // Get the array of cues

    const srtTrack = player.addRemoteTextTrack({
      kind: config.kind || 'subtitles',
      label: config.label || 'Subtitles',
      srclang: config.srclang,
      default: config.default,
      mode: config.default ? 'showing' : 'disabled'
    });

    // required for Safari to display the captions
    // https://github.com/videojs/video.js/issues/8519
    await new Promise(resolve => setTimeout(resolve, 100));

    // Add the WebVTT data to the track
    webvttCues.forEach(cue => {
      if (cue) {
        srtTrack.track.addCue(new VTTCue(cue.startTime, cue.endTime, cue.text));
      }
    });
  };

  player.one('loadedmetadata', () => {
    initSRT();
  });
}

// SRT parser
const srt2webvtt = data => {
  const SRTParser = new srtParser2();
  
  const cues = SRTParser.fromSrt(data);

  return cues.map(cue => ({
    startTime: cue.startSeconds,
    endTime: cue.endSeconds,
    text: cue.text
  }));
};

export default srtTextTracks;
