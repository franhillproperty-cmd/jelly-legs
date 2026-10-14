// Settings (L107, Q50-Q52, Q52 replaced): pace and a picked goal save as soon as they
// change; the venue, the town and a goal typed in the person's own words (rated first) each
// have a Save; the welcome; export, import and delete everything. Nothing else.

import * as R from '../rules.js';
import { h, textField, button, ask } from '../ui.js';
import { SETTINGS, SETUP, COMMON } from '../strings.js';
import { now, today } from '../store.js';
import { venueField, paceField, goalPicker, exportData, importData } from './parts.js';

export function settingsScreen(app) {
  const person = app.data().person;
  const focusVenue = app.flash.focusVenue; // arrived from the find-somewhere line (Q51)
  delete app.flash.focusVenue;
  // Each control already shows its new value, so saving doesn't redraw the screen; the
  // person's place, focus and keyboard stay where they are.
  const update = changes => app.save({ ...app.data(), person: { ...app.data().person, ...changes } }, { redraw: false });

  // The venue and the town each have a Save button, greyed out until the box differs from
  // what's stored; Enter saves too. Typed but not saved counts as unsaved input, so leaving
  // asks first (Q63). The venue is required here too (Q51); an empty box isn't saved.
  // (BUGS.md 2: they used to save silently on leaving the box, with nothing on screen.)
  const venue = venueField({ value: person.venue, getTown: () => app.data().person.town, onChange: () => refresh() });
  const town = textField({ label: SETUP.town, hint: SETUP.townHint, value: person.town, onInput: () => refresh() });
  const saveVenue = button(COMMON.save, () => saveText('venue'), { small: true, primary: true, disabled: true });
  const saveTown = button(COMMON.save, () => saveText('town'), { small: true, primary: true, disabled: true });
  venue.friends.after(saveVenue);
  town.input.after(saveTown);
  const boxes = { venue, town };
  const saves = { venue: saveVenue, town: saveTown };

  let goal = null;
  const refresh = () => {
    const stored = app.data().person;
    for (const key of ['venue', 'town']) saves[key].disabled = boxes[key].input.value.trim() === stored[key];
    app.setDirty(!saveVenue.disabled || !saveTown.disabled || !!goal?.text());
  };
  const saveText = key => {
    const value = boxes[key].input.value.trim();
    if (key === 'venue' && !value) {
      venue.setError(COMMON.required);
      return;
    }
    boxes[key].setError(null);
    if (!update({ [key]: value })) return;
    boxes[key].input.value = value;
    refresh();
  };
  for (const key of ['venue', 'town']) {
    boxes[key].input.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      saveText(key);
    });
  }
  const pace = paceField({ pace: person.pace, onChange: p => update({ pace: p }) });

  // The goal (Q52, replaced 14 Oct 2026): picking a situation saves at once; a goal typed in
  // the person's own words is rated and saved with its own Save, then joins the list,
  // picked. Typed but not saved counts as unsaved input, like the venue. Changing the goal
  // here never starts a new ladder; only Set a new goal on the Ladder does.
  const saveGoal = () => {
    const result = R.addOwnGoal(app.data().person, goal.text(), goal.rating(), { now: now(), today: today() });
    if (!result.ok) {
      goal.showErrors(result.errors)?.scrollIntoView({ block: 'center' });
      return;
    }
    if (!app.save({ ...app.data(), person: result.person }, { redraw: false })) return;
    // Only the goal control is drawn again, so anything typed in the other boxes stays.
    drawGoal();
    refresh();
    goal.group.querySelector('input:checked')?.focus();
  };
  const drawGoal = () => {
    const stored = app.data().person;
    const next = goalPicker({
      situations: stored.situations, value: stored.goalSituation, legend: SETUP.goalLabel,
      onPick: id => app.save({ ...app.data(), person: R.setGoal(app.data().person, id) }, { redraw: false }),
      onType: () => refresh(),
    });
    next.extra.append(button(COMMON.save, saveGoal, { small: true, primary: true }));
    goal?.replaceWith(next);
    goal = next;
  };
  drawGoal();

  const deleteEverything = async () => {
    const first = await ask({
      body: [SETTINGS.deleteFirst],
      buttons: [{ label: SETTINGS.continue, value: true }, { label: COMMON.cancel, value: false, primary: true, safe: true }],
      cancel: false,
    });
    if (!first) return;
    const second = await ask({
      body: [SETTINGS.deleteSecond],
      buttons: [{ label: SETTINGS.deleteEverything, value: true }, { label: COMMON.cancel, value: false, primary: true, safe: true }],
      cancel: false,
    });
    if (!second) return;
    if (app.save(R.emptyData())) app.go('welcome', { replace: true });
  };

  return {
    tabs: 'settings',
    node: h('div', { class: 'settings form' },
      h('h1', {}, SETTINGS.heading),
      venue, town, pace, goal,
      h('div', { class: 'stack' },
        button(SETTINGS.showWelcome, () => app.go('welcome?from=settings')),
        button(SETTINGS.export, () => exportData(app.data())),
        h('p', { class: 'hint' }, SETTINGS.exportNote), // L117
        button(SETTINGS.import, () => importData(app)),
        button(SETTINGS.deleteEverything, deleteEverything, { quiet: true }))),
    after: ({ redraw }) => {
      if (redraw || !focusVenue) return;
      venue.scrollIntoView({ block: 'start' });
      venue.input.focus({ preventScroll: true });
    },
  };
}
