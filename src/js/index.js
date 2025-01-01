/* index.js */
// === Main Initialization and Barba.js Transitions ===

// Import necessary styles and libraries
import "../styles/index.scss";
import barba from "@barba/core";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initializeLenis, lenisInstance } from "/js/lenis.js";
import {
  configureScrollTrigger,
  refreshScrollTrigger,
} from "/js/scrollTrigger.js";
import { initStackingEffect } from "/js/stackEffects.js";
import {
  pageEnterAnimations,
  checkAndUpdateBodyClass,
  resetScroll,
} from "/js/animations.js";
import { bgConfig } from "/js/heroBg.js";
import { dur, ease, scaleAmount, borderRadius } from "/js/constants.js";

// Register the GSAP ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Log to confirm index.js is loaded
console.log("Index.js loaded");

// Wait for the entire page, including all resources, to load
$(window).on("load", function () {
  // Initialize Lenis and assign to global window for accessibility
  window.lenisInstance = initializeLenis();

  // Setup ScrollTrigger configuration and scrollerProxy
  configureScrollTrigger();

  // Start the Lenis animation frame loop if Lenis is initialized
  if (lenisInstance) {
    function raf(time) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // Function to initialize animations and body class
  function initializeAnimations() {
    pageEnterAnimations();
    checkAndUpdateBodyClass();
  }

  // Initialize animations and body class
  initializeAnimations();
  bgConfig();

  // === Barba.js Hooks and Transitions ===

  function setupBarbaTransitions() {
    barba.hooks.beforeEnter(() => {
      // Kill all existing ScrollTrigger instances before new content is loaded
      ScrollTrigger.getAll().forEach((st) => st.kill());
    });

    barba.hooks.after(() => {
      // Refresh ScrollTrigger and reset scroll position after new content is loaded
      ScrollTrigger.refresh(true);
      window.scrollTo(0, 0);
      if (typeof initStackingEffect === "function") {
        initStackingEffect();
      }
    });

    barba.init({
      transitions: [
        {
          name: "custom-transition",
          async leave(data) {
            // Stop Lenis instance during the transition
            if (lenisInstance) lenisInstance.stop();
            const done = this.async();
            const tl = gsap.timeline();
            tl.to(".overlay", { opacity: 0.8, duration: dur, ease: ease })
              .to(
                data.current.container,
                { scale: scaleAmount, borderRadius, duration: dur, ease: ease },
                "<"
              )
              .to(
                ".white-drawer",
                { y: "0%", duration: dur, ease: ease, onComplete: done },
                "<"
              );
            await tl;
          },
          async enter(data) {
            // Update body class and reset scroll position
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
                // Kill existing ScrollTriggers and refresh
                ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
                refreshScrollTrigger();
              });
            await tl;
          },
          async once(data) {
            // Initialize stacking effect and Webflow interactions once
            if (typeof initStackingEffect === "function") initStackingEffect();
            if (
              typeof Webflow !== "undefined" &&
              typeof Webflow.require === "function"
            )
              Webflow.require("ix2").init();
            refreshScrollTrigger();
          },
        },
      ],
    });
  }

  // Initialize Barba.js transitions
  setupBarbaTransitions();

  // Refresh ScrollTrigger initially
  ScrollTrigger.refresh();

  // Refresh ScrollTrigger on window resize
  $(window).on("resize", function () {
    ScrollTrigger.refresh();
  });
});
