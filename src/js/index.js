/* index.js */
// === Imports ===
// Core libraries
import barba from "@barba/core";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Styles
import "../styles/index.scss";

// Local modules
import { initializeLenis, lenisInstance } from "/js/lenis.js";
import { configureScrollTrigger, refreshScrollTrigger } from "/js/scrollTrigger.js";
import { initStackingEffect } from "/js/stackEffects.js";
import { pageEnterAnimations, checkAndUpdateBodyClass, resetScroll } from "/js/animations.js";
import { bgConfig } from "/js/heroBg.js";
import { dur, ease, scaleAmount, borderRadius } from "/js/constants.js";

// === GSAP Setup ===
gsap.registerPlugin(ScrollTrigger);

// === Loading Animation ===
// Real loading progress function (commented out for now)
/*
function initializeLoader() {
    return new Promise((resolve) => {
        const $loader = $('.page-loader');
        const $number = $('.loader-number');
        let progress = 0;
        let loadedItems = 0;
        let totalItems = 0;

        // Count total items to load
        const images = $('img').length;
        const videos = $('video').length;
        const iframes = $('iframe').length;
        totalItems = images + videos + iframes;

        // Set initial state
        $number.text('0');

        // Function to update progress
        function updateProgress(increment) {
            loadedItems++;
            progress = Math.min(Math.round((loadedItems / Math.max(totalItems, 1)) * 100), 100);
            $number.text(progress);

            if (progress >= 100) {
                gsap.to($loader, {
                    scaleY: 0,
                    duration: 1,
                    ease: "power2.inOut",
                    onComplete: resolve
                });
            }
        }

        // Track image loading
        $('img').each(function() {
            if (this.complete) {
                updateProgress();
            } else {
                $(this).on('load error', updateProgress);
            }
        });

        // Track video loading
        $('video').each(function() {
            if (this.readyState >= 4) {
                updateProgress();
            } else {
                $(this).on('canplaythrough error', updateProgress);
            }
        });

        // Track iframe loading
        $('iframe').each(function() {
            $(this).on('load error', updateProgress);
        });

        // Fallback in case there are no trackable elements
        if (totalItems === 0) {
            // Simulate progress based on document ready state
            const loadingInterval = setInterval(() => {
                progress += 5;
                $number.text(Math.min(progress, 100));

                if (progress >= 100) {
                    clearInterval(loadingInterval);
                    gsap.to($loader, {
                        scaleY: 0,
                        duration: 1,
                        ease: "power2.inOut",
                        onComplete: resolve
                    });
                }
            }, 50);
        }

        // Additional fallback for slow connections
        setTimeout(() => {
            if (progress < 100) {
                progress = 100;
                $number.text('100');
                gsap.to($loader, {
                    scaleY: 0,
                    duration: 1,
                    ease: "power2.inOut",
                    onComplete: resolve
                });
            }
        }, 10000); // Maximum wait time of 10 seconds
    });
}
*/

// Static loader for testing
function initializeLoader() {
    return new Promise((resolve) => {
        const $loader = $('.page-loader');
        const $number = $('.loader-number');
        let progress = { value: 0 };

        // Create a smooth animation timeline
        const tl = gsap.timeline();

        // First phase: 0-30% quickly
        tl.to(progress, {
            value: 30,
            duration: 0.5,
            ease: "power1.in",
            onUpdate: () => $number.text(Math.round(progress.value))
        })
        // Second phase: 30-60% slower
        .to(progress, {
            value: 60,
            duration: 1,
            ease: "power1.inOut",
            onUpdate: () => $number.text(Math.round(progress.value))
        })
        // Third phase: 60-90% even slower
        .to(progress, {
            value: 90,
            duration: 1.5,
            ease: "power1.inOut",
            onUpdate: () => $number.text(Math.round(progress.value))
        })
        // Final phase: 90-100% quick
        .to(progress, {
            value: 100,
            duration: 0.3,
            ease: "power1.out",
            onUpdate: () => $number.text(Math.round(progress.value))
        })
        // Animate out the loader
        .to($loader, {
            scaleY: 0,
            duration: 1,
            ease: "power2.inOut",
            onComplete: resolve
        });
    });
}

// === Main Initialization ===
$(window).on("load", async function () {
    // Wait for loader animation to complete
    await initializeLoader();

    // Initialize core functionality
    window.lenisInstance = initializeLenis();
    configureScrollTrigger();

    // Setup Lenis animation frame loop
    if (lenisInstance) {
        const raf = (time) => {
            lenisInstance.raf(time);
            requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);
    }

    // Initialize page animations and configuration
    initializeAnimations();
    bgConfig();
    setupBarbaTransitions();

    // Handle window resize
    $(window).on("resize", () => ScrollTrigger.refresh());
});

// === Helper Functions ===
function initializeAnimations() {
    pageEnterAnimations();
    checkAndUpdateBodyClass();
}

// === Barba.js Configuration ===
function setupBarbaTransitions() {
    // Setup Barba hooks
    barba.hooks.beforeEnter(() => {
        ScrollTrigger.getAll().forEach(st => st.kill());
    });

    barba.hooks.after((data) => {
        // First refresh ScrollTrigger without initializing stacking
        refreshScrollTrigger(false);

        // Initialize stacking effect after every page transition
        if (typeof initStackingEffect === "function") {
            initStackingEffect();
        }
        window.scrollTo(0, 0);
    });

    // Initialize Barba with transitions
    barba.init({
        transitions: [{
            name: "custom-transition",

            async leave(data) {
                if (lenisInstance) lenisInstance.stop();
                const done = this.async();

                const tl = gsap.timeline();
                tl.to(".overlay", { opacity: 0.8, duration: dur, ease: ease })
                  .to(data.current.container, {
                      scale: scaleAmount,
                      borderRadius,
                      duration: dur,
                      ease: ease
                  }, "<")
                  .to(".white-drawer", {
                      y: "0%",
                      duration: dur,
                      ease: ease,
                      onComplete: done
                  }, "<");

                await tl;
            },

            async enter(data) {
                checkAndUpdateBodyClass();
                resetScroll();

                const tl = gsap.timeline();
                tl.add(() => {
                    gsap.set(".white-drawer", { y: "100%" });
                    gsap.set(".overlay", { opacity: 0 });
                })
                .add(() => {
                    pageEnterAnimations();
                    bgConfig();
                })
                .add(() => {
                    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
                    refreshScrollTrigger(false);
                });

                await tl;
            },

            async once(data) {
                // First refresh ScrollTrigger without stacking
                refreshScrollTrigger(false);

                // Then initialize stacking effect
                if (typeof initStackingEffect === "function") {
                    initStackingEffect();
                }

                if (typeof Webflow !== "undefined" && typeof Webflow.require === "function") {
                    Webflow.require("ix2").init();
                }
            }
        }]
    });
}
