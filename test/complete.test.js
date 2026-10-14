// Unit tests for the ladder-complete stage: the goal step and the complete state, the rules
// that are off while it lasts, Set a new goal and earlier ladders, a goal typed in the
// person's own words (Q52 replaced), and reading version 1 and version 2 data.
// Run with `node --test`.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as R from '../public/rules.js';
import { sceneState } from '../public/scene.js';

const TODAY = '2026-10-14';
const at = n => new Date(Date.UTC(2026, 9, 14, 8, 0, 0) + n * 60000).toISOString();
const later = days => R.addDays(TODAY, days);
const OFF = { base: null, changes: [], warn: false };

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
    prepare(over = {}, opts = {}) {
      return R.prepareStep(data, draft(over), { now: w.now(), ...opts });
    },
    add(over = {}) {
      const p = w.prepare(over);
      assert.ok(p.ok, JSON.stringify(p.errors));
      data = R.commitStep(data, p);
      return p.step;
    },
    // Edit as the form does: the step's own values, some of them changed.
    edit(step, over) {
      const p = R.prepareStep(data, { ...w.step(step.id), ...over }, { now: w.now(), editingId: step.id });
      assert.ok(p.ok, JSON.stringify(p.errors));
      data = R.commitStep(data, p);
      return p;
    },
    log(step, input) {
      const r = R.logAttempt(data, step.id, { date: TODAY, rehearsedEnough: true, ...input }, { now: w.now(), today: TODAY });
      assert.ok(r.ok, JSON.stringify(r.errors));
      data = r.data;
      return r;
    },
    // A step settled on an easy first stay.
    settle(over = {}) {
      const step = w.add(over);
      w.log(step, { stayed: true, hardToStay: 1 });
      return w.step(step.id);
    },
    newLadder(choice, days = 0) {
      const r = R.startNewLadder(data, choice, { now: w.now(), today: later(days) });
      assert.ok(r.ok, JSON.stringify(r.errors));
      data = r.data;
      return r;
    },
  };
  return w;
}

// A ladder whose goal step has just settled: two known-people steps, each settled on an
// easy first stay, the second (one notch more words) marked as the goal.
function complete(personOver) {
  const w = world(personOver);
  const first = w.settle({ words: 25 });
  const goal = w.add({ words: 50, goal: true });
  const settling = w.log(goal, { stayed: true, hardToStay: 1 });
  assert.equal(R.ladderComplete(w.data), true);
  return { w, first, goal: w.step(goal.id), settling };
}

// The same data with no step marked: the rules as they would be if the ladder weren't complete.
const unmarked = d => ({ ...d, steps: d.steps.map(s => ({ ...s, goal: false })) });

// ================================================================ the goal step

describe('The goal step: the person marks it, and the ladder is complete when it settles', () => {
  it('goalStep finds the marked step, or null', () => {
    const w = world();
    w.add();
    assert.equal(R.goalStep(w.data.steps), null);
    const goal = w.add({ goal: true });
    assert.equal(R.goalStep(w.data.steps).id, goal.id);
  });

  it('not complete with no goal step, even with every step settled', () => {
    const w = world();
    w.settle();
    w.settle();
    assert.equal(R.ladderComplete(w.data), false);
  });

  it('not complete while the goal step is open; complete when it settles', () => {
    const w = world();
    const goal = w.add({ goal: true });
    assert.equal(R.ladderComplete(w.data), false);
    w.log(goal, { stayed: true, hardToStay: 5 });
    assert.equal(R.ladderComplete(w.data), false);
    w.log(goal, { stayed: false, hardToStay: 8 });
    assert.equal(R.ladderComplete(w.data), false);
    w.log(goal, { stayed: true, hardToStay: 2 });
    assert.equal(R.ladderComplete(w.data), true);
  });

  it("not complete while the goal step is only ready: run-throughs done, or a hard stay after a didn't stay", () => {
    const w = world();
    const goal = w.put(R.addRunThrough(w.add({ goal: true, rehearsalTarget: 1 })).step);
    assert.equal(goal.state, 'ready');
    assert.equal(R.ladderComplete(w.data), false);
    w.log(goal, { stayed: false, hardToStay: 8 });
    assert.equal(w.log(goal, { stayed: true, hardToStay: 6 }).completed, false);
    assert.equal(w.step(goal.id).state, 'ready');
    assert.equal(R.ladderComplete(w.data), false);
    assert.notEqual(sceneState(w.data).quip, 'complete');
  });

  it('not complete before Set-up', () => {
    const { w } = complete();
    assert.equal(R.ladderComplete({ ...w.data, person: null }), false);
  });

  it('new steps, blank drafts and suggestions start unmarked', () => {
    const w = world();
    assert.equal(R.blankDraft(w.data).draft.goal, false);
    assert.equal(R.suggestStart(w.data).suggestion.goal, false);
    assert.equal(w.settle().goal, false);
    assert.equal(R.suggestStep(w.data, 'words').goal, false);
    assert.equal(R.repeatSuggestion(w.data).goal, false);
    assert.equal(w.add({ goal: true }).goal, true);
  });
});

