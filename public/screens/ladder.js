// The Ladder (L88-L93): home. The goal and progress, the check-in when it's due, the
// notices, the steps, and Add a step / Suggest a step in a bar that never scrolls away.

import * as R from '../rules.js';
import { h, button, link, panel, notice } from '../ui.js';
import { LADDER, EXAMPLE_LADDER, SUGGEST, SIGNPOST, DIAL_LABELS, COMMON } from '../strings.js';
import { rowText, stateText, formatDate, progressText, lastTimeText } from '../format.js';
import { now, today } from '../store.js';
import { ratingsList, signpost } from './parts.js';

export function ladderScreen(app) {
  const data = app.data();
  const { person } = data;
  const goal = person.situations.find(s => s.id === person.goalSituation);
  const on = R.notices(data);
  const order = R.ladderOrder(data.steps);

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
      h('p', { class: 'goal' }, goal.text),
      h('p', { class: 'progress' }, progressText(person)),
      R.checkInDue(person, today()) ? checkIn(app) : null,
      notices.length ? h('div', { class: 'notices' }, notices) : null,
      data.steps.length
        ? h('ol', { class: 'steps' }, [order.current, ...order.others].filter(Boolean).map(s => stepRow(app, s, s === order.current)))
        : emptyLadder(person.pace)),
    bar: h('div', { class: 'actionbar' },
      button(LADDER.addStep, () => app.go('add'), { primary: true }),
      button(LADDER.suggestStep, () => suggest(app))),
  };
}

function stepRow(app, step, isCurrent) {
  const quiet = step.state === 'settled' || step.state === 'didntStay';
  return h('li', { class: `step-row ${quiet ? 'quiet' : ''} ${isCurrent ? 'current' : ''}` },
    h('a', { href: `#/step/${step.id}` },
      h('span', { class: 'title' }, step.title),
      h('span', { class: 'values' }, rowText(step, app.data().person.pace)),
      step.when ? h('span', { class: 'date' }, formatDate(step.when)) : null,
      h('span', { class: `state state-${step.state}` }, stateText(step.state))));
}

// Before any step exists: one sentence and the example ladder, as an illustration (L92, Q67, Q95).
function emptyLadder(pace) {
  return h('div', { class: 'empty' },
    h('p', {}, LADDER.empty),
    h('ol', { class: 'example' }, EXAMPLE_LADDER.map(s => h('li', {},
      h('span', { class: 'title' }, s.title),
      h('span', { class: 'values' }, rowText(s, pace))))));
}

// Every 28 days: the situations again, saved as a dated set (L89, Q54).
function checkIn(app) {
  const ratings = {};
  const list = ratingsList({
    situations: app.data().person.situations,
    ratings,
    onRate: (id, n) => { ratings[id] = n; app.setDirty(true); },
  });
  return h('section', { class: 'checkin' },
    h('h2', {}, LADDER.checkInPrompt),
    list,
    button(COMMON.save, () => {
      const result = R.addCheckIn(app.data().person, ratings, { now: now(), today: today() });
      if (!result.ok) {
        list.markMissing()?.scrollIntoView({ block: 'center' });
        return;
      }
      app.setDirty(false);
      if (!app.save({ ...app.data(), person: result.person })) app.setDirty(true);
    }, { primary: true }));
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
