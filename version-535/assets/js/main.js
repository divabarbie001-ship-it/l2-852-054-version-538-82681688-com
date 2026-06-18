(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var header = document.querySelector(".site-header");
    var button = document.querySelector(".nav-toggle");
    if (!header || !button) {
      return;
    }
    button.addEventListener("click", function () {
      var isOpen = header.classList.toggle("is-open");
      button.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    Array.prototype.forEach.call(document.querySelectorAll(".nav-links a"), function (link) {
      link.addEventListener("click", function () {
        header.classList.remove("is-open");
        button.setAttribute("aria-expanded", "false");
      });
    });
  }

  function setupCarousel() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-carousel]"), function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide]"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-carousel-dot]"));
      var prev = carousel.querySelector("[data-carousel-prev]");
      var next = carousel.querySelector("[data-carousel-next]");
      if (slides.length < 2) {
        return;
      }
      var index = slides.findIndex(function (slide) {
        return slide.classList.contains("is-active");
      });
      if (index < 0) {
        index = 0;
      }
      var timer = null;
      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
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
      if (prev) {
        prev.addEventListener("click", function () {
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
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(parseInt(dot.getAttribute("data-carousel-dot"), 10) || 0);
          start();
        });
      });
      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
      show(index);
      start();
    });
  }

  function setupSearchForms() {
    Array.prototype.forEach.call(document.querySelectorAll(".site-search-form"), function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input) {
          return;
        }
        var value = input.value.trim();
        if (!value) {
          event.preventDefault();
          window.location.href = form.getAttribute("action") || "./search.html";
        }
      });
    });
  }

  function setupFilters() {
    var query = new URLSearchParams(window.location.search).get("q") || "";
    Array.prototype.forEach.call(document.querySelectorAll("[data-filter-scope]"), function (scope) {
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var input = scope.querySelector(".filter-input");
      var year = scope.querySelector(".filter-year");
      var region = scope.querySelector(".filter-region");
      var empty = scope.querySelector(".empty-state");
      var form = scope.querySelector("[data-filter-form]");
      if (!cards.length) {
        return;
      }
      if (input && query) {
        input.value = query;
      }
      function apply() {
        var word = input ? input.value.trim().toLowerCase() : "";
        var selectedYear = year ? year.value : "";
        var selectedRegion = region ? region.value : "";
        var shown = 0;
        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || "").toLowerCase();
          var cardYear = card.getAttribute("data-year") || "";
          var cardRegion = card.getAttribute("data-region") || "";
          var ok = true;
          if (word && haystack.indexOf(word) === -1) {
            ok = false;
          }
          if (selectedYear && cardYear !== selectedYear) {
            ok = false;
          }
          if (selectedRegion && cardRegion !== selectedRegion) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            shown += 1;
          }
        });
        if (empty) {
          empty.hidden = shown !== 0;
        }
      }
      if (input) {
        input.addEventListener("input", apply);
      }
      if (year) {
        year.addEventListener("change", apply);
      }
      if (region) {
        region.addEventListener("change", apply);
      }
      if (form) {
        form.addEventListener("submit", function (event) {
          event.preventDefault();
          apply();
        });
      }
      apply();
    });
  }

  ready(function () {
    setupNavigation();
    setupCarousel();
    setupSearchForms();
    setupFilters();
  });
})();