describe('Only one step is the goal: saving a marked step moves the mark', () => {
  const marked = w => w.data.steps.filter(s => s.goal).map(s => s.id);

  it('a new step marked as the goal takes the mark from the old one', () => {
    const w = world();
    const a = w.add({ goal: true });
    const b = w.add({ goal: true });
    assert.deepEqual(marked(w), [b.id]);
    w.edit(a, { goal: true });
    assert.deepEqual(marked(w), [a.id]);
  });

  it('saving an unmarked step leaves the mark where it is', () => {
    const w = world();
    const a = w.add({ goal: true });
    const b = w.add();
    w.edit(b, { title: 'Renamed' });
    assert.deepEqual(marked(w), [a.id]);
  });

  it('marking isn\'t a sizing change: the step keeps its state, so marking a settled step completes the ladder', () => {
    const w = world();
    const s = w.settle();
    assert.equal(R.sizingChanged(s, { ...s, goal: true }), false);
    const p = w.edit(s, { goal: true });
    assert.deepEqual([p.step.state, p.step.settledAt, p.step.goal], ['settled', s.settledAt, true]);
    assert.equal(R.ladderComplete(w.data), true);
  });
});

describe('Completion is worked out fresh, so it undoes itself', () => {
  it('deleting the attempt that settled the goal step', () => {
    const { w, settling } = complete();
    assert.equal(R.ladderComplete(R.deleteAttempt(w.data, settling.attempt.id)), false);
  });

  it('a dial edit of the goal step (it goes back to rehearsing), keeping the mark', () => {
    const { w, goal } = complete();
    const p = w.edit(goal, { words: 100 });
    assert.deepEqual([p.step.state, p.step.goal], ['rehearsing', true]);
    assert.equal(R.ladderComplete(w.data), false);
  });

  it('taking the mark off, or moving it to a step that isn\'t settled', () => {
    const off = complete();
    off.w.edit(off.goal, { goal: false });
    assert.equal(off.w.step(off.goal.id).state, 'settled');
    assert.equal(R.ladderComplete(off.w.data), false);

    const moved = complete();
    moved.w.add({ words: 100, goal: true });
    assert.equal(moved.w.step(moved.goal.id).goal, false);
    assert.equal(R.ladderComplete(moved.w.data), false);
  });

  it('a title-only edit of the goal step keeps it complete', () => {
    const { w, goal } = complete();
    w.edit(goal, { title: 'The wedding speech' });
    assert.equal(R.ladderComplete(w.data), true);
  });
});

describe('logAttempt says when an attempt completes the ladder', () => {
  it('only the attempt that settles the goal step', () => {
    const w = world();
    const other = w.add();
    assert.equal(w.log(other, { stayed: true, hardToStay: 1 }).completed, false);
    const goal = w.add({ words: 50, goal: true });
    assert.equal(w.log(goal, { stayed: true, hardToStay: 5 }).completed, false);
    assert.equal(w.log(goal, { stayed: true, hardToStay: 2 }).completed, true);
    assert.equal(w.log(goal, { stayed: true, hardToStay: 0 }).completed, false);
    assert.equal(w.log(goal, { stayed: false, hardToStay: 9 }).completed, false);
    assert.equal(w.step(goal.id).state, 'settled');
    assert.equal(w.log(w.add({ words: 100 }), { stayed: true, hardToStay: 1 }).completed, false);
  });

  it('settling it again after the settling attempt was deleted completes it again', () => {
    const { w, goal, settling } = complete();
    assert.equal(settling.completed, true);
    w.data = R.deleteAttempt(w.data, settling.attempt.id);
    assert.equal(w.log(goal, { stayed: true, hardToStay: 1 }).completed, true);
  });

  it('the reply and the advice are as they always are', () => {
    const { w } = complete();
    const extra = w.add({ words: 100 });
    const r = w.log(extra, { stayed: false, hardToStay: 9 });
    assert.equal(r.reply, 'didntStay');
    assert.deepEqual(r.advice, { kind: 'dial', dial: 'words', from: 100, to: 50 });
  });
});

// ================================================================ while complete

