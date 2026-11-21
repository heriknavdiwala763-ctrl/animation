/**
 * AAKAR FILMS - Holographic 3D Wedding Projection Experience
 * Transforms the Photography Collections into an interactive floating holographic projection gallery.
 * Features:
 * - Floating glass holographic panels arranged across varying X, Y, Z depths & rotations
 * - Responsive 3D rotation & parallax driven by mouse movements with smooth damping
 * - Subtle ambient cyan & golden-rose lighting beams, scanlines, and light sweeps
 * - Live HTML5 video projection in designated panels with intersection observer pause/play
 * - Subtle canvas particle field mimicking floating holographic dust
 * - Interactive panel focus: elevation in 3D, scale up, cyan/rose border glow, and background panel dimming
 * - Fullscreen holographic lightbox viewer with touch & keyboard support
 */
(function initHolographicGallery() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    const section = document.getElementById("gallerySection");
    const grid = document.getElementById("photographyGrid");
    const beam = document.getElementById("holoEmitterBeam");
    const canvas = document.getElementById("holoParticlesCanvas");
    if (!section || !grid) return;

    // ----------------------------------------------------
    // 1. HOLOGRAPHIC PARTICLES ENGINE (CYAN & ROSE DUST)
    // ----------------------------------------------------
    let ctx = null;
    let particles = [];
    let canvasWidth = 0;
    let canvasHeight = 0;

    if (canvas && canvas.getContext) {
        ctx = canvas.getContext("2d");
        function resizeCanvas() {
            canvasWidth = canvas.width = section.offsetWidth || window.innerWidth;
            canvasHeight = canvas.height = section.offsetHeight || 1200;
        }
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas, { passive: true });

        const PARTICLE_COUNT = Math.min(55, Math.floor(window.innerWidth / 24));
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * canvasWidth,
                y: Math.random() * canvasHeight,
                size: Math.random() * 2 + 0.8,
                speedY: -(Math.random() * 0.45 + 0.15),
                speedX: (Math.random() - 0.5) * 0.25,
                opacity: Math.random() * 0.55 + 0.2,
                color: Math.random() > 0.4 ? "rgba(68, 207, 220, " : "rgba(201, 143, 145, "
            });
        }

        function renderParticles() {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);

            particles.forEach((p) => {
                p.y += p.speedY;
                p.x += p.speedX;
                if (p.y < 0) {
                    p.y = canvasHeight;
                    p.x = Math.random() * canvasWidth;
                }
                if (p.x < 0) p.x = canvasWidth;
                if (p.x > canvasWidth) p.x = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color + p.opacity + ")";
                ctx.shadowColor = p.color + "0.8)";
                ctx.shadowBlur = 6;
                ctx.fill();
            });

            requestAnimationFrame(renderParticles);
        }
        renderParticles();
    }

    // ----------------------------------------------------
    // 2. 3D HOLOGRAPHIC SPATIAL DEPTH MATRIX
    // ----------------------------------------------------
    const HOLOGRAPHIC_DEPTH_MAP = [
        { z: 55,  rotX: 2.2,  rotY: -3.5, rotZ: -1.6, speed: 1.55, scale: 1.02 },  // Front floating left
        { z: -45, rotX: -1.8, rotY: 2.4,  rotZ: 1.4,  speed: 0.70, scale: 0.98 },  // Deep floating center
        { z: 35,  rotX: 1.5,  rotY: -2.0, rotZ: 2.0,  speed: 1.30, scale: 1.01 },  // Mid-front right
        { z: -60, rotX: -2.4, rotY: 3.2,  rotZ: -1.2, speed: 0.60, scale: 0.96 },  // Ultra-deep background
        { z: 45,  rotX: 2.0,  rotY: -1.8, rotZ: 1.5,  speed: 1.40, scale: 1.02 },  // Front right
        { z: -25, rotX: -1.2, rotY: 1.8,  rotZ: -2.1, speed: 0.85, scale: 0.99 },  // Mid background
        { z: 60,  rotX: 2.6,  rotY: -2.8, rotZ: -1.0, speed: 1.60, scale: 1.03 },  // High foreground
        { z: -35, rotX: -1.5, rotY: 2.2,  rotZ: 1.8,  speed: 0.75, scale: 0.98 },  // Mid-deep
        { z: 25,  rotX: 1.0,  rotY: -1.4, rotZ: -1.4, speed: 1.20, scale: 1.00 }   // Balanced mid
    ];

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let activeHoveredCard = null;

    // Assign holographic depth profiles to cards
    function setupHoloCards() {
        const cards = grid.querySelectorAll(".photo-grid-card");
        cards.forEach((card, index) => {
            const profile = HOLOGRAPHIC_DEPTH_MAP[index % HOLOGRAPHIC_DEPTH_MAP.length];
            card.dataset.baseZ = profile.z;
            card.dataset.rotX = profile.rotX;
            card.dataset.rotY = profile.rotY;
            card.dataset.rotZ = profile.rotZ;
            card.dataset.speed = profile.speed;
            card.dataset.baseScale = profile.scale;

            const sheen = card.querySelector(".card-3d-sheen");

            // Attach listeners once
            if (!card.dataset.holoAttached) {
                card.dataset.holoAttached = "true";

                card.addEventListener("mouseenter", () => {
                    activeHoveredCard = card;
                    grid.classList.add("has-spatial-active");
                    card.classList.add("is-spatial-focused");
                });

                card.addEventListener("mouseleave", () => {
                    if (activeHoveredCard === card) {
                        activeHoveredCard = null;
                        grid.classList.remove("has-spatial-active");
                        card.classList.remove("is-spatial-focused");
                    }
                    const media = card.querySelector("img, video");
                    if (media) media.style.transform = "";
                    if (sheen) sheen.style.opacity = "0";
                });

                card.addEventListener("mousemove", (e) => {
                    if (activeHoveredCard !== card) return;
                    const rect = card.getBoundingClientRect();
                    const localX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                    const localY = ((e.clientY - rect.top) / rect.height) * 2 - 1;

                    // Hologram elevation & dynamic tilt
                    const tiltX = -localY * 13;
                    const tiltY = localX * 13;
                    card.style.transform = `perspective(1200px) translate3d(0, 0, 125px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale(1.08)`;

                    // Inner media counter drift
                    const media = card.querySelector("img, video");
                    if (media) {
                        media.style.transform = `scale(1.1) translate3d(${(-localX * 15).toFixed(1)}px, ${(-localY * 15).toFixed(1)}px, 0)`;
                    }

                    // Cyan & Rose Specular sheen reflection
                    if (sheen) {
                        const lightX = ((localX + 1) / 2) * 100;
                        const lightY = ((localY + 1) / 2) * 100;
                        sheen.style.background = `radial-gradient(circle at ${lightX.toFixed(1)}% ${lightY.toFixed(1)}%, rgba(255, 255, 255, 0.3) 0%, rgba(68, 207, 220, 0.22) 35%, rgba(201, 143, 145, 0.12) 60%, transparent 75%)`;
                        sheen.style.opacity = "1";
                    }
                });

                // Mobile touch support
                card.addEventListener("touchstart", () => {
                    card.classList.add("touch-active");
                    setTimeout(() => card.classList.remove("touch-active"), 1200);
                }, { passive: true });
            }
        });
    }

    // ----------------------------------------------------
    // 3. MOUSE TRACKING OVER PROJECTION STAGE
    // ----------------------------------------------------
    section.addEventListener("mouseenter", () => {
        if (beam) beam.classList.add("is-active");
    });

    section.addEventListener("mouseleave", () => {
        targetX = 0;
        targetY = 0;
        activeHoveredCard = null;
        grid.classList.remove("has-spatial-active");
    });

    section.addEventListener("mousemove", (e) => {
        const rect = section.getBoundingClientRect();
        targetX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        targetY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    }, { passive: true });

    // ----------------------------------------------------
    // 4. MAIN 60FPS HOLOGRAPHIC TRANSFORMATION LOOP
    // ----------------------------------------------------
    function holographicRenderLoop() {
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;

        const cards = grid.querySelectorAll(".photo-grid-card");
        cards.forEach((card) => {
            if (card === activeHoveredCard) return;

            const baseZ = parseFloat(card.dataset.baseZ || 0);
            const rotX = parseFloat(card.dataset.rotX || 0);
            const rotY = parseFloat(card.dataset.rotY || 0);
            const rotZ = parseFloat(card.dataset.rotZ || 0);
            const speed = parseFloat(card.dataset.speed || 1);
            const baseScale = parseFloat(card.dataset.baseScale || 1);

            // Responsive 3D shift and subtle perspective rotation
            const shiftX = currentX * 24 * speed;
            const shiftY = currentY * 20 * speed;
            const dynTiltX = rotX - currentY * 7 * speed;
            const dynTiltY = rotY + currentX * 8 * speed;

            card.style.transform = `perspective(1800px) translate3d(${shiftX.toFixed(2)}px, ${shiftY.toFixed(2)}px, ${baseZ.toFixed(1)}px) rotateX(${dynTiltX.toFixed(2)}deg) rotateY(${dynTiltY.toFixed(2)}deg) rotateZ(${rotZ.toFixed(1)}deg) scale(${baseScale.toFixed(3)})`;
        });

        requestAnimationFrame(holographicRenderLoop);
    }

    // Initialize layout and loop
    setupHoloCards();
    requestAnimationFrame(holographicRenderLoop);

    // Watch dynamic category tab rendering
    const observer = new MutationObserver(() => {
        setTimeout(setupHoloCards, 50);
    });
    observer.observe(grid, { childList: true });

    // ----------------------------------------------------
    // 5. INTERSECTION OBSERVER FOR HOLOGRAPHIC VIDEOS (PERFORMANCE)
    // ----------------------------------------------------
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const vid = entry.target;
            if (entry.isIntersecting) {
                vid.play().catch(() => {});
            } else {
                vid.pause();
            }
        });
    }, { threshold: 0.15 });

    function observeVideos() {
        const videos = grid.querySelectorAll("video.holo-panel-video");
        videos.forEach(v => videoObserver.observe(v));
    }
    observeVideos();
    const videoDomObserver = new MutationObserver(() => setTimeout(observeVideos, 60));
    videoDomObserver.observe(grid, { childList: true });

    // ----------------------------------------------------
    // 6. CINEMATIC ENTRANCE ANIMATION (GSAP SCROLLTRIGGER)
    // ----------------------------------------------------
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.create({
            trigger: section,
            start: "top 78%",
            once: true,
            onEnter: () => {
                // 1. Reveal emitter beam
                if (beam) beam.classList.add("is-active");

                // 2. Sequential holographic panel materialize
                const cards = grid.querySelectorAll(".photo-grid-card");
                gsap.fromTo(cards, 
                    { 
                        opacity: 0, 
                        y: 80, 
                        scale: 0.88, 
                        rotateX: -15, 
                        filter: "blur(6px) brightness(1.6)" 
                    },
                    { 
                        opacity: 1, 
                        y: 0, 
                        scale: 1, 
                        rotateX: 0, 
                        filter: "blur(0px) brightness(1)", 
                        duration: 1.2, 
                        stagger: 0.07, 
                        ease: "power3.out" 
                    }
                );
            }
        });
    }
})();
