/* textAnimations.js */
import gsap from "gsap";
import { heroDur, heroStagger, lineDelayFactor } from "/js/constants.js";
import SplitType from "split-type";

// Initialize text splitting
function initializeSplitText() {
  $(".hero-line").each(function () {
    const textElements = $(this).find("h1, p, span");
    textElements.each(function () {
      new SplitType(this, {
        types: "chars",
        tagName: "span",
        position: "relative",
      });
    });
  });
}

export function splitAndAnimateText(timeline, label = "start") {
  // First initialize the text splitting
  initializeSplitText();

  // First ensure hero-line is visible
  gsap.set(".hero-line", { visibility: "visible", opacity: 1 });

  $(".hero-line").each(function (index) {
    const textElements = $(this).find("h1, p, span");
    const lineDelay = index * lineDelayFactor;

    textElements.each(function () {
      // Get the already split characters
      const chars = $(this).find('.char');

      // Only set initial state for chars, not the parent elements
      gsap.set(chars, {
        y: "100%",
        opacity: 0,
      });

      timeline.to(
        chars,
        {
          duration: heroDur,
          y: "0%",
          opacity: 1,
          ease: "power4.out",
          stagger: heroStagger,
          clearProps: "all" // Clear all props after animation
        },
        label + "+=" + lineDelay
      );
    });
  });

  timeline.add(() => {
    $(".hero-line").addClass("ready");
  }, ">");

  return timeline;
}
