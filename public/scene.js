// The Ladder's scene (the look stage): where the jelly is, how much its legs wobble, and
// which quip goes under it. Pure functions of the stored data, so they can be tested.
// The drawing itself is in scene-draw.js.

import { EASY_LINE, ladderComplete } from './rules.js';

const byLogged = (a, b) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0);

export function sceneState(data) {
  const total = data.steps.length;
  const settled = data.steps.filter(s => s.state === 'settled').length;
  // Only attempts on this ladder's steps: a new ladder starts with full wobble.
  const onLadder = new Set(data.steps.map(s => s.id));
  const attempts = data.attempts.filter(a => onLadder.has(a.stepId)).sort(byLogged);
  const lastAttempt = attempts[attempts.length - 1] ?? null;
  const lastStay = attempts.filter(a => a.stayed).pop() ?? null;
  const position = total ? settled / total : 0;
  const complete = ladderComplete(data);
  // At the top when every step is settled, or when the goal step is (the ladder is complete).
  const atTop = complete || (total > 0 && settled === total);
  return {
    total,
    settled,
    // The jelly's rung: settled steps out of all the steps on the ladder; at the top it
    // stands at the lectern.
    position,
    atTop,
    // The legs wobble less as the most recent stay's rating falls, and not at all at the
    // easy line (0 to 2) or below. Before any stay, they wobble fully.
    wobble: lastStay ? Math.min(1, Math.max(0, (lastStay.hardToStay - EASY_LINE) / (10 - EASY_LINE))) : 1,
    quip: quipFor({ total, settled, position, atTop, complete, lastAttempt }),
  };
}

// Which quip, by progress. The first that applies wins; a complete ladder comes first.
function quipFor({ total, settled, position, atTop, complete, lastAttempt }) {
  if (complete) return 'complete';
  if (total === 0) return 'none';
  if (atTop) return 'top';
  if (lastAttempt && !lastAttempt.stayed) return 'didntStay';
  if (total >= 2 && settled === total - 1) return 'nearly';
  if (position >= 0.5) return 'halfway';
  if (position >= 0.25) return 'quarter';
  return 'firstStep';
}
