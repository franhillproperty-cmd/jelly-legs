// Jelly Legs: the rules from PLAN.md's "The method", as pure functions.
//
// No screen, no storage, no clock. Callers pass `now` (an ISO timestamp: the moment
// something is logged) and `today` (the phone's local date, YYYY-MM-DD). The browser
// loads this file as a module and `node --test` imports it unchanged.
//
// Ln points at a line of PLAN.md; Qn at an answered question in QUESTIONS.md.
// Where they disagree, the answer wins.

export const APP_ID = 'jelly-legs';
export const SCHEMA_VERSION = 1;

// The method's numbers. Fran can change any of these.
export const EASY_LINE = 2;                 // a stay rated at or below this settles the step (L31)
export const PACE = Object.freeze({ slow: 110, average: 140, quick: 170 }); // words a minute (L23)
export const PACE_RANGE = Object.freeze({ min: 60, max: 300 });            // timed results outside are refused (Q56)
export const DEFAULT_REHEARSALS = 3;        // run-throughs before a step is ready (L49)
export const REHEARSAL_BOOST = 2;           // "plus two" after "no, I needed more" (L53, Q44; Fran to confirm)
export const CHECKIN_DAYS = 28;             // (L89, Q54)
export const EARLY_STEPS = 3;               // settled steps before "matters a lot" stops raising the caution (L39)
export const BIG_ROOM = 5;                  // a step with more people than this wants a venue (L90)
export const ROPE = 2;                      // easy known-people steps before the friends line (L41)
export const ROPE_FOR_HIGH_STRANGERS = 3;
export const HIGH_STRANGERS = 7;            // a Set-up strangers rating this high lengthens the rope (L43)
export const CLARIFY_FROM = 9;              // a Set-up rating this high asks the clarifying question (L43)
export const UNDO_SECONDS = 60;             // how long "undo that +1" is offered (Q24)

export const FRIENDS_AND_FAMILY = 'Friends and family for now'; // the Set-up button's exact text (L78, Q28)
export const FLOOR_WHERE = 'At home with the door shut';         // where the floor step happens (L47)

// The four dials, in the order every screen shows them (Q86), and their notches (L47).
export const DIALS = Object.freeze(['words', 'people', 'visibility', 'matters']);
export const NOTCHES = Object.freeze({
  words: Object.freeze([10, 25, 50, 100, 200, 400, 700, 1000]),
  people: Object.freeze([0, 1, 2, 3, 5, 10, 20, 50, 100, 250, 500]),
  visibility: Object.freeze(['notAtAll', 'barely', 'partly', 'clearly']),
  matters: Object.freeze(['notMuch', 'somewhat', 'aLot']),
});

// The checklist (L37), stored by fixed key so a later label change can't break comparisons.
// On is the harder state for every toggle except knowEveryone, where off is harder (Q9).
export const TOGGLES = Object.freeze([
  'knowEveryone', 'standing', 'microphone', 'recorded',
  'fromMemory', 'questions', 'introduced', 'unusualItem',
]);

// The speaking situations listed at Set-up (L43). The person's own get generated ids.
export const SITUATIONS = Object.freeze([
  'strangers', 'toast', 'readAloud', 'colleagues', 'fiveMinutes', 'publicQuestion', 'introduce',
]);

export const STATES = Object.freeze(['planning', 'rehearsing', 'ready', 'settled', 'didntStay']);
export const FEELS = Object.freeze(['easier', 'same', 'harder']);
export const CLARIFYING_ANSWERS = Object.freeze(['discomfort', 'bigger']);
const OPEN_STATES = ['planning', 'rehearsing', 'ready'];

// ---------------------------------------------------------------- small helpers

const str = v => (typeof v === 'string' ? v : '');
// "Ignoring capitals and spaces at the ends" (Q10, Q28).
const norm = v => str(v).trim().toLowerCase();
const isBool = v => typeof v === 'boolean';
const isInt = (v, min, max = Infinity) => Number.isInteger(v) && v >= min && v <= max;
const isText = v => typeof v === 'string';
const pad = n => String(n).padStart(2, '0');

// Everything "first", "earlier" and "most recent" goes by the moment it was logged,
// never by a date the person typed (Q1). Ties keep the order they were stored in.
const byLogged = (a, b) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0);
const bySettled = (a, b) => (a.settledAt < b.settledAt ? -1 : a.settledAt > b.settledAt ? 1 : 0);
const sortedByLogged = list => [...list].sort(byLogged);
const last = list => list[list.length - 1] ?? null;

