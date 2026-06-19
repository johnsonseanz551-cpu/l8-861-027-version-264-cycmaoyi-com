const byId = (id) => document.getElementById(id);

function initMenu() {
  const button = byId("menuToggle");
  const menu = byId("mobileNav");
  if (!button || !menu) {
    return;
  }
  button.addEventListener("click", () => {
    menu.classList.toggle("open");
  });
}

function initHero() {
  const hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }
  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  const prev = hero.querySelector("[data-hero-prev]");
  const next = hero.querySelector("[data-hero-next]");
  if (!slides.length) {
    return;
  }
  let index = 0;
  let timer = null;
  const show = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });
  };
  const start = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => show(index + 1), 5600);
  };
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      show(i);
      start();
    });
  });
  if (prev) {
    prev.addEventListener("click", () => {
      show(index - 1);
      start();
    });
  }
  if (next) {
    next.addEventListener("click", () => {
      show(index + 1);
      start();
    });
  }
  show(0);
  start();
}

function readText(value) {
  return (value || "").toString().toLowerCase().trim();
}

function initSearchAreas() {
  const areas = Array.from(document.querySelectorAll("[data-search-area]"));
  areas.forEach((area) => {
    const input = area.querySelector("[data-search-input]");
    const filters = Array.from(area.querySelectorAll("[data-filter]"));
    const items = Array.from(area.querySelectorAll("[data-search-item]"));
    const empty = area.querySelector("[data-empty]");
    const apply = () => {
      const query = readText(input ? input.value : "");
      let visible = 0;
      items.forEach((item) => {
        const haystack = readText([
          item.dataset.title,
          item.dataset.genre,
          item.dataset.tags,
          item.dataset.region,
          item.dataset.type,
          item.textContent
        ].join(" "));
        let ok = !query || haystack.includes(query);
        filters.forEach((filter) => {
          const key = filter.dataset.filter;
          const value = readText(filter.value);
          if (value && readText(item.dataset[key]) !== value) {
            ok = false;
          }
        });
        item.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    };
    if (input) {
      input.addEventListener("input", apply);
    }
    filters.forEach((filter) => filter.addEventListener("change", apply));
    apply();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initMenu();
  initHero();
  initSearchAreas();
});
