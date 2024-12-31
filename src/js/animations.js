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
  splitAndAnimateText();
  animateElements('[data-transition="fade"]', function (elements) {
    gsap.set(elements, { opacity: 0, y: 30 });
    return gsap.to(elements, {
      opacity: 1,
      y: 0,
      duration: dur,
      ease: ease,
      stagger: 0.1,
    });
  });

  animateElements('[data-transition="height"]', function (elements) {
    gsap.set(elements, { height: 0, overflow: "hidden" });
    return gsap.to(elements, { height: "auto", duration: dur, ease: ease });
  });

  animateElements('[data-transition="fade-title"]', function (elements) {
    gsap.set(elements, { opacity: 0 });
    return gsap.to(elements, {
      opacity: 1,
      duration: dur,
      ease: ease,
      stagger: 0.3,
    });
  });

  animateElements('[data-transition="fade-only"]', function (elements) {
    gsap.set(elements, { opacity: 0 });
    return gsap.to(elements, { opacity: 1, duration: dur, ease: ease });
  });

  const tl = gsap.timeline();
  tl.add(() => {
    splitAndAnimateText();
  }).add(() => {
    if (lenisInstance) lenisInstance.resize();
  }, "+=0.1");

  return tl;
}
