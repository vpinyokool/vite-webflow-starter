/* scrollTrigger.js */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isDesktopDevice, isMobileDevice } from "/js/device.js";
import { lenisInstance } from "/js/lenis.js";
import { initStackingEffect } from "/js/stackEffects.js";

// Initialize theme switching ScrollTriggers
function initThemeSwitching() {
  try {
    console.log("Initializing theme switching...");

    // Dark theme triggers
    const $darkSections = $('[data-theme="to-dark"]');
    const $lightSections = $('[data-theme="to-light"]');

    // If no theme sections found, don't initialize
    if ($darkSections.length === 0 && $lightSections.length === 0) {
      console.log("No theme sections found, skipping theme initialization");
      return;
    }

    console.log("Found dark sections:", $darkSections.length);
    console.log("Found light sections:", $lightSections.length);

    // Add debug borders
    // $darkSections.css('border', '2px solid red');
    // $lightSections.css('border', '2px solid blue');

    // If there are no light sections below, keep dark mode
    let shouldStayDark = true;

    $darkSections.each(function(index) {
      console.log("Creating dark trigger for section", index + 1);
      ScrollTrigger.create({
        trigger: this,
        start: "top 50%",
        end: "bottom 50%",
        markers: false,
        onEnter: () => {
          console.log("Dark section entered");
          $('body').addClass("is--dark");
        },
        onLeave: () => {
          console.log("Dark section left, shouldStayDark:", shouldStayDark);
          if (!shouldStayDark) {
            $('body').removeClass("is--dark");
          }
        },
        onEnterBack: () => {
          console.log("Dark section entered back");
          $('body').addClass("is--dark");
        },
        onLeaveBack: () => {
          console.log("Dark section left back");
          $('body').removeClass("is--dark");
        }
      });
    });

    // Light theme triggers
    $lightSections.each(function(index) {
      console.log("Creating light trigger for section", index + 1);
      shouldStayDark = false;

      ScrollTrigger.create({
        trigger: this,
        start: "top 50%",
        end: "bottom 50%",
        markers: true,
        onEnter: () => {
          console.log("Light section entered");
          $('body').removeClass("is--dark");
        },
        onLeave: () => {
          console.log("Light section left");
          $('body').addClass("is--dark");
        },
        onEnterBack: () => {
          console.log("Light section entered back");
          $('body').removeClass("is--dark");
        },
        onLeaveBack: () => {
          console.log("Light section left back");
          $('body').addClass("is--dark");
        }
      });
    });

  } catch (error) {
    console.error("Error in theme switching:", error);
  }
}

export function configureScrollTrigger() {
  console.log("Configuring ScrollTrigger...");

  // Kill all existing ScrollTrigger instances to prevent duplicates
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

  // Configure ScrollTrigger defaults
  ScrollTrigger.config({
    limitCallbacks: true,
    ignoreMobileResize: true,
    autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
  });

  // Apply defaults based on device type
  if (!isMobileDevice()) {
    ScrollTrigger.defaults({
      scrub: 0.5,
      inertia: 0.8,
    });
  } else {
    ScrollTrigger.defaults({
      scrub: false,
      inertia: 0.5,
    });
  }

  // Setup ScrollTrigger scrollerProxy if Lenis is initialized and on desktop
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

    lenisInstance.on("scroll", ScrollTrigger.update);
  }

  // Initialize stacking effect first
  if (typeof initStackingEffect === "function") {
    console.log("Initializing stacking effect");
    initStackingEffect();
  }

  // Initialize theme switching after stacking effect
  setTimeout(() => {
    initThemeSwitching();
  }, 100);

  // Refresh ScrollTrigger
  ScrollTrigger.refresh();

  // Refresh ScrollTrigger and reinitialize stacking effect on window resize
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      ScrollTrigger.refresh(true);
      if (lenisInstance) lenisInstance.resize();
      if (typeof initStackingEffect === "function") {
        console.log("Reinitializing stacking effect on resize");
        initStackingEffect();
      }
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

  // Initialize stacking effect first if needed
  if (shouldInitStack && typeof initStackingEffect === "function") {
    console.log("Initializing stacking effect");
    initStackingEffect();

    // Initialize theme switching after stacking effect
    setTimeout(() => {
      initThemeSwitching();
    }, 100);
  } else {
    // If no stacking effect, initialize theme switching immediately
    initThemeSwitching();
  }

  // Reinitialize Webflow interactions if Webflow is available
  if (typeof Webflow !== "undefined" && typeof Webflow.require === "function") {
    Webflow.require("ix2").init();
  }
}
