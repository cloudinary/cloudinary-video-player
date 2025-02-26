const checkIfVideoIsAvailable = (videoUrl, videoType = 'default') => {
  return new Promise((resolve, reject) => {
    const tempVideo = document.createElement('video');
    tempVideo.setAttribute('crossorigin', 'anonymous');
    const targetEvent = videoType === 'live' ? 'onprogress' : 'canplay';
    tempVideo[targetEvent] = () => {
      tempVideo.onerror = null;
      tempVideo[targetEvent] = null;
      resolve();
    };
    tempVideo.onerror = () => reject();
    tempVideo.src = videoUrl;
    tempVideo.load();
  });
};

const isVideoInReadyState = (readyState) => {
  return readyState >= (/iPad|iPhone|iPod/.test(navigator.userAgent) ? 1 : 4);
};

export { checkIfVideoIsAvailable, isVideoInReadyState };
