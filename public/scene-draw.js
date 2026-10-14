// The scene at the top of the Ladder (the look stage): a small theatre.
// An original drawing: a stage at the right under a curtain, a spotlight pooling on a
// lectern, a ladder leaning on the stage lip, a row of round-headed silhouettes in front,
// and the orange jelly on the ladder. No libraries and no text in the drawing.
//
//   createScene({ position, atTop, wobble, pose, place }) -> { element, update(state) }
//
// position 0..1 is how far up the ladder the jelly stands; it goes to the nearest of nine
// rungs, so its feet always land on one.
// atTop puts it on the stage at the lectern, facing the audience. wobble 0..1 is how much
// its legs wobble, set as --wobble on the svg root and used by the CSS keyframes in
// styles.css. pose is 'stand' (the default), 'sit' (on its rung) or 'climb' (a leg lifted
// for the rung above); place 'floor' stands it on the floor at the foot of the ladder. Every
// move is a CSS transition; nothing is animated from JavaScript.
// The Ladder's state comes from sceneState in scene.js. The Welcome screen and the replies
// show the part of the scene around the ladder, larger (LADDER_VIEW).

import { el, jellyParts, setWobble } from './jelly.js';

let count = 0; // keeps gradient ids unique each time the Ladder draws a new scene

// Geometry, in viewBox units (360 x 220).
const FLOOR_Y = 206;                 // the floor the ladder stands on
const LIP = { x: 150, y: 124 };      // the stage's front-left corner, where the ladder rests
const SLOPE = 44 / 82;               // the ladder leans 44 across for every 82 up
const RAIL_GAP = 20;                 // horizontal gap between the two rails
const RAIL_TOP_Y = 117;              // the rails poke a little above the lip
const RUNGS = 9;                     // so a quarter, a half and three quarters land on a rung
const RUNG_BOTTOM_Y = 197;
const RUNG_TOP_Y = 129;
const RUNG_STROKE = 2.2;
const STAGE_FLOOR_Y = 117.5;         // where feet stand on the stage boards
const LECTERN_SPOT = { x: 254, y: STAGE_FLOOR_Y };
const JELLY_SCALE = 1.2;             // the jelly is drawn about its feet, then scaled
const FACE_ABOVE_FEET = 19.5 * JELLY_SCALE; // the jelly's eyes, above its feet
const FLOOR_SPOT = { x: 62, y: FLOOR_Y };   // on the floor, just left of the ladder's foot

// The part of the scene around the ladder, for a larger jelly: the floor, the ladder, the
// stage's edge and the first of the audience.
export const LADDER_VIEW = '36 96 168 124';

// The right rail passes through the lip; the left rail is RAIL_GAP to its left.
const rightRailX = y => LIP.x - (y - LIP.y) * SLOPE;
const rungY = k => RUNG_BOTTOM_Y - (k * (RUNG_BOTTOM_Y - RUNG_TOP_Y)) / (RUNGS - 1);
const rungCentreX = y => rightRailX(y) - RAIL_GAP / 2;

const clamp01 = n => (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0);

function normalise(input) {
  const state = input ?? {};
  return {
    position: clamp01(Number(state.position)), atTop: Boolean(state.atTop), wobble: clamp01(Number(state.wobble)),
    pose: ['sit', 'climb'].includes(state.pose) ? state.pose : 'stand', floor: state.place === 'floor' || state.floor === true,
  };
}

// Where the jelly's feet go: on the nearest rung, at the lectern, or on the floor.
export function jellySpot(state) {
  const s = normalise(state);
  if (s.atTop) return { x: LECTERN_SPOT.x, y: LECTERN_SPOT.y, rung: null, onStage: true };
  if (s.floor) return { x: FLOOR_SPOT.x, y: FLOOR_SPOT.y, rung: null, onStage: false, onFloor: true };
  const rung = Math.round(s.position * (RUNGS - 1));
  const y = rungY(rung);
  // The feet rest on the top of the rung's stroke.
  return { x: rungCentreX(y), y: y - RUNG_STROKE / 2, rung, onStage: false };
}

const TOP_RUNG = jellySpot({ position: 1 });

