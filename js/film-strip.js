/**
 * AAKAR FILMS - Infinite Cinematic Film Strip with Real Video Playback
 * - Authentic 35mm film strip horizontal scroll transition
 * - Real playable HTML5 video & high-def cinema player modal
 * - Interactive controls: Play, Pause, Mute/Unmute, Progress Scrubber, Fullscreen
 * - Smooth scroll-linked GSAP ScrollTrigger movement
 * - Touch friendly & responsive
 */
(function initCinematicFilmStrip() {
    const filmSection = document.getElementById("films");
    const filmTrack = document.getElementById("filmStripTrack");
    const filmCards = document.querySelectorAll(".film-frame-card");
    const cinemaModal = document.getElementById("cinemaPlayerModal");
    const cinemaVideo = document.getElementById("cinemaNativeVideo");
    const cinemaIframe = document.getElementById("cinemaEmbedIframe");
    const closeBtn = document.getElementById("cinemaCloseBtn");
    const playPauseBtn = document.getElementById("cinemaPlayPauseBtn");
    const muteBtn = document.getElementById("cinemaMuteBtn");
    const fullscreenBtn = document.getElementById("cinemaFullscreenBtn");
    const progressBar = document.getElementById("cinemaProgressBar");
    const progressFill = document.getElementById("cinemaProgressFill");

    if (!filmSection || !filmTrack || filmCards.length === 0) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ----------------------------------------------------
    // 1. GSAP SCROLLTRIGGER HORIZONTAL FILM REEL TRANSITION
    // ----------------------------------------------------
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined" && !reducedMotion) {
        ScrollTrigger.matchMedia({
            // Desktop & Tablets (> 768px): Smooth pinned horizontal film travel
            "(min-width: 769px)": function () {
                const totalScrollWidth = filmTrack.scrollWidth - window.innerWidth + 120;

                const filmTimeline = gsap.timeline({
                    scrollTrigger: {
                        trigger: filmSection,
                        start: "top 20%",
                        end: () => `+=${totalScrollWidth}`,
                        scrub: 1.2,
                        pin: false,
                        anticipatePin: 1
                    }
                });

                filmTimeline.to(filmTrack, {
                    x: () => -totalScrollWidth,
                    ease: "none"
                });

                return () => filmTimeline.kill();
            },

            // Mobile devices (<= 768px): Responsive horizontal translation
            "(max-width: 768px)": function () {
                const mobileScrollWidth = filmTrack.scrollWidth - window.innerWidth + 40;

                const mobileTimeline = gsap.timeline({
                    scrollTrigger: {
                        trigger: filmSection,
                        start: "top 75%",
                        end: "bottom 25%",
                        scrub: 1.0
                    }
                });

                mobileTimeline.to(filmTrack, {
                    x: () => -Math.max(0, mobileScrollWidth),
                    ease: "none"
                });

                return () => mobileTimeline.kill();
            }
        });
    }

    // ----------------------------------------------------
    // 2. REAL CINEMA VIDEO PLAYBACK SYSTEM
    // ----------------------------------------------------
    function openCinemaPlayer(videoSrc, isEmbed) {
        if (!cinemaModal) return;

        cinemaModal.classList.add("is-active");
        cinemaModal.setAttribute("aria-hidden", "false");

        if (isEmbed) {
            // YouTube / Vimeo embed URL
            cinemaVideo.style.display = "none";
            cinemaVideo.pause();
            cinemaIframe.style.display = "block";
            // Ensure autoplay parameter
            const autoplayUrl = videoSrc.includes("autoplay=1") 
                ? videoSrc 
                : `${videoSrc}${videoSrc.includes("?") ? "&" : "?"}autoplay=1`;
            cinemaIframe.src = autoplayUrl;
            if (progressBar) progressBar.style.display = "none";
            if (playPauseBtn) playPauseBtn.style.display = "none";
            if (muteBtn) muteBtn.style.display = "none";
        } else {
            // Real Local / Direct MP4 HTML5 Video
            cinemaIframe.style.display = "none";
            cinemaIframe.src = "";
            cinemaVideo.style.display = "block";
            cinemaVideo.src = videoSrc;
            cinemaVideo.currentTime = 0;
            cinemaVideo.play().catch(err => {
                console.warn("Autoplay interaction policy:", err);
            });
            if (progressBar) progressBar.style.display = "block";
            if (playPauseBtn) playPauseBtn.style.display = "inline-flex";
            if (muteBtn) muteBtn.style.display = "inline-flex";
            updatePlayPauseIcon(true);
        }
    }

    function closeCinemaPlayer() {
        if (!cinemaModal) return;

        cinemaModal.classList.remove("is-active");
        cinemaModal.setAttribute("aria-hidden", "true");

        if (cinemaVideo) {
            cinemaVideo.pause();
            cinemaVideo.src = "";
        }
        if (cinemaIframe) {
            cinemaIframe.src = "";
        }
    }

    function updatePlayPauseIcon(isPlaying) {
        if (!playPauseBtn) return;
        if (isPlaying) {
            playPauseBtn.innerHTML = `
                <svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
            `;
            playPauseBtn.setAttribute("title", "Pause");
        } else {
            playPauseBtn.innerHTML = `
                <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            `;
            playPauseBtn.setAttribute("title", "Play");
        }
    }

    // Attach click events to all film frame cards
    filmCards.forEach((card) => {
        card.addEventListener("click", () => {
            const videoSrc = card.getAttribute("data-video");
            const isEmbed = card.getAttribute("data-embed") === "true" || videoSrc.includes("youtube.com") || videoSrc.includes("youtu.be");
            if (videoSrc) {
                openCinemaPlayer(videoSrc, isEmbed);
            }
        });
    });

    // Close button & backdrop click
    if (closeBtn) closeBtn.addEventListener("click", closeCinemaPlayer);
    if (cinemaModal) {
        cinemaModal.addEventListener("click", (e) => {
            if (e.target === cinemaModal) closeCinemaPlayer();
        });
    }

    // Keyboard ESC to close
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && cinemaModal.classList.contains("is-active")) {
            closeCinemaPlayer();
        }
    });

    // Play / Pause toggle
    if (playPauseBtn && cinemaVideo) {
        playPauseBtn.addEventListener("click", () => {
            if (cinemaVideo.paused) {
                cinemaVideo.play();
                updatePlayPauseIcon(true);
            } else {
                cinemaVideo.pause();
                updatePlayPauseIcon(false);
            }
        });

        cinemaVideo.addEventListener("play", () => updatePlayPauseIcon(true));
        cinemaVideo.addEventListener("pause", () => updatePlayPauseIcon(false));
    }

    // Mute / Unmute toggle
    if (muteBtn && cinemaVideo) {
        muteBtn.addEventListener("click", () => {
            cinemaVideo.muted = !cinemaVideo.muted;
            muteBtn.innerHTML = cinemaVideo.muted
                ? `<svg viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`
                : `<svg viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
        });
    }

    // Video progress tracking
    if (cinemaVideo && progressFill) {
        cinemaVideo.addEventListener("timeupdate", () => {
            if (cinemaVideo.duration) {
                const percent = (cinemaVideo.currentTime / cinemaVideo.duration) * 100;
                progressFill.style.width = `${percent}%`;
            }
        });
    }

    // Scrubber click
    if (progressBar && cinemaVideo) {
        progressBar.addEventListener("click", (e) => {
            const rect = progressBar.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            if (cinemaVideo.duration) {
                cinemaVideo.currentTime = pos * cinemaVideo.duration;
            }
        });
    }

    // Fullscreen toggle
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener("click", () => {
            const stage = document.querySelector(".cinema-player-stage");
            if (!document.fullscreenElement) {
                if (stage && stage.requestFullscreen) {
                    stage.requestFullscreen();
                } else if (cinemaVideo && cinemaVideo.requestFullscreen) {
                    cinemaVideo.requestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        });
    }

    // Refresh GSAP ScrollTrigger
    setTimeout(() => {
        if (typeof ScrollTrigger !== "undefined") {
            ScrollTrigger.refresh();
        }
    }, 300);
})();
