// One step from start to finish: Add a step (also used for editing, L94-L98), the Step
// screen with its rehearsal counter (L99-L101), Log an attempt (L102-L105) and the reply.

import * as R from '../rules.js';
import { h, textField, choices, rating, toggle, button, link, ask, tell, notice, confetti, nextId, revealFirstError } from '../ui.js';
import {
  FORM, ONE_THING, EARLY_CAUTION, SMALLER, SIGNPOST, STEP, LOG, REPLIES, COMPLETE, LADDER, COMMON,
  TOGGLE_LABELS, OWN_ITEM_LABEL, VISIBILITY, MATTERS, UNITS,
} from '../strings.js';
import { rowText, timesText, stateText, formatDate, changeText, undoText, turnDownChoice } from '../format.js';
import { now, today } from '../store.js';
import { signpost } from './parts.js';
import { createJelly } from '../jelly.js';
import { createScene, LADDER_VIEW } from '../scene-draw.js';
import { stepJellyWobble, replyScene } from '../scene.js';

const capitalise = s => s.charAt(0).toUpperCase() + s.slice(1);
const number = v => (String(v).trim() === '' ? null : Number(v));
const EDITABLE = ['title', 'text', 'words', 'people', 'visibility', 'matters', 'toggles', 'ownItem', 'where', 'when',
  'whatsDifferent', 'feelsEasy', 'distractor', 'rehearsalTarget', 'suggested', 'goal'];
const pick = step => Object.fromEntries(EDITABLE.map(k => [k, Array.isArray(step[k]) ? [...step[k]] : step[k]]));

// What to do to make a step smaller, as nodes. An "ask" offers the dials that can go lower
// and the toggles that are on, each with its own wording (Q135); picking one shows it.
function adviceNodes(advice, step, { nextTime = false } = {}) {
  if (advice.kind === 'floor') return [signpost(SIGNPOST.floor)];
  if (advice.kind === 'keepGoing') return [h('p', {}, SMALLER.keepGoing)];
  if (advice.kind !== 'ask') return [h('p', {}, undoText(advice, step, { nextTime }))];
  const slot = h('div', { class: 'choose' });
  const pick = key => {
    const result = h('p', { tabindex: '-1' }, undoText(R.turnDown(step, key), step, { nextTime }));
    slot.replaceChildren(result);
    result.focus();
  };
  slot.append(h('p', {}, SMALLER.whichToTurnDown), h('div', { class: 'stack' },
    advice.options.map(key => button(turnDownChoice(key, step), () => pick(key), { quiet: true }))));
  return [slot];
}

// ---------------------------------------------------------------- Add a step

