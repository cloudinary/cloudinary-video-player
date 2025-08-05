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

    // Strip format / codec related transformation arrays
    const STRIP_KEYS = ['format', 'video_codec', 'streaming_profile'];
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
    const RETRY_STATUS_CODES = [423];

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
      btn?.setPreparing?.(isPreparing);
    };

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const fetchDownload = async (attempt = 0) => {
      const response = await fetch(url, { method: 'HEAD' });

      if (RETRY_STATUS_CODES.includes(response.status) && attempt < MAX_ATTEMPTS) {
        if (attempt === 0) {
          setPreparingState(true);
        }
        await wait(INTERVAL_MS);
        return fetchDownload(attempt + 1);
      }

      setPreparingState(false);
      triggerDownload();
    };

    fetchDownload();
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
