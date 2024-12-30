/* device.js */
// === Device Detection Functions ===

export function isDesktopDevice() {
  const userAgent = navigator.userAgent.toLowerCase();
  return !/mobile|android|ipad|tablet|touch/.test(userAgent);
}

export function isMobileDevice() {
  const userAgent = navigator.userAgent.toLowerCase();
  return /mobile|android|ipad|tablet|touch/.test(userAgent);
}
