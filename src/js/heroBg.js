/* heroBg.js */
// === Animation Functions for Hero BG ===

// Declare variables for current and target X/Y positions
let curX = 0,
  curY = 0; // Current X and Y position
let tgX = 0,
  tgY = 0; // Target X and Y position
let $interBubble; // Placeholder for the selected element

// Function to configure the background animation
export function bgConfig() {
  // Select the interactive element
  $interBubble = $(".gi"); // Use jQuery to select the element with the class 'gi'

  // Define the move function for smooth animation
  function move() {
    // Smoothly update the current position towards the target position
    curX += (tgX - curX) / 40;
    curY += (tgY - curY) / 40;

    // Apply the updated position as a CSS transform
    $interBubble.css(
      "transform",
      `translate(${Math.round(curX)}px, ${Math.round(curY)}px)`
    );

    // Request the next animation frame to keep the loop going
    requestAnimationFrame(move);
  }

  // Add a mousemove event listener to update the target positions
  $(window).on("mousemove", function (event) {
    tgX = event.clientX; // Update target X position based on mouse X coordinate
    tgY = event.clientY; // Update target Y position based on mouse Y coordinate
  });

  // Start the animation loop
  move();
}
