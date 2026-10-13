// Tests for public/format.js and the completeness of public/strings.js: the words the
// rules' values turn into on screen.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as R from '../public/rules.js';
import * as F from '../public/format.js';
import * as S from '../public/strings.js';

const pace = { choice: 'average', wpm: 140 };

describe('Every value the rules produce has its words', () => {
  it('toggles, switch-off lines, dials, situations, states and feelings', () => {
    for (const key of R.TOGGLES) {
      assert.ok(S.TOGGLE_LABELS[key], key);
      assert.ok(S.SWITCH_OFF[key], key);
    }
    for (const dial of R.DIALS) assert.ok(S.DIAL_LABELS[dial], dial);
    for (const v of R.NOTCHES.visibility) assert.ok(S.VISIBILITY[v], v);
    for (const v of R.NOTCHES.matters) assert.ok(S.MATTERS[v], v);
    for (const id of R.SITUATIONS) assert.ok(S.SITUATION_TEXT[id], id);
    for (const state of R.STATES) assert.ok(S.STATE_LABELS[state], state);
    for (const feel of R.FEELS) assert.ok(S.STEP.feels[feel] && S.STEP.feelsInLine[feel], feel);
    for (const reply of ['didntStay', 'hard', 'hardAgain', 'easy']) assert.ok(S.REPLIES[reply], reply);
  });

  it('the Friends and family button sets exactly the text the find-somewhere rule looks for (Q28)', () => {
    assert.equal(S.VENUE.friendsButton, R.FRIENDS_AND_FAMILY);
  });

  it('the floor step\'s Where in strings.js is the one the rules fill in (L47)', () => {
    assert.equal(S.SUGGEST.floorWhere, R.FLOOR_WHERE);
  });

  it('the timing passage is the one in Q77, 99 words', () => {
    assert.equal(R.countWords(S.TIMING.passage), 99);
  });
});

describe('Dates, rows and states (Q90)', () => {
  it('dates read "14 Nov 2026"', () => {
    assert.equal(F.formatDate('2026-11-14'), '14 Nov 2026');
    assert.equal(F.formatDate('2027-01-01'), '1 Jan 2027');
  });

  it('a step row: length and time, people, can see them, matters', () => {
    const floor = { words: 10, people: 0, visibility: 'notAtAll', matters: 'notMuch' };
    assert.equal(F.rowText(floor, pace), '10 words, 0:04 · alone · not at all · not much');
    assert.equal(F.rowText({ words: 1, people: 1, visibility: 'clearly', matters: 'aLot' }, pace), '1 word, 0:00 · 1 person · clearly · a lot');
    assert.equal(F.rowText({ words: 140, people: 12, visibility: null, matters: 'somewhat' }, pace), '140 words, 1:00 · 12 people · somewhat');
  });

  it('times on Add a step: the person\'s own, and the three paces on the line under it (Q17)', () => {
    assert.deepEqual(F.timesText(140, { choice: 'timed', wpm: 70 }), { own: '2:00 at your pace', three: 'slow 1:16, average 1:00, quick 0:49' });
  });

  it('states read as in L91', () => {
    assert.equal(F.stateText('didntStay'), 'didn\'t stay');
  });
});

describe('The progress line (L43, Q55)', () => {
  const person = (first, later, days) => {
    let p = {
      goalSituation: 'fiveMinutes',
      situations: R.SITUATIONS.map(id => ({ id, text: id, own: false })),
      ratingSets: [{ date: '2026-10-13', at: '2026-10-13T08:00:00.000Z', ratings: Object.fromEntries(R.SITUATIONS.map(id => [id, first])) }],
    };
    if (later !== undefined) {
      p = R.addCheckIn(p, Object.fromEntries(R.SITUATIONS.map(id => [id, later])), { now: '2026-12-10T08:00:00.000Z', today: R.addDays('2026-10-13', days) }).person;
    }
    return p;
  };

  it('before a check-in: only the start', () => {
    assert.equal(F.progressText(person(9)), 'Your goal felt like a 9 when you started.');
  });

  it('after one: the weeks in words, rounded down', () => {
    assert.equal(F.progressText(person(9, 5, 58)), 'Your goal felt like a 9 when you started. Eight weeks on, it\'s a 5.');
  });

  it('"an 8", and "one week"', () => {
    assert.equal(F.progressText(person(8, 8, 7)), 'Your goal felt like an 8 when you started. One week on, it\'s an 8.');
  });

  it('numbers in words, British style', () => {
    assert.deepEqual([4, 21, 40, 104, 120].map(F.numberWords), ['four', 'twenty-one', 'forty', 'one hundred and four', 'one hundred and twenty']);
  });
});

describe('The one-thing dialog lines (Q75)', () => {
  it('each kind of change', () => {
    assert.equal(F.changeText({ key: 'words', from: 25, to: 50 }), 'Length: 25 → 50 words');
    assert.equal(F.changeText({ key: 'people', from: 1, to: 3 }), 'People: 1 → 3');
    assert.equal(F.changeText({ key: 'visibility', from: 'partly', to: 'clearly' }), 'Can see them: partly → clearly');
    assert.equal(F.changeText({ key: 'matters', from: 'notMuch', to: 'somewhat' }), 'Matters: not much → somewhat');
    assert.equal(F.changeText({ key: 'knowEveryone', from: true, to: false }), 'I know everyone there: on → off');
    assert.equal(F.changeText({ key: 'microphone', from: false, to: true }), 'There\'s a microphone: off → on');
    assert.equal(F.changeText({ key: 'ownItem', from: 'glasses', to: 'new shoes' }), 'Something else: glasses → new shoes');
  });
});

describe('Turning one thing down (Q46, Q75, Q134, Q135)', () => {
  const step = { words: 50, people: 4, visibility: 'clearly', matters: 'somewhat', ownItem: ' new shoes ' };

  it('a dial, on the reply screen and in the make-it-smaller message', () => {
    assert.equal(F.undoText(R.turnDown(step, 'people'), step, { nextTime: true }), 'Next time, try turning People down: 4 → 3.');
    assert.equal(F.undoText(R.turnDown(step, 'words'), step), 'Try turning Length down: 50 → 25 words.');
    assert.equal(F.undoText(R.turnDown(step, 'visibility'), step), 'Try turning Can see them down: clearly → partly.');
  });

  it('a toggle or the own item, in the same words either way', () => {
    assert.equal(F.undoText(R.turnDown(step, 'standing'), step, { nextTime: true }), 'Try it sitting down.');
    assert.equal(F.undoText(R.turnDown(step, 'knowEveryone'), step), 'Try it with people you know.');
    assert.equal(F.undoText(R.turnDown(step, 'ownItem'), step), 'Try it without this: new shoes.');
  });

  it('the choices offered: dials by name, the rest by their switch-off wording', () => {
    assert.equal(F.turnDownChoice('matters', step), 'Matters');
    assert.equal(F.turnDownChoice('microphone', step), 'Try it without the microphone.');
  });

  it('"Last time" beside a suggestion (Q26)', () => {
    assert.equal(F.lastTimeText({ stayed: true, hardToStay: 7 }), 'Last time: 7 out of 10.');
    assert.equal(F.lastTimeText({ stayed: false, hardToStay: 7 }), 'Last time: didn\'t stay.');
  });
});
