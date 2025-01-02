"use strict";

require("../styles/index.scss");

var _core = _interopRequireDefault(require("@barba/core"));

var _gsap = _interopRequireDefault(require("gsap"));

var _ScrollTrigger = require("gsap/ScrollTrigger");

var _lenis = require("/js/lenis.js");

var _scrollTrigger = require("/js/scrollTrigger.js");

var _stackEffects = require("/js/stackEffects.js");

var _animations = require("/js/animations.js");

var _heroBg = require("/js/heroBg.js");

var _constants = require("/js/constants.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/* index.js */

/* index.js */

/* index.js */

/* index.js */
// === Main Initialization and Barba.js Transitions ===
// Import necessary styles and libraries
// Register the GSAP ScrollTrigger plugin
_gsap["default"].registerPlugin(_ScrollTrigger.ScrollTrigger); // Log to confirm index.js is loaded


console.log("Index.js loaded"); // Wait for the entire page, including all resources, to load

$(window).on("load", function () {
  // Initialize Lenis and assign to global window for accessibility
  window.lenisInstance = (0, _lenis.initializeLenis)(); // Setup ScrollTrigger configuration and scrollerProxy

  (0, _scrollTrigger.configureScrollTrigger)(); // Start the Lenis animation frame loop if Lenis is initialized

  if (_lenis.lenisInstance) {
    var raf = function raf(time) {
      _lenis.lenisInstance.raf(time);

      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);
  } // Function to initialize animations and body class


  function initializeAnimations() {
    (0, _animations.pageEnterAnimations)();
    (0, _animations.checkAndUpdateBodyClass)();
  } // Initialize animations and body class


  initializeAnimations();
  (0, _heroBg.bgConfig)(); // === Barba.js Hooks and Transitions ===

  function setupBarbaTransitions() {
    _core["default"].hooks.beforeEnter(function () {
      // Kill all existing ScrollTrigger instances before new content is loaded
      _ScrollTrigger.ScrollTrigger.getAll().forEach(function (st) {
        return st.kill();
      });
    });

    _core["default"].hooks.after(function () {
      // Refresh ScrollTrigger and reset scroll position after new content is loaded
      _ScrollTrigger.ScrollTrigger.refresh(true);

      window.scrollTo(0, 0);

      if (typeof _stackEffects.initStackingEffect === "function") {
        (0, _stackEffects.initStackingEffect)();
      }
    });

    _core["default"].init({
      transitions: [{
        name: "custom-transition",
        leave: function leave(data) {
          var done, tl;
          return regeneratorRuntime.async(function leave$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  // Stop Lenis instance during the transition
                  if (_lenis.lenisInstance) _lenis.lenisInstance.stop();
                  done = this.async();
                  tl = _gsap["default"].timeline();
                  tl.to(".overlay", {
                    opacity: 0.8,
                    duration: _constants.dur,
                    ease: _constants.ease
                  }).to(data.current.container, {
                    scale: _constants.scaleAmount,
                    borderRadius: _constants.borderRadius,
                    duration: _constants.dur,
                    ease: _constants.ease
                  }, "<").to(".white-drawer", {
                    y: "0%",
                    duration: _constants.dur,
                    ease: _constants.ease,
                    onComplete: done
                  }, "<");
                  _context.next = 6;
                  return regeneratorRuntime.awrap(tl);

                case 6:
                case "end":
                  return _context.stop();
              }
            }
          }, null, this);
        },
        enter: function enter(data) {
          var tl;
          return regeneratorRuntime.async(function enter$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  // Update body class and reset scroll position
                  (0, _animations.checkAndUpdateBodyClass)();
                  (0, _animations.resetScroll)();
                  tl = _gsap["default"].timeline();
                  tl.add(function () {
                    _gsap["default"].set(".white-drawer", {
                      y: "100%"
                    });

                    _gsap["default"].set(".overlay", {
                      opacity: 0
                    });
                  }).add(function () {
                    (0, _animations.pageEnterAnimations)();
                    (0, _heroBg.bgConfig)();
                  }).add(function () {
                    // Kill existing ScrollTriggers and refresh
                    _ScrollTrigger.ScrollTrigger.getAll().forEach(function (trigger) {
                      return trigger.kill();
                    });

                    (0, _scrollTrigger.refreshScrollTrigger)();
                  });
                  _context2.next = 6;
                  return regeneratorRuntime.awrap(tl);

                case 6:
                case "end":
                  return _context2.stop();
              }
            }
          });
        },
        once: function once(data) {
          return regeneratorRuntime.async(function once$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  // Initialize stacking effect and Webflow interactions once
                  if (typeof _stackEffects.initStackingEffect === "function") (0, _stackEffects.initStackingEffect)();
                  if (typeof Webflow !== "undefined" && typeof Webflow.require === "function") Webflow.require("ix2").init();
                  (0, _scrollTrigger.refreshScrollTrigger)();

                case 3:
                case "end":
                  return _context3.stop();
              }
            }
          });
        }
      }]
    });
  } // Initialize Barba.js transitions


  setupBarbaTransitions(); // Refresh ScrollTrigger initially

  _ScrollTrigger.ScrollTrigger.refresh(); // Refresh ScrollTrigger on window resize


  $(window).on("resize", function () {
    _ScrollTrigger.ScrollTrigger.refresh();
  });
});