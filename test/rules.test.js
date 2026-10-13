// Unit tests for public/rules.js. Run with `node --test`.
// The first groups follow PLAN.md's unit-test checklist (Testing, L160-L168) in order;
// the rest cover the answers in QUESTIONS.md (Qn) that settled a gap.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as R from '../public/rules.js';

const TODAY = '2026-10-13';
const at = n => new Date(Date.UTC(2026, 9, 13, 8, 0, 0) + n * 60000).toISOString();

function makePerson(over = {}) {
  const { ratings = {}, ...rest } = over;
  return {
    venue: 'Leeds Toastmasters',
    town: 'Leeds',
    goalSituation: 'fiveMinutes',
    pace: { choice: 'average', wpm: 140 },
    situations: R.SITUATIONS.map(id => ({ id, text: id, own: false })),
    ratingSets: [{
      date: TODAY, at: at(0),
      ratings: { ...Object.fromEntries(R.SITUATIONS.map(id => [id, 5])), ...ratings },
    }],
    clarifying: null,
    signpostShown: false,
    welcomeSeen: true,
    setupDone: true,
    ...rest,
  };
}

function draft(over = {}) {
  return {
    title: 'Two lines', text: '', words: 25, people: 1, visibility: 'clearly', matters: 'notMuch',
    toggles: ['knowEveryone'], ownItem: '', where: 'Kitchen', when: null,
    whatsDifferent: 'Nothing I can think of', feelsEasy: true, distractor: 'the TV on',
    rehearsalTarget: 3, ...over,
  };
}

// A small world with its own clock, driven only through the public rules.
function world(personOver = {}) {
  let tick = 0;
  let data = { ...R.emptyData(), person: makePerson(personOver) };
  const w = {
    now: () => at(++tick),
    get data() { return data; },
    set data(d) { data = d; },
    step: id => data.steps.find(s => s.id === id),
    put(step) {
      data = { ...data, steps: data.steps.map(s => (s.id === step.id ? step : s)) };
      return step;
    },
    add(over = {}, opts = {}) {
      const p = R.prepareStep(data, draft(over), { now: w.now(), ...opts });
      assert.ok(p.ok, JSON.stringify(p.errors));
      data = R.commitStep(data, p);
      return p;
    },
    edit(step, over) {
      return R.prepareStep(data, draft(over), { now: w.now(), editingId: step.id });
    },
    log(step, input) {
      const r = R.logAttempt(data, step.id, { date: TODAY, rehearsedEnough: true, ...input }, { now: w.now(), today: TODAY });
      assert.ok(r.ok, JSON.stringify(r.errors));
      data = r.data;
      return r;
    },
    // Press +1 once per answer given (null for the first press, which asks nothing).
    rehearse(step, answers) {
      let s = w.step(step.id);
      for (const answer of answers) {
        const r = R.addRunThrough(s);
        s = r.ask ? R.recordFeel(r.step, answer) : r.step;
      }
      return w.put(s);
    },
    // A step settled on an easy first stay.
    settle(over = {}) {
      const p = w.add(over);
      w.log(p.step, { stayed: true, hardToStay: 1 });
      return w.step(p.step.id);
    },
  };
  return w;
}

// ================================================================ PLAN.md checklist

describe('Easy: a stay rated at or below the easy line settles the step, even on the first attempt', () => {
  it('settles on a first stay rated 2, and records when', () => {
    const w = world();
    const { step } = w.add();
    const r = w.log(step, { stayed: true, hardToStay: 2 });
    assert.equal(r.reply, 'easy');
    assert.equal(w.step(step.id).state, 'settled');
    assert.equal(w.step(step.id).settledAt, r.attempt.createdAt);
  });

  it('a stay rated 3 is above the line and does not settle', () => {
    const w = world();
    const { step } = w.add();
    w.log(step, { stayed: true, hardToStay: 3 });
    assert.equal(w.step(step.id).state, 'rehearsing');
  });

  it('a later easy stay keeps the moment the step first settled (Q1)', () => {
    const w = world();
    const x = w.settle({ words: 25 });
    const y = w.settle({ words: 50 });
    w.log(x, { stayed: true, hardToStay: 0 });
    assert.equal(w.step(x.id).settledAt, x.settledAt);
    assert.equal(R.lastSettledStep(w.data.steps).id, y.id);
  });
});

describe('Hard: a stay above the easy line keeps the step open; a second hard stay suggests a smaller step', () => {
  it('first hard stay: reply two, state unchanged, no smaller step', () => {
    const w = world();
    const { step } = w.add();
    const r = w.log(step, { stayed: true, hardToStay: 6 });
    assert.equal(r.reply, 'hard');
    assert.equal(r.advice, null);
    assert.equal(w.step(step.id).state, 'rehearsing');
  });

  it('second hard stay on the same step: reply three with a smaller step; state unchanged', () => {
    const w = world();
    w.settle({ people: 1 });
    const { step } = w.add({ people: 2 });
    w.log(step, { stayed: true, hardToStay: 6 });
    const r = w.log(step, { stayed: true, hardToStay: 5 });
    assert.equal(r.reply, 'hardAgain');
    assert.deepEqual(r.advice, { kind: 'dial', dial: 'people', from: 2, to: 1 });
    assert.equal(w.step(step.id).state, 'rehearsing');
  });

  it('a hard stay on a different step doesn\'t count', () => {
    const w = world();
    const a = w.add().step;
    w.log(a, { stayed: true, hardToStay: 6 });
    const b = w.add({ people: 2 }).step;
    const r = w.log(b, { stayed: true, hardToStay: 6 });
    assert.equal(r.reply, 'hard');
    assert.equal(r.advice, null);
  });

  it('third and later hard stays get reply three again (Q3)', () => {
    const w = world();
    const { step } = w.add();
    w.log(step, { stayed: true, hardToStay: 6 });
    w.log(step, { stayed: true, hardToStay: 6 });
    assert.equal(w.log(step, { stayed: true, hardToStay: 6 }).reply, 'hardAgain');
  });

  it('hard stays are counted since the step\'s last easy stay (Q3)', () => {
    const w = world();
    const { step } = w.add();
    w.log(step, { stayed: true, hardToStay: 6 });
    w.log(step, { stayed: true, hardToStay: 1 });
    assert.equal(w.log(step, { stayed: true, hardToStay: 6 }).reply, 'hard');
  });

  it('didn\'t stays neither count as hard stays nor reset the count (Q3)', () => {
    const w = world();
    const a = w.add().step;
    w.log(a, { stayed: false, hardToStay: 9 });
    assert.equal(w.log(a, { stayed: true, hardToStay: 6 }).reply, 'hard');
    const b = w.add().step;
    w.log(b, { stayed: true, hardToStay: 6 });
    w.log(b, { stayed: false, hardToStay: 9 });
    assert.equal(w.log(b, { stayed: true, hardToStay: 6 }).reply, 'hardAgain');
  });

  it('a hard repeat of a settled step leaves it settled (Q4)', () => {
    const w = world();
    const s = w.settle();
    w.log(s, { stayed: true, hardToStay: 6 });
    assert.equal(w.step(s.id).state, 'settled');
  });
});

describe('Matters a lot with fewer than three settled steps raises the early-steps caution', () => {
  const caution = (w, over = {}, opts = {}) => R.prepareStep(w.data, draft({ matters: 'aLot', ...over }), { now: w.now(), ...opts }).earlyCaution;

  it('raises it with none or two settled, not with three', () => {
    const w = world();
    assert.equal(caution(w), true);
    w.settle();
    w.settle();
    assert.equal(caution(w), true);
    w.settle();
    assert.equal(caution(w), false);
  });

  it('is not raised for "somewhat"', () => {
    assert.equal(caution(world(), { matters: 'somewhat' }), false);
  });

  it('counts settled steps, not all steps (Q19)', () => {
    const w = world();
    w.add();
    w.add();
    w.add();
    assert.equal(caution(w), true);
  });

  it('counts steps as they will be after the save: a title edit keeps a settled step counted, a dial edit doesn\'t (Q19)', () => {
    const w = world();
    w.settle();
    w.settle();
    const third = w.settle({ matters: 'aLot' });
    assert.equal(caution(w, { title: 'Renamed' }, { editingId: third.id }), false);
    assert.equal(caution(w, { words: 50 }, { editingId: third.id }), true);
  });
});