export function stepFormScreen(app, { id, query }) {
  const data = app.data();
  const editing = id ? data.steps.find(s => s.id === id) : null;
  if (id && !editing) {
    app.go('ladder', { replace: true });
    return null;
  }
  let form;
  let sizingBase = null; // the values the silly-easy answer was given for (Q14, Q32)
  let targetHigher = false;
  if (editing) {
    form = pick(editing);
    sizingBase = editing;
  } else if (query.from === 'suggest' && app.flash.prefill) {
    form = pick(app.flash.prefill);
    sizingBase = app.flash.prefill;
    targetHigher = R.startingTarget(data.attempts).higher;
  } else {
    const blank = R.blankDraft(data);
    form = blank.draft;
    targetHigher = blank.targetHigher;
  }
  const original = JSON.stringify(form);
  const pace = data.person.pace;
  const changed = () => app.setDirty(JSON.stringify(form) !== original);

  // --- fields, in L95's order
  const title = textField({ label: FORM.title, value: form.title, onInput: v => { form.title = v; changed(); } });

  // The person's own time, with the three paces on the line under it (Q17).
  const times = h('div', { class: 'times', 'aria-live': 'polite' });
  const showTimes = () => {
    if (!(Number.isInteger(form.words) && form.words > 0)) return times.replaceChildren();
    const t = timesText(form.words, pace);
    return times.replaceChildren(h('p', { class: 'hint' }, t.own), h('p', { class: 'hint' }, t.three));
  };
  const words = textField({
    label: FORM.wordCount, value: form.words ?? '', type: 'number', inputmode: 'numeric', min: '1', step: '1',
    onInput: v => { form.words = number(v); showTimes(); sizing(); },
  });
  const text = textField({
    label: FORM.pasteText, value: form.text, multiline: true,
    onInput: v => {
      form.text = v;
      const count = R.countWords(v);
      if (count > 0) { // the pasted text sets the number (Q124)
        form.words = count;
        words.input.value = count;
        words.setError(null); // an answer, so its "Needed" mark goes (BUGS.md 4)
        showTimes();
      }
      sizing();
    },
  });
  words.append(times);
  showTimes();
  const length = h('section', { class: 'group' }, h('h2', {}, FORM.length), text, words);

  const people = textField({
    label: FORM.people, value: form.people ?? '', type: 'number', inputmode: 'numeric', min: '0', step: '1',
    onInput: v => { form.people = number(v); nobodyThere(); sizing(); },
  });
  const visibility = choices({
    legend: FORM.visibility,
    options: R.NOTCHES.visibility.map(v => ({ value: v, label: capitalise(VISIBILITY[v]) })),
    value: form.visibility,
    onChange: v => { form.visibility = v; sizing(); },
  });
  const matters = choices({
    legend: FORM.matters,
    options: R.NOTCHES.matters.map(v => ({ value: v, label: capitalise(MATTERS[v]) })),
    value: form.matters,
    onChange: v => { form.matters = v; sizing(); },
  });

  const toggles = R.TOGGLES.map(key => toggle({
    label: TOGGLE_LABELS[key],
    checked: form.toggles.includes(key),
    onChange: on => {
      form.toggles = on ? [...form.toggles, key] : form.toggles.filter(k => k !== key);
      sizing();
    },
  }));
  const ownItem = textField({ label: OWN_ITEM_LABEL, value: form.ownItem, onInput: v => { form.ownItem = v; sizing(); } });
  const checklist = h('fieldset', { class: 'group checklist' }, h('legend', {}, FORM.checklist), toggles, ownItem);

  // With nobody there, "Can see them" is not at all and "I know everyone there" doesn't apply (Q8).
  const nobodyThere = () => {
    const alone = form.people === 0;
    if (alone) {
      form.visibility = 'notAtAll';
      visibility.setValue('notAtAll');
      visibility.setError(null);
    }
    visibility.setDisabled(alone);
    const know = toggles[R.TOGGLES.indexOf('knowEveryone')];
    know.classList.toggle('is-disabled', alone);
    know.querySelector('input').disabled = alone;
  };

  const where = textField({ label: FORM.where, value: form.where, onInput: v => { form.where = v; changed(); } });
  const when = textField({ label: FORM.when, value: form.when ?? '', type: 'date', onInput: v => { form.when = v || null; changed(); } });

  const different = textField({ label: FORM.whatsDifferent, value: form.whatsDifferent, onInput: v => { form.whatsDifferent = v; changed(); } });
  different.input.after(button(FORM.nothingDifferent, () => {
    different.input.value = FORM.nothingDifferent;
    form.whatsDifferent = FORM.nothingDifferent;
    different.setError(null);
    changed();
  }, { small: true, quiet: true }));

  const easy = choices({
    legend: FORM.sillyEasy,
    options: [{ value: true, label: COMMON.yes }, { value: false, label: COMMON.no }],
    value: form.feelsEasy,
    onChange: v => { form.feelsEasy = v; changed(); },
  });
  easy.querySelector('.choice-row').after(h('p', { class: 'hint' }, FORM.notReallyEasy));
  // Editing: the answer stands until a dial, toggle or own item changes, then it must be
  // given again (L96, Q14); changed back, the stored answer stands again. A suggestion's
  // yes is cleared the same way.
  if (editing) easy.setDisabled(true);
  let cleared = false;
  const sizing = () => {
    if (sizingBase && R.sizingChanged(sizingBase, form)) {
      if (!cleared) {
        cleared = true;
        form.feelsEasy = null;
        easy.setValue(null);
        easy.setDisabled(false);
      }
    } else if (cleared && editing) {
      cleared = false;
      form.feelsEasy = editing.feelsEasy;
      easy.setValue(form.feelsEasy);
      easy.setError(null);
      easy.setDisabled(true);
    }
    changed();
  };

  const distractor = textField({ label: FORM.distractor, value: form.distractor, onInput: v => { form.distractor = v; changed(); } });
  // Stuck? shows the list from L49; picking one fills the box.
  const stuckList = h('div', { class: 'stack stuck' });
  const choose = d => () => {
    distractor.input.value = d;
    form.distractor = d;
    distractor.setError(null);
    stuckList.replaceChildren();
    distractor.input.focus();
    changed();
  };
  const showStuck = () => stuckList.replaceChildren(
    ...FORM.distractors.map(d => button(capitalise(d), choose(d), { small: true, quiet: true })));
  distractor.input.after(button(FORM.stuck, showStuck, { small: true, quiet: true }), stuckList);

  const target = textField({
    label: FORM.target, value: form.rehearsalTarget ?? '', type: 'number', inputmode: 'numeric', min: '1', step: '1',
    after: targetHigher ? FORM.targetHigher : null, // the line under the box (L53)
    onInput: v => { form.rehearsalTarget = number(v); changed(); },
  });
  // The step the person is climbing towards. Saving it marked takes the mark off any other;
  // the ladder is complete once it settles.
  const goal = toggle({ label: FORM.goalStep, checked: !!form.goal, onChange: on => { form.goal = on; changed(); } });
  goal.classList.add('goal-step');
  nobodyThere();

  const fields = { title, words, people, visibility, matters, whatsDifferent: different, feelsEasy: easy, distractor, rehearsalTarget: target };
  const on = R.notices(data);

  const save = async () => {
    Object.values(fields).forEach(f => f.setError(null));
    const current = app.data(); // the latest, in case another copy of the app saved (Q119)
    if (editing && !current.steps.some(s => s.id === editing.id)) {
      app.setDirty(false);
      app.go('ladder', { replace: true });
      return;
    }
    const prepared = R.prepareStep(current, form, { editingId: editing?.id ?? null, now: now() });
    if (!prepared.ok) {
      for (const [key, e] of Object.entries(prepared.errors)) {
        fields[key]?.setError(e.kind === 'range' ? COMMON.wholeNumber(e.min) : COMMON.required);
      }
      revealFirstError(document.getElementById('main')); // BUGS.md 4
      return;
    }
    // First, one thing at a time (L98, Q75).
    if (prepared.oneThing.warn) {
      const keep = await ask({
        title: ONE_THING.title,
        body: [ONE_THING.intro,
          h('ul', { class: 'changes' }, prepared.oneThing.changes.flatMap(c => c.parts).map(part => h('li', {}, changeText(part)))),
          ONE_THING.outro],
        buttons: [{ label: ONE_THING.changeBack, value: false, primary: true, safe: true }, { label: ONE_THING.keep, value: true }],
        cancel: false,
      });
      if (!keep) return;
    }
    // Second, the early-steps caution (L98, Q19).
    if (prepared.earlyCaution) {
      await ask({
        body: [EARLY_CAUTION.text, prepared.step.when ? EARLY_CAUTION.deadline(formatDate(prepared.step.when)) : null].filter(Boolean),
        buttons: [{ label: EARLY_CAUTION.understood, value: true, primary: true }],
        cancel: true,
      });
    }
    app.setDirty(false);
    // The ladder's third step with no goal step asks, once, which step is the goal (Q149).
    const before = app.data();
    let next = R.commitStep(before, prepared);
    const askGoal = R.goalStepAskDue(before, next);
    if (askGoal) next = R.markGoalAskShown(next);
    if (!app.save(next)) {
      app.setDirty(true);
      return;
    }
    delete app.flash.prefill;
    delete app.flash.lastPress;
    // Then the Ladder; a "no" saves it as planning, with the make-it-smaller message shown
    // over the Ladder (L98, Q31, Q75), and then the goal-step question.
    await app.go('ladder', { replace: true });
    if (prepared.advice) await planningMessage(prepared.advice, prepared.step);
    if (askGoal) await tell(LADDER.goalStepAsk);
  };

  return {
    back: editing ? `step/${editing.id}` : 'ladder',
    node: h('div', { class: 'form' },
      h('h1', {}, FORM.addHeading),
      on.tooBig ? notice(LADDER.notices.tooBig) : null, // Q66
      on.friendsOnly ? notice(LADDER.notices.friendsOnly) : null,
      !editing && R.breathingNudge(data, today()) ? notice(FORM.breathingNudge(R.breathingCount(data.breathing, today()))) : null,
      title, length, people, visibility, matters, checklist, where, when, different, easy, distractor, target, goal,
      button(COMMON.save, save, { primary: true })),
  };
}

