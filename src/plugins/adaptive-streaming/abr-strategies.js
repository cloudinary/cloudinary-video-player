export const abrStrategies = {
  fastStart: {
    capLevelToPlayerSize: true,
    ignoreDevicePixelRatio: true,
    maxDevicePixelRatio: 2,
    abrEwmaDefaultEstimate: 4194304,
    abrEwmaDefaultEstimateMax: 4194304,
    enableWorker: false,
    startLevel: 0
  },
  balanced: {
    capLevelToPlayerSize: true,
    ignoreDevicePixelRatio: true,
    maxDevicePixelRatio: 2,
    abrEwmaDefaultEstimate: 4194304,
    abrEwmaDefaultEstimateMax: 4194304,
    enableWorker: false
  },
  highQuality: {
    capLevelToPlayerSize: true,
    ignoreDevicePixelRatio: false,
    maxDevicePixelRatio: 2,
    abrEwmaDefaultEstimate: 4194304,
    abrEwmaDefaultEstimateMax: 4194304,
    enableWorker: false
  }
}; 

export const ADAPTIVE_STREAMING_STRATEGY = Object.keys(abrStrategies);

export const hdrSupported = window.matchMedia && window.matchMedia('(dynamic-range: high)').matches;
