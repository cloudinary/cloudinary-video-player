/**
 * Schedule utilities: weekly time-range parsing and bootstrap (poster rendering).
 * Uses browser local time. No videojs dependency for the bootstrap path.
 */
import cssEscape from 'css.escape';
import { buildPosterUrl } from './poster-url';

const INTERNAL_ANALYTICS_URL = 'https://analytics-api-s.cloudinary.com';

const sendScheduleImageAnalytics = (options) => {
  const allowReport = options?.sourceOptions?.allowUsageReport ?? options?.allowUsageReport;
  if (allowReport === false) return;
  try {
    const params = new URLSearchParams({
      scheduleImageRendered: 'true',
      cloudName: options?.cloudName || options?.cloudinaryConfig?.cloud_name || '',
    }).toString();
    fetch(`${INTERNAL_ANALYTICS_URL}/video_player_source?${params}`);
  } catch {
    // noop
  }
};

const getCloudNameFromOptions = (options) =>
  options?.cloudName || options?.cloud_name || options?.cloudinaryConfig?.cloud_name;

const getPublicIdFromOptions = (options) =>
  options?.publicId || options?.sourceOptions?.publicId;

/**
 * Returns true when schedule.weekly is configured and current time is outside the schedule.
 * @param {object} options - player options
 * @returns {boolean}
 */
export const shouldUseScheduleBootstrap = (options) => {
  const schedule = options?.schedule;
  const weekly = schedule?.weekly;
  return Array.isArray(weekly) && weekly.length > 0 && !isWithinSchedule(schedule, new Date());
};

/**
 * Bootstrap path when outside schedule: render poster, return stub with loadPlayer().
 * @param {string|HTMLElement} elem - Element id or video element
 * @param {object} options - player options
 * @returns {object} Stub with source() and loadPlayer()
 */
export const scheduleBootstrap = (elem, options) => {
  const videoElement = getElementForSchedule(elem);
  const cloudName = getCloudNameFromOptions(options);
  const publicId = getPublicIdFromOptions(options);

  if (!cloudName || !publicId) {
    throw new Error('schedule.weekly requires cloudName and publicId when outside schedule');
  }

  const cloudinaryConfig = options?.cloudinaryConfig || { cloud_name: cloudName };
  const posterUrl = buildPosterUrl(cloudName, publicId, cloudinaryConfig);

  const fluid = options?.fluid !== false;
  const { container, videoElement: vEl } = renderScheduleImage(videoElement, posterUrl, {
    fluid,
    width: options?.width,
    height: options?.height,
    cropMode: options?.sourceOptions?.cropMode,
  });

  sendScheduleImageAnalytics(options);

  const stub = {
    source: () => stub,
    loadPlayer: () =>
      import(/* webpackChunkName: "cld-video-player-core" */ '../video-player.js').then(({ createVideoPlayer }) => {
        if (container && container.parentNode) {
          container.parentNode.removeChild(container);
        }
        vEl.style.display = '';
        return createVideoPlayer(vEl, options);
      }),
  };

  return stub;
};

const DAY_MAP = {
  sunday: 0, sun: 0,
  monday: 1, mon: 1,
  tuesday: 2, tue: 2, tues: 2,
  wednesday: 3, wed: 3,
  thursday: 4, thu: 4, thur: 4, thurs: 4,
  friday: 5, fri: 5,
  saturday: 6, sat: 6
};

const FLUID_CLASS = 'cld-fluid';

/**
 * Parse readable day-of-week string to JS Date.getDay() value (0=Sun .. 6=Sat).
 * @param {string} day - Full or abbreviated day name (case-insensitive)
 * @returns {number|null} 0-6, or null if invalid
 */
export const parseDay = (day) => {
  if (typeof day !== 'string') return null;
  const key = day.toLowerCase().trim();
  return DAY_MAP[key] ?? null;
};

/**
 * Parse "HH:mm" string to minutes since midnight.
 * @param {string} timeStr - "09:00" or "17:30"
 * @returns {number|null} minutes, or null if invalid
 */
const parseTime = (timeStr) => {
  if (typeof timeStr !== 'string') return null;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
};

/**
 * Check if a date falls within any configured weekly slot (local time).
 * @param {{ weekly?: Array<{ day: string, start: string, duration: number }> }} schedule - schedule config
 * @param {Date} date - date to check (uses local time)
 * @returns {boolean} true if within a slot
 */
export const isWithinSchedule = (schedule, date) => {
  const weekly = schedule?.weekly;
  if (!Array.isArray(weekly) || weekly.length === 0) return true;

  const WEEK = 7 * 1440;
  const nowInWeek = date.getDay() * 1440 + date.getHours() * 60 + date.getMinutes();

  for (const slot of weekly) {
    const slotDay = parseDay(slot.day);
    if (slotDay === null) continue;

    const startMin = parseTime(slot.start);
    if (startMin === null || typeof slot.duration !== 'number' || slot.duration <= 0) continue;

    const slotStart = slotDay * 1440 + startMin;
    const durationMin = slot.duration * 60;
    const elapsed = (nowInWeek - slotStart + WEEK) % WEEK;

    if (elapsed < durationMin) return true;
  }

  return false;
};

/**
 * Resolve video element by id or return element. No videojs.
 * @param {string|HTMLElement} elem - Element id (with or without #) or video element
 * @returns {HTMLVideoElement}
 */
export const getElementForSchedule = (elem) => {
  if (typeof elem === 'string') {
    let id = elem;
    if (id.indexOf('#') === 0) id = id.slice(1);
    try {
      elem = document.querySelector(`#${cssEscape(id)}`);
    } catch {
      elem = null;
    }
    if (!elem) throw new Error(`Could not find element with id ${id}`);
  }
  if (!elem?.tagName) throw new Error('Must specify either an element or an element id.');
  if (elem.tagName !== 'VIDEO') throw new Error('Element is not a video tag.');
  return elem;
};

/**
 * Hide video, show poster image overlay. Keeps video in DOM for load().
 * @param {HTMLVideoElement} videoElement
 * @param {string} posterUrl
 * @param {object} options - fluid, width, height, etc.
 * @returns {{ img: HTMLImageElement, container: HTMLElement, videoElement: HTMLVideoElement }}
 */
export const renderScheduleImage = (videoElement, posterUrl, options = {}) => {
  const fluid = options.fluid !== false;
  const parent = videoElement.parentNode;

  const container = document.createElement('div');
  container.className = 'cld-schedule-poster-container';
  container.style.cssText = 'position:relative;width:100%;height:100%;';

  const img = document.createElement('img');
  img.src = posterUrl;
  img.alt = '';
  img.setAttribute('data-cld-schedule-poster', 'true');
  img.style.cssText = 'display:block;width:100%;height:100%;object-fit:contain;';

  if (fluid) {
    container.classList.add(FLUID_CLASS);
    img.style.objectFit = options.cropMode === 'fill' ? 'cover' : 'contain';
  }
  if (options.width) container.style.width = `${options.width}px`;
  if (options.height) container.style.height = `${options.height}px`;

  videoElement.style.display = 'none';
  container.appendChild(img);
  parent.insertBefore(container, videoElement);

  return { img, container, videoElement };
};
