// Pieces more than one screen uses: the venue field with its help and searches (Set-up and
// Settings, Q51), the pace field with Time yourself (Set-up and Settings), the goal picker
// (Settings and Set a new goal), the signpost, and import and export (Welcome and
// Settings, Q65).

import * as R from '../rules.js';
import { h, textField, choices, rating, button, outLink, panel, ask, tell } from '../ui.js';
import { VENUE, SETUP, TIMING, SIGNPOST, SETTINGS, COMMON } from '../strings.js';
import { now, today } from '../store.js';

const PASSAGE_WORDS = R.countWords(TIMING.passage); // counted in code (Q77)

// Field 1 (L78): the box, the Friends and family button, the help, the link and the searches.
export function venueField({ value, getTown, onChange }) {
  const field = textField({ label: VENUE.label, value, onInput: v => onChange(v, 'input') });
  field.input.addEventListener('change', () => onChange(field.input.value, 'change'));
  const friends = button(VENUE.friendsButton, () => {
    field.input.value = VENUE.friendsButton; // exactly the text the find-somewhere rule looks for (Q28)
    field.setError(null); // an answer, as typing one is (BUGS.md 4)
    onChange(field.input.value, 'change');
  }, { small: true });
  field.input.after(friends);

  // The help sits after the field, not inside it, so a "Needed" mark outlines only the
  // question and its box (BUGS.md 4).
  const searches = h('div', { class: 'searches' }, VENUE.searches.map(s => searchButton(s, getTown)));
  const wrap = h('div', { class: 'venue' }, field,
    h('div', { class: 'help' },
      h('p', {}, VENUE.startWithFriends),
      h('p', {}, VENUE.clubIntro),
      h('blockquote', {}, VENUE.clubLine),
      h('p', {}, VENUE.clubsStartSmall),
      h('p', {}, VENUE.placesIntro),
      h('ul', { class: 'places' }, VENUE.places.map(p => h('li', {}, p))),
      h('p', {}, outLink(VENUE.toastmastersLink, VENUE.toastmastersUrl)),
      searches,
      h('p', {}, VENUE.anyRoom)));
  return Object.assign(wrap, { input: field.input, setError: field.setError, friends });
}

// A search button shows the query in an editable box with the town filled in, and Go
// opens the phone's browser with it (L78, Q57). The person does the searching.
function searchButton(search, getTown) {
  const slot = h('div', { class: 'search-slot' });
  const open = () => {
    const query = h('input', { class: 'input', type: 'search', 'aria-label': search.label });
    query.value = R.searchQuery(search.phrase, getTown());
    slot.replaceChildren(h('div', { class: 'search-row' }, query,
      button(VENUE.go, () => window.open(R.searchUrl(query.value), '_blank', 'noopener,noreferrer'), { small: true })));
    query.focus();
  };
  return h('div', { class: 'search' }, button(search.label, open, { quiet: true }), slot);
}

// Field 3 (L80): slow, average, quick, or a timed result.
export function paceField({ pace, onChange }) {
  const timed = h('p', { class: 'hint', 'aria-live': 'polite' }, pace?.choice === 'timed' ? SETUP.wordsAMinute(pace.wpm) : '');
  const group = choices({
    legend: SETUP.paceLabel,
    options: ['slow', 'average', 'quick'].map(c => ({ value: c, label: SETUP.paceChoices[c] })),
    value: pace?.choice,
    onChange: choice => {
      timed.textContent = '';
      onChange({ choice, wpm: R.PACE[choice] });
    },
  });
  group.append(
    button(SETUP.timeYourself, () => timeYourself(wpm => {
      group.setValue(null);
      group.setError(null); // a timed pace answers the question (BUGS.md 4)
      timed.textContent = SETUP.wordsAMinute(wpm);
      onChange({ choice: 'timed', wpm });
    }), { quiet: true }),
    timed);
  return group;
}

// Time yourself (L80, Q56, Q68): Start becomes Stop; Stop sets the pace to the passage's
// word count divided by the minutes taken. Leaving before Stop changes nothing.
function timeYourself(onResult) {
  const p = panel({ label: TIMING.heading });
  let started = 0;
  const show = message => {
    const control = button(TIMING.start, () => {
      if (!started) {
        started = performance.now();
        control.textContent = TIMING.stop;
        return;
      }
      const result = R.timedPace(PASSAGE_WORDS, performance.now() - started);
      started = 0;
      if (!result.ok) return show(TIMING.tryAgain(result.wpm));
      onResult(result.wpm); // Stop sets the pace; Done only closes
      p.fill(
        h('h2', {}, TIMING.heading),
        h('p', { class: 'result' }, SETUP.wordsAMinute(result.wpm)),
        button(TIMING.done, p.close, { primary: true }));
      return undefined;
    }, { primary: true });
    p.fill(
      h('h2', {}, TIMING.heading),
      message ? h('p', { class: 'notice', role: 'alert' }, message) : null,
      h('p', { class: 'passage' }, TIMING.passage),
      control);
  };
  show();
}

