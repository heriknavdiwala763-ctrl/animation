/**
 * AAKAR FILMS - Ultra-Premium 3D Perspective Gallery Interaction System
 * Creates floating 3D photographs that react naturally to mouse movements with dynamic tilt,
 * parallax image counter-shift, specular glass light reflections, and smooth damping.
 */
(function init3DPerspectiveGallery() {
    // Accessibility check: do not apply tilting if reduced motion is requested
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    const maxRotation = 10; // Max tilt angle in degrees (+-10deg)
    const maxParallax = 18; // Max image shift in pixels (+-18px)

    function attachCardTilt(card) {
        if (card.dataset.tiltAttached) return;
        card.dataset.tiltAttached = "true";

        const img = card.querySelector("img");
        if (!img) return;

        // Ensure realistic glass sheen highlight overlay exists
        let sheen = card.querySelector(".card-3d-sheen");
        if (!sheen) {
            sheen = document.createElement("div");
            sheen.className = "card-3d-sheen";
            card.appendChild(sheen);
        }

        let isHovered = false;
        let mouseX = 0;
        let mouseY = 0;
        let currentRotX = 0;
        let currentRotY = 0;
        let currentTransZ = 0;
        let currentImgX = 0;
        let currentImgY = 0;
        let currentScale = 1;
        let animId = null;

        function updateTiltLoop() {
            if (isHovered) {
                // Target values based on cursor offset (-1 to +1)
                const targetRotX = -mouseY * maxRotation;
                const targetRotY = mouseX * maxRotation;
                const targetTransZ = 35; // Floats card towards the screen
                const targetImgX = -mouseX * maxParallax;
                const targetImgY = -mouseY * maxParallax;
                const targetScale = 1.03;

                // Smooth organic interpolation (damping)
                currentRotX += (targetRotX - currentRotX) * 0.12;
                currentRotY += (targetRotY - currentRotY) * 0.12;
                currentTransZ += (targetTransZ - currentTransZ) * 0.12;
                currentImgX += (targetImgX - currentImgX) * 0.12;
                currentImgY += (targetImgY - currentImgY) * 0.12;
                currentScale += (targetScale - currentScale) * 0.12;

                // Dynamic shadow based on tilt position
                const shadowX = -currentRotY * 2.5;
                const shadowY = Math.max(15, currentRotX * 2.5 + 25);
                const shadowBlur = 45 + currentTransZ * 0.5;

                card.style.transform = `perspective(1200px) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg) translateZ(${currentTransZ.toFixed(2)}px) scale(${currentScale.toFixed(3)})`;
                card.style.boxShadow = `${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px ${shadowBlur.toFixed(1)}px rgba(0, 0, 0, 0.88), 0 0 25px rgba(207, 168, 120, 0.25)`;

                // Parallax counter-shift on inner image
                img.style.transform = `scale(1.08) translate3d(${currentImgX.toFixed(2)}px, ${currentImgY.toFixed(2)}px, 0)`;

                // Dynamic light reflection following cursor
                const lightX = ((mouseX + 1) / 2) * 100;
                const lightY = ((mouseY + 1) / 2) * 100;
                sheen.style.background = `radial-gradient(circle at ${lightX.toFixed(1)}% ${lightY.toFixed(1)}%, rgba(255, 255, 255, 0.22) 0%, rgba(207, 168, 120, 0.08) 35%, transparent 75%)`;
                sheen.style.opacity = "1";

                animId = requestAnimationFrame(updateTiltLoop);
            } else {
                // Return smoothly to rest
                currentRotX += (0 - currentRotX) * 0.12;
                currentRotY += (0 - currentRotY) * 0.12;
                currentTransZ += (0 - currentTransZ) * 0.12;
                currentImgX += (0 - currentImgX) * 0.12;
                currentImgY += (0 - currentImgY) * 0.12;
                currentScale += (1 - currentScale) * 0.12;

                card.style.transform = `perspective(1200px) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg) translateZ(${currentTransZ.toFixed(2)}px) scale(${currentScale.toFixed(3)})`;
                card.style.boxShadow = "";
                img.style.transform = `scale(1.01) translate3d(${currentImgX.toFixed(2)}px, ${currentImgY.toFixed(2)}px, 0)`;
                sheen.style.opacity = "0";

                // Stop loop when completely at rest
                if (
                    Math.abs(currentRotX) < 0.05 &&
                    Math.abs(currentRotY) < 0.05 &&
                    Math.abs(currentTransZ) < 0.05 &&
                    Math.abs(currentScale - 1) < 0.005
                ) {
                    card.style.transform = "";
                    img.style.transform = "";
                    cancelAnimationFrame(animId);
                    animId = null;
                    return;
                }

                animId = requestAnimationFrame(updateTiltLoop);
            }
        }

        // Desktop mouse events
        card.addEventListener("mouseenter", () => {
            if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) return;
            isHovered = true;
            if (!animId) animId = requestAnimationFrame(updateTiltLoop);
        }, { passive: true });

        card.addEventListener("mousemove", (e) => {
            if (!isHovered) return;
            const rect = card.getBoundingClientRect();
            // Convert to normalized coordinates from -1 to +1
            mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouseY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        }, { passive: true });

        card.addEventListener("mouseleave", () => {
            isHovered = false;
        }, { passive: true });

        // Mobile touch entrance / interaction
        card.addEventListener("touchstart", () => {
            card.classList.add("touch-active");
            setTimeout(() => card.classList.remove("touch-active"), 800);
        }, { passive: true });
    }

    function scanAndAttachCards() {
        const cards = document.querySelectorAll(".photo-grid-card");
        cards.forEach(attachCardTilt);
    }

    // Attach to current cards
    scanAndAttachCards();

    // Observe category switching dynamic renders inside grid
    const grid = document.getElementById("photographyGrid");
    if (grid) {
        const observer = new MutationObserver(() => {
            setTimeout(scanAndAttachCards, 60);
        });
        observer.observe(grid, { childList: true });
    }
})();