describe('While the ladder is complete, the too-big notice, the friends line and the one-thing warning are off', () => {
  it('too big stays off, even after a didn\'t stay on another step', () => {
    const { w } = complete();
    const extra = w.add({ words: 100 });
    w.log(extra, { stayed: false, hardToStay: 9 });
    const n = R.notices(w.data);
    assert.deepEqual([n.tooBig, n.tooBigAttempt], [false, null]);
    assert.equal(R.notices(unmarked(w.data)).tooBig, true);
  });

  it('too big stays off after a hard first stay on another step', () => {
    const { w } = complete();
    w.log(w.add({ words: 100 }), { stayed: true, hardToStay: 7 });
    assert.equal(R.notices(w.data).tooBig, false);
    assert.equal(R.notices(unmarked(w.data)).tooBig, true);
  });

  it('the friends line is off when its conditions are met', () => {
    const { w } = complete();
    assert.deepEqual(R.friendsLine(w.data), { on: false, rope: 2 });
    assert.equal(R.notices(w.data).friendsOnly, false);
    assert.equal(R.notices(unmarked(w.data)).friendsOnly, true);
  });

  it('the find-somewhere line stays on', () => {
    const { w } = complete({ venue: R.FRIENDS_AND_FAMILY });
    w.add({ words: 50, people: 6 });
    assert.equal(R.ladderComplete(w.data), true);
    assert.equal(R.notices(w.data).findSomewhere, true);
  });

  it('a no to a stranger step never gets keep-going: the friends line is off', () => {
    const { w } = complete();
    const stranger = { people: 2, toggles: [], words: 50, feelsEasy: false };
    assert.notEqual(R.planningAdvice(w.data, w.prepare(stranger).step).kind, 'keepGoing');
    assert.deepEqual(R.prepareStep(unmarked(w.data), draft(stranger), { now: w.now() }).advice, { kind: 'keepGoing' });
  });

  it('a no to the silly-easy question saves the step as rehearsing, with no make-it-smaller advice (BUGS.md 7)', () => {
    const { w } = complete();
    const no = { words: 100, feelsEasy: false };
    const p = w.prepare(no);
    assert.deepEqual([p.step.state, p.advice, p.step.feelsEasy], ['rehearsing', null, false]);
    // The same step on a ladder that isn't complete is planning, with the advice.
    const notComplete = R.prepareStep(unmarked(w.data), draft(no), { now: w.now() });
    assert.equal(notComplete.step.state, 'planning');
    assert.notEqual(notComplete.advice, null);
    // Saved, it can be rehearsed and logged like any other step.
    w.data = R.commitStep(w.data, p);
    const saved = w.step(p.step.id);
    assert.ok(R.allowedActions(saved).includes('runThrough'));
    assert.ok(R.allowedActions(saved).includes('logAttempt'));
    assert.equal(w.log(saved, { stayed: true, hardToStay: 1 }).ok, true);
  });

  it('a no on a resized edit is rehearsing too', () => {
    const { w } = complete();
    const other = w.add({ words: 25, people: 1 });
    const p = R.prepareStep(w.data, { ...w.step(other.id), words: 50, feelsEasy: false }, { now: w.now(), editingId: other.id });
    assert.deepEqual([p.step.state, p.advice], ['rehearsing', null]);
  });

  it('a step left planning from before the ladder was complete is rehearsing once saved again', () => {
    const w = world();
    const planning = w.add({ words: 25, feelsEasy: false });
    assert.equal(planning.state, 'planning');
    const goal = w.add({ words: 25, goal: true });
    w.log(goal, { stayed: true, hardToStay: 1 });
    assert.equal(R.ladderComplete(w.data), true);
    const p = w.edit(planning, { title: 'Two lines, again' });
    assert.equal(p.step.state, 'rehearsing');
    assert.equal(p.advice, null);
  });

  it('no one-thing warning while complete; the same change warns when it isn\'t', () => {
    const { w } = complete();
    const twoUp = { words: 100, people: 2 };
    assert.deepEqual(w.prepare(twoUp).oneThing, OFF);
    const notComplete = R.prepareStep(unmarked(w.data), draft(twoUp), { now: w.now() }).oneThing;
    assert.equal(notComplete.warn, true);
    assert.equal(notComplete.changes.length, 2);
  });

  it('"while complete" is judged before the save: resizing the goal step itself isn\'t checked', () => {
    const { w, goal } = complete();
    const resize = { ...goal, words: 200, people: 3 };
    const p = R.prepareStep(w.data, resize, { now: w.now(), editingId: goal.id });
    assert.deepEqual(p.oneThing, OFF);
    assert.equal(R.ladderComplete(R.commitStep(w.data, p)), false);
    assert.equal(R.prepareStep(unmarked(w.data), { ...resize, goal: false }, { now: w.now(), editingId: goal.id }).oneThing.warn, true);
  });

  it('the early-steps caution is unchanged', () => {
    const { w } = complete();
    assert.equal(w.prepare({ matters: 'aLot' }).earlyCaution, true);
  });
});

// ================================================================ a new ladder