// The ratings for every situation (Field 4, and the check-in). The person's own
// situations can be removed at Set-up (Q59). `markMissing()` puts "Needed before you can
// save." on each situation still without a rating and returns the first of them.
export function ratingsList({ situations, ratings, onRate, onRemove }) {
  const groups = situations.map(s => {
    const group = rating({
      legend: s.text, value: ratings[s.id] ?? null, ends: SETUP.ends,
      onChange: n => { group.setError(null); onRate(s.id, n); },
    });
    if (onRemove && s.own) group.append(button(COMMON.remove, () => onRemove(s.id), { quiet: true, small: true }));
    return group;
  });
  const markMissing = () => {
    let first = null;
    situations.forEach((s, i) => {
      const missing = !Number.isInteger(ratings[s.id]);
      groups[i].setError(missing ? COMMON.required : null);
      if (missing && !first) first = groups[i];
    });
    return first;
  };
  return Object.assign(h('div', { class: 'ratings' }, groups), { groups, markMissing });
}

// The goal (L82, Q52 replaced): the situations in one column, and a box for a goal in the
// person's own words, whose 0-10 rating appears under it once it has text. Enter in the
// box moves to the rating. Picking a situation empties the box; with `unpickOnType` (Set a
// new goal), typing un-picks the situation. Settings leaves its pick showing, since that
// is already saved. `extra` holds the rating, for a screen to add its own Save to.
export function goalPicker({ situations, value = null, legend, labelledBy, unpickOnType = false, onPick, onType }) {
  let picked = value;
  let rated = null;
  const group = choices({
    legend, columns: 1, value,
    options: situations.map(s => ({ value: s.id, label: s.text })),
    onChange: id => {
      picked = id;
      group.setError(null);
      own.input.value = '';
      typed('');
      onPick?.(id);
    },
  });
  if (labelledBy) group.setAttribute('aria-labelledby', labelledBy);
  const own = textField({ label: SETUP.ownGoal, enterkeyhint: 'next', onInput: v => typed(v) });
  const rate = rating({ legend: SETUP.situationsLabel, ends: SETUP.ends, onChange: n => { rated = n; rate.setError(null); } });
  const extra = h('div', { hidden: true }, rate);
  const text = () => own.input.value.trim();

  // The rating belongs to the typed words: it goes, answer and all, when the box empties.
  function typed(v) {
    own.setError(null);
    if (v.trim()) group.setError(null); // typing a goal answers the question too
    if (unpickOnType && v.trim() && picked !== null) {
      picked = null;
      group.setValue(null);
    }
    if (!text() && !extra.hidden) {
      rated = null;
      rate.setValue(null);
      rate.setError(null);
    }
    extra.hidden = !text();
    onType?.(v);
  }
  own.input.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (!extra.hidden) (rate.querySelector('input:checked') ?? rate.querySelector('input')).focus();
  });

  // Errors from addOwnGoal or startNewLadder, each on its own control; returns the first.
  const showErrors = errors => {
    group.setError(errors.goal ? COMMON.required : null);
    own.setError(errors.text ? COMMON.required : null);
    rate.setError(errors.rating ? COMMON.required : null);
    return [errors.goal && group, errors.text && own, errors.rating && rate].find(Boolean) ?? null;
  };
  return Object.assign(h('div', {}, group, own, extra), {
    group, extra, text, showErrors,
    rating: () => rated,
    // What startNewLadder takes: the typed goal, else the picked situation, else nothing.
    choice: () => (text() ? { text: text(), rating: rated } : picked ? { situationId: picked } : null),
  });
}

// The signpost, with how to find one (L35, L43, L47, Q80).
export function signpost(text) {
  return h('div', { class: 'signpost' }, h('p', {}, text), h('p', {}, outLink(SIGNPOST.register, SIGNPOST.registerUrl)));
}

// Export (L107, Q106, Q109): a plain download; on an iPhone home-screen app, which can't
// save downloads, the phone's own share sheet.
export async function exportData(data) {
  const { filename, text } = R.exportFile(data, { now: now(), today: today() });
  const file = new File([text], filename, { type: 'application/json' });
  if (navigator.standalone && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch (e) {
      if (e?.name === 'AbortError') return; // the person cancelled the share sheet
      // any other failure: try a plain download
    }
  }
  const url = URL.createObjectURL(file);
  const a = h('a', { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

// Import (L107, Q101, Q107): choose the file, check all of it, ask, then replace and open
// the Ladder. Any problem: refuse and change nothing.
export function importData(app) {
  document.querySelectorAll('input.picker').forEach(old => old.remove());
  const input = h('input', {
    type: 'file', accept: '.json,application/json', class: 'picker visually-hidden', tabindex: '-1', 'aria-hidden': 'true',
  });
  input.addEventListener('cancel', () => input.remove());
  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    input.remove();
    if (!file) return;
    let text;
    try {
      text = await file.text();
    } catch {
      await tell(SETTINGS.importRefused);
      return;
    }
    const result = R.readFile(text);
    if (!result.ok) {
      await tell(SETTINGS.importRefused);
      return;
    }
    const go = await ask({
      body: [SETTINGS.importConfirm],
      buttons: [{ label: SETTINGS.replace, value: true, primary: true }, { label: COMMON.cancel, value: false, safe: true }],
      cancel: false,
    });
    if (!go) return;
    if (!app.save(result.data)) return;
    await tell(SETTINGS.imported);
    app.go('ladder');
  });
  document.body.append(input);
  input.click();
}
