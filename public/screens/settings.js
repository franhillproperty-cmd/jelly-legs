// Settings (L107, Q50-Q52): venue, town, pace and goal, each saved as soon as it changes;
// the welcome; export, import and delete everything. Nothing else.

import * as R from '../rules.js';
import { h, textField, choices, button, ask } from '../ui.js';
import { SETTINGS, SETUP, COMMON } from '../strings.js';
import { venueField, paceField, exportData, importData } from './parts.js';

export function settingsScreen(app) {
  const person = app.data().person;
  const focusVenue = app.flash.focusVenue; // arrived from the find-somewhere line (Q51)
  delete app.flash.focusVenue;
  // Each control already shows its new value, so saving doesn't redraw the screen; the
  // person's place, focus and keyboard stay where they are.
  const update = changes => app.save({ ...app.data(), person: { ...app.data().person, ...changes } }, { redraw: false });

  // The venue is required here too (Q51); an empty box isn't saved. Typed but not yet
  // saved counts as unsaved input, so leaving asks first (Q63).
  const venue = venueField({
    value: person.venue,
    getTown: () => app.data().person.town,
    onChange: (value, kind) => {
      if (kind === 'input') {
        app.setDirty(true);
        return;
      }
      if (!value.trim()) {
        venue.setError(COMMON.required);
        return;
      }
      venue.setError(null);
      app.setDirty(false);
      update({ venue: value.trim() });
    },
  });
  const town = textField({
    label: SETUP.town, hint: SETUP.townHint, value: person.town, onInput: () => app.setDirty(true),
  });
  town.input.addEventListener('change', () => {
    app.setDirty(false);
    update({ town: town.input.value.trim() });
  });
  const pace = paceField({ pace: person.pace, onChange: p => update({ pace: p }) });
  const goal = choices({
    legend: SETUP.goalLabel, columns: 1,
    options: person.situations.map(s => ({ value: s.id, label: s.text })),
    value: person.goalSituation,
    onChange: id => app.save({ ...app.data(), person: R.setGoal(app.data().person, id) }, { redraw: false }),
  });

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
