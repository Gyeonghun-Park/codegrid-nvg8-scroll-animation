import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll(".svg-row svg path").forEach((originalPath) => {
    const borderPath = originalPath.cloneNode(true);
    const originalWidth = parseInt(originalPath.getAttribute("stroke-width"));
    borderPath.setAttribute("stroke", "#0f0f0f");
    borderPath.setAttribute("stroke-width", originalWidth + 10);
    borderPath.classList.add("border-path");
    originalPath.parentElement.insertBefore(borderPath, originalPath);
  });

  document.querySelectorAll(".svg-container-2 svg").forEach((svg) => {
    const viewBox = svg.getAttribute("viewBox");
    if (!viewBox) return;
    const [x, y, width, height] = viewBox.split(" ").map(Number);
    svg.setAttribute("viewBox", `${x} ${y - 10} ${width} ${height + 20}`);
  });

  // Change linecap to butt — arrow/D-cap polygons replace the round tip
  document.querySelectorAll(".svg-row svg path").forEach((path) => {
    path.setAttribute("stroke-linecap", "butt");
  });

  document.querySelectorAll(".svg-row svg path").forEach((path) => {
    const pathLength = path.getTotalLength();
    path.style.strokeDasharray = pathLength;
    path.style.strokeDashoffset = pathLength;
  });

  // Arrow: neck at origin, body hidden behind stroke, tip visible forward
  // Height 360 = stroke-width, tip angle matches Rive pentagon proportions
  const SVG_NS = "http://www.w3.org/2000/svg";
  const straightArrowPath = "M-500 -150 Q-500 -180 -470 -180 L120 -180 Q150 -180 171 -159 L309 -21 Q330 0 309 21 L171 159 Q150 180 120 180 L-470 180 Q-500 180 -500 150Z";
  const curveArrowPath = "M-20 -150 Q-20 -180 10 -180 L120 -180 Q150 -180 171 -159 L309 -21 Q330 0 309 21 L171 159 Q150 180 120 180 L10 180 Q-20 180 -20 150Z";
  const curveArrowFillPath = "M-75 -150 Q-75 -180 10 -180 L120 -180 Q150 -180 171 -159 L309 -21 Q330 0 309 21 L171 159 Q150 180 120 180 L10 180 Q-75 180 -75 150Z";
  const curveTrailingCapFillD = "M 20 -180 L -15 -180 Q -45 -180 -45 -150 L -45 150 Q -45 180 -15 180 L 20 180 Z";
  const curveTrailingCapBorderD = "M 20 -185 L -15 -185 Q -50 -185 -50 -150 L -50 150 Q -50 185 -15 185 L 20 185 Z";

  function createArrow(svg, color, d, fillD) {
    const g = document.createElementNS(SVG_NS, "g");
    const border = document.createElementNS(SVG_NS, "path");
    border.setAttribute("d", d);
    border.setAttribute("fill", "#0f0f0f");
    border.setAttribute("stroke", "#0f0f0f");
    border.setAttribute("stroke-width", "10");
    border.setAttribute("stroke-linejoin", "round");
    g.appendChild(border);
    const fill = document.createElementNS(SVG_NS, "path");
    fill.setAttribute("d", fillD || d);
    fill.setAttribute("fill", color);
    g.appendChild(fill);
    svg.insertBefore(g, svg.firstChild);
    gsap.set(g, { transformOrigin: "0 0" });
    return g;
  }

  function createEndCap(svg, cx, cy, color) {
    const g = document.createElementNS(SVG_NS, "g");
    const h = 180;
    const cr = 30;
    const d = cr + 15;
    const t = cy - h;
    const b = cy + h;
    const l = cx - d;
    const be = 5;
    const bt = t - be;
    const bb = b + be;
    const bl = l - be;
    const bcr = cr + be;
    const borderD = `M ${cx} ${bt} L ${bl + bcr} ${bt} Q ${bl} ${bt} ${bl} ${bt + bcr} L ${bl} ${bb - bcr} Q ${bl} ${bb} ${bl + bcr} ${bb} L ${cx} ${bb} Z`;
    const fillD = `M ${cx} ${t} L ${l + cr} ${t} Q ${l} ${t} ${l} ${t + cr} L ${l} ${b - cr} Q ${l} ${b} ${l + cr} ${b} L ${cx} ${b} Z`;
    const border = document.createElementNS(SVG_NS, "path");
    border.setAttribute("d", borderD);
    border.setAttribute("fill", "#0f0f0f");
    g.appendChild(border);
    const fill = document.createElementNS(SVG_NS, "path");
    fill.setAttribute("d", fillD);
    fill.setAttribute("fill", color);
    g.appendChild(fill);
    svg.appendChild(g);
    g.setAttribute("opacity", "0");
    return g;
  }

  function createCurveTrailingCap(svg, color) {
    const g = document.createElementNS(SVG_NS, "g");
    const border = document.createElementNS(SVG_NS, "path");
    border.setAttribute("d", curveTrailingCapBorderD);
    border.setAttribute("fill", "#0f0f0f");
    g.appendChild(border);
    const fill = document.createElementNS(SVG_NS, "path");
    fill.setAttribute("d", curveTrailingCapFillD);
    fill.setAttribute("fill", color);
    g.appendChild(fill);
    g.setAttribute("opacity", "0");
    svg.appendChild(g);
    return g;
  }

  const tl = gsap.timeline();

  const introSection = document.querySelector(".intro");

  ScrollTrigger.create({
    trigger: introSection,
    start: "top top",
    end: `+=${window.innerHeight * 8}px`,
    pin: true,
    pinSpacing: true,
    scrub: 1,
    animation: tl,
    onUpdate: (self) => {
      if (self.progress >= 0.5) {
        introSection.classList.add("out");
      } else {
        introSection.classList.remove("out");
      }
    },
  });

  const startOffset = 2.16;

  const strokeRevealOrder = [
    "svg-top-1",
    "svg-bottom-1",
    "svg-middle-1",
    "svg-top-2",
    "svg-bottom-2",
    "svg-middle-2",
    "svg-top-3",
    "svg-middle-3",
    "svg-bottom-3",
  ];

  strokeRevealOrder.forEach((id, index) => {
    const paths = document.querySelectorAll(`#${id} path`);
    const svg = document.querySelector(`#${id}`);
    const colorPath = svg.querySelector("path:not(.border-path)");
    const color = colorPath.getAttribute("stroke");
    const arrowG = createArrow(svg, color, straightArrowPath);
    const endCapG = createEndCap(svg, 180, 180, color);

    gsap.set(arrowG, { x: 180, y: 180, opacity: 0 });

    const t = startOffset + index * 0.3;

    tl.to(
      paths,
      {
        strokeDashoffset: 0,
        duration: 1.5,
        ease: "power2.out",
      },
      t,
    );

    tl.set(arrowG, { opacity: 1 }, t);
    tl.set(endCapG, { attr: { opacity: 1 } }, t);
    tl.to(
      arrowG,
      {
        x: 3180,
        duration: 1.5,
        ease: "power2.out",
      },
      t,
    );
  });

  const curveStrokeOrder = ["svg-curve-1", "svg-curve-2"];
  const curveStartTime = 5 * 0.3 + 0.3;

  curveStrokeOrder.forEach((id, index) => {
    const paths = document.querySelectorAll(`#${id} path`);
    const svg = document.querySelector(`#${id}`);
    const colorPath = svg.querySelector("path:not(.border-path)");
    const color = colorPath.getAttribute("stroke");
    const pathLength = colorPath.getTotalLength();
    const arrowG = createArrow(svg, color, curveArrowPath, curveArrowFillPath);
    const endCapG = createEndCap(svg, 180, 180.538, color);
    // Move curve arrow to top layer, then endCap above arrow
    svg.appendChild(arrowG);
    svg.appendChild(endCapG);
    const trailingCapG = createCurveTrailingCap(svg, color);
    // Clear GSAP's CSS transform overrides so SVG transform attribute works
    arrowG.style.translate = '';
    arrowG.style.rotate = '';
    arrowG.style.scale = '';
    arrowG.style.transformOrigin = '';
    const curveStartAt = startOffset + curveStartTime + index * 1.7;

    const startPt = colorPath.getPointAtLength(0);
    const startPt2 = colorPath.getPointAtLength(1);
    const startAngle =
      Math.atan2(startPt2.y - startPt.y, startPt2.x - startPt.x) *
      (180 / Math.PI);

    function setArrowTransform(x, y, angle) {
      arrowG.setAttribute("transform", `translate(${x},${y}) rotate(${angle})`);
    }

    setArrowTransform(startPt.x, startPt.y, startAngle);
    arrowG.setAttribute("opacity", "0");
    trailingCapG.setAttribute("transform", `translate(${startPt.x},${startPt.y}) rotate(${startAngle})`);

    const curveDur = 2.5;

    tl.to(
      paths,
      {
        strokeDashoffset: 0,
        duration: curveDur,
        ease: "none",
      },
      curveStartAt,
    );

    const proxy = { length: 0 };
    tl.set(arrowG, { attr: { opacity: 1 } }, curveStartAt);
    tl.set(endCapG, { attr: { opacity: 1 } }, curveStartAt);
    tl.to(
      proxy,
      {
        length: pathLength,
        duration: curveDur,
        ease: "none",
        onUpdate: () => {
          const pt = colorPath.getPointAtLength(proxy.length);
          const pt2 = colorPath.getPointAtLength(
            Math.min(proxy.length + 1, pathLength),
          );
          const angle =
            Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * (180 / Math.PI);
          setArrowTransform(pt.x, pt.y, angle);
        },
      },
      curveStartAt,
    );

    tl.set(arrowG, { attr: { opacity: 0 } }, curveStartAt + curveDur);
    tl.set(endCapG, { attr: { opacity: 0 } }, curveStartAt + curveDur);
    tl.set(trailingCapG, { attr: { opacity: 1 } }, curveStartAt + curveDur);

    tl.to(
      paths,
      {
        strokeDashoffset: -pathLength,
        duration: 1.5,
        ease: "power2.inOut",
      },
      curveStartAt + curveDur,
    );

    const eraseProxy = { len: 0 };
    tl.to(
      eraseProxy,
      {
        len: pathLength,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => {
          const pt = colorPath.getPointAtLength(eraseProxy.len);
          const pt2 = colorPath.getPointAtLength(
            Math.min(eraseProxy.len + 1, pathLength),
          );
          const angle =
            Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * (180 / Math.PI);
          trailingCapG.setAttribute("transform", `translate(${pt.x},${pt.y}) rotate(${angle})`);
        },
      },
      curveStartAt + curveDur,
    );

    tl.set(trailingCapG, { attr: { opacity: 0 } }, curveStartAt + curveDur + 1.5);
  });

  const svgRows = document.querySelectorAll(".svg-container .svg-row");

  tl.to(
    svgRows,
    {
      xPercent: 100,
      duration: 2,
      ease: "power3.inOut",
      stagger: 0.15,
    },
    ">-0.5",
  );

  tl.set({}, {}, 15.43);
});
