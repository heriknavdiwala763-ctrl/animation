/**
 * AAKAR FILMS - Luxury Smooth Trail Cursor & Follower Dot
 * Renders smooth quadratic bezier curve trail with gold glow and magnetic dot
 */
(function initSmoothTrailCursor() {
    // Only run on devices with fine pointer (mouse / trackpad)
    if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) {
        return;
    }

    const canvas = document.getElementById("cursorTrailCanvas");
    const dot = document.getElementById("cursorFollowerDot");
    if (!canvas || !dot) return;

    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener("resize", () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }, { passive: true });

    const mouse = { x: -100, y: -100, targetX: -100, targetY: -100, isMoved: false };
    const trailPoints = [];
    const maxTrailPoints = 25; // Length of silky ribbon trail

    window.addEventListener("mousemove", (e) => {
        mouse.targetX = e.clientX;
        mouse.targetY = e.clientY;
        if (!mouse.isMoved) {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            mouse.isMoved = true;
            dot.style.opacity = "1";
        }
    }, { passive: true });

    document.addEventListener("mouseleave", () => {
        dot.style.opacity = "0";
    });

    document.addEventListener("mouseenter", () => {
        if (mouse.isMoved) dot.style.opacity = "1";
    });

    // Detect clickable elements for magnetic hover feedback
    const interactiveSelectors = "a, button, .category-card, .film-card, .btn-luxury, .whatsapp-cta, .photo-grid-card, input, textarea, select";
    document.addEventListener("mouseover", (e) => {
        if (e.target.closest(interactiveSelectors)) {
            dot.classList.add("is-hovering");
        }
    });

    document.addEventListener("mouseout", (e) => {
        if (e.target.closest(interactiveSelectors)) {
            dot.classList.remove("is-hovering");
        }
    });

    function renderTrail() {
        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        if (mouse.isMoved) {
            // Smoothly interpolate current mouse to target
            mouse.x += (mouse.targetX - mouse.x) * 0.25;
            mouse.y += (mouse.targetY - mouse.y) * 0.25;

            // Update main follower dot position
            dot.style.left = `${mouse.x}px`;
            dot.style.top = `${mouse.y}px`;

            // Push head position into points history
            trailPoints.unshift({ x: mouse.x, y: mouse.y });
            if (trailPoints.length > maxTrailPoints) {
                trailPoints.pop();
            }

            // Draw silky smooth tapered trail line using quadratic bezier curves
            if (trailPoints.length > 2) {
                for (let i = 0; i < trailPoints.length - 1; i++) {
                    const p1 = trailPoints[i];
                    const p2 = trailPoints[i + 1];

                    // Taper width from 4.5px down to 0.5px
                    const progress = 1 - i / trailPoints.length;
                    const lineWidth = progress * 4.5;
                    const alpha = progress * 0.55;

                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    
                    // Midpoint for curve smoothness
                    const midX = (p1.x + p2.x) / 2;
                    const midY = (p1.y + p2.y) / 2;
                    ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);

                    ctx.lineCap = "round";
                    ctx.lineJoin = "round";
                    ctx.lineWidth = lineWidth;
                    // Luxury gold/champagne glow trail
                    ctx.strokeStyle = `rgba(207, 168, 120, ${alpha})`;
                    ctx.shadowBlur = 8;
                    ctx.shadowColor = `rgba(216, 196, 186, ${alpha * 0.8})`;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(renderTrail);
    }

    renderTrail();
})();
