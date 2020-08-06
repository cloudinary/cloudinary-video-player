const contextMenuContent = (player) => {

  const isLooping = player.loop();
  const isPaused = player.paused();
  const isMuted = player.muted();
  const isFullscreen = player.isFullscreen();

  const aboutMenuItem = {
    label: '<span class="player-version">Cloudinary Player v' + VERSION + '</span>'
  };

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

export default contextMenuContent;
