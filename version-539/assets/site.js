(function () {
  function toLowerText(value) {
    return String(value || '').toLowerCase();
  }

  function setupMobileNavigation() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupSearchForms() {
    document.querySelectorAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        if (!value) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
        }
      });
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var nextIndex = Number(dot.getAttribute('data-hero-dot')) || 0;
        show(nextIndex);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function fillFilterOptions(cards, selector, attribute) {
    var select = document.querySelector(selector);
    if (!select) {
      return;
    }
    var values = Array.prototype.slice.call(cards)
      .map(function (card) {
        return card.getAttribute(attribute) || '';
      })
      .filter(Boolean)
      .filter(function (value, index, array) {
        return array.indexOf(value) === index;
      })
      .sort(function (a, b) {
        return String(b).localeCompare(String(a), 'zh-Hans-CN');
      });
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupCardFilters() {
    var cards = document.querySelectorAll('[data-movie-card]');
    var textInput = document.querySelector('[data-card-filter]');
    var regionSelect = document.querySelector('[data-region-filter]');
    var yearSelect = document.querySelector('[data-year-filter]');
    var emptyState = document.querySelector('[data-empty-state]');
    if (!cards.length || (!textInput && !regionSelect && !yearSelect)) {
      return;
    }

    fillFilterOptions(cards, '[data-region-filter]', 'data-region');
    fillFilterOptions(cards, '[data-year-filter]', 'data-year');

    function apply() {
      var keyword = textInput ? toLowerText(textInput.value.trim()) : '';
      var region = regionSelect ? regionSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = toLowerText(card.getAttribute('data-search'));
        var matchText = !keyword || text.indexOf(keyword) !== -1;
        var matchRegion = !region || card.getAttribute('data-region') === region;
        var matchYear = !year || card.getAttribute('data-year') === year;
        var shouldShow = matchText && matchRegion && matchYear;
        card.hidden = !shouldShow;
        if (shouldShow) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    [textInput, regionSelect, yearSelect].forEach(function (element) {
      if (element) {
        element.addEventListener('input', apply);
        element.addEventListener('change', apply);
      }
    });
  }

  function cardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '' +
      '<a class="movie-card" href="' + escapeHtml(movie.url) + '">' +
        '<div class="card-cover">' +
          '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="cover-chip">' + escapeHtml(movie.region) + '</span>' +
        '</div>' +
        '<div class="card-body">' +
          '<h3>' + escapeHtml(movie.title) + '</h3>' +
          '<p>' + escapeHtml(movie.oneLine) + '</p>' +
          '<div class="card-tags">' + tags + '</div>' +
          '<div class="card-meta"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.year) + '</span></div>' +
        '</div>' +
      '</a>';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setupSearchPage() {
    var results = document.querySelector('[data-search-results]');
    var status = document.querySelector('[data-search-status]');
    var pageInput = document.querySelector('[data-search-input]');
    if (!results || !status || !Array.isArray(window.MOVIE_SEARCH_INDEX)) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    if (pageInput) {
      pageInput.value = query;
    }
    if (!query) {
      status.textContent = '请输入关键词开始搜索';
      results.innerHTML = '';
      return;
    }
    var lowered = toLowerText(query);
    var matches = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
      var text = toLowerText([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        (movie.tags || []).join(' '),
        movie.oneLine,
        movie.summary
      ].join(' '));
      return text.indexOf(lowered) !== -1;
    });
    status.textContent = '搜索“' + query + '”的相关结果：' + matches.length + ' 条';
    results.innerHTML = matches.map(cardTemplate).join('');
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNavigation();
    setupSearchForms();
    setupHeroCarousel();
    setupCardFilters();
    setupSearchPage();
  });
})();
