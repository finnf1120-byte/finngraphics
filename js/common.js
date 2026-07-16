/* =====================================================================
   FINN GRAPHICS — SHARED SITE LOGIC (runs on every page)
   You shouldn't need to edit this file. To change content, either:
   - use the admin panel at /admin (see README.md to set it up), or
   - edit the JSON files in /data directly.
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- Small helper: fetch a JSON data file, fail quietly ---------- */
  function loadJSON(path) {
    return fetch(path)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load " + path);
        return res.json();
      })
      .catch((err) => {
        console.error(err);
        return null;
      });
  }

  /* ---------- Scroll-reveal (subtle fade/rise-in as elements enter view) ----------
     Any element with class="reveal" fades and rises into place once it
     scrolls into view. Works on both static markup and content rendered
     later by JS — call window.observeReveals() again after adding new
     .reveal elements to the page. */
  const revealObserver =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                revealObserver.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
        )
      : null;

  function observeReveals() {
    const els = document.querySelectorAll(".reveal:not(.is-visible)");
    if (!revealObserver) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    els.forEach((el) => revealObserver.observe(el));
  }
  window.observeReveals = observeReveals;

  /* ---------- Mobile nav ---------- */
  const navToggle = document.getElementById("navToggle");
  const mobileNav = document.getElementById("mobileNav");
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = mobileNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
    mobileNav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        mobileNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Client logo carousel ----------
     If a single set of logos is already wide enough to fill the row, they
     scroll continuously (duplicated once for a seamless loop). If there
     are too few logos for that, scrolling would show the same badge twice
     on screen at once — so instead they're centered, shown exactly once,
     and scaled up to fill the row nicely. */
  const logoTrack = document.getElementById("logoTrack");
  const logoMarquee = logoTrack ? logoTrack.closest(".logo-marquee") : null;
  if (logoTrack && logoMarquee) {
    loadJSON("data/clients.json").then((data) => {
      const clients = data && data.clients;
      if (!clients || clients.length === 0) return;

      const badge = (client) => {
        const initials = client.name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 3)
          .toUpperCase();
        return `
        <div class="logo-item">
          <img
            src="${client.image}"
            alt="${client.name}"
            onerror="this.replaceWith(Object.assign(document.createElement('div'), {
              className: 'logo-fallback',
              innerHTML: '<span class=\\'logo-fallback-initials\\'>${initials}</span><span class=\\'logo-fallback-name\\'>${client.name}</span>'
            }))"
          >
        </div>`;
      };
      const baseSize = 40;
      const maxScale = 3; // don't let a single logo blow up absurdly large

      function layout() {
        // Render one set at the default size, hidden, purely to measure it.
        logoTrack.className = "logo-track logo-track--measuring";
        logoTrack.style.setProperty("--logo-size", baseSize + "px");
        logoTrack.innerHTML = clients.map(badge).join("");

        const imgs = logoTrack.querySelectorAll("img");
        const finish = () => {
          const containerWidth = logoMarquee.clientWidth;
          const singleSetWidth = logoTrack.scrollWidth;

          if (singleSetWidth < containerWidth) {
            // Fits without scrolling — scale up to fill the row, show once, no loop.
            const scale = Math.min(maxScale, Math.max(1, (containerWidth / singleSetWidth) * 0.92));
            logoTrack.style.setProperty("--logo-size", Math.round(baseSize * scale) + "px");
            logoTrack.className = "logo-track logo-track--static";
          } else {
            // Enough logos to need scrolling — duplicate once for a seamless loop.
            logoTrack.style.setProperty("--logo-size", baseSize + "px");
            const items = clients.map(badge).join("");
            logoTrack.innerHTML = items + items;
            logoTrack.className = "logo-track";
          }
        };

        if (imgs.length === 0) { finish(); return; }
        let settled = false;
        const finishOnce = () => { if (!settled) { settled = true; finish(); } };
        let remaining = imgs.length;
        const settle = () => { remaining -= 1; if (remaining <= 0) finishOnce(); };
        imgs.forEach((img) => {
          if (img.complete) settle();
          else {
            img.addEventListener("load", settle, { once: true });
            img.addEventListener("error", settle, { once: true });
          }
        });
        // Safety net: don't leave the carousel hidden forever if an image
        // is unusually slow (or a browser quirk keeps it from firing).
        setTimeout(finishOnce, 2500);
      }

      layout();
      let resizeTimer;
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(layout, 200);
      });
    });
  }

  /* ---------- Hero image mosaic (index.html only) ---------- */
  const heroGallery = document.getElementById("heroGallery");
  if (heroGallery) {
    loadJSON("data/projects.json").then((data) => {
      const projects = data && data.projects;
      if (!projects) return;
      const tiles = projects.slice(0, 5);
      heroGallery.innerHTML = tiles
        .map((p, i) => {
          const photo = p.images && p.images[0];
          const src = photo ? photo.src : "";
          return `
        <div class="hero-tile reveal" style="transition-delay:${i * 90}ms">
          <img
            src="${src}"
            alt=""
            loading="lazy"
            onerror="this.replaceWith(Object.assign(document.createElement('div'), {
              className: 'placeholder-img',
              innerHTML: '<span>ADD IMAGE<br>${src}</span>'
            }))"
          >
        </div>`;
        })
        .join("");
      if (window.observeReveals) window.observeReveals();
    });
  }

  /* ---------- Reviews marquee ---------- */
  const reviewGrid = document.getElementById("reviewGrid");
  if (reviewGrid) {
    loadJSON("data/reviews.json").then((data) => {
      const reviews = data && data.reviews;
      if (!reviews) return;
      const card = (r) => `
      <article class="review-card">
        <p class="review-quote">"${r.quote}"</p>
        <p class="review-author">${r.author}</p>
        <p class="review-role">${r.role}</p>
      </article>`;
      const cards = reviews.map(card).join("");
      reviewGrid.innerHTML = cards + cards;
    });
  }

  /* ---------- Shop grid (with Gumroad overlay checkout) ---------- */
  const shopGrid = document.getElementById("shopGrid");
  const shopFilters = document.getElementById("shopFilters");
  const shopEmptyState = document.getElementById("shopEmptyState");
  if (shopGrid) {
    loadJSON("data/shop.json").then((data) => {
      const shopItems = data && data.products;
      if (!shopItems) return;
      let activeShopCategory = "all";

      function renderShopGrid() {
        const filtered = shopItems.filter(
          (item) => activeShopCategory === "all" || item.category === activeShopCategory
        );

        if (filtered.length === 0) {
          shopGrid.innerHTML = "";
          if (shopEmptyState) shopEmptyState.hidden = false;
          return;
        }
        if (shopEmptyState) shopEmptyState.hidden = true;

        shopGrid.innerHTML = filtered
          .map((item, i) => {
            const buyable = item.buyUrl && item.buyUrl !== "#";
            // Gumroad's embed script (loaded in shop.html) turns any link with
            // class="gumroad-button" into an in-page overlay checkout instead
            // of sending the visitor away to a new tab.
            return `
      <article class="shop-card reveal" style="transition-delay:${(i % 3) * 80}ms">
        <div class="shop-media">
          <img
            src="${item.image}"
            alt="${item.title}"
            loading="lazy"
            onerror="this.replaceWith(Object.assign(document.createElement('div'), {
              className: 'placeholder-img',
              innerHTML: '<span>ADD IMAGE<br>${item.image}</span>'
            }))"
          >
          <span class="shop-price">${item.price}</span>
        </div>
        <div class="shop-body">
          <p class="card-category">${item.category}</p>
          <h3 class="card-title">${item.title}</h3>
          <p class="shop-desc">${item.description}</p>
          ${
            buyable
              ? `<a class="btn btn-solid shop-buy gumroad-button" href="${item.buyUrl}" target="_blank" rel="noopener">Buy now</a>`
              : `<button class="btn btn-outline shop-buy" type="button" disabled title="Add a Gumroad product link in the admin panel or data/shop.json">Checkout link coming soon</button>`
          }
        </div>
      </article>`;
          })
          .join("");

        if (window.observeReveals) window.observeReveals();
      }

      if (shopFilters) {
        shopFilters.addEventListener("click", (e) => {
          const btn = e.target.closest("[data-filter-shop]");
          if (!btn) return;
          activeShopCategory = btn.dataset.filterShop;
          [...shopFilters.children].forEach((b) => b.classList.toggle("is-active", b === btn));
          renderShopGrid();
        });
      }

      renderShopGrid();
    });
  }

  /* ---------- Services / "Work With Me" tiers ---------- */
  const servicesList = document.getElementById("servicesList");
  if (servicesList) {
    loadJSON("data/services.json").then((data) => {
      const services = data && data.services;
      if (!services) return;
      servicesList.innerHTML = services
        .map(
          (s, i) => `
      <article class="service-tier reveal" style="transition-delay:${i * 100}ms">
        <div class="service-media">
          <img
            src="${s.image}"
            alt="${s.title}"
            loading="lazy"
            onerror="this.replaceWith(Object.assign(document.createElement('div'), {
              className: 'placeholder-img',
              innerHTML: '<span>ADD IMAGE<br>${s.image}</span>'
            }))"
          >
        </div>
        <h3 class="service-title">${s.title}</h3>
        <p class="service-tagline">${s.tagline}</p>
        <p class="service-summary">${s.summary}</p>
        <p class="service-includes-label">Includes:</p>
        <ul class="service-includes">
          ${s.includes.map((point) => `<li>${point}</li>`).join("")}
        </ul>
      </article>`
        )
        .join("");
      if (window.observeReveals) window.observeReveals();
    });
  }

  /* ---------- Contact form ----------
     Submits natively (no JS) straight to Netlify Forms — see the HTML
     comment above the <form> in index.html for why this is more reliable
     than a JS fetch-based submission. Nothing to do here. */

  /* ---------- Kick off reveal-on-scroll for static markup already on the page ---------- */
  observeReveals();
})();
