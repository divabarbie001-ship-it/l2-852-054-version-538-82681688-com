(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero-carousel]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        restart();
      });
    });

    showSlide(0);
    restart();
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach(function (panel) {
    var input = panel.querySelector('[data-search-input]');
    var grid = document.querySelector('[data-card-grid]');
    var empty = document.querySelector('[data-empty-state]');
    var activeFilters = {
      region: '',
      type: '',
      year: ''
    };

    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));

    function applyFilters() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesRegion = !activeFilters.region || card.getAttribute('data-region') === activeFilters.region;
        var matchesType = !activeFilters.type || card.getAttribute('data-type') === activeFilters.type;
        var matchesYear = !activeFilters.year || card.getAttribute('data-year') === activeFilters.year;
        var visible = matchesQuery && matchesRegion && matchesType && matchesYear;

        card.style.display = visible ? '' : 'none';

        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', shown === 0);
      }
    }

    panel.addEventListener('click', function (event) {
      var button = event.target.closest('[data-filter-key]');

      if (!button) {
        return;
      }

      var key = button.getAttribute('data-filter-key');
      var value = button.getAttribute('data-filter-value') || '';
      activeFilters[key] = value;

      Array.prototype.slice.call(panel.querySelectorAll('[data-filter-key="' + key + '"]')).forEach(function (item) {
        item.classList.toggle('active', item === button);
      });

      applyFilters();
    });

    if (input) {
      input.addEventListener('input', applyFilters);
    }

    applyFilters();
  });
})();
