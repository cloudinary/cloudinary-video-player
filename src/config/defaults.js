const aboutMenuItem = {
  label: 'About this player',
  href: 'http://cloudinary.com/documentation/cloudinary_video_player'
};

const contextMenuContent = (player) => {
  const isLooping = player.loop();
  const isPaused = player.paused();
  const isMuted = player.muted();
  const isFullscreen = player.isFullscreen();

  if (!player.controls()) {
    return [aboutMenuItem];
  }

  return [
    {
      label: isLooping ? 'Unloop' : 'Loop',
      listener: () => {
        player.loop(!isLooping);
      }
    },
    {
      label: isPaused ? 'Play' : 'Pause',
      listener: () => {
        if (isPaused) {
          player.play();
        } else {
          player.pause();
        }
      }
    },
    {
      label: isMuted ? 'Unmute' : 'Mute',
      listener: () => {
        player.muted(!isMuted);
      }
    },
    {
      label: isFullscreen ? 'Exit Fullscreen' : 'Fullscreen',
      listener: () => {
        if (isFullscreen) {
          player.exitFullscreen();
        } else {
          player.requestFullscreen();
        }
      }
    },
    aboutMenuItem
  ];
};

export default {
  skin: 'dark',
  controls: false,
  preload: false,
  loop: false,
  muted: false,
  posterOptions: {},
  sourceTypes: ['webm', 'mp4', 'ogv'],
  contextMenu: {
    content: contextMenuContent
  },
  analytics: false,
  playedEventPercents: [25, 50, 75, 100]
};