export function makeId() {
  const bytes = new Uint8Array(8);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

// ---------------------------------------------------------------- dates

export function localDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function isDate(v) {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const [y, m, d] = v.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
}

function dayNumber(ymd) {
  const [y, m, d] = ymd.split('-').map(Number);
  return Date.UTC(y, m - 1, d) / 86400000;
}

// Whole calendar days from one local date to another.
export function daysBetween(fromYmd, toYmd) {
  return dayNumber(toYmd) - dayNumber(fromYmd);
}

export function addDays(ymd, n) {
  return new Date((dayNumber(ymd) + n) * 86400000).toISOString().slice(0, 10);
}

// ---------------------------------------------------------------- length and pace

// A word is anything between spaces or line breaks that contains a letter or a digit.
// A hyphenated word is one word; a dash on its own is none (Q124).
export function countWords(text) {
  return str(text).split(/\s+/u).filter(t => /[\p{L}\p{N}]/u.test(t)).length;
}

// A slow, average or quick choice follows the constants, so changing PACE changes it (Q56).
export function paceWpm(pace) {
  if (pace && pace.choice === 'timed') return pace.wpm;
  return PACE[pace?.choice] ?? PACE.average;
}

export function secondsToSay(words, wpm) {
  return Math.round((words / wpm) * 60);
}

// Minutes and seconds: "0:04", "4:38" (Q17).
export function formatDuration(seconds) {
  return `${Math.floor(seconds / 60)}:${pad(seconds % 60)}`;
}

// The person's own time, plus the three from the pace constants (L23, Q17).
export function speakingTimes(words, pace) {
  return {
    own: secondsToSay(words, paceWpm(pace)),
    slow: secondsToSay(words, PACE.slow),
    average: secondsToSay(words, PACE.average),
    quick: secondsToSay(words, PACE.quick),
  };
}

// Time yourself: the passage's word count divided by the minutes taken (L80),
// rounded, and refused outside the usable range (Q56).
export function timedPace(passageWords, ms) {
  const wpm = Math.round(passageWords / (ms / 60000));
  return { wpm, ok: Number.isFinite(wpm) && wpm >= PACE_RANGE.min && wpm <= PACE_RANGE.max };
}

// ---------------------------------------------------------------- dials and notches

const isNumberDial = dial => dial === 'words' || dial === 'people';

// A dial's position on a single harder-is-higher scale.
function level(dial, value) {
  return isNumberDial(dial) ? value : NOTCHES[dial].indexOf(value);
}

// The next notch strictly above, from any value, on or between notches (Q6). Null at the top.
export function notchUp(dial, value) {
  if (isNumberDial(dial)) return NOTCHES[dial].find(n => n > value) ?? null;
  const i = NOTCHES[dial].indexOf(value);
  return i >= 0 && i < NOTCHES[dial].length - 1 ? NOTCHES[dial][i + 1] : null;
}

// The next notch strictly below (Q6). Null at the bottom.
export function notchDown(dial, value) {
  if (isNumberDial(dial)) return last(NOTCHES[dial].filter(n => n < value));
  const i = NOTCHES[dial].indexOf(value);
  return i > 0 ? NOTCHES[dial][i - 1] : null;
}

// For the one-thing check, words compare by nearest notch, so 25 to 26 is no change
// and 25 to 50 is one (Q9). Halfway between two notches counts as the higher one, so the
// check warns when in doubt (Q131).
export function nearestWordsNotch(words) {
  let best = NOTCHES.words[0];
  for (const n of NOTCHES.words) if (Math.abs(words - n) <= Math.abs(words - best)) best = n;
  return best;
}

// With nobody there, "Can see them" is fixed at not at all and "I know everyone there"
// is ignored (Q8).
function activeToggles(step) {
  return (step.toggles ?? []).filter(k => !(k === 'knowEveryone' && step.people === 0));
}
const hasToggle = (step, key) => activeToggles(step).includes(key);

// The floor: ten words or fewer, nobody there, can't see them, matters not much, no
// toggles on, own item blank (Q7).
export function isFloor(step) {
  return step.words <= 10 && step.people === 0 && step.visibility === 'notAtAll'
    && step.matters === 'notMuch' && activeToggles(step).length === 0 && norm(step.ownItem) === '';
}

// A step with at least one person in it who isn't known (L41).
export function isStrangerStep(step) {
  return step.people > 0 && !hasToggle(step, 'knowEveryone');
}

// ---------------------------------------------------------------- one thing at a time

// What got harder between the base (the last settled step) and a new step (L27, Q8-Q11).
// Each change has one or more parts; a change counts once however many parts it has.
// Decreases never count (Q9).
export function harderChanges(base, step) {
  const changes = [];
  const part = (key, from, to) => ({ key, from, to });
  const nobodyInvolved = base.people === 0 || step.people === 0;

  if (nearestWordsNotch(step.words) > nearestWordsNotch(base.words)) {
    changes.push({ parts: [part('words', base.words, step.words)] });
  }

  const peopleUp = step.people > base.people;
  const strangerIn = !nobodyInvolved && hasToggle(base, 'knowEveryone') && !hasToggle(step, 'knowEveryone');
  if (strangerIn && step.people === base.people + 1) {
    // One stranger joining is one change (Q11).
    changes.push({ parts: [part('people', base.people, step.people), part('knowEveryone', true, false)] });
  } else {
    // Leaving nobody-there behind is one change, whatever "Can see them" is set to (Q8).
    if (peopleUp) changes.push({ parts: [part('people', base.people, step.people)] });
    if (strangerIn) changes.push({ parts: [part('knowEveryone', true, false)] });
  }

  if (!nobodyInvolved && level('visibility', step.visibility) > level('visibility', base.visibility)) {
    changes.push({ parts: [part('visibility', base.visibility, step.visibility)] });
  }
  if (level('matters', step.matters) > level('matters', base.matters)) {
    changes.push({ parts: [part('matters', base.matters, step.matters)] });
  }

  for (const key of TOGGLES) {
    if (key !== 'knowEveryone' && hasToggle(step, key) && !hasToggle(base, key)) {
      changes.push({ parts: [part(key, false, true)] });
    }
  }

  // A non-blank own item that differs counts as one change; blank against blank is none (Q10).
  if (norm(step.ownItem) !== '' && norm(step.ownItem) !== norm(base.ownItem)) {
    changes.push({ parts: [part('ownItem', str(base.ownItem).trim(), str(step.ownItem).trim())] });
  }
  return changes;
}

// Settled steps, oldest settled first.
export function settledSteps(steps) {
  return steps.filter(s => s.state === 'settled').sort(bySettled);
}

// The base for the one-thing check, Suggest and "one dial down": the most recently
// settled step, never the step being saved (Q1, Q12).
export function lastSettledStep(steps, excludeId = null) {
  return last(settledSteps(steps).filter(s => s.id !== excludeId));
}

// Warns when more than one thing got harder. No base, no check (L27, L165, Q12).
export function oneThingCheck(steps, step, excludeId = null) {
  const base = lastSettledStep(steps, excludeId);
  if (!base) return { base: null, changes: [], warn: false };
  const changes = harderChanges(base, step);
  return { base, changes, warn: changes.length > 1 };
}

// ---------------------------------------------------------------- one dial down

// The dials that can still go down. "Can see them" can't move while nobody is there.
export function dialsThatCanGoDown(step) {
  return DIALS.filter(d => !(d === 'visibility' && step.people === 0) && notchDown(d, step[d]) !== null);
}

// Everything that can be turned down, in the order the person sees it (Q135): the dials
// that can still go lower, then each toggle in its harder state (on; for "I know everyone
// there", off with someone there), then the own item if it isn't blank.
export function turnDownOptions(step) {
  const toggles = TOGGLES.filter(k => (k === 'knowEveryone' ? step.people > 0 && !hasToggle(step, k) : hasToggle(step, k)));
  return [...dialsThatCanGoDown(step), ...toggles, ...(norm(step.ownItem) !== '' ? ['ownItem'] : [])];
}

// Undo one thing: a dial one notch down, never two (L163), or a toggle or the own item
// back to its easier state (Q129, Q134).
export function turnDown(step, key) {
  if (DIALS.includes(key)) return { kind: 'dial', dial: key, from: step[key], to: notchDown(key, step[key]) };
  return { kind: 'switchOff', key };
}

// What to suggest when a step needs to be smaller: after a didn't stay, after a second
// hard stay, or after a "no" to the silly-easy question. The thing that changed is the
// thing that bit (Q5, Q129, Q135):
// - the true floor: the floor signpost
// - exactly one thing got harder than the last settled step, dial or toggle or own item:
//   undo that one. One stranger joining is one thing, undone by people you know (Q11).
// - nothing did, more than one did, or nothing is settled: ask, from turnDownOptions
export function turnDownAdvice(steps, step) {
  if (isFloor(step)) return { kind: 'floor' };
  const base = lastSettledStep(steps, step.id);
  const changes = base ? harderChanges(base, step) : [];
  if (changes.length === 1) {
    const keys = changes[0].parts.map(p => p.key);
    return turnDown(step, keys.includes('knowEveryone') ? 'knowEveryone' : keys[0]);
  }
  return { kind: 'ask', options: turnDownOptions(step) };
}

// ---------------------------------------------------------------- notices

// When a step's dials change, its earlier attempts become history only: still shown on the
// Step screen, but no rule reads them (Q130). These are the attempts the rules read.
const counts = (step, a) => a.stepId === step.id && (step.resizedAt === null || a.createdAt > step.resizedAt);
export function currentAttempts(step, attempts) {
  return sortedByLogged(attempts.filter(a => counts(step, a)));
}

// Too big (L33, Q25, Q26, Q130): on after a step's first attempt is a hard stay, or after
// any didn't stay; off only when a stay rated at or under the easy line is logged after
// that. `attempt` is the one that turned it on, for the rating shown beside Suggest.
export function tooBigNotice(steps, attempts) {
  const read = steps.flatMap(s => currentAttempts(s, attempts));
  let turnedOnBy = null;
  const seen = new Set();
  for (const a of sortedByLogged(read)) {
    const first = !seen.has(a.stepId);
    seen.add(a.stepId);
    if (!a.stayed) turnedOnBy = turnedOnBy ?? a;
    else if (a.hardToStay > EASY_LINE) { if (first) turnedOnBy = turnedOnBy ?? a; }
    else turnedOnBy = null;
  }
  return { on: turnedOnBy !== null, attempt: turnedOnBy };
}

// Find somewhere (L90, Q28): the venue is still "Friends and family for now" and some
// step has more than five people.
export function findSomewhereLine(data) {
  return !!data.person
    && norm(data.person.venue) === norm(FRIENDS_AND_FAMILY)
    && data.steps.some(s => s.people > BIG_ROOM);
}

export function baselineRating(person, situationId) {
  return person?.ratingSets?.[0]?.ratings?.[situationId] ?? null;
}

// The rope: two easy known-people steps, or three if a room of strangers was rated 7 or
// more at Set-up (L41, L43). The Set-up rating, never a later one.
export function ropeLength(person) {
  return (baselineRating(person, 'strangers') ?? 0) >= HIGH_STRANGERS ? ROPE_FOR_HIGH_STRANGERS : ROPE;
}

// A step's first stay is its first attempt of any kind since its dials last changed (Q2, Q130).
export function firstAttempt(step, attempts) {
  return currentAttempts(step, attempts)[0] ?? null;
}

export function settledOnEasyFirstStay(step, attempts) {
  const first = firstAttempt(step, attempts);
  return step.state === 'settled' && !!first && first.stayed && first.hardToStay <= EASY_LINE;
}

// Friends only (L41, Q8, Q29, Q30): worked out fresh from the last settled steps, in the
// order they settled. Steps with nobody there neither count nor clear it.
export function friendsLine(data) {
  const rope = ropeLength(data.person);
  const recent = settledSteps(data.steps).filter(s => s.people > 0).slice(-rope);
  const on = recent.length === rope
    && recent.every(s => hasToggle(s, 'knowEveryone') && settledOnEasyFirstStay(s, data.attempts));
  return { on, rope };
}

// All Ladder notices, in the order they stack (L90). Worked out fresh every time (Q27).
export function notices(data) {
  const tooBig = tooBigNotice(data.steps, data.attempts);
  return {
    tooBig: tooBig.on,
    tooBigAttempt: tooBig.attempt,
    findSomewhere: findSomewhereLine(data),
    friendsOnly: friendsLine(data).on,
  };
}

// ---------------------------------------------------------------- early steps

// "Matters a lot" with fewer than three steps settled now, on every save (L39, Q19).
// `steps` is the Ladder as it will be once this save is stored.
export function earlyCaution(steps, step) {
  return step.matters === 'aLot' && steps.filter(s => s.state === 'settled').length < EARLY_STEPS;
}

// ---------------------------------------------------------------- rehearsal

// The run-through box on a new step: 3, or the higher of 3 and last time's count plus two
// when the most recent attempt said more rehearsal was needed and that hasn't been used
// yet. Used once, on the next new step only (L53, Q44). `higher` decides whether the
// "this starts higher" line shows.
export function startingTarget(attempts) {
  const latest = last(sortedByLogged(attempts));
  if (latest && latest.rehearsedEnough === false && !latest.boostUsed) {
    const target = Math.max(DEFAULT_REHEARSALS, latest.rehearsalCount + REHEARSAL_BOOST);
    return { target, higher: target > DEFAULT_REHEARSALS, attemptId: latest.id };
  }
  return { target: DEFAULT_REHEARSALS, higher: false, attemptId: null };
}

// What the Step screen offers in each state (Q40, Q41).
export function canMarkReadyNow(step) {
  return step.state === 'rehearsing' && step.rehearsalCount < step.rehearsalTarget;
}

export function allowedActions(step) {
  if (step.state === 'planning') return ['edit', 'delete'];
  const actions = ['runThrough', 'logAttempt', 'edit', 'delete'];
  if (canMarkReadyNow(step)) actions.push('markReadyNow');
  return actions;
}

// +1 (L101, Q40, Q43): counts with no upper limit; a rehearsing step that reaches its
// target becomes ready; other states keep their state. The how-did-it-feel question is
// asked from the second run-through on, and needs an answer. `press` is what
// undoRunThrough needs to put the step back.
export function addRunThrough(step) {
  if (step.state === 'planning') return { step, ask: false, press: null };
  const rehearsalCount = step.rehearsalCount + 1;
  const state = step.state === 'rehearsing' && rehearsalCount >= step.rehearsalTarget ? 'ready' : step.state;
  const ask = rehearsalCount >= 2;
  return { step: { ...step, rehearsalCount, state }, ask, press: { stateBefore: step.state, asked: ask } };
}

// "Undo that +1" (Q24): one fewer, the answer that press recorded removed, and a step the
// press made ready back to rehearsing.
export function undoRunThrough(step, press) {
  return {
    ...step,
    rehearsalCount: Math.max(0, step.rehearsalCount - 1),
    rehearsalFeel: press.asked ? step.rehearsalFeel.slice(0, -1) : step.rehearsalFeel,
    state: step.state === 'ready' && press.stateBefore === 'rehearsing' ? 'rehearsing' : step.state,
  };
}

export function recordFeel(step, feel) {
  if (!FEELS.includes(feel)) throw new Error(`Unknown run-through answer: ${feel}`);
  return { ...step, rehearsalFeel: [...step.rehearsalFeel, feel] };
}

// Two "about the same" in a row; an easier or harder answer clears it (L49).
export function asRehearsedAsItGets(step) {
  const f = step.rehearsalFeel;
  return f.length >= 2 && f[f.length - 1] === 'same' && f[f.length - 2] === 'same';
}

// Mark ready now (L49, L101, Q41): yes marks ready and notes how far rehearsal got;
// no changes nothing.
export function markReadyNow(step, stillFeelsEasy) {
  if (!canMarkReadyNow(step) || !stillFeelsEasy) return step;
  return {
    ...step,
    state: 'ready',
    readyEarly: true,
    readyEarlyCount: step.rehearsalCount,
    readyEarlyTarget: step.rehearsalTarget,
  };
}

export function canUndoRunThrough(pressedAtMs, nowMs) {
  return nowMs - pressedAtMs < UNDO_SECONDS * 1000;
}

// "Run-throughs with [distractor] on": drop a trailing "on" so "the TV on" doesn't
// read "the TV on on" (Q85).
export function distractorForCounter(distractor) {
  return str(distractor).trim().replace(/\s+on$/i, '');
}

// ---------------------------------------------------------------- adding and editing steps

// A blank Add a step (Q16): dials empty; toggles and own item as on the last settled
// step; distractor as on the most recent step; Where is the venue; target as Q44.
export function blankDraft(data) {
  const base = lastSettledStep(data.steps);
  const recent = last(sortedByLogged(data.steps));
  const start = startingTarget(data.attempts);
  return {
    draft: {
      title: '', text: '', words: null, people: null, visibility: null, matters: null,
      toggles: base ? [...base.toggles] : [], ownItem: base ? base.ownItem : '',
      where: data.person?.venue ?? '', when: null, whatsDifferent: '', feelsEasy: null,
      distractor: recent ? recent.distractor : '', rehearsalTarget: start.target, suggested: false,
    },
    targetHigher: start.higher,
  };
}

function cleanDraft(d) {
  const people = d.people;
  return {
    title: str(d.title).trim(),
    text: str(d.text),
    words: d.words,
    people,
    visibility: people === 0 ? 'notAtAll' : d.visibility, // fixed while nobody is there (Q8)
    matters: d.matters,
    toggles: [...new Set((d.toggles ?? []).filter(k => TOGGLES.includes(k)))],
    ownItem: str(d.ownItem).trim(),
    where: str(d.where).trim(),
    when: isDate(d.when) ? d.when : null,
    whatsDifferent: str(d.whatsDifferent).trim(),
    feelsEasy: d.feelsEasy,
    suggested: !!d.suggested,
    distractor: str(d.distractor).trim(),
    rehearsalTarget: d.rehearsalTarget,
  };
}

function wholeNumber(errors, key, value, min) {
  if (value === null || value === undefined || value === '') errors[key] = { kind: 'required' };
  else if (!Number.isInteger(value) || value < min) errors[key] = { kind: 'range', min };
}

// Field rules for Add a step (L95, Q49, Q122). Where, When, the pasted text and the own
// item are optional.
export function validateStep(step) {
  const errors = {};
  if (!step.title) errors.title = { kind: 'required' };
  wholeNumber(errors, 'words', step.words, 1);
  wholeNumber(errors, 'people', step.people, 0);
  if (!NOTCHES.visibility.includes(step.visibility)) errors.visibility = { kind: 'required' };
  if (!NOTCHES.matters.includes(step.matters)) errors.matters = { kind: 'required' };
  if (!step.whatsDifferent) errors.whatsDifferent = { kind: 'required' };
  if (!isBool(step.feelsEasy)) errors.feelsEasy = { kind: 'required' };
  if (!step.distractor) errors.distractor = { kind: 'required' };
  wholeNumber(errors, 'rehearsalTarget', step.rehearsalTarget, 1);
  return errors;
}

// Has a dial, a toggle or the own item changed? If so an edit clears the silly-easy
// answer (Q14) and resets the step (Q15).
export function sizingChanged(before, after) {
  const a = new Set(activeToggles(before));
  const b = new Set(activeToggles(after));
  return before.words !== after.words || before.people !== after.people
    || before.visibility !== after.visibility || before.matters !== after.matters
    || a.size !== b.size || [...a].some(k => !b.has(k))
    || norm(before.ownItem) !== norm(after.ownItem);
}

// What the person sees after a "no" to the silly-easy question (L35, L98, Q31, Q35):
// the floor signpost; the keep-going message for a stranger step while the friends line
// is on; otherwise the make-it-smaller message with one dial down.
export function planningAdvice(data, step) {
  if (isFloor(step)) return { kind: 'floor' };
  if (isStrangerStep(step) && friendsLine(data).on) return { kind: 'keepGoing' };
  return turnDownAdvice(data.steps, step);
}

// Everything that happens on Save, worked out but not yet stored (L98). The screen shows
// the one-thing dialog, then the early-steps caution, then the planning advice, and calls
// commitStep if the person goes ahead.
export function prepareStep(data, draft, { editingId = null, now }) {
  const existing = editingId ? data.steps.find(s => s.id === editingId) : null;
  if (editingId && !existing) throw new Error(`No step ${editingId}`);
  const step = cleanDraft(existing && !sizingChanged(existing, cleanDraft(draft))
    ? { ...draft, feelsEasy: existing.feelsEasy }
    : draft);
  const errors = validateStep(step);
  if (Object.keys(errors).length) return { ok: false, errors };

  const resized = !existing || sizingChanged(existing, step);
  let saved;
  if (!existing) {
    saved = {
      ...step, id: makeId(), createdAt: now, settledAt: null, resizedAt: null,
      state: step.feelsEasy ? 'rehearsing' : 'planning',
      rehearsalCount: 0, rehearsalFeel: [], readyEarly: false, readyEarlyCount: null, readyEarlyTarget: null,
    };
  } else if (resized) {
    // A changed dial or toggle makes it a fresh step to size and rehearse; attempts stay (Q15).
    // From resizedAt on it is a new step with its old notes attached (Q130).
    saved = {
      ...existing, ...step, suggested: existing.suggested, settledAt: null, resizedAt: now,
      state: step.feelsEasy ? 'rehearsing' : 'planning',
      rehearsalCount: 0, rehearsalFeel: [], readyEarly: false, readyEarlyCount: null, readyEarlyTarget: null,
    };
  } else {
    saved = { ...existing, ...step, suggested: existing.suggested, state: existing.state };
  }
  // A rehearsing step at or past its target is ready; raising the target never takes ready away (Q42).
  if (saved.state === 'rehearsing' && saved.rehearsalCount >= saved.rehearsalTarget) saved.state = 'ready';

  const stepsAfter = existing ? data.steps.map(s => (s.id === saved.id ? saved : s)) : [...data.steps, saved];
  return {
    ok: true,
    step: saved,
    oneThing: resized ? oneThingCheck(data.steps, saved, saved.id) : { base: null, changes: [], warn: false },
    earlyCaution: earlyCaution(stepsAfter, saved),
    advice: resized && saved.state === 'planning' ? planningAdvice(data, saved) : null,
  };
}

export function commitStep(data, prepared) {
  const { step } = prepared;
  const exists = data.steps.some(s => s.id === step.id);
  return {
    ...data,
    steps: exists ? data.steps.map(s => (s.id === step.id ? step : s)) : [...data.steps, step],
    // The plus two is used once, by the next new step (Q44): every "no, I needed more"
    // logged before this step is spent, so deleting an attempt can't hand it out again.
    attempts: exists
      ? data.attempts
      : data.attempts.map(a => (a.rehearsedEnough === false && !a.boostUsed ? { ...a, boostUsed: true } : a)),
  };
}

// Delete a step and its attempts, nothing else (L101).
export function deleteStep(data, stepId) {
  return {
    ...data,
    steps: data.steps.filter(s => s.id !== stepId),
    attempts: data.attempts.filter(a => a.stepId !== stepId),
  };
}

// ---------------------------------------------------------------- suggest a step

function stretchableDials(base) {
  return DIALS.filter(d => !(d === 'visibility' && base.people === 0) && notchUp(d, base[d]) !== null);
}

function suggestionFrom(base, data) {
  return {
    title: '', text: '', words: base.words, people: base.people,
    visibility: base.visibility, matters: base.matters,
    toggles: [...base.toggles], ownItem: base.ownItem, where: base.where, when: null,
    whatsDifferent: '', feelsEasy: null, suggested: true,
    distractor: base.distractor, rehearsalTarget: startingTarget(data.attempts).target,
  };
}

// The floor step, offered when nothing is settled yet (L47, Q7, Q36).
export function floorSuggestion(data) {
  const recent = last(sortedByLogged(data.steps));
  return {
    title: '', text: '', words: 10, people: 0, visibility: 'notAtAll', matters: 'notMuch',
    toggles: [], ownItem: '', where: FLOOR_WHERE, when: null, whatsDifferent: '',
    feelsEasy: null, suggested: true, distractor: recent ? recent.distractor : '',
    rehearsalTarget: startingTarget(data.attempts).target,
  };
}

// What Suggest a step does first (L47, Q6, Q34, Q36):
// - nothing settled: offer the floor straight away
// - every dial at its top: "You're at the top of this ladder."
// - every stretchable dial already refused: offer "Do your last step again"
// - otherwise ask which dial to stretch, with refused dials greyed out
export function suggestStart(data, refused = []) {
  const base = lastSettledStep(data.steps);
  if (!base) return { kind: 'floor', suggestion: floorSuggestion(data) };
  const dials = stretchableDials(base);
  if (dials.length === 0) return { kind: 'top' };
  if (dials.every(d => refused.includes(d))) return { kind: 'repeat', suggestion: repeatSuggestion(data) };
  return { kind: 'ask', dials, refused: dials.filter(d => refused.includes(d)) };
}

// The last settled step with one dial turned up one notch (L47). Moving people from 0 to 1
// switches "I know everyone there" on and leaves "Can see them" for the person to set (Q8).
export function suggestStep(data, dial) {
  const base = lastSettledStep(data.steps);
  const suggestion = suggestionFrom(base, data);
  suggestion[dial] = notchUp(dial, base[dial]);
  if (dial === 'people' && base.people === 0) {
    suggestion.visibility = null;
    if (!suggestion.toggles.includes('knowEveryone')) suggestion.toggles.push('knowEveryone');
  }
  return suggestion;
}

// "No" to a suggestion (Q34, Q35): one notch smaller on the same dial, unless that is at
// or below the last settled step, in which case there's nothing between. "No" to the
// floor step, with nothing settled, is the floor signpost.
export function smallerSuggestion(data, suggestion, dial) {
  const base = lastSettledStep(data.steps);
  if (!base) return { kind: 'floor' };
  const down = notchDown(dial, suggestion[dial]);
  if (down === null || level(dial, down) <= level(dial, base[dial])) return { kind: 'nothingBetween', dial };
  return { kind: 'step', suggestion: { ...suggestion, [dial]: down } };
}

// "Do your last step again": the settled step's values, to be sized afresh on the form (Q34).
export function repeatSuggestion(data) {
  return suggestionFrom(lastSettledStep(data.steps), data);
}

// "Yes" opens Add a step with the silly-easy answer already yes (Q32).
export function acceptSuggestion(suggestion) {
  return { ...suggestion, feelsEasy: true };
}

// ---------------------------------------------------------------- attempts

export function validateAttempt(input, today) {
  const errors = {};
  if (!isDate(input.date)) errors.date = { kind: 'required' };
  else if (input.date > today) errors.date = { kind: 'future' }; // (Q48)
  if (!isBool(input.stayed)) errors.stayed = { kind: 'required' };
  if (input.hardToStay === null || input.hardToStay === undefined || input.hardToStay === '') {
    errors.hardToStay = { kind: 'required' };
  } else if (!isInt(input.hardToStay, 0, 10)) errors.hardToStay = { kind: 'range', min: 0, max: 10 };
  if (!isBool(input.rehearsedEnough)) errors.rehearsedEnough = { kind: 'required' };
  return errors;
}

// Hard stays on this step since its last easy stay. Didn't stays neither count nor reset (Q3).
function hardStaysSinceEasy(stepAttempts) {
  let n = 0;
  for (const a of stepAttempts) {
    if (!a.stayed) continue;
    n = a.hardToStay > EASY_LINE ? n + 1 : 0;
  }
  return n;
}

// What one attempt does to a step's state (L29, L31, L105, Q1, Q4):
// - didn't stay: the step becomes didn't stay, unless it was already settled
// - easy stay:   the step is settled, and keeps the moment it first settled
// - hard stay:   no change, except that a didn't-stay step moves to ready
function afterAttempt(current, attempt) {
  if (!attempt.stayed) {
    return { state: current.state === 'settled' ? 'settled' : 'didntStay', settledAt: current.settledAt };
  }
  if (attempt.hardToStay <= EASY_LINE) {
    return { state: 'settled', settledAt: current.settledAt ?? attempt.createdAt };
  }
  return { state: current.state === 'didntStay' ? 'ready' : current.state, settledAt: current.settledAt };
}

// Log an attempt and pick the reply (L105, Q3):
// - didntStay: reply one
// - hard:      reply two; the first hard stay since the step's last easy one
// - hardAgain: reply three; any hard stay after that
// - easy:      reply four
// After a didn't stay or a repeated hard stay, `advice` is the smaller step (Q46).
export function logAttempt(data, stepId, input, { now, today }) {
  const step = data.steps.find(s => s.id === stepId);
  if (!step) throw new Error(`No step ${stepId}`);
  if (step.state === 'planning') throw new Error('A planning step has no attempts');
  const errors = validateAttempt(input, today);
  if (Object.keys(errors).length) return { ok: false, errors };

  const earlier = currentAttempts(step, data.attempts); // since the dials last changed (Q130)
  const reply = !input.stayed ? 'didntStay'
    : input.hardToStay <= EASY_LINE ? 'easy'
    : hardStaysSinceEasy(earlier) > 0 ? 'hardAgain' : 'hard';

  const attempt = {
    id: makeId(), stepId, date: input.date, stayed: input.stayed, hardToStay: input.hardToStay,
    rehearsedEnough: input.rehearsedEnough,
    wentWrong: str(input.wentWrong).trim(), wouldChange: str(input.wouldChange).trim(),
    feedback: str(input.feedback).trim(),
    createdAt: now,
    rehearsalCount: step.rehearsalCount, // for the plus two (Q44)
    boostUsed: false,
  };
  const { state, settledAt } = afterAttempt(step, attempt);
  // Kept so a deleted attempt can be taken back out of the step's history (Q24).
  Object.assign(attempt, { stateBefore: step.state, stateAfter: state, settledAtBefore: step.settledAt });
  const saved = { ...step, state, settledAt };
  const next = {
    ...data,
    steps: data.steps.map(s => (s.id === stepId ? saved : s)),
    attempts: [...data.attempts, attempt],
  };
  const advice = reply === 'didntStay' || reply === 'hardAgain' ? turnDownAdvice(next.steps, saved) : null;
  return { ok: true, data: next, attempt, reply, advice };
}

// Delete an attempt (Q24) and work the step out again from what's left (Q125): replay the
// step's remaining attempts since its dials last changed, starting from the state it had
// before the first of them. Attempts from before that are history only (Q130).
// A replayed step that ends up rehearsing is ready if its run-throughs say so.
// Notices follow, being worked out fresh.
export function deleteAttempt(data, attemptId) {
  const deleted = data.attempts.find(a => a.id === attemptId);
  if (!deleted) return data;
  const attempts = data.attempts.filter(a => a.id !== attemptId);
  const step = data.steps.find(s => s.id === deleted.stepId);
  if (!counts(step, deleted)) return { ...data, attempts };

  const history = currentAttempts(step, data.attempts);
  let current = { state: history[0].stateBefore, settledAt: history[0].settledAtBefore };
  const replayed = new Map();
  for (const a of history) {
    if (a.id === attemptId) continue;
    const next = afterAttempt(current, a);
    replayed.set(a.id, { ...a, stateBefore: current.state, stateAfter: next.state, settledAtBefore: current.settledAt });
    current = next;
  }
  let state = current.state;
  if (state === 'rehearsing' && (step.readyEarly || step.rehearsalCount >= step.rehearsalTarget)) state = 'ready';
  return {
    ...data,
    steps: data.steps.map(s => (s.id === step.id ? { ...s, state, settledAt: current.settledAt } : s)),
    attempts: attempts.map(a => replayed.get(a.id) ?? a),
  };
}

// ---------------------------------------------------------------- the Ladder

// The step being worked on now is the most recently made one still open; the rest
// follow, newest first (L91).
export function ladderOrder(steps) {
  const newest = sortedByLogged(steps).reverse();
  const current = newest.find(s => OPEN_STATES.includes(s.state)) ?? null;
  return { current, others: newest.filter(s => s !== current) };
}

// ---------------------------------------------------------------- set-up, goal and check-in

export function needsClarifying(ratings) {
  return Object.values(ratings).some(v => v >= CLARIFY_FROM);
}

// The second answer shows the signpost, once ever; the first shows nothing (L43, Q53).
export function clarifyingSignpost(answer, signpostShown) {
  return answer === 'bigger' && !signpostShown;
}

function ratingsComplete(situations, ratings) {
  return situations.every(s => isInt(ratings?.[s.id], 0, 10));
}

// Only the situations still on the list: a rating left behind by a removed own
// situation neither asks the clarifying question nor gets stored (Q59).
function listedRatings(situations, ratings) {
  return Object.fromEntries(situations.map(s => [s.id, ratings?.[s.id]]));
}

// Every listed situation is required; only the person's own can be removed (L81, Q59).
const hasListedSituations = situations => SITUATIONS.every(id => situations.some(s => s.id === id));

function validatePace(pace) {
  if (!pace) return false;
  if (pace.choice === 'timed') return isInt(pace.wpm, PACE_RANGE.min, PACE_RANGE.max);
  return Object.hasOwn(PACE, pace.choice);
}

// Set-up's required fields (L78-L82, Q53).
export function validateSetup(draft) {
  const errors = {};
  if (!str(draft.venue).trim()) errors.venue = { kind: 'required' };
  if (!validatePace(draft.pace)) errors.pace = { kind: 'required' };
  if (draft.situations.some(s => !str(s.text).trim())) errors.situations = { kind: 'required' };
  if (!hasListedSituations(draft.situations) || !ratingsComplete(draft.situations, draft.ratings)) {
    errors.ratings = { kind: 'required' };
  }
  if (!draft.situations.some(s => s.id === draft.goalSituation)) errors.goal = { kind: 'required' };
  if (needsClarifying(listedRatings(draft.situations, draft.ratings)) && !CLARIFYING_ANSWERS.includes(draft.clarifying)) {
    errors.clarifying = { kind: 'required' };
  }
  return errors;
}

export function createPerson(draft, { now, today }) {
  const ratings = listedRatings(draft.situations, draft.ratings);
  return {
    venue: str(draft.venue).trim(),
    town: str(draft.town).trim(),
    goalSituation: draft.goalSituation,
    pace: { choice: draft.pace.choice, wpm: draft.pace.choice === 'timed' ? draft.pace.wpm : PACE[draft.pace.choice] },
    situations: draft.situations.map(s => ({ id: s.id, text: str(s.text).trim(), own: !!s.own })),
    ratingSets: [{ date: today, at: now, ratings }],
    clarifying: needsClarifying(ratings) ? draft.clarifying : null,
    signpostShown: !!draft.signpostShown,
    welcomeSeen: true,
    setupDone: true,
  };
}

// In Settings the goal can only be one of the situations already rated (Q52).
export function setGoal(person, situationId) {
  if (!person.situations.some(s => s.id === situationId)) throw new Error(`No situation ${situationId}`);
  return { ...person, goalSituation: situationId };
}

// Due once 28 or more calendar days have passed since the latest set (Q54).
export function checkInDue(person, today) {
  return daysBetween(last(person.ratingSets).date, today) >= CHECKIN_DAYS;
}

// Saving a check-in adds a dated set; every situation must be rated (Q54).
export function addCheckIn(person, ratings, { now, today }) {
  if (!ratingsComplete(person.situations, ratings)) return { ok: false, errors: { ratings: { kind: 'required' } } };
  const set = { date: today, at: now, ratings: listedRatings(person.situations, ratings) };
  return { ok: true, person: { ...person, ratingSets: [...person.ratingSets, set] } };
}

// The progress line (L43, Q55): the goal's rating at Set-up, and at the latest check-in
// with the whole weeks between, rounded down. No check-in yet: no latest.
export function progress(person) {
  const sets = person.ratingSets;
  const goal = person.goalSituation;
  const baseline = sets[0].ratings[goal];
  if (sets.length < 2) return { baseline, latest: null, weeks: null };
  const latestSet = last(sets);
  return {
    baseline,
    latest: latestSet.ratings[goal],
    weeks: Math.floor(daysBetween(sets[0].date, latestSet.date) / 7),
  };
}

// ---------------------------------------------------------------- venue searches

// "Toastmasters near Leeds" with a town, "Toastmasters near me" without (Q57).
export function searchQuery(phrase, town) {
  const t = str(town).trim();
  return t ? phrase.replace(/near me$/i, `near ${t}`) : phrase;
}

export function searchUrl(query) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

// ---------------------------------------------------------------- breathing

// The last seven local days, today at the right end (L86).
export function lastSevenDays(breathing, today) {
  const ticked = new Set(breathing);
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i - 6);
    return { date, ticked: ticked.has(date) };
  });
}