describe('Set a new goal starts a new ladder', () => {
  it('only once the ladder is complete', () => {
    const w = world();
    const goal = w.add({ goal: true });
    assert.throws(() => R.startNewLadder(w.data, { situationId: 'toast' }, { now: w.now(), today: TODAY }));
    w.log(goal, { stayed: true, hardToStay: 1 });
    assert.equal(R.startNewLadder(w.data, { situationId: 'toast' }, { now: w.now(), today: TODAY }).ok, true);
  });

  it('the old steps move to the earlier ladders with the old goal and when it ended; the new ladder is empty; nothing else changes', () => {
    const { w } = complete();
    w.data = { ...w.data, breathing: [TODAY], backup: '{"old' };
    const before = w.data;
    const now = at(500);
    const r = R.startNewLadder(before, { situationId: 'toast' }, { now, today: TODAY });
    assert.deepEqual(r, {
      ok: true,
      data: {
        ...before,
        person: { ...before.person, goalSituation: 'toast' },
        steps: [],
        earlierLadders: [{ goalSituation: 'fiveMinutes', endedAt: now, steps: before.steps }],
      },
    });
    assert.equal(r.data.attempts, before.attempts);
    assert.equal(R.ladderComplete(r.data), false);
  });

  it('the earlier ladders are kept oldest first', () => {
    const { w } = complete();
    w.newLadder({ situationId: 'toast' });
    w.log(w.add({ goal: true }), { stayed: true, hardToStay: 1 });
    w.newLadder({ situationId: 'strangers' });
    assert.deepEqual(w.data.earlierLadders.map(l => l.goalSituation), ['fiveMinutes', 'toast']);
    assert.deepEqual(w.data.earlierLadders.map(l => l.steps.length), [2, 1]);
  });

  it('picking the same goal again is allowed', () => {
    const { w } = complete();
    w.newLadder({ situationId: 'fiveMinutes' });
    assert.equal(w.data.person.goalSituation, 'fiveMinutes');
    assert.deepEqual([w.data.steps.length, w.data.earlierLadders.length], [0, 1]);
  });

  it('a goal in the person\'s own words joins the situations with an added set of its own', () => {
    const { w } = complete();
    const before = w.data.person;
    const r = w.newLadder({ text: '  Best man speech ', rating: 8 }, 3);
    const { person } = r.data;
    const id = person.goalSituation;
    assert.match(id, /^own-[0-9a-f]{16}$/);
    assert.deepEqual(person.situations, [...before.situations, { id, text: 'Best man speech', own: true }]);
    assert.deepEqual(person.ratingSets, [...before.ratingSets, { date: later(3), at: r.data.earlierLadders[0].endedAt, ratings: { [id]: 8 }, added: true }]);
    assert.deepEqual(R.progress(person), { baseline: 8, latest: null, weeks: null });
  });

  it('typed words that match a listed situation pick it, with no rating needed and nothing added', () => {
    const { w } = complete();
    const before = w.data.person;
    w.newLadder({ text: ' TOAST ', rating: null });
    assert.deepEqual(w.data.person, { ...before, goalSituation: 'toast' });
  });

  it('nothing picked or typed, or typed words with no rating, are refused and change nothing', () => {
    const { w } = complete();
    const go = choice => R.startNewLadder(w.data, choice, { now: w.now(), today: TODAY });
    const none = { ok: false, errors: { goal: { kind: 'required' } } };
    for (const choice of [null, undefined, {}, { situationId: null, text: '   ' }, { text: '', rating: 5 }]) {
      assert.deepEqual(go(choice), none, JSON.stringify(choice));
    }
    for (const rating of [null, 11, -1, 2.5, '5']) {
      assert.deepEqual(go({ text: 'Best man speech', rating }), { ok: false, errors: { rating: { kind: 'required' } } }, String(rating));
    }
    assert.equal(R.ladderComplete(w.data), true);
  });

  it('the new ladder starts afresh: the floor, the early-steps caution, no one-thing base, no old notices', () => {
    const { w } = complete();
    w.settle({ words: 100 });
    w.log(w.add({ words: 200 }), { stayed: false, hardToStay: 9 });
    assert.equal(w.prepare({ matters: 'aLot' }).earlyCaution, false);
    w.newLadder({ situationId: 'toast' });
    assert.equal(R.suggestStart(w.data).kind, 'floor');
    assert.equal(w.prepare({ matters: 'aLot' }).earlyCaution, true);
    assert.deepEqual(w.prepare({ words: 1000, people: 500 }).oneThing, OFF);
    assert.deepEqual(R.notices(w.data), { tooBig: false, tooBigAttempt: null, findSomewhere: false, friendsOnly: false });
    assert.deepEqual(R.blankDraft(w.data).draft.toggles, []);
  });

  it('the old ladder\'s attempts don\'t reach the new ladder\'s notices', () => {
    const { w } = complete();
    w.log(w.add({ words: 100 }), { stayed: false, hardToStay: 9 });
    w.newLadder({ situationId: 'toast' });
    const first = w.add({ words: 10, people: 0, toggles: [], visibility: 'notAtAll' });
    assert.equal(R.notices(w.data).tooBig, false);
    w.log(first, { stayed: true, hardToStay: 1 });
    w.settle({ words: 10, people: 0, toggles: [], visibility: 'notAtAll' });
    assert.equal(R.notices(w.data).friendsOnly, false);
  });

  it('the plus two carries across ladders: it is about the person\'s rehearsal habit (Q133)', () => {
    const w = world();
    let goal = w.add({ goal: true });
    for (const answer of [null, 'same', 'same', 'same']) {
      const r = R.addRunThrough(goal);
      goal = w.put(r.ask ? R.recordFeel(r.step, answer) : r.step);
    }
    w.log(goal, { stayed: true, hardToStay: 1, rehearsedEnough: false });
    w.newLadder({ situationId: 'toast' });
    assert.deepEqual([R.blankDraft(w.data).draft.rehearsalTarget, R.blankDraft(w.data).targetHigher], [6, true]);
  });

  it('a picked situation wins over typed words sent with it: nothing is added', () => {
    const { w } = complete();
    const before = w.data.person;
    w.newLadder({ situationId: 'toast', text: 'Best man speech', rating: 8 });
    assert.deepEqual(w.data.person, { ...before, goalSituation: 'toast' });
  });

  it('the find-somewhere line looks only at the new ladder', () => {
    const { w } = complete({ venue: R.FRIENDS_AND_FAMILY });
    w.add({ words: 50, people: 6 });
    assert.equal(R.notices(w.data).findSomewhere, true);
    w.newLadder({ situationId: 'toast' });
    assert.equal(R.notices(w.data).findSomewhere, false);
    w.add({ words: 10, people: 6 });
    assert.equal(R.notices(w.data).findSomewhere, true);
  });

  it('deleting a step or an attempt on a finished ladder changes nothing (another copy of the app moved it there, Q119)', () => {
    const { w, goal, settling } = complete();
    w.newLadder({ situationId: 'toast' });
    const before = structuredClone(w.data);
    assert.deepEqual(R.deleteStep(w.data, goal.id), before);
    assert.deepEqual(R.deleteAttempt(w.data, settling.attempt.id), before);
    assert.deepEqual(R.deleteAttempt(w.data, 'missing'), before);
  });

  it('an earlier ladder\'s step can\'t be logged against', () => {
    const { w, goal } = complete();
    w.newLadder({ situationId: 'toast' });
    assert.throws(() => R.logAttempt(w.data, goal.id, { date: TODAY, stayed: true, hardToStay: 1, rehearsedEnough: true }, { now: w.now(), today: TODAY }));
  });
});