describe('The too-big notice: a hard first stay or a didn\'t stay turns it on; one easy stay turns it off', () => {
  it('a hard first stay turns it on, naming that attempt', () => {
    const w = world();
    const { step } = w.add();
    const r = w.log(step, { stayed: true, hardToStay: 7 });
    const n = R.notices(w.data);
    assert.equal(n.tooBig, true);
    assert.equal(n.tooBigAttempt.id, r.attempt.id);
  });

  it('a hard first stay on a later step, after other attempts, turns it on', () => {
    const w = world();
    w.settle();
    const { step } = w.add({ people: 2 });
    w.log(step, { stayed: true, hardToStay: 6 });
    assert.equal(R.notices(w.data).tooBig, true);
  });

  it('a didn\'t stay turns it on, whatever its rating (L29, Q22)', () => {
    const w = world();
    const { step } = w.add();
    const r = w.log(step, { stayed: false, hardToStay: 1 });
    assert.equal(r.reply, 'didntStay');
    assert.equal(w.step(step.id).state, 'didntStay');
    assert.equal(R.notices(w.data).tooBig, true);
  });

  it('one easy stay, on any step, turns it off; a stay rated exactly 2 is easy', () => {
    const w = world();
    const a = w.add().step;
    w.log(a, { stayed: true, hardToStay: 7 });
    const b = w.add().step;
    w.log(b, { stayed: true, hardToStay: 2 });
    assert.equal(R.notices(w.data).tooBig, false);
  });

  it('a second hard stay on the same step keeps it on (Q25)', () => {
    const w = world();
    const { step } = w.add();
    w.log(step, { stayed: true, hardToStay: 5 });
    w.log(step, { stayed: true, hardToStay: 4 });
    assert.equal(R.notices(w.data).tooBig, true);
  });

  it('a hard stay that is not a step\'s first stay does not turn it on', () => {
    const w = world();
    const { step } = w.add();
    w.log(step, { stayed: true, hardToStay: 1 });
    w.log(step, { stayed: true, hardToStay: 6 });
    assert.equal(R.notices(w.data).tooBig, false);
  });

  it('names the attempt that turned it on, not later ones (Q26)', () => {
    const w = world();
    const a = w.add().step;
    const first = w.log(a, { stayed: true, hardToStay: 4 });
    const b = w.add().step;
    w.log(b, { stayed: false, hardToStay: 8 });
    assert.equal(R.notices(w.data).tooBigAttempt.id, first.attempt.id);
  });

  it('after going off and coming back on, names the attempt that turned it back on (Q26)', () => {
    const w = world();
    const a = w.add().step;
    w.log(a, { stayed: true, hardToStay: 7 });
    w.log(a, { stayed: true, hardToStay: 1 });
    const b = w.add({ people: 2 }).step;
    const r = w.log(b, { stayed: false, hardToStay: 9 });
    assert.equal(R.notices(w.data).tooBigAttempt.id, r.attempt.id);
  });

  it('goes by the order attempts were logged, not the dates typed on them (Q1)', () => {
    const offFirst = world();
    const a = offFirst.add().step;
    offFirst.log(a, { stayed: true, hardToStay: 6 });
    const b = offFirst.add({ people: 2 }).step;
    offFirst.log(b, { stayed: true, hardToStay: 1, date: '2026-10-10' });
    assert.equal(R.notices(offFirst.data).tooBig, false);

    const onLast = world();
    const c = onLast.add().step;
    onLast.log(c, { stayed: true, hardToStay: 1 });
    const d = onLast.add({ people: 2 }).step;
    onLast.log(d, { stayed: true, hardToStay: 6, date: '2026-10-10' });
    assert.equal(R.notices(onLast.data).tooBig, true);
  });

  it('is worked out fresh: deleting the step that caused it turns it off (Q27)', () => {
    const w = world();
    const { step } = w.add();
    w.log(step, { stayed: false, hardToStay: 8 });
    assert.equal(R.notices(R.deleteStep(w.data, step.id)).tooBig, false);
  });
});

describe('Didn\'t stay sets the state and suggests one dial down, never two', () => {
  it('sets didn\'t stay and suggests the one dial that changed, one notch down', () => {
    const w = world();
    w.settle({ words: 100, people: 5 });
    const { step } = w.add({ words: 100, people: 10 });
    const r = w.log(step, { stayed: false, hardToStay: 9 });
    assert.equal(r.reply, 'didntStay');
    assert.equal(w.step(step.id).state, 'didntStay');
    assert.deepEqual(r.advice, { kind: 'dial', dial: 'people', from: 10, to: 5 });
  });

  it('never moves two dials or two notches', () => {
    const w = world();
    w.settle({ words: 25, people: 1 });
    const { step } = w.add({ words: 400, people: 1 });
    assert.deepEqual(w.log(step, { stayed: false, hardToStay: 9 }).advice,
      { kind: 'dial', dial: 'words', from: 400, to: 200 });
  });

  it('one stranger joining turns people down by one notch (Q5, Q11)', () => {
    const w = world();
    w.settle({ people: 3 });
    const { step } = w.add({ people: 4, toggles: [] });
    assert.deepEqual(w.log(step, { stayed: false, hardToStay: 9 }).advice, { kind: 'dial', dial: 'people', from: 4, to: 3 });
  });

  it('asks which dial when more than one changed, none did, or nothing is settled (Q5)', () => {
    const w = world();
    const first = w.add({ words: 50, people: 3 }).step;
    assert.deepEqual(w.log(first, { stayed: false, hardToStay: 9 }).advice,
      { kind: 'ask', options: ['words', 'people', 'visibility'] });
    w.settle({ words: 25, people: 1 });
    const two = w.add({ words: 50, people: 3 }).step;
    assert.equal(w.log(two, { stayed: false, hardToStay: 9 }).advice.kind, 'ask');
    const same = w.add({ words: 25, people: 1 }).step;
    assert.equal(w.log(same, { stayed: false, hardToStay: 9 }).advice.kind, 'ask');
    const toggleOnly = w.add({ toggles: ['knowEveryone', 'microphone'] }).step;
    assert.equal(w.log(toggleOnly, { stayed: false, hardToStay: 9 }).advice.kind, 'ask');
  });

  it('shows the floor signpost when the step is already the floor (Q5)', () => {
    const w = world();
    const { step } = w.add({ words: 10, people: 0, toggles: [] });
    assert.deepEqual(w.log(step, { stayed: false, hardToStay: 9 }).advice, { kind: 'floor' });
  });

  it('a didn\'t stay on a settled step leaves it settled and turns the notice on (Q4)', () => {
    const w = world();
    const s = w.settle();
    w.log(s, { stayed: false, hardToStay: 9 });
    assert.equal(w.step(s.id).state, 'settled');
    assert.equal(R.notices(w.data).tooBig, true);
  });

  it('on a didn\'t-stay step, a hard stay moves it to ready and an easy stay settles it (Q4)', () => {
    const w = world();
    const { step } = w.add();
    w.log(step, { stayed: false, hardToStay: 9 });
    w.log(step, { stayed: true, hardToStay: 6 });
    assert.equal(w.step(step.id).state, 'ready');
    w.log(step, { stayed: true, hardToStay: 2 });
    assert.equal(w.step(step.id).state, 'settled');
  });
});

