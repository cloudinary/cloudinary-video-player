import { getPosterUrl } from './bootstrap-poster-url';

const FLUID_CLASS = 'cld-fluid';

export const getVideoElement = (elem) => {
  if (typeof elem === 'string') {
    let id = elem;
    if (id.indexOf('#') === 0) id = id.slice(1);
    try {
      elem = document.querySelector(`#${CSS.escape(id)}`);
    } catch {
      elem = null;
    }
    if (!elem) throw new Error(`Could not find element with id ${id}`);
  }
  if (!elem?.tagName) throw new Error('Must specify either an element or an element id.');
  if (elem.tagName !== 'VIDEO') throw new Error('Element is not a video tag.');
  return elem;
};

export const preparePlayerPlaceholder = (videoElement, posterUrl, options = {}) => {
  const hadControls = videoElement.hasAttribute('controls');

  videoElement.poster = posterUrl;
  videoElement.preload = 'none';
  videoElement.controls = false;
  videoElement.removeAttribute('controls');

  const fluid = options.fluid !== false;
  if (fluid) {
    videoElement.classList.add(FLUID_CLASS);
  }

  if (options.width) videoElement.setAttribute('width', String(options.width));
  if (options.height) videoElement.setAttribute('height', String(options.height));

  const ar = options?.sourceOptions?.aspectRatio || options?.aspectRatio;
  if (typeof ar === 'string' && ar.includes(':')) {
    const parts = ar.split(':').map((x) => parseInt(x.trim(), 10));
    if (parts.length === 2 && parts[0] > 0 && parts[1] > 0) {
      videoElement.style.aspectRatio = `${parts[0]} / ${parts[1]}`;
    }
  }

  return { videoElement, hadControls };
};

export const loadPlayer = ({ overlayRoot, videoElement, options, ready }) => {
  if (overlayRoot?.parentNode) {
    overlayRoot.replaceWith(videoElement);
  }
  return import('../video-player.js').then((m) => m.createVideoPlayer(videoElement, options, ready));
};

const PREACTIVATE_OVERLAY_CLASS = 'cld-lazy-preactivate-overlay';

const isLightSkin = (videoElement, options) => {
  const cls = videoElement.className || '';
  return cls.indexOf('cld-video-player-skin-light') > -1 || options?.skin === 'light';
};

/** Matches Video.js BigPlayButton DOM structure. */
const createBigPlayButton = () => {
  const playBtn = document.createElement('button');
  playBtn.type = 'button';
  playBtn.className = 'vjs-big-play-button';
  playBtn.setAttribute('aria-disabled', 'false');
  playBtn.title = 'Play Video';
  playBtn.setAttribute('aria-label', 'Play Video');
  const icon = document.createElement('span');
  icon.className = 'vjs-icon-placeholder';
  icon.setAttribute('aria-hidden', 'true');
  playBtn.appendChild(icon);
  return playBtn;
};

export const shouldUseLazyBootstrap = (options) => !!options?.lazy;

export const shouldLoadOnScroll = (lazy) =>
  lazy && typeof lazy === 'object' && lazy.loadOnScroll === true;

export const lazyBootstrap = async (elem, options, ready) => {
  const videoElement = getVideoElement(elem);
  const posterUrl = await getPosterUrl(options);
  const loadOnScroll = shouldLoadOnScroll(options.lazy);

  const { hadControls } = preparePlayerPlaceholder(videoElement, posterUrl, {
    fluid: options?.fluid !== false,
    width: options?.width,
    height: options?.height,
    sourceOptions: options?.sourceOptions,
    aspectRatio: options?.aspectRatio
  });

  const light = isLightSkin(videoElement, options);

  const overlayRoot = document.createElement('div');
  overlayRoot.classList.add('cld-video-player', 'video-js', PREACTIVATE_OVERLAY_CLASS);
  overlayRoot.classList.add(light ? 'cld-video-player-skin-light' : 'cld-video-player-skin-dark');

  const colors = options?.colors;
  if (colors) {
    if (colors.base) overlayRoot.style.setProperty('--color-base', colors.base);
    if (colors.accent) overlayRoot.style.setProperty('--color-accent', colors.accent);
    if (colors.text) overlayRoot.style.setProperty('--color-text', colors.text);
  }

  videoElement.parentNode.insertBefore(overlayRoot, videoElement);
  overlayRoot.appendChild(videoElement);

  const playBtn = createBigPlayButton();
  overlayRoot.appendChild(playBtn);

  let loadPromise = null;
  let observer = null;

  const teardownActivation = () => {
    playBtn.removeEventListener('click', onPlayClick);
    videoElement.removeEventListener('click', onVideoClick);
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };

  const activate = (activationOpts = {}) => {
    if (loadPromise) {
      return loadPromise;
    }
    teardownActivation();
    const autoplayFromUserGesture = activationOpts.autoplayFromUserGesture === true;
    if (hadControls) videoElement.setAttribute('controls', '');
    const wrappedReady = autoplayFromUserGesture
      ? (p) => { p.play(); if (ready) ready(p); }
      : ready;
    const playerOptions = Object.assign({}, options);
    delete playerOptions.lazy;
    loadPromise = loadPlayer({
      overlayRoot,
      videoElement,
      options: playerOptions,
      ready: wrappedReady
    });
    return loadPromise;
  };

  function onPlayClick(e) {
    e.stopPropagation();
    activate({ autoplayFromUserGesture: true });
  }

  function onVideoClick() {
    activate({ autoplayFromUserGesture: true });
  }

  playBtn.addEventListener('click', onPlayClick);
  videoElement.addEventListener('click', onVideoClick);

  if (loadOnScroll && typeof IntersectionObserver !== 'undefined') {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activate({});
          }
        });
      },
      { rootMargin: '0px', threshold: 0.25 }
    );
    observer.observe(videoElement);
  }

  const stub = {
    source: () => stub,
    loadPlayer: () => activate({ autoplayFromUserGesture: true })
  };

  return stub;
};
