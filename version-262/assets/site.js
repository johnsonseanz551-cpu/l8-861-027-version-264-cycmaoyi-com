(function () {
    var header = document.querySelector('[data-header]');
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    function syncHeader() {
        if (!header) {
            return;
        }
        header.classList.toggle('is-scrolled', window.scrollY > 12);
    }

    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
            document.body.classList.toggle('menu-open', mobileNav.classList.contains('is-open'));
        });
    }

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.classList.add('image-missing');
        });
    });

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function activate(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            if (slides.length <= 1) {
                return;
            }
            timer = window.setInterval(function () {
                activate(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                activate(index);
                start();
            });
        });

        start();
    });

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        var input = form.querySelector('[data-search-input]');
        var regionFilter = form.querySelector('[data-region-filter]');
        var yearFilter = form.querySelector('[data-year-filter]');
        var list = document.querySelector('[data-search-list]');
        var empty = document.querySelector('[data-empty-result]');
        var cards = list ? Array.prototype.slice.call(list.querySelectorAll('[data-search-card]')) : [];
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';

        if (input && query) {
            input.value = query;
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            var keyword = normalize(input ? input.value : '');
            var region = normalize(regionFilter ? regionFilter.value : '');
            var year = normalize(yearFilter ? yearFilter.value : '');
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchRegion = !region || normalize(card.getAttribute('data-region')) === region;
                var matchYear = !year || normalize(card.getAttribute('data-year')) === year;
                var show = matchKeyword && matchRegion && matchYear;
                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        ['input', 'change'].forEach(function (eventName) {
            form.addEventListener(eventName, applyFilter);
        });

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            applyFilter();
        });

        applyFilter();
    });

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('.play-button');
        var sourceElement = video ? video.querySelector('source') : null;
        var url = sourceElement ? sourceElement.getAttribute('src') : '';
        var hlsInstance = null;

        if (!video || !url) {
            return;
        }

        function attachStream() {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 60
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
                return;
            }
            video.src = url;
        }

        function startPlay() {
            if (!video.src && !hlsInstance) {
                attachStream();
            }
            video.controls = true;
            var playPromise = video.play();
            if (playPromise && typeof playPromise.then === 'function') {
                playPromise.then(function () {
                    player.classList.add('is-playing');
                    if (button) {
                        button.hidden = true;
                    }
                }).catch(function () {
                    player.classList.remove('is-playing');
                    if (button) {
                        button.hidden = false;
                    }
                });
            }
        }

        attachStream();

        if (button) {
            button.addEventListener('click', startPlay);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                startPlay();
            }
        });

        video.addEventListener('play', function () {
            player.classList.add('is-playing');
            if (button) {
                button.hidden = true;
            }
        });

        video.addEventListener('pause', function () {
            player.classList.remove('is-playing');
            if (button && video.currentTime === 0) {
                button.hidden = false;
            }
        });
    });
})();