describe('More than one thing changed since the last settled step, dials or toggles, raises the warning; one thing does not', () => {
  const check = (base, next) => {
    const w = world();
    w.settle(base);
    return R.prepareStep(w.data, draft(next), { now: w.now() }).oneThing;
  };
  const keys = r => r.changes.map(c => c.parts.map(p => p.key));

  it('two dials up: warns, naming both', () => {
    const r = check({ words: 25, people: 1 }, { words: 50, people: 2 });
    assert.equal(r.warn, true);
    assert.deepEqual(keys(r), [['words'], ['people']]);
  });

  it('one dial up: no warning', () => {
    assert.equal(check({ words: 25 }, { words: 50 }).warn, false);
  });

  it('a dial and a toggle: warns', () => {
    assert.equal(check({}, { words: 50, toggles: ['knowEveryone', 'microphone'] }).warn, true);
  });

  it('seeing more and mattering more each count; seeing less and mattering less don\'t (Q9)', () => {
    assert.deepEqual(keys(check({ visibility: 'partly', matters: 'notMuch' }, { visibility: 'clearly', matters: 'somewhat' })),
      [['visibility'], ['matters']]);
    assert.deepEqual(keys(check({ people: 10, visibility: 'clearly', matters: 'aLot' }, { people: 500, visibility: 'barely', matters: 'notMuch' })),
      [['people']]);
  });

  it('fewer words and more people is one change (Q9)', () => {
    const r = check({ words: 50, people: 3 }, { words: 25, people: 5 });
    assert.deepEqual(keys(r), [['people']]);
    assert.equal(r.warn, false);
  });

  it('words compare by nearest notch: 25 to 26 is none, 25 to 50 is one (Q9)', () => {
    assert.equal(check({ words: 25 }, { words: 26 }).changes.length, 0);
    assert.equal(check({ words: 25 }, { words: 50 }).changes.length, 1);
    assert.equal(R.nearestWordsNotch(37), 25);
    assert.equal(R.nearestWordsNotch(1500), 1000);
    assert.equal(R.nearestWordsNotch(75), 100); // halfway counts as the higher notch (Q131)
    assert.equal(check({ words: 50 }, { words: 75 }).changes.length, 1);
  });

  it('"I know everyone there" going off is harder; going on is not (Q9)', () => {
    assert.equal(check({ toggles: ['knowEveryone'] }, { toggles: [] }).changes.length, 1);
    assert.equal(check({ toggles: [] }, { toggles: ['knowEveryone'] }).changes.length, 0);
  });

  it('switching a toggle off is never a change (Q9)', () => {
    assert.equal(check({ toggles: ['knowEveryone', 'microphone'] }, { toggles: ['knowEveryone'] }).changes.length, 0);
  });

  it('one stranger joining (people up by one, "I know everyone there" off) is one change (Q11)', () => {
    const r = check({ people: 3, toggles: ['knowEveryone'] }, { people: 4, toggles: [] });
    assert.deepEqual(keys(r), [['people', 'knowEveryone']]);
    assert.equal(check({ people: 3, toggles: ['knowEveryone'] }, { people: 5, toggles: [] }).warn, true);
  });

  it('own item: non-blank and different is one change; capitals, end spaces and blanks are not (Q10)', () => {
    assert.equal(check({ ownItem: '' }, { ownItem: 'new shoes' }).changes.length, 1);
    assert.equal(check({ ownItem: 'new shoes' }, { ownItem: '  New Shoes ' }).changes.length, 0);
    assert.equal(check({ ownItem: 'new shoes' }, { ownItem: '' }).changes.length, 0);
    assert.equal(check({ ownItem: '' }, { ownItem: '' }).changes.length, 0);
  });

  it('leaving nobody-there behind is one change whatever "Can see them" is (Q8)', () => {
    const r = check({ people: 0, visibility: 'notAtAll', toggles: [] }, { people: 1, visibility: 'clearly', toggles: [] });
    assert.deepEqual(keys(r), [['people']]);
  });

  it('compares with the step settled most recently, not the one made most recently (Q1)', () => {
    const w = world();
    const older = w.add({ words: 100 }).step;
    const newer = w.add({ words: 25 }).step;
    w.log(newer, { stayed: true, hardToStay: 1 });
    w.log(older, { stayed: true, hardToStay: 1 });
    const r = R.prepareStep(w.data, draft({ words: 200 }), { now: w.now() }).oneThing;
    assert.equal(r.base.id, older.id);
  });

  it('an edit is compared with the last settled step other than itself; a title-only edit isn\'t checked (Q12)', () => {
    const w = world();
    const a = w.settle({ words: 25, people: 1 });
    const b = w.settle({ words: 25, people: 2 });
    const resized = w.edit(b, { words: 100, people: 3 });
    assert.equal(resized.oneThing.base.id, a.id);
    assert.equal(resized.oneThing.warn, true);
    const titleOnly = w.edit(b, { words: 25, people: 2, title: 'New name' });
    assert.deepEqual(titleOnly.oneThing, { base: null, changes: [], warn: false });
  });
});

describe('With no settled step yet, the first step raises no warning', () => {
  it('no warning, however big, while nothing is settled (Q12)', () => {
    const w = world();
    assert.equal(R.prepareStep(w.data, draft({ words: 1000, people: 500 }), { now: w.now() }).oneThing.warn, false);
    w.add();
    w.add();
    assert.equal(R.prepareStep(w.data, draft({ words: 1000, people: 500 }), { now: w.now() }).oneThing.warn, false);
  });
});

describe('Rehearsal count reaching the target marks the step ready; the count keeps going with no limit', () => {
  it('rehearsing below the target, ready at it, and counting on past it', () => {
    const w = world();
    let step = w.add({ rehearsalTarget: 3 }).step;
    step = w.rehearse(step, [null, 'easier']);
    assert.equal(step.state, 'rehearsing');
    step = w.rehearse(step, ['easier']);
    assert.equal(step.state, 'ready');
    step = w.rehearse(step, ['same', 'same']);
    assert.deepEqual([step.rehearsalCount, step.state], [5, 'ready']);
  });

  it('+1 past the target on a settled or didn\'t-stay step counts but never changes the state (Q40)', () => {
    const w = world();
    const s = w.rehearse(w.settle(), [null, 'same', 'same']);
    assert.deepEqual([s.rehearsalCount, s.state], [3, 'settled']);
    const d = w.add({ rehearsalTarget: 1 }).step;
    w.log(d, { stayed: false, hardToStay: 9 });
    assert.deepEqual([w.rehearse(d, [null, 'same']).state, w.step(d.id).rehearsalCount], ['didntStay', 2]);
  });

  it('+1 on a planning step does nothing (Q40)', () => {
    const planning = world().add({ feelsEasy: false }).step;
    assert.equal(R.addRunThrough(planning).step, planning);
  });

  it('the first +1 asks nothing; later ones ask how it felt (Q43)', () => {
    const first = R.addRunThrough(world().add().step);
    assert.equal(first.ask, false);
    assert.equal(R.addRunThrough(first.step).ask, true);
  });
});

describe('A rehearsed-enough answer of no starts the next step\'s run-throughs at last time\'s count plus two', () => {
  const needMore = () => {
    const w = world();
    const step = w.rehearse(w.add().step, [null, 'same', 'same', 'same']);
    w.log(step, { stayed: true, hardToStay: 5, rehearsedEnough: false });
    return w;
  };

  it('starts at the count plus two, once, on the next new step (Q44)', () => {
    const w = needMore();
    assert.equal(R.blankDraft(w.data).draft.rehearsalTarget, 6);
    assert.equal(R.blankDraft(w.data).targetHigher, true);
    w.add();
    assert.equal(R.blankDraft(w.data).draft.rehearsalTarget, 3);
    assert.equal(R.blankDraft(w.data).targetHigher, false);
  });

  it('never starts below 3, and says "higher" only when it is (Q44)', () => {
    const w = world();
    const { step } = w.add();
    w.log(step, { stayed: true, hardToStay: 5, rehearsedEnough: false });
    assert.deepEqual(R.startingTarget(w.data.attempts), { target: 3, higher: false, attemptId: w.data.attempts[0].id });
  });

  it('only the most recent attempt counts', () => {
    const w = needMore();
    w.log(w.data.steps[0], { stayed: true, hardToStay: 5, rehearsedEnough: true });
    assert.equal(R.startingTarget(w.data.attempts).target, 3);
  });

  it('still stands after that step\'s dials change: it is about rehearsal habit, not one step (Q133)', () => {
    const w = needMore();
    w.data = R.commitStep(w.data, w.edit(w.data.steps[0], { words: 50 }));
    assert.equal(R.blankDraft(w.data).draft.rehearsalTarget, 6);
  });

  it('an edit doesn\'t use it up (Q44)', () => {
    const w = needMore();
    const edit = w.edit(w.data.steps[0], { title: 'Edited' });
    w.data = R.commitStep(w.data, edit);
    assert.equal(R.blankDraft(w.data).draft.rehearsalTarget, 6);
  });

  it('deleting an attempt can\'t hand it out a second time (Q24, Q44)', () => {
    const w = needMore();
    const later = w.log(w.data.steps[0], { stayed: true, hardToStay: 5, rehearsedEnough: false });
    w.add();
    w.data = R.deleteAttempt(w.data, later.attempt.id);
    assert.equal(R.blankDraft(w.data).draft.rehearsalTarget, 3);
    assert.equal(R.blankDraft(w.data).targetHigher, false);
  });

  it('a suggestion starts at it too, and saving the suggestion uses it up (Q33)', () => {
    const w = needMore();
    w.log(w.data.steps[0], { stayed: true, hardToStay: 1, rehearsedEnough: false });
    const s = R.suggestStep(w.data, 'words');
    assert.equal(s.rehearsalTarget, 6);
    const p = R.prepareStep(w.data, { ...R.acceptSuggestion(s), title: 'More words', whatsDifferent: 'Longer' }, { now: w.now() });
    w.data = R.commitStep(w.data, p);
    assert.equal(R.blankDraft(w.data).draft.rehearsalTarget, 3);
  });

  it('the floor suggestion starts at it too (Q36)', () => {
    const w = needMore();
    assert.equal(R.suggestStart(w.data).suggestion.rehearsalTarget, 6);
  });
});

describe('Two about-the-same answers in a row produce the as-rehearsed-as-it-gets line; easier or harder clears it', () => {
  it('shows after same, same; clears on easier or harder', () => {
    let step = world().add().step;
    step = R.recordFeel(R.recordFeel(step, 'same'), 'same');
    assert.equal(R.asRehearsedAsItGets(step), true);
    assert.equal(R.asRehearsedAsItGets(R.recordFeel(step, 'easier')), false);
    assert.equal(R.asRehearsedAsItGets(R.recordFeel(step, 'harder')), false);
    assert.equal(R.asRehearsedAsItGets(R.recordFeel(R.recordFeel(world().add().step, 'same'), 'harder')), false);
  });
});

