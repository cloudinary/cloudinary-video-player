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
    webvttCues.forEach(caption => {
      if (caption) {
        srtTrack.track.addCue(new VTTCue(caption.startTime, caption.endTime, caption.text));
      }
    });
  };

  player.one('loadedmetadata', () => {
    initSRT();
  });
}

// SRT to WebVTT conversion functions
const srt2webvtt = (data) => {
  // Remove DOS newlines
  const srt = data.replace(/\r+/g, '').trim();

  // Get cues
  const cuelist = srt.split('\n\n');
  const cues = [];

  for (const cueString of cuelist) {
    const cue = convertSrtCue(cueString);
    if (cue) {
      cues.push(cue); // Add the cue object to the array
    }
  }

  return cues; // Return the array of cues
};

const convertSrtCue = (caption) => {
  const cue = {};
  const lines = caption.split(/\n/);

  // Concatenate multi-line string separated in array into one
  while (lines.length > 3) {
    for (let i = 3; i < lines.length; i++) {
      lines[2] += `\n${lines[i]}`;
    }
    lines.splice(3, lines.length - 3);
  }

  let line = 0;

  // Detect identifier
  if (!lines[0].match(/\d+:\d+:\d+/) && lines[1].match(/\d+:\d+:\d+/)) {
    line += 1; // Skip the identifier line
  }

  // Get time strings
  if (lines[line].match(/\d+:\d+:\d+/)) {
    const timeMatch = lines[line].match(/(\d+):(\d+):(\d+)(?:,(\d+))?\s*-->\s*(\d+):(\d+):(\d+)(?:,(\d+))?/);
    if (timeMatch) {
      const [, startHours, startMinutes, startSeconds, startMilliseconds, endHours, endMinutes, endSeconds, endMilliseconds] = timeMatch;
      cue.startTime = (parseInt(startHours) * 3600) + (parseInt(startMinutes) * 60) + parseInt(startSeconds) + (parseInt(startMilliseconds) / 1000);
      cue.endTime = (parseInt(endHours) * 3600) + (parseInt(endMinutes) * 60) + parseInt(endSeconds) + (parseInt(endMilliseconds) / 1000);
      line += 1;
    } else {
      return null; // Return null if the cue is invalid
    }
  } else {
    return null; // Return null if the cue is invalid
  }

  // Get cue text
  if (lines[line]) {
    cue.text = lines[line].trim(); // Trim whitespace from the text
  }

  return cue; // Return the cue object
};

export default srtTextTracks;
