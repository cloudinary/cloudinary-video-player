import { v4 as uuidv4 } from 'uuid';
import { sendBeaconRequest } from './send-beacon-request';
import { VIDEO_EVENT } from './events.consts';

const CLD_ANALYTICS_ENDPOINT_URL = 'https://video-analytics-api.cloudinary.com/video-analytics';
const CLD_ANALYTICS_USER_ID_KEY = 'cld-analytics-user-id';

const getUniqueUserId = () => {
  const storageUserId = window.localStorage.getItem(CLD_ANALYTICS_USER_ID_KEY);

  if (storageUserId) {
    return storageUserId;
  }

  const userId = uuidv4();
  window.localStorage.setItem(CLD_ANALYTICS_USER_ID_KEY, userId);
  return userId;
};

// prepare events list for aggregation, for example
// if video is being played and user wants to leave the page - add "pause" event to correctly calculate played time
const prepareEvents = (collectedEvents) => {
  const events = [...collectedEvents];
  const lastPlayItemIndex = events.findLastIndex((event) => event.type === VIDEO_EVENT.PLAY);
  const lastPauseItemIndex = events.findLastIndex((event) => event.type === VIDEO_EVENT.PAUSE);

  if (lastPlayItemIndex > lastPauseItemIndex) {
    events.push({
      type: VIDEO_EVENT.PAUSE,
      time: Date.now()
    });
  }

  return events;
};

const aggregateEvents = (eventsList) => {
  return eventsList.reduce((acc, event) => {
    const lastItem = acc.watchedFrames[acc.watchedFrames.length - 1];

    if (event.type === VIDEO_EVENT.PLAY) {
      acc.watchedFrames.push([event.time]);
    } else if (lastItem && lastItem.length === 1 && event.type === VIDEO_EVENT.PAUSE) {
      lastItem.push(event.time);
    }

    return acc;
  }, {
    watchedFrames: []
  });
};

const getPlayedTimeSeconds = (watchedFrames) => {
  return Math.round(watchedFrames.reduce((acc, [playTime, pauseTime]) => {
    return acc + ((pauseTime - playTime) / 1000);
  }, 0));
};

export const trackVideoPlayer = (videoElement, metadataProps) => {
  const collectedEvents = [];

  window.addEventListener('beforeunload', () => {
    const videoCurrentTime = videoElement.currentTime;
    const events = prepareEvents(collectedEvents, videoCurrentTime);
    const aggregatedEvents = aggregateEvents(events);
    const playedTimeSeconds = getPlayedTimeSeconds(aggregatedEvents.watchedFrames);

    // video public id is registered later in videojs so we need to postpone public id fetching
    const metadata = typeof metadataProps === 'function' ? metadataProps() : metadataProps;
    sendBeaconRequest(CLD_ANALYTICS_ENDPOINT_URL, {
      ...metadata,
      userId: getUniqueUserId(),
      playedTimeSeconds
    });
  });

  videoElement.addEventListener('play', () => {
    collectedEvents.push({
      type: VIDEO_EVENT.PLAY,
      time: Date.now()
    });
  });

  videoElement.addEventListener('pause', () => {
    collectedEvents.push({
      type: VIDEO_EVENT.PAUSE,
      time: Date.now()
    });
  });

  videoElement.addEventListener('emptied', () => {
    // simulate "pause" event when source is changed
    collectedEvents.push({
      type: VIDEO_EVENT.PAUSE,
      time: Date.now()
    });
  });
};
