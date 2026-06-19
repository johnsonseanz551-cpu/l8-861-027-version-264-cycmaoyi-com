(function () {
  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function applyFilters(scope) {
    var input = scope.querySelector('[data-page-search]');
    var list = scope.querySelector('[data-card-list]');
    var resultCount = scope.querySelector('[data-result-count]');
    if (!list) {
      return;
    }

    var query = normalize(input ? input.value : '');
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-search'));
      var match = !query || haystack.indexOf(query) !== -1;
      card.classList.toggle('hidden-by-filter', !match);
      if (match) {
        visible += 1;
      }
    });

    if (resultCount) {
      resultCount.textContent = visible + ' 部';
    }

    var emptyState = scope.querySelector('[data-empty-state]');
    if (emptyState) {
      emptyState.classList.toggle('visible', visible === 0);
    }
  }

  function sortCards(scope, value) {
    var list = scope.querySelector('[data-card-list]');
    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
    if (value === 'year-desc') {
      cards.sort(function (a, b) {
        return (parseInt(b.getAttribute('data-year'), 10) || 0) - (parseInt(a.getAttribute('data-year'), 10) || 0);
      });
    } else if (value === 'title-asc') {
      cards.sort(function (a, b) {
        return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
      });
    } else {
      cards.sort(function (a, b) {
        return Array.prototype.indexOf.call(list.children, a) - Array.prototype.indexOf.call(list.children, b);
      });
    }

    cards.forEach(function (card) {
      list.appendChild(card);
    });
  }

  function hydrateSearchFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (!query) {
      return;
    }
    document.querySelectorAll('[data-page-search]').forEach(function (input) {
      input.value = query;
      applyFilters(input.closest('main') || document);
    });
  }

  document.addEventListener('input', function (event) {
    if (event.target.matches('[data-page-search]')) {
      applyFilters(event.target.closest('main') || document);
    }
  });

  document.addEventListener('change', function (event) {
    if (event.target.matches('[data-sort-select]')) {
      var scope = event.target.closest('main') || document;
      sortCards(scope, event.target.value);
      applyFilters(scope);
    }
  });

  document.addEventListener('click', function (event) {
    var chip = event.target.closest('[data-filter-chip]');
    if (!chip) {
      return;
    }
    var scope = chip.closest('main') || document;
    var input = scope.querySelector('[data-page-search]');
    if (input) {
      input.value = chip.getAttribute('data-filter-chip') || '';
      applyFilters(scope);
    }
  });

  document.addEventListener('DOMContentLoaded', function () {
    hydrateSearchFromUrl();
    document.querySelectorAll('main').forEach(applyFilters);
  });
}());