describe('A step with more than five people and no venue set turns the find-somewhere line on', () => {
  it('on with "Friends and family for now" and a 6-person step (Q28)', () => {
    const w = world({ venue: R.FRIENDS_AND_FAMILY });
    w.add({ people: 5 });
    assert.equal(R.notices(w.data).findSomewhere, false);
    const { step } = w.add({ people: 6 });
    assert.equal(R.notices(w.data).findSomewhere, true);
    assert.equal(R.notices(R.deleteStep(w.data, step.id)).findSomewhere, false);
  });

  it('matches ignoring capitals and end spaces; any other venue turns it off (Q28)', () => {
    const typed = world({ venue: '  friends and family for now ' });
    typed.add({ people: 10 });
    assert.equal(R.notices(typed.data).findSomewhere, true);
    const club = world({ venue: 'Leeds Toastmasters' });
    club.add({ people: 10 });
    assert.equal(R.notices(club.data).findSomewhere, false);
  });
});

describe('Friends only: two settled known-people steps on easy first stays turn the line on', () => {
  it('turns on after two, each settled on a first stay rated 2 or under', () => {
    const w = world();
    const a = w.add().step;
    w.log(a, { stayed: true, hardToStay: 2 });
    assert.equal(R.notices(w.data).friendsOnly, false);
    const b = w.add().step;
    w.log(b, { stayed: true, hardToStay: 2 });
    assert.equal(R.notices(w.data).friendsOnly, true);
  });

  it('a hard first stay on a known-people step keeps it off', () => {
    const w = world();
    w.settle();
    const { step } = w.add();
    w.log(step, { stayed: true, hardToStay: 5 });
    w.log(step, { stayed: true, hardToStay: 1 });
    assert.equal(R.notices(w.data).friendsOnly, false);
  });

  it('a step that settled after a didn\'t stay has no easy first stay (Q2)', () => {
    const w = world();
    w.settle();
    const { step } = w.add();
    w.log(step, { stayed: false, hardToStay: 1 });
    w.log(step, { stayed: true, hardToStay: 1 });
    assert.equal(w.step(step.id).state, 'settled');
    assert.equal(R.settledOnEasyFirstStay(w.step(step.id), w.data.attempts), false);
    assert.equal(R.notices(w.data).friendsOnly, false);
  });

  it('settling a step with the toggle off turns it off, and it can come back (Q30)', () => {
    const w = world();
    w.settle();
    w.settle();
    w.settle({ people: 2, toggles: [] });
    assert.equal(R.notices(w.data).friendsOnly, false);
    w.settle();
    w.settle();
    assert.equal(R.notices(w.data).friendsOnly, true);
  });

  it('steps with nobody there neither count nor clear it (Q8)', () => {
    const w = world();
    w.settle();
    w.settle({ people: 0, toggles: [] });
    assert.equal(R.notices(w.data).friendsOnly, false);
    w.settle();
    assert.equal(R.notices(w.data).friendsOnly, true);
    w.settle({ people: 0, toggles: [] });
    assert.equal(R.notices(w.data).friendsOnly, true);
  });

  it('goes by the order steps settled, not the order they were made (Q29)', () => {
    const w = world();
    const s1 = w.add().step;
    const s2 = w.add({ people: 2, toggles: [] }).step;
    const s3 = w.add().step;
    w.log(s2, { stayed: true, hardToStay: 1 });
    w.log(s1, { stayed: true, hardToStay: 1 });
    w.log(s3, { stayed: true, hardToStay: 1 });
    assert.equal(R.notices(w.data).friendsOnly, true);

    const v = world();
    const a = v.add().step;
    v.log(a, { stayed: true, hardToStay: 5 });
    v.settle();
    v.settle();
    v.log(a, { stayed: true, hardToStay: 1 }); // settles last, not on an easy first stay
    assert.equal(R.notices(v.data).friendsOnly, false);
  });
});

describe('A room-of-strangers rating of 7 or more at Set-up raises the friends rule\'s count to three', () => {
  it('needs three at 7, two at 6', () => {
    const high = world({ ratings: { strangers: 7 } });
    high.settle();
    high.settle();
    assert.equal(R.notices(high.data).friendsOnly, false);
    high.settle();
    assert.equal(R.notices(high.data).friendsOnly, true);
    assert.equal(R.ropeLength(makePerson({ ratings: { strangers: 6 } })), 2);
  });

  it('uses the Set-up rating, not a later check-in', () => {
    const person = makePerson({ ratings: { strangers: 8 } });
    const later = R.addCheckIn(person, { ...person.ratingSets[0].ratings, strangers: 3 }, { now: at(99), today: '2026-11-10' });
    assert.equal(R.ropeLength(later.person), 3);
  });
});

describe('Any 9 or 10 at Set-up asks the clarifying question; the second answer shows the signpost once, the first shows nothing', () => {
  const setup = (over = {}) => ({
    venue: 'Kitchen', town: '', pace: { choice: 'quick' },
    situations: R.SITUATIONS.map(id => ({ id, text: id, own: false })),
    ratings: Object.fromEntries(R.SITUATIONS.map(id => [id, 5])),
    goalSituation: 'strangers', ...over,
  });

  it('asks for a 9 or a 10, not an 8', () => {
    assert.equal(R.needsClarifying({ a: 8, b: 9 }), true);
    assert.equal(R.needsClarifying({ a: 10 }), true);
    assert.equal(R.needsClarifying({ a: 8, b: 0 }), false);
  });

  it('second answer: signpost, once ever; first answer: nothing', () => {
    assert.equal(R.clarifyingSignpost('bigger', false), true);
    assert.equal(R.clarifyingSignpost('bigger', true), false);
    assert.equal(R.clarifyingSignpost('discomfort', false), false);
  });

  it('Set-up can\'t be saved until it is answered, and the answer is stored (Q53)', () => {
    const nine = setup({ ratings: { ...setup().ratings, strangers: 9 } });
    assert.deepEqual(R.validateSetup(nine), { clarifying: { kind: 'required' } });
    assert.deepEqual(R.validateSetup({ ...nine, clarifying: 'bigger' }), {});
    const p = R.createPerson({ ...nine, clarifying: 'bigger', signpostShown: true }, { now: at(0), today: TODAY });
    assert.deepEqual([p.clarifying, p.signpostShown], ['bigger', true]);
    assert.equal(R.createPerson(setup({ clarifying: 'bigger' }), { now: at(0), today: TODAY }).clarifying, null);
  });

  it('a removed own situation\'s rating neither asks the question nor is stored (Q59)', () => {
    const draftSetup = setup({ ratings: { ...setup().ratings, own1: 10 } });
    assert.deepEqual(R.validateSetup(draftSetup), {});
    const p = R.createPerson(draftSetup, { now: at(0), today: TODAY });
    assert.equal(p.clarifying, null);
    assert.deepEqual(Object.keys(p.ratingSets[0].ratings), [...R.SITUATIONS]);
  });
});

describe('The check-in appears when the latest ratings are 28 days old; the progress line shows baseline and latest', () => {
  it('is due at 28 days, not 27', () => {
    const person = makePerson();
    assert.equal(R.checkInDue(person, R.addDays(TODAY, 27)), false);
    assert.equal(R.checkInDue(person, R.addDays(TODAY, 28)), true);
  });

  it('the progress line: baseline only before a check-in, then the latest, in whole weeks rounded down (Q55)', () => {
    let person = makePerson({ ratings: { fiveMinutes: 9 } });
    assert.deepEqual(R.progress(person), { baseline: 9, latest: null, weeks: null });
    const rate = n => ({ ...person.ratingSets[0].ratings, fiveMinutes: n });
    person = R.addCheckIn(person, rate(7), { now: at(9000), today: R.addDays(TODAY, 28) }).person;
    person = R.addCheckIn(person, rate(5), { now: at(9999), today: R.addDays(TODAY, 62) }).person;
    assert.deepEqual(R.progress(person), { baseline: 9, latest: 5, weeks: 8 });
    assert.equal(R.checkInDue(person, R.addDays(TODAY, 89)), false);
    assert.equal(R.checkInDue(person, R.addDays(TODAY, 90)), true);
  });

  it('a check-in needs every situation rated (Q54)', () => {
    assert.equal(R.addCheckIn(makePerson(), { strangers: 3 }, { now: at(1), today: TODAY }).ok, false);
  });
});