describe('Finding a step on this ladder or an earlier one', () => {
  it('says which, and the goal an earlier step was climbing towards', () => {
    const { w, goal } = complete();
    w.newLadder({ situationId: 'toast' });
    const now = w.add();
    assert.deepEqual(R.findStep(w.data, now.id), { step: now, earlier: false });
    assert.deepEqual(R.findStep(w.data, goal.id), { step: goal, earlier: true, goalSituation: 'fiveMinutes' });
    assert.equal(R.findStep(w.data, 'missing'), null);
  });
});

describe('The breathing nudge shows only before the first step on any ladder', () => {
  it('not on a new, empty ladder', () => {
    const { w } = complete();
    w.newLadder({ situationId: 'toast' });
    assert.equal(w.data.steps.length, 0);
    assert.equal(R.breathingNudge(w.data, TODAY), false);
    assert.equal(R.breathingNudge({ ...w.data, earlierLadders: [] }, TODAY), true);
  });
});

describe('The scene while complete and on a new ladder', () => {
  it('at the lectern with the complete quip; then back at the bottom, legs wobbling fully', () => {
    const { w } = complete();
    w.log(w.add({ words: 100 }), { stayed: false, hardToStay: 9 });
    const done = sceneState(w.data);
    assert.deepEqual([done.atTop, done.quip, done.wobble], [true, 'complete', 0]);
    w.newLadder({ situationId: 'toast' });
    const fresh = sceneState(w.data);
    assert.deepEqual([fresh.total, fresh.atTop, fresh.quip, fresh.wobble], [0, false, 'none', 1]);
    w.add();
    assert.deepEqual([sceneState(w.data).quip, sceneState(w.data).wobble], ['firstStep', 1]);
  });
});

// ================================================================ a goal typed in Settings

describe('A goal typed in Settings joins the situations and is rated there (Q52 replaced)', () => {
  const when = { now: at(50), today: later(10) };

  it('adds the situation and an added set holding its rating, and makes it the goal', () => {
    const person = makePerson();
    const r = R.addOwnGoal(person, '  Speaking at my sister\'s wedding  ', 7, when);
    assert.equal(r.ok, true);
    const id = r.situationId;
    assert.match(id, /^own-[0-9a-f]{16}$/);
    assert.deepEqual(r.person, {
      ...person,
      goalSituation: id,
      situations: [...person.situations, { id, text: 'Speaking at my sister\'s wedding', own: true }],
      ratingSets: [...person.ratingSets, { date: later(10), at: at(50), ratings: { [id]: 7 }, added: true }],
    });
  });

  it('a rating of 0 is a rating', () => {
    assert.equal(R.addOwnGoal(makePerson(), 'Best man speech', 0, when).ok, true);
  });

  it('words matching a situation already listed, ignoring capitals and end spaces, pick it; no rating needed', () => {
    const person = makePerson();
    assert.deepEqual(R.addOwnGoal(person, '  TOAST ', null, when), { ok: true, person: { ...person, goalSituation: 'toast' }, situationId: 'toast' });
    const own = R.addOwnGoal(person, 'Best man speech', 6, when);
    const again = R.addOwnGoal({ ...own.person, goalSituation: 'toast' }, 'best MAN speech', null, when);
    assert.equal(again.situationId, own.situationId);
    assert.deepEqual([again.person.situations.length, again.person.ratingSets.length], [own.person.situations.length, own.person.ratingSets.length]);
  });

  it("words that only contain a listed situation's words are a new situation, not that one", () => {
    const person = makePerson({ situations: R.SITUATIONS.map(id => ({ id, text: id === 'toast' ? 'Giving a toast' : id, own: false })) });
    const r = R.addOwnGoal(person, "Giving a toast at my sister's wedding", 6, { now: at(50), today: later(1) });
    assert.equal(r.ok, true);
    assert.notEqual(r.situationId, 'toast');
    assert.deepEqual(r.person.situations.at(-1), { id: r.situationId, text: "Giving a toast at my sister's wedding", own: true });
  });

  it('needs the words and a whole-number rating 0 to 10; both can be missing together', () => {
    const person = makePerson();
    const required = { kind: 'required' };
    assert.deepEqual(R.addOwnGoal(person, '', null, when), { ok: false, errors: { text: required, rating: required } });
    assert.deepEqual(R.addOwnGoal(person, '   ', 5, when), { ok: false, errors: { text: required } });
    for (const rating of [null, undefined, 11, -1, 2.5, '5']) {
      assert.deepEqual(R.addOwnGoal(person, 'Best man speech', rating, when), { ok: false, errors: { rating: required } }, String(rating));
    }
  });

  it('what it stores reads back', () => {
    const r = R.addOwnGoal(makePerson(), 'Best man speech', 7, when);
    const data = { ...R.emptyData(), person: r.person };
    assert.deepEqual(R.readFile(R.serialise(data, at(60))), { ok: true, data });
  });
});

