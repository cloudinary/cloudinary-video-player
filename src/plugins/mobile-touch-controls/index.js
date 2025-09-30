import videojs from 'video.js';
import './mobile-touch-controls.scss';

const mobileTouchControls = (options, player) => {
  if (!(videojs.browser.IS_IOS || videojs.browser.IS_ANDROID || 
        /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {
    return {};
  }

  let isInteractionActive = false;
  let inactivityHandler = null;
  let pauseHandler = null;
  let pauseButton = null;
  let originalHandleClick = null;

  const removePauseHandler = () => {
    if (!pauseHandler) return;
    pauseButton?.removeEventListener('click', pauseHandler, { capture: true });
    pauseButton?.removeEventListener('touchend', pauseHandler, { capture: true });
    
    const component = player.getChild('bigPlayButton');
    if (component && originalHandleClick) component.handleClick = originalHandleClick;
    
    pauseHandler = pauseButton = originalHandleClick = null;
  };

  const updateTouchState = () => {
    if (!player.paused()) {
      player.addClass('cld-mobile-touch-playing');
      removePauseHandler();

      const btn = player.el().querySelector('.vjs-big-play-button');
      if (!btn) return;

      pauseHandler = (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (!player.paused()) {
          player.pause();
          setTimeout(() => {
            updateTouchState();
            if (player.hasClass('cld-mobile-touch-active')) {
              player.setTimeout(() => player.removeClass('cld-mobile-touch-active'), 2000);
            }
          }, 50);
        }
        return false;
      };

      btn.addEventListener('click', pauseHandler, { capture: true });
      btn.addEventListener('touchend', pauseHandler, { capture: true });
      
      const component = player.getChild('bigPlayButton');
      if (component) {
        originalHandleClick = component.handleClick;
        component.handleClick = () => pauseHandler({ preventDefault: () => {}, stopImmediatePropagation: () => {} });
      }
      pauseButton = btn;
    } else {
      player.removeClass('cld-mobile-touch-playing');
      removePauseHandler();
    }
  };

  const setupInactivityHandler = () => {
    if (inactivityHandler) player.off('userinactive', inactivityHandler);
    
    inactivityHandler = () => {
      player.removeClass('cld-mobile-touch-active');
      setTimeout(() => {
        if (!player.hasClass('cld-mobile-touch-active')) {
          player.removeClass('cld-mobile-touch-playing');
          removePauseHandler();
          isInteractionActive = false;
        }
        if (inactivityHandler) {
          player.off('userinactive', inactivityHandler);
          inactivityHandler = null;
        }
      }, 250);
    };
    
    player.one('userinactive', inactivityHandler);
  };

  player.ready(() => {
    const el = player.el();
    if (!el) return;

    const onTouch = (e) => {
      if (e.target.closest('.vjs-control-bar, .vjs-menu') || 
          e.target.matches('.vjs-control, .vjs-button') || 
          !player.hasStarted()) return;
      
      player.addClass('cld-mobile-touch-active');
      if (!isInteractionActive) {
        isInteractionActive = true;
        updateTouchState();
      }
      setupInactivityHandler();
    };

    const onPlayPause = () => isInteractionActive && updateTouchState();

    el.addEventListener('touchend', onTouch, { passive: true });
    player.on('play', onPlayPause);
    player.on('pause', onPlayPause);

    player.on('dispose', () => {
      el.removeEventListener('touchend', onTouch);
      removePauseHandler();
      if (inactivityHandler) player.off('userinactive', inactivityHandler);
      player.off('play', onPlayPause);
      player.off('pause', onPlayPause);
    });
  });

  return {};
};

export default function(opts = {}) {
  return mobileTouchControls(opts, this);
}