// Tests for public/scene.js: the jelly's place on the ladder, its wobble, and the quip.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sceneState } from '../public/scene.js';
import { QUIPS } from '../public/strings.js';

let clock = 0;
const at = () => new Date(Date.UTC(2026, 9, 13, 8, 0, clock++)).toISOString();
const steps = states => states.map((state, i) => ({ id: `s${i}`, state }));
const attempt = (stayed, hardToStay) => ({ stepId: 's0', stayed, hardToStay, createdAt: at() });
const data = (states, attempts = []) => ({ steps: steps(states), attempts });

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
});

describe('The quip, chosen by progress', () => {
  const quip = (states, attempts) => QUIPS[sceneState(data(states, attempts)).quip];

  it('every quip has its words', () => {
    for (const key of ['none', 'firstStep', 'didntStay', 'quarter', 'halfway', 'nearly', 'top']) assert.ok(QUIPS[key], key);
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
});