describe('Added sets, the check-in clock and the progress line', () => {
  const rateAll = (person, n) => Object.fromEntries(person.situations.map(s => [s.id, n]));

  it('an added set doesn\'t move the check-in clock', () => {
    const person = R.addOwnGoal(makePerson(), 'Best man speech', 7, { now: at(50), today: later(20) }).person;
    assert.equal(R.checkInDue(person, later(27)), false);
    assert.equal(R.checkInDue(person, later(28)), true);
    const checked = R.addCheckIn(person, rateAll(person, 4), { now: at(60), today: later(30) }).person;
    assert.equal(R.checkInDue(checked, later(57)), false);
    assert.equal(R.checkInDue(checked, later(58)), true);
  });

  it('a check-in rates every situation, the added goal included, and isn\'t an added set', () => {
    const person = R.addOwnGoal(makePerson(), 'Best man speech', 7, { now: at(50), today: later(20) }).person;
    assert.equal(R.addCheckIn(person, makePerson().ratingSets[0].ratings, { now: at(60), today: later(30) }).ok, false);
    const set = R.addCheckIn(person, rateAll(person, 4), { now: at(60), today: later(30) }).person.ratingSets.at(-1);
    assert.equal(Object.hasOwn(set, 'added'), false);
    assert.equal(Object.keys(set.ratings).length, person.situations.length);
  });

  it('an added goal: its first rating is the baseline, and the weeks count from that rating', () => {
    let person = R.addOwnGoal(makePerson(), 'Best man speech', 7, { now: at(50), today: later(10) }).person;
    assert.deepEqual(R.progress(person), { baseline: 7, latest: null, weeks: null });
    person = R.addCheckIn(person, { ...rateAll(person, 5), [person.goalSituation]: 4 }, { now: at(60), today: later(40) }).person;
    assert.deepEqual(R.progress(person), { baseline: 7, latest: 4, weeks: 4 });
  });

  it('a goal typed in the week before a check-in is rated twice within the week: no latest until the next check-in, never zero weeks', () => {
    let person = R.addOwnGoal(makePerson(), 'Best man speech', 7, { now: at(50), today: later(27) }).person;
    assert.equal(R.checkInDue(person, later(28)), true);
    person = R.addCheckIn(person, { ...rateAll(person, 5), [person.goalSituation]: 3 }, { now: at(60), today: later(28) }).person;
    assert.deepEqual(R.progress(person), { baseline: 7, latest: null, weeks: null });
    person = R.addCheckIn(person, { ...rateAll(person, 5), [person.goalSituation]: 3 }, { now: at(61), today: later(33) }).person;
    assert.deepEqual(R.progress(person), { baseline: 7, latest: null, weeks: null }, 'six days on is still under a week');
    person = R.addCheckIn(person, { ...rateAll(person, 5), [person.goalSituation]: 2 }, { now: at(70), today: later(34) }).person;
    assert.deepEqual(R.progress(person), { baseline: 7, latest: 2, weeks: 1 }, 'seven days on is one week');
  });

  it('a check-in dated before the goal was typed (the phone\'s date went back): no latest, nothing negative', () => {
    let person = R.addOwnGoal(makePerson(), 'Best man speech', 8, { now: at(50), today: later(29) }).person;
    person = R.addCheckIn(person, rateAll(person, 8), { now: at(60), today: later(28) }).person;
    assert.deepEqual(R.progress(person), { baseline: 8, latest: null, weeks: null });
  });

  it('a Set-up goal is unchanged: Set-up\'s rating, the latest check-in, weeks from Set-up', () => {
    const setup = makePerson({ ratings: { fiveMinutes: 9 } });
    const added = R.addOwnGoal(setup, 'Best man speech', 7, { now: at(50), today: later(10) }).person;
    const back = R.setGoal(added, 'fiveMinutes');
    assert.deepEqual(R.progress(back), { baseline: 9, latest: null, weeks: null });
    const checked = R.addCheckIn(setup, { ...rateAll(setup, 5), fiveMinutes: 7 }, { now: at(60), today: later(28) }).person;
    const thenAdded = R.setGoal(R.addOwnGoal(checked, 'Best man speech', 3, { now: at(70), today: later(40) }).person, 'fiveMinutes');
    assert.deepEqual(R.progress(thenAdded), { baseline: 9, latest: 7, weeks: 4 });
  });
});