describe('Feels-easy answered no keeps the step in planning', () => {
  it('saves as planning, with one dial to turn down', () => {
    const w = world();
    w.settle({ words: 25 });
    const p = w.add({ words: 50, feelsEasy: false });
    assert.equal(p.step.state, 'planning');
    assert.deepEqual(p.advice, { kind: 'dial', dial: 'words', from: 50, to: 25 });
  });

  it('a no to the floor step shows the floor signpost (L35)', () => {
    const p = world().add({ words: 10, people: 0, toggles: [], feelsEasy: false });
    assert.deepEqual(p.advice, { kind: 'floor' });
  });

  it('a no to a stranger step while the friends line is on shows keep-going (Q31)', () => {
    const w = world();
    w.settle({ people: 3 });
    w.settle({ people: 3 });
    const p = w.add({ people: 4, toggles: [], feelsEasy: false });
    assert.equal(p.step.state, 'planning');
    assert.deepEqual(p.advice, { kind: 'keepGoing' });
  });

  it('keep-going needs both: the friends line on, and a stranger step (Q31)', () => {
    const off = world();
    off.settle({ people: 3 });
    assert.deepEqual(off.add({ people: 4, toggles: [], feelsEasy: false }).advice, { kind: 'dial', dial: 'people', from: 4, to: 3 });
    const on = world();
    on.settle();
    on.settle();
    assert.deepEqual(on.add({ words: 50, feelsEasy: false }).advice, { kind: 'dial', dial: 'words', from: 50, to: 25 });
  });
});

describe('Suggest a step from a settled step changes exactly one dial by exactly one notch, the one the person chose', () => {
  const differences = (a, b) => R.DIALS.filter(d => a[d] !== b[d]);

  it('for each dial', () => {
    const w = world();
    const base = w.settle({ words: 50, people: 3, visibility: 'barely', matters: 'notMuch' });
    const want = { words: 100, people: 5, visibility: 'partly', matters: 'somewhat' };
    for (const dial of R.DIALS) {
      const s = R.suggestStep(w.data, dial);
      assert.deepEqual(differences(base, s), [dial]);
      assert.equal(s[dial], want[dial]);
      assert.equal(s.suggested, true);
    }
  });

  it('starts from values between notches: 150 words goes to 200, 4 people to 5 (Q6)', () => {
    const w = world();
    w.settle({ words: 150, people: 4 });
    assert.equal(R.suggestStep(w.data, 'words').words, 200);
    assert.equal(R.suggestStep(w.data, 'people').people, 5);
  });

  it('copies toggles, own item, Where and distractor; title, text and date start empty (Q33)', () => {
    const w = world();
    w.settle({ toggles: ['knowEveryone', 'standing'], ownItem: 'new shoes', where: 'Chapel', distractor: 'radio' });
    const s = R.suggestStep(w.data, 'words');
    assert.deepEqual([s.toggles, s.ownItem, s.where, s.distractor], [['knowEveryone', 'standing'], 'new shoes', 'Chapel', 'radio']);
    assert.deepEqual([s.title, s.text, s.when, s.whatsDifferent, s.feelsEasy], ['', '', null, '', null]);
    assert.equal(R.acceptSuggestion(s).feelsEasy, true);
  });

  it('a step saved from a suggestion is flagged, and keeps the flag when a dial changes (L47, Q37)', () => {
    const w = world();
    w.settle();
    const s = R.acceptSuggestion(R.suggestStep(w.data, 'words'));
    const p = w.add({ ...s, title: 'More words', whatsDifferent: 'Longer' });
    assert.equal(p.step.suggested, true);
    assert.equal(w.edit(p.step, { words: 100 }).step.suggested, true);
    assert.equal(w.add().step.suggested, false);
  });

  it('from nobody to one person switches "I know everyone there" on and leaves "Can see them" to the person (Q8)', () => {
    const w = world();
    w.settle({ people: 0, toggles: [] });
    const s = R.suggestStep(w.data, 'people');
    assert.equal(s.people, 1);
    assert.deepEqual(s.toggles, ['knowEveryone']);
    assert.equal(s.visibility, null);
    assert.deepEqual(R.suggestStart(w.data).dials, ['words', 'people', 'matters']);
  });

  it('a dial at its top isn\'t offered; all at the top is the top of the ladder (Q6)', () => {
    const w = world();
    w.settle({ words: 1000, people: 500, visibility: 'clearly', matters: 'somewhat' });
    assert.deepEqual(R.suggestStart(w.data).dials, ['matters']);
    w.settle({ words: 1000, people: 500, visibility: 'clearly', matters: 'aLot' });
    assert.deepEqual(R.suggestStart(w.data), { kind: 'top' });
  });
});

describe('Suggest a step with no settled step returns ten words, nobody there, not much', () => {
  it('offers the floor straight away, without asking which dial (Q36)', () => {
    const start = R.suggestStart(world().data);
    assert.equal(start.kind, 'floor');
    const s = start.suggestion;
    assert.deepEqual([s.words, s.people, s.visibility, s.matters, s.toggles, s.ownItem],
      [10, 0, 'notAtAll', 'notMuch', [], '']);
    assert.equal(s.where, R.FLOOR_WHERE);
    assert.equal(R.isFloor(s), true);
  });
});

describe('No to a suggestion', () => {
  it('there is nothing between the settled step and one notch up, so that dial is greyed out (Q34)', () => {
    const w = world();
    w.settle({ words: 50 });
    const s = R.suggestStep(w.data, 'words');
    assert.deepEqual(R.smallerSuggestion(w.data, s, 'words'), { kind: 'nothingBetween', dial: 'words' });
    assert.deepEqual(R.suggestStart(w.data, ['words']).refused, ['words']);
  });

  it('a no on every dial offers the last step again (Q34)', () => {
    const w = world();
    const base = w.settle({ words: 50 });
    const start = R.suggestStart(w.data, [...R.DIALS]);
    assert.equal(start.kind, 'repeat');
    assert.deepEqual(R.DIALS.map(d => start.suggestion[d]), R.DIALS.map(d => base[d]));
  });

  it('a no to the floor step, with nothing settled, is the floor signpost (Q35)', () => {
    const w = world();
    const floor = R.suggestStart(w.data).suggestion;
    assert.deepEqual(R.smallerSuggestion(w.data, floor, 'words'), { kind: 'floor' });
  });
});

describe('The word counter counts a pasted text correctly and shows three times from the three pace constants', () => {
  it('counts words with odd spacing, line breaks, hyphens and dashes (Q124)', () => {
    assert.equal(R.countWords('  Hello,\n\n  world —   this\tis a well-known  test. '), 7);
    assert.equal(R.countWords(''), 0);
    assert.equal(R.countWords(' — – '), 0);
    assert.equal(R.countWords(Array(650).fill('word').join(' \n ')), 650);
  });

  it('shows the person\'s own time and the three, as minutes and seconds (Q17)', () => {
    const t = R.speakingTimes(140, { choice: 'timed', wpm: 70 });
    assert.deepEqual(t, { own: 120, slow: 76, average: 60, quick: 49 });
    assert.equal(R.formatDuration(R.secondsToSay(10, 140)), '0:04');
    assert.equal(R.formatDuration(278), '4:38');
  });

  it('a slow, average or quick choice follows the constants (Q56)', () => {
    assert.equal(R.paceWpm({ choice: 'slow', wpm: 999 }), R.PACE.slow);
    assert.equal(R.paceWpm({ choice: 'timed', wpm: 123 }), 123);
  });
});

describe('Timing the sample passage sets pace to its word count divided by the minutes taken', () => {
  it('99 words in 45 seconds is 132 words a minute; in 47 seconds, rounded, 126 (Q56)', () => {
    assert.deepEqual(R.timedPace(99, 45000), { wpm: 132, ok: true });
    assert.deepEqual(R.timedPace(99, 47000), { wpm: 126, ok: true });
  });

  it('accepts 60 to 300 inclusive, refuses outside (Q56)', () => {
    assert.equal(R.timedPace(60, 60000).ok, true);
    assert.equal(R.timedPace(300, 60000).ok, true);
    assert.equal(R.timedPace(59, 60000).ok, false);
    assert.equal(R.timedPace(301, 60000).ok, false);
    assert.equal(R.timedPace(99, 0).ok, false);
  });
});

describe('Mark ready now before the count: yes marks ready and sets readyEarly, no leaves the step rehearsing', () => {
  it('yes and no', () => {
    const step = R.addRunThrough(world().add({ rehearsalTarget: 3 }).step).step;
    const yes = R.markReadyNow(step, true);
    assert.deepEqual([yes.state, yes.readyEarly, yes.readyEarlyCount, yes.readyEarlyTarget], ['ready', true, 1, 3]);
    assert.equal(R.markReadyNow(step, false), step);
  });

  it('is offered only on a rehearsing step below its target (Q41)', () => {
    const w = world();
    assert.equal(R.canMarkReadyNow(w.add().step), true);
    assert.equal(R.canMarkReadyNow(w.settle()), false);
    assert.equal(R.canMarkReadyNow(w.add({ feelsEasy: false }).step), false);
  });
});

