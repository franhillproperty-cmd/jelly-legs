// Welcome (L74-L76) and Set-up (L77-L83): shown once, the first time the app is opened.

import * as R from '../rules.js';
import { h, paragraphs, textField, choices, button, link, fill, nextId } from '../ui.js';
import { APP_NAME, TAGLINE, WELCOME, SETUP, SITUATION_TEXT, CLARIFYING, SIGNPOST, COMMON } from '../strings.js';
import { now, today } from '../store.js';
import { venueField, paceField, ratingsList, signpost, importData } from './parts.js';

// Shown once; after Set-up it is reached only from Settings, with a back control and no
// Get started (Q64).
export function welcomeScreen(app) {
  const again = !!app.data().person;
  return {
    back: again ? 'settings' : null,
    node: h('div', { class: 'welcome' },
      h('h1', {}, APP_NAME),
      h('p', { class: 'tagline' }, TAGLINE),
      paragraphs(WELCOME.paragraphs),
      again ? null : h('div', { class: 'actions' },
        button(WELCOME.getStarted, () => app.go('setup'), { primary: true }),
        link(WELCOME.importLink, () => importData(app)))),
  };
}

function newDraft() {
  return {
    venue: '', town: '', pace: null,
    situations: R.SITUATIONS.map(id => ({ id, text: SITUATION_TEXT[id], own: false })),
    ratings: {}, goalSituation: null, clarifying: null, signpostShown: false,
  };
}

export function setupScreen(app) {
  const draft = app.flash.setup ?? (app.flash.setup = newDraft());
  const touched = () => app.setDirty(true);

  const venue = venueField({
    value: draft.venue,
    getTown: () => draft.town,
    onChange: v => { draft.venue = v; touched(); },
  });
  const town = textField({
    label: SETUP.town, hint: SETUP.townHint, value: draft.town,
    onInput: v => { draft.town = v; touched(); },
  });
  const pace = paceField({ pace: draft.pace, onChange: p => { draft.pace = p; touched(); } });

  // Field 4: the situations, the person's own, and the clarifying question under them.
  const situations = h('section', { class: 'field' });
  const clarifying = h('div', { class: 'clarifying' });
  const ratingsError = h('p', { class: 'error', role: 'alert' });
  let clarifyingGroup = null;

  const listed = () => Object.fromEntries(draft.situations.map(s => [s.id, draft.ratings[s.id]]));
  const drawClarifying = () => {
    clarifyingGroup = null;
    if (!R.needsClarifying(listed())) return clarifying.replaceChildren();
    clarifyingGroup = choices({
      legend: CLARIFYING.question, columns: 1,
      options: [{ value: 'discomfort', label: CLARIFYING.discomfort }, { value: 'bigger', label: CLARIFYING.bigger }],
      value: draft.clarifying,
      onChange: v => {
        draft.clarifying = v;
        touched();
        // The second answer shows the signpost, once (L43, Q53).
        if (R.clarifyingSignpost(v, draft.signpostShown)) {
          draft.signpostShown = true;
          drawClarifying();
        }
      },
    });
    return fill(clarifying, clarifyingGroup, draft.signpostShown ? signpost(SIGNPOST.setup) : null);
  };

  // The box for a situation in the person's own words (L81). It has no wording yet, so its
  // label is a bracketed placeholder.
  const ownId = nextId('own');
  const ownInput = h('input', { class: 'input', type: 'text', id: ownId });
  let list = null;
  const addOwn = (text, asGoal) => {
    const clean = text.trim();
    if (!clean) return;
    const id = `own-${R.makeId()}`;
    draft.situations.push({ id, text: clean, own: true });
    if (asGoal) draft.goalSituation = id;
    touched();
    drawSituations();
    drawGoal();
    list.groups[list.groups.length - 1].querySelector('input').focus(); // its rating comes next
  };
  const drawSituations = () => {
    list = ratingsList({
      situations: draft.situations,
      ratings: draft.ratings,
      onRate: (id, n) => { draft.ratings[id] = n; touched(); drawClarifying(); },
      onRemove: id => {
        draft.situations = draft.situations.filter(s => s.id !== id);
        delete draft.ratings[id];
        if (draft.goalSituation === id) draft.goalSituation = null;
        touched();
        drawSituations();
        drawGoal();
        ownInput.focus();
      },
    });
    fill(situations,
      h('h2', {}, SETUP.situationsLabel),
      ratingsError,
      list,
      h('label', { for: ownId, class: 'add-label' }, SETUP.ownSituation),
      h('div', { class: 'add-row' }, ownInput, button(COMMON.add, () => {
        addOwn(ownInput.value, false);
        ownInput.value = '';
      }, { small: true })),
      clarifying);
    drawClarifying();
  };

  // Field 5: the goal, one of the situations or the person's own words (L82). The box for
  // the person's own goal is described by the hint above the list.
  const goal = h('section', { class: 'field' });
  let goalGroup = null;
  const goalHintId = nextId('goal-hint');
  const goalInput = h('input', { class: 'input', type: 'text', 'aria-label': SETUP.goalHint, 'aria-describedby': goalHintId });
  const drawGoal = () => {
    goalGroup = choices({
      legend: SETUP.goalLabel, columns: 1,
      options: draft.situations.map(s => ({ value: s.id, label: s.text })),
      value: draft.goalSituation,
      onChange: id => { draft.goalSituation = id; touched(); },
    });
    goalGroup.querySelector('legend').after(h('p', { class: 'hint', id: goalHintId }, SETUP.goalHint));
    fill(goal, goalGroup, h('div', { class: 'add-row' }, goalInput, button(COMMON.add, () => {
      addOwn(goalInput.value, true);
      goalInput.value = '';
    }, { small: true })));
  };

  drawSituations();
  drawGoal();

  const save = () => {
    const errors = R.validateSetup(draft);
    venue.setError(errors.venue && COMMON.required);
    pace.setError(errors.pace && COMMON.required);
    list.markMissing(); // each unrated situation says so (Q76)
    ratingsError.textContent = errors.ratings || errors.situations ? COMMON.required : '';
    goalGroup.setError(errors.goal && COMMON.required);
    clarifyingGroup?.setError(errors.clarifying && COMMON.required);
    if (Object.keys(errors).length) {
      document.querySelector('.error:not(:empty)')?.scrollIntoView({ block: 'center' });
      return;
    }
    const person = R.createPerson(draft, { now: now(), today: today() });
    app.setDirty(false);
    if (!app.save({ ...app.data(), person })) {
      app.setDirty(true);
      return;
    }
    delete app.flash.setup;
    app.flash.breatheBanner = true; // L83
    app.go('breathe');
  };

  return {
    back: 'welcome',
    node: h('div', { class: 'form' },
      h('h1', {}, SETUP.heading),
      venue, town, pace, situations, goal,
      button(COMMON.save, save, { primary: true })),
  };
}
