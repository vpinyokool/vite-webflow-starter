/* stackEffects.js */
// === Stacking Effect Initialization ===

import gsap from "gsap";

import { isMobileDevice } from "./device.js";

import { ScrollTrigger } from "gsap/ScrollTrigger";

import { ensureImageHeights } from "./ensureImageHeights.js";
import { ease, rotationRange, stackOffset } from "/js/constants.js";

const getEndOffset = () => {
  const offset = window.innerHeight * stackOffset;
  console.log(`getEndOffset: ${offset}px`);
  return offset;
};

export function initStackingEffect() {
  console.log("Initializing Stacking Effect...");

  // Remove stacking effect on mobile if needed
  if (isMobileDevice()) {
    console.warn("Stacking effect disabled on mobile devices.");
    return;
  }

  //   try {
  //     await ensureImageHeights();
  //   } catch (error) {
  //     console.error("Error ensuring image heights:", error);
  //     return;
  //   }

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
      end: () => `bottom center+=${getEndOffset()}px`, // Make end position dynamic
      pin: true,
      pinSpacing: false,
      scrub: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
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
          ease: ease,
        });
      },
    });
  });

  // Add padding after ScrollTriggers are created
  gsap.set(".images-stack", {
    paddingBottom: getEndOffset() + "px",
  });

  // Final refresh with a small delay
  setTimeout(() => {
    ScrollTrigger.refresh(true);
  }, 100);
}
