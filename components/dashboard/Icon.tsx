import type { CSSProperties } from "react";

// Centralized icon set translated from the design files' inline SVG paths.
// Plain component — usable in both server and client components.

type Seg = [string, Record<string, string | number>];

const STROKE: Record<string, Seg[]> = {
  // rail
  home: [["path", { d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }]],
  box: [
    ["path", { d: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" }],
    ["polyline", { points: "3.27 6.96 12 12.01 20.73 6.96" }],
  ],
  bag: [
    ["path", { d: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" }],
    ["line", { x1: 3, y1: 6, x2: 21, y2: 6 }],
    ["path", { d: "M16 10a4 4 0 0 1-8 0" }],
  ],
  send: [["line", { x1: 22, y1: 2, x2: 11, y2: 13 }], ["polygon", { points: "22 2 15 22 11 13 2 9 22 2" }]],
  speaker: [["polygon", { points: "11 5 6 9 2 9 2 15 6 15 11 19 11 5" }], ["path", { d: "M15.54 8.46a5 5 0 0 1 0 7.07" }]],
  chart: [["path", { d: "M3 3v18h18" }], ["rect", { x: 7, y: 10, width: 3, height: 8 }], ["rect", { x: 12, y: 6, width: 3, height: 12 }]],
  users: [
    ["path", { d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" }],
    ["circle", { cx: 9, cy: 7, r: 4 }],
    ["path", { d: "M23 21v-2a4 4 0 0 0-3-3.87" }],
  ],
  sliders: [
    ["line", { x1: 4, y1: 21, x2: 4, y2: 14 }], ["line", { x1: 4, y1: 10, x2: 4, y2: 3 }],
    ["line", { x1: 12, y1: 21, x2: 12, y2: 12 }], ["line", { x1: 12, y1: 8, x2: 12, y2: 3 }],
    ["line", { x1: 20, y1: 21, x2: 20, y2: 16 }], ["line", { x1: 20, y1: 12, x2: 20, y2: 3 }],
    ["line", { x1: 1, y1: 14, x2: 7, y2: 14 }], ["line", { x1: 9, y1: 8, x2: 15, y2: 8 }], ["line", { x1: 17, y1: 16, x2: 23, y2: 16 }],
  ],
  // sidebar
  dash: [
    ["rect", { x: 3, y: 3, width: 7, height: 9 }], ["rect", { x: 14, y: 3, width: 7, height: 5 }],
    ["rect", { x: 14, y: 12, width: 7, height: 9 }], ["rect", { x: 3, y: 16, width: 7, height: 5 }],
  ],
  pos: [["rect", { x: 2, y: 3, width: 20, height: 14, rx: 2 }], ["line", { x1: 8, y1: 21, x2: 16, y2: 21 }], ["line", { x1: 12, y1: 17, x2: 12, y2: 21 }]],
  layers: [["polygon", { points: "12 2 2 7 12 12 22 7 12 2" }], ["polyline", { points: "2 17 12 22 22 17" }], ["polyline", { points: "2 12 12 17 22 12" }]],
  grid: [["rect", { x: 3, y: 3, width: 7, height: 7 }], ["rect", { x: 14, y: 3, width: 7, height: 7 }], ["rect", { x: 14, y: 14, width: 7, height: 7 }], ["rect", { x: 3, y: 14, width: 7, height: 7 }]],
  house: [["path", { d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }]],
  // topbar
  bell: [["path", { d: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" }], ["path", { d: "M13.73 21a2 2 0 0 1-3.46 0" }]],
  message: [["path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" }]],
  maximize: [["path", { d: "M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" }]],
  globe: [
    ["circle", { cx: 12, cy: 12, r: 10 }], ["line", { x1: 2, y1: 12, x2: 22, y2: 12 }],
    ["path", { d: "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" }],
  ],
  chevronDown: [["polyline", { points: "6 9 12 15 18 9" }]],
  chevronLeft: [["polyline", { points: "15 18 9 12 15 6" }]],
  chevronRight: [["polyline", { points: "9 18 15 12 9 6" }]],
  x: [["line", { x1: 18, y1: 6, x2: 6, y2: 18 }], ["line", { x1: 6, y1: 6, x2: 18, y2: 18 }]],
  plus: [["line", { x1: 12, y1: 5, x2: 12, y2: 19 }], ["line", { x1: 5, y1: 12, x2: 19, y2: 12 }]],
  eye: [["path", { d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" }], ["circle", { cx: 12, cy: 12, r: 3 }]],
  edit: [["path", { d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" }], ["path", { d: "M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" }]],
  trash: [["polyline", { points: "3 6 5 6 21 6" }], ["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }]],
  upload: [["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }], ["polyline", { points: "17 8 12 3 7 8" }], ["line", { x1: 12, y1: 3, x2: 12, y2: 15 }]],
  image: [["rect", { x: 3, y: 3, width: 18, height: 18, rx: 2 }], ["circle", { cx: 8.5, cy: 8.5, r: 1.5 }], ["polyline", { points: "21 15 16 10 5 21" }]],
  tag: [["path", { d: "M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" }], ["line", { x1: 7, y1: 7, x2: 7.01, y2: 7 }]],
  calendar: [["rect", { x: 3, y: 4, width: 18, height: 18, rx: 2 }], ["line", { x1: 16, y1: 2, x2: 16, y2: 6 }], ["line", { x1: 8, y1: 2, x2: 8, y2: 6 }], ["line", { x1: 3, y1: 10, x2: 21, y2: 10 }]],
  menu: [["line", { x1: 3, y1: 6, x2: 21, y2: 6 }], ["line", { x1: 3, y1: 12, x2: 21, y2: 12 }], ["line", { x1: 3, y1: 18, x2: 21, y2: 18 }]],
  search: [["circle", { cx: 11, cy: 11, r: 8 }], ["line", { x1: 21, y1: 21, x2: 16.65, y2: 16.65 }]],
  user: [["path", { d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" }], ["circle", { cx: 12, cy: 7, r: 4 }]],
  settings: [
    ["circle", { cx: 12, cy: 12, r: 3 }],
    ["path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" }],
  ],
  logout: [["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }], ["polyline", { points: "16 17 21 12 16 7" }], ["line", { x1: 21, y1: 12, x2: 9, y2: 12 }]],
  lock: [["rect", { x: 3, y: 11, width: 18, height: 11, rx: 2 }], ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4" }]],
  // status
  pending: [["circle", { cx: 12, cy: 12, r: 10 }], ["polyline", { points: "12 6 12 12 16 14" }]],
  confirmed: [["path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }], ["polyline", { points: "22 4 12 14.01 9 11.01" }]],
  packaging: [["path", { d: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" }], ["polyline", { points: "3.27 6.96 12 12.01 20.73 6.96" }]],
  outfor: [["rect", { x: 1, y: 3, width: 15, height: 13 }], ["path", { d: "M16 8h4l3 3v5h-7V8z" }], ["circle", { cx: 5.5, cy: 18.5, r: 2.5 }], ["circle", { cx: 18.5, cy: 18.5, r: 2.5 }]],
  delivered: [["path", { d: "M20 6 9 17l-5-5" }]],
  canceled: [["circle", { cx: 12, cy: 12, r: 10 }], ["line", { x1: 15, y1: 9, x2: 9, y2: 15 }], ["line", { x1: 9, y1: 9, x2: 15, y2: 15 }]],
  returned: [["polyline", { points: "1 4 1 10 7 10" }], ["path", { d: "M3.51 15a9 9 0 1 0 2.13-9.36L1 10" }]],
  failed: [["circle", { cx: 12, cy: 12, r: 10 }], ["line", { x1: 12, y1: 8, x2: 12, y2: 12 }], ["line", { x1: 12, y1: 16, x2: 12.01, y2: 16 }]],
  // wallet / money
  clock: [["circle", { cx: 12, cy: 12, r: 9 }], ["polyline", { points: "12 7 12 12 15 14" }]],
  coins: [["circle", { cx: 8, cy: 8, r: 6 }], ["path", { d: "M18.09 10.37A6 6 0 1 1 10.34 18" }], ["path", { d: "M7 6h1v4M16.71 13.88l.7.71-2.82 2.82" }]],
  dollar: [["line", { x1: 12, y1: 1, x2: 12, y2: 23 }], ["path", { d: "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" }]],
  truck: [["rect", { x: 1, y: 3, width: 15, height: 13 }], ["path", { d: "M16 8h4l3 3v5h-7V8z" }], ["circle", { cx: 5.5, cy: 18.5, r: 2.5 }], ["circle", { cx: 18.5, cy: 18.5, r: 2.5 }]],
  cash: [["rect", { x: 2, y: 6, width: 20, height: 12, rx: 2 }], ["circle", { cx: 12, cy: 12, r: 2.5 }], ["path", { d: "M6 12h.01M18 12h.01" }]],
  tax: [["rect", { x: 3, y: 3, width: 18, height: 18, rx: 2 }], ["line", { x1: 8, y1: 16, x2: 16, y2: 8 }], ["circle", { cx: 9, cy: 9, r: 1 }], ["circle", { cx: 15, cy: 15, r: 1 }]],
  card: [["rect", { x: 2, y: 6, width: 20, height: 12, rx: 2 }], ["circle", { cx: 12, cy: 12, r: 2.5 }], ["path", { d: "M6 12h.01M18 12h.01" }]],
  wallet: [["path", { d: "M21 12V7H5a2 2 0 0 1 0-4h14v4" }], ["path", { d: "M3 5v14a2 2 0 0 0 2 2h16v-5" }], ["path", { d: "M18 12a2 2 0 0 0 0 4h4v-4z" }]],
  // biz cards (admin)
  order: [["path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }], ["polyline", { points: "14 2 14 8 20 8" }], ["line", { x1: 9, y1: 13, x2: 15, y2: 13 }], ["line", { x1: 9, y1: 17, x2: 13, y2: 17 }]],
  store: [["path", { d: "M3 9l1-5h16l1 5" }], ["path", { d: "M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" }], ["path", { d: "M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" }]],
  product: [["path", { d: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" }], ["polyline", { points: "3.27 6.96 12 12.01 20.73 6.96" }]],
  // section headers / misc
  cart: [["circle", { cx: 9, cy: 21, r: 1 }], ["circle", { cx: 20, cy: 21, r: 1 }], ["path", { d: "M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" }]],
  trendUp: [["path", { d: "M3 3v18h18" }], ["path", { d: "m19 9-5 5-4-4-3 3" }]],
  bars: [["path", { d: "M3 3v18h18" }], ["rect", { x: 7, y: 10, width: 3, height: 8 }], ["rect", { x: 12, y: 6, width: 3, height: 12 }], ["rect", { x: 17, y: 13, width: 3, height: 5 }]],
  camera: [["path", { d: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" }], ["circle", { cx: 12, cy: 13, r: 4 }]],
  eyeOff: [["path", { d: "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" }], ["line", { x1: 1, y1: 1, x2: 23, y2: 23 }]],
  refresh: [["polyline", { points: "1 4 1 10 7 10" }], ["path", { d: "M3.51 15a9 9 0 1 0 2.13-9.36L1 10" }]],
  alert: [["path", { d: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" }], ["line", { x1: 12, y1: 9, x2: 12, y2: 13 }], ["line", { x1: 12, y1: 17, x2: 12.01, y2: 17 }]],
  clockBig: [["circle", { cx: 12, cy: 12, r: 10 }], ["path", { d: "M12 6v6l4 2" }]],
  check: [["path", { d: "M9 11l3 3L22 4" }], ["path", { d: "M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" }]],
  // customer account nav
  heartLine: [["path", { d: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" }]],
  award: [["circle", { cx: 12, cy: 8, r: 6 }], ["path", { d: "M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" }]],
  mail: [["rect", { x: 2, y: 4, width: 20, height: 16, rx: 2 }], ["path", { d: "m22 7-10 5L2 7" }]],
  pin: [["path", { d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" }], ["circle", { cx: 12, cy: 10, r: 3 }]],
  life: [
    ["circle", { cx: 12, cy: 12, r: 10 }], ["circle", { cx: 12, cy: 12, r: 4 }],
    ["line", { x1: 4.93, y1: 4.93, x2: 9.17, y2: 9.17 }], ["line", { x1: 14.83, y1: 14.83, x2: 19.07, y2: 19.07 }],
    ["line", { x1: 14.83, y1: 9.17, x2: 19.07, y2: 4.93 }], ["line", { x1: 4.93, y1: 19.07, x2: 9.17, y2: 14.83 }],
  ],
  share: [
    ["circle", { cx: 18, cy: 5, r: 3 }], ["circle", { cx: 6, cy: 12, r: 3 }], ["circle", { cx: 18, cy: 19, r: 3 }],
    ["line", { x1: 8.59, y1: 13.51, x2: 15.42, y2: 17.49 }], ["line", { x1: 15.41, y1: 6.51, x2: 8.59, y2: 10.49 }],
  ],
  ticket: [["path", { d: "M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" }], ["line", { x1: 13, y1: 5, x2: 13, y2: 19 }]],
  // help cards
  building: [["path", { d: "M3 21h18" }], ["path", { d: "M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" }], ["path", { d: "M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1" }]],
  chat: [["path", { d: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" }]],
  help: [["circle", { cx: 12, cy: 12, r: 10 }], ["path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" }], ["line", { x1: 12, y1: 17, x2: 12.01, y2: 17 }]],
  blog: [["path", { d: "M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" }], ["path", { d: "M18 14h-8M15 18h-5M10 6h8v4h-8V6z" }]],
};

const FILLED: Record<string, Seg[]> = {
  star: [["path", { d: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" }]],
  heart: [["path", { d: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" }]],
};

export type IconName = keyof typeof STROKE | keyof typeof FILLED;

export function Icon({
  name,
  size = 18,
  strokeWidth = 1.9,
  className,
  style,
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const filled = name in FILLED;
  const segs = (filled ? FILLED : STROKE)[name as string] ?? [];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {segs.map(([tag, attrs], i) => {
        const Tag = tag as keyof React.JSX.IntrinsicElements;
        return <Tag key={i} {...attrs} />;
      })}
    </svg>
  );
}
