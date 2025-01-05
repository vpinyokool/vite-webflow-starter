/* lenis.js */
// === Initialize Lenis for Smooth Scrolling ===
import Lenis from "@studio-freight/lenis";
import { isDesktopDevice } from "/js/device.js";

let lenisInstance = null;

export function initializeLenis() {
  if (isDesktopDevice()) {
    lenisInstance = new Lenis({
      lerp: 0.12, // Smoothing factor
      wheelMultiplier: 1, // Mouse wheel scroll speed
      smoothWheel: true, // Enable smooth wheel scrolling
      infinite: false, // Disable infinite scrolling
    });
    return lenisInstance;
  }
  return null;
}

export { lenisInstance };
