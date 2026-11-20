// Set dynamic year
        document.getElementById('yearVal').textContent = new Date().getFullYear();

        // Ensure Hero Background Video plays reliably across all browsers/mobile
        const heroVideo = document.getElementById('heroBgVideo');
        if (heroVideo) {
            heroVideo.muted = true;
            const playPromise = heroVideo.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    // Autoplay was prevented by browser policy; fallback poster remains visible
                    console.log("Hero background video autoplay handled with poster fallback.");
                });
            }
        }

        // Register GSAP plugins
        gsap.registerPlugin(ScrollTrigger);

        // Configure ScrollTrigger for optimal mobile & touch performance
        ScrollTrigger.config({
            limitCallbacks: true,
            ignoreMobileResize: true // Prevents harsh jumps on mobile browser address bar collapse
        });

        // 1. Initialize Lenis Smooth Scroll (Lightweight & responsive)
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const lenis = new Lenis({
            duration: 0.9,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            smooth: true,
            mouseMultiplier: 1.1,
            smoothTouch: false,
            touchMultiplier: 1.2
        });

        // Sync Lenis with GSAP ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(1000, 16);

        // 2. Throttled Navbar Scroll & Active Link Detection
        const navbar = document.getElementById('navbar');
        const navLinks = document.querySelectorAll('.nav-links a');
        const sections = document.querySelectorAll('section, div.mask-section-wrapper');

        let isNavTicking = false;
        window.addEventListener('scroll', () => {
            if (!isNavTicking) {
                window.requestAnimationFrame(() => {
                    if (window.scrollY > 80) {
                        navbar.classList.add('scrolled');
                    } else {
                        navbar.classList.remove('scrolled');
                    }

                    // Update active link on scroll
                    let current = 'home';
                    sections.forEach(section => {
                        const sectionTop = section.offsetTop - 200;
                        if (window.scrollY >= sectionTop) {
                            if (section.id) current = section.id;
                        }
                    });
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${current}`) {
                            link.classList.add('active');
                        }
                    });
                    isNavTicking = false;
                });
                isNavTicking = true;
            }
        }, { passive: true });

        // Mobile Nav Toggle
        const navToggle = document.getElementById('navToggle');
        const navLinksList = document.getElementById('navLinks');
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('open');
            navLinksList.classList.toggle('open');
        });

        navLinks.forEach(item => {
            item.addEventListener('click', () => {
                navToggle.classList.remove('open');
                navLinksList.classList.remove('open');
            });
        });

        /* ----------------------------------------------------
           ANIMATION SYSTEM 1: THREE-COLUMN REVERSE SCROLL
           - Pinned section where Left & Right scroll upward,
             and the Center column scrolls in the exact OPPOSITE direction (downward).
           - Hardware-accelerated GPU transforms with ultra-smooth scrub
        ---------------------------------------------------- */
        const gallerySection = document.getElementById('parallaxScrollSection');
        const colLeft = document.getElementById('galleryColLeft');
        const colCenter = document.getElementById('galleryColCenter');
        const colRight = document.getElementById('galleryColRight');

        ScrollTrigger.matchMedia({
            // Desktop & Large Tablet
            "(min-width: 769px)": function () {
                gsap.set(colLeft, { y: 60, force3D: true });
                gsap.set(colCenter, { y: -620, force3D: true }); // Buffered high so top never empties
                gsap.set(colRight, { y: 100, force3D: true });

                const galleryTimeline = gsap.timeline({
                    scrollTrigger: {
                        trigger: gallerySection,
                        start: "top top",
                        end: "+=160%",
                        scrub: 0.8,
                        pin: true,
                        anticipatePin: 1
                    }
                });

                galleryTimeline
                    .to(colLeft, {
                        y: -300,
                        force3D: true,
                        ease: "none"
                    }, 0)
                    .to(colCenter, {
                        y: 100,   // Moves down continuously without exposing any blank space
                        force3D: true,
                        ease: "none"
                    }, 0)
                    .to(colRight, {
                        y: -240,
                        force3D: true,
                        ease: "none"
                    }, 0);

                return () => {
                    galleryTimeline.kill();
                };
            },

            // Mobile Adaptive View: Elegant vertical staggered parallax on touch scroll
            "(max-width: 768px)": function () {
                gsap.set([colLeft, colCenter, colRight], { clearProps: "all" });

                // Gentle mobile parallax on columns as user scrolls down
                const mobileTimeline = gsap.timeline({
                    scrollTrigger: {
                        trigger: gallerySection,
                        start: "top 90%",
                        end: "bottom 10%",
                        scrub: 1
                    }
                });

                mobileTimeline
                    .to(colLeft, { y: -40, ease: "none" }, 0)
                    .to(colCenter, { y: 30, ease: "none" }, 0)
                    .to(colRight, { y: -40, ease: "none" }, 0);

                return () => {
                    mobileTimeline.kill();
                    gsap.set([colLeft, colCenter, colRight], { clearProps: "all" });
                };
            }
        });

        /* ----------------------------------------------------
           ANIMATION SYSTEM 2: GSAP CIRCULAR IMAGE MASK REVEAL (4 PHOTOS)
           - Progressive 4-layer circular reveal sequence
        ---------------------------------------------------- */
        const maskSection = document.getElementById('maskRevealSection');
        const layer1 = document.getElementById('circleMaskLayer1');
        const layer2 = document.getElementById('circleMaskLayer2');
        const layer3 = document.getElementById('circleMaskLayer3');
        const maskPrompt = document.getElementById('maskPrompt');
        const maskContent = document.getElementById('maskContent');
        const indicatorDots = document.querySelectorAll('.mask-indicator-dot');

        function setActiveIndicator(idx) {
            indicatorDots.forEach((dot, i) => {
                if (i === idx) dot.classList.add('active');
                else dot.classList.remove('active');
            });
        }

        const maskTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: maskSection,
                start: "top top",
                end: "+=650%", // Generously extended scroll distance for deep, slow transitions
                scrub: 1.6,    // High scrub smoothing for luxurious, slow cinematic glide
                pin: true,
                anticipatePin: 1
            }
        });

        maskTimeline
            // --- Step 1: Prompt fades out, Photo 2 expands very slowly from center circle over Photo 1 ---
            .to(maskPrompt, {
                opacity: 0,
                scale: 0.8,
                ease: "power1.out",
                duration: 1
            }, 0)
            .to(layer1, {
                clipPath: "circle(100vmax at 50% 50%)",
                webkitClipPath: "circle(100vmax at 50% 50%)",
                ease: "power1.inOut",
                duration: 4,
                onUpdate: function() {
                    const prog = this.progress();
                    if (prog < 0.5) setActiveIndicator(0);
                    else setActiveIndicator(1);
                }
            }, 0)
            // Linger on Photo 2
            .to({}, { duration: 1.5 })

            // --- Step 2: Photo 3 expands slowly from center circle over Photo 2 ---
            .fromTo(layer2, 
                { clipPath: "circle(0px at 50% 50%)", webkitClipPath: "circle(0px at 50% 50%)" },
                {
                    clipPath: "circle(100vmax at 50% 50%)",
                    webkitClipPath: "circle(100vmax at 50% 50%)",
                    ease: "power1.inOut",
                    duration: 4,
                    onUpdate: function() {
                        const prog = this.progress();
                        if (prog > 0.1) setActiveIndicator(2);
                    }
                }
            )
            // Linger on Photo 3
            .to({}, { duration: 1.5 })

            // --- Step 3: Photo 4 expands slowly from center circle over Photo 3 ---
            .fromTo(layer3,
                { clipPath: "circle(0px at 50% 50%)", webkitClipPath: "circle(0px at 50% 50%)" },
                {
                    clipPath: "circle(100vmax at 50% 50%)",
                    webkitClipPath: "circle(100vmax at 50% 50%)",
                    ease: "power1.inOut",
                    duration: 4,
                    onUpdate: function() {
                        const prog = this.progress();
                        if (prog > 0.1) setActiveIndicator(3);
                    }
                }
            )
            // Linger on Photo 4
            .to({}, { duration: 1.2 })

            // --- Step 4: Final Overlay Content Reveal ---
            .to(maskContent, {
                opacity: 1,
                y: 0,
                ease: "power2.out",
                duration: 2
            });

        // 3. Video Modal Playback System
        const videoModal = document.getElementById('videoModal');
        const videoIframe = document.getElementById('videoIframe');
        const modalCloseBtn = document.getElementById('modalCloseBtn');
        const filmCards = document.querySelectorAll('.film-card');

        filmCards.forEach(card => {
            card.addEventListener('click', () => {
                const videoSrc = card.getAttribute('data-video');
                if (videoSrc) {
                    videoIframe.src = videoSrc;
                    videoModal.classList.add('active');
                    lenis.stop(); // Stop scroll when modal is open
                }
            });
        });

        function closeModal() {
            videoModal.classList.remove('active');
            videoIframe.src = '';
            lenis.start(); // Resume scroll
        }

        modalCloseBtn.addEventListener('click', closeModal);
        videoModal.addEventListener('click', (e) => {
            if (e.target === videoModal) closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && videoModal.classList.contains('active')) {
                closeModal();
            }
        });

        // 4. Booking Form Handling
        const bookingForm = document.getElementById('bookingForm');
        const formFeedback = document.getElementById('formFeedback');

        if (bookingForm) {
            bookingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                formFeedback.style.display = 'block';
                bookingForm.reset();
                setTimeout(() => {
                    formFeedback.style.display = 'none';
                }, 6000);
            });
        }

        // 5. Global ScrollTrigger Refresh & Orientation Change Handling
        window.addEventListener('load', () => {
            setTimeout(() => {
                ScrollTrigger.refresh();
            }, 300);
        });

        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                ScrollTrigger.refresh();
            }, 400);
        });



