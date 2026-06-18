(function () {
  var video = document.querySelector('[data-player-video]');
  var startButton = document.querySelector('[data-player-start]');

  if (!video) {
    return;
  }

  var source = video.getAttribute('data-video-url');
  var attached = false;

  function attachSource() {
    if (attached || !source) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function playVideo() {
    attachSource();

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  attachSource();

  if (startButton) {
    startButton.addEventListener('click', function () {
      startButton.classList.add('is-hidden');
      playVideo();
    });
  }

  video.addEventListener('play', function () {
    if (startButton) {
      startButton.classList.add('is-hidden');
    }
  });

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });
})();
