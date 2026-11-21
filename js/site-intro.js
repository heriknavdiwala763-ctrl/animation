/**
 * AAKAR FILMS - Luxury Cinematic Intro Poster Reveal
 * Plays smoothly on website open, reveals the authentic brand poster with royal burgundy styling,
 * then gracefully dissolves to reveal the website.
 */
(function initSiteIntro() {
    const loader = document.getElementById("siteIntroLoader");
    const estBadge = document.getElementById("introEst");
    const brandTitle = document.getElementById("introBrandTitle");
    const divider = document.getElementById("introDivider");
    const tagline = document.getElementById("introTagline");

    if (!loader) return;

    // Check if user has already visited in this session to prevent repetitive waiting,
    // or run smoothly every time on full fresh load.
    const hasSeenIntro = sessionStorage.getItem("aakar_intro_seen");

    // Accessibility check: fast fade if reduced motion
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
        loader.classList.add("is-hidden");
        return;
    }

    if (typeof gsap === "undefined") {
        setTimeout(() => {
            loader.classList.add("is-hidden");
        }, 2200);
        return;
    }

    // Lock scrolling during intro
    document.body.style.overflow = "hidden";

    const introTl = gsap.timeline({
        onComplete: () => {
            sessionStorage.setItem("aakar_intro_seen", "true");
            document.body.style.overflow = "";
            loader.classList.add("is-hidden");

            // Refresh ScrollTrigger after intro dissolves
            if (typeof ScrollTrigger !== "undefined") {
                ScrollTrigger.refresh();
            }
        }
    });

    introTl
        // 1. EST. 2018 floats gently down
        .to(estBadge, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out"
        }, 0.2)

        // 2. AAKAR FILMS Master Title emerges with majestic scale & clarity
        .to(brandTitle, {
            opacity: 1,
            scale: 1,
            duration: 1.1,
            ease: "power3.out"
        }, 0.4)

        // 3. Gold line expands outward from center
        .to(divider, {
            opacity: 1,
            width: "clamp(120px, 22vw, 220px)",
            duration: 0.9,
            ease: "power2.inOut"
        }, 0.7)

        // 4. CAPTURING TIMELESS MOMENTS fades in
        .to(tagline, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out"
        }, 0.85)

        // 5. Majestic Hold for 1.4 seconds for viewer admiration
        .to({}, { duration: 1.4 })

        // 6. Graceful, luxurious dissolve & scale into the website
        .to([estBadge, brandTitle, divider, tagline], {
            opacity: 0,
            y: -20,
            scale: 1.04,
            duration: 0.9,
            stagger: 0.05,
            ease: "power2.in"
        })
        .to(loader, {
            opacity: 0,
            duration: 0.9,
            ease: "power2.inOut"
        }, "-=0.4");

})();
