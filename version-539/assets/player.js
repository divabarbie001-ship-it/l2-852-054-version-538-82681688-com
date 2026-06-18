(function () {
  function initMoviePlayer(playerId, source) {
    var box = document.getElementById(playerId);
    if (!box) {
      return;
    }

    var video = box.querySelector('video');
    var overlay = box.querySelector('[data-player-overlay]');
    var toggle = box.querySelector('[data-player-toggle]');
    var mute = box.querySelector('[data-player-mute]');
    var fullscreen = box.querySelector('[data-player-fullscreen]');
    var error = box.querySelector('[data-player-error]');
    var hlsInstance = null;

    if (!video) {
      return;
    }

    function setError() {
      if (error) {
        error.hidden = false;
      }
      if (overlay) {
        overlay.classList.remove('is-hidden');
      }
    }

    function attachSource() {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }

      if (globalThis.Hls && globalThis.Hls.isSupported()) {
        hlsInstance = new globalThis.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(globalThis.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            setError();
          }
        });
        return;
      }

      video.src = source;
    }

    function playVideo() {
      if (error) {
        error.hidden = true;
      }
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    function toggleVideo() {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    }

    function toggleMute() {
      video.muted = !video.muted;
      if (mute) {
        mute.textContent = video.muted ? '声音' : '静音';
      }
    }

    function toggleFullscreen() {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (box.requestFullscreen) {
        box.requestFullscreen();
      }
    }

    attachSource();

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }
    if (toggle) {
      toggle.addEventListener('click', toggleVideo);
    }
    if (mute) {
      mute.addEventListener('click', toggleMute);
    }
    if (fullscreen) {
      fullscreen.addEventListener('click', toggleFullscreen);
    }
    video.addEventListener('click', toggleVideo);
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      if (toggle) {
        toggle.textContent = '暂停';
      }
    });
    video.addEventListener('pause', function () {
      if (toggle) {
        toggle.textContent = '播放';
      }
    });
    video.addEventListener('error', setError);
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  globalThis.initMoviePlayer = initMoviePlayer;
})();
