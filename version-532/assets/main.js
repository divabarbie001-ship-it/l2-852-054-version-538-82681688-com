(function() {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function() {
    var menuButton = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-site-nav]');

    if (menuButton && nav) {
      menuButton.addEventListener('click', function() {
        nav.classList.toggle('is-open');
      });
    }

    var carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
      var next = carousel.querySelector('[data-hero-next]');
      var prev = carousel.querySelector('[data-hero-prev]');
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function(slide, i) {
          slide.classList.toggle('is-active', i === index);
        });

        dots.forEach(function(dot, i) {
          dot.classList.toggle('is-active', i === index);
        });
      }

      function start() {
        stop();
        timer = setInterval(function() {
          show(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          clearInterval(timer);
        }
      }

      dots.forEach(function(dot, i) {
        dot.addEventListener('click', function() {
          show(i);
          start();
        });
      });

      if (next) {
        next.addEventListener('click', function() {
          show(index + 1);
          start();
        });
      }

      if (prev) {
        prev.addEventListener('click', function() {
          show(index - 1);
          start();
        });
      }

      carousel.addEventListener('mouseenter', stop);
      carousel.addEventListener('mouseleave', start);
      show(0);
      start();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]')).forEach(function(panel) {
      var target = panel.getAttribute('data-target') || '.movie-card';
      var cards = Array.prototype.slice.call(document.querySelectorAll(target));
      var queryInput = panel.querySelector('[data-filter-query]');
      var regionSelect = panel.querySelector('[data-filter-region]');
      var typeSelect = panel.querySelector('[data-filter-type]');
      var yearSelect = panel.querySelector('[data-filter-year]');
      var categorySelect = panel.querySelector('[data-filter-category]');

      function valueOf(control) {
        return control ? control.value.trim().toLowerCase() : '';
      }

      function applyFilters() {
        var query = valueOf(queryInput);
        var region = valueOf(regionSelect);
        var type = valueOf(typeSelect);
        var year = valueOf(yearSelect);
        var category = valueOf(categorySelect);

        cards.forEach(function(card) {
          var title = (card.getAttribute('data-title') || '').toLowerCase();
          var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
          var cardType = (card.getAttribute('data-type') || '').toLowerCase();
          var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
          var cardCategory = (card.getAttribute('data-category') || '').toLowerCase();
          var keywords = (card.getAttribute('data-keywords') || '').toLowerCase();
          var haystack = [title, cardRegion, cardType, cardYear, cardCategory, keywords].join(' ');
          var matched = true;

          if (query && haystack.indexOf(query) === -1) {
            matched = false;
          }

          if (region && cardRegion !== region) {
            matched = false;
          }

          if (type && cardType !== type) {
            matched = false;
          }

          if (year && cardYear !== year) {
            matched = false;
          }

          if (category && cardCategory !== category) {
            matched = false;
          }

          card.hidden = !matched;
        });
      }

      [queryInput, regionSelect, typeSelect, yearSelect, categorySelect].forEach(function(control) {
        if (!control) {
          return;
        }

        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      });
    });
  });
}());
