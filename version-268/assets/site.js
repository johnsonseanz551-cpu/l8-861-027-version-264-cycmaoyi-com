(function () {
  var root = document.body.getAttribute('data-root') || './';

  function $(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function $all(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function clean(text) {
    return String(text || '').toLowerCase().trim();
  }

  function escapeText(text) {
    return String(text || '').replace(/[&<>"]/g, function (value) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[value];
    });
  }

  var menuButton = $('[data-menu-toggle]');
  var mobilePanel = $('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var carousel = $('[data-hero-carousel]');

  if (carousel) {
    var slides = $all('[data-hero-slide]', carousel);
    var dots = $all('[data-hero-dot]', carousel);
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var filterInput = $('.js-page-filter');
  var filterScope = $('[data-filter-scope]');

  if (filterInput && filterScope) {
    var filterItems = $all('.js-filter-item', filterScope);
    filterInput.addEventListener('input', function () {
      var query = clean(filterInput.value);
      filterItems.forEach(function (item) {
        var haystack = clean([
          item.getAttribute('data-title'),
          item.getAttribute('data-region'),
          item.getAttribute('data-type'),
          item.getAttribute('data-year'),
          item.getAttribute('data-tags')
        ].join(' '));
        item.classList.toggle('hidden-card', query && haystack.indexOf(query) === -1);
      });
    });
  }

  var searchLayer = $('[data-search-layer]');
  var searchResults = $('[data-search-results]');
  var searchClose = $('[data-search-close]');

  function renderSearch(query) {
    if (!searchLayer || !searchResults) {
      return;
    }

    var words = clean(query).split(/\s+/).filter(Boolean);
    var data = window.SEARCH_MOVIES || [];
    var matches = data.filter(function (item) {
      var haystack = clean(item.title + ' ' + item.region + ' ' + item.type + ' ' + item.year + ' ' + item.tags + ' ' + item.genre);
      return words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
    }).slice(0, 80);

    if (!matches.length) {
      searchResults.innerHTML = '<p>暂无相关影片</p>';
    } else {
      searchResults.innerHTML = matches.map(function (item) {
        return '<a class="search-item" href="' + root + item.url + '">' +
          '<img src="' + root + item.image + '" alt="' + escapeText(item.title) + '">' +
          '<span><h3>' + escapeText(item.title) + '</h3>' +
          '<p>' + escapeText(item.year + ' · ' + item.region + ' · ' + item.type) + '</p>' +
          '<p>' + escapeText(item.genre) + '</p></span>' +
          '</a>';
      }).join('');
    }

    searchLayer.hidden = false;
    document.documentElement.style.overflow = 'hidden';
  }

  $all('.js-search-form').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input');
      var query = input ? input.value.trim() : '';
      if (query) {
        renderSearch(query);
      }
    });
  });

  if (searchClose && searchLayer) {
    searchClose.addEventListener('click', function () {
      searchLayer.hidden = true;
      document.documentElement.style.overflow = '';
    });

    searchLayer.addEventListener('click', function (event) {
      if (event.target === searchLayer) {
        searchLayer.hidden = true;
        document.documentElement.style.overflow = '';
      }
    });
  }
})();
