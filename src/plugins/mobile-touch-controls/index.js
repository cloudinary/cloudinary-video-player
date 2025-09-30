import videojs from 'video.js';
import './mobile-touch-controls.scss';

/**
 * Mobile Touch Controls Plugin
 * 
 * Provides mobile-specific functionality:
 * - Shows big play button when tapping video layer (alongside controls)
 * - Displays pause icon when video is playing
 * - Enables pause functionality via big play button on mobile
 * - Syncs with VideoJS control bar timing
 */
const mobileTouchControls = (options, player) => {
  // State management
  let isMobile = false;
  let isSetup = false;
  let isInteractionActive = false;
  let mobileTouchTimeout = null;
  
  // Handler references for cleanup
  let inactivityHandler = null;
  let pauseHandler = null;
  let pauseButton = null;
  let originalHandleClick = null;
  let touchHandler = null;
  
  // Event handler references
  let playHandler = null;
  let pauseEventHandler = null;
  let disposeHandler = null;

  /**
   * Detect if current device is mobile
   */
  const detectMobile = () => {
    isMobile = videojs.browser.IS_IOS || 
               videojs.browser.IS_ANDROID || 
               /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  /**
   * Setup main touch event handler
   */
  const setupTouchHandler = (playerElement) => {
    touchHandler = (event) => {
      // Only handle touch events on the player container, not on controls
      const target = event.target;
      const isControlElement = target.closest('.vjs-control-bar') || 
                              target.closest('.vjs-menu') ||
                              target.matches('.vjs-control, .vjs-button');

      if (isControlElement) {
        return;
      }

      // Check if video has started (show big play button for both playing and paused states)
      const hasStarted = player.hasStarted();
      
      if (hasStarted) {
        handleMobileTouchInteraction();
      }
    };

    playerElement.addEventListener('touchend', touchHandler, { passive: true });
  };

  /**
   * Remove pause handler and restore original behavior
   */
  const removePauseHandler = () => {
    if (pauseHandler && pauseButton) {
      // Remove all event listeners
      pauseButton.removeEventListener('click', pauseHandler, { capture: true });
      pauseButton.removeEventListener('touchend', pauseHandler, { capture: true });
      pauseButton.removeEventListener('mousedown', pauseHandler, { capture: true });
      
      // Restore original VideoJS component behavior
      const bigPlayButtonComponent = player.getChild('bigPlayButton');
      if (bigPlayButtonComponent && originalHandleClick) {
        bigPlayButtonComponent.handleClick = originalHandleClick;
        originalHandleClick = null;
      }
      
      pauseHandler = null;
      pauseButton = null;
    }
  };

  /**
   * Setup custom pause handler for big play button
   */
  const setupPauseHandler = () => {
    // Remove any existing handler first
    removePauseHandler();

    // Find the big play button
    const bigPlayButton = player.el().querySelector('.vjs-big-play-button');
    if (!bigPlayButton) {
      return;
    }

    // Create custom pause handler that completely overrides default behavior
    pauseHandler = (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      
      // Pause the video
      if (!player.paused()) {
        player.pause();
        
        // Immediately update the mobile touch state
        setTimeout(() => {
          updateTouchState();
          
          // Force show the button briefly to give visual feedback
          if (player.hasClass('cld-mobile-touch-active')) {
            player.clearTimeout(mobileTouchTimeout);
            mobileTouchTimeout = player.setTimeout(() => {
              player.removeClass('cld-mobile-touch-active');
            }, 2000);
          }
        }, 50);
      }
      
      return false;
    };

    // Add multiple event listeners to ensure we catch the click
    bigPlayButton.addEventListener('click', pauseHandler, { capture: true });
    bigPlayButton.addEventListener('touchend', pauseHandler, { capture: true });
    bigPlayButton.addEventListener('mousedown', pauseHandler, { capture: true });
    
    // Also disable the VideoJS component's click handling temporarily
    const bigPlayButtonComponent = player.getChild('bigPlayButton');
    if (bigPlayButtonComponent) {
      originalHandleClick = bigPlayButtonComponent.handleClick;
      bigPlayButtonComponent.handleClick = () => {
        // Override with our pause behavior
        pauseHandler({ 
          preventDefault: () => {}, 
          stopPropagation: () => {}, 
          stopImmediatePropagation: () => {} 
        });
      };
    }
    
    // Store reference to the button for cleanup
    pauseButton = bigPlayButton;
  };

  /**
   * Update touch state based on playback status
   */
  const updateTouchState = () => {
    const isPlaying = !player.paused();
    
    if (isPlaying) {
      player.addClass('cld-mobile-touch-playing');
      setupPauseHandler();
    } else {
      player.removeClass('cld-mobile-touch-playing');
      removePauseHandler();
    }
  };

  /**
   * Setup inactivity handler to sync with VideoJS controls
   */
  const setupInactivityHandler = () => {
    // Remove any existing inactivity handler
    if (inactivityHandler) {
      player.off('userinactive', inactivityHandler);
    }
    
    // Create handler that syncs with VideoJS control bar timing
    inactivityHandler = () => {
      // Start fade-out when VideoJS controls fade out
      player.removeClass('cld-mobile-touch-active');
      
      // Wait for CSS transition to complete before cleanup
      setTimeout(() => {
        player.removeClass('cld-mobile-touch-playing');
        removePauseHandler();
        isInteractionActive = false; // End mobile interaction session
        
        // Remove the inactivity handler since this touch session is done
        if (inactivityHandler) {
          player.off('userinactive', inactivityHandler);
          inactivityHandler = null;
        }
      }, 250); // Wait slightly longer than the 0.2s CSS transition
    };
    
    // Listen for VideoJS user inactivity (when controls fade out)
    player.one('userinactive', inactivityHandler);
  };

  /**
   * Handle mobile touch interaction
   */
  const handleMobileTouchInteraction = () => {
    // Show the touch overlay and mark interaction as active
    player.addClass('cld-mobile-touch-active');
    isInteractionActive = true;
    
    // Update state based on current playback
    updateTouchState();
    
    // Set up listener for VideoJS user activity events to sync with controls
    setupInactivityHandler();
  };

  /**
   * Setup play/pause event listeners
   */
  const setupPlayPauseListeners = () => {
    // Listen to play/pause events to update mobile touch state (only during active mobile interactions)
    playHandler = () => {
      if (isMobile && isInteractionActive) {
        updateTouchState();
      }
    };

    pauseEventHandler = () => {
      if (isMobile && isInteractionActive) {
        updateTouchState();
      }
    };

    player.on('play', playHandler);
    player.on('pause', pauseEventHandler);
  };

  /**
   * Setup dispose handler for cleanup
   */
  const setupDispose = (playerElement) => {
    disposeHandler = () => {
      if (touchHandler) {
        playerElement.removeEventListener('touchend', touchHandler);
      }
      
      removePauseHandler();
      
      // Clean up inactivity handler
      if (inactivityHandler) {
        player.off('userinactive', inactivityHandler);
        inactivityHandler = null;
      }
      
      // Clean up play/pause listeners
      if (playHandler) {
        player.off('play', playHandler);
      }
      if (pauseEventHandler) {
        player.off('pause', pauseEventHandler);
      }
      
      isSetup = false;
      isInteractionActive = false;
    };

    player.on('dispose', disposeHandler);
  };

  /**
   * Setup handlers when player is ready
   */
  const setupWhenReady = () => {
    const setup = () => {
      const playerElement = player.el();

      if (!playerElement) {
        setTimeout(setup, 100);
        return;
      }

      setupTouchHandler(playerElement);
      setupPlayPauseListeners();
      setupDispose(playerElement);
      
      isSetup = true;
    };

    if (player && player.isReady_) {
      setup();
    } else if (player) {
      player.ready(setup);
    } else {
      setTimeout(() => init(), 200);
    }
  };

  /**
   * Initialize the mobile touch controls
   */
  const init = () => {
    detectMobile();
    
    if (!isMobile) {
      return;
    }

    if (isSetup) {
      return;
    }

    setupWhenReady();
  };

  /**
   * Dispose of the plugin
   */
  const dispose = () => {
    if (disposeHandler) {
      disposeHandler();
    }
  };

  // Initialize
  init();

  // Public methods
  return {
    init,
    dispose
  };
};

/**
 * Export as VideoJS plugin function
 */
export default function(opts = {}) {
  return mobileTouchControls(opts, this);
}
