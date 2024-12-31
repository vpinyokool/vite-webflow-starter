/* ensureImageHeights.js */
// === Ensure Image Heights are Set Correctly ===

import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Ensures that all images within ".images-stack" have their parent wrappers set to the image height.
 * @returns {Promise<void>}
 */
export const ensureImageHeights = () => {
  return new Promise((resolve) => {
    const images = document.querySelectorAll(".images-stack img");
    if (images.length === 0) {
      resolve();
      return;
    }

    let loadedImages = 0;

    const onLoad = () => {
      loadedImages++;
      if (loadedImages === images.length) {
        document.querySelectorAll(".image-wrap").forEach((wrap) => {
          if (wrap.offsetHeight === 0) {
            const img = wrap.querySelector("img");
            if (img) {
              wrap.style.height = `${img.offsetHeight}px`;
            }
          }
        });
        ScrollTrigger.refresh(true);
        resolve();
      }
    };

    images.forEach((img) => {
      if (img.complete) {
        onLoad();
      } else {
        img.addEventListener("load", onLoad);
        img.addEventListener("error", onLoad);
      }
    });
  });
};
