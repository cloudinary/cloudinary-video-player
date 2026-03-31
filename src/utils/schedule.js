/**
 * Schedule utilities: weekly time-range parsing and bootstrap.
 * Outside-schedule bootstrap reuses lazy placeholder DOM + deferred load helpers.
 * Uses browser local time. No videojs dependency for the bootstrap path.
 */
import { buildPosterUrl } from './poster-url';
import { loadPlayer } from './lazy-player';
import { getVideoElement, preparePlayerPlaceholder } from './lazy-player';

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
 * @param {function} [ready] - Video.js ready callback (passed when full player loads)
 * @returns {object} Stub with source() and loadPlayer()
 */
export const scheduleBootstrap = (elem, options, ready) => {
  const videoElement = getVideoElement(elem);
  const cloudName = getCloudNameFromOptions(options);
  const publicId = getPublicIdFromOptions(options);

  if (!cloudName || !publicId) {
    throw new Error('schedule.weekly requires cloudName and publicId when outside schedule');
  }

  const cloudinaryConfig = options?.cloudinaryConfig || { cloud_name: cloudName };
  const posterUrl = buildPosterUrl(cloudName, publicId, cloudinaryConfig);

  const fluid = options?.fluid !== false;
  const { videoElement: vEl, hadControls } = preparePlayerPlaceholder(videoElement, posterUrl, {
    fluid,
    width: options?.width,
    height: options?.height,
    cropMode: options?.sourceOptions?.cropMode,
    sourceOptions: options?.sourceOptions,
    aspectRatio: options?.aspectRatio
  });

  sendScheduleImageAnalytics(options);

  const stub = {
    source: () => stub,
    loadPlayer: () => {
      if (hadControls) vEl.setAttribute('controls', '');
      return loadPlayer({ videoElement: vEl, options, ready });
    }
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

export { getVideoElement as getElementForSchedule, preparePlayerPlaceholder as renderScheduleImage } from './lazy-player';
