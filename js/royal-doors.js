/**
 * AAKAR FILMS - Royal Antique Double Door Opening Animation
 * Opens two 3D wooden palace doors with center golden light beam,
 * revealing the full Contact Section, WhatsApp button & Inquiry form.
 */
(function initRoyalDoorsAnimation() {
    const contactSection = document.getElementById("contact");
    const doorLeft = document.getElementById("royalDoorLeft");
    const doorRight = document.getElementById("royalDoorRight");
    const centerLight = document.getElementById("doorsCenterLight");
    const contactContainer = document.querySelector(".contact-container");
    const contactForm = document.getElementById("bookingForm");
    const doorsViewport = document.getElementById("royalDoorsViewport");

    if (!contactSection || !doorLeft || !doorRight || !doorsViewport) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
        doorsViewport.style.display = "none";
        return;
    }

    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
        console.warn("GSAP / ScrollTrigger not loaded for Royal Doors.");
        return;
    }

    const isMobile = window.innerWidth <= 768;

    ScrollTrigger.matchMedia({
        // Desktop & Tablet
        "(min-width: 769px)": function () {
            buildDoorsTimeline(false);
        },

        // Mobile Phones
        "(max-width: 768px)": function () {
            buildDoorsTimeline(true);
        }
    });

    function buildDoorsTimeline(isMobileDevice) {
        // Reset initial positions
        gsap.set(doorLeft, { rotateY: 0, force3D: true });
        gsap.set(doorRight, { rotateY: 0, force3D: true });
        gsap.set(centerLight, { opacity: 0, width: "6px" });
        gsap.set(contactContainer, { scale: 0.94, opacity: 0.2, filter: "blur(4px)" });
        doorsViewport.style.pointerEvents = "none";

        const maxRotateY = isMobileDevice ? 85 : 108; // Natural palace swing

        const doorsTl = gsap.timeline({
            scrollTrigger: {
                trigger: contactSection,
                start: isMobileDevice ? "top 80%" : "top 70%",
                end: isMobileDevice ? "top 25%" : "top 15%",
                scrub: 1.2,
                once: false,
                onEnter: () => {
                    doorsViewport.style.visibility = "visible";
                },
                onLeave: () => {
                    // Fully open: make sure form is 100% interactable
                    if (contactForm) contactForm.classList.add("doors-revealed");
                },
                onEnterBack: () => {
                    doorsViewport.style.visibility = "visible";
                }
            }
        });

        doorsTl
            // 1. Subtle Golden Light emerges from center seam
            .to(centerLight, {
                opacity: 1,
                width: isMobileDevice ? "14px" : "28px",
                duration: 0.5,
                ease: "power2.out"
            }, 0)

            // 2. Both Royal Palace Doors swing open outward in 3D space
            .to(doorLeft, {
                rotateY: -maxRotateY,
                duration: 2.4,
                ease: "power2.inOut",
                force3D: true
            }, 0.2)
            .to(doorRight, {
                rotateY: maxRotateY,
                duration: 2.4,
                ease: "power2.inOut",
                force3D: true
            }, 0.2)

            // 3. Center beam expands and washes outward then fades as doors open wide
            .to(centerLight, {
                opacity: 0,
                duration: 1.2,
                ease: "power1.out"
            }, 1.2)

            // 4. Contact Section Content comes forward into sharp, pristine royal focus
            .to(contactContainer, {
                scale: 1,
                opacity: 1,
                filter: "blur(0px)",
                duration: 2.0,
                ease: "power2.out"
            }, 0.4);

        return () => {
            doorsTl.kill();
        };
    }

    // Refresh ScrollTrigger
    setTimeout(() => {
        ScrollTrigger.refresh();
    }, 250);
})();