export function breathingCount(breathing, today) {
  return lastSevenDays(breathing, today).filter(d => d.ticked).length;
}

// Which encouragement line to show: none ticked, some, or all seven (L86).
export function encouragement(count) {
  return count === 0 ? 'none' : count === 7 ? 'all' : 'some';
}

// "I practised today" (L87): a second press the same day changes nothing.
export function tickToday(breathing, today) {
  if (breathing.includes(today)) return { breathing, already: true };
  return { breathing: [...breathing, today], already: false };
}

// Un-tick today only; no back-dated ticks (Q24).
export function untickToday(breathing, today) {
  return breathing.filter(d => d !== today);
}

// The week-of-breathing line on Add a step: no step yet and fewer than 7 of the last 7
// days ticked. It never blocks (L51, Q18).
export function breathingNudge(data, today) {
  return data.steps.length === 0 && breathingCount(data.breathing, today) < 7;
}

// ---------------------------------------------------------------- storage, export and import

export function emptyData() {
  return { person: null, breathing: [], steps: [], attempts: [], backup: null };
}

// One shape for what is stored on the phone and for the export file (L126, Q100).
export function serialise(data, now) {
  return JSON.stringify({ app: APP_ID, schemaVersion: SCHEMA_VERSION, savedAt: now, data }, null, 2);
}

