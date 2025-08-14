export const vttParser = async (fileContent) => {
  const lines = fileContent.trim().split(/\r?\n/);
  const cues = [];
  let buffer = [];

  const parseTime = (timeStr) => {
    const [hms, ms] = timeStr.split('.');
    const [h, m, s] = hms.split(':').map(Number);
    return h * 3600 + m * 60 + s + (parseFloat(`0.${ms}`) || 0);
  };

  const parseCueBlock = (blockLines) => {
    const cueLines = blockLines.filter(Boolean);
    if (cueLines.length < 2) return null;

    const timeLineIdx = cueLines[0].includes('-->') ? 0 : 1;
    const timeLine = cueLines[timeLineIdx];

    const [startPart, endPartWithSettings] = timeLine.split('-->');
    const start = startPart.trim();

    const [end, ...cueSettingsParts] = endPartWithSettings.trim().split(/\s+/);
    const cueSettings = cueSettingsParts.join(' '); // like: line:90% position:50% align:start

    const text = cueLines.slice(timeLineIdx + 1).join('\n').trim();

    return {
      startTime: parseTime(start),
      endTime: parseTime(end),
      text,
      settings: cueSettings || null,
    };
  };

  let inSkipBlock = false;

  for (const line of lines) {
    if (/^(NOTE|STYLE|REGION)/.test(line.trim())) {
      inSkipBlock = true;
      continue;
    }

    if (inSkipBlock && line.trim() === '') {
      inSkipBlock = false;
      continue;
    }

    if (inSkipBlock) continue;

    if (line.trim() === '') {
      const cue = parseCueBlock(buffer);
      if (cue) cues.push(cue);
      buffer = [];
    } else {
      buffer.push(line);
    }
  }

  if (buffer.length > 0) {
    const cue = parseCueBlock(buffer);
    if (cue) cues.push(cue);
  }

  return cues;
};
