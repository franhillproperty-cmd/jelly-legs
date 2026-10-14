// The Ladder's scene (the look stage): where the jelly is, how much its legs wobble, and
// which quip goes under it; and the jelly on the Step screen and the replies (Q147). Pure
// functions, so they can be tested. The drawings are in scene-draw.js and jelly.js.

import { EASY_LINE, DIALS, NOTCHES, ladderComplete, goalStep } from './rules.js';

const byLogged = (a, b) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0);

// With no step marked My goal there is no top to measure against, so the jelly climbs only
// the bottom half of the ladder (Q148).
export const NO_GOAL_HEIGHT = 0.5;

// A dial's place on its notches, counted from the floor's notch as 0. Words and people
// between two notches count part of the way: 75 words is halfway from 50 to 100.
export function notchPlace(dial, value) {
  const notches = NOTCHES[dial];
  if (dial === 'visibility' || dial === 'matters') return Math.max(0, notches.indexOf(value));
  if (!(value > notches[0])) return 0;
  for (let i = 1; i < notches.length; i += 1) {
    if (value <= notches[i]) return i - 1 + (value - notches[i - 1]) / (notches[i] - notches[i - 1]);
  }
  return notches.length - 1;
}

// How far a step has come towards the goal step, 0 to 1 (Q148): its notches up from the
// floor on the four dials, none counted past the goal's own, out of the goal's. Each step
// turns one dial up one notch, so each lifts the jelly by the same amount.
export function towardsGoal(step, goal) {
  const top = DIALS.reduce((sum, dial) => sum + notchPlace(dial, goal[dial]), 0);
  if (top === 0) return 1;
  const reached = DIALS.reduce((sum, dial) => sum + Math.min(notchPlace(dial, step[dial]), notchPlace(dial, goal[dial])), 0);
  return reached / top;
}

// The jelly's height on the ladder, 0 to 1 (Q148): the settled step nearest the goal step,
// measured against the goal step's dials. With no goal step, settled steps out of all the
// steps, no higher than halfway.
export function ladderHeight(data) {
  const settled = data.steps.filter(s => s.state === 'settled');
  const goal = goalStep(data.steps);
  if (!goal) return data.steps.length ? (settled.length / data.steps.length) * NO_GOAL_HEIGHT : 0;
  return Math.max(0, ...settled.map(s => towardsGoal(s, goal)));
}

export function sceneState(data) {
  const total = data.steps.length;
  const settled = data.steps.filter(s => s.state === 'settled').length;
  // Only attempts on this ladder's steps: a new ladder starts with full wobble.
  const onLadder = new Set(data.steps.map(s => s.id));
  const attempts = data.attempts.filter(a => onLadder.has(a.stepId)).sort(byLogged);
  const lastAttempt = attempts[attempts.length - 1] ?? null;
  const lastStay = attempts.filter(a => a.stayed).pop() ?? null;
  const position = ladderHeight(data);
  const complete = ladderComplete(data);
  return {
    total,
    settled,
    // The jelly's rung: how far it has come towards the goal step (Q148).
    position,
    // The lectern only when the goal step settles, which completes the ladder; until then
    // the stage stays empty.
    atTop: complete,
    // The legs wobble less as the most recent stay's rating falls, and not at all at the
    // easy line (0 to 2) or below. Before any stay, they wobble fully.
    wobble: lastStay ? Math.min(1, Math.max(0, (lastStay.hardToStay - EASY_LINE) / (10 - EASY_LINE))) : 1,
    quip: quipFor({ total, position, complete, lastAttempt }),
  };
}

// Which quip, by the jelly's height. The first that applies wins; a complete ladder comes
// first. None says the jelly is on the stage unless the goal step has settled (Q150).
function quipFor({ total, position, complete, lastAttempt }) {
  if (complete) return 'complete';
  if (total === 0) return 'none';
  if (lastAttempt && !lastAttempt.stayed) return 'didntStay';
  if (position >= 0.75) return 'nearly';
  if (position >= 0.5) return 'halfway';
  if (position >= 0.25) return 'quarter';
  return 'firstStep';
}

// The small jelly beside a Step screen's strip (Q147): wobbling while the step is still to
// do, half as much once it is ready, still once it has settled.
export function stepJellyWobble(step) {
  return step.state === 'settled' ? 0 : step.state === 'ready' ? 0.5 : 1;
}

// The jelly on a reply, matching it and never sad (Q147): climbing a rung after a stay that
// settled the step; sitting on a rung after a hard stay; standing at the foot of the ladder,
// looking up, after a didn't stay. `from` is drawn first and `to` straight after, so the
// climb shows as a move.
export function replyScene(reply) {
  if (reply === 'easy') return { from: { position: 3 / 8, pose: 'climb', wobble: 0 }, to: { position: 4 / 8, pose: 'climb', wobble: 0 } };
  if (reply === 'didntStay') {
    const foot = { place: 'floor', wobble: 0.5 };
    return { from: foot, to: foot };
  }
  const sitting = { position: 3 / 8, pose: 'sit', wobble: 0 }; // hard, and hard again
  return { from: sitting, to: sitting };
}
