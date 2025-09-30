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
class MobileTouchControls {

  constructor(player, opts = {}) {
    this.player = player;
    this.options = opts;
    
    // State management
    this.isMobile = false;
    this.isSetup = false;
    this.isInteractionActive = false;
    
    // Handler references for cleanup
    this.inactivityHandler = null;
    this.pauseHandler = null;
    this.pauseButton = null;
    this.originalHandleClick = null;
    this.touchHandler = null;
    
    // Event handler references
    this.playHandler = null;
    this.pauseEventHandler = null;
    this.disposeHandler = null;
  }

  /**
   * Initialize the mobile touch controls
   */
  init() {
    this.detectMobile();
    
    if (!this.isMobile) {
      return;
    }

    if (this.isSetup) {
      return;
    }

    this.setupWhenReady();
  }

  /**
   * Detect if current device is mobile
   */
  detectMobile() {
    this.isMobile = videojs.browser.IS_IOS || 
                    videojs.browser.IS_ANDROID || 
                    /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Setup handlers when player is ready
   */
  setupWhenReady() {
    const setup = () => {
      const playerElement = this.player.el();

      if (!playerElement) {
        setTimeout(setup, 100);
        return;
      }

      this.setupTouchHandler(playerElement);
      this.setupPlayPauseListeners();
      this.setupDispose(playerElement);
      
      this.isSetup = true;
    };

    if (this.player && this.player.isReady_) {
      setup();
    } else if (this.player) {
      this.player.ready(setup);
    } else {
      setTimeout(() => this.init(), 200);
    }
  }

  /**
   * Setup main touch event handler
   */
  setupTouchHandler(playerElement) {
    this.touchHandler = (event) => {
      // Only handle touch events on the player container, not on controls
      const target = event.target;
      const isControlElement = target.closest('.vjs-control-bar') || 
                              target.closest('.vjs-menu') ||
                              target.matches('.vjs-control, .vjs-button');

      if (isControlElement) {
        return;
      }

      // Check if video has started (show big play button for both playing and paused states)
      const hasStarted = this.player.hasStarted();
      
      if (hasStarted) {
        this.handleMobileTouchInteraction();
      }
    };

    playerElement.addEventListener('touchend', this.touchHandler, { passive: true });
  }

  /**
   * Handle mobile touch interaction
   */
  handleMobileTouchInteraction() {
    // Show the touch overlay and mark interaction as active
    this.player.addClass('cld-mobile-touch-active');
    this.isInteractionActive = true;
    
    // Update state based on current playback
    this.updateTouchState();
    
    // Set up listener for VideoJS user activity events to sync with controls
    this.setupInactivityHandler();
  }

  /**
   * Setup play/pause event listeners
   */
  setupPlayPauseListeners() {
    // Listen to play/pause events to update mobile touch state (only during active mobile interactions)
    this.playHandler = () => {
      if (this.isMobile && this.isInteractionActive) {
        this.updateTouchState();
      }
    };

    this.pauseEventHandler = () => {
      if (this.isMobile && this.isInteractionActive) {
        this.updateTouchState();
      }
    };

    this.player.on('play', this.playHandler);
    this.player.on('pause', this.pauseEventHandler);
  }

  /**
   * Setup inactivity handler to sync with VideoJS controls
   */
  setupInactivityHandler() {
    // Remove any existing inactivity handler
    if (this.inactivityHandler) {
      this.player.off('userinactive', this.inactivityHandler);
    }
    
    // Create handler that syncs with VideoJS control bar timing
    this.inactivityHandler = () => {
      // Start fade-out when VideoJS controls fade out
      this.player.removeClass('cld-mobile-touch-active');
      
      // Wait for CSS transition to complete before cleanup
      setTimeout(() => {
        this.player.removeClass('cld-mobile-touch-playing');
        this.removePauseHandler();
        this.isInteractionActive = false; // End mobile interaction session
        
        // Remove the inactivity handler since this touch session is done
        if (this.inactivityHandler) {
          this.player.off('userinactive', this.inactivityHandler);
          this.inactivityHandler = null;
        }
      }, 250); // Wait slightly longer than the 0.2s CSS transition
    };
    
    // Listen for VideoJS user inactivity (when controls fade out)
    this.player.one('userinactive', this.inactivityHandler);
  }

  /**
   * Update touch state based on playback status
   */
  updateTouchState() {
    const isPlaying = !this.player.paused();
    
    if (isPlaying) {
      this.player.addClass('cld-mobile-touch-playing');
      this.setupPauseHandler();
    } else {
      this.player.removeClass('cld-mobile-touch-playing');
      this.removePauseHandler();
    }
  }

  /**
   * Setup custom pause handler for big play button
   */
  setupPauseHandler() {
    // Remove any existing handler first
    this.removePauseHandler();

    // Find the big play button
    const bigPlayButton = this.player.el().querySelector('.vjs-big-play-button');
    if (!bigPlayButton) {
      return;
    }

    // Create custom pause handler that completely overrides default behavior
    this.pauseHandler = (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      
      // Pause the video
      if (!this.player.paused()) {
        this.player.pause();
        
        // Immediately update the mobile touch state
        setTimeout(() => {
          this.updateTouchState();
          
          // Force show the button briefly to give visual feedback
          if (this.player.hasClass('cld-mobile-touch-active')) {
            this.player.clearTimeout(this._mobileTouchTimeout);
            this._mobileTouchTimeout = this.player.setTimeout(() => {
              this.player.removeClass('cld-mobile-touch-active');
            }, 2000);
          }
        }, 50);
      }
      
      return false;
    };

    // Add multiple event listeners to ensure we catch the click
    bigPlayButton.addEventListener('click', this.pauseHandler, { capture: true });
    bigPlayButton.addEventListener('touchend', this.pauseHandler, { capture: true });
    bigPlayButton.addEventListener('mousedown', this.pauseHandler, { capture: true });
    
    // Also disable the VideoJS component's click handling temporarily
    const bigPlayButtonComponent = this.player.getChild('bigPlayButton');
    if (bigPlayButtonComponent) {
      this.originalHandleClick = bigPlayButtonComponent.handleClick;
      bigPlayButtonComponent.handleClick = () => {
        // Override with our pause behavior
        this.pauseHandler({ 
          preventDefault: () => {}, 
          stopPropagation: () => {}, 
          stopImmediatePropagation: () => {} 
        });
      };
    }
    
    // Store reference to the button for cleanup
    this.pauseButton = bigPlayButton;
  }

  /**
   * Remove pause handler and restore original behavior
   */
  removePauseHandler() {
    if (this.pauseHandler && this.pauseButton) {
      // Remove all event listeners
      this.pauseButton.removeEventListener('click', this.pauseHandler, { capture: true });
      this.pauseButton.removeEventListener('touchend', this.pauseHandler, { capture: true });
      this.pauseButton.removeEventListener('mousedown', this.pauseHandler, { capture: true });
      
      // Restore original VideoJS component behavior
      const bigPlayButtonComponent = this.player.getChild('bigPlayButton');
      if (bigPlayButtonComponent && this.originalHandleClick) {
        bigPlayButtonComponent.handleClick = this.originalHandleClick;
        this.originalHandleClick = null;
      }
      
      this.pauseHandler = null;
      this.pauseButton = null;
    }
  }

  /**
   * Setup dispose handler for cleanup
   */
  setupDispose(playerElement) {
    this.disposeHandler = () => {
      if (this.touchHandler) {
        playerElement.removeEventListener('touchend', this.touchHandler);
      }
      
      this.removePauseHandler();
      
      // Clean up inactivity handler
      if (this.inactivityHandler) {
        this.player.off('userinactive', this.inactivityHandler);
        this.inactivityHandler = null;
      }
      
      // Clean up play/pause listeners
      if (this.playHandler) {
        this.player.off('play', this.playHandler);
      }
      if (this.pauseEventHandler) {
        this.player.off('pause', this.pauseEventHandler);
      }
      
      this.isSetup = false;
      this.isInteractionActive = false;
    };

    this.player.on('dispose', this.disposeHandler);
  }

  /**
   * Dispose of the plugin
   */
  dispose() {
    if (this.disposeHandler) {
      this.disposeHandler();
    }
  }
}

/**
 * Export as VideoJS plugin function
 */
export default function(opts = {}) {
  const plugin = new MobileTouchControls(this, opts);
  plugin.init();
  return plugin;
}
