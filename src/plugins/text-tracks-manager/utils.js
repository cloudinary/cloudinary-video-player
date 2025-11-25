export const fetchFileContent = async (
  url,
  config = {}
) => {
  const {
    polling = false,
    interval = 3000,
    maxAttempts = 10,
    signal,
    onSuccess,
    onError,
    onAttempt
  } = config;

  let attempts = 0;

  const attemptFetch = async () => {
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    attempts++;
    onAttempt?.(attempts);

    const response = await fetch(url, { signal });

    if (response.status === 202 && polling) {
      if (attempts < maxAttempts) {
        return new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            attemptFetch().then(resolve).catch(reject);
          }, interval);

          signal?.addEventListener('abort', () => {
            clearTimeout(timeoutId);
            reject(new DOMException('Aborted', 'AbortError'));
          }, { once: true });
        });
      } else {
        throw new Error(`Polling max attempts reached (${maxAttempts}) for ${url}`);
      }
    }

    if (!response.ok) {
      throw new Error(`Failed fetching from ${url} with status code ${response.status}`);
    }

    const text = await response.text();
    onSuccess?.(text);
    return text;
  };

  try {
    return await attemptFetch();
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('Polling aborted');
    } else {
      console.error(error);
    }

    onError?.(error);
  }
};

export const addTextTrackCues = (textTrack, cues) => {
  cues.forEach(({ startTime, endTime, text, settings }) => {
    const cue = new VTTCue(startTime, endTime, text);

    if (settings) {
      const parsed = settings.split(/\s+/);
      parsed.forEach(setting => {
        const [key, value] = setting.split(':');
        if (!key || !value) return;

        switch (key) {
          case 'line':
            cue.line = isNaN(value) ? value : parseFloat(value);
            break;
          case 'position':
            cue.position = parseFloat(value);
            break;
          case 'size':
            cue.size = parseFloat(value);
            break;
          case 'align':
            cue.align = value;
            break;
        }
      });
    }

    textTrack.addCue(cue);
  });
};

export const removeAllTextTrackCues = (textTrack) => {
  if (!textTrack || !textTrack.cues) return;

  Array.from(textTrack.cues).forEach((cue) => {
    try {
      textTrack.removeCue(cue);
    } catch (e) {
      console.warn('Failed to remove cue:', cue, e);
    }
  });
};

export const refreshTextTrack = (textTrack) => {
  if (!textTrack || typeof textTrack.mode !== 'string') return;

  const currentMode = textTrack.mode;
  textTrack.mode = currentMode === 'showing' ? 'hidden' : 'showing';

  // Force back to original after a short delay (just enough to trigger reflow)
  setTimeout(() => {
    textTrack.mode = currentMode;
  }, 0);
};
