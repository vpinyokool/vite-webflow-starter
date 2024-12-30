/* index.js */
// === Main Initialization and Barba.js Transitions ===

import "../styles/index.css";
import barba from "@barba/core";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initializeLenis } from "/js/lenis.js";
import { lenisInstance } from "/js/lenis.js";
import { configureScrollTrigger } from "/js/scrollTrigger.js";
import { refreshScrollTrigger } from "/js/scrollTrigger.js";
import {
  pageEnterAnimations,
  checkAndUpdateBodyClass,
  resetScroll,
  dur,
  ease,
  scaleAmount,
  borderRadius,
  initStackingEffect,
} from "/js/animations.js";

// Register the plugin
gsap.registerPlugin(ScrollTrigger);

// Log to confirm index.js is loaded
console.log("Index.js loaded");

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

// === Barba.js Hooks and Transitions ===

function setupBarbaTransitions() {
  barba.hooks.beforeEnter(() => {
    ScrollTrigger.getAll().forEach((st) => st.kill());
  });

  barba.hooks.after(() => {
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
          checkAndUpdateBodyClass();
          resetScroll();
          const tl = gsap.timeline();
          tl.add(() => {
            gsap.set(".white-drawer", { y: "100%" });
            gsap.set(".overlay", { opacity: 0 });
          })
            .add(() => {
              pageEnterAnimations();
            })
            .add(() => {
              ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
              refreshScrollTrigger();
            });
          await tl;
        },
        async once(data) {
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
window.addEventListener("resize", () => {
  ScrollTrigger.refresh();
});
