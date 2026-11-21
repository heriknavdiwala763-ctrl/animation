/**
 * AAKAR FILMS - Premium Liquid Text Morphing Animation
 * Sequentially melts, flows, and morphs 5 headings with realistic SVG displacement:
 * 1. CAPTURING LOVE
 * 2. CREATING MEMORIES
 * 3. FOREVER TOGETHER
 * 4. TIMELESS STORIES
 * 5. LOVE BEYOND FRAMES
 * Infinitely loops with 2-3s display hold and 1.2s viscous liquid transformation.
 */
(function initLiquidTextMorph() {
    const textElements = document.querySelectorAll(".liquid-heading");
    const turbNode = document.getElementById("liquidTurbulence");
    const dispNode = document.getElementById("liquidDisplacement");
    const container = document.getElementById("liquidTextContainer");

    if (!textElements || textElements.length === 0) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
        textElements[0].style.opacity = "1";
        return;
    }

    const isMobile = window.innerWidth <= 768;
    const maxDisplacement = isMobile ? 32 : 55;
    const maxBlur = isMobile ? 4.5 : 7;
    const textsCount = textElements.length;

    let currentIndex = 0;
    let isTransitioning = false;

    // Filter control parameters for GSAP tweening
    const filterParams = {
        displacementScale: 0,
        baseFrequencyX: 0.02,
        baseFrequencyY: 0.04,
        blur: 0
    };

    function updateSVGFilter() {
        if (dispNode) {
            dispNode.setAttribute("scale", filterParams.displacementScale.toFixed(2));
        }
        if (turbNode) {
            turbNode.setAttribute(
                "baseFrequency",
                `${filterParams.baseFrequencyX.toFixed(4)} ${filterParams.baseFrequencyY.toFixed(4)}`
            );
        }
    }

    // Set initial text
    gsap.set(textElements[0], {
        opacity: 1,
        filter: "blur(0px)",
        scale: 1,
        yPercent: -50,
        xPercent: -50
    });

    for (let i = 1; i < textsCount; i++) {
        gsap.set(textElements[i], {
            opacity: 0,
            filter: `blur(${maxBlur}px)`,
            scale: 0.96,
            yPercent: -50,
            xPercent: -50
        });
    }

    function morphToNext() {
        if (isTransitioning) return;
        isTransitioning = true;

        const currentEl = textElements[currentIndex];
        const nextIndex = (currentIndex + 1) % textsCount;
        const nextEl = textElements[nextIndex];

        // Seed random turbulence for natural fluid variation
        const targetFreqX = 0.025 + Math.random() * 0.035;
        const targetFreqY = 0.035 + Math.random() * 0.045;

        const tl = gsap.timeline({
            onComplete: () => {
                currentIndex = nextIndex;
                isTransitioning = false;
                // Schedule next morph after 2.6s display hold
                morphTimer = setTimeout(morphToNext, 2600);
            }
        });

        // Step 1: Melt out current text with rising liquid displacement & blur
        tl.to(filterParams, {
            displacementScale: maxDisplacement,
            baseFrequencyX: targetFreqX,
            baseFrequencyY: targetFreqY,
            duration: 0.65,
            ease: "power2.in",
            onUpdate: updateSVGFilter
        }, 0)
        .to(currentEl, {
            opacity: 0,
            filter: `blur(${maxBlur}px)`,
            scale: 1.05,
            duration: 0.65,
            ease: "power2.in"
        }, 0)

        // Step 2: New text reshapes from melted liquid into crisp focus
        .set(nextEl, {
            opacity: 0,
            filter: `blur(${maxBlur}px)`,
            scale: 0.95
        }, 0.5)
        .to(nextEl, {
            opacity: 1,
            filter: "blur(0px)",
            scale: 1,
            duration: 0.75,
            ease: "power2.out"
        }, 0.55)
        .to(filterParams, {
            displacementScale: 0,
            baseFrequencyX: 0.02,
            baseFrequencyY: 0.04,
            duration: 0.75,
            ease: "power2.out",
            onUpdate: updateSVGFilter
        }, 0.55);
    }

    // Start morph cycle after 2.4s initial hold
    let morphTimer = setTimeout(morphToNext, 2400);

    // Pause when page is not visible to conserve battery & CPU
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            clearTimeout(morphTimer);
        } else if (!isTransitioning) {
            clearTimeout(morphTimer);
            morphTimer = setTimeout(morphToNext, 1800);
        }
    });
})();
