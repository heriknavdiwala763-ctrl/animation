/**
 * AAKAR FILMS - Interactive 3D Photo Cube Gallery
 * - Smooth continuous 3D rotation (rotateX and rotateY)
 * - Mouse movement tracking with natural inertia and damping
 * - Click-and-drag and touch-drag rotation
 * - GSAP ScrollTrigger entrance reveal & subtle scroll-linked rotation
 * - Quick Face Navigation Buttons
 * - Fully optimized for both desktop and mobile touch devices
 * - Respects prefers-reduced-motion
 */
(function init3DPhotoCubeGallery() {
    const section = document.getElementById("cubeGallerySection");
    const cube = document.getElementById("photoCube3D");
    const hitArea = document.getElementById("cubeHitArea");
    const navButtons = document.querySelectorAll(".cube-nav-btn");

    if (!section || !cube || !hitArea) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Rotation state variables (degrees)
    let currentRotX = -15;
    let currentRotY = 25;
    let targetRotX = -15;
    let targetRotY = 25;

    // Auto-rotation speed when idle
    const autoSpeedY = 0.22;
    const autoSpeedX = 0.05;
    let isAutoRotating = true;
    let isUserDragging = false;
    let isHovering = false;

    // Mouse/Touch drag coordinates
    let dragStartX = 0;
    let dragStartY = 0;
    let startRotX = 0;
    let startRotY = 0;

    // Predefined face rotation angles
    const faceOrientations = {
        front:  { x: 0,   y: 0 },
        back:   { x: 0,   y: 180 },
        right:  { x: 0,   y: -90 },
        left:   { x: 0,   y: 90 },
        top:    { x: -90, y: 0 },
        bottom: { x: 90,  y: 0 }
    };

    // Update active button state based on current orientation
    function updateActiveButton(faceKey) {
        navButtons.forEach(btn => {
            if (btn.getAttribute("data-face") === faceKey) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });
    }

    // ----------------------------------------------------
    // GSAP SCROLLTRIGGER ENTRANCE & INTEGRATION
    // ----------------------------------------------------
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined" && !reducedMotion) {
        // Entrance animation
        gsap.fromTo(cube, 
            { scale: 0.72, opacity: 0 },
            {
                scale: 1,
                opacity: 1,
                duration: 1.5,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: section,
                    start: "top 75%",
                    toggleActions: "play none none reverse"
                }
            }
        );

        // Header animation
        gsap.from(".cube-header > *", {
            y: 30,
            opacity: 0,
            duration: 1,
            stagger: 0.12,
            ease: "power2.out",
            scrollTrigger: {
                trigger: section,
                start: "top 70%"
            }
        });

        // Subtle scroll influence on rotation
        ScrollTrigger.create({
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            onUpdate: (self) => {
                if (!isUserDragging) {
                    targetRotY += self.getVelocity() * 0.0018;
                }
            }
        });
    }

    // ----------------------------------------------------
    // MOUSE MOVE PARALLAX (Desktop only, ignored on touch)
    // ----------------------------------------------------
    section.addEventListener("mousemove", (e) => {
        if (isUserDragging || reducedMotion) return;
        if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) return;
        isHovering = true;

        const rect = section.getBoundingClientRect();
        const normX = (e.clientX - rect.left) / rect.width - 0.5;
        const normY = (e.clientY - rect.top) / rect.height - 0.5;

        targetRotY += normX * 0.4;
        targetRotX -= normY * 0.3;

        targetRotX = Math.max(-85, Math.min(85, targetRotX));
    });

    section.addEventListener("mouseleave", () => {
        isHovering = false;
    });

    // ----------------------------------------------------
    // CLICK & DRAG / TOUCH DRAG ROTATION
    // ----------------------------------------------------
    function onDragStart(clientX, clientY) {
        isUserDragging = true;
        isAutoRotating = false;
        hitArea.classList.add("is-dragging");
        dragStartX = clientX;
        dragStartY = clientY;
        startRotX = targetRotX;
        startRotY = targetRotY;
    }

    function onDragMove(clientX, clientY) {
        if (!isUserDragging) return;
        const deltaX = clientX - dragStartX;
        const deltaY = clientY - dragStartY;

        const sensitivity = 0.45;
        targetRotY = startRotY + deltaX * sensitivity;
        targetRotX = startRotX - deltaY * sensitivity;

        targetRotX = Math.max(-85, Math.min(85, targetRotX));
    }

    function onDragEnd() {
        if (!isUserDragging) return;
        isUserDragging = false;
        hitArea.classList.remove("is-dragging");

        clearTimeout(resumeTimeout);
        resumeTimeout = setTimeout(() => {
            if (!isUserDragging) isAutoRotating = true;
        }, 2200);
    }

    let resumeTimeout = null;

    // Mouse events
    hitArea.addEventListener("mousedown", (e) => {
        e.preventDefault();
        onDragStart(e.clientX, e.clientY);
    });

    window.addEventListener("mousemove", (e) => {
        if (isUserDragging) {
            onDragMove(e.clientX, e.clientY);
        }
    });

    window.addEventListener("mouseup", () => {
        onDragEnd();
    });

    // Touch events for mobile/tablet with vertical scroll bypass
    let touchStartScrollY = 0;
    let isHorizontalGesture = false;

    hitArea.addEventListener("touchstart", (e) => {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            dragStartX = touch.clientX;
            dragStartY = touch.clientY;
            touchStartScrollY = window.scrollY;
            isHorizontalGesture = false;
            startRotX = targetRotX;
            startRotY = targetRotY;
        }
    }, { passive: true });

    hitArea.addEventListener("touchmove", (e) => {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const diffX = Math.abs(touch.clientX - dragStartX);
            const diffY = Math.abs(touch.clientY - dragStartY);

            // If user is predominantly dragging sideways over the cube, rotate cube and prevent page jank
            if (diffX > diffY && diffX > 10) {
                isHorizontalGesture = true;
                isUserDragging = true;
                isAutoRotating = false;
                onDragMove(touch.clientX, touch.clientY);
            } else if (diffY > diffX && !isHorizontalGesture) {
                // If user is scrolling page vertically, do not lock page scroll
                isUserDragging = false;
            } else if (isHorizontalGesture) {
                onDragMove(touch.clientX, touch.clientY);
            }
        }
    }, { passive: true });

    hitArea.addEventListener("touchend", () => {
        isHorizontalGesture = false;
        onDragEnd();
    });

    // ----------------------------------------------------
    // QUICK FACE BUTTON NAVIGATION
    // ----------------------------------------------------
    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const faceKey = btn.getAttribute("data-face");
            if (faceOrientations[faceKey]) {
                isAutoRotating = false;
                const target = faceOrientations[faceKey];

                targetRotX = target.x;
                const diff = (target.y - (targetRotY % 360) + 540) % 360 - 180;
                targetRotY = targetRotY + diff;

                updateActiveButton(faceKey);

                clearTimeout(resumeTimeout);
                resumeTimeout = setTimeout(() => {
                    isAutoRotating = true;
                }, 3500);
            }
        });
    });

    // ----------------------------------------------------
    // MAIN ANIMATION LOOP (requestAnimationFrame)
    // ----------------------------------------------------
    function animate() {
        if (!reducedMotion) {
            if (isAutoRotating && !isUserDragging) {
                targetRotY += autoSpeedY;
                targetRotX = -12 + Math.sin(Date.now() * 0.0008) * 8;
            }

            currentRotX += (targetRotX - currentRotX) * 0.08;
            currentRotY += (targetRotY - currentRotY) * 0.08;

            cube.style.transform = `rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg)`;
        }

        requestAnimationFrame(animate);
    }

    animate();
})();
