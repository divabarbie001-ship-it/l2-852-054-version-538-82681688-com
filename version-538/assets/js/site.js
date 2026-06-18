(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeText(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function initYear() {
    selectAll("[data-year]").forEach(function (node) {
      node.textContent = new Date().getFullYear();
    });
  }

  function initImages() {
    document.addEventListener("error", function (event) {
      var target = event.target;
      if (target && target.matches && target.matches("img[data-cover]")) {
        target.classList.add("image-missing");
        target.alt = "";
      }
    }, true);
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var slides = selectAll(".hero-slide");
    var dots = selectAll(".hero-dot");
    var previous = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });
    if (previous) {
      previous.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    var hero = document.querySelector(".hero");
    if (hero) {
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
    }
    show(0);
    start();
  }

  function movieMatches(movie, query) {
    var text = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.tags].join(" ").toLowerCase();
    return text.indexOf(query) !== -1;
  }

  function initHeaderSearch() {
    var inputs = selectAll(".site-search-input");
    if (!inputs.length || !window.SearchIndex) {
      return;
    }
    inputs.forEach(function (input) {
      var panel = input.parentElement.querySelector(".search-panel");
      if (!panel) {
        return;
      }
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        if (!query) {
          panel.classList.remove("open");
          panel.innerHTML = "";
          return;
        }
        var results = window.SearchIndex.filter(function (movie) {
          return movieMatches(movie, query);
        }).slice(0, 12);
        if (!results.length) {
          panel.innerHTML = '<div class="search-empty">没有找到匹配影片</div>';
        } else {
          panel.innerHTML = results.map(function (movie) {
            return '<a class="search-result" href="' + movie.url + '"><strong>' + escapeText(movie.title) + '</strong><span>' + escapeText(movie.year + " · " + movie.region + " · " + movie.genre) + '</span></a>';
          }).join("");
        }
        panel.classList.add("open");
      });
      input.addEventListener("focus", function () {
        if (panel.innerHTML) {
          panel.classList.add("open");
        }
      });
      document.addEventListener("click", function (event) {
        if (!input.parentElement.contains(event.target)) {
          panel.classList.remove("open");
        }
      });
    });
  }

  function initCatalogFilter() {
    var catalog = document.querySelector("[data-catalog]");
    if (!catalog) {
      return;
    }
    var input = document.querySelector(".catalog-search");
    var chips = selectAll(".filter-chip");
    var cards = selectAll(".movie-card, .index-card", catalog);
    var activeYear = "";
    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var text = [card.getAttribute("data-title"), card.getAttribute("data-year"), card.getAttribute("data-tags")].join(" ").toLowerCase();
        var year = card.getAttribute("data-year") || "";
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchYear = !activeYear || year === activeYear;
        card.style.display = matchQuery && matchYear ? "" : "none";
      });
    }
    if (input) {
      input.addEventListener("input", apply);
    }
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeYear = chip.getAttribute("data-filter-year") || "";
        chips.forEach(function (item) {
          item.classList.toggle("active", item === chip);
        });
        apply();
      });
    });
  }

  function attachStream(video, source) {
    if (!source) {
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hls = hls;
    } else {
      video.src = source;
    }
  }

  function initPlayers() {
    selectAll(".player-wrap[data-stream]").forEach(function (wrap) {
      var video = wrap.querySelector("video");
      var button = wrap.querySelector(".player-button");
      var overlay = wrap.querySelector(".player-overlay");
      var source = wrap.getAttribute("data-stream");
      var loaded = false;
      function loadAndPlay() {
        if (!video) {
          return;
        }
        if (!loaded) {
          attachStream(video, source);
          loaded = true;
        }
        var playTask = video.play();
        if (playTask && playTask.catch) {
          playTask.catch(function () {});
        }
      }
      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          loadAndPlay();
        });
      }
      if (overlay) {
        overlay.addEventListener("click", loadAndPlay);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (!loaded) {
            attachStream(video, source);
            loaded = true;
          }
        });
        video.addEventListener("play", function () {
          wrap.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
          wrap.classList.remove("is-playing");
        });
        video.addEventListener("ended", function () {
          wrap.classList.remove("is-playing");
        });
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initYear();
    initImages();
    initMenu();
    initHero();
    initHeaderSearch();
    initCatalogFilter();
    initPlayers();
  });
})();
