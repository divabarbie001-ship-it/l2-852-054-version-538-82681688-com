
(function () {
  var body = document.body;
  var menuButton = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      var open = body.classList.toggle("menu-open");
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var carousel = document.querySelector("[data-carousel]");

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var index = 0;

    var showSlide = function (nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    };

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
      });
    });

    window.setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  var homeSearchForm = document.querySelector("[data-home-search]");

  if (homeSearchForm) {
    homeSearchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = homeSearchForm.querySelector("input");
      var query = input ? input.value.trim() : "";
      var target = "search.html";
      if (query) {
        target += "?q=" + encodeURIComponent(query);
      }
      window.location.href = target;
    });
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll(".search-input"));

  var applyFilter = function (input) {
    var query = input.value.trim().toLowerCase();
    var scope = input.closest("main") || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".filter-card"));

    cards.forEach(function (card) {
      var text = [
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-tags")
      ].join(" ").toLowerCase();
      card.style.display = !query || text.indexOf(query) !== -1 ? "" : "none";
    });
  };

  if (searchInputs.length) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    searchInputs.forEach(function (input) {
      if (initialQuery && !input.value) {
        input.value = initialQuery;
      }
      applyFilter(input);
      input.addEventListener("input", function () {
        applyFilter(input);
      });
    });
  }

  var players = Array.prototype.slice.call(document.querySelectorAll(".movie-player"));

  players.forEach(function (player) {
    var video = player.querySelector("video");
    var button = player.querySelector(".play-overlay");
    var hlsInstance = null;
    var started = false;

    if (!video || !button) {
      return;
    }

    var start = function () {
      var stream = video.getAttribute("data-stream");

      if (!stream) {
        return;
      }

      button.hidden = true;

      if (started) {
        video.play().catch(function () {});
        return;
      }

      started = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        video.play().catch(function () {});
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }

      video.src = stream;
      video.play().catch(function () {});
    };

    button.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