export function exportFile(data, { now, today }) {
  return { filename: `jelly-legs-${today}.json`, text: serialise(data, now) };
}

// Only the exact form toISOString writes, so comparing timestamps as text is comparing times (Q1).
const isTimestamp = v => typeof v === 'string'
  && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(v) && new Date(v).toISOString() === v;
const isTimestampOrNull = v => v === null || isTimestamp(v);
const isWholeOrNull = (v, min) => v === null || isInt(v, min);

function personProblem(p) {
  if (p === null) return null;
  if (typeof p !== 'object') return 'person';
  if (!isText(p.venue) || !p.venue.trim()) return 'person.venue';
  if (!isText(p.town)) return 'person.town';
  if (!validatePace(p.pace)) return 'person.pace';
  if (!Array.isArray(p.situations) || p.situations.length === 0) return 'person.situations';
  const ids = new Set();
  for (const s of p.situations) {
    if (!s || !isText(s.id) || !s.id || ids.has(s.id) || !isText(s.text) || !isBool(s.own)) return 'person.situations';
    ids.add(s.id);
  }
  if (!hasListedSituations(p.situations)) return 'person.situations';
  if (!ids.has(p.goalSituation)) return 'person.goalSituation';
  if (!Array.isArray(p.ratingSets) || p.ratingSets.length === 0) return 'person.ratingSets';
  for (const set of p.ratingSets) {
    if (!set || !isDate(set.date) || !isTimestamp(set.at) || !ratingsComplete(p.situations, set.ratings)) {
      return 'person.ratingSets';
    }
  }
  if (p.clarifying !== null && !CLARIFYING_ANSWERS.includes(p.clarifying)) return 'person.clarifying';
  if (!isBool(p.signpostShown) || !isBool(p.welcomeSeen) || !isBool(p.setupDone)) return 'person.flags';
  return null;
}