describe('Import rejects a file with an unknown schema version', () => {
  // A phone with everything on it, built only through the rules.
  function fullData() {
    const setup = {
      venue: 'Leeds Toastmasters', town: 'Leeds', pace: { choice: 'timed', wpm: 123 }, goalSituation: 'own1',
      situations: [...R.SITUATIONS.map(id => ({ id, text: id, own: false })), { id: 'own1', text: 'My sister\'s wedding', own: true }],
      ratings: { ...Object.fromEntries(R.SITUATIONS.map(id => [id, 5])), strangers: 7, own1: 9 },
      clarifying: 'discomfort', signpostShown: false,
    };
    assert.deepEqual(R.validateSetup(setup), {});
    const w = world();
    w.data = { ...w.data, person: R.createPerson(setup, { now: at(0), today: TODAY }) };
    const early = w.rehearse(w.add({ rehearsalTarget: 4 }).step, [null, 'same']);
    w.put(R.markReadyNow(early, true));
    w.log(early, { stayed: true, hardToStay: 4, rehearsedEnough: false, wentWrong: 'Lost my place' });
    w.settle({ people: 0, toggles: [], visibility: 'notAtAll' });
    const resized = w.settle({ suggested: true });
    w.data = R.commitStep(w.data, w.edit(resized, { words: 50 }));
    w.data = { ...w.data, breathing: [R.addDays(TODAY, -1), TODAY], backup: '{"old', person: R.addCheckIn(w.data.person, w.data.person.ratingSets[0].ratings, { now: at(500), today: R.addDays(TODAY, 30) }).person };
    return w.data;
  }

  it('refuses version 2', () => {
    const text = JSON.stringify({ app: R.APP_ID, schemaVersion: 2, data: fullData() });
    assert.deepEqual(R.readFile(text), { ok: false, reason: 'unknownVersion' });
  });

  it('round-trips a full export, and a phone with no Set-up yet; stored data reads back as it was', () => {
    const data = fullData();
    const file = R.exportFile(data, { now: at(900), today: TODAY });
    assert.equal(file.filename, 'jelly-legs-2026-10-13.json');
    assert.deepEqual(R.readFile(file.text), { ok: true, data });
    assert.deepEqual(R.readStored(R.serialise(data, at(901))), { data, recovered: false });
    assert.equal(R.readFile(R.serialise(R.emptyData(), at(1))).ok, true);
  });

  it('refuses a file that isn\'t JSON, or is JSON from another app (L193)', () => {
    assert.equal(R.readFile('not json {').reason, 'notJson');
    assert.equal(R.readFile(JSON.stringify({ name: 'other app', schemaVersion: 1 })).reason, 'notJellyLegs');
    assert.equal(R.readFile('[1,2,3]').reason, 'notJellyLegs');
  });

  it('refuses a Jelly Legs file with any broken record, all or nothing (Q107)', () => {
    const settledIndex = d => d.steps.findIndex(s => s.state === 'settled');
    const broken = {
      'person not an object': d => { d.person = 'nope'; },
      'goal not a situation': d => { d.person.goalSituation = 'missing'; },
      'flag not yes or no': d => { d.person.signpostShown = 'yes'; },
      'a listed situation missing': d => { d.person.situations = d.person.situations.filter(s => s.id !== 'strangers'); },
      'a rating of 11': d => { d.person.ratingSets[0].ratings.strangers = 11; },
      'settled with no settledAt': d => { d.steps[settledIndex(d)].settledAt = null; },
      'unknown state': d => { d.steps[0].state = 'done'; },
      'unknown toggle': d => { d.steps[0].toggles = ['flying']; },
      'nobody there but seen clearly': d => { d.steps[0].people = 0; d.steps[0].visibility = 'clearly'; },
      'duplicate step id': d => { d.steps[1].id = d.steps[0].id; },
      'duplicate attempt id': d => { d.attempts[1].id = d.attempts[0].id; },
      'attempt for a missing step': d => { d.attempts[0].stepId = 'missing'; },
      'attempt rated 11': d => { d.attempts[0].hardToStay = 11; },
      'attempt flag not yes or no': d => { d.attempts[0].boostUsed = 'no'; },
      'timestamp "1"': d => { d.steps[0].createdAt = '1'; },
      'timestamp with an offset': d => { d.steps[0].createdAt = '2026-10-13T09:00:00.000+01:00'; },
      'resizedAt missing': d => { delete d.steps[0].resizedAt; },
      'breathing date 30 Feb': d => { d.breathing = ['2026-02-30']; },
      'breathing date twice': d => { d.breathing = [TODAY, TODAY]; },
      'backup not text': d => { d.backup = 42; },
    };
    for (const [name, damage] of Object.entries(broken)) {
      const d = structuredClone(fullData());
      damage(d);
      assert.equal(R.readFile(R.serialise(d, at(1))).reason, 'invalid', name);
    }
  });

  it('unreadable stored data starts fresh and keeps the old text aside (Q108)', () => {
    assert.deepEqual(R.readStored(null), { data: R.emptyData(), recovered: false });
    const r = R.readStored('{"half a save');
    assert.equal(r.recovered, true);
    assert.equal(r.data.backup, '{"half a save');
    assert.equal(R.readFile(R.serialise(r.data, at(1))).ok, true);
  });
});

// ================================================================ answers in QUESTIONS.md

describe('Editing a step (Q14, Q15, Q42, Q45)', () => {
  // A settled step with two run-throughs, an answer, and marked ready early.
  function historied() {
    const w = world();
    const step = w.rehearse(w.add({ rehearsalTarget: 5 }).step, [null, 'same']);
    w.put(R.markReadyNow(step, true));
    w.log(step, { stayed: true, hardToStay: 1 });
    return { w, step: w.step(step.id) };
  }

  it('a title-only edit keeps the state, the count, the answers and ready-early', () => {
    const { w, step } = historied();
    const s = w.edit(step, { title: 'Better title', rehearsalTarget: 5 }).step;
    assert.deepEqual([s.state, s.settledAt, s.rehearsalCount, s.rehearsalFeel, s.readyEarly],
      ['settled', step.settledAt, 2, ['same'], true]);
  });

  it('a dial edit makes it a fresh step to size and rehearse; attempts stay', () => {
    const { w, step } = historied();
    const p = w.edit(step, { words: 50, rehearsalTarget: 5 });
    const s = p.step;
    assert.deepEqual([s.state, s.settledAt, s.rehearsalCount, s.rehearsalFeel, s.readyEarly, s.readyEarlyCount],
      ['rehearsing', null, 0, [], false, null]);
    assert.ok(s.resizedAt);
    assert.equal(R.commitStep(w.data, p).attempts.length, 1);
  });

  it('a distractor-only edit keeps the count, the answers and the state (Q45)', () => {
    const w = world();
    const step = w.rehearse(w.add().step, [null, 'harder']);
    const s = w.edit(step, { distractor: 'a talk radio station' }).step;
    assert.deepEqual([s.rehearsalCount, s.rehearsalFeel, s.state], [2, ['harder'], 'rehearsing']);
    assert.equal(R.sizingChanged(draft(), draft({ distractor: 'a talk radio station' })), false);
  });

  it('without a dial or toggle change the silly-easy answer can\'t move a planning step', () => {
    const w = world();
    const { step } = w.add({ feelsEasy: false });
    assert.equal(w.edit(step, { feelsEasy: true, title: 'x' }).step.state, 'planning');
    assert.equal(w.edit(step, { words: 10, feelsEasy: true }).step.state, 'rehearsing');
  });

  it('a toggle or own-item change counts as a sizing change; a title change doesn\'t (Q14)', () => {
    const s = draft();
    assert.equal(R.sizingChanged(s, { ...s, toggles: ['knowEveryone', 'microphone'] }), true);
    assert.equal(R.sizingChanged(s, { ...s, ownItem: 'glasses' }), true);
    assert.equal(R.sizingChanged(s, { ...s, title: 'other' }), false);
  });

  it('lowering the target to the count makes a rehearsing step ready; raising it never takes ready away (Q42)', () => {
    const w = world();
    const step = w.rehearse(w.add({ rehearsalTarget: 5 }).step, [null, 'same']);
    assert.equal(w.edit(step, { rehearsalTarget: 2 }).step.state, 'ready');
    const ready = w.rehearse(w.add({ rehearsalTarget: 3 }).step, [null, 'same', 'same']);
    const raised = w.edit(ready, { rehearsalTarget: 10 }).step;
    assert.equal(raised.state, 'ready');
    assert.equal(R.canMarkReadyNow(raised), false);
  });
});

