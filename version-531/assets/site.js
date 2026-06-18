(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-nav");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    var hero = document.querySelector(".hero");
    if (hero) {
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
    }
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var region = scope.querySelector("[data-filter-region]");
      var type = scope.querySelector("[data-filter-type]");
      var year = scope.querySelector("[data-filter-year]");
      var sort = scope.querySelector("[data-sort-mode]");
      var counter = scope.querySelector("[data-result-count]");
      var grid = scope.querySelector("[data-movie-grid]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));

      if (input && input.getAttribute("data-use-query") === "true") {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query) {
          input.value = query;
        }
      }

      function sortCards() {
        if (!grid || !sort) {
          return;
        }
        var mode = sort.value;
        var sorted = cards.slice();
        if (mode === "year-desc") {
          sorted.sort(function (a, b) {
            return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
          });
        } else if (mode === "year-asc") {
          sorted.sort(function (a, b) {
            return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
          });
        } else if (mode === "title") {
          sorted.sort(function (a, b) {
            return String(a.dataset.title || "").localeCompare(String(b.dataset.title || ""), "zh-Hans-CN");
          });
        } else {
          sorted.sort(function (a, b) {
            return Number(a.dataset.index || 0) - Number(b.dataset.index || 0);
          });
        }
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      function apply() {
        var query = normalize(input ? input.value : "");
        var regionValue = normalize(region ? region.value : "");
        var typeValue = normalize(type ? type.value : "");
        var yearValue = normalize(year ? year.value : "");
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize(card.dataset.search);
          var matchQuery = !query || text.indexOf(query) !== -1;
          var matchRegion = !regionValue || normalize(card.dataset.region) === regionValue;
          var matchType = !typeValue || normalize(card.dataset.type) === typeValue;
          var matchYear = !yearValue || normalize(card.dataset.year) === yearValue;
          var show = matchQuery && matchRegion && matchType && matchYear;
          card.classList.toggle("is-filter-hidden", !show);
          if (show) {
            visible += 1;
          }
        });

        if (counter) {
          counter.textContent = String(visible);
        }
      }

      [input, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      if (sort) {
        sort.addEventListener("change", function () {
          sortCards();
          apply();
        });
      }

      sortCards();
      apply();
    });
  }

  function setupPlayer(source) {
    ready(function () {
      var video = document.getElementById("movie-video");
      var layer = document.getElementById("poster-layer");
      if (!video || !source) {
        return;
      }
      var started = false;
      var hls = null;

      function playVideo() {
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {});
        }
      }

      function start() {
        if (layer) {
          layer.classList.add("is-hidden");
        }
        video.controls = true;
        if (started) {
          playVideo();
          return;
        }
        started = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          playVideo();
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
          });
          return;
        }

        video.src = source;
        playVideo();
      }

      if (layer) {
        layer.addEventListener("click", start);
      }
      video.addEventListener("click", function () {
        if (!started) {
          start();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  }

  ready(function () {
    initMobileMenu();
    initHero();
    initFilters();
  });

  window.MovieSite = {
    setupPlayer: setupPlayer
  };
}());
