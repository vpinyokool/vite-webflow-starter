/* animations.js */
// === Animation Functions and Stacking Effect ===

import gsap from "gsap";

import { lenisInstance } from "/js/lenis.js";

import { dur, ease } from "/js/constants.js";
import { splitAndAnimateText } from "/js/textAnimations.js";

export function checkAndUpdateBodyClass() {
  const currentPath = window.location.pathname;
  if (currentPath !== "/" && currentPath !== "/index") {
    $("body").addClass("_on-project");
  } else {
    $("body").removeClass("_on-project");
  }
}

export function resetScroll() {
  if (lenisInstance) {
    lenisInstance.stop();
    window.scrollTo(0, 0);
    setTimeout(() => {
      lenisInstance.resize();
      lenisInstance.start();
    }, 100);
  }
}

export function animateElements(selector, animation) {
  const elements = $(selector);
  if (elements.length > 0) {
    return animation(elements);
  }
  return null;
}

export function pageEnterAnimations() {
  // Create a master timeline
  const masterTl = gsap.timeline();

  // Set initial states for all elements
  const fadeElements = $('[data-transition="fade"], [data-transition="fade-title"], [data-transition="fade-only"]');
  const heightElements = $('[data-transition="height"]');

  // Set initial states - note we're not including .hero-line here anymore
  gsap.set(fadeElements, { visibility: "visible", opacity: 0 });
  gsap.set(heightElements, { height: 0, overflow: "hidden" });

  // Explicitly set hero-line visibility
  gsap.set('.hero-line', { visibility: "visible" });

  // Add a label to synchronize all animations
  masterTl.addLabel("start");

  // Fade animations
  animateElements('[data-transition="fade"]', function (elements) {
    gsap.set(elements, { y: 30 });
    masterTl.to(elements, {
      opacity: 1,
      y: 0,
      duration: dur * 2,
      ease: ease,
      stagger: 0.1,
    }, "start");
  });

  // Height animations
  animateElements('[data-transition="height"]', function (elements) {
    masterTl.to(elements, {
      height: "auto",
      duration: dur * 2,
      ease: ease,
    }, "start");
  });

  // Fade title animations
  animateElements('[data-transition="fade-title"]', function (elements) {
    masterTl.to(elements, {
      opacity: 1,
      duration: dur * 2,
      ease: ease,
      stagger: 0.3,
    }, "start");
  });

  // Fade only animations
  animateElements('[data-transition="fade-only"]', function (elements) {
    masterTl.to(elements, {
      opacity: 1,
      duration: dur * 2,
      ease: ease,
    }, "start");
  });

  // Add text animations - now handled separately for better control
  splitAndAnimateText(masterTl, "start");

  // Add Lenis resize after all animations
  masterTl.add(() => {
    if (lenisInstance) lenisInstance.resize();
  }, "+=0.1");

  return masterTl;
}

