(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function escapeHTML(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function cardTemplate(movie) {
        const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHTML(tag) + "</span>";
        }).join("");

        return "" +
            "<article class=\"movie-card standard\">" +
                "<a class=\"movie-thumb\" href=\"" + escapeHTML(movie.file) + "\" aria-label=\"观看" + escapeHTML(movie.title) + "\">" +
                    "<img src=\"" + escapeHTML(movie.image) + "\" alt=\"" + escapeHTML(movie.title) + "封面\" loading=\"lazy\">" +
                    "<span class=\"thumb-shade\"></span>" +
                    "<span class=\"type-badge\">" + escapeHTML(movie.type) + "</span>" +
                    "<span class=\"score-badge\">" + escapeHTML(movie.score) + "</span>" +
                "</a>" +
                "<div class=\"movie-card-body\">" +
                    "<h3><a href=\"" + escapeHTML(movie.file) + "\">" + escapeHTML(movie.title) + "</a></h3>" +
                    "<p>" + escapeHTML(movie.oneLine) + "</p>" +
                    "<div class=\"movie-meta-row\"><span>" + escapeHTML(movie.year) + "</span><span>" + escapeHTML(movie.region) + "</span></div>" +
                    "<div class=\"tag-line\">" + tags + "</div>" +
                "</div>" +
            "</article>";
    }

    ready(function () {
        const menuButton = document.querySelector("[data-menu-toggle]");
        const mobileMenu = document.querySelector("[data-mobile-menu]");

        if (menuButton && mobileMenu) {
            menuButton.addEventListener("click", function () {
                mobileMenu.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                const input = form.querySelector("input[name='q']");
                if (input && !input.value.trim()) {
                    event.preventDefault();
                    input.focus();
                }
            });
        });

        const hero = document.querySelector("[data-hero]");
        if (hero) {
            const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
            const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
            let activeIndex = 0;

            function showSlide(index) {
                activeIndex = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === activeIndex);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === activeIndex);
                });
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                });
            });

            if (slides.length > 1) {
                window.setInterval(function () {
                    showSlide(activeIndex + 1);
                }, 6200);
            }
        }

        const filterInput = document.querySelector("[data-filter-input]");
        const filterList = document.querySelector("[data-filter-list]");
        if (filterInput && filterList) {
            const cards = Array.from(filterList.querySelectorAll("[data-filter-card]"));
            filterInput.addEventListener("input", function () {
                const query = filterInput.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    const text = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || "")).toLowerCase();
                    card.classList.toggle("is-hidden-by-filter", query && !text.includes(query));
                });
            });
        }

        const results = document.querySelector("[data-search-results]");
        const searchTitle = document.querySelector("[data-search-title]");
        if (results && window.SEARCH_INDEX) {
            const params = new URLSearchParams(window.location.search);
            const query = (params.get("q") || "").trim().toLowerCase();
            let matched;

            if (query) {
                matched = window.SEARCH_INDEX.filter(function (movie) {
                    return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, (movie.tags || []).join(" ")]
                        .join(" ")
                        .toLowerCase()
                        .includes(query);
                });
                if (searchTitle) {
                    searchTitle.textContent = "匹配结果";
                }
            } else {
                matched = window.SEARCH_INDEX.slice(0, 80);
                if (searchTitle) {
                    searchTitle.textContent = "推荐片库";
                }
            }

            if (!matched.length) {
                results.innerHTML = "<div class=\"empty-state\">未找到相关影片</div>";
                return;
            }

            results.innerHTML = matched.slice(0, 120).map(cardTemplate).join("");
        }
    });
})();