// The audience: head centre, head radius, and an optional bun.
const AUDIENCE = [
  { x: 180, y: 191, r: 10.5 },
  { x: 215, y: 195, r: 11.5 },
  { x: 250, y: 190, r: 10, bun: true },
  { x: 285, y: 194, r: 11.5 },
  { x: 320, y: 191, r: 10.5 },
];

const r1 = n => Math.round(n * 100) / 100;

const pts = list => list.map(([x, y]) => `${r1(x)},${r1(y)}`).join(' ');

// How the jelly moves. Three nested groups: one carries it along the ladder (x and y
// together, so the feet follow the line of the rungs), and two carry it from the top rung
// to the lectern (a quick step up, then a walk across). Climbing onto the stage runs them
// one after the other; coming down runs them in reverse. About 1.2 seconds in all.
const EVEN = 'cubic-bezier(.45,.05,.35,1)';
const MOVES = {
  ladder: { ladder: ['1.2s', '0s', EVEN], across: ['1.2s', '0s', EVEN], step: ['1.2s', '0s', EVEN] },
  onto: { ladder: ['0.55s', '0s', EVEN], across: ['0.65s', '0.55s', 'ease-in-out'], step: ['0.3s', '0.55s', 'ease-out'] },
  off: { across: ['0.65s', '0s', 'ease-in-out'], step: ['0.3s', '0.35s', 'ease-in'], ladder: ['0.55s', '0.65s', EVEN] },
};
function timing(node, [duration, delay, ease]) {
  node.style.transitionDuration = duration;
  node.style.transitionDelay = delay;
  node.style.transitionTimingFunction = ease;
}

