// Tests for public/scene.js: the jelly's place on the ladder, its wobble, and the quip.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sceneState, stepJellyWobble, replyScene, notchPlace, towardsGoal, ladderHeight, NO_GOAL_HEIGHT } from '../public/scene.js';
import { QUIPS, STEP } from '../public/strings.js';
import * as R from '../public/rules.js';

let clock = 0;
const at = () => new Date(Date.UTC(2026, 9, 13, 8, 0, clock++)).toISOString();
const FLOOR = { words: 10, people: 0, visibility: 'notAtAll', matters: 'notMuch' };
const steps = states => states.map((state, i) => ({ id: `s${i}`, state, goal: false, ...FLOOR }));
const attempt = (stayed, hardToStay, stepId = 's0') => ({ stepId, stayed, hardToStay, createdAt: at() });
const data = (states, attempts = []) => ({ steps: steps(states), attempts });
// After Set-up, with step `goalAt` marked as the goal (-1: none), and dials per step.
const withGoal = (states, goalAt, attempts = [], dials = []) => ({
  person: { goalSituation: 'fiveMinutes' },
  steps: steps(states).map((s, i) => ({ ...s, ...dials[i], goal: i === goalAt })),
  attempts,
});
// A goal 13 notches up from the floor: 200 words (4), 10 people (5), clearly (3), somewhat (1).
const GOAL = { words: 200, people: 10, visibility: 'clearly', matters: 'somewhat' };

describe('Where the jelly is: how far it has come towards the goal step (Q148)', () => {
  it('a dial\'s place counts notches up from the floor, part of the way between two', () => {
    assert.deepEqual(['notAtAll', 'barely', 'partly', 'clearly'].map(v => notchPlace('visibility', v)), [0, 1, 2, 3]);
    assert.deepEqual([10, 5, 25, 75, 1000, 5000].map(v => notchPlace('words', v)), [0, 0, 1, 2.5, 7, 7]);
    assert.deepEqual([0, 1, 4, 7].map(v => notchPlace('people', v)), [0, 1, 3.5, 4.4]);
  });

  it('a step\'s notches on the four dials, none past the goal\'s, out of the goal\'s', () => {
    assert.equal(towardsGoal(FLOOR, GOAL), 0);
    assert.equal(towardsGoal({ words: 25, people: 1, visibility: 'clearly', matters: 'notMuch' }, GOAL), 5 / 13);
    assert.equal(towardsGoal({ words: 1000, people: 500, visibility: 'clearly', matters: 'aLot' }, GOAL), 1);
    assert.equal(towardsGoal({ words: 1000, people: 0, visibility: 'notAtAll', matters: 'notMuch' }, GOAL), 4 / 13);
    assert.equal(towardsGoal(FLOOR, FLOOR), 1, 'a goal at the floor is reached by any step');
  });

  it('the height is the settled step nearest the goal; open steps don\'t count', () => {
    const d = withGoal(['settled', 'settled', 'rehearsing', 'planning'], 3, [], [
      { words: 25, people: 1, visibility: 'clearly' },
      { words: 50, people: 1, visibility: 'clearly' },
      { words: 200, people: 10, visibility: 'clearly', matters: 'somewhat' },
      GOAL,
    ]);
    assert.equal(ladderHeight(d), 6 / 13);
    const s = sceneState(d);
    assert.deepEqual([s.position, s.atTop], [6 / 13, false]);
  });

  it('with no goal step, settled steps out of all the steps, never above halfway, and the stage stays empty', () => {
    assert.equal(NO_GOAL_HEIGHT, 0.5);
    assert.deepEqual([sceneState(data([])).position, sceneState(data([])).atTop], [0, false]);
    assert.equal(sceneState(data(['settled', 'settled', 'rehearsing', 'planning'])).position, 0.25);
    const all = sceneState(withGoal(['settled', 'settled'], -1, [], [GOAL, GOAL]));
    assert.deepEqual([all.position, all.atTop], [0.5, false]);
  });

  it('the lectern only when the goal step settles, even if another step has reached its dials', () => {
    const open = sceneState(withGoal(['settled', 'rehearsing'], 1, [], [GOAL, GOAL]));
    assert.deepEqual([open.position, open.atTop], [1, false]);
    assert.equal(sceneState(withGoal(['rehearsing', 'settled'], 1, [], [{}, GOAL])).atTop, true);
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
    assert.equal(sceneState(withGoal(['settled', 'rehearsing'], 1)).atTop, false);
    assert.equal(sceneState(withGoal(['settled', 'settled'], -1)).atTop, false);
    assert.equal(sceneState({ ...withGoal(['settled', 'rehearsing'], 0), person: null }).atTop, false);
  });

  it('the complete quip comes before every other, the didn\'t-stay one included', () => {
    const d = withGoal(['settled', 'didntStay'], 0, [attempt(true, 1), attempt(false, 8, 's1')]);
    assert.equal(sceneState(d).quip, 'complete');
    assert.equal(sceneState({ ...d, person: null }).quip, 'didntStay');
    assert.equal(sceneState(withGoal(['settled', 'settled'], 1)).quip, 'complete');
  });
});

describe('The quip, chosen by the jelly\'s height', () => {
  const quip = (states, goalAt = -1, dials = [], attempts = []) => QUIPS[sceneState(withGoal(states, goalAt, attempts, dials)).quip];

  it('all seven quips and the complete one have their words', () => {
    for (const key of ['complete', 'none', 'firstStep', 'didntStay', 'quarter', 'halfway', 'nearly', 'top']) assert.ok(QUIPS[key], key);
  });

  it('no steps; low down; a quarter; halfway; three quarters of the way to the goal', () => {
    assert.equal(quip([]), 'Jelly legs, at the bottom, looking up.');
    assert.equal(quip(['planning']), 'One foot on the ladder. That counts.');
    assert.equal(quip(['settled', 'rehearsing', 'rehearsing']), 'One foot on the ladder. That counts.');
    assert.equal(quip(['settled', 'rehearsing']), 'Wobbling, climbing, still here.');
    assert.equal(quip(['settled', 'settled']), 'Halfway up and the knees have mostly stopped knocking.');
    const near = { words: 200, people: 10, visibility: 'clearly', matters: 'notMuch' }; // 12 of 13
    assert.equal(quip(['settled', 'rehearsing'], 1, [near, GOAL]), 'Nearly there. The lectern\'s looking smaller.');
  });

  it('no quip puts the jelly on the stage unless the goal step has settled (Q150)', () => {
    const cases = [
      quip(['settled', 'settled', 'settled']),
      quip(['settled', 'rehearsing'], 1, [GOAL, GOAL]),
      quip(['settled', 'settled'], -1, [GOAL, GOAL]),
    ];
    for (const words of cases) assert.ok(!/stage/i.test(words), words);
    assert.ok(!['none', 'firstStep', 'didntStay', 'quarter', 'halfway', 'nearly'].some(k => /stage/i.test(QUIPS[k])));
  });

  it('after a didn\'t stay, until the next attempt', () => {
    assert.equal(quip(['settled', 'didntStay', 'rehearsing', 'rehearsing'], -1, [], [attempt(false, 8, 's1')]), 'Came back down. The ladder\'s still here.');
    assert.equal(quip(['settled', 'ready'], -1, [], [attempt(false, 8, 's1'), attempt(true, 5, 's1')]), 'Wobbling, climbing, still here.');
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