describe('Starting values on a blank Add a step (Q16)', () => {
  it('toggles and own item from the last settled step, distractor from the most recent, Where from the venue', () => {
    const w = world();
    w.settle({ toggles: ['knowEveryone', 'standing'], ownItem: 'glasses', distractor: 'radio' });
    w.add({ distractor: 'music with lyrics' });
    const { draft: d } = R.blankDraft(w.data);
    assert.deepEqual(d.toggles, ['knowEveryone', 'standing']);
    assert.equal(d.ownItem, 'glasses');
    assert.equal(d.distractor, 'music with lyrics');
    assert.equal(d.where, 'Leeds Toastmasters');
    assert.deepEqual([d.words, d.people, d.visibility, d.matters, d.feelsEasy], [null, null, null, null, null]);
  });
});

describe('When no dial can go down, switch off a toggle or the own item (Q129)', () => {
  const bottom = { words: 10, people: 0, visibility: 'notAtAll', matters: 'notMuch', toggles: [] };

  it('"10 words, alone, standing up" gets standing switched off, not the signpost', () => {
    const w = world();
    w.settle(bottom);
    const p = w.add({ ...bottom, toggles: ['standing'], feelsEasy: false });
    assert.deepEqual(p.advice, { kind: 'switchOff', key: 'standing' });
  });

  it('the own item that differs, after a didn\'t stay', () => {
    const w = world();
    w.settle(bottom);
    const { step } = w.add({ ...bottom, ownItem: 'new shoes' });
    assert.deepEqual(w.log(step, { stayed: false, hardToStay: 9 }).advice, { kind: 'switchOff', key: 'ownItem' });
  });

  it('the one that differs, even with others on', () => {
    const w = world();
    w.settle({ ...bottom, toggles: ['standing'] });
    const p = w.add({ ...bottom, toggles: ['standing', 'microphone'], feelsEasy: false });
    assert.deepEqual(p.advice, { kind: 'switchOff', key: 'microphone' });
  });

  it('the person picks when none or several differ, or nothing is settled', () => {
    const w = world();
    const first = w.add({ ...bottom, toggles: ['questions', 'fromMemory'], feelsEasy: false });
    assert.deepEqual(first.advice, { kind: 'askSwitchOff', options: ['fromMemory', 'questions'] });
    w.settle({ ...bottom, toggles: ['standing'] });
    const two = w.add({ ...bottom, toggles: ['standing', 'microphone', 'recorded'], ownItem: 'glasses', feelsEasy: false });
    assert.deepEqual(two.advice, { kind: 'askSwitchOff', options: ['standing', 'microphone', 'recorded', 'ownItem'] });
    w.settle({ ...bottom, toggles: ['standing', 'microphone'] });
    const none = w.add({ ...bottom, toggles: ['standing', 'microphone'], feelsEasy: false });
    assert.deepEqual(none.advice, { kind: 'askSwitchOff', options: ['standing', 'microphone'] });
  });

  it('only one thing on: that one, whether or not anything is settled', () => {
    const p = world().add({ ...bottom, toggles: ['fromMemory'], feelsEasy: false });
    assert.deepEqual(p.advice, { kind: 'switchOff', key: 'fromMemory' });
  });

  it('never leaves the person an empty choice', () => {
    for (const key of [...R.TOGGLES.filter(k => k !== 'knowEveryone'), 'ownItem']) {
      const step = { id: 'x', ...bottom, toggles: key === 'ownItem' ? [] : [key], ownItem: key === 'ownItem' ? 'hat' : '' };
      assert.deepEqual(R.turnDownAdvice([], step), { kind: 'switchOff', key }, key);
    }
  });
});

describe('After the dials change, earlier attempts are history only (Q130)', () => {
  it('the first hard stay at the new size gets reply two, not three', () => {
    const w = world();
    w.settle({ people: 1 });
    const { step } = w.add({ people: 2 });
    w.log(step, { stayed: true, hardToStay: 6 });
    w.log(step, { stayed: true, hardToStay: 6 });
    w.data = R.commitStep(w.data, w.edit(step, { people: 1, words: 10 }));
    const r = w.log(step, { stayed: true, hardToStay: 6 });
    assert.equal(r.reply, 'hard');
    assert.equal(r.advice, null);
  });

  it('the first stay at the new size decides the too-big notice', () => {
    const w = world();
    const s = w.settle();
    w.data = R.commitStep(w.data, w.edit(s, { words: 50 }));
    w.log(s, { stayed: true, hardToStay: 7 });
    assert.equal(R.notices(w.data).tooBig, true);
  });

  it('a didn\'t stay from before the change no longer keeps the notice on', () => {
    const w = world();
    const { step } = w.add({ words: 50 });
    w.log(step, { stayed: false, hardToStay: 9 });
    assert.equal(R.notices(w.data).tooBig, true);
    w.data = R.commitStep(w.data, w.edit(step, { words: 25 }));
    assert.equal(R.notices(w.data).tooBig, false);
  });

  it('a step settled again after a hard first stay at its new size doesn\'t count for the friends line', () => {
    const w = world();
    w.settle();
    const b = w.settle();
    assert.equal(R.notices(w.data).friendsOnly, true);
    w.data = R.commitStep(w.data, w.edit(b, { words: 50 }));
    w.log(b, { stayed: true, hardToStay: 5 });
    w.log(b, { stayed: true, hardToStay: 1 });
    assert.equal(w.step(b.id).state, 'settled');
    assert.equal(R.settledOnEasyFirstStay(w.step(b.id), w.data.attempts), false);
    assert.equal(R.notices(w.data).friendsOnly, false);
  });

  it('the old attempts are kept for the Step screen', () => {
    const w = world();
    const s = w.settle();
    w.data = R.commitStep(w.data, w.edit(s, { words: 50 }));
    w.log(s, { stayed: true, hardToStay: 4 });
    assert.equal(w.data.attempts.length, 2);
    assert.equal(R.currentAttempts(w.step(s.id), w.data.attempts).length, 1);
    assert.equal(R.firstAttempt(w.step(s.id), w.data.attempts).hardToStay, 4);
  });
});

describe('The floor and the notches (Q6, Q7)', () => {
  const floor = { words: 10, people: 0, visibility: 'notAtAll', matters: 'notMuch', toggles: [], ownItem: '' };

  it('the floor is 10 words or fewer, nobody, not seen, not much, no toggles, own item blank', () => {
    assert.equal(R.isFloor(floor), true);
    assert.equal(R.isFloor({ ...floor, words: 5 }), true);
    assert.equal(R.isFloor({ ...floor, words: 11 }), false);
    assert.equal(R.isFloor({ ...floor, toggles: ['recorded'] }), false);
    assert.equal(R.isFloor({ ...floor, ownItem: 'new shoes' }), false);
    assert.equal(R.isFloor({ ...floor, matters: 'somewhat' }), false);
  });

  it('one notch down from on and between notches; nothing below the bottom', () => {
    assert.equal(R.notchDown('words', 150), 100);
    assert.equal(R.notchDown('words', 10), null);
    assert.equal(R.notchDown('people', 4), 3);
    assert.equal(R.notchDown('people', 60), 50);
    assert.equal(R.notchDown('people', 0), null);
    assert.equal(R.notchDown('visibility', 'barely'), 'notAtAll');
    assert.equal(R.notchUp('matters', 'aLot'), null);
  });
});

describe('Field limits (Q48, Q122, Q123)', () => {
  it('blank title, zero words, negative people, target 0, decimals', () => {
    const e = R.prepareStep(world().data, draft({ title: '   ', words: 0, people: -1, rehearsalTarget: 0 }), { now: at(1) }).errors;
    assert.deepEqual(Object.keys(e).sort(), ['people', 'rehearsalTarget', 'title', 'words']);
    assert.deepEqual(e.words, { kind: 'range', min: 1 });
    const d = R.prepareStep(world().data, draft({ words: 2.5 }), { now: at(1) }).errors;
    assert.deepEqual(d.words, { kind: 'range', min: 1 });
  });

  it('a target of 999 is fine; nobody there is fine and fixes "Can see them"', () => {
    const p = R.prepareStep(world().data, draft({ rehearsalTarget: 999, people: 0, visibility: 'clearly' }), { now: at(1) });
    assert.equal(p.ok, true);
    assert.equal(p.step.visibility, 'notAtAll');
  });

  it('a rating of 11, of -1, of nothing; a date in the future', () => {
    const v = input => R.validateAttempt({ date: TODAY, stayed: true, rehearsedEnough: true, ...input }, TODAY);
    assert.equal(v({ hardToStay: 11 }).hardToStay.kind, 'range');
    assert.equal(v({ hardToStay: -1 }).hardToStay.kind, 'range');
    assert.equal(v({ hardToStay: null }).hardToStay.kind, 'required');
    assert.deepEqual(v({ hardToStay: 0 }), {});
    assert.equal(v({ hardToStay: 3, date: '2026-10-14' }).date.kind, 'future');
  });
});