function planningMessage(advice, step) {
  let body;
  if (advice.kind === 'dial' || advice.kind === 'switchOff') {
    body = [`${SMALLER.notQuite} ${undoText(advice, step)} ${SMALLER.savedAsPlanning}`];
  } else if (advice.kind === 'ask') {
    body = [SMALLER.notQuite, ...adviceNodes(advice, step), SMALLER.savedAsPlanning];
  } else {
    body = adviceNodes(advice, step);
  }
  return ask({ body, buttons: [{ label: COMMON.ok, value: true, primary: true }], cancel: true });
}

// ---------------------------------------------------------------- the Step screen

// Where the step is (Q145): Plan, Rehearse, Ready, Do it, Log it, the current stage marked,
// the ones before it done. A settled step has done them all. Beside it, the jelly, small,
// wobbling while the step is still to do and still once it has settled (Q147); under it,
// what to do now.
function whereTheStepIs(step) {
  const at = R.STAGES.indexOf(R.stepStage(step));
  const all = step.state === 'settled';
  return [
    h('div', { class: 'stage-row' },
      createJelly({ wobble: stepJellyWobble(step) }),
      h('ol', { class: 'stages' }, R.STAGES.map((key, i) => h('li', {
        class: i < at || all ? 'done' : null,
        'aria-current': i === at ? 'step' : null,
      }, h('span', {}, STEP.stages[key]))))),
    h('p', { class: 'stage-line' }, STEP.now[step.state]),
  ];
}

