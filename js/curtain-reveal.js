/**
 * AAKAR FILMS - Luxury Cinematic Curtain Reveal Animation
 * Smooth two-panel velvet curtain opening with fabric fold 3D perspective,
 * revealing the user's authentic wedding couple photograph.
 * Fully optimized for both desktop and mobile touch devices.
 */
(function initCinematicCurtainReveal() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
        console.warn("GSAP or ScrollTrigger not loaded for Curtain Reveal.");
        return;
    }

    const section = document.getElementById("curtainRevealSection");
    const curtainLeft = document.getElementById("curtainLeft");
    const curtainRight = document.getElementById("curtainRight");
    const centerShadow = document.getElementById("curtainCenterShadow");
    const revealedImg = document.getElementById("curtainRevealedImg");
    const textOverlay = document.getElementById("curtainTextOverlay");
    const curtainPrompt = document.getElementById("curtainPrompt");

    if (!section || !curtainLeft || !curtainRight || !revealedImg) return;

    ScrollTrigger.matchMedia({
        // Desktop & Tablet (> 768px)
        "(min-width: 769px)": function () {
            buildCurtainTimeline(false);
        },

        // Mobile devices (<= 768px)
        "(max-width: 768px)": function () {
            buildCurtainTimeline(true);
        }
    });

    function buildCurtainTimeline(isMobile) {
        // Reset base positions
        gsap.set(curtainLeft, { x: "0%", rotationY: 0, force3D: true });
        gsap.set(curtainRight, { x: "0%", rotationY: 0, force3D: true });
        gsap.set(centerShadow, { opacity: 1 });
        gsap.set(curtainPrompt, { opacity: 1, y: 0 });
        gsap.set(textOverlay, { opacity: 0, y: 22 });

        const curtainTl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: "top top",
                end: isMobile ? "+=150%" : "+=200%",
                scrub: isMobile ? 1.0 : 1.2,
                pin: true,
                anticipatePin: 1
            }
        });

        curtainTl
            // 1. Initial Prompt & Center shadow fade
            .to(curtainPrompt, {
                opacity: 0,
                y: 15,
                duration: 0.6,
                ease: "power1.out"
            }, 0)
            .to(centerShadow, {
                opacity: 0,
                duration: 0.8,
                ease: "power1.out"
            }, 0)

            // 2. Both Velvet Curtain Panels pull open smoothly to the sides
            .to(curtainLeft, {
                x: isMobile ? "-102%" : "-108%",
                rotationY: isMobile ? 4 : 14,
                ease: "power2.inOut",
                duration: 3,
                force3D: true
            }, 0.2)
            .to(curtainRight, {
                x: isMobile ? "102%" : "108%",
                rotationY: isMobile ? -4 : -14,
                ease: "power2.inOut",
                duration: 3,
                force3D: true
            }, 0.2)

            // 3. Wedding photograph emerges with subtle cinematic zoom
            .to(revealedImg, {
                scale: 1.0,
                filter: "brightness(0.98) contrast(1.05)",
                ease: "power2.out",
                duration: 3,
                force3D: true
            }, 0.3)

            // 4. Elegant Text Overlay reveals below the photograph
            .to(textOverlay, {
                opacity: 1,
                y: 0,
                ease: "power2.out",
                duration: 1.2
            }, 2.0);

        return () => {
            curtainTl.kill();
        };
    }

    // Refresh GSAP ScrollTrigger after render
    setTimeout(() => {
        ScrollTrigger.refresh();
    }, 250);
})();
