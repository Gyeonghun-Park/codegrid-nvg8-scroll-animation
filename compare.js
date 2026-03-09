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

  // Phase 1: Enter (11→21)
  tl.fromTo(`${p} .row-top .layer-enter`, { xPercent: -110 }, { xPercent: 0, duration: 10, ease: "power2.out" }, 11);
  tl.fromTo(`${p} .row-mid .layer-enter`, { xPercent: -110 }, { xPercent: 0, duration: 10, ease: "power2.out" }, 12);
  tl.fromTo(`${p} .row-bot .layer-enter`, { xPercent: -110 }, { xPercent: 0, duration: 10, ease: "power2.out" }, 13);

  // Phase 2: Wipe (21→33)
  tl.fromTo(`${p} .row-top .layer-wipe`, { xPercent: -110 }, { xPercent: 0, duration: 10, ease: "power2.out" }, 21);
  tl.fromTo(`${p} .row-bot .layer-wipe`, { xPercent: -110 }, { xPercent: 0, duration: 10, ease: "power2.out" }, 22);
  tl.fromTo(`${p} .row-mid .layer-wipe`, { xPercent: -110 }, { xPercent: 0, duration: 12, ease: "power2.out" }, 23);

  // Phase 3: Sweep + Curves (29→40) — third color wave + curves draw/erase
  tl.fromTo(`${p} .row-top .layer-sweep`, { xPercent: -110 }, { xPercent: 0, duration: 10, ease: "power2.out" }, 29);
  tl.fromTo(`${p} .row-mid .layer-sweep`, { xPercent: -110 }, { xPercent: 0, duration: 10, ease: "power2.out" }, 31);
  tl.fromTo(`${p} .row-bot .layer-sweep`, { xPercent: -110 }, { xPercent: 0, duration: 10, ease: "power2.out" }, 30);

  // Curve 1 (yellow): draw in
  tl.to([`${p} #curve-1-border`, `${p} #curve-1`], {
    strokeDashoffset: 0, duration: 6, ease: "power1.out",
  }, 28);

  // Curve 1: erase
  [`${p} #curve-1-border`, `${p} #curve-1`].forEach((sel) => {
    const path = document.querySelector(sel);
    if (!path) return;
    const len = path.getTotalLength();
    tl.to(sel, { strokeDashoffset: -len, duration: 7, ease: "power2.inOut" }, 34);
  });

  // Curve 2 (orange): draw in
  tl.to([`${p} #curve-2-border`, `${p} #curve-2`], {
    strokeDashoffset: 0, duration: 6, ease: "power1.out",
  }, 31);

  // Curve 2: erase
  [`${p} #curve-2-border`, `${p} #curve-2`].forEach((sel) => {
    const path = document.querySelector(sel);
    if (!path) return;
    const len = path.getTotalLength();
    tl.to(sel, { strokeDashoffset: -len, duration: 7, ease: "power2.inOut" }, 37);
  });

  // Phase 4: Exit (42→53)
  tl.to(`${p} .block-row`, { borderRadius: "24px", duration: 2 }, 42);
  tl.to(`${p} .row-top`, { xPercent: 120, duration: 5, ease: "power2.in" }, 43);
  tl.to(`${p} .row-bot`, { xPercent: 120, duration: 5, ease: "power2.in" }, 44);
  tl.to(`${p} .row-mid`, { xPercent: 120, duration: 8, ease: "power2.in" }, 45);

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

  // Gradual bg transition matching script.js Phase 4 (42→46)
  const bgStart = 42, bgEnd = 46;
  const bgT = Math.min(1, Math.max(0, (progress - bgStart) / (bgEnd - bgStart)));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fromRgb = [227, 227, 219]; // #e3e3db
  const toRgb = [20, 20, 20];       // #141414
  const r = Math.round(lerp(fromRgb[0], toRgb[0], bgT));
  const g = Math.round(lerp(fromRgb[1], toRgb[1], bgT));
  const b = Math.round(lerp(fromRgb[2], toRgb[2], bgT));
  const bgColor = `rgb(${r},${g},${b})`;
  svgPanel.style.backgroundColor = bgColor;
  rivePanel.style.backgroundColor = bgColor;
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
