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

// === Main Initialization ===
$(window).on("load", function () {
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