export function createScene(initial) {
  const id = `scene-${++count}`;

  const svg = el('svg', {
    class: 'scene', viewBox: '0 0 360 220', width: '100%', 'aria-hidden': 'true', focusable: 'false',
    preserveAspectRatio: 'xMidYMid meet',
  });

  // Gradients for the spotlight. Their stop colours come from styles.css.
  svg.appendChild(el('defs', {}, [
    el('linearGradient', { id: `${id}-cone`, x1: 0, y1: 0, x2: 0, y2: 1 }, [
      el('stop', { offset: 0, class: 'sc-cone-top' }),
      el('stop', { offset: 1, class: 'sc-cone-foot' }),
    ]),
    el('radialGradient', { id: `${id}-pool`, cx: 0.5, cy: 0.5, r: 0.5 }, [
      el('stop', { offset: 0, class: 'sc-pool-mid' }),
      el('stop', { offset: 0.55, class: 'sc-pool-half' }),
      el('stop', { offset: 1, class: 'sc-pool-edge' }),
    ]),
    el('radialGradient', { id: `${id}-glow`, cx: 0.5, cy: 0.5, r: 0.5 }, [
      el('stop', { offset: 0, class: 'sc-glow-mid' }),
      el('stop', { offset: 1, class: 'sc-glow-edge' }),
    ]),
  ]));

  // The house: the floor in front of the stage.
  svg.appendChild(el('rect', { class: 'sc-house', x: 0, y: FLOOR_Y, width: 360, height: 220 - FLOOR_Y }));
  svg.appendChild(el('line', { class: 'sc-house-line', x1: 0, y1: FLOOR_Y, x2: LIP.x, y2: FLOOR_Y }));
  // Two small wall lamps in the house, turned low.
  for (const x of [42, 102]) {
    const y = 64;
    svg.appendChild(el('g', { class: 'sc-sconce' }, [
      el('circle', { cx: x, cy: y - 2, r: 17, fill: `url(#${id}-glow)` }),
      el('rect', { class: 'sc-sconce-metal', x: x - 1, y: y + 3, width: 2, height: 7, rx: 1 }),
      el('polygon', { class: 'sc-sconce-metal', points: pts([[x - 5.2, y - 4], [x + 5.2, y - 4], [x + 3.2, y + 4], [x - 3.2, y + 4]]) }),
      el('ellipse', { class: 'sc-lens', cx: x, cy: y - 4, rx: 5.2, ry: 1.3 }),
    ]));
  }

  // The back of the stage, and a glow where the light falls.
  svg.appendChild(el('rect', { class: 'sc-backdrop', x: 156, y: 0, width: 204, height: 111 }));
  // The left side of the stage opening.
  svg.appendChild(el('rect', { class: 'sc-curtain-dark', x: 152, y: 0, width: 5, height: 110.5 }));
  svg.appendChild(el('ellipse', { cx: 281, cy: 84, rx: 50, ry: 38, fill: `url(#${id}-glow)` }));

  // The stage floor: boards running along it, with staggered joints.
  const boardLeftX = y => LIP.x + ((LIP.y - y) / (LIP.y - 110)) * 6;
  svg.appendChild(el('polygon', { class: 'sc-boards', points: pts([[LIP.x, LIP.y], [360, LIP.y], [360, 110], [156, 110]]) }));
  const boards = el('g', { class: 'sc-board-line' });
  for (const y of [114.7, 119.3]) boards.appendChild(el('line', { x1: r1(boardLeftX(y)), y1: y, x2: 360, y2: y }));
  for (const [x, ya, yb] of [[194, 110, 114.7], [252, 110, 114.7], [314, 110, 114.7], [172, 114.7, 119.3], [226, 114.7, 119.3], [286, 114.7, 119.3], [342, 114.7, 119.3], [206, 119.3, 124], [262, 119.3, 124], [324, 119.3, 124]]) {
    boards.appendChild(el('line', { x1: x, y1: ya, x2: x, y2: yb }));
  }
  svg.appendChild(boards);

  // The spotlight: three nested cones (soft edges without a filter), then the pool.
  const LAMP_X = 280;
  const LENS_Y = 29;
  const cones = el('g', { class: 'sc-cone' });
  for (const [top, foot] of [[9, 50], [7, 38], [5, 26]]) {
    cones.appendChild(el('path', {
      fill: `url(#${id}-cone)`,
      d: `M${LAMP_X - top},${LENS_Y} L${LAMP_X + top},${LENS_Y} L${LAMP_X + foot},${STAGE_FLOOR_Y} A${foot} 5 0 0 1 ${LAMP_X - foot},${STAGE_FLOOR_Y} Z`,
    }));
  }
  svg.appendChild(cones);
  svg.appendChild(el('ellipse', { cx: LAMP_X, cy: STAGE_FLOOR_Y, rx: 56, ry: 6.2, fill: `url(#${id}-pool)` }));

  // The stage's front edge (board ends) and its face.
  svg.appendChild(el('rect', { class: 'sc-apron', x: LIP.x, y: LIP.y + 5, width: 360 - LIP.x, height: FLOOR_Y - LIP.y - 5 }));
  svg.appendChild(el('rect', { class: 'sc-apron-shade', x: LIP.x, y: FLOOR_Y - 6, width: 360 - LIP.x, height: 6 }));
  const seams = el('g', { class: 'sc-apron-line' });
  for (const x of [205, 260, 315]) seams.appendChild(el('line', { x1: x, y1: LIP.y + 5, x2: x, y2: FLOOR_Y - 6 }));
  svg.appendChild(seams);
  svg.appendChild(el('rect', { class: 'sc-lip', x: LIP.x, y: LIP.y, width: 360 - LIP.x, height: 5 }));
  const ends = el('g', { class: 'sc-lip-line' });
  for (let x = LIP.x + 17; x < 360; x += 19) ends.appendChild(el('line', { x1: x, y1: LIP.y + 1, x2: x, y2: LIP.y + 4 }));
  svg.appendChild(ends);

  // The curtain at the right, gathered with a tie-back, resting on the boards.
  svg.appendChild(el('path', { class: 'sc-curtain', d: 'M335,4 C336,30 347,52 346,64 C345,80 331,104 327,118 L360,118 L360,4 Z' }));
  const drapeFolds = el('g', { class: 'sc-curtain-fold' });
  for (const d of ['M342,6 C343,30 350,50 350,62', 'M353,6 L353,62', 'M349,69 C345,86 338,104 336,117', 'M355,69 C353,88 350,104 348,117']) {
    drapeFolds.appendChild(el('path', { d }));
  }
  svg.appendChild(drapeFolds);
  svg.appendChild(el('path', { class: 'sc-curtain-lit', d: 'M338,8 C339,30 344,48 344,60' }));
  svg.appendChild(el('rect', { class: 'sc-curtain-dark', x: 344, y: 62, width: 16, height: 6, rx: 3 }));

  // The ladder: two rails and RUNGS rungs, the right rail resting on the lip.
  const ladder = el('g', { class: 'sc-ladder' });
  for (const offset of [-RAIL_GAP, 0]) {
    ladder.appendChild(el('line', {
      class: 'sc-rail',
      x1: r1(rightRailX(FLOOR_Y) + offset), y1: FLOOR_Y, x2: r1(rightRailX(RAIL_TOP_Y) + offset), y2: RAIL_TOP_Y,
    }));
  }
  for (let k = 0; k < RUNGS; k += 1) {
    const y = r1(rungY(k));
    ladder.appendChild(el('line', { class: 'sc-rung', x1: r1(rightRailX(y) - RAIL_GAP), y1: y, x2: r1(rightRailX(y)), y2: y }));
  }
  svg.appendChild(ladder);

  // The jelly (jelly.js). Local coordinates: its feet stand on y = 0.
  const { parts, eyes } = jellyParts();
  const jelly = el('g', { class: 'sc-jelly', transform: `scale(${JELLY_SCALE})` }, parts);
  const jellyStep = el('g', { class: 'sc-jmove sc-jstep' }, [jelly]);
  const jellyAcross = el('g', { class: 'sc-jmove sc-jacross' }, [jellyStep]);
  const jellyLadder = el('g', { class: 'sc-jmove sc-jladder' }, [jellyAcross]);
  svg.appendChild(jellyLadder);

  // The lectern, drawn over the jelly so the jelly stands just behind its desk.
  svg.appendChild(el('g', { class: 'sc-lectern-group' }, [
    // A base, a column, and a desk whose top slopes down towards the speaker.
    el('rect', { class: 'sc-lectern', x: 281, y: 114.4, width: 26, height: 3.2, rx: 1.4 }),
    el('rect', { class: 'sc-lectern', x: 290, y: 94, width: 8, height: 21 }),
    el('rect', { class: 'sc-lectern-shade', x: 290, y: 94, width: 2.6, height: 21 }),
    el('polygon', { class: 'sc-lectern', points: pts([[280, 97.5], [308, 97.5], [309.5, 81.6], [278.6, 88]]) }),
    el('polygon', { class: 'sc-lectern-shade', points: pts([[280, 97.5], [284, 97.5], [282.8, 87.1], [278.6, 88]]) }),
    el('line', { class: 'sc-lectern-edge', x1: 278, y1: 88.1, x2: 310.2, y2: 81.4 }),
    el('polygon', { class: 'sc-paper', points: pts([[283.5, 85.6], [298, 82.6], [298.6, 83.9], [284.1, 86.9]]) }),
  ]));

  // The valance along the top, with the spotlight lamp hanging from it.
  svg.appendChild(el('path', { class: 'sc-curtain', d: 'M156,0 L360,0 L360,12 Q334.5,24 309,12 Q283.5,24 258,12 Q232.5,24 207,12 Q181.5,24 156,12 Z' }));
  const swags = el('g', { class: 'sc-curtain-lit-thin' });
  for (const [a, b] of [[156, 207], [207, 258], [258, 309], [309, 360]]) {
    swags.appendChild(el('path', { d: `M${a + 7},13.4 Q${(a + b) / 2},${21} ${b - 7},13.4` }));
  }
  svg.appendChild(swags);
  svg.appendChild(el('rect', { class: 'sc-curtain-dark', x: 156, y: 0, width: 204, height: 4 }));
  svg.appendChild(el('g', { class: 'sc-lamp-group' }, [
    el('line', { class: 'sc-lamp-rod', x1: LAMP_X, y1: 4, x2: LAMP_X, y2: 17 }),
    el('polygon', { class: 'sc-lamp', points: pts([[LAMP_X - 5.5, 16.5], [LAMP_X + 5.5, 16.5], [LAMP_X + 8, LENS_Y - 0.6], [LAMP_X - 8, LENS_Y - 0.6]]) }),
    el('ellipse', { class: 'sc-lens', cx: LAMP_X, cy: LENS_Y - 0.6, rx: 8, ry: 1.7 }),
  ]));

  // The audience: silhouettes with round heads; their faces and eyes turn to the jelly.
  const members = AUDIENCE.map((m, i) => {
    const eyeDx = m.r * 0.37;
    const eyeR = m.r * 0.25;
    const pupilR = m.r * 0.13;
    const pupils = el('g', { class: 'sc-pupils' }, [
      el('circle', { class: 'sc-pupil', cx: r1(m.x - eyeDx), cy: r1(m.y - 0.6), r: r1(pupilR) }),
      el('circle', { class: 'sc-pupil', cx: r1(m.x + eyeDx), cy: r1(m.y - 0.6), r: r1(pupilR) }),
    ]);
    const face = el('g', { class: 'sc-face' }, [
      el('circle', { class: 'sc-eye', cx: r1(m.x - eyeDx), cy: r1(m.y - 0.6), r: r1(eyeR) }),
      el('circle', { class: 'sc-eye', cx: r1(m.x + eyeDx), cy: r1(m.y - 0.6), r: r1(eyeR) }),
      pupils,
    ]);
    const headParts = [el('circle', { class: 'sc-crowd', cx: m.x, cy: m.y, r: m.r })];
    if (m.bun) headParts.unshift(el('circle', { class: 'sc-crowd', cx: m.x + m.r * 0.45, cy: m.y - m.r * 0.9, r: m.r * 0.38 }));
    headParts.push(face);
    const head = el('g', { class: 'sc-head' }, headParts);
    const s = m.r * 1.75;
    const top = m.y + m.r * 0.85;
    const shoulders = el('path', {
      class: 'sc-crowd sc-shoulders',
      d: `M${r1(m.x - s)},219 L${r1(m.x - s)},${r1(top + m.r * 0.75)} Q${r1(m.x - s)},${r1(top)} ${r1(m.x - m.r * 0.8)},${r1(top)} `
        + `L${r1(m.x + m.r * 0.8)},${r1(top)} Q${r1(m.x + s)},${r1(top)} ${r1(m.x + s)},${r1(top + m.r * 0.75)} L${r1(m.x + s)},219 Z`,
    });
    const delay = `${i * 70}ms`;
    for (const node of [head, face, pupils]) node.style.transitionDelay = delay;
    svg.appendChild(el('g', { class: 'sc-member' }, [shoulders, head]));
    return { ...m, head, face, pupils, eyeR, pupilR };
  });

  let current = null;

  function update(next) {
    const s = normalise(next);
    const spot = jellySpot(s);

    // Along the ladder; onto the stage by way of the top rung; or back down the same way.
    const onLadder = spot.onStage ? TOP_RUNG : spot;
    const move = current && spot.onStage && !current.onStage ? MOVES.onto
      : current && !spot.onStage && current.onStage ? MOVES.off : MOVES.ladder;
    timing(jellyLadder, move.ladder);
    timing(jellyAcross, move.across);
    timing(jellyStep, move.step);
    jellyLadder.style.transform = `translate(${r1(onLadder.x)}px, ${r1(onLadder.y)}px)`;
    jellyAcross.style.transform = `translateX(${r1(spot.x - onLadder.x)}px)`;
    jellyStep.style.transform = `translateY(${r1(spot.y - onLadder.y)}px)`;

    // On the ladder it looks up at the stage; at the lectern it looks out at the audience;
    // on the floor it looks up the ladder.
    eyes.style.transform = spot.onStage ? 'translate(0px, 0.9px)' : spot.onFloor ? 'translate(1.2px, -1.1px)' : 'translate(1px, -0.9px)';
    svg.setAttribute('data-place', spot.onStage ? 'stage' : spot.onFloor ? 'floor' : 'ladder');
    svg.setAttribute('data-pose', spot.onStage || spot.onFloor ? 'stand' : s.pose);

    // The wobble (jelly.js), restarted only when it changes.
    const w = r1(s.wobble);
    if (!current || current.wobble !== w) setWobble(svg, w, !!current);

    // Faces turn to where the jelly's face will be.
    const tx = spot.x;
    const ty = spot.y - FACE_ABOVE_FEET;
    for (const m of members) {
      const dx = tx - m.x;
      const dy = ty - m.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      m.head.style.transform = `rotate(${r1(ux * 8)}deg)`;
      m.face.style.transform = `translate(${r1(ux * m.r * 0.18)}px, ${r1(uy * m.r * 0.18)}px)`;
      const reach = m.eyeR - m.pupilR - 0.25;
      m.pupils.style.transform = `translate(${r1(ux * reach)}px, ${r1(uy * reach)}px)`;
    }

    current = { ...spot, wobble: w };
  }

  update(initial);
  return { element: svg, update };
}
