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
 *   Phase 1 (Enter):  11 → 21  — Blocks slide in (diamond tips)
 *   Phase 2 (Wipe):   21 → 33  — Second color blocks slide in
 *   Phase 3 (Sweep):  29 → 40  — Third color wave + curves draw/erase
 *   Curves:           28 → 37  — (unchanged) draw/erase
 *   Phase 4 (Exit):   42 → 53  — Rounded rects slide out, bg darkens
 *   Phase 5 (Hold):   53 → 100 — Dark background
 */
function buildTimeline() {
  const tl = gsap.timeline();

  // Hide all layers off-screen initially
  tl.set(".block-layer", { xPercent: -110 }, 0);

  // ────────────────────────────────────────────
  // PHASE 1: ENTER (11 → 21)
  // ────────────────────────────────────────────

  tl.fromTo(".row-top .layer-enter", { xPercent: -110 }, { xPercent: 0, duration: 10, ease: "power2.out" }, 11);
  tl.fromTo(".row-mid .layer-enter", { xPercent: -110 }, { xPercent: 0, duration: 10, ease: "power2.out" }, 12);
  tl.fromTo(".row-bot .layer-enter", { xPercent: -110 }, { xPercent: 0, duration: 10, ease: "power2.out" }, 13);

  // ────────────────────────────────────────────
  // PHASE 2: WIPE (21 → 33)
  // ────────────────────────────────────────────

  tl.fromTo(".row-top .layer-wipe", { xPercent: -110 }, { xPercent: 0, duration: 10, ease: "power2.out" }, 21);
  tl.fromTo(".row-bot .layer-wipe", { xPercent: -110 }, { xPercent: 0, duration: 10, ease: "power2.out" }, 22);
  tl.fromTo(".row-mid .layer-wipe", { xPercent: -110 }, { xPercent: 0, duration: 12, ease: "power2.out" }, 23);

  // ────────────────────────────────────────────
  // PHASE 3: SWEEP + CURVES (29 → 40)
  // ────────────────────────────────────────────

  // Sweep layers (third color wave) slide in
  tl.fromTo(".row-top .layer-sweep", { xPercent: -110 }, { xPercent: 0, duration: 10, ease: "power2.out" }, 29);
  tl.fromTo(".row-mid .layer-sweep", { xPercent: -110 }, { xPercent: 0, duration: 10, ease: "power2.out" }, 31);
  tl.fromTo(".row-bot .layer-sweep", { xPercent: -110 }, { xPercent: 0, duration: 10, ease: "power2.out" }, 30);

  // Curve 1 (yellow + its border): draw in
  tl.to(["#curve-1-border", "#curve-1"], {
    strokeDashoffset: 0,
    duration: 6,
    ease: "power1.out",
    stagger: 0,
  }, 28);

  // Curve 1: erase (draw out the other end)
  ["#curve-1-border", "#curve-1"].forEach((sel) => {
    const path = document.querySelector(sel);
    if (!path) return;
    const len = path.getTotalLength();
    tl.to(sel, {
      strokeDashoffset: -len,
      duration: 7,
      ease: "power2.inOut",
    }, 34);
  });

  // Curve 2 (orange + its border): draw in (staggered after curve 1)
  tl.to(["#curve-2-border", "#curve-2"], {
    strokeDashoffset: 0,
    duration: 6,
    ease: "power1.out",
    stagger: 0,
  }, 31);

  // Curve 2: erase
  ["#curve-2-border", "#curve-2"].forEach((sel) => {
    const path = document.querySelector(sel);
    if (!path) return;
    const len = path.getTotalLength();
    tl.to(sel, {
      strokeDashoffset: -len,
      duration: 7,
      ease: "power2.inOut",
    }, 37);
  });

  // ────────────────────────────────────────────
  // PHASE 4: EXIT (42 → 53)
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
  }, 42);

  // Corners round
  tl.to(".block-row", { borderRadius: "24px", duration: 2 }, 42);

  // Staggered exit — fast slide-out
  tl.to(".row-top", { xPercent: 120, duration: 5, ease: "power2.in" }, 43);
  tl.to(".row-bot", { xPercent: 120, duration: 5, ease: "power2.in" }, 44);
  tl.to(".row-mid", { xPercent: 120, duration: 8, ease: "power2.in" }, 45);

  // ────────────────────────────────────────────
  // PHASE 5: HOLD (50 → 100)
  // ────────────────────────────────────────────
  tl.set({}, {}, 100);

  return tl;
}