const attemptsOn = (data, step) => data.attempts.filter(a => a.stepId === step.id).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

// The pasted text, to rehearse from the screen (Q69). It stays open across +1 presses.
function pastedText(app, step) {
  const open = app.flash.textOpen === step.id;
  const textBox = h('div', { class: 'pasted', hidden: !open }, step.text);
  const showText = step.text.trim() ? button(open ? STEP.hideText : STEP.showText, e => {
    textBox.hidden = !textBox.hidden;
    app.flash.textOpen = textBox.hidden ? null : step.id;
    e.target.textContent = textBox.hidden ? STEP.showText : STEP.hideText;
  }, { quiet: true, small: true }) : null;
  return [showText, textBox];
}

// The attempts, newest first, with their notes. `onDelete` gives each a Delete.
function attemptList(attempts, onDelete = null) {
  return attempts.length ? h('ol', { class: 'attempts' }, attempts.map(a => h('li', {},
    h('p', { class: 'attempt-head' },
      h('span', {}, formatDate(a.date)),
      h('span', {}, a.stayed ? STEP.stayed : STEP.didntStay),
      h('span', {}, UNITS.outOfTen(a.hardToStay))),
    [['wentWrong', LOG.wentWrong], ['wouldChange', LOG.wouldChange], ['feedback', LOG.feedback]]
      .filter(([key]) => a[key]).map(([key, label]) => h('div', { class: 'note' }, h('p', { class: 'note-label' }, label), h('p', {}, a[key]))),
    onDelete ? button(STEP.deleteAttempt, () => onDelete(a), { quiet: true, small: true }) : null))) : null;
}