// ================================================================ reading and checking the data

describe('Version 2 data, and version 1 upgraded', () => {
  // Two ladders: the first complete and left behind, the second with a goal in the
  // person's own words, a settled step, a marked step, and a check-in after the added set.
  function twoLadders() {
    const { w } = complete();
    w.newLadder({ text: 'Best man speech', rating: 8 }, 2);
    const floor = { words: 10, people: 0, toggles: [], visibility: 'notAtAll' };
    w.settle(floor);
    w.add({ ...floor, words: 25, goal: true });
    const { person } = w.data;
    const checkIn = R.addCheckIn(person, Object.fromEntries(person.situations.map(s => [s.id, 4])), { now: w.now(), today: later(30) });
    w.data = { ...w.data, person: checkIn.person, breathing: [TODAY] };
    return w.data;
  }

  it('empty data has no earlier ladders, and reads back', () => {
    assert.deepEqual(R.emptyData().earlierLadders, []);
    assert.equal(R.readFile(R.serialise(R.emptyData(), at(1))).ok, true);
  });

  it('round-trips with earlier ladders, an attempt on an earlier step and an added set', () => {
    const data = twoLadders();
    const earlierIds = new Set(data.earlierLadders[0].steps.map(s => s.id));
    assert.ok(data.attempts.some(a => earlierIds.has(a.stepId)));
    assert.ok(data.person.ratingSets.some(set => set.added === true));
    const text = R.serialise(data, at(900));
    assert.equal(JSON.parse(text).schemaVersion, 2);
    assert.deepEqual(R.readFile(text), { ok: true, data });
    assert.deepEqual(R.readStored(text), { data, recovered: false });
  });

  it('a version 1 file is upgraded: every step unmarked (nothing else gets the field), no earlier ladders; saved again, it is version 2', () => {
    const w = world();
    w.settle();
    w.log(w.add({ words: 50 }), { stayed: true, hardToStay: 6 });
    const person = R.addCheckIn(w.data.person, w.data.person.ratingSets[0].ratings, { now: w.now(), today: later(28) }).person;
    const upgraded = { ...w.data, person };
    const { earlierLadders, ...v1 } = { ...upgraded, steps: upgraded.steps.map(({ goal, ...s }) => s) };
    assert.deepEqual(earlierLadders, []);
    const text = JSON.stringify({ app: R.APP_ID, schemaVersion: 1, savedAt: at(800), data: v1 });

    assert.deepEqual(R.readFile(text), { ok: true, data: upgraded });
    assert.deepEqual(R.readStored(text), { data: upgraded, recovered: false });
    const again = R.serialise(R.readFile(text).data, at(801));
    assert.equal(JSON.parse(again).schemaVersion, 2);
    assert.deepEqual(R.readFile(again), { ok: true, data: upgraded });
  });

  it('a broken version 1 file is still refused', () => {
    const w = world();
    w.settle();
    const { earlierLadders, ...v1 } = { ...w.data, steps: w.data.steps.map(({ goal, ...s }) => ({ ...s, title: ' ' })) };
    const r = R.readFile(JSON.stringify({ app: R.APP_ID, schemaVersion: 1, data: v1 }));
    assert.deepEqual([r.ok, r.reason, r.problem], [false, 'invalid', 'step.title']);
  });

  it('refuses broken version 2 data, all or nothing', () => {
    const added = d => d.person.ratingSets.find(set => set.added);
    const checkIn = d => d.person.ratingSets.at(-1);
    const ownId = d => d.person.goalSituation;
    const broken = {
      'two goal steps': [d => { d.steps.forEach(s => { s.goal = true; }); }, 'step.goal'],
      'two goal steps on an earlier ladder': [d => { d.earlierLadders[0].steps.forEach(s => { s.goal = true; }); }, 'step.goal'],
      'a step with no goal field': [d => { delete d.steps[0].goal; }, 'step.goal'],
      'goal not yes or no': [d => { d.steps[0].goal = 'yes'; }, 'step.goal'],
      'an attempt on an unknown step': [d => { d.attempts[0].stepId = 'missing'; }, 'attempt.stepId'],
      'a step id shared with an earlier ladder': [d => { d.steps[0].id = d.earlierLadders[0].steps[0].id; }, 'step.id'],
      'a step id shared between earlier ladders': [d => { d.earlierLadders.push(structuredClone(d.earlierLadders[0])); }, 'step.id'],
      'an earlier goal that isn\'t a situation': [d => { d.earlierLadders[0].goalSituation = 'missing'; }, 'earlierLadders'],
      'no earlier ladders field': [d => { delete d.earlierLadders; }, 'earlierLadders'],
      'earlier ladders not a list': [d => { d.earlierLadders = {}; }, 'earlierLadders'],
      'an end time with an offset': [d => { d.earlierLadders[0].endedAt = '2026-10-14T09:00:00.000+01:00'; }, 'earlierLadders'],
      'earlier steps not a list': [d => { d.earlierLadders[0].steps = null; }, 'earlierLadders'],
      'a broken step on an earlier ladder': [d => { d.earlierLadders[0].steps[0].state = 'done'; }, 'step.state'],
      'earlier ladders before Set-up': [d => { d.person = null; }, 'earlierLadders'],
      'the first set added': [d => { d.person.ratingSets[0].added = true; }, 'person.ratingSets'],
      'added: false': [d => { checkIn(d).added = false; }, 'person.ratingSets'],
      'added: "yes"': [d => { added(d).added = 'yes'; }, 'person.ratingSets'],
      'an added set rating a situation already rated': [d => { added(d).ratings.toast = 3; }, 'person.ratingSets'],
      'an added set rating nothing': [d => { d.person.ratingSets.push({ date: later(31), at: at(999), ratings: {}, added: true }); }, 'person.ratingSets'],
      'an added rating of 11': [d => { added(d).ratings[ownId(d)] = 11; }, 'person.ratingSets'],
      'a check-in missing the added goal': [d => { delete checkIn(d).ratings[ownId(d)]; }, 'person.ratingSets'],
      'a check-in missing a listed situation': [d => { delete checkIn(d).ratings.toast; }, 'person.ratingSets'],
      'a rating for a situation not on the list': [d => { checkIn(d).ratings.nope = 3; }, 'person.ratingSets'],
      'ratings not an object': [d => { checkIn(d).ratings = [4]; }, 'person.ratingSets'],
      'a set dated 30 February': [d => { d.person.ratingSets[0].date = '2026-02-30'; }, 'person.ratingSets'],
      'a set time with an offset': [d => { added(d).at = '2026-10-14T09:00:00.000+01:00'; }, 'person.ratingSets'],
      'a situation never rated': [d => { d.person.situations.push({ id: 'own-x', text: 'x', own: true }); }, 'person.ratingSets'],
    };
    const sound = twoLadders();
    assert.equal(R.readFile(R.serialise(sound, at(1))).ok, true);
    for (const [name, [damage, problem]] of Object.entries(broken)) {
      const d = structuredClone(sound);
      damage(d);
      assert.deepEqual(R.readFile(R.serialise(d, at(1))), { ok: false, reason: 'invalid', problem }, name);
    }
  });
});

