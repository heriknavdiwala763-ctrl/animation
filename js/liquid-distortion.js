/**
 * AAKAR FILMS - Liquid Image Distortion Hover System
 * Lightweight, high-performance interactive displacement & ripple distortion on collection cards.
 * Utilizes hardware-accelerated SVG turbulence/displacement filters with mouse coordinate tracking,
 * fluid damping, and smooth reset.
 */
(function initLiquidDistortionSystem() {
    // Check for reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    // 1. Create or ensure Global Liquid SVG Filter in DOM
    function ensureLiquidFilter() {
        if (document.getElementById("liquidFilterSVG")) return;

        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.id = "liquidFilterSVG";
        svg.setAttribute("style", "position: fixed; top: -9999px; left: -9999px; width: 0; height: 0; pointer-events: none; opacity: 0; z-index: -1;");

        svg.innerHTML = `
            <defs>
                <filter id="liquidDisplacementFilter" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
                    <feTurbulence id="liquidTurbulence" type="fractalNoise" baseFrequency="0.025 0.035" numOctaves="2" seed="5" result="noise" />
                    <feDisplacementMap id="liquidDisplacement" in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" result="displaced" />
                    <feGaussianBlur id="liquidBlur" stdDeviation="0" result="blurred" />
                    <feMerge>
                        <feMergeNode in="displaced" />
                    </feMerge>
                </filter>
            </defs>
        `;
        document.body.appendChild(svg);
    }

    ensureLiquidFilter();

    const turb = document.getElementById("liquidTurbulence");
    const disp = document.getElementById("liquidDisplacement");
    if (!turb || !disp) return;

    let activeCard = null;
    let animFrameId = null;
    let currentScale = 0;
    let targetScale = 0;
    let mouseX = 0.5;
    let mouseY = 0.5;
    let targetMouseX = 0.5;
    let targetMouseY = 0.5;
    let waveTime = 0;
    let isHovering = false;

    // Fluid loop for ultra-smooth liquid wave ripples
    function liquidRenderLoop() {
        if (isHovering || currentScale > 0.05) {
            // Smooth damping interpolation
            currentScale += (targetScale - currentScale) * 0.12;
            mouseX += (targetMouseX - mouseX) * 0.1;
            mouseY += (targetMouseY - mouseY) * 0.1;
            waveTime += 0.035;

            // Vary base frequency dynamically based on cursor movement and time
            const freqX = 0.02 + Math.sin(waveTime) * 0.008 + (mouseX - 0.5) * 0.012;
            const freqY = 0.03 + Math.cos(waveTime * 0.8) * 0.008 + (mouseY - 0.5) * 0.012;

            turb.setAttribute("baseFrequency", `${Math.abs(freqX).toFixed(4)} ${Math.abs(freqY).toFixed(4)}`);
            disp.setAttribute("scale", (currentScale * 26).toFixed(2));

            animFrameId = requestAnimationFrame(liquidRenderLoop);
        } else {
            // Full reset
            currentScale = 0;
            disp.setAttribute("scale", "0");
            if (activeCard) {
                const img = activeCard.querySelector("img");
                if (img) img.style.filter = "";
                activeCard = null;
            }
            cancelAnimationFrame(animFrameId);
            animFrameId = null;
        }
    }

    function startLiquidLoop() {
        if (!animFrameId) {
            animFrameId = requestAnimationFrame(liquidRenderLoop);
        }
    }

    // Attach listeners to cards dynamically (handles both initial and category-filtered cards)
    function attachCardListeners() {
        const cards = document.querySelectorAll(".photo-grid-card");

        cards.forEach((card) => {
            if (card.dataset.liquidAttached) return;
            card.dataset.liquidAttached = "true";

            const img = card.querySelector("img");
            if (!img) return;

            // Desktop Mouse Interactions
            card.addEventListener("mouseenter", (e) => {
                if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) return;

                if (activeCard && activeCard !== card) {
                    const prevImg = activeCard.querySelector("img");
                    if (prevImg) prevImg.style.filter = "";
                }

                activeCard = card;
                isHovering = true;
                targetScale = 1.0;

                const rect = card.getBoundingClientRect();
                targetMouseX = mouseX = (e.clientX - rect.left) / rect.width;
                targetMouseY = mouseY = (e.clientY - rect.top) / rect.height;

                img.style.filter = "url(#liquidDisplacementFilter) brightness(1.04) contrast(1.08)";
                startLiquidLoop();
            }, { passive: true });

            card.addEventListener("mousemove", (e) => {
                if (!isHovering || activeCard !== card) return;

                const rect = card.getBoundingClientRect();
                targetMouseX = (e.clientX - rect.left) / rect.width;
                targetMouseY = (e.clientY - rect.top) / rect.height;
                targetScale = 1.0;
            }, { passive: true });

            card.addEventListener("mouseleave", () => {
                if (activeCard === card) {
                    isHovering = false;
                    targetScale = 0;
                }
            }, { passive: true });

            // Mobile subtle ripple on touch
            card.addEventListener("touchstart", () => {
                if (activeCard && activeCard !== card) {
                    const prevImg = activeCard.querySelector("img");
                    if (prevImg) prevImg.style.filter = "";
                }
                activeCard = card;
                isHovering = true;
                targetScale = 0.65;
                img.style.filter = "url(#liquidDisplacementFilter) brightness(1.04)";
                startLiquidLoop();

                setTimeout(() => {
                    if (activeCard === card) {
                        isHovering = false;
                        targetScale = 0;
                    }
                }, 1200);
            }, { passive: true });
        });
    }

    // Expose hook so gallery.js can call attachCardListeners() after re-rendering filtered items
    window.attachLiquidDistortion = attachCardListeners;

    // Initial attachment
    attachCardListeners();
    // Observe DOM changes inside #photographyGrid for automatic binding
    const grid = document.getElementById("photographyGrid");
    if (grid) {
        const observer = new MutationObserver(() => {
            setTimeout(attachCardListeners, 50);
        });
        observer.observe(grid, { childList: true });
    }
})();