export function stepScreen(app, { id }) {
  const data = app.data();
  const found = R.findStep(data, id);
  if (!found) {
    app.go('ladder', { replace: true });
    return null;
  }
  if (found.earlier) return earlierStepScreen(app, found.step);
  const { step } = found;
  const actions = R.allowedActions(step);
  const attempts = attemptsOn(data, step);
  const put = next => app.save({ ...app.data(), steps: app.data().steps.map(s => (s.id === next.id ? next : s)) });
  const counterText = s => STEP.counter(R.distractorForCounter(s.distractor), s.rehearsalCount, s.rehearsalTarget);
  // Tell a screen reader the new count, and the state if it changed.
  const announce = (before, after) => app.say(
    after.state !== before.state ? `${counterText(after)}. ${stateText(after.state)}` : counterText(after));

  // +1, with the how-did-it-feel question from the second run-through (L101, Q43).
  const plusOne = async () => {
    const pressed = R.addRunThrough(step);
    let next = pressed.step;
    if (pressed.ask) {
      let feel = null;
      while (!feel) {
        feel = await ask({
          body: [STEP.feelQuestion],
          buttons: R.FEELS.map(f => ({ label: STEP.feels[f], value: f })),
        });
      }
      next = R.recordFeel(next, feel);
    }
    // What the press left behind, so the undo is offered only while nothing else has
    // changed the step since (Q24).
    app.flash.lastPress = { stepId: step.id, at: Date.now(), press: pressed.press, left: JSON.stringify(next) };
    if (put(next)) announce(step, next);
  };
  const last = app.flash.lastPress?.stepId === step.id && app.flash.lastPress.left === JSON.stringify(step)
    && R.canUndoRunThrough(app.flash.lastPress.at, Date.now()) ? app.flash.lastPress : null;
  const undo = () => {
    delete app.flash.lastPress;
    const back = R.undoRunThrough(step, last.press);
    if (put(back)) announce(step, back);
  };

  const markReady = async () => {
    const yes = await ask({
      body: [FORM.sillyEasy],
      buttons: [{ label: COMMON.yes, value: true, primary: true }, { label: COMMON.no, value: false }],
      cancel: null,
    });
    if (yes === true) {
      delete app.flash.lastPress;
      const ready = R.markReadyNow(step, true);
      if (put(ready)) app.say(stateText(ready.state));
    } else if (yes === false) {
      tell(STEP.oneMore);
    }
  };

  const removeStep = async () => {
    const yes = await ask({
      body: [STEP.deleteQuestion(attempts.length)],
      buttons: [{ label: STEP.delete, value: true }, { label: STEP.keep, value: false, primary: true, safe: true }],
      cancel: false,
    });
    if (!yes) return;
    // The latest data, in case another copy of the app deleted the step or moved it to a
    // finished ladder while the question was open (Q119): then just show what's there now.
    if (!app.data().steps.some(s => s.id === step.id)) {
      app.render();
      return;
    }
    if (app.save(R.deleteStep(app.data(), step.id))) app.go('ladder', { replace: true });
  };

  const removeAttempt = async attempt => {
    const yes = await ask({
      body: [STEP.deleteAttemptQuestion],
      buttons: [{ label: STEP.deleteAttempt, value: true }, { label: STEP.keep, value: false, primary: true, safe: true }],
      cancel: false,
    });
    if (!yes) return;
    if (!app.data().steps.some(s => s.id === step.id)) { // as above (Q119)
      app.render();
      return;
    }
    app.save(R.deleteAttempt(app.data(), attempt.id));
  };

  const [showText, textBox] = pastedText(app, step);

  const leaveTo = target => () => {
    delete app.flash.lastPress;
    app.go(target);
  };
  const undoLink = last ? link(STEP.undo, undo) : null;
  const plusButton = button(STEP.plusOne, plusOne, { primary: true });

  const rehearsal = actions.includes('runThrough') ? h('section', { class: 'rehearsal' },
    h('p', { class: 'why' }, STEP.why),
    h('div', { class: 'counter' }, h('p', { class: 'count' }, counterText(step)), plusButton),
    step.rehearsalFeel.length ? h('p', { class: 'feels' }, step.rehearsalFeel.map(f => STEP.feelsInLine[f]).join(', ')) : null,
    R.asRehearsedAsItGets(step) ? h('p', {}, STEP.asRehearsed) : null,
    // Side by side with a clear gap, or one under the other on a narrow screen (BUGS.md 6).
    h('div', { class: 'links' }, undoLink, actions.includes('markReadyNow') ? link(STEP.markReadyNow, markReady) : null),
    step.readyEarly ? h('p', { class: 'hint' }, STEP.readyEarly(step.readyEarlyCount, step.readyEarlyTarget)) : null,
    actions.includes('logAttempt') ? button(STEP.logAttempt, leaveTo(`log/${step.id}`)) : null) : null;

  // When its minute is up, "Undo that +1" goes, without redrawing the screen.
  const after = () => {
    if (!undoLink) return;
    setTimeout(() => {
      if (document.activeElement === undoLink) plusButton.focus();
      undoLink.remove();
    }, last.at + R.UNDO_SECONDS * 1000 - Date.now());
  };

  return {
    tabs: 'ladder',
    back: 'ladder',
    after,
    node: h('div', { class: 'step' },
      h('h1', {}, step.title),
      whereTheStepIs(step),
      h('p', { class: 'values' }, rowText(step, data.person.pace)),
      step.when ? h('p', { class: 'date' }, formatDate(step.when)) : null,
      h('p', { class: `state state-${step.state}` }, stateText(step.state)),
      showText, textBox,
      rehearsal,
      attemptList(attempts, removeAttempt),
      h('div', { class: 'row' },
        button(STEP.edit, leaveTo(`edit/${step.id}`)),
        button(STEP.delete, removeStep, { quiet: true }))),
  };
}