describe('Correcting mistakes (Q24, Q125)', () => {
  it('deleting the latest attempt puts the step back as it was', () => {
    const w = world();
    const { step } = w.add();
    const r = w.log(step, { stayed: false, hardToStay: 9 });
    const after = R.deleteAttempt(w.data, r.attempt.id);
    assert.equal(after.steps[0].state, 'rehearsing');
    assert.equal(R.notices(after).tooBig, false);
  });

  it('deleting the easy stay that settled a step un-settles it, even with a later attempt', () => {
    const w = world();
    const { step } = w.add();
    const easy = w.log(step, { stayed: true, hardToStay: 1 });
    w.log(step, { stayed: true, hardToStay: 6 });
    const after = R.deleteAttempt(w.data, easy.attempt.id);
    assert.deepEqual([after.steps[0].state, after.steps[0].settledAt], ['rehearsing', null]);
  });

  it('deleting a mis-tapped didn\'t stay works the step out again from what\'s left', () => {
    const w = world();
    const { step } = w.add();
    const tap = w.log(step, { stayed: false, hardToStay: 9 });
    w.log(step, { stayed: true, hardToStay: 6 });
    assert.equal(w.step(step.id).state, 'ready');
    const after = R.deleteAttempt(w.data, tap.attempt.id);
    assert.equal(after.steps[0].state, 'rehearsing');
    assert.equal(R.deleteAttempt(after, after.attempts[0].id).steps[0].state, 'rehearsing');
  });

  it('deleting an older attempt that changed nothing leaves the state alone', () => {
    const w = world();
    const { step } = w.add();
    const first = w.log(step, { stayed: true, hardToStay: 6 });
    w.log(step, { stayed: true, hardToStay: 1 });
    assert.equal(R.deleteAttempt(w.data, first.attempt.id).steps[0].state, 'settled');
  });

  it('a step left rehearsing at or past its target, or marked ready early, comes back ready', () => {
    const w = world();
    const step = w.rehearse(w.add({ rehearsalTarget: 2 }).step, [null, 'same']);
    const r = w.log(step, { stayed: false, hardToStay: 9 });
    assert.equal(R.deleteAttempt(w.data, r.attempt.id).steps[0].state, 'ready');
  });

  it('attempts from before a resize no longer shape the state', () => {
    const w = world();
    const s = w.settle();
    const old = w.data.attempts[0];
    w.data = R.commitStep(w.data, w.edit(s, { words: 50, feelsEasy: false }));
    const after = R.deleteAttempt(w.data, old.id);
    assert.equal(after.steps[0].state, 'planning');
    assert.equal(after.attempts.length, 0);
  });

  it('"undo that +1" puts back the count, the answer and the state, within 60 seconds', () => {
    const w = world();
    const step = w.rehearse(w.add({ rehearsalTarget: 3 }).step, [null, 'easier']);
    const press = R.addRunThrough(step);
    const pressed = R.recordFeel(press.step, 'same');
    assert.equal(pressed.state, 'ready');
    assert.deepEqual(R.undoRunThrough(pressed, press.press), step);

    const fresh = w.add().step;
    const first = R.addRunThrough(fresh);
    assert.deepEqual(R.undoRunThrough(first.step, first.press), fresh);

    const settled = w.settle();
    const later = R.addRunThrough(settled);
    assert.deepEqual(R.undoRunThrough(later.step, later.press), settled);

    assert.equal(R.canUndoRunThrough(0, 59999), true);
    assert.equal(R.canUndoRunThrough(0, 60000), false);
  });

  it('today can be un-ticked, and only today; a second tick the same day changes nothing', () => {
    const once = R.tickToday([R.addDays(TODAY, -1)], TODAY);
    assert.deepEqual(once, { breathing: [R.addDays(TODAY, -1), TODAY], already: false });
    assert.deepEqual(R.tickToday(once.breathing, TODAY), { breathing: once.breathing, already: true });
    assert.deepEqual(R.untickToday(once.breathing, TODAY), [R.addDays(TODAY, -1)]);
  });
});

describe('Breathe (L86, Q18)', () => {
  it('the strip is the last seven local days, today at the right end', () => {
    const days = R.lastSevenDays(['2026-10-07', '2026-10-13', '2026-10-06'], TODAY);
    assert.deepEqual(days.map(d => d.date), ['2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10', '2026-10-11', '2026-10-12', '2026-10-13']);
    assert.deepEqual(days.map(d => d.ticked), [true, false, false, false, false, false, true]);
    assert.equal(R.breathingCount(['2026-10-01'], TODAY), 0);
  });

  it('the encouragement line for 0, 1 to 6 and 7', () => {
    assert.deepEqual([0, 1, 6, 7].map(R.encouragement), ['none', 'some', 'some', 'all']);
  });

  it('the week-of-breathing line shows only before the first step, under 7 days', () => {
    const w = world();
    const week = Array.from({ length: 7 }, (_, i) => R.addDays(TODAY, -i));
    assert.equal(R.breathingNudge(w.data, TODAY), true);
    assert.equal(R.breathingNudge({ ...w.data, breathing: week.slice(0, 6) }, TODAY), true);
    assert.equal(R.breathingNudge({ ...w.data, breathing: week }, TODAY), false);
    w.add();
    assert.equal(R.breathingNudge(w.data, TODAY), false);
  });
});

describe('The Ladder and the Step screen (L91, L101, Q40)', () => {
  it('the step being worked on is the newest one planning, rehearsing or ready; the rest follow newest first', () => {
    const w = world();
    const a = w.add().step;
    const b = w.add({ feelsEasy: false }).step;
    const c = w.settle();
    const d = w.add().step;
    w.log(d, { stayed: false, hardToStay: 9 });
    const order = R.ladderOrder(w.data.steps);
    assert.equal(order.current.id, b.id);
    assert.deepEqual(order.others.map(s => s.id), [d.id, c.id, a.id]);
  });

  it('planning steps can only be edited or deleted', () => {
    const w = world();
    assert.deepEqual(R.allowedActions(w.add({ feelsEasy: false }).step), ['edit', 'delete']);
    assert.deepEqual(R.allowedActions(w.add().step), ['runThrough', 'logAttempt', 'edit', 'delete', 'markReadyNow']);
  });

  it('deleting a step takes its attempts and nothing else', () => {
    const w = world();
    const a = w.settle();
    const b = w.settle();
    const after = R.deleteStep(w.data, a.id);
    assert.deepEqual(after.steps.map(s => s.id), [b.id]);
    assert.deepEqual(after.attempts.map(x => x.stepId), [b.id]);
  });

  it('logging needs a step that isn\'t planning', () => {
    const w = world();
    const { step } = w.add({ feelsEasy: false });
    assert.throws(() => R.logAttempt(w.data, step.id, { date: TODAY, stayed: true, hardToStay: 1, rehearsedEnough: true }, { now: at(5), today: TODAY }));
  });
});

describe('Small wording helpers (Q57, Q85)', () => {
  it('venue searches put the town in place of "near me"', () => {
    assert.equal(R.searchQuery('Toastmasters near me', ' Leeds '), 'Toastmasters near Leeds');
    assert.equal(R.searchQuery("speakers' clubs near me", ''), "speakers' clubs near me");
    assert.equal(R.searchUrl('Toastmasters near Leeds'), 'https://www.google.com/search?q=Toastmasters%20near%20Leeds');
  });

  it('the counter drops a trailing "on" from the distractor', () => {
    assert.equal(R.distractorForCounter('the TV on'), 'the TV');
    assert.equal(R.distractorForCounter('music with lyrics'), 'music with lyrics');
  });
});

describe('Set-up and the goal (L81, Q52, Q59)', () => {
  it('needs a venue, a pace, every listed situation rated and a goal', () => {
    const e = R.validateSetup({
      venue: ' ', pace: { choice: 'timed', wpm: 20 },
      situations: [{ id: 'strangers', text: 'x', own: false }, { id: 'own1', text: '', own: true }],
      ratings: { strangers: 4 }, goalSituation: 'nope',
    });
    assert.deepEqual(Object.keys(e).sort(), ['goal', 'pace', 'ratings', 'situations', 'venue']);
  });

  it('every listed situation is required, even when everything shown is rated', () => {
    const e = R.validateSetup({
      venue: 'Kitchen', pace: { choice: 'average' },
      situations: [{ id: 'toast', text: 'toast', own: false }],
      ratings: { toast: 4 }, goalSituation: 'toast',
    });
    assert.deepEqual(e, { ratings: { kind: 'required' } });
  });

  it('the goal can only be changed to a situation already rated', () => {
    const person = makePerson();
    assert.equal(R.setGoal(person, 'toast').goalSituation, 'toast');
    assert.throws(() => R.setGoal(person, 'something new'));
  });
});
