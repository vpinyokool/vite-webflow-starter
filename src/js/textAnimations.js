/* textAnimations.js */
import gsap from "gsap";
import { heroDur, heroStagger, lineDelayFactor } from "/js/constants.js";
import SplitType from "split-type";

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
