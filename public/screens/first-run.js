// Welcome (L74-L76) and Set-up (L77-L83): shown once, the first time the app is opened.

import * as R from '../rules.js';
import { h, paragraphs, textField, choices, button, link, fill, nextId, revealFirstError } from '../ui.js';
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

  // Field 4: the situations, the person's own, and the clarifying question, which sits
  // directly under the ratings that asked it (L81): under the goal box when a goal typed
  // there is rated 9 or 10, otherwise under the situations. It can appear away from where
  // the person is, so its appearing is said aloud too.
  const situations = h('section', { class: 'field' });
  const clarifying = h('div', { class: 'clarifying' });
  const ratingsError = h('p', { class: 'error', role: 'alert' });
  let clarifyingGroup = null;
  let clarifyingShown = false;

  const listed = () => Object.fromEntries(draft.situations.map(s => [s.id, draft.ratings[s.id]]));
  const placeClarifying = () => {
    const goalRatings = Object.fromEntries(typedIn('goal').map(s => [s.id, draft.ratings[s.id]]));
    (R.needsClarifying(goalRatings) ? lists.goal : lists.situations)?.after(clarifying);
  };
  const drawClarifying = () => {
    clarifyingGroup = null;
    placeClarifying();
    if (!R.needsClarifying(listed())) {
      clarifyingShown = false;
      return clarifying.replaceChildren();
    }
    if (!clarifyingShown) app.say(CLARIFYING.question);
    clarifyingShown = true;
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

  // The boxes for a situation and for a goal in the person's own words (L81, L82). The
  // situation box has no wording yet, so its label is a bracketed placeholder. Enter in
  // either box, or its Add button, adds what's typed; Save adds anything still typed and
  // not yet added, so nothing the person typed is ignored (BUGS.md 1). What was typed is
  // rated directly under the box it was typed in, newest first, and focus moves to its
  // rating (BUGS.md 3); typed in the goal box, it is also picked as the goal, and that
  // rating is its baseline.
  const onEnter = add => e => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    add();
  };
  const ownId = nextId('own');
  const ownInput = h('input', {
    class: 'input', type: 'text', id: ownId, enterkeyhint: 'done', oninput: touched,
    onkeydown: onEnter(() => addTyped(ownInput, false)),
  });
  // Three lists of ratings: the listed situations, those typed in the situation box, and
  // those typed in the goal box. `typedIn` lives only in the draft; Save keeps id, text, own.
  const lists = {};
  const typedIn = where => draft.situations.filter(s => s.own && (s.typedIn ?? 'situations') === where).reverse();
  const addOwn = (text, asGoal, { focus = true } = {}) => {
    const clean = text.trim();
    if (!clean) return;
    const id = `own-${R.makeId()}`;
    const where = asGoal ? 'goal' : 'situations';
    draft.situations.push({ id, text: clean, own: true, typedIn: where });
    if (asGoal) draft.goalSituation = id;
    touched();
    drawSituations();
    drawGoal();
    if (focus) lists[where].groups[0].querySelector('input').focus();
  };
  const addTyped = (input, asGoal, options) => {
    const text = input.value;
    input.value = '';
    addOwn(text, asGoal, options);
  };
  const rate = (id, n) => { draft.ratings[id] = n; touched(); drawClarifying(); };
  const remove = id => {
    const gone = draft.situations.find(s => s.id === id);
    draft.situations = draft.situations.filter(s => s.id !== id);
    delete draft.ratings[id];
    if (draft.goalSituation === id) draft.goalSituation = null;
    touched();
    drawSituations();
    drawGoal();
    (gone?.typedIn === 'goal' ? goalInput : ownInput).focus();
  };
  const ratingsFor = (situations, onRemove) => ratingsList({ situations, ratings: draft.ratings, onRate: rate, onRemove });
  const drawSituations = () => {
    lists.listed = ratingsFor(draft.situations.filter(s => !s.own));
    lists.situations = ratingsFor(typedIn('situations'), remove);
    fill(situations,
      h('h2', {}, SETUP.situationsLabel),
      ratingsError,
      lists.listed,
      h('label', { for: ownId, class: 'add-label' }, SETUP.ownSituation),
      h('div', { class: 'add-row' }, ownInput, button(COMMON.add, () => addTyped(ownInput, false), { small: true })),
      lists.situations,
      clarifying);
    drawClarifying();
  };

  // Field 5: the goal, one of the situations or the person's own words (L82): "Pick one of
  // the situations above, or type your own (which is added to the list and rated)". A goal
  // typed here is rated under this box, with Set-up's question over it (Q88).
  const goal = h('section', { class: 'field' });
  let goalGroup = null;
  const goalHintId = nextId('goal-hint');
  const goalId = nextId('goal-own');
  const goalInput = h('input', {
    class: 'input', type: 'text', id: goalId, 'aria-describedby': goalHintId, enterkeyhint: 'done',
    oninput: () => {
      touched();
      if (goalInput.value.trim()) goalGroup.setError(null); // typing a goal answers the question
    },
    onkeydown: onEnter(() => addTyped(goalInput, true)),
  });
  const drawGoal = () => {
    goalGroup = choices({
      legend: SETUP.goalLabel, columns: 1,
      options: draft.situations.map(s => ({ value: s.id, label: s.text })),
      value: draft.goalSituation,
      onChange: id => { draft.goalSituation = id; touched(); },
    });
    goalGroup.querySelector('legend').after(h('p', { class: 'hint', id: goalHintId }, SETUP.goalHint));
    const typed = typedIn('goal');
    lists.goal = ratingsFor(typed, remove);
    fill(goal, goalGroup,
      h('label', { for: goalId, class: 'add-label' }, SETUP.ownGoal),
      h('div', { class: 'add-row' }, goalInput, button(COMMON.add, () => addTyped(goalInput, true), { small: true })),
      typed.length ? h('p', { class: 'add-label' }, SETUP.situationsLabel) : null,
      lists.goal);
    placeClarifying(); // the fill above may have taken it off the page
  };

  drawSituations();
  drawGoal();

  const save = () => {
    // Typed but not yet added: a goal of the person's own becomes the goal, and joins the
    // list to be rated; a situation of their own joins the list (BUGS.md 1).
    if (ownInput.value.trim()) addTyped(ownInput, false, { focus: false });
    if (goalInput.value.trim()) addTyped(goalInput, true, { focus: false });
    const errors = R.validateSetup(draft);
    venue.setError(errors.venue && COMMON.required);
    pace.setError(errors.pace && COMMON.required);
    // Each unrated situation says so, wherever it is rated (Q76).
    const missing = [lists.listed, lists.situations, lists.goal].map(list => list.markMissing()).find(Boolean);
    ratingsError.textContent = errors.situations || (errors.ratings && !missing) ? COMMON.required : '';
    goalGroup.setError(errors.goal && COMMON.required);
    clarifyingGroup?.setError(errors.clarifying && COMMON.required);
    if (Object.keys(errors).length) {
      revealFirstError(form); // BUGS.md 4
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

  const form = h('div', { class: 'form' },
    h('h1', {}, SETUP.heading),
    venue, town, pace, situations, goal,
    button(COMMON.save, save, { primary: true }));

  return { back: 'welcome', node: form };
}
