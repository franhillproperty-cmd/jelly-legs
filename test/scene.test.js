// Tests for public/scene.js: the jelly's place on the ladder, its wobble, and the quip.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sceneState, stepJellyWobble, replyScene } from '../public/scene.js';
import { QUIPS, STEP } from '../public/strings.js';
import * as R from '../public/rules.js';

let clock = 0;
const at = () => new Date(Date.UTC(2026, 9, 13, 8, 0, clock++)).toISOString();
const steps = states => states.map((state, i) => ({ id: `s${i}`, state, goal: false }));
const attempt = (stayed, hardToStay, stepId = 's0') => ({ stepId, stayed, hardToStay, createdAt: at() });
const data = (states, attempts = []) => ({ steps: steps(states), attempts });
// After Set-up, with step `goalAt` marked as the goal.
const withGoal = (states, goalAt, attempts = []) => ({
  person: { goalSituation: 'fiveMinutes' },
  steps: steps(states).map((s, i) => ({ ...s, goal: i === goalAt })),
  attempts,
});

describe('Where the jelly is', () => {
  it('its rung is the settled steps out of all the steps; at the top it is at the lectern', () => {
    assert.deepEqual(sceneState(data([])), { ...sceneState(data([])), position: 0, atTop: false });
    const s = sceneState(data(['settled', 'settled', 'rehearsing', 'planning']));
    assert.deepEqual([s.settled, s.total, s.position, s.atTop], [2, 4, 0.5, false]);
    assert.equal(sceneState(data(['settled', 'settled'])).atTop, true);
  });
});

describe('How much its legs wobble', () => {
  it('falls with the most recent stay\'s rating, to none at 0 to 2', () => {
    assert.equal(sceneState(data(['rehearsing'], [attempt(true, 10)])).wobble, 1);
    assert.equal(sceneState(data(['rehearsing'], [attempt(true, 6)])).wobble, 0.5);
    for (const n of [0, 1, 2]) assert.equal(sceneState(data(['settled'], [attempt(true, n)])).wobble, 0);
  });

  it('goes by the most recent stay, not a later didn\'t stay', () => {
    assert.equal(sceneState(data(['didntStay'], [attempt(true, 2), attempt(false, 9)])).wobble, 0);
  });

  it('is full before any stay', () => {
    assert.equal(sceneState(data([])).wobble, 1);
  });

  it('reads only attempts on this ladder\'s steps: a new ladder wobbles fully until its first stay', () => {
    const old = attempt(true, 0, 'earlier');
    assert.equal(sceneState(data(['rehearsing'], [old])).wobble, 1);
    assert.equal(sceneState(data(['rehearsing'], [old, attempt(true, 6)])).wobble, 0.5);
    assert.equal(sceneState(data(['rehearsing'], [attempt(true, 6), attempt(true, 0, 'earlier')])).wobble, 0.5);
  });
});

describe('A complete ladder: the jelly at the lectern', () => {
  it('is at the top once the goal step settles, even with other steps still open', () => {
    const s = sceneState(withGoal(['settled', 'rehearsing', 'didntStay'], 0));
    assert.equal(s.atTop, true);
    assert.equal(s.quip, 'complete');
  });

  it('not while the goal step is still open, nor with no goal step, nor before Set-up', () => {
    const open = sceneState(withGoal(['settled', 'rehearsing'], 1));
    assert.deepEqual([open.atTop, open.quip], [false, 'nearly']);
    assert.equal(sceneState(withGoal(['settled', 'rehearsing'], -1)).quip, 'nearly');
    const noPerson = withGoal(['settled', 'rehearsing'], 0);
    assert.equal(sceneState({ ...noPerson, person: null }).quip, 'nearly');
  });

  it('the complete quip comes before every other, the didn\'t-stay one included', () => {
    const d = withGoal(['settled', 'didntStay'], 0, [attempt(true, 1), attempt(false, 8, 's1')]);
    assert.equal(sceneState(d).quip, 'complete');
    assert.equal(sceneState({ ...d, person: null }).quip, 'didntStay');
    assert.equal(sceneState(withGoal(['settled', 'settled'], 1)).quip, 'complete');
    assert.equal(sceneState(withGoal(['settled', 'settled'], -1)).quip, 'top');
  });
});

