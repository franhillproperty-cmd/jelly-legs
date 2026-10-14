// The Ladder (L88-L93): home. The goal and progress, the check-in when it's due, the
// notices, the steps, the earlier ladders, and Add a step / Suggest a step in a bar that
// never scrolls away. Once the goal step settles, Set a new goal takes Suggest's place.

import * as R from '../rules.js';
import { h, button, link, panel, notice, nextId, revealFirstError, ask } from '../ui.js';
import { LADDER, EXAMPLE_LADDER, SUGGEST, SIGNPOST, DIAL_LABELS, COMMON, QUIPS, SETUP } from '../strings.js';
import { rowText, stateText, formatDate, progressText, lastTimeText } from '../format.js';
import { now, today } from '../store.js';
import { sceneState } from '../scene.js';
import { createScene } from '../scene-draw.js';
import { ratingsList, signpost, goalPicker } from './parts.js';

// Where the jelly was the last time the Ladder was drawn, so that coming back after a step
// settles, it climbs from there rather than appearing at its new rung.
let shown = null;

export function ladderScreen(app) {
  const data = app.data();
  const { person } = data;
  const goal = person.situations.find(s => s.id === person.goalSituation);
  const on = R.notices(data);
  const order = R.ladderOrder(data.steps);
  const state = sceneState(data);
  const from = shown;
  const scene = createScene(from ?? state);
  shown = state;
  const complete = R.ladderComplete(data);
  const newLadder = app.flash.newLadder; // just back from Set a new goal
  delete app.flash.newLadder;
  const goalLine = h('p', { class: 'goal' }, goal.text);

  const notices = [
    on.tooBig ? notice(LADDER.notices.tooBig) : null,
    on.findSomewhere ? notice(h('p', {}, LADDER.notices.findSomewhere), link(LADDER.notices.findSomewhereLink, () => {
      app.flash.focusVenue = true; // Settings opens at the venue, once (Q51)
      app.go('settings');
    })) : null,
    on.friendsOnly ? notice(LADDER.notices.friendsOnly) : null,
  ].filter(Boolean);

  return {
    tabs: 'ladder',
    node: h('div', { class: 'ladder' },
      h('h1', {}, LADDER.heading),
      scene.element,
      h('p', { class: 'quip' }, QUIPS[state.quip]),
      goalLine,
      h('p', { class: 'progress' }, progressText(person)),
      h('p', { class: 'one-at-a-time' }, LADDER.oneAtATime), // always shown (Q146)
      R.checkInDue(person, today()) ? checkIn(app) : null,
      notices.length ? h('div', { class: 'notices' }, notices) : null,
      data.steps.length
        ? h('ol', { class: 'steps' }, [order.current, ...order.others].filter(Boolean).map(s => stepRow(app, s, { current: s === order.current })))
        : emptyLadder(person.pace),
      earlierLadders(app)),
    bar: h('div', { class: 'actionbar' },
      button(LADDER.addStep, () => addStep(app), { primary: true }),
      complete ? button(LADDER.setNewGoal, () => setNewGoal(app)) : button(LADDER.suggestStep, () => suggest(app))),
    // Two frames on, so the old place has been drawn and the move shows. After a new goal,
    // back to the top to watch the jelly come down, with the new goal read out.
    after: () => {
      if (newLadder) {
        window.scrollTo(0, 0);
        goalLine.tabIndex = -1;
        goalLine.focus({ preventScroll: true });
      }
      if (from) requestAnimationFrame(() => requestAnimationFrame(() => scene.update(state)));
    },
  };
}

// Add a step. With a step already on the go (planning, rehearsing or ready), ask first:
// the ladder works one step at a time (Q146). The step on the go is the one at the top of
// the Ladder. Dismissing the question stays on the Ladder.
async function addStep(app) {
  const onTheGo = R.ladderOrder(app.data().steps).current;
  if (onTheGo) {
    const choice = await ask({
      body: [LADDER.onTheGo(onTheGo.title)],
      buttons: [
        { label: LADDER.goToStep, value: 'step', primary: true, safe: true },
        { label: LADDER.addAnyway, value: 'add' },
      ],
      cancel: null,
    });
    if (choice === 'step') return app.go(`step/${onTheGo.id}`);
    if (choice !== 'add') return false;
  }
  return app.go('add');
}

// A row on the ladder, or on an earlier one, which always has the quiet look.
function stepRow(app, step, { current = false, earlier = false } = {}) {
  const quiet = earlier || step.state === 'settled' || step.state === 'didntStay';
  return h('li', { class: `step-row ${quiet ? 'quiet' : ''} ${current ? 'current' : ''}` },
    h('a', { href: `#/step/${step.id}` },
      h('span', { class: 'title' }, step.title),
      h('span', { class: 'values' }, rowText(step, app.data().person.pace)),
      step.when ? h('span', { class: 'date' }, formatDate(step.when)) : null,
      h('span', { class: `state state-${step.state}` }, stateText(step.state))));
}

// Before any step exists on this ladder: one sentence and the example ladder, as an
// illustration (L92, Q67, Q95).
function emptyLadder(pace) {
  return h('div', { class: 'empty' },
    h('p', {}, LADDER.empty),
    h('ol', { class: 'example' }, EXAMPLE_LADDER.map(s => h('li', {},
      h('span', { class: 'title' }, s.title),
      h('span', { class: 'values' }, rowText(s, pace))))));
}

