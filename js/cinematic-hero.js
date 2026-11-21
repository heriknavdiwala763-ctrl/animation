/**
 * AAKAR FILMS - Immersive Cinematic Multi-Scene Video Experience
 * Features:
 * - Dynamic 3-Scene Video Transition (Royal Wedding Ceremony, Udaipur Romance, Heritage Reception)
 * - Optical Camera Push-in / Pull-out zoom simulations
 * - Parallax camera glide following mouse / scroll depth
 * - Scene title & metadata synchronization
 * - Seamless looping & auto-recovery on mobile
 */
(function initImmersiveCinematicHero() {
    const videoScenes = document.querySelectorAll(".hero-scene-video");
    const sceneNavBtns = document.querySelectorAll(".scene-dot-item");
    const badgeLabel = document.getElementById("heroSceneBadgeLabel");
    const heroSection = document.getElementById("home");
    const audioToggle = document.getElementById("heroAudioToggle");
    const audioIcon = document.getElementById("heroAudioIcon");
    const audioText = document.getElementById("heroAudioText");

    if (!videoScenes || videoScenes.length === 0 || !heroSection) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Scene Meta Data
    const scenesMeta = [
        { label: "Scene 01 • Royal Wedding", desc: "The Imperial Mandap Nuptials" },
        { label: "Scene 02 • Lake Palace Udaipur", desc: "Sunset Romance on Lake Pichola" },
        { label: "Scene 03 • Heritage Haveli Reception", desc: "Grand Celebration of Lights" }
    ];

    let currentSceneIdx = 0;
    let sceneTimer = null;
    const sceneDuration = 7000; // 7 seconds per cinematic scene

    // Play all muted videos safely
    videoScenes.forEach((v) => {
        v.muted = true;
        const playPromise = v.play();
        if (playPromise !== undefined) {
            playPromise.catch((err) => {
                console.log("Autoplay handled:", err);
            });
        }
    });

    function switchScene(index) {
        if (index === currentSceneIdx) return;

        // Deactivate current
        videoScenes[currentSceneIdx].classList.remove("is-active");
        if (sceneNavBtns[currentSceneIdx]) {
            sceneNavBtns[currentSceneIdx].classList.remove("is-active");
        }

        // Activate new
        currentSceneIdx = index;
        const activeVideo = videoScenes[currentSceneIdx];
        activeVideo.classList.add("is-active");

        if (sceneNavBtns[currentSceneIdx]) {
            sceneNavBtns[currentSceneIdx].classList.add("is-active");
        }

        if (badgeLabel && scenesMeta[currentSceneIdx]) {
            badgeLabel.textContent = scenesMeta[currentSceneIdx].label;
        }

        // Reset and trigger camera push-in
        activeVideo.currentTime = 0;
        activeVideo.play().catch(() => {});

        // Reschedule next scene
        clearTimeout(sceneTimer);
        sceneTimer = setTimeout(nextScene, sceneDuration);
    }

    function nextScene() {
        const nextIdx = (currentSceneIdx + 1) % videoScenes.length;
        switchScene(nextIdx);
    }

    // Nav button clicks
    sceneNavBtns.forEach((btn, idx) => {
        btn.addEventListener("click", () => {
            clearTimeout(sceneTimer);
            switchScene(idx);
        });
    });

    // Start scene rotation
    sceneTimer = setTimeout(nextScene, sceneDuration);

    // ----------------------------------------------------
    // CINEMATIC AUDIO / MUTE TOGGLE
    // ----------------------------------------------------
    let isSoundOn = false;
    if (audioToggle) {
        audioToggle.addEventListener("click", () => {
            isSoundOn = !isSoundOn;
            videoScenes.forEach((v) => {
                v.muted = !isSoundOn;
            });

            if (isSoundOn) {
                audioText.textContent = "Sound: On";
                audioIcon.innerHTML = `<path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>`;
            } else {
                audioText.textContent = "Cinema Audio";
                audioIcon.innerHTML = `<path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>`;
            }
        });
    }

    // ----------------------------------------------------
    // PARALLAX CAMERA GLIDE (Interactive Mouse & Scroll)
    // ----------------------------------------------------
    if (!reducedMotion) {
        // Desktop Subtle Cursor Tilt
        heroSection.addEventListener("mousemove", (e) => {
            if (window.matchMedia("(pointer: coarse)").matches) return;
            const rect = heroSection.getBoundingClientRect();
            const normX = (e.clientX - rect.left) / rect.width - 0.5;
            const normY = (e.clientY - rect.top) / rect.height - 0.5;

            const activeVid = videoScenes[currentSceneIdx];
            if (activeVid) {
                // Subtle camera rotation & translation
                activeVid.style.transform = `translate(calc(-50% + ${normX * -20}px), calc(-50% + ${normY * -15}px)) scale(1.15)`;
            }
        }, { passive: true });

        // ScrollTrigger Camera Zoom Out on Scroll
        if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
            gsap.to(".hero-video-container", {
                yPercent: 20,
                scale: 1.05,
                ease: "none",
                scrollTrigger: {
                    trigger: heroSection,
                    start: "top top",
                    end: "bottom top",
                    scrub: 1.2
                }
            });
        }
    }

    // Pause rotation when tab is hidden
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            clearTimeout(sceneTimer);
        } else {
            clearTimeout(sceneTimer);
            sceneTimer = setTimeout(nextScene, 3000);
        }
    });
})();
