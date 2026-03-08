import { Rive, Layout, Fit, Alignment } from "@rive-app/canvas";
import gsap from "gsap";

// ── Init curves (stroke-dashoffset) ──

document.querySelectorAll("#svg-panel .curve-overlay svg path").forEach((path) => {
  const len = path.getTotalLength();
  path.style.strokeDasharray = len;
  path.style.strokeDashoffset = len;
});

// ── SVG Panel: Build GSAP timeline (mirrors script.js) ──

function buildSvgTimeline() {
  const tl = gsap.timeline({ paused: true });
  const p = "#svg-panel";

  // Hide all layers off-screen initially
  tl.set(`${p} .block-layer`, { xPercent: -110 }, 0);

  // Phase 1: Enter (15→25)
  tl.fromTo(`${p} .row-top .layer-enter`, { xPercent: -110 }, { xPercent: 0, duration: 10, ease: "power2.out" }, 15);
  tl.fromTo(`${p} .row-mid .layer-enter`, { xPercent: -110 }, { xPercent: 0, duration: 10, ease: "power2.out" }, 16);
  tl.fromTo(`${p} .row-bot .layer-enter`, { xPercent: -110 }, { xPercent: 0, duration: 10, ease: "power2.out" }, 17);

  // Phase 2: Wipe (25→37)
  tl.fromTo(`${p} .row-top .layer-wipe`, { xPercent: -110 }, { xPercent: 0, duration: 10, ease: "power2.out" }, 25);
  tl.fromTo(`${p} .row-bot .layer-wipe`, { xPercent: -110 }, { xPercent: 0, duration: 10, ease: "power2.out" }, 26);
  tl.fromTo(`${p} .row-mid .layer-wipe`, { xPercent: -110 }, { xPercent: 0, duration: 12, ease: "power2.out" }, 27);

  // Phase 3: Sweep + Curves (33→46) — third color wave + curves draw/erase
  tl.fromTo(`${p} .row-top .layer-sweep`, { xPercent: -110 }, { xPercent: 0, duration: 10, ease: "power2.out" }, 33);
  tl.fromTo(`${p} .row-mid .layer-sweep`, { xPercent: -110 }, { xPercent: 0, duration: 10, ease: "power2.out" }, 35);
  tl.fromTo(`${p} .row-bot .layer-sweep`, { xPercent: -110 }, { xPercent: 0, duration: 10, ease: "power2.out" }, 34);

  // Curve 1 (yellow): draw in
  tl.to([`${p} #curve-1-border`, `${p} #curve-1`], {
    strokeDashoffset: 0, duration: 8, ease: "power2.out",
  }, 30);

  // Curve 1: erase
  [`${p} #curve-1-border`, `${p} #curve-1`].forEach((sel) => {
    const path = document.querySelector(sel);
    if (!path) return;
    const len = path.getTotalLength();
    tl.to(sel, { strokeDashoffset: -len, duration: 8, ease: "power2.inOut" }, 38);
  });

  // Curve 2 (orange): draw in
  tl.to([`${p} #curve-2-border`, `${p} #curve-2`], {
    strokeDashoffset: 0, duration: 8, ease: "power2.out",
  }, 34);

  // Curve 2: erase
  [`${p} #curve-2-border`, `${p} #curve-2`].forEach((sel) => {
    const path = document.querySelector(sel);
    if (!path) return;
    const len = path.getTotalLength();
    tl.to(sel, { strokeDashoffset: -len, duration: 8, ease: "power2.inOut" }, 42);
  });

  // Phase 4: Exit (46→57)
  tl.to(`${p} .block-row`, { borderRadius: "24px", duration: 2 }, 46);
  tl.to(`${p} .row-top`, { xPercent: 120, duration: 5, ease: "power2.in" }, 47);
  tl.to(`${p} .row-bot`, { xPercent: 120, duration: 5, ease: "power2.in" }, 48);
  tl.to(`${p} .row-mid`, { xPercent: 120, duration: 8, ease: "power2.in" }, 49);

  // Phase 5: Hold
  tl.set({}, {}, 100);

  return tl;
}

const svgTl = buildSvgTimeline();

// ── Rive Setup ──

let riveInstance = null;
let riveInputs = [];
const canvas = document.getElementById("rive-canvas");

riveInstance = new Rive({
  canvas,
  src: "/rive/navigate_ui_transition_desktop_scroll.riv",
  stateMachines: "Transition Desktop",
  autoplay: true,
  layout: new Layout({ fit: Fit.Cover, alignment: Alignment.Center }),
  onLoad: () => {
    riveInstance.resizeDrawingSurfaceToCanvas();
    riveInputs = riveInstance.stateMachineInputs("Transition Desktop") ?? [];
    console.log("Rive loaded. Inputs:", riveInputs.map((i) => `${i.name} (${i.type})`));
    if (riveInputs[0]) riveInputs[0].value = 0;
  },
});

window.addEventListener("resize", () => riveInstance?.resizeDrawingSurfaceToCanvas());

// ── Scrubber ──

const scrubber = document.getElementById("scrubber");
const progressDisplay = document.getElementById("progress-display");
const svgPanel = document.getElementById("svg-panel");
const rivePanel = document.getElementById("rive-panel");

scrubber.addEventListener("input", (e) => {
  const progress = parseFloat(e.target.value);
  progressDisplay.textContent = `${Math.round(progress)}%`;

  if (riveInputs[0]) riveInputs[0].value = progress;
  svgTl.progress(progress / 100);

  const isDark = progress >= 48;
  svgPanel.style.backgroundColor = isDark ? "#141414" : "#e3e3db";
  rivePanel.style.backgroundColor = isDark ? "#141414" : "#e3e3db";
});

// ── View Mode Toggle ──

const comparison = document.getElementById("comparison");
document.querySelectorAll(".mode-toggle button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".mode-toggle button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    comparison.className = "comparison";
    if (btn.dataset.mode !== "side") comparison.classList.add(btn.dataset.mode);
  });
});
