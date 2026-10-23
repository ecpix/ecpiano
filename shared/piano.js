// Keyboard drawing, shared by every tile that shows a piano (full size, or a small picture).
//
// The keyboard is always 14 white keys wide (two octaves). It starts on F, but if a chord would not
// fit in root position (a 9th chord on a high root, for example) the window slides up by whole
// white keys until it does. So the root is always the lowest note shown.
const WHITE_CYCLE = [0, 2, 4, 5, 7, 9, 11];   // C D E F G A B
const WHITE_COUNT = 14;
const WHITE_W = 40, WHITE_H = 170, BLACK_W = 24, BLACK_H = 106;
const DEFAULT_START = 3;                      // index of F in WHITE_CYCLE

// White keys of a window, each with its semitone distance from the first key.
function whiteKeys(startCycleIdx) {
  const whites = [];
  let off = 0, prev = null;
  for (let i = 0; i < WHITE_COUNT; i++) {
    const pc = WHITE_CYCLE[(startCycleIdx + i) % 7];
    if (prev !== null) off += (pc - prev + 12) % 12;
    whites.push({ pc, off });
    prev = pc;
  }
  return whites;
}

// Pick the first window (F, then G, A, ...) where the whole chord fits, root lowest.
function chooseWindow(root, notes) {
  const top = Math.max(...notes.map((n) => n.semis));
  for (let s = 0; s < 7; s++) {
    const whites = whiteKeys((DEFAULT_START + s) % 7);
    const rootOff = (root.pc - whites[0].pc + 12) % 12;
    if (rootOff + top <= whites[WHITE_COUNT - 1].off) return { whites, rootOff };
  }
}

/**
 * Draws a keyboard into `target`, lighting the chord's notes.
 *   root   one of ROOTS
 *   notes  [{ semis, name, isRoot }]  (name is only needed for the full-size version)
 *   opts   { mini: true } draws a small picture: no dots and no note names
 *          { label: "..." } accessible description
 */
function drawPiano(target, root, notes, opts = {}) {
  const mini = !!opts.mini;
  const { whites, rootOff } = chooseWindow(root, notes);
  const lit = new Map(notes.map((n) => [rootOff + n.semis, n]));
  const svgNS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs, cls) => {
    const e = document.createElementNS(svgNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (cls) e.setAttribute("class", cls);
    return e;
  };
  const svg = el("svg", { viewBox: `0 0 ${WHITE_COUNT * WHITE_W} ${WHITE_H + 8}` }, mini ? "keyboard mini" : "keyboard");
  if (opts.label) { svg.setAttribute("role", "img"); svg.setAttribute("aria-label", opts.label); }
  const state = (n) => (n ? " on" + (n.isRoot ? " root" : "") : "");

  whites.forEach((w, i) => {
    svg.appendChild(el("rect", { x: i * WHITE_W, y: 2, width: WHITE_W, height: WHITE_H }, "white" + state(lit.get(w.off))));
  });
  for (let i = 0; i < WHITE_COUNT - 1; i++) {
    if (whites[i + 1].off - whites[i].off !== 2) continue;         // no black key between E-F or B-C
    const n = lit.get(whites[i].off + 1);
    const x = (i + 1) * WHITE_W - BLACK_W / 2;
    svg.appendChild(el("rect", { x, y: 2, width: BLACK_W, height: BLACK_H }, "black" + state(n)));
    if (n && !mini) {
      const cx = x + BLACK_W / 2;
      const label = el("text", { x: cx, y: 64 }, "label black-label" + (n.isRoot ? " root" : ""));
      label.textContent = n.name;
      svg.appendChild(label);
      svg.appendChild(el("circle", { cx, cy: BLACK_H - 20, r: 7 }, "dot" + (n.isRoot ? " root" : "")));
    }
  }
  if (!mini) {
    whites.forEach((w, i) => {
      const n = lit.get(w.off);
      if (!n) return;
      const cx = i * WHITE_W + WHITE_W / 2;
      svg.appendChild(el("circle", { cx, cy: WHITE_H - 38, r: 9 }, "dot" + (n.isRoot ? " root" : "")));
      const label = el("text", { x: cx, y: WHITE_H - 10 }, "label");
      label.textContent = n.name;
      svg.appendChild(label);
    });
  }
  target.innerHTML = "";
  target.appendChild(svg);
}
