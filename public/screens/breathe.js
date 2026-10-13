// Breathe (L84-L87): the exercise, the last seven days, and I practised today.

import * as R from '../rules.js';
import { h, paragraphs, button, ask, notice } from '../ui.js';
import { BREATHE, SETUP, WEEKDAY_INITIALS, WEEKDAYS } from '../strings.js';
import { formatDate } from '../format.js';
import { today } from '../store.js';

function weekday(ymd) {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
}

const encouragementText = count => {
  const band = R.encouragement(count);
  return band === 'some' ? BREATHE.encouragement.some(count) : BREATHE.encouragement[band];
};

export function breatheScreen(app) {
  const data = app.data();
  const days = R.lastSevenDays(data.breathing, today());
  const count = days.filter(d => d.ticked).length;
  const banner = app.flash.breatheBanner; // straight after Set-up only (Q58)
  delete app.flash.breatheBanner;

  // "Today" is the day of the press, not the day the screen was drawn (L87). Pressing it on
  // a day already ticked offers to un-tick it (Q24).
  const practised = async () => {
    const day = today();
    const result = R.tickToday(app.data().breathing, day);
    if (!result.already) {
      if (app.save({ ...app.data(), breathing: result.breathing })) {
        app.say(encouragementText(R.breathingCount(result.breathing, day)));
      }
      return;
    }
    const untick = await ask({
      body: [BREATHE.alreadyTicked, BREATHE.untickQuestion],
      buttons: [{ label: BREATHE.untick, value: true }, { label: BREATHE.keep, value: false, primary: true, safe: true }],
      cancel: false,
    });
    if (!untick) return;
    const breathing = R.untickToday(app.data().breathing, day);
    if (app.save({ ...app.data(), breathing })) app.say(encouragementText(R.breathingCount(breathing, day)));
  };

  // A glowing circle to breathe with: it swells twice (the breath in, then the short sip
  // to fill right up), sinks slowly for about six seconds (the long breath out), and
  // repeats while it's going. Still, with no control, when the phone asks for less motion.
  const going = app.flash.breathCircle === true;
  const circle = h('div', { class: `breath ${going ? 'is-going' : ''}`, 'aria-hidden': 'true' }, h('div', { class: 'breath-glow' }));
  const control = button(going ? BREATHE.stop : BREATHE.start, () => {
    const on = !circle.classList.contains('is-going');
    circle.classList.toggle('is-going', on);
    app.flash.breathCircle = on;
    control.textContent = on ? BREATHE.stop : BREATHE.start;
    control.setAttribute('aria-pressed', String(on));
  }, { small: true });
  control.setAttribute('aria-pressed', String(going));
  control.classList.add('breath-control');

  return {
    tabs: 'breathe',
    node: h('div', { class: 'breathe' },
      h('h1', {}, BREATHE.heading),
      banner ? notice(SETUP.savedBanner) : null,
      h('p', { class: 'subtitle' }, BREATHE.subtitle),
      paragraphs(BREATHE.paragraphs),
      circle,
      h('div', { class: 'breath-row' }, control),
      h('ol', { class: 'strip' }, days.map(d => h('li', {
        class: d.ticked ? 'ticked' : '',
        'aria-label': `${WEEKDAYS[weekday(d.date)]} ${formatDate(d.date)}: ${d.ticked ? BREATHE.ticked : BREATHE.notTicked}`,
      }, h('span', { class: 'day', 'aria-hidden': 'true' }, WEEKDAY_INITIALS[weekday(d.date)]),
        h('span', { class: 'mark', 'aria-hidden': 'true' })))),
      h('p', { class: 'encouragement' }, encouragementText(count)),
      button(BREATHE.practised, practised, { primary: true })),
  };
}
