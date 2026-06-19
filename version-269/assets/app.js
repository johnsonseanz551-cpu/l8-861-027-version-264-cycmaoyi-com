(function () {
    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function pickPath(item) {
        var path = window.location.pathname;
        var inMovies = path.indexOf("/movies/") !== -1;
        return inMovies ? "../" + item.path : "./" + item.path;
    }

    function pickCover(item) {
        var path = window.location.pathname;
        var inMovies = path.indexOf("/movies/") !== -1;
        return inMovies ? "../" + item.cover : "./" + item.cover;
    }

    function renderSearch(query) {
        var panel = document.getElementById("searchResults");
        if (!panel || !window.SITE_MOVIES) {
            return;
        }
        var keyword = normalize(query);
        if (!keyword) {
            panel.hidden = true;
            panel.innerHTML = "";
            return;
        }
        var results = window.SITE_MOVIES.filter(function (item) {
            return normalize(item.title + " " + item.region + " " + item.type + " " + item.year + " " + item.genre + " " + item.tags).indexOf(keyword) !== -1;
        }).slice(0, 48);
        var html = results.map(function (item) {
            return '<a class="search-item" href="' + pickPath(item) + '">' +
                '<img src="' + pickCover(item) + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
                '<span><strong>' + item.title + '</strong><em>' + item.year + ' · ' + item.region + ' · ' + item.type + '</em></span>' +
                '</a>';
        }).join("");
        panel.hidden = false;
        panel.innerHTML = '<div class="search-results-card"><h2>搜索结果</h2><div class="search-results-list">' + html + '</div></div>';
        panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function bindSearch() {
        var forms = document.querySelectorAll("#site-search-form, .mobile-search");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                if (!window.SITE_MOVIES) {
                    return;
                }
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                renderSearch(input ? input.value : "");
            });
        });
        var params = new URLSearchParams(window.location.search);
        if (params.has("q")) {
            renderSearch(params.get("q"));
        }
    }

    function bindMenu() {
        var button = document.querySelector(".menu-toggle");
        var menu = document.querySelector(".mobile-menu");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.hidden = !menu.hidden;
        });
    }

    function bindHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        if (!slides.length) {
            return;
        }
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        var index = 0;
        var timer = null;
        function activate(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }
        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                activate(index + 1);
            }, 5000);
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                activate(dotIndex);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                activate(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                activate(index + 1);
                restart();
            });
        }
        restart();
    }

    function bindCatalogFilter() {
        var input = document.querySelector(".catalog-filter");
        if (!input) {
            return;
        }
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-card"));
        input.addEventListener("input", function () {
            var keyword = normalize(input.value);
            cards.forEach(function (card) {
                var text = normalize(card.textContent + " " + card.getAttribute("data-title") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-year") + " " + card.getAttribute("data-genre"));
                card.hidden = keyword && text.indexOf(keyword) === -1;
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        bindMenu();
        bindHero();
        bindSearch();
        bindCatalogFilter();
    });
})();
