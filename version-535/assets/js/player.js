(function () {
  var loaderPromise = null;

  function loadHls(callback, fallback) {
    if (window.Hls) {
      callback();
      return;
    }
    if (!loaderPromise) {
      loaderPromise = new Promise(function (resolve, reject) {
        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    loaderPromise.then(callback).catch(fallback);
  }

  window.initMoviePlayer = function (streamUrl) {
    var box = document.querySelector(".movie-player");
    if (!box || !streamUrl) {
      return;
    }
    var video = box.querySelector("video");
    var cover = box.querySelector(".player-cover");
    if (!video) {
      return;
    }
    var started = false;
    var hlsInstance = null;

    function playVideo() {
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    function useNative() {
      video.src = streamUrl;
      playVideo();
    }

    function attachHls() {
      if (window.Hls && window.Hls.isSupported()) {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
        hlsInstance = new window.Hls({
          maxBufferLength: 36,
          enableWorker: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
      } else {
        useNative();
      }
    }

    function start() {
      if (!started) {
        started = true;
        if (cover) {
          cover.classList.add("is-hidden");
        }
        video.setAttribute("controls", "controls");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          useNative();
        } else {
          loadHls(attachHls, useNative);
        }
      } else if (video.paused) {
        playVideo();
      }
    }

    if (cover) {
      cover.addEventListener("click", start);
    }
    box.addEventListener("click", function (event) {
      if (event.target === box) {
        start();
      }
    });
    video.addEventListener("click", function () {
      if (!started) {
        start();
      }
    });
  };
})();
