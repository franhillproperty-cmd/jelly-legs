// The jelly on its own (the look stage): the same drawing as in the Ladder's scene, for the
// Step screen and the Breathe screen. An original drawing, no text in it.
//
//   jellyParts() -> { parts, eyes }       the jelly's groups, for a drawing to place
//   createJelly({ wobble, pose }) -> svg  a jelly on its own, decorative
//
// The jelly is drawn in its own coordinates, feet on y = 0, about 34 across and 38 tall.
// Each leg and the body sit in a pose group (moved by CSS for sitting or climbing, by
// data-pose on the svg) around a wobble group (moved by the CSS keyframes in styles.css).

const NS = 'http://www.w3.org/2000/svg';

export function el(tag, attrs = {}, children = []) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  for (const child of children) node.appendChild(child);
  return node;
}

export function jellyParts() {
  const leg = side => el('g', { class: `sc-pose-leg sc-pose-leg-${side < 0 ? 'l' : 'r'}` }, [
    el('g', { class: `sc-leg sc-leg-${side < 0 ? 'l' : 'r'}` }, [
      el('line', { class: 'sc-leg-edge', x1: side * 4.6, y1: -10, x2: side * 5, y2: -2.6 }),
      el('line', { class: 'sc-leg-fill', x1: side * 4.6, y1: -10, x2: side * 5, y2: -2.6 }),
      el('ellipse', { class: 'sc-foot', cx: side * 5.8, cy: -1.7, rx: 3.1, ry: 1.7 }),
    ]),
  ]);
  const eyes = el('g', { class: 'sc-jelly-eyes' }, [
    el('ellipse', { class: 'sc-ink', cx: -5.2, cy: -19.5, rx: 1.9, ry: 2.6 }),
    el('ellipse', { class: 'sc-ink', cx: 5.2, cy: -19.5, rx: 1.9, ry: 2.6 }),
    el('circle', { class: 'sc-glint', cx: -4.55, cy: -20.5, r: 0.75 }),
    el('circle', { class: 'sc-glint', cx: 5.85, cy: -20.5, r: 0.75 }),
  ]);
  const body = el('g', { class: 'sc-pose-body' }, [
    el('g', { class: 'sc-body' }, [
      // A jelly turned out of a mould: soft bulging sides, a slight waist, a rounded top,
      // a flat-ish base, and a little lopsided.
      el('path', {
        class: 'sc-jelly-body',
        d: 'M-12.5,-7.2 C-15.6,-8 -16.9,-12.5 -16.6,-17.5 C-16.4,-21.5 -15.6,-24.3 -13.8,-25.9 '
          + 'C-13.1,-26.5 -12.6,-26.9 -12.2,-27.3 C-12.2,-33.4 -7,-37.6 -0.4,-37.5 '
          + 'C6.6,-37.4 12.4,-33.2 12.3,-27.1 C12.8,-26.7 13.4,-26.3 14,-25.7 '
          + 'C15.9,-24 16.8,-21.2 16.8,-17.2 C16.9,-12.2 15.5,-8 12.4,-7.2 '
          + 'C7,-6.6 -7,-6.6 -12.5,-7.2 Z',
      }),
      el('path', { class: 'sc-sheen', d: 'M-8,-30.5 C-7.4,-33.4 -5,-35.2 -2.2,-35.5' }),
      el('path', { class: 'sc-sheen', d: 'M-14.2,-21 C-14.6,-17.8 -14.4,-14.6 -13.6,-12.2' }),
      eyes,
      el('path', { class: 'sc-mouth sc-mouth-small', d: 'M-2.8,-14 Q0,-11.5 2.8,-14' }),
      el('path', { class: 'sc-mouth sc-mouth-big', d: 'M-3.9,-14.7 Q0,-15 3.9,-14.7 Q3.5,-10 0,-10 Q-3.5,-10 -3.9,-14.7 Z' }),
    ]),
  ]);
  return { parts: [leg(-1), leg(1), body], eyes };
}

// Sets how much the legs wobble, 0 to 1, on a drawing holding a jelly. Restarting the
// keyframes (by swapping to an identical copy) makes every browser pick up the new
// amplitude; at 0 the animation is switched off altogether.
export function setWobble(svg, wobble, restart = false) {
  const w = Math.round(Math.min(1, Math.max(0, Number(wobble) || 0)) * 100) / 100;
  svg.style.setProperty('--wobble', String(w));
  const phase = svg.getAttribute('data-wob');
  svg.setAttribute('data-wob', restart && phase === 'a' ? 'b' : 'a');
  if (w === 0) svg.setAttribute('data-still', '');
  else svg.removeAttribute('data-still');
  return w;
}

// A jelly on its own: standing, with a small smile, legs wobbling by `wobble`.
export function createJelly({ wobble = 0, pose = 'stand' } = {}) {
  const svg = el('svg', {
    class: 'jelly', viewBox: '-19 -40 38 41', 'aria-hidden': 'true', focusable: 'false',
    preserveAspectRatio: 'xMidYMax meet', 'data-pose': pose,
  });
  svg.appendChild(el('g', { class: 'sc-jelly' }, jellyParts().parts));
  setWobble(svg, wobble);
  return svg;
}