// A step on an earlier ladder is kept to look back on, not changed: what it was, how it
// ended and its attempts, with nothing to rehearse, log, edit or delete.
function earlierStepScreen(app, step) {
  const data = app.data();
  const [showText, textBox] = pastedText(app, step);
  return {
    tabs: 'ladder',
    back: 'ladder',
    node: h('div', { class: 'step' },
      h('h1', {}, step.title),
      h('p', { class: 'values' }, rowText(step, data.person.pace)),
      step.when ? h('p', { class: 'date' }, formatDate(step.when)) : null,
      h('p', { class: `state state-${step.state}` }, stateText(step.state)),
      h('p', { class: 'from-earlier' }, STEP.fromEarlier),
      showText, textBox,
      attemptList(attemptsOn(data, step))),
  };
}

// ---------------------------------------------------------------- Log an attempt

export function logScreen(app, { id }) {
  const data = app.data();
  const step = data.steps.find(s => s.id === id);
  if (!step || step.state === 'planning') {
    app.go(step ? `step/${id}` : 'ladder', { replace: true });
    return null;
  }
  const day = today();
  const input = { date: day, stayed: null, hardToStay: null, rehearsedEnough: null, wentWrong: '', wouldChange: '', feedback: '' };
  const original = JSON.stringify(input);
  const changed = () => app.setDirty(JSON.stringify(input) !== original);
  const set = key => v => { input[key] = v; changed(); };

  // Future dates are blocked in the picker, and refused with a message where it can't (Q132).
  const date = textField({ label: LOG.date, value: day, type: 'date', max: day, onInput: set('date') });
  const stayed = choices({
    legend: LOG.stayed,
    options: [{ value: true, label: COMMON.yes }, { value: false, label: COMMON.no }],
    onChange: set('stayed'),
  });
  const hard = rating({ legend: LOG.hard, ends: LOG.ends, onChange: set('hardToStay') });
  // What the rating is of, under the question and read with it.
  const hardHintId = nextId('hard-hint');
  hard.querySelector('legend').after(h('p', { class: 'hint', id: hardHintId }, LOG.hardHint));
  hard.dataset.describe = hardHintId; // kept when an error is shown or cleared
  hard.setAttribute('aria-describedby', hardHintId);
  const wentWrong = textField({ label: LOG.wentWrong, multiline: true, onInput: set('wentWrong') });
  const wouldChange = textField({ label: LOG.wouldChange, multiline: true, onInput: set('wouldChange') });
  const feedback = textField({ label: LOG.feedback, multiline: true, onInput: set('feedback') });
  const enough = choices({
    legend: LOG.rehearsedEnough,
    options: [{ value: true, label: COMMON.yes }, { value: false, label: LOG.needMore }],
    onChange: set('rehearsedEnough'),
  });
  const fields = { date, stayed, hardToStay: hard, rehearsedEnough: enough };

  const save = () => {
    Object.values(fields).forEach(f => f.setError(null));
    // The latest data, in case another copy of the app deleted or resized the step (Q119).
    const latest = app.data().steps.find(s => s.id === step.id);
    if (!latest || latest.state === 'planning') {
      app.setDirty(false);
      app.go(latest ? `step/${step.id}` : 'ladder', { replace: true });
      return;
    }
    const result = R.logAttempt(app.data(), step.id, input, { now: now(), today: today() });
    if (!result.ok) {
      for (const [key, e] of Object.entries(result.errors)) fields[key].setError(e.kind === 'future' ? LOG.future : COMMON.required);
      revealFirstError(document.getElementById('main')); // BUGS.md 4
      return;
    }
    app.setDirty(false);
    if (!app.save(result.data)) {
      app.setDirty(true);
      return;
    }
    const { stateBefore, stateAfter } = result.attempt;
    app.flash.reply = {
      reply: result.reply, advice: result.advice, step: result.data.steps.find(s => s.id === step.id),
      settled: stateBefore !== 'settled' && stateAfter === 'settled', // this attempt settled the step
      completed: result.completed, // and it was the goal step: the ladder is complete
    };
    app.go('reply', { replace: true });
  };

  return {
    back: `step/${step.id}`,
    node: h('div', { class: 'form' },
      h('h1', {}, LOG.heading),
      date, stayed, hard,
      h('p', { class: 'learning' }, LOG.learning), // Q47
      wentWrong, wouldChange, feedback, enough,
      button(COMMON.save, save, { primary: true })),
  };
}

