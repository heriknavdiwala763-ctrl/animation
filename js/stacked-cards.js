/**
 * AAKAR FILMS - Ultra-Premium 3D Stacked Photo Reveal Animation
 * Realistic physical wedding photo card deck with dynamic 3D depth,
 * scroll-driven reveal, and smooth responsive layout handling.
 */
(function init3DStackedCards() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
        console.warn("GSAP or ScrollTrigger not loaded for Stacked Cards.");
        return;
    }

    const section = document.getElementById("stackedCardsSection");
    const cards = gsap.utils.toArray(".stacked-card");
    const progressFill = document.getElementById("stackedProgressFill");
    const progressCurrent = document.getElementById("stackedCurrentIdx");

    if (!section || cards.length === 0) return;

    const totalCards = cards.length;

    // Organic 3D initial stack transforms for physical deck feel
    const stackLayoutDesktop = [
        { z: 0,    rotX: 0,   rotY: 0,    rotZ: 0,    y: 0,  scale: 1,    opacity: 1 },
        { z: -80,  rotX: 4,   rotY: -2,   rotZ: 2.2,  y: 22, scale: 0.96, opacity: 0.95 },
        { z: -160, rotX: 6,   rotY: 2.5,  rotZ: -2.0, y: 44, scale: 0.92, opacity: 0.90 },
        { z: -240, rotX: 8,   rotY: -3,   rotZ: 1.6,  y: 66, scale: 0.88, opacity: 0.85 },
        { z: -320, rotX: 10,  rotY: 2,    rotZ: -1.2, y: 88, scale: 0.84, opacity: 0.80 }
    ];

    // Mobile-optimized lighter 3D offsets to avoid any overflow or perspective clipping
    const stackLayoutMobile = [
        { z: 0,    rotX: 0, rotY: 0, rotZ: 0,    y: 0,  scale: 1,    opacity: 1 },
        { z: -40,  rotX: 2, rotY: 0, rotZ: 1.0,  y: 14, scale: 0.96, opacity: 0.95 },
        { z: -80,  rotX: 3, rotY: 0, rotZ: -1.0, y: 28, scale: 0.92, opacity: 0.90 },
        { z: -120, rotX: 4, rotY: 0, rotZ: 0.6,  y: 42, scale: 0.88, opacity: 0.85 },
        { z: -160, rotX: 5, rotY: 0, rotZ: -0.6, y: 56, scale: 0.84, opacity: 0.80 }
    ];

    // Use ScrollTrigger.matchMedia for dynamic responsive reconstruction on resize/orientation change
    ScrollTrigger.matchMedia({
        // Desktop & Tablets (> 768px)
        "(min-width: 769px)": function () {
            buildStackedTimeline(false, stackLayoutDesktop);
        },

        // Mobile devices (<= 768px)
        "(max-width: 768px)": function () {
            buildStackedTimeline(true, stackLayoutMobile);
        }
    });

    function buildStackedTimeline(isMobile, currentLayout) {
        // Initialize cards in 3D stack
        cards.forEach((card, i) => {
            const conf = currentLayout[i] || currentLayout[currentLayout.length - 1];
            gsap.set(card, {
                zIndex: totalCards - i,
                transformPerspective: isMobile ? 1000 : 1600,
                transformOrigin: "50% 50%",
                z: conf.z,
                rotationX: conf.rotX,
                rotationY: conf.rotY,
                rotationZ: conf.rotZ,
                y: conf.y,
                scale: conf.scale,
                opacity: conf.opacity,
                filter: i === 0 ? "blur(0px) brightness(1)" : `blur(${i * 1.2}px) brightness(${1 - i * 0.08})`,
                force3D: true
            });
        });

        // Master Timeline with ScrollTrigger Pinning
        const masterTl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: "top top",
                end: `+=${totalCards * (isMobile ? 130 : 180)}%`,
                scrub: isMobile ? 1.0 : 1.4,
                pin: true,
                anticipatePin: 1,
                onUpdate: (self) => {
                    const prog = self.progress;
                    if (progressFill) {
                        progressFill.style.width = `${Math.min(100, Math.max(20, prog * 100))}%`;
                    }
                    if (progressCurrent) {
                        const activeIdx = Math.min(totalCards, Math.floor(prog * totalCards) + 1);
                        progressCurrent.textContent = `0${activeIdx}`;
                    }
                }
            }
        });

        for (let i = 0; i < totalCards - 1; i++) {
            const topCard = cards[i];
            const nextCard = cards[i + 1];

            // Lift top card smoothly up & forward into 3D viewer space
            masterTl.to(topCard, {
                z: isMobile ? 180 : 380,
                y: isMobile ? -110 : -220,
                rotationX: isMobile ? -6 : -14,
                rotationY: isMobile ? (i % 2 === 0 ? 2 : -2) : (i % 2 === 0 ? 6 : -6),
                rotationZ: isMobile ? (i % 2 === 0 ? -1 : 1) : (i % 2 === 0 ? -3 : 3),
                scale: isMobile ? 1.04 : 1.14,
                opacity: 0,
                filter: "blur(4px) brightness(1.1)",
                ease: "power2.inOut",
                duration: 2.8,
                force3D: true
            });

            // Concurrently promote next card forward into crisp focus
            masterTl.to(nextCard, {
                z: 0,
                y: 0,
                rotationX: 0,
                rotationY: 0,
                rotationZ: 0,
                scale: 1,
                opacity: 1,
                filter: "blur(0px) brightness(1)",
                ease: "power2.out",
                duration: 2.8,
                force3D: true
            }, "<");

            // Bring deeper cards one step closer
            for (let k = i + 2; k < totalCards; k++) {
                const stepCloser = k - (i + 1);
                const targetConf = currentLayout[stepCloser];
                if (targetConf) {
                    masterTl.to(cards[k], {
                        z: targetConf.z,
                        rotationX: targetConf.rotX,
                        rotationY: targetConf.rotY,
                        rotationZ: targetConf.rotZ,
                        y: targetConf.y,
                        scale: targetConf.scale,
                        opacity: targetConf.opacity,
                        filter: `blur(${stepCloser * 1.2}px) brightness(${1 - stepCloser * 0.08})`,
                        ease: "power2.out",
                        duration: 2.8,
                        force3D: true
                    }, "<");
                }
            }

            // Pause between card transitions
            masterTl.to({}, { duration: 1.0 });
        }

        return () => {
            masterTl.kill();
        };
    }

    // Refresh GSAP ScrollTrigger offsets after render
    setTimeout(() => {
        ScrollTrigger.refresh();
    }, 250);
})();
