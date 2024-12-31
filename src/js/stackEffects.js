/* stackEffects.js */
// === Stacking Effect Initialization ===

import gsap from "gsap";
import { isMobileDevice } from "./device.js";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ease, rotationRange, stackOffset, dur } from "/js/constants.js";

// Register the ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

/**
 * Calculate the end offset based on window height and stackOffset constant.
 * @returns {number} The calculated offset.
 */
const getEndOffset = () => {
  const offset = window.innerHeight * stackOffset;
  console.log(`getEndOffset: ${offset}px`);
  return offset;
};

/**
 * Pins the image, assigns data-stack, and applies rotation.
 * @param {jQuery} $imgWrap - The jQuery-wrapped image wrapper element.
 * @param {number} rotation - The rotation degree.
 * @param {number} index - The index of the image wrap.
 */
const pinImage = ($imgWrap, rotation, index) => {
  $imgWrap.addClass("--pinned");
  $imgWrap.attr("data-stack", index);
  gsap.to($imgWrap[0], {
    rotation: rotation,
    duration: dur,
    ease: "elastic.out(1, 0.5)",
  });
};

/**
 * Unpins the image, removes data-stack, and resets rotation.
 * @param {jQuery} $imgWrap - The jQuery-wrapped image wrapper element.
 */
const unpinImage = ($imgWrap) => {
  $imgWrap.removeClass("--pinned");
  $imgWrap.removeAttr("data-stack");
  gsap.to($imgWrap[0], {
    rotation: 0,
    duration: dur * 0.5,
    ease: ease,
  });
};

/**
 * Updates stack indices for pinned elements.
 * @param {jQuery} $pinnedElements - The jQuery collection of pinned elements.
 */
const updateStackIndices = ($pinnedElements) => {
  $pinnedElements.each(function (idx) {
    const reverseIndex = $pinnedElements.length - idx - 1;
    $(this).attr("data-stack", reverseIndex);
  });
};

/**
 * Initializes the stacking effect.
 */
export function initStackingEffect() {
  let $pinnedElements = $();
  console.log("Initializing Stacking Effect...");

  // Remove stacking effect on mobile devices
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

  imageWraps.forEach((imgWrap, index) => {
    const $imgWrap = $(imgWrap);
    const randomRotation = gsap.utils.random(-rotationRange, rotationRange);

    // Set initial state
    gsap.set(imgWrap, {
      clearProps: "transform,rotation",
    });

    ScrollTrigger.create({
      trigger: imgWrap,
      start: "center center", // Start position
      endTrigger: ".images-stack",
      end: `bottom center+=${getEndOffset()}px`, // End position
      pin: true,
      pinSpacing: false,
      scrub: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      markers: false,
      onEnter: () => {
        console.log(`onEnter for image-wrap index: ${index}`);
        pinImage($imgWrap, randomRotation, index);
        $pinnedElements = $pinnedElements.add($imgWrap);
        updateStackIndices($pinnedElements);
      },
      onLeave: () => {
        console.log(`onLeave for image-wrap index: ${index}`);
        $pinnedElements = $pinnedElements.not($imgWrap);
        updateStackIndices($pinnedElements);
      },
      onEnterBack: () => {
        console.log(`onEnterBack for image-wrap index: ${index}`);
        pinImage($imgWrap, randomRotation, index);
        $pinnedElements = $pinnedElements.add($imgWrap);
        updateStackIndices($pinnedElements);
      },
      onLeaveBack: () => {
        console.log(`onLeaveBack for image-wrap index: ${index}`);
        unpinImage($imgWrap);
        $pinnedElements = $pinnedElements.not($imgWrap);
        updateStackIndices($pinnedElements);
      },
    });
  });

  // Add padding after ScrollTriggers are created
  gsap.set(".images-stack", {
    paddingBottom: `${getEndOffset()}px`,
  });

  // Final refresh with a small delay
  setTimeout(() => {
    ScrollTrigger.refresh(true);
  }, 100);
}
