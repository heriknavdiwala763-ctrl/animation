/**
 * AAKAR FILMS - Category-Wise Photography Gallery & Lightbox System
 * Renders categorized photos, handles instant filter switching, and interactive lightbox
 */
(function initCategoryGallery() {
    const grid = document.getElementById("photographyGrid");
    const tabsNav = document.getElementById("categoryTabsNav");
    const tabBtns = document.querySelectorAll(".cat-tab-btn");

    const lightbox = document.getElementById("photoLightbox");
    const lightboxImg = document.getElementById("lightboxImg");
    const lightboxVideo = document.getElementById("lightboxVideo");
    const lightboxTitle = document.getElementById("lightboxTitle");
    const lightboxCategory = document.getElementById("lightboxCategory");
    const lightboxDesc = document.getElementById("lightboxDesc");
    const lightboxCounter = document.getElementById("lightboxCounter");
    const lightboxClose = document.getElementById("lightboxClose");
    const lightboxPrev = document.getElementById("lightboxPrev");
    const lightboxNext = document.getElementById("lightboxNext");

    if (!grid || typeof GALLERY_DATA === "undefined") return;

    let currentCategory = "all";
    let filteredList = [...GALLERY_DATA];
    let activeIndex = 0;

    // Render gallery cards dynamically
    function renderGallery(items) {
        grid.style.opacity = "0";

        setTimeout(() => {
            grid.innerHTML = "";

            if (items.length === 0) {
                grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--accent-light);">No photographs found in this collection.</div>`;
                grid.style.opacity = "1";
                return;
            }

            items.forEach((item, index) => {
                const card = document.createElement("article");
                card.className = `photo-grid-card holo-panel grid-aspect-${item.aspect || "tall"}`;
                card.setAttribute("data-id", item.id);
                card.setAttribute("tabindex", "0");
                card.setAttribute("role", "button");
                card.setAttribute("aria-label", `View ${item.title}`);

                const hasVideo = !!item.video;
                const mediaHTML = hasVideo 
                    ? `<video class="holo-panel-video" src="${item.video}" autoplay loop muted playsinline poster="${item.image}"></video>`
                    : `<img src="${item.image}" alt="${item.title}" loading="lazy">`;

                const videoTagHTML = hasVideo
                    ? `<div class="holo-video-tag"><span class="holo-video-tag-pulse"></span>HOLO LIVE</div>`
                    : '';

                card.innerHTML = `
                    ${mediaHTML}
                    ${videoTagHTML}
                    <div class="holo-scanline"></div>
                    <div class="holo-sweep-light"></div>
                    <div class="card-3d-sheen"></div>
                    <div class="photo-view-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            <line x1="11" y1="8" x2="11" y2="14"></line>
                            <line x1="8" y1="11" x2="14" y2="11"></line>
                        </svg>
                    </div>
                    <div class="photo-grid-overlay">
                        <span class="photo-badge-cat">${item.categoryLabel}</span>
                        <h3 class="photo-grid-title">${item.title}</h3>
                        <p class="photo-grid-desc">${item.description}</p>
                    </div>
                `;

                card.addEventListener("click", () => openLightbox(index));
                card.addEventListener("keydown", (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openLightbox(index);
                    }
                });

                grid.appendChild(card);
            });

            grid.style.opacity = "1";

            // Refresh GSAP ScrollTrigger to ensure pinned animations remain perfectly synced
            if (typeof ScrollTrigger !== "undefined") {
                ScrollTrigger.refresh();
            }
        }, 220);
    }

    // Category click handler
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const cat = btn.getAttribute("data-category");
            if (cat === currentCategory) return;

            tabBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentCategory = cat;

            if (cat === "all") {
                filteredList = [...GALLERY_DATA];
            } else {
                filteredList = GALLERY_DATA.filter(item => item.category === cat);
            }

            renderGallery(filteredList);
        });
    });

    // Lightbox open / update
    function openLightbox(index) {
        if (!filteredList[index]) return;
        activeIndex = index;
        updateLightboxContent();
        lightbox.classList.add("active");
        if (typeof lenis !== "undefined") lenis.stop();
        document.body.style.overflow = "hidden";
    }

    function updateLightboxContent() {
        const item = filteredList[activeIndex];
        if (!item) return;

        if (item.video && lightboxVideo) {
            lightboxImg.style.display = "none";
            lightboxVideo.style.display = "block";
            lightboxVideo.src = item.video;
            lightboxVideo.poster = item.image;
            lightboxVideo.play().catch(() => {});
        } else {
            if (lightboxVideo) {
                lightboxVideo.pause();
                lightboxVideo.style.display = "none";
                lightboxVideo.src = "";
            }
            lightboxImg.style.display = "block";
            lightboxImg.src = item.image;
            lightboxImg.alt = item.title;
        }

        lightboxTitle.textContent = item.title;
        lightboxCategory.textContent = item.categoryLabel;
        lightboxDesc.textContent = item.description;
        lightboxCounter.textContent = `${activeIndex + 1} / ${filteredList.length}`;
    }

    function closeLightbox() {
        lightbox.classList.remove("active");
        lightboxImg.src = "";
        if (lightboxVideo) {
            lightboxVideo.pause();
            lightboxVideo.src = "";
            lightboxVideo.style.display = "none";
        }
        if (typeof lenis !== "undefined") lenis.start();
        document.body.style.overflow = "";
    }

    function showNextPhoto() {
        activeIndex = (activeIndex + 1) % filteredList.length;
        updateLightboxContent();
    }

    function showPrevPhoto() {
        activeIndex = (activeIndex - 1 + filteredList.length) % filteredList.length;
        updateLightboxContent();
    }

    // Lightbox controls
    if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
    if (lightboxNext) lightboxNext.addEventListener("click", showNextPhoto);
    if (lightboxPrev) lightboxPrev.addEventListener("click", showPrevPhoto);

    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
        if (!lightbox.classList.contains("active")) return;

        if (e.key === "Escape") closeLightbox();
        else if (e.key === "ArrowRight") showNextPhoto();
        else if (e.key === "ArrowLeft") showPrevPhoto();
    });

    // Mobile touch gestures for lightbox (swipe left / right)
    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener("touchend", (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 45) {
            if (diff > 0) showNextPhoto(); // Swiped left -> next
            else showPrevPhoto();          // Swiped right -> prev
        }
    }, { passive: true });

    // Initial render with All Stories
    renderGallery(filteredList);
})();
