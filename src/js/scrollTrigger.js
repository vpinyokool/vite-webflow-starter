/* scrollTrigger.js */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isDesktopDevice, isMobileDevice } from "/js/device.js";
import { lenisInstance } from "/js/lenis.js";
import { initStackingEffect } from "/js/stackEffects.js";

export function configureScrollTrigger() {
  // Configure ScrollTrigger defaults
  ScrollTrigger.config({
    limitCallbacks: true,
    ignoreMobileResize: true,
    autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
  });

  // Apply defaults based on device type
  if (!isMobileDevice()) {
    ScrollTrigger.defaults({
      scrub: 0.5, // Smoother scroll interactions
      inertia: 0.8, // Reduces abrupt changes
    });
  } else {
    console.log("Applying mobile-specific ScrollTrigger optimizations...");
    ScrollTrigger.defaults({
      scrub: false, // Disable scrub for smoother experience on mobile
      inertia: 0.5, // Lower inertia for better responsiveness
    });
  }

  // Setup ScrollTrigger scrollerProxy if Lenis is initialized and on desktop
  if (isDesktopDevice() && lenisInstance) {
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (arguments.length) {
          lenisInstance.scrollTo(value); // Set scroll position via Lenis
        }
        return lenisInstance.scroll; // Get current scroll position from Lenis
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: document.body.style.transform ? "transform" : "fixed", // Use transform for pinning if supported
    });

    // Update ScrollTrigger on Lenis scroll
    lenisInstance.on("scroll", ScrollTrigger.update);
  }

  // Refresh ScrollTrigger on window resize
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      ScrollTrigger.refresh(true);
      if (lenisInstance) lenisInstance.resize();
    }, 250);
  });
}

// Function to refresh ScrollTrigger after transitions
export function refreshScrollTrigger(shouldInitStack = true) {
  console.log("Refreshing ScrollTrigger");

  // Kill all existing ScrollTrigger instances to prevent duplicates
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

  // Reinitialize ScrollTrigger scrollerProxy
  if (isDesktopDevice() && lenisInstance) {
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (arguments.length) {
          lenisInstance.scrollTo(value);
        }
        return lenisInstance.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: document.body.style.transform ? "transform" : "fixed",
    });

    // Update ScrollTrigger on Lenis scroll
    lenisInstance.on("scroll", ScrollTrigger.update);
  }

  // Refresh ScrollTrigger to recognize new DOM elements and positions
  ScrollTrigger.refresh();

  // Reinitialize Webflow interactions if Webflow is available
  if (typeof Webflow !== "undefined" && typeof Webflow.require === "function") {
    Webflow.require("ix2").init();
  }

  // Initialize stacking effect after ScrollTrigger refresh if needed
  if (shouldInitStack && typeof initStackingEffect === "function") {
    // Small delay to ensure ScrollTrigger is fully refreshed
    setTimeout(() => {
      initStackingEffect();
    }, 100);
  }
}
