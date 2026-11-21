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

        // 1. Initialize Lenis Smooth Scroll
        // Crucial for Mobile: Disable smoothTouch so mobile uses native, buttery 120Hz/60Hz touch scrolling.
        // On touch devices, Lenis virtual scrolling can conflict with browser address-bar resizing and native inertia.
        const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.matchMedia('(pointer: coarse)').matches;
        let lenis = null;

        if (!isTouch && typeof Lenis !== 'undefined') {
            lenis = new Lenis({
                duration: 0.9,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                direction: 'vertical',
                smooth: true,
                mouseMultiplier: 1.1
            });

            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(1000, 16);
        } else {
            // Native mobile scrolling - ScrollTrigger listens directly to native window scroll
            ScrollTrigger.config({
                limitCallbacks: true,
                ignoreMobileResize: true,
                autoRefreshEvents: "visibilitychange,DOMContentLoaded,load"
            });
        }

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
            // Desktop & Large Tablet (> 768px): Signature reverse kinetic scroll
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

            // Mobile & Touch Devices (<= 768px): Full 3-Column Reverse Kinetic Scroll
            "(max-width: 768px)": function () {
                // Initial positions for mobile 3-column opposite trajectories
                gsap.set(colLeft, { y: 20, force3D: true });
                gsap.set(colCenter, { y: -380, force3D: true }); // Buffered higher so center flows down seamlessly
                gsap.set(colRight, { y: 40, force3D: true });

                const mobileGalleryTimeline = gsap.timeline({
                    scrollTrigger: {
                        trigger: gallerySection,
                        start: "top top",
                        end: "+=140%",
                        scrub: 0.7,
                        pin: true,
                        anticipatePin: 1,
                        invalidateOnRefresh: true
                    }
                });

                mobileGalleryTimeline
                    .to(colLeft, {
                        y: -220,
                        force3D: true,
                        ease: "none"
                    }, 0)
                    .to(colCenter, {
                        y: 60,   // Center column flows DOWNWARDS in opposite direction
                        force3D: true,
                        ease: "none"
                    }, 0)
                    .to(colRight, {
                        y: -180,
                        force3D: true,
                        ease: "none"
                    }, 0);

                return () => {
                    mobileGalleryTimeline.kill();
                    gsap.set([colLeft, colCenter, colRight], { clearProps: "all" });
                };
            }
        });

        // Recalculate ScrollTrigger on image loads and window orientation/resize
        window.addEventListener("load", () => {
            if (typeof ScrollTrigger !== "undefined") {
                ScrollTrigger.refresh();
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

        ScrollTrigger.matchMedia({
            // Desktop & Large Screens
            "(min-width: 769px)": function () {
                const maskTimeline = gsap.timeline({
                    scrollTrigger: {
                        trigger: maskSection,
                        start: "top top",
                        end: "+=650%",
                        scrub: 1.6,
                        pin: true,
                        anticipatePin: 1
                    }
                });

                maskTimeline
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
                    .to({}, { duration: 1.5 })
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
                    .to({}, { duration: 1.5 })
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
                    .to({}, { duration: 1.2 })
                    .to(maskContent, {
                        opacity: 1,
                        y: 0,
                        ease: "power2.out",
                        duration: 2
                    });

                return () => maskTimeline.kill();
            },

            // Mobile Devices: Adjusted distance & responsive radius
            "(max-width: 768px)": function () {
                const maskTimelineMobile = gsap.timeline({
                    scrollTrigger: {
                        trigger: maskSection,
                        start: "top top",
                        end: "+=380%", // Shorter pinned track so mobile users don't get stuck
                        scrub: 1.0,
                        pin: true,
                        anticipatePin: 1
                    }
                });

                maskTimelineMobile
                    .to(maskPrompt, {
                        opacity: 0,
                        scale: 0.8,
                        ease: "power1.out",
                        duration: 1
                    }, 0)
                    .to(layer1, {
                        clipPath: "circle(120vmax at 50% 50%)",
                        webkitClipPath: "circle(120vmax at 50% 50%)",
                        ease: "power1.inOut",
                        duration: 3,
                        onUpdate: function() {
                            const prog = this.progress();
                            if (prog < 0.5) setActiveIndicator(0);
                            else setActiveIndicator(1);
                        }
                    }, 0)
                    .to({}, { duration: 1 })
                    .fromTo(layer2, 
                        { clipPath: "circle(0px at 50% 50%)", webkitClipPath: "circle(0px at 50% 50%)" },
                        {
                            clipPath: "circle(120vmax at 50% 50%)",
                            webkitClipPath: "circle(120vmax at 50% 50%)",
                            ease: "power1.inOut",
                            duration: 3,
                            onUpdate: function() {
                                const prog = this.progress();
                                if (prog > 0.1) setActiveIndicator(2);
                            }
                        }
                    )
                    .to({}, { duration: 1 })
                    .fromTo(layer3, 
                        { clipPath: "circle(0px at 50% 50%)", webkitClipPath: "circle(0px at 50% 50%)" },
                        {
                            clipPath: "circle(120vmax at 50% 50%)",
                            webkitClipPath: "circle(120vmax at 50% 50%)",
                            ease: "power1.inOut",
                            duration: 3,
                            onUpdate: function() {
                                const prog = this.progress();
                                if (prog > 0.1) setActiveIndicator(3);
                            }
                        }
                    )
                    .to({}, { duration: 0.8 })
                    .to(maskContent, {
                        opacity: 1,
                        y: 0,
                        ease: "power2.out",
                        duration: 1.5
                    });

                return () => maskTimelineMobile.kill();
            }
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
                    if (lenis) lenis.stop();
                }
            });
        });

        function closeModal() {
            videoModal.classList.remove('active');
            videoIframe.src = '';
            if (lenis) lenis.start();
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