// ================================================================ asking for the goal step

describe('The third step with no goal step asks once which is the goal (Q149)', () => {
  // Add a step as the form does, and say whether the question is due.
  const addAsking = (w, over = {}) => {
    const before = w.data;
    w.add(over);
    return R.goalStepAskDue(before, w.data);
  };

  it('asked on the third step, not the second or the fourth', () => {
    const w = world();
    assert.equal(addAsking(w), false);
    assert.equal(addAsking(w), false);
    assert.equal(addAsking(w), true);
    assert.equal(addAsking(w), false);
  });

  it('not when the third step is the goal step, or a goal step is already marked', () => {
    const first = world();
    addAsking(first);
    addAsking(first);
    assert.equal(addAsking(first, { goal: true }), false);
    const second = world();
    addAsking(second, { goal: true });
    addAsking(second);
    assert.equal(addAsking(second), false);
  });

  it('once per ladder: not again after a step is deleted and added back; again on a new ladder', () => {
    const w = world();
    addAsking(w);
    addAsking(w);
    assert.equal(addAsking(w), true);
    w.data = R.markGoalAskShown(w.data);
    w.data = R.deleteStep(w.data, w.data.steps.at(-1).id);
    assert.equal(addAsking(w), false);
    // Complete it, start a new ladder, and the question can come again.
    const goal = w.add({ goal: true });
    w.log(goal, { stayed: true, hardToStay: 1 });
    w.newLadder({ situationId: 'toast' });
    assert.equal(Object.hasOwn(w.data.person, 'goalAskShown'), false);
    addAsking(w);
    addAsking(w);
    assert.equal(addAsking(w), true);
  });

  it('the mark reads back, is optional, and must be yes or no', () => {
    const w = world();
    const asked = R.markGoalAskShown(w.data);
    assert.equal(R.readFile(R.serialise(asked, at(1))).ok, true);
    assert.equal(R.readFile(R.serialise(w.data, at(1))).ok, true);
    const wrong = { ...w.data, person: { ...w.data.person, goalAskShown: 'yes' } };
    assert.deepEqual(R.readFile(R.serialise(wrong, at(1))), { ok: false, reason: 'invalid', problem: 'person.flags' });
  });
});