// The reply, on its own screen with one button, OK, back to the Ladder (L105, Q46, Q92).
// After the attempt that completes the ladder, the completion message goes under it, once.
export function replyScreen(app) {
  const r = app.flash.reply;
  if (!r) {
    app.go('ladder', { replace: true });
    return null;
  }
  const done = () => {
    delete app.flash.reply;
    app.go('ladder', { replace: true });
  };
  // The jelly, larger, in a pose that matches the reply (Q147).
  const look = replyScene(r.reply);
  const scene = createScene(look.from);
  scene.element.setAttribute('viewBox', LADDER_VIEW);
  return {
    node: h('div', { class: 'reply' },
      scene.element,
      h('p', { class: 'lead', tabindex: '-1' }, REPLIES[r.reply]),
      r.advice ? adviceNodes(r.advice, r.step, { nextTime: true }) : null,
      r.completed ? h('p', { class: 'completion' }, COMPLETE.message) : null,
      button(COMMON.ok, done, { primary: true })),
    // The climb shows as a move, two frames on. A step that has just settled gets a moment
    // of confetti (the look stage), once.
    after: () => {
      if (look.to !== look.from) requestAnimationFrame(() => requestAnimationFrame(() => scene.update(look.to)));
      if (!r.settled || r.celebrated) return;
      r.celebrated = true;
      confetti();
    },
  };
}
