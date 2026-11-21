/**
 * AAKAR FILMS - Volumetric Smoke Reveal Video Simulation
 * High-performance fluid multi-layer particle smoke engine,
 * GSAP ScrollTrigger timeline for video reveal masking, camera push-in,
 * and character-by-character headline emergence.
 */
(function initVolumetricSmokeReveal() {
    const section = document.getElementById("volumetricSmokeSection");
    const stage = document.getElementById("smokeStage");
    const viewport = document.getElementById("smokeVideoViewport");
    const video = document.getElementById("smokeWeddingVideo");
    const smokeCanvas = document.getElementById("smokeCanvas");
    const particlesCanvas = document.getElementById("smokeParticlesCanvas");
    const lensGlow = document.getElementById("smokeLensGlow");
    const subhead = document.getElementById("smokeSubhead");
    const mainTitle = document.getElementById("smokeMainTitle");
    const tagline = document.getElementById("smokeTagline");
    const scrollHint = document.getElementById("smokeScrollHint");

    if (!section || !stage || !viewport || !video) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ----------------------------------------------------
    // 1. CHARACTER WRAPPING FOR "BEYOND THE MOMENTS"
    // ----------------------------------------------------
    if (mainTitle) {
        const text = mainTitle.textContent.trim();
        mainTitle.textContent = "";
        text.split("").forEach((char) => {
            const span = document.createElement("span");
            span.className = "char";
            span.textContent = char === " " ? "\u00A0" : char;
            mainTitle.appendChild(span);
        });
    }

    // ----------------------------------------------------
    // 2. VOLUMETRIC MULTI-LAYER SMOKE CANVAS ENGINE
    // ----------------------------------------------------
    let smokeCtx = smokeCanvas && smokeCanvas.getContext ? smokeCanvas.getContext("2d") : null;
    let emberCtx = particlesCanvas && particlesCanvas.getContext ? particlesCanvas.getContext("2d") : null;
    let width = 0;
    let height = 0;
    let smokeParticles = [];
    let emberParticles = [];
    let smokeAnimationId = null;

    // Generate soft volumetric smoke puff texture procedural offscreen
    let smokeTexture = null;
    function createSmokeTexture() {
        const pCanvas = document.createElement("canvas");
        pCanvas.width = 128;
        pCanvas.height = 128;
        const pCtx = pCanvas.getContext("2d");
        const grad = pCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
        grad.addColorStop(0, "rgba(235, 230, 235, 0.45)");
        grad.addColorStop(0.35, "rgba(201, 143, 145, 0.22)");
        grad.addColorStop(0.7, "rgba(180, 160, 170, 0.08)");
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        pCtx.fillStyle = grad;
        pCtx.beginPath();
        pCtx.arc(64, 64, 64, 0, Math.PI * 2);
        pCtx.fill();
        return pCanvas;
    }

    function resizeSmokeCanvases() {
        if (!stage) return;
        width = stage.offsetWidth || window.innerWidth;
        height = stage.offsetHeight || window.innerHeight;
        if (smokeCanvas) {
            smokeCanvas.width = width;
            smokeCanvas.height = height;
        }
        if (particlesCanvas) {
            particlesCanvas.width = width;
            particlesCanvas.height = height;
        }
    }
    resizeSmokeCanvases();
    window.addEventListener("resize", resizeSmokeCanvases, { passive: true });

    // Initialize Smoke Particles (entering from left & right depths)
    const SMOKE_COUNT = Math.min(65, Math.floor(window.innerWidth / 20));
    smokeTexture = createSmokeTexture();

    for (let i = 0; i < SMOKE_COUNT; i++) {
        const fromLeft = Math.random() > 0.5;
        smokeParticles.push({
            x: fromLeft ? Math.random() * (width * 0.4) : width - Math.random() * (width * 0.4),
            y: Math.random() * height,
            radius: Math.random() * 180 + 120,
            vx: (fromLeft ? 1 : -1) * (Math.random() * 0.65 + 0.25),
            vy: (Math.random() - 0.5) * 0.35,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.008,
            alpha: Math.random() * 0.55 + 0.25,
            maxAlpha: Math.random() * 0.6 + 0.3,
            depth: Math.random() * 0.8 + 0.2 // Depth factor
        });
    }

    // Initialize Golden Ember Floating Specks
    const EMBER_COUNT = Math.min(40, Math.floor(window.innerWidth / 30));
    for (let i = 0; i < EMBER_COUNT; i++) {
        emberParticles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2 + 0.7,
            vy: -(Math.random() * 0.5 + 0.2),
            vx: (Math.random() - 0.5) * 0.4,
            alpha: Math.random() * 0.6 + 0.2,
            color: Math.random() > 0.4 ? "rgba(226, 184, 181, " : "rgba(201, 143, 145, "
        });
    }

    // Dynamic Smoke Dissolve Factor driven by GSAP ScrollTrigger (1 = thick smoke, 0 = cleared)
    let smokeDensity = { value: 1.0, spreadOffset: 0 };

    function renderSmokeEngine() {
        if (smokeCtx && smokeTexture) {
            smokeCtx.clearRect(0, 0, width, height);

            smokeParticles.forEach((p) => {
                // Flow particle
                p.x += p.vx * p.depth;
                p.y += p.vy * p.depth;
                p.rotation += p.vRot;

                // Push smoke outwards as scroll clears
                const outwardPush = (1 - smokeDensity.value) * 5 * (p.x < width / 2 ? -1 : 1);
                p.x += outwardPush;

                // Wrap boundaries
                if (p.x < -p.radius * 2) p.x = width + p.radius;
                if (p.x > width + p.radius * 2) p.x = -p.radius;
                if (p.y < -p.radius * 2) p.y = height + p.radius;
                if (p.y > height + p.radius * 2) p.y = -p.radius;

                const effectiveAlpha = p.alpha * smokeDensity.value;
                if (effectiveAlpha <= 0.01) return;

                smokeCtx.save();
                smokeCtx.globalAlpha = Math.min(1, Math.max(0, effectiveAlpha));
                smokeCtx.translate(p.x, p.y);
                smokeCtx.rotate(p.rotation);
                const size = p.radius * 2;
                smokeCtx.drawImage(smokeTexture, -p.radius, -p.radius, size, size);
                smokeCtx.restore();
            });
        }

        // Render Embers
        if (emberCtx) {
            emberCtx.clearRect(0, 0, width, height);
            emberParticles.forEach((e) => {
                e.y += e.vy;
                e.x += e.vx;
                if (e.y < 0) {
                    e.y = height;
                    e.x = Math.random() * width;
                }
                if (e.x < 0) e.x = width;
                if (e.x > width) e.x = 0;

                emberCtx.beginPath();
                emberCtx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
                emberCtx.fillStyle = e.color + e.alpha + ")";
                emberCtx.shadowColor = e.color + "0.7)";
                emberCtx.shadowBlur = 8;
                emberCtx.fill();
            });
        }

        smokeAnimationId = requestAnimationFrame(renderSmokeEngine);
    }
    renderSmokeEngine();

    // ----------------------------------------------------
    // 3. VIDEO INTERSECTION AUTOPLAY OBSERVER
    // ----------------------------------------------------
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                video.play().catch(() => {});
            } else {
                video.pause();
            }
        });
    }, { threshold: 0.1 });
    videoObserver.observe(video);

    // ----------------------------------------------------
    // 4. GSAP SCROLLTRIGGER VOLUMETRIC REVEAL TIMELINE
    // ----------------------------------------------------
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined" && !reducedMotion) {
        const titleChars = mainTitle ? mainTitle.querySelectorAll(".char") : [];

        // Pin the smoke stage during cinematic reveal
        const smokeTL = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: "top top",
                end: "+=220%",
                scrub: 1.2,
                pin: true,
                anticipatePin: 1
            }
        });

        // 1. Initially show hint, slowly fade hint as user starts scrolling
        if (scrollHint) {
            smokeTL.to(scrollHint, { opacity: 0.8, duration: 0.2 }, 0)
                   .to(scrollHint, { opacity: 0, duration: 0.4 }, 0.3);
        }

        // 2. Video Viewport emerges from behind smoke with gradual push-in & scale
        smokeTL
            .to(viewport, {
                opacity: 1,
                scale: 1,
                duration: 1.5,
                ease: "power2.out"
            }, 0.2)
            .to(video, {
                scale: 1.0,
                duration: 2.2,
                ease: "none"
            }, 0.2)
            // 3. Smoke density dissolves smoothly, parting left and right
            .to(smokeDensity, {
                value: 0.22,
                duration: 1.6,
                ease: "power1.inOut"
            }, 0.3)
            // 4. Lens flare glow radiates around the couple
            .to(lensGlow, {
                opacity: 0.85,
                scale: 1.25,
                duration: 1.2,
                ease: "power2.out"
            }, 0.8)
            // 5. Subhead Pill appears
            .to(subhead, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: "power2.out"
            }, 1.0)
            // 6. Character-by-character headline reveal "BEYOND THE MOMENTS"
            .to(titleChars, {
                opacity: 1,
                y: 0,
                rotateX: 0,
                filter: "blur(0px)",
                stagger: 0.04,
                duration: 0.8,
                ease: "power3.out"
            }, 1.1)
            // 7. Tagline emerges
            .to(tagline, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power2.out"
            }, 1.4)
            // 8. Graceful hold at full cinematic perfection before transitioning
            .to({}, { duration: 0.6 });
    }
})();