describe('The quip, chosen by progress', () => {
  const quip = (states, attempts) => QUIPS[sceneState(data(states, attempts)).quip];

  it('every quip has its words', () => {
    for (const key of ['complete', 'none', 'firstStep', 'didntStay', 'quarter', 'halfway', 'nearly', 'top']) assert.ok(QUIPS[key], key);
  });

  it('no steps; first step planned; a quarter; halfway; one from the top; at the top', () => {
    assert.equal(quip([]), 'Jelly legs, at the bottom, looking up.');
    assert.equal(quip(['planning']), 'One foot on the ladder. That counts.');
    assert.equal(quip(['settled', 'rehearsing', 'rehearsing', 'rehearsing', 'rehearsing']), 'One foot on the ladder. That counts.');
    assert.equal(quip(['settled', 'rehearsing', 'rehearsing', 'rehearsing']), 'Wobbling, climbing, still here.');
    assert.equal(quip(['settled', 'settled', 'rehearsing', 'rehearsing', 'rehearsing']), 'Wobbling, climbing, still here.');
    assert.equal(quip(['settled', 'settled', 'settled', 'rehearsing', 'rehearsing', 'rehearsing']), 'Halfway up and the knees have mostly stopped knocking.');
    assert.equal(quip(['settled', 'settled', 'rehearsing']), 'Nearly there. The lectern\'s looking smaller.');
    assert.equal(quip(['settled', 'settled']), 'On the stage, legs like concrete.');
  });

  it('after a didn\'t stay, until the next attempt', () => {
    assert.equal(quip(['settled', 'didntStay', 'rehearsing', 'rehearsing'], [attempt(false, 8)]), 'Came back down. The ladder\'s still here.');
    assert.equal(quip(['settled', 'ready', 'rehearsing', 'rehearsing'], [attempt(false, 8), attempt(true, 5)]), 'Wobbling, climbing, still here.');
  });

  it('a didn\'t stay on an earlier ladder\'s step doesn\'t count', () => {
    assert.equal(sceneState(data(['rehearsing', 'rehearsing'], [attempt(false, 8, 'earlier')])).quip, 'firstStep');
    assert.equal(sceneState(data(['rehearsing', 'rehearsing'], [attempt(false, 8)])).quip, 'didntStay');
  });
});

describe('The Step screen: where the step is, and its jelly (Q145, Q147)', () => {
  it("each state is at one stage of Plan, Rehearse, Ready, Do it, Log it; settled and didn't stay are at Log it", () => {
    assert.deepEqual(R.STATES.map(state => R.stepStage({ state })), ['plan', 'rehearse', 'ready', 'logIt', 'logIt']);
    assert.deepEqual(R.STAGES, ['plan', 'rehearse', 'ready', 'doIt', 'logIt']);
  });

  it('every stage has its label and every state its line', () => {
    for (const key of R.STAGES) assert.ok(STEP.stages[key], key);
    for (const state of R.STATES) assert.ok(STEP.now[state], state);
  });

  it('the jelly wobbles while the step is still to do, half as much when ready, not at all once settled', () => {
    assert.deepEqual(R.STATES.map(state => stepJellyWobble({ state })), [1, 1, 0.5, 0, 1]);
  });
});

describe('The jelly on the replies, never sad (Q147)', () => {
  it('climbing a rung after an easy stay', () => {
    const { from, to } = replyScene('easy');
    assert.deepEqual([from.pose, to.pose], ['climb', 'climb']);
    assert.ok(to.position > from.position);
  });

  it('sitting on a rung after a hard stay, and again after a second one', () => {
    for (const reply of ['hard', 'hardAgain']) {
      const { from, to } = replyScene(reply);
      assert.equal(from.pose, 'sit', reply);
      assert.deepEqual(from, to);
    }
  });

  it("at the foot of the ladder after a didn't stay", () => {
    const { from, to } = replyScene('didntStay');
    assert.equal(from.place, 'floor');
    assert.deepEqual(from, to);
  });
});
