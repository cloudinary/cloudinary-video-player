// eslint-disable
import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';
import { sendBeaconRequest } from './send-beacon-request';

const CLD_ANALYTICS_ENDPOINT_URL = 'https://video-analytics-api.cloudinary.net';
const CLD_ANALYTICS_USER_ID_COOKIE_KEY = 'cld-analytics-user-id';

const getUniqueUserId = () => {
  const cookieUserId = Cookies.get(CLD_ANALYTICS_USER_ID_COOKIE_KEY);

  if (cookieUserId) {
    return cookieUserId;
  }

  const userId = uuidv4();
  const expirationDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
  Cookies.set(CLD_ANALYTICS_USER_ID_COOKIE_KEY, userId, { expires: expirationDate });
  return userId;
};

const aggregateEvents = (eventsList) => {
  const events = eventsList.reduce((acc, event) => {
    const lastItem = acc.watchedFrames[acc.watchedFrames.length - 1];
    if (event.type === 'PLAY') {
      acc.watchedFrames.push([event.time]);
    } else if (lastItem && lastItem.length === 1 && event.type === 'PAUSE') {
      acc.watchedFrames[acc.watchedFrames.length - 1].push(event.time);
    }

    return acc;
  }, {
    watchedFrames: []
  });

  // filter out partial events
  if (events.watchedFrames.length && events.watchedFrames[events.watchedFrames.length - 1].length === 1) {
    events.watchedFrames.pop();
  }

  return events;
};

const getPlayedTimeSeconds = (watchedFrames) => {
  return Math.round(watchedFrames.reduce((acc, frames) => {
    return acc + (frames[1] - frames[0]);
  }, 0));
};

export const trackVideoPlayer = (videoElement, metadata) => {
  const collectedEvents = [];

  window.addEventListener('beforeunload', () => {
    const aggregatedEvents = aggregateEvents(collectedEvents);
    const playedTimeSeconds = getPlayedTimeSeconds(aggregatedEvents.watchedFrames);

    if (playedTimeSeconds) {
      sendBeaconRequest(CLD_ANALYTICS_ENDPOINT_URL, {
        ...metadata,
        userId: getUniqueUserId(),
        playedTimeSeconds
      });
    }
  });

  // register events
  videoElement.addEventListener('play', (event) => {
    collectedEvents.push({
      type: 'PLAY',
      time: event.target.currentTime
    });
  });

  videoElement.addEventListener('pause', (event) => {
    collectedEvents.push({
      type: 'PAUSE',
      time: event.target.currentTime
    });
  });
};
