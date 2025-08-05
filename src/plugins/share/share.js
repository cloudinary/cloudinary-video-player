import './components/download-button';
import './share.scss';
import { getCloudinaryUrl } from 'plugins/cloudinary/common';
import omit from 'lodash/omit';

const SharePlugin = function (options = {}, playerInstance) {
  const player = playerInstance || this;

  player.addClass('vjs-share');

  const addDownloadButton = () => {
    const controlBar = player.getChild('ControlBar');
    if (!controlBar || controlBar.getChild('ShareDownloadButton')) {
      return;
    }

    const children = controlBar.children();
    const insertBeforeIndex = children.findIndex(c => c.name_ === 'FullscreenToggle');

    controlBar.addChild('ShareDownloadButton', {}, insertBeforeIndex !== -1 ? insertBeforeIndex : undefined);
  };

  const removeDownloadButton = () => {
    if (!player.controlBar) {
      return;
    }
    const btn = player.controlBar.getChild('ShareDownloadButton');
    if (btn) {
      player.controlBar.removeChild(btn);
    }
  };

  const getDownloadUrl = () => {
    const source = player.currentSource?.();
    if (!source) {
      return null;
    }

    // Strip format / codec related keys (root level and in nested transformation arrays)
    const STRIP_KEYS = ['format', 'video_codec', 'streaming_profile'];

    // Recursively strip keys anywhere in the object/array tree
    const stripKeysDeep = (value) => {
      if (Array.isArray(value)) {
        return value.map(stripKeysDeep);
      }
      if (value && typeof value === 'object') {
        const cleaned = omit(value, STRIP_KEYS);
        Object.keys(cleaned).forEach((k) => {
          cleaned[k] = stripKeysDeep(cleaned[k]);
        });
        return cleaned;
      }
      return value;
    };

    const transformations = stripKeysDeep(player.cloudinary.transformation() || {});

    const baseOptions = {
      ...player.cloudinary.cloudinaryConfig(),
      ...transformations,
      resource_type: 'video',
      format: 'mp4',
      video_codec: 'h264',
      flags: `streaming_attachment:${player.cloudinary.currentPublicId()}`,
    };

    // For ABR - download a limited-size video
    if (source.isAdaptive) {
      Object.assign(baseOptions, {
        crop: 'limit',
        width: 1920,
        height: 1920,
      });
    }

    return getCloudinaryUrl(player.cloudinary.currentPublicId(), baseOptions);
  };

  const download = () => {
    const url = getDownloadUrl();
    if (!url) {
      console.warn('Share plugin: Unable to resolve download URL.');
      return;
    }

    const MAX_ATTEMPTS = 60; // 60 tries / 10s interval
    const INTERVAL_MS = 10000;

    const triggerDownload = () => {
      const a = document.createElement('a');
      a.href = url;
      a.download = '';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    const btn = player.controlBar?.getChild('ShareDownloadButton');
    const setPreparingState = (isPreparing) => {
      if (!btn) {
        return;
      }
      const el = btn.el();
      btn?.setPreparing?.(isPreparing);
    };

    const pollForAvailability = (attempt = 0) => {
      fetch(url, { method: 'HEAD' })
        .then((res) => {
          if (res.ok) {
            // Ready – restore icon and start download.
            setPreparingState(false);
            triggerDownload();
          } else if (attempt < MAX_ATTEMPTS) {
            if (attempt === 0) {
              // First time we detect the asset is not ready → show spinner
              setPreparingState(true);
            }
            setTimeout(() => pollForAvailability(attempt + 1), INTERVAL_MS);
          } else {
            console.warn(`Share plugin: Download not ready after ${MAX_ATTEMPTS * INTERVAL_MS / 1000} seconds.`);
            setPreparingState(false);
          }
        })
        .catch(() => {
          if (attempt < MAX_ATTEMPTS) {
            if (attempt === 0) {
              setPreparingState(true);
            }
            setTimeout(() => pollForAvailability(attempt + 1), INTERVAL_MS);
          } else {
            setPreparingState(false);
          }
        });
    };

    // Kick things off (first HEAD request is attempt 0)
    pollForAvailability();
  };

  if (options.download) {
    addDownloadButton();
  }

  player.share = {
    download,
    addDownloadButton,
    removeDownloadButton
  };
};

export default SharePlugin;
