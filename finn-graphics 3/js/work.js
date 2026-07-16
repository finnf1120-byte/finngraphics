/* =====================================================================
   FINN GRAPHICS — WORK / PROJECT GRID LOGIC (index.html only)
   You shouldn't need to edit this file. To add or change projects, use
   the admin panel at /admin, or edit /data/projects.json directly.
   ===================================================================== */
(function () {
  "use strict";

  const grid = document.getElementById("projectGrid");
  if (!grid) return;

  fetch("data/projects.json")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load projects.json");
      return res.json();
    })
    .then((data) => initWork(data.projects))
    .catch((err) => console.error(err));

  function initWork(PROJECTS) {
  const emptyState = document.getElementById("emptyState");
  const statusFilters = document.getElementById("statusFilters");
  const categoryFiltersEl = document.getElementById("categoryFilters");

  let activeStatus = "all";
  let activeCategory = "all";

  /* ---------- Build category filter buttons from the data ---------- */
  function buildCategoryFilters() {
    const categories = ["all", ...new Set(PROJECTS.map((p) => p.category))];
    categoryFiltersEl.innerHTML = categories
      .map(
        (cat, i) =>
          `<button class="filter-btn${i === 0 ? " is-active" : ""}" data-filter-category="${cat}">${
            cat === "all" ? "All Types" : cat
          }</button>`
      )
      .join("");
  }

  /* ---------- Placeholder-safe image markup for a single photo ---------- */
  function photoMarkup(photo, altText) {
    // Shows a placeholder box until a real file exists at the given path.
    // Swap in a real image just by putting the file at that path — no code change needed.
    return `
      <img
        src="${photo.src}"
        alt="${altText}"
        loading="lazy"
        onerror="this.replaceWith(Object.assign(document.createElement('div'), {
          className: 'placeholder-img',
          innerHTML: '<span>ADD IMAGE<br>${photo.src}</span>'
        }))"
      >`;
  }

  /* ---------- Render project cards ---------- */
  function renderGrid() {
    const filtered = PROJECTS.filter((p) => {
      const statusMatch = activeStatus === "all" || p.status === activeStatus;
      const categoryMatch = activeCategory === "all" || p.category === activeCategory;
      return statusMatch && categoryMatch;
    });

    if (filtered.length === 0) {
      grid.innerHTML = "";
      emptyState.hidden = false;
      return;
    }
    emptyState.hidden = true;

    grid.innerHTML = filtered
      .map((p, i) => {
        const originalIndex = PROJECTS.indexOf(p);
        const num = String(originalIndex + 1).padStart(2, "0");
        const photoCount = p.images.length;
        return `
        <article class="project-card reveal" style="transition-delay:${(i % 3) * 80}ms" data-index="${originalIndex}" tabindex="0" role="button" aria-label="View ${p.title}">
          <div class="card-media">
            <span class="card-number">#${num}</span>
            <span class="card-status" data-status="${p.status}">${p.status === "client" ? "Client Work" : "Personal"}</span>
            ${photoCount > 1 ? `<span class="card-photo-count">${photoCount} photos</span>` : ""}
            ${photoMarkup(p.images[0], p.title)}
          </div>
          <div class="card-body">
            <p class="card-category">${p.category}</p>
            <h3 class="card-title">${p.title}</h3>
            <p class="card-sport">${p.sport}</p>
          </div>
        </article>`;
      })
      .join("");

    if (window.observeReveals) window.observeReveals();
  }

  /* ---------- Stats in the hero scoreboard ---------- */
  function renderStats() {
    const total = PROJECTS.length;
    const sportsCount = new Set(PROJECTS.map((p) => p.sport)).size;
    const clientCount = PROJECTS.filter((p) => p.status === "client").length;
    const personalCount = PROJECTS.filter((p) => p.status === "personal").length;

    document.querySelector("[data-stat-projects]").textContent = String(total).padStart(2, "0");
    document.querySelector("[data-stat-sports]").textContent = String(sportsCount).padStart(2, "0");
    document.querySelector("[data-stat-client]").textContent = String(clientCount).padStart(2, "0");
    document.querySelector("[data-stat-personal]").textContent = String(personalCount).padStart(2, "0");
  }

  /* ---------- Filter button clicks ---------- */
  statusFilters.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-filter-status]");
    if (!btn) return;
    activeStatus = btn.dataset.filterStatus;
    [...statusFilters.children].forEach((b) => b.classList.toggle("is-active", b === btn));
    renderGrid();
  });

  categoryFiltersEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-filter-category]");
    if (!btn) return;
    activeCategory = btn.dataset.filterCategory;
    [...categoryFiltersEl.children].forEach((b) => b.classList.toggle("is-active", b === btn));
    renderGrid();
  });

  /* ---------- Slideshow lightbox ---------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxMedia = document.getElementById("lightboxMedia");
  const lightboxDots = document.getElementById("lightboxDots");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");
  const lightboxNum = document.getElementById("lightboxNum");
  const lightboxTitle = document.getElementById("lightboxTitle");
  const lightboxMeta = document.getElementById("lightboxMeta");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxDesc = document.getElementById("lightboxDesc");
  const lightboxClose = document.getElementById("lightboxClose");

  let currentProjectIndex = 0;
  let currentSlide = 0;

  function renderSlide() {
    const p = PROJECTS[currentProjectIndex];
    const total = p.images.length;
    const photo = p.images[currentSlide];

    lightboxMedia.innerHTML = photoMarkup(photo, `${p.title} — photo ${currentSlide + 1} of ${total}`);
    lightboxCaption.textContent = photo.caption || "";
    lightboxCaption.hidden = !photo.caption;

    const multi = total > 1;
    lightboxPrev.hidden = !multi;
    lightboxNext.hidden = !multi;
    lightboxDots.hidden = !multi;

    if (multi) {
      lightboxDots.innerHTML = p.images
        .map((_, i) => `<button class="lightbox-dot${i === currentSlide ? " is-active" : ""}" data-slide="${i}" aria-label="Photo ${i + 1}"></button>`)
        .join("");
    }
  }

  function openLightbox(index) {
    currentProjectIndex = index;
    currentSlide = 0;
    const p = PROJECTS[index];
    const num = String(index + 1).padStart(2, "0");

    lightboxNum.textContent = `#${num} — ${p.status === "client" ? "Client Work" : "Personal Project"}`;
    lightboxTitle.textContent = p.title;
    lightboxMeta.textContent = `${p.category} · ${p.sport}`;
    lightboxDesc.textContent = p.description;

    renderSlide();
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
  }

  function nextSlide() {
    const total = PROJECTS[currentProjectIndex].images.length;
    currentSlide = (currentSlide + 1) % total;
    renderSlide();
  }

  function prevSlide() {
    const total = PROJECTS[currentProjectIndex].images.length;
    currentSlide = (currentSlide - 1 + total) % total;
    renderSlide();
  }

  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".project-card");
    if (!card) return;
    openLightbox(Number(card.dataset.index));
  });

  grid.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest(".project-card");
    if (!card) return;
    e.preventDefault();
    openLightbox(Number(card.dataset.index));
  });

  lightboxClose.addEventListener("click", closeLightbox);
  lightboxPrev.addEventListener("click", prevSlide);
  lightboxNext.addEventListener("click", nextSlide);
  lightboxDots.addEventListener("click", (e) => {
    const dot = e.target.closest("[data-slide]");
    if (!dot) return;
    currentSlide = Number(dot.dataset.slide);
    renderSlide();
  });

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") nextSlide();
    if (e.key === "ArrowLeft") prevSlide();
  });

  /* ---------- Init ---------- */
  buildCategoryFilters();
  renderStats();
  renderGrid();
  } // end initWork
})();
