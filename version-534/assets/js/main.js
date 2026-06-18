(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var previous = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === active);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === active);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        stopHero();
        timer = window.setInterval(function () {
            showSlide(active + 1);
        }, 5000);
    }

    function stopHero() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    if (slides.length) {
        showSlide(0);
        startHero();
        if (previous) {
            previous.addEventListener('click', function () {
                showSlide(active - 1);
                startHero();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                showSlide(active + 1);
                startHero();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                showSlide(i);
                startHero();
            });
        });
    }

    var filterAreas = Array.prototype.slice.call(document.querySelectorAll('[data-filter-area]'));
    filterAreas.forEach(function (area) {
        var input = area.querySelector('[data-search-input]');
        var region = area.querySelector('[data-filter-region]');
        var year = area.querySelector('[data-filter-year]');
        var type = area.querySelector('[data-filter-type]');
        var grid = area.querySelector('[data-card-grid]');
        var empty = area.querySelector('[data-empty-state]');
        var cards = Array.prototype.slice.call(area.querySelectorAll('[data-title]'));

        if (!grid || !cards.length) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q && input) {
            input.value = q;
        }

        function valueOf(element) {
            return element ? element.value.trim() : '';
        }

        function applyFilter() {
            var keyword = valueOf(input).toLowerCase();
            var regionValue = valueOf(region);
            var yearValue = valueOf(year);
            var typeValue = valueOf(type);
            var visible = 0;

            cards.forEach(function (card) {
                var title = (card.getAttribute('data-title') || '').toLowerCase();
                var tags = (card.getAttribute('data-tags') || '').toLowerCase();
                var textMatch = !keyword || title.indexOf(keyword) > -1 || tags.indexOf(keyword) > -1 || card.textContent.toLowerCase().indexOf(keyword) > -1;
                var regionMatch = !regionValue || card.getAttribute('data-region') === regionValue;
                var yearMatch = !yearValue || card.getAttribute('data-year') === yearValue;
                var typeMatch = !typeValue || card.getAttribute('data-type') === typeValue;
                var matched = textMatch && regionMatch && yearMatch && typeMatch;

                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [input, region, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
        applyFilter();
    });

    var playerBox = document.querySelector('[data-player]');
    if (playerBox) {
        var video = playerBox.querySelector('video');
        var start = playerBox.querySelector('[data-play-trigger]');
        var stream = playerBox.getAttribute('data-stream');
        var attached = false;
        var hls = null;

        function attachStream() {
            if (!video || !stream || attached) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                attached = true;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                attached = true;
                return;
            }
            video.src = stream;
            attached = true;
        }

        function playVideo() {
            attachStream();
            if (start) {
                start.classList.add('is-hidden');
            }
            if (video) {
                video.controls = true;
                var attempt = video.play();
                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(function () {
                        if (start) {
                            start.classList.remove('is-hidden');
                        }
                    });
                }
            }
        }

        if (start) {
            start.addEventListener('click', playVideo);
        }
        playerBox.addEventListener('click', function (event) {
            if (event.target === playerBox) {
                playVideo();
            }
        });
        if (video) {
            video.addEventListener('click', function () {
                if (!attached) {
                    playVideo();
                }
            });
        }
        window.addEventListener('pagehide', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    }
})();
