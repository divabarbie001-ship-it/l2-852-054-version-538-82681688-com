document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobilePanel = document.getElementById("mobilePanel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      var open = mobilePanel.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var previous = hero.querySelector(".hero-control.prev");
    var next = hero.querySelector(".hero-control.next");
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    if (previous) {
      previous.addEventListener("click", function () {
        showSlide(current - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    setInterval(function () {
      showSlide(current + 1);
    }, 5000);
  }

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get("q") || "";
  var panels = document.querySelectorAll("[data-filter-panel]");

  panels.forEach(function (panel) {
    var input = panel.querySelector("[data-filter-input]");
    var region = panel.querySelector("[data-filter-region]");
    var type = panel.querySelector("[data-filter-type]");
    var year = panel.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));
    var empty = document.querySelector("[data-empty-state]");

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function normalize(value) {
      return (value || "").toString().toLowerCase().trim();
    }

    function applyFilters() {
      var q = normalize(input ? input.value : "");
      var regionValue = region ? region.value : "";
      var typeValue = type ? type.value : "";
      var yearValue = year ? year.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var regionMatch = !regionValue || card.getAttribute("data-region") === regionValue;
        var typeMatch = !typeValue || card.getAttribute("data-type") === typeValue;
        var yearMatch = !yearValue || card.getAttribute("data-year") === yearValue;
        var queryMatch = !q || text.indexOf(q) !== -1;
        var show = regionMatch && typeMatch && yearMatch && queryMatch;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }

    [input, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  });
});
