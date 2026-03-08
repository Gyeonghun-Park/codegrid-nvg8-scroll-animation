import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  // ── Smooth scroll ──
  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // ── Init curves ──
  initCurves();

  // ── Build timeline ──
  const tl = buildTimeline();

  // ── ScrollTrigger ──
  const introSection = document.querySelector(".intro");

  ScrollTrigger.create({
    trigger: introSection,
    start: "top top",
    end: `+=${window.innerHeight * 8}`,
    pin: true,
    pinSpacing: true,
    scrub: 1,
    animation: tl,
  });
});

/**
 * Set stroke-dasharray/offset on curve paths so they start invisible.
 */
function initCurves() {
  document.querySelectorAll(".curve-overlay svg path").forEach((path) => {
    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
  });

  // Ensure border paths render behind fill paths
  const svg = document.querySelector(".curve-overlay svg");
  if (!svg) return;

  // Reorder: borders first, then fills (SVG paints later elements on top)
  const border1 = document.getElementById("curve-1-border");
  const fill1 = document.getElementById("curve-1");
  const border2 = document.getElementById("curve-2-border");
  const fill2 = document.getElementById("curve-2");
  svg.appendChild(border1);
  svg.appendChild(fill1);
  svg.appendChild(border2);
  svg.appendChild(fill2);
}

/**
 * Timeline: 100 units = scroll %
 *   Phase 1 (Enter):  15 → 25  — Blocks slide in (diamond tips)
 *   Phase 2 (Wipe):   25 → 37  — Second color blocks slide in (diamond tips)
 *   Phase 3 (Sweep):  33 → 45  — Third color wave slides in + curves draw/erase
 *   Phase 4 (Exit):   46 → 55  — Rounded rects slide out, bg darkens
 *   Phase 5 (Hold):   55 → 100 — Dark background
 */
function buildTimeline() {
  const tl = gsap.timeline();

  // Hide all layers off-screen initially
  tl.set(".block-layer", { xPercent: -110 }, 0);

  // ────────────────────────────────────────────
  // PHASE 1: ENTER (15 → 25)
  // ────────────────────────────────────────────

  tl.fromTo(".row-top .layer-enter", { xPercent: -110 }, { xPercent: 0, duration: 10, ease: "power2.out" }, 15);
  tl.fromTo(".row-mid .layer-enter", { xPercent: -110 }, { xPercent: 0, duration: 10, ease: "power2.out" }, 16);
  tl.fromTo(".row-bot .layer-enter", { xPercent: -110 }, { xPercent: 0, duration: 10, ease: "power2.out" }, 17);

  // ────────────────────────────────────────────
  // PHASE 2: WIPE (25 → 37)
  // ────────────────────────────────────────────

  tl.fromTo(".row-top .layer-wipe", { xPercent: -110 }, { xPercent: 0, duration: 10, ease: "power2.out" }, 25);
  tl.fromTo(".row-bot .layer-wipe", { xPercent: -110 }, { xPercent: 0, duration: 10, ease: "power2.out" }, 26);
  tl.fromTo(".row-mid .layer-wipe", { xPercent: -110 }, { xPercent: 0, duration: 12, ease: "power2.out" }, 27);

  // ────────────────────────────────────────────
  // PHASE 3: SWEEP + CURVES (33 → 46)
  // Third color wave slides in while curves draw/erase across rows 2+3
  // ────────────────────────────────────────────

  // Sweep layers (third color wave) slide in
  tl.fromTo(".row-top .layer-sweep", { xPercent: -110 }, { xPercent: 0, duration: 10, ease: "power2.out" }, 33);
  tl.fromTo(".row-mid .layer-sweep", { xPercent: -110 }, { xPercent: 0, duration: 10, ease: "power2.out" }, 35);
  tl.fromTo(".row-bot .layer-sweep", { xPercent: -110 }, { xPercent: 0, duration: 10, ease: "power2.out" }, 34);

  // Curve 1 (yellow + its border): draw in
  tl.to(["#curve-1-border", "#curve-1"], {
    strokeDashoffset: 0,
    duration: 8,
    ease: "power2.out",
    stagger: 0,
  }, 30);

  // Curve 1: erase (draw out the other end)
  ["#curve-1-border", "#curve-1"].forEach((sel) => {
    const path = document.querySelector(sel);
    if (!path) return;
    const len = path.getTotalLength();
    tl.to(sel, {
      strokeDashoffset: -len,
      duration: 8,
      ease: "power2.inOut",
    }, 38);
  });

  // Curve 2 (orange + its border): draw in (staggered after curve 1)
  tl.to(["#curve-2-border", "#curve-2"], {
    strokeDashoffset: 0,
    duration: 8,
    ease: "power2.out",
    stagger: 0,
  }, 34);

  // Curve 2: erase
  ["#curve-2-border", "#curve-2"].forEach((sel) => {
    const path = document.querySelector(sel);
    if (!path) return;
    const len = path.getTotalLength();
    tl.to(sel, {
      strokeDashoffset: -len,
      duration: 8,
      ease: "power2.inOut",
    }, 42);
  });

  // ────────────────────────────────────────────
  // PHASE 4: EXIT (46 → 55)
  // ────────────────────────────────────────────

  const introEl = document.querySelector(".intro");

  // Background darkens
  tl.to(introEl, {
    backgroundColor: "#141414",
    duration: 4,
    ease: "power1.inOut",
    onUpdate: function () {
      if (this.progress() > 0.5) {
        introEl.classList.add("dark");
      } else {
        introEl.classList.remove("dark");
      }
    },
  }, 46);

  // Corners round
  tl.to(".block-row", { borderRadius: "24px", duration: 2 }, 46);

  // Staggered exit — fast slide-out
  tl.to(".row-top", { xPercent: 120, duration: 5, ease: "power2.in" }, 47);
  tl.to(".row-bot", { xPercent: 120, duration: 5, ease: "power2.in" }, 48);
  tl.to(".row-mid", { xPercent: 120, duration: 8, ease: "power2.in" }, 49);

  // ────────────────────────────────────────────
  // PHASE 5: HOLD (57 → 100)
  // ────────────────────────────────────────────
  tl.set({}, {}, 100);

  return tl;
}
