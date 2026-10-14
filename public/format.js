// Turns the rules' values into the words a person sees. The words themselves live in
// strings.js; this file only puts them together.

import * as R from './rules.js';
import {
  DIAL_LABELS, VISIBILITY, MATTERS, STATE_LABELS, TOGGLE_LABELS, OWN_ITEM_LABEL, SWITCH_OFF, UNITS,
  MONTHS, NUMBER_WORDS, LADDER, SMALLER, SUGGEST,
} from './strings.js';

// "14 Nov 2026" (Q90).
export function formatDate(ymd) {
  const [y, m, d] = ymd.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

// A dial's value on its own: "25 words", "alone", "3 people", "clearly", "not much".
export function dialValue(dial, value) {
  if (dial === 'words') return UNITS.word(value);
  if (dial === 'people') return UNITS.person(value);
  if (dial === 'visibility') return VISIBILITY[value];
  return MATTERS[value];
}

// The length with the person's own time: "25 words, 0:11" (L91, Q17).
export function lengthText(words, pace) {
  return `${UNITS.word(words)}, ${R.formatDuration(R.speakingTimes(words, pace).own)}`;
}

// For Add a step: "0:11 at your pace", with "slow 0:14, average 0:11, quick 0:09" on the
// line under it (Q17).
export function timesText(words, pace) {
  const t = R.speakingTimes(words, pace);
  const f = R.formatDuration;
  return { own: UNITS.atYourPace(f(t.own)), three: UNITS.threePaces(f(t.slow), f(t.average), f(t.quick)) };
}

// A step row: "25 words, 0:11 · 1 person · clearly · not much" (Q90). "Can see them" is
// left out if it hasn't been set.
export function rowText(step, pace) {
  const parts = [lengthText(step.words, pace), UNITS.person(step.people)];
  if (step.visibility) parts.push(VISIBILITY[step.visibility]);
  parts.push(MATTERS[step.matters]);
  return parts.join(' · ');
}

export const stateText = state => STATE_LABELS[state];

// Whole numbers as words, British style: "one hundred and four" (Q55).
export function numberWords(n) {
  const { small, tens, hundred, and } = NUMBER_WORDS;
  if (!Number.isInteger(n) || n < 0) return String(n); // never expected; never a blank screen
  if (n < 20) return small[n];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? `-${small[n % 10]}` : '');
  if (n < 1000) return `${small[Math.floor(n / 100)]} ${hundred}${n % 100 ? ` ${and} ${numberWords(n % 100)}` : ''}`;
  return String(n);
}

const capitalise = s => s.charAt(0).toUpperCase() + s.slice(1);

// "Your goal felt like a 9 when you started. Eight weeks on, it's a 5." (L43, Q55)
export function progressText(person) {
  const p = R.progress(person);
  let text = LADDER.progressStart(LADDER.article(p.baseline), p.baseline);
  if (p.latest !== null) {
    const weeks = `${capitalise(numberWords(p.weeks))} ${LADDER.week(p.weeks)}`;
    text += LADDER.progressNow(weeks, LADDER.article(p.latest), p.latest);
  }
  return text;
}

// The label for anything that can be turned down or changed: a dial, a toggle, the own item.
export function thingLabel(key) {
  if (key in DIAL_LABELS) return DIAL_LABELS[key];
  if (key === 'ownItem') return OWN_ITEM_LABEL;
  return TOGGLE_LABELS[key];
}

// One line of the one-thing dialog: "Length: 25 → 50 words", "People: 1 → 3",
// "Can see them: partly → clearly", "I know everyone there: on → off",
// "Something else: new shoes → glasses" (Q75).
export function changeText(part) {
  const label = thingLabel(part.key);
  if (part.key === 'words') return `${label}: ${part.from} → ${UNITS.word(part.to)}`;
  if (part.key === 'people') return `${label}: ${part.from} → ${part.to}`;
  if (part.key === 'visibility') return `${label}: ${VISIBILITY[part.from]} → ${VISIBILITY[part.to]}`;
  if (part.key === 'matters') return `${label}: ${MATTERS[part.from]} → ${MATTERS[part.to]}`;
  if (part.key === 'ownItem') return `${label}: ${part.from || UNITS.empty} → ${part.to}`;
  return `${label}: ${part.from ? UNITS.on : UNITS.off} → ${part.to ? UNITS.on : UNITS.off}`;
}

// A dial's from → to for the turn-down lines: "50 → 25 words", "4 → 3", "clearly → partly".
function fromTo(dial, from, to) {
  if (dial === 'words') return [String(from), UNITS.word(to)];
  if (dial === 'people') return [String(from), String(to)];
  const names = dial === 'visibility' ? VISIBILITY : MATTERS;
  return [names[from], names[to]];
}

// What undoing one thing reads as (Q46, Q75, Q134, Q135). `nextTime` picks the reply
// screen's form; otherwise it's the make-it-smaller form.
export function undoText(advice, step, { nextTime = false } = {}) {
  if (advice.kind === 'dial') {
    const [from, to] = fromTo(advice.dial, advice.from, advice.to);
    return (nextTime ? SMALLER.nextTime : SMALLER.turnDown)(DIAL_LABELS[advice.dial], from, to);
  }
  if (advice.key === 'ownItem') return SWITCH_OFF.ownItem(step.ownItem.trim());
  return SWITCH_OFF[advice.key];
}

// The choices when the person picks what to turn down: dials by name, toggles and the own
// item by their switch-off wording (Q135).
export function turnDownChoice(key, step) {
  if (key in DIAL_LABELS) return DIAL_LABELS[key];
  return undoText({ kind: 'switchOff', key }, step);
}

export function lastTimeText(attempt) {
  return attempt.stayed ? SUGGEST.lastTimeRating(attempt.hardToStay) : SUGGEST.lastTimeDidntStay;
}