function stepProblem(s) {
  if (!s || typeof s !== 'object') return 'step';
  if (!isText(s.id) || !s.id) return 'step.id';
  if (!isText(s.title) || !s.title.trim()) return 'step.title';
  if (!isInt(s.words, 1) || !isText(s.text)) return 'step.words';
  if (!isInt(s.people, 0)) return 'step.people';
  if (!NOTCHES.visibility.includes(s.visibility) || !NOTCHES.matters.includes(s.matters)) return 'step.dials';
  if (s.people === 0 && s.visibility !== 'notAtAll') return 'step.dials'; // (Q8)
  if (!Array.isArray(s.toggles) || s.toggles.some(k => !TOGGLES.includes(k)) || !isText(s.ownItem)) return 'step.toggles';
  if (!isText(s.where) || !isText(s.whatsDifferent) || !isText(s.distractor)) return 'step.text';
  if (!isBool(s.feelsEasy) || !isBool(s.suggested) || !isBool(s.readyEarly)) return 'step.flags';
  if (!isInt(s.rehearsalTarget, 1) || !isInt(s.rehearsalCount, 0)) return 'step.rehearsal';
  if (!Array.isArray(s.rehearsalFeel) || s.rehearsalFeel.some(f => !FEELS.includes(f))) return 'step.rehearsalFeel';
  if (!isWholeOrNull(s.readyEarlyCount, 0) || !isWholeOrNull(s.readyEarlyTarget, 1)) return 'step.readyEarly';
  if (s.when !== null && !isDate(s.when)) return 'step.when';
  if (!STATES.includes(s.state)) return 'step.state';
  if (!isTimestamp(s.createdAt) || !isTimestampOrNull(s.settledAt) || !isTimestampOrNull(s.resizedAt)) return 'step.times';
  if (s.state === 'settled' && s.settledAt === null) return 'step.settledAt';
  return null;
}

