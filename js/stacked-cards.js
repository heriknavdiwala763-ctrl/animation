/**
 * AAKAR FILMS - Ultra-Premium 3D Stacked Photo Reveal Animation System
 * Physically stacks wedding photographs with realistic 3D perspective, translateZ depth,
 * rotateX & rotateY angles, dynamic depth-blur and smooth multi-card lift on scroll.
 */
(function init3DStackedPhotoReveal() {
    // Accessibility check: respect reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
        console.warn("GSAP or ScrollTrigger not loaded for 3D Stacked Cards.");
        return;
    }

    const section = document.getElementById("stackedCardsSection");
    const cards = gsap.utils.toArray(".stacked-card");
    const progressFill = document.getElementById("stackedProgressFill");
    const progressCurrent = document.getElementById("stackedCurrentIdx");

    if (!section || cards.length === 0) return;

    const isMobile = window.innerWidth <= 768;
    const totalCards = cards.length;

    // Organic 3D initial stack transforms for physical deck feel
    // Each card resting in the stack has depth translateZ, slight rotation and vertical offset
    const stackLayout = [
        { z: 0,    rotX: 0,   rotY: 0,    rotZ: 0,    y: 0,  scale: 1,    opacity: 1 },
        { z: -80,  rotX: 4,   rotY: -2,   rotZ: 2.2,  y: 22, scale: 0.96, opacity: 0.95 },
        { z: -160, rotX: 6,   rotY: 2.5,  rotZ: -2.0, y: 44, scale: 0.92, opacity: 0.90 },
        { z: -240, rotX: 8,   rotY: -3,   rotZ: 1.6,  y: 66, scale: 0.88, opacity: 0.85 },
        { z: -320, rotX: 10,  rotY: 2,    rotZ: -1.2, y: 88, scale: 0.84, opacity: 0.80 }
    ];

    // Mobile-optimized lighter 3D offsets to ensure perfect viewing without horizontal clipping
    const mobileStackLayout = [
        { z: 0,    rotX: 0, rotY: 0, rotZ: 0,    y: 0,  scale: 1,    opacity: 1 },
        { z: -50,  rotX: 2, rotY: 0, rotZ: 1.2,  y: 18, scale: 0.96, opacity: 0.95 },
        { z: -100, rotX: 3, rotY: 0, rotZ: -1.2, y: 36, scale: 0.92, opacity: 0.90 },
        { z: -150, rotX: 4, rotY: 0, rotZ: 0.8,  y: 54, scale: 0.88, opacity: 0.85 },
        { z: -200, rotX: 5, rotY: 0, rotZ: -0.8, y: 72, scale: 0.84, opacity: 0.80 }
    ];

    const currentLayout = isMobile ? mobileStackLayout : stackLayout;

    // Initialize all cards in realistic physical 3D stack
    cards.forEach((card, i) => {
        const conf = currentLayout[i] || currentLayout[currentLayout.length - 1];
        gsap.set(card, {
            zIndex: totalCards - i, // Top card is Card 1, underneath is Card 2, etc.
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
            end: `+=${totalCards * (isMobile ? 140 : 180)}%`, // Extended scroll track for majestic cinematic pacing
            scrub: 1.4, // Ultra-smooth silky scrub
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

    // Sequence: As user scrolls, the active top card gracefully lifts up, glides forward towards the screen
    // (translateZ > 300px), tilts in 3D space, fades gracefully or sails aside, allowing the next photograph
    // in the stack to step forward into crisp focus (blur removes, scales to 1, z: 0).
    for (let i = 0; i < totalCards - 1; i++) {
        const topCard = cards[i];
        const nextCard = cards[i + 1];

        // Lift top card smoothly up & forward into 3D viewer space
        masterTl.to(topCard, {
            z: isMobile ? 220 : 380,
            y: isMobile ? -140 : -220,
            rotationX: isMobile ? -8 : -14,
            rotationY: isMobile ? (i % 2 === 0 ? 3 : -3) : (i % 2 === 0 ? 6 : -6),
            rotationZ: isMobile ? (i % 2 === 0 ? -1.5 : 1.5) : (i % 2 === 0 ? -3 : 3),
            scale: isMobile ? 1.05 : 1.14,
            opacity: 0,
            filter: "blur(4px) brightness(1.1)",
            ease: "power2.inOut",
            duration: 2.8,
            force3D: true
        });

        // Concurrently, promote the upcoming card forward to 0 (crisp, focal position)
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
        }, "<"); // Run simultaneously with lift

        // Simultaneously bring deeper cards one step closer in the physical stack
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

        // Luxurious lingering pause so viewer can admire the revealed photograph
        masterTl.to({}, { duration: 1.2 });
    }

    // Refresh GSAP ScrollTrigger offsets
    setTimeout(() => {
        ScrollTrigger.refresh();
    }, 250);
})();
