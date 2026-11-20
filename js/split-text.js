/**
 * AAKAR FILMS - Premium GSAP Split Text Reveal Animation System
 * Splits headings into words and characters with multi-directional cinematic reveals
 * Fully synchronized with Lenis Smooth Scroll and GSAP ScrollTrigger
 * Responsive on desktop, tablet, and mobile devices
 */
(function initGSAPSplitText() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
        console.warn("GSAP or ScrollTrigger not loaded for SplitText.");
        return;
    }

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
        element.textContent = "";
        element.appendChild(fragment);

        return charsArray;
    }

    function splitIntoWords(element) {
        if (!element || element.dataset.splitDone) return [];
        element.dataset.splitDone = "true";

        const wordsArray = [];

        function traverse(node, targetContainer) {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent.trim();
                if (!text) return;
                const words = text.split(/\s+/);
                words.forEach((w, idx) => {
                    const wrapper = document.createElement("span");
                    wrapper.className = "split-word-wrapper";
                    const inner = document.createElement("span");
                    inner.className = "split-word";
                    inner.textContent = w;
                    wrapper.appendChild(inner);
                    targetContainer.appendChild(wrapper);
                    wordsArray.push(inner);

                    if (idx < words.length - 1) {
                        targetContainer.appendChild(document.createTextNode(" "));
                    }
                });
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const clone = node.cloneNode(false);
                targetContainer.appendChild(clone);
                Array.from(node.childNodes).forEach((child) => traverse(child, clone));
            }
        }

        const fragment = document.createDocumentFragment();
        Array.from(element.childNodes).forEach((child) => traverse(child, fragment));
        element.textContent = "";
        element.appendChild(fragment);

        return wordsArray;
    }

    const isMobile = window.innerWidth <= 768;
    const vDistance = isMobile ? 26 : 55;
    const hDistance = isMobile ? 20 : 45;

    /* ----------------------------------------------------
       1. HERO SECTION
    ---------------------------------------------------- */
    const heroHeading = document.querySelector(".hero-main-brand");
    const heroTagline = document.querySelector(".hero-tagline");

    if (heroHeading) {
        const heroChars = splitIntoChars(heroHeading);
        if (heroChars.length > 0) {
            heroChars.forEach((char, i) => {
                const fromY = i % 2 === 0 ? -vDistance : vDistance;
                gsap.set(char, {
                    y: fromY,
                    opacity: 0,
                    force3D: true
                });
            });

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
       2. ABOUT SECTION
    ---------------------------------------------------- */
    const aboutHeading = document.querySelector("#about .section-title");
    if (aboutHeading) {
        const aboutWords = splitIntoWords(aboutHeading);
        if (aboutWords.length > 0) {
            aboutWords.forEach((word, i) => {
                const dir = i % 3;
                let initX = 0, initY = 0;
                if (dir === 0) initY = -vDistance;
                else if (dir === 1) initY = vDistance;
                else initX = -hDistance;

                gsap.set(word, {
                    x: initX,
                    y: initY,
                    opacity: 0,
                    force3D: true
                });
            });

            ScrollTrigger.create({
                trigger: aboutHeading,
                start: isMobile ? "top 92%" : "top 86%",
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
       3. WEDDINGS SECTION
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
                start: isMobile ? "top 92%" : "top 85%",
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
       4. CINEMATIC MOMENTS SECTION (Circular Mask Overlay)
    ---------------------------------------------------- */
    const maskHeading = document.querySelector("#maskContent h2");
    if (maskHeading) {
        const maskWords = splitIntoWords(maskHeading);
        if (maskWords.length > 0) {
            maskWords.forEach((word, i) => {
                const dir = i % 4;
                let initX = 0, initY = 0;
                if (dir === 0) initY = -vDistance;
                else if (dir === 1) initY = vDistance;
                else if (dir === 2) initX = -hDistance;
                else initX = hDistance;

                gsap.set(word, {
                    x: initX,
                    y: initY,
                    opacity: 0,
                    force3D: true
                });
            });

            ScrollTrigger.create({
                trigger: "#maskRevealSection",
                start: isMobile ? "top 60%" : "top 30%",
                once: true,
                onEnter: () => {
                    gsap.to(maskWords, {
                        x: 0,
                        y: 0,
                        opacity: 1,
                        duration: 1.2,
                        stagger: 0.08,
                        ease: "power3.out"
                    });
                }
            });
        }
    }

    /* ----------------------------------------------------
       5. CINEMATOGRAPHY (FILMS) SECTION
    ---------------------------------------------------- */
    const filmsHeading = document.querySelector("#films .section-title");
    if (filmsHeading) {
        const filmWords = splitIntoWords(filmsHeading);
        if (filmWords.length > 0) {
            filmWords.forEach((word, i) => {
                const dirX = i % 2 === 0 ? -hDistance : hDistance;
                gsap.set(word, {
                    x: dirX,
                    opacity: 0,
                    force3D: true
                });
            });

            ScrollTrigger.create({
                trigger: filmsHeading,
                start: isMobile ? "top 92%" : "top 85%",
                once: true,
                onEnter: () => {
                    gsap.to(filmWords, {
                        x: 0,
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
       6. CONTACT SECTION
    ---------------------------------------------------- */
    const contactHeading = document.querySelector("#contact .section-title");
    if (contactHeading) {
        const contactWords = splitIntoWords(contactHeading);
        if (contactWords.length > 0) {
            contactWords.forEach((word, i) => {
                const fromY = i % 2 === 0 ? vDistance : -vDistance;
                gsap.set(word, {
                    y: fromY,
                    opacity: 0,
                    force3D: true
                });
            });

            ScrollTrigger.create({
                trigger: contactHeading,
                start: isMobile ? "top 92%" : "top 85%",
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
       7. PHOTOGRAPHY CATEGORY GALLERY SECTION
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
                start: isMobile ? "top 92%" : "top 85%",
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

    setTimeout(() => {
        ScrollTrigger.refresh();
    }, 150);
})();
