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

// === Constants ===
const SCROLL_THRESHOLD = 32; // Threshold for nav scroll state in pixels

// === GSAP Setup ===
gsap.registerPlugin(ScrollTrigger);

// Function to handle nav scroll state
function handleNavScroll() {
    const $nav = $('.nav');
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > SCROLL_THRESHOLD) {
        $nav.addClass('is--scrolled');
    } else {
        $nav.removeClass('is--scrolled');
    }
}

// Static loader for testing
function initializeLoader() {
    return new Promise((resolve) => {
        const $loader = $('.page-loader');
        const $number = $('.loader-number');
        let progress = { value: 0 };

        // Create a smooth animation timeline
        const tl = gsap.timeline();

        console.log("Loader timeline created");

        tl.to(progress, {
            value: 30,
            duration: 0.5,
            ease: ease,
            onUpdate: () => $number.text(Math.round(progress.value))
        })
        .to(progress, {
            value: 60,
            duration: 1,
            ease: ease,
            onUpdate: () => $number.text(Math.round(progress.value))
        })
        .to(progress, {
            value: 90,
            duration: 1.5,
            ease: ease,
            onUpdate: () => $number.text(Math.round(progress.value))
        })
        .to(progress, {
            value: 100,
            duration: 0.3,
            ease: ease,
            onUpdate: () => $number.text(Math.round(progress.value))
        })
        .to($loader, {
            height: 0,
            duration: 1,
            ease: ease,
        }, "fadeOut")
        .to($number, {
            scale: 0.4,
            opacity: 0,
            duration: 1,
            ease: ease,
            onComplete: resolve
        }, "fadeOut");
    });
}

// === Main Initialization ===
$(document).ready(function() {
    console.log("Document ready");
    setupBarbaTransitions();

    // Add scroll event listener
    window.addEventListener('scroll', handleNavScroll, { passive: true });
});

// Initialize on window load
$(window).on("load", async function() {
    console.log("Window loaded");

    // Wait for loader animation to complete
    await initializeLoader();
    console.log("Loader complete");

    // Initialize core functionality
    window.lenisInstance = initializeLenis();
    configureScrollTrigger();

    // Setup Lenis animation frame loop
    if (lenisInstance) {
        const raf = (time) => {
            lenisInstance.raf(time);
            requestAnimationFrame(raf);
            handleNavScroll(); // Check nav scroll state on each frame
        };
        requestAnimationFrame(raf);
    }

    // Initialize page animations and configuration
    initializeAnimations();
    bgConfig();
});

function initializeAnimations() {
    pageEnterAnimations();
    checkAndUpdateBodyClass();
}

// === Barba.js Configuration ===
function setupBarbaTransitions() {
    console.log("Setting up Barba");

    barba.hooks.beforeEnter(() => {
        console.log("Barba beforeEnter");
        ScrollTrigger.getAll().forEach(st => st.kill());
        // Reset theme class to prevent flashing
        $('body').removeClass("is--dark");
    });

    barba.hooks.after(() => {
        console.log("Barba after - refreshing ScrollTrigger");
        configureScrollTrigger(); // Use configureScrollTrigger instead of refresh to ensure theme switching is initialized

        // Initialize stacking effect after every page transition
        if (typeof initStackingEffect === "function") {
            console.log("Initializing stacking effect after transition");
            initStackingEffect();
        }
        window.scrollTo(0, 0);
    });

    barba.init({
        debug: true, // Enable Barba debug logging
        timeout: 5000,
        transitions: [{
            name: "custom-transition",

            async leave(data) {
                console.log("Barba leave");
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
                console.log("Barba enter");
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
                });

                await tl;
            },

            async once(data) {
                console.log("Barba once - initial page load");
                configureScrollTrigger(); // Use configureScrollTrigger for initial load too

                if (typeof Webflow !== "undefined" && typeof Webflow.require === "function") {
                    Webflow.require("ix2").init();
                }
            }
        }]
    });
}
