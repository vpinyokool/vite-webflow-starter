/* animations.js */
// === Animation Functions and Stacking Effect ===

import { isMobileDevice } from "/js/device.js";
import { lenisInstance } from "/js/lenis.js";
import { refreshScrollTrigger } from "/js/scrollTrigger.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type"; // Import SplitType

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export const dur = 0.8;
export const ease = "power4.out";
export const scaleAmount = 0.95;
export const borderRadius = "12px";
export const heroStagger = 0.01;
export const heroDur = 0.8;
export const lineDelayFactor = 0.1;

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

export function splitAndAnimateText() {
  const tl = gsap.timeline();

  $(".hero-line").each(function (index) {
    const textElements = $(this).find("h1, p, span");
    const lineDelay = index * lineDelayFactor;

    textElements.each(function () {
      // Use SplitType to split text into characters
      const splitText = new SplitType(this, {
        types: "chars",
        tagName: "span",
        position: "relative",
      });

      // Select the characters created by SplitType
      const chars = splitText.chars;

      gsap.set(chars, {
        y: "100%",
        opacity: 0,
      });

      tl.to(
        chars,
        {
          duration: heroDur,
          y: "0%",
          opacity: 1,
          ease: "power4.out",
          stagger: heroStagger,
        },
        lineDelay
      );
    });
  });

  tl.call(() => {
    $(".hero-line").addClass("ready");
  });

  return tl;
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

// === Stacking Effect Initialization ===
const rotationRange = 5;

export function initStackingEffect() {
  console.log("Initializing Stacking Effect...");

  // Remove stacking effect on mobile if needed
  if (isMobileDevice()) {
    console.warn("Stacking effect disabled on mobile devices.");
    return;
  }

  // Kill existing ScrollTrigger instances
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

  const imageWraps = gsap.utils.toArray(".images-stack .image-wrap");

  if (imageWraps.length === 0) {
    console.warn("No elements found with selector '.images-stack .image-wrap'");
    return;
  }

  // Reset transforms and ensure proper container height
  gsap.set(".images-stack", {
    clearProps: "paddingBottom",
  });

  // Force initial layout calculation
  ScrollTrigger.refresh();

  imageWraps.forEach((imgWrap) => {
    const randomRotation = gsap.utils.random(-rotationRange, rotationRange);

    // Set initial state
    gsap.set(imgWrap, {
      clearProps: "transform,rotation",
    });

    ScrollTrigger.create({
      trigger: imgWrap,
      start: () => "center center", // Make start position dynamic
      endTrigger: ".images-stack",
      end: () => "bottom center+=300",
      pin: true,
      pinSpacing: false,
      scrub: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      // Add markers for debugging
      markers: true,
      onEnter: () => {
        $(imgWrap).addClass("--pinned");
        gsap.fromTo(
          imgWrap,
          { rotation: 0 },
          {
            rotation: randomRotation,
            duration: 0.6,
            ease: "elastic.out(1, 0.5)",
          }
        );
      },
      onLeave: () => {
        console.log("Element left the ScrollTrigger zone");
      },
      onEnterBack: () => {
        $(imgWrap).addClass("--pinned");
        gsap.fromTo(
          imgWrap,
          { rotation: 0 },
          {
            rotation: randomRotation,
            duration: 0.6,
            ease: "elastic.out(1, 0.5)",
          }
        );
      },
      onLeaveBack: () => {
        $(imgWrap).removeClass("--pinned");
        gsap.to(imgWrap, {
          rotation: 0,
          duration: 0.3,
          ease: "power2.in",
        });
      },
    });
  });

  // Add padding after ScrollTriggers are created
  gsap.set(".images-stack", {
    paddingBottom: "300px",
  });

  // Final refresh with a small delay
  setTimeout(() => {
    ScrollTrigger.refresh(true);
  }, 100);
}
