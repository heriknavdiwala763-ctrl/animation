/**
 * AAKAR FILMS - Premium GSAP Split Text Reveal Animation System
 * Splits headings into words and characters with multi-directional cinematic reveals
 * Fully synchronized with Lenis Smooth Scroll and GSAP ScrollTrigger
 */
(function initGSAPSplitText() {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
        console.warn("GSAP or ScrollTrigger not loaded for SplitText.");
        return;
    }

    /**
     * Splits an element's text content into individual character spans wrapped in overflow-hidden containers.
     * Preserves nested inline tags (e.g. <em>) and whitespace.
     */
    function splitIntoChars(element) {
        if (!element || element.dataset.splitDone) return [];
        element.dataset.splitDone = "true";

        const charsArray = [];

        function traverse(node, targetContainer) {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;
                const chars = Array.from(text);
                chars.forEach((char) => {
                    if (char === " ") {
                        targetContainer.appendChild(document.createTextNode(" "));
                        return;
                    }
                    const wrapper = document.createElement("span");
                    wrapper.className = "split-char-wrapper";
                    const inner = document.createElement("span");
                    inner.className = "split-char";
                    inner.textContent = char;
                    wrapper.appendChild(inner);
                    targetContainer.appendChild(wrapper);
                    charsArray.push(inner);
                });
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const clone = node.cloneNode(false);
                targetContainer.appendChild(clone);
                Array.from(node.childNodes).forEach((child) => traverse(child, clone));
            }
        }

        const fragment = document.createDocumentFragment();
        Array.from(element.childNodes).forEach((child) => traverse(child, fragment));
        element.innerHTML = "";
        element.appendChild(fragment);

        return charsArray;
    }

    /**
     * Splits an element's text content into individual words wrapped in overflow-hidden containers.
     * Preserves nested inline tags (e.g. <em>) and natural whitespace.
     */
    function splitIntoWords(element) {
        if (!element || element.dataset.splitDone) return [];
        element.dataset.splitDone = "true";

        const wordsArray = [];

        function traverse(node, targetContainer) {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;
                // Split by spaces while preserving tokens
                const tokens = text.split(/(\s+)/);
                tokens.forEach((token) => {
                    if (/^\s+$/.test(token)) {
                        targetContainer.appendChild(document.createTextNode(token));
                        return;
                    }
                    if (!token) return;

                    const wrapper = document.createElement("span");
                    wrapper.className = "split-word-wrapper";
                    const inner = document.createElement("span");
                    inner.className = "split-word";
                    inner.textContent = token;
                    wrapper.appendChild(inner);
                    targetContainer.appendChild(wrapper);
                    wordsArray.push(inner);
                });
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const clone = node.cloneNode(false);
                targetContainer.appendChild(clone);
                Array.from(node.childNodes).forEach((child) => traverse(child, clone));
            }
        }

        const fragment = document.createDocumentFragment();
        Array.from(element.childNodes).forEach((child) => traverse(child, fragment));
        element.innerHTML = "";
        element.appendChild(fragment);

        return wordsArray;
    }

    // Responsive distance calculation (smaller on mobile screens)
    const isMobile = window.innerWidth <= 768;
    const vDistance = isMobile ? 32 : 55;
    const hDistance = isMobile ? 25 : 45;

    /* ----------------------------------------------------
       1. HERO SECTION:
          - Heading "AAKAR FILMS": Letter-by-letter multi-directional reveal
          - Tagline "WE CAPTURE EMOTIONS, NOT JUST MOMENTS": Subtle word-by-word reveal
    ---------------------------------------------------- */
    const heroHeading = document.querySelector(".hero-main-brand");
    const heroTagline = document.querySelector(".hero-tagline");

    if (heroHeading) {
        const heroChars = splitIntoChars(heroHeading);
        if (heroChars.length > 0) {
            // Alternating entrance: even letters from top, odd letters from bottom
            heroChars.forEach((char, i) => {
                const fromY = i % 2 === 0 ? -vDistance : vDistance;
                gsap.set(char, {
                    y: fromY,
                    opacity: 0,
                    force3D: true
                });
            });

            // Trigger animation on page load with slight delay for high impact
            gsap.to(heroChars, {
                y: 0,
                opacity: 1,
                duration: 1.1,
                stagger: 0.05,
                ease: "power3.out",
                delay: 0.25
            });
        }
    }

    if (heroTagline) {
        const taglineWords = splitIntoWords(heroTagline);
        if (taglineWords.length > 0) {
            gsap.set(taglineWords, {
                y: vDistance * 0.7,
                opacity: 0,
                force3D: true
            });

            gsap.to(taglineWords, {
                y: 0,
                opacity: 1,
                duration: 1,
                stagger: 0.06,
                ease: "power3.out",
                delay: 0.75
            });
        }
    }

    /* ----------------------------------------------------
       2. ABOUT SECTION:
          - Heading "EVERY LOVE STORY DESERVES TO BE REMEMBERED"
          - Directional Word-by-word reveal:
            * 1st word: enters from left (-X)
            * 2nd word: enters from bottom (+Y)
            * 3rd word: enters from right (+X)
            * 4th word: enters from bottom (+Y)
            * Remaining: sequential bottom (+Y)
    ---------------------------------------------------- */
    const aboutHeading = document.querySelector("#about .section-title");
    if (aboutHeading) {
        const aboutWords = splitIntoWords(aboutHeading);
        if (aboutWords.length > 0) {
            aboutWords.forEach((word, i) => {
                let initX = 0;
                let initY = 0;

                if (i === 0) {
                    initX = -hDistance; // 1st word: from left
                } else if (i === 1) {
                    initY = vDistance;  // 2nd word: from bottom
                } else if (i === 2) {
                    initX = hDistance;  // 3rd word: from right
                } else {
                    initY = vDistance;  // 4th & remaining words: from bottom
                }

                gsap.set(word, {
                    x: initX,
                    y: initY,
                    opacity: 0,
                    force3D: true
                });
            });

            ScrollTrigger.create({
                trigger: aboutHeading,
                start: "top 86%",
                once: true,
                onEnter: () => {
                    gsap.to(aboutWords, {
                        x: 0,
                        y: 0,
                        opacity: 1,
                        duration: 1.05,
                        stagger: 0.07,
                        ease: "power3.out"
                    });
                }
            });
        }
    }

    /* ----------------------------------------------------
       3. WEDDINGS SECTION:
          - Heading "OUR WEDDING STORIES"
          - Staggered word-by-word reveal
    ---------------------------------------------------- */
    const weddingsHeading = document.querySelector("#weddings .section-title");
    if (weddingsHeading) {
        const weddingWords = splitIntoWords(weddingsHeading);
        if (weddingWords.length > 0) {
            weddingWords.forEach((word, i) => {
                const dirY = i % 2 === 0 ? vDistance : vDistance * 1.2;
                gsap.set(word, {
                    y: dirY,
                    opacity: 0,
                    force3D: true
                });
            });

            ScrollTrigger.create({
                trigger: weddingsHeading,
                start: "top 85%",
                once: true,
                onEnter: () => {
                    gsap.to(weddingWords, {
                        y: 0,
                        opacity: 1,
                        duration: 1.05,
                        stagger: 0.08,
                        ease: "power3.out"
                    });
                }
            });
        }
    }

    /* ----------------------------------------------------
       4. CINEMATIC MOMENTS SECTION (Circular Mask Overlay):
          - Heading "MOMENTS THAT LAST FOREVER"
          - Combination of vertical and horizontal word reveals
    ---------------------------------------------------- */
    const maskHeading = document.querySelector("#maskContent h2");
    if (maskHeading) {
        const maskWords = splitIntoWords(maskHeading);
        if (maskWords.length > 0) {
            maskWords.forEach((word, i) => {
                // Alternating horizontal and vertical entrances
                let fromX = 0;
                let fromY = 0;
                if (i === 0) fromX = -hDistance;
                else if (i === 1) fromY = vDistance;
                else if (i === 2) fromX = hDistance;
                else fromY = vDistance;

                gsap.set(word, {
                    x: fromX,
                    y: fromY,
                    opacity: 0,
                    force3D: true
                });
            });

            ScrollTrigger.create({
                trigger: "#maskRevealSection",
                start: "top 50%",
                once: true,
                onEnter: () => {
                    gsap.to(maskWords, {
                        x: 0,
                        y: 0,
                        opacity: 1,
                        duration: 1.1,
                        stagger: 0.08,
                        ease: "power3.out"
                    });
                }
            });
        }
    }

    /* ----------------------------------------------------
       5. OUR FILMS SECTION:
          - Heading "LOVE STORIES IN MOTION"
          - Elegant letter-by-letter reveal
    ---------------------------------------------------- */
    const filmsHeading = document.querySelector("#films .section-title");
    if (filmsHeading) {
        const filmChars = splitIntoChars(filmsHeading);
        if (filmChars.length > 0) {
            filmChars.forEach((char, i) => {
                const charY = i % 2 === 0 ? -vDistance * 0.9 : vDistance * 0.9;
                gsap.set(char, {
                    y: charY,
                    opacity: 0,
                    force3D: true
                });
            });

            ScrollTrigger.create({
                trigger: filmsHeading,
                start: "top 85%",
                once: true,
                onEnter: () => {
                    gsap.to(filmChars, {
                        y: 0,
                        opacity: 1,
                        duration: 1,
                        stagger: 0.04,
                        ease: "power4.out"
                    });
                }
            });
        }
    }

    /* ----------------------------------------------------
       6. CONTACT SECTION:
          - Heading "LET'S CREATE SOMETHING BEAUTIFUL"
          - Word-by-word reveal
    ---------------------------------------------------- */
    const contactHeading = document.querySelector("#contact .contact-left h2");
    if (contactHeading) {
        const contactWords = splitIntoWords(contactHeading);
        if (contactWords.length > 0) {
            contactWords.forEach((word) => {
                gsap.set(word, {
                    y: vDistance,
                    opacity: 0,
                    force3D: true
                });
            });

            ScrollTrigger.create({
                trigger: contactHeading,
                start: "top 88%",
                once: true,
                onEnter: () => {
                    gsap.to(contactWords, {
                        y: 0,
                        opacity: 1,
                        duration: 1,
                        stagger: 0.07,
                        ease: "power3.out"
                    });
                }
            });
        }
    }

    /* ----------------------------------------------------
       7. BONUS EDITORIAL ENHANCEMENT:
          - Section Subheadings & Photography Collections Heading
    ---------------------------------------------------- */
    const catGalleryHeading = document.querySelector("#gallerySection .section-title");
    if (catGalleryHeading) {
        const catWords = splitIntoWords(catGalleryHeading);
        if (catWords.length > 0) {
            catWords.forEach((word) => {
                gsap.set(word, {
                    y: vDistance * 0.8,
                    opacity: 0,
                    force3D: true
                });
            });

            ScrollTrigger.create({
                trigger: catGalleryHeading,
                start: "top 85%",
                once: true,
                onEnter: () => {
                    gsap.to(catWords, {
                        y: 0,
                        opacity: 1,
                        duration: 1,
                        stagger: 0.06,
                        ease: "power3.out"
                    });
                }
            });
        }
    }

    // Refresh ScrollTrigger once text splitting is finalized to keep all page offsets perfectly intact
    setTimeout(() => {
        ScrollTrigger.refresh();
    }, 150);
})();
