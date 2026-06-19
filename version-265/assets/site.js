(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var index = 0;
    var timer = null;

    function show(nextIndex) {
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
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(dotIndex);
        start();
      });
    });

    show(0);
    start();
  }

  function setupLocalFilters() {
    var area = document.querySelector("[data-filter-area]");
    if (!area) {
      return;
    }
    var input = area.querySelector("[data-card-filter]");
    var year = area.querySelector("[data-year-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));

    function apply() {
      var term = input ? input.value.trim().toLowerCase() : "";
      var selectedYear = year ? year.value : "";
      cards.forEach(function (card) {
        var haystack = card.getAttribute("data-search") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var matchesText = !term || haystack.indexOf(term) !== -1;
        var matchesYear = !selectedYear || cardYear === selectedYear;
        card.classList.toggle("is-hidden", !(matchesText && matchesYear));
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (year) {
      year.addEventListener("change", apply);
    }
    apply();
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var input = document.querySelector("[data-global-search-input]");
    var status = document.querySelector("[data-search-status]");
    var data = window.MOVIE_SEARCH_DATA;
    if (!results || !input || !Array.isArray(data)) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    input.value = initialQuery;

    function card(movie) {
      var tags = movie.tags.slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");
      return "" +
        "<article class=\"movie-card\">" +
          "<a class=\"poster\" href=\"" + movie.url + "\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
            "<img src=\"" + movie.image + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"poster-shade\"></span>" +
            "<span class=\"play-chip\">播放</span>" +
          "</a>" +
          "<div class=\"card-body\">" +
            "<div class=\"card-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
            "<h3><a href=\"" + movie.url + "\">" + escapeHtml(movie.title) + "</a></h3>" +
            "<p>" + escapeHtml(movie.line) + "</p>" +
            "<div class=\"tag-row\">" + tags + "</div>" +
          "</div>" +
        "</article>";
    }

    function render() {
      var term = input.value.trim().toLowerCase();
      var filtered = data.filter(function (movie) {
        return !term || movie.search.indexOf(term) !== -1;
      }).slice(0, 120);
      results.innerHTML = filtered.map(card).join("");
      if (status) {
        status.textContent = term ? "搜索结果" : "推荐结果";
      }
    }

    input.addEventListener("input", render);
    render();
  }

  function setupPlayer() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video[data-src]");
      var button = player.querySelector("[data-play-button]");
      var hls = null;
      var prepared = false;

      function prepare() {
        if (prepared || !video) {
          return;
        }
        prepared = true;
        var source = video.getAttribute("data-src");
        if (!source) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function play() {
        prepare();
        player.classList.add("is-playing");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            player.classList.remove("is-playing");
          });
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }
      if (video) {
        video.addEventListener("play", function () {
          player.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
          if (video.currentTime === 0) {
            player.classList.remove("is-playing");
          }
        });
        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          }
        });
      }
      player.addEventListener("remove", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[character];
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupLocalFilters();
    setupSearchPage();
    setupPlayer();
  });
})();