function attemptProblem(a, stepIds) {
  if (!a || typeof a !== 'object') return 'attempt';
  if (!isText(a.id) || !a.id) return 'attempt.id';
  if (!stepIds.has(a.stepId)) return 'attempt.stepId';
  if (!isDate(a.date)) return 'attempt.date';
  if (!isBool(a.stayed) || !isBool(a.rehearsedEnough) || !isBool(a.boostUsed)) return 'attempt.flags';
  if (!isInt(a.hardToStay, 0, 10)) return 'attempt.hardToStay';
  if (!isText(a.wentWrong) || !isText(a.wouldChange) || !isText(a.feedback)) return 'attempt.text';
  if (!isTimestamp(a.createdAt) || !isInt(a.rehearsalCount, 0)) return 'attempt.logged';
  if (!STATES.includes(a.stateBefore) || !STATES.includes(a.stateAfter) || !isTimestampOrNull(a.settledAtBefore)) {
    return 'attempt.states';
  }
  return null;
}

function dataProblem(d) {
  if (!d || typeof d !== 'object' || Array.isArray(d)) return 'data';
  if (!('person' in d)) return 'person';
  const personIssue = personProblem(d.person);
  if (personIssue) return personIssue;
  if (!Array.isArray(d.breathing) || d.breathing.some(x => !isDate(x)) || new Set(d.breathing).size !== d.breathing.length) {
    return 'breathing';
  }
  if (!Array.isArray(d.steps) || !Array.isArray(d.attempts)) return 'records';
  const stepIds = new Set();
  for (const s of d.steps) {
    const issue = stepProblem(s);
    if (issue) return issue;
    if (stepIds.has(s.id)) return 'step.id';
    stepIds.add(s.id);
  }
  const attemptIds = new Set();
  for (const a of d.attempts) {
    const issue = attemptProblem(a, stepIds);
    if (issue) return issue;
    if (attemptIds.has(a.id)) return 'attempt.id';
    attemptIds.add(a.id);
  }
  if (d.backup !== null && !isText(d.backup)) return 'backup';
  return null;
}

// Read a file or stored text. All or nothing: any problem refuses the lot (L126, Q101, Q107).
// Reasons: notJson, notJellyLegs, unknownVersion, invalid.
export function readFile(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, reason: 'notJson' };
  }
  if (!parsed || typeof parsed !== 'object' || parsed.app !== APP_ID) return { ok: false, reason: 'notJellyLegs' };
  if (parsed.schemaVersion !== SCHEMA_VERSION) return { ok: false, reason: 'unknownVersion' };
  const problem = dataProblem(parsed.data);
  if (problem) return { ok: false, reason: 'invalid', problem };
  return { ok: true, data: parsed.data };
}

// What the phone has stored. Nothing yet: empty. Unreadable: start fresh and keep the
// old text aside, so Export carries it (Q108).
export function readStored(raw) {
  if (raw === null || raw === undefined || raw === '') return { data: emptyData(), recovered: false };
  const result = readFile(raw);
  if (result.ok) return { data: result.data, recovered: false };
  return { data: { ...emptyData(), backup: raw }, recovered: true };
}