// The ladders before this one, at the foot: newest ladder first, each under the goal it
// was climbing towards, its steps newest first. Each step opens read-only.
function earlierLadders(app) {
  const { person, earlierLadders: ladders } = app.data();
  if (!ladders.length) return null;
  const newestFirst = steps => [...steps].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return h('section', { class: 'earlier' },
    h('h2', {}, LADDER.earlier),
    [...ladders].reverse().map(ladder => h('div', { class: 'earlier-ladder' },
      h('h3', { class: 'earlier-goal' }, person.situations.find(s => s.id === ladder.goalSituation)?.text),
      ladder.steps.length ? h('ol', { class: 'steps' }, newestFirst(ladder.steps).map(s => stepRow(app, s, { earlier: true }))) : null)));
}

// Every 28 days: the situations again, saved as a dated set (L89, Q54).
function checkIn(app) {
  const ratings = {};
  const list = ratingsList({
    situations: app.data().person.situations,
    ratings,
    onRate: (id, n) => { ratings[id] = n; app.setDirty(true); },
  });
  const section = h('section', { class: 'checkin' },
    h('h2', {}, LADDER.checkInPrompt),
    list,
    button(COMMON.save, () => {
      const result = R.addCheckIn(app.data().person, ratings, { now: now(), today: today() });
      if (!result.ok) {
        list.markMissing();
        revealFirstError(section); // BUGS.md 4
        return;
      }
      app.setDirty(false);
      if (!app.save({ ...app.data(), person: result.person })) app.setDirty(true);
    }, { primary: true }));
  return section;
}

// Suggest a step (L47, L93, Q32-Q38): which dial, the suggestion with the silly-easy
// question, and what a "no" leads to. Nothing is saved until Save on Add a step.
async function suggest(app) {
  if (!(await app.canLeave())) return; // a half-done check-in (Q63)
  const data = app.data();
  const p = panel({ label: LADDER.suggestStep });
  const tooBig = R.notices(data).tooBigAttempt;
  const refused = [];

  const toForm = suggestion => {
    app.flash.prefill = suggestion;
    p.close();
    app.go('add?from=suggest');
  };

  const start = message => {
    const s = R.suggestStart(data, refused);
    if (s.kind === 'floor') return card(s.suggestion, null);
    if (s.kind === 'top') return p.fill(h('p', { class: 'lead' }, SUGGEST.top));
    if (s.kind === 'repeat') {
      return p.fill(message ? h('p', {}, message) : null, button(SUGGEST.repeat, () => toForm(s.suggestion), { primary: true }));
    }
    return p.fill(
      message ? h('p', {}, message) : null,
      h('h2', {}, SUGGEST.question),
      h('div', { class: 'stack' }, R.DIALS.map(dial => button(DIAL_LABELS[dial], () => card(R.suggestStep(data, dial), dial), {
        disabled: !s.dials.includes(dial) || s.refused.includes(dial),
      }))));
  };

  const card = (suggestion, dial) => p.fill(
    h('div', { class: 'card' }, h('p', { class: 'values' }, rowText(suggestion, data.person.pace))),
    tooBig ? h('p', { class: 'last-time' }, lastTimeText(tooBig)) : null, // L33
    h('h2', {}, SUGGEST.sillyEasy),
    h('div', { class: 'stack' },
      button(COMMON.yes, () => toForm(R.acceptSuggestion(suggestion)), { primary: true }),
      button(COMMON.no, () => {
        const smaller = R.smallerSuggestion(data, suggestion, dial ?? 'words');
        if (smaller.kind === 'floor') return p.fill(signpost(SIGNPOST.floor), button(COMMON.ok, p.close, { primary: true }));
        if (smaller.kind === 'nothingBetween') {
          refused.push(dial);
          return start(SUGGEST.nothingBetween(DIAL_LABELS[dial]));
        }
        return card(smaller.suggestion, dial);
      })));

  start();
}

// Set a new goal, once the goal step has settled: pick a situation or type one and rate
// it. Save starts a new, empty ladder; the old steps go to the earlier ladders. Typed
// words count as unsaved input, so Back asks first (Q63).
async function setNewGoal(app) {
  if (!(await app.canLeave())) return; // a half-done check-in (Q63)
  const p = panel({ label: LADDER.setNewGoal, canClose: app.canLeave });
  const headingId = nextId('new-goal');
  const picker = goalPicker({
    situations: app.data().person.situations, labelledBy: headingId, unpickOnType: true,
    onType: v => app.setDirty(!!v.trim()),
  });
  const save = () => {
    // The latest data, in case another copy of the app changed the ladder (Q119).
    if (!R.ladderComplete(app.data())) {
      p.close();
      app.render();
      return;
    }
    const result = R.startNewLadder(app.data(), picker.choice(), { now: now(), today: today() });
    if (!result.ok) {
      picker.showErrors(result.errors);
      revealFirstError(p.content); // BUGS.md 4
      return;
    }
    app.setDirty(false);
    app.flash.newLadder = true;
    if (!app.save(result.data)) {
      delete app.flash.newLadder;
      app.setDirty(!!picker.text());
      return;
    }
    p.close();
  };
  p.fill(
    h('h2', { id: headingId }, SETUP.goalLabel),
    picker,
    button(COMMON.save, save, { primary: true }));
}
