// The shell: which screen shows for which address, the back control, the tab bar, and
// asking before a half-filled form is thrown away. Addresses are #/name so the phone's
// own back button moves between screens exactly as the back control does (Q71).

import * as store from './store.js';
import { h, ask, tell, fill } from './ui.js';
import { COMMON, TABS, FORM, SETTINGS } from './strings.js';
import { welcomeScreen, setupScreen } from './screens/first-run.js';
import { breatheScreen } from './screens/breathe.js';
import { ladderScreen } from './screens/ladder.js';
import { stepFormScreen, stepScreen, logScreen, replyScreen } from './screens/step.js';
import { settingsScreen } from './screens/settings.js';

const ROUTES = {
  welcome: welcomeScreen,
  setup: setupScreen,
  ladder: ladderScreen,
  breathe: breatheScreen,
  settings: settingsScreen,
  add: stepFormScreen,
  edit: stepFormScreen,
  step: stepScreen,
  log: logScreen,
  reply: replyScreen,
};
const FIRST_RUN = ['welcome', 'setup'];
const FOCUSABLE = 'a[href], button, input, textarea, select';

const root = document.getElementById('app');
const say = document.getElementById('say');
let current = null; // { hash, name }
let dirty = false;
let leaving = false;
let replacing = false;
let ignoreNextHash = false;
let lastDay = store.today();
const visited = []; // hashes, oldest first, for the back control

// The bars at the bottom grow with the phone's text size; keep the page clear of them (Q70).
const footerSize = new ResizeObserver(([entry]) => {
  document.documentElement.style.setProperty('--footer-h', `${entry.target.offsetHeight}px`);
});

function parse(hash) {
  const [path, query = ''] = hash.replace(/^#\/?/, '').split('?');
  const [name, id] = path.split('/');
  return { name: name || 'ladder', id, query: Object.fromEntries(new URLSearchParams(query)) };
}

async function confirmDiscard() {
  const choice = await ask({
    body: [FORM.discard],
    buttons: [{ label: FORM.leave, value: true }, { label: FORM.stay, value: false, primary: true, safe: true }],
    cancel: false,
  });
  if (choice) dirty = false;
  return choice;
}

export const app = {
  data: () => store.get(),
  // Store new data. If the phone refuses, say so and change nothing. Otherwise, once the
  // current action has finished, redraw the screen, unless the action went on to another
  // screen or the screen already shows the change (redraw: false).
  save(next, { redraw = true } = {}) {
    if (!store.save(next)) {
      tell(COMMON.saveFailed);
      return false;
    }
    if (redraw) queueMicrotask(() => { if (!leaving) render(); });
    return true;
  },
  // Things one screen hands to the next without storing them (a reply, a suggestion).
  flash: {},
  setDirty(value) { dirty = value; },
  // Go to another screen, asking first if a form here has unsaved input (Q63).
  async go(target, { replace = false } = {}) {
    if (dirty && !(await confirmDiscard())) return false;
    leaving = true;
    const hash = `#/${target}`;
    if (location.hash === hash) {
      render();
      return true;
    }
    replacing = replace;
    if (replace) location.replace(hash);
    else location.hash = hash;
    return true;
  },
  // True if nothing here is unsaved, or the person agrees to lose it.
  canLeave: async () => !dirty || confirmDiscard(),
  async back(fallback = 'ladder') {
    if (dirty && !(await confirmDiscard())) return;
    leaving = true;
    if (visited.length > 1) history.back();
    else app.go(fallback, { replace: true });
  },
  // Tell a screen reader what just changed on this screen.
  say(text) {
    say.textContent = '';
    setTimeout(() => { say.textContent = text; }, 50);
  },
  render: () => render(),
};

function tabBar(active) {
  return h('nav', { class: 'tabbar' },
    ['ladder', 'breathe', 'settings'].map(name => h('a', {
      href: `#/${name}`, class: 'tab', 'aria-current': name === active ? 'page' : null,
    }, TABS[name])));
}

function render() {
  leaving = false;
  dirty = false;
  lastDay = store.today();
  const data = store.get();
  let { name, id, query } = parse(location.hash);
  if (!ROUTES[name]) name = 'ladder';
  // Until Set-up is saved, only Welcome and Set-up exist (Q65); after it, Set-up never runs
  // again (Q64), and the welcome is reached only from Settings (L74).
  if (!data.person && !FIRST_RUN.includes(name)) return app.go('welcome', { replace: true });
  if (data.person && name === 'setup') return app.go('ladder', { replace: true });
  if (data.person && name === 'welcome' && query.from !== 'settings') return app.go('ladder', { replace: true });

  if (name !== 'setup') delete app.flash.setup; // leaving Set-up throws its half-filled form away
  const redraw = current?.hash === location.hash; // the same screen again, after a save
  const scrollY = window.scrollY;
  const focusables = [...root.querySelectorAll(FOCUSABLE)];
  const focusIndex = focusables.indexOf(document.activeElement);

  const screen = ROUTES[name](app, { id, query });
  if (!screen) return undefined; // the screen sent the person somewhere else
  current = { hash: location.hash, name };
  const tabs = screen.tabs ? tabBar(screen.tabs) : null;
  const footer = screen.bar || tabs ? h('div', { class: 'footer' }, screen.bar ?? null, tabs) : null;
  fill(root,
    screen.back ? h('div', { class: 'topbar' },
      h('button', { type: 'button', class: 'back', onclick: () => app.back(screen.back) }, COMMON.back)) : null,
    h('main', { id: 'main', tabindex: '-1', class: `screen screen-${name}` }, screen.node),
    footer);
  footerSize.disconnect();
  if (footer) footerSize.observe(footer);
  else document.documentElement.style.setProperty('--footer-h', '0px');

  if (redraw) {
    // Keep the person's place: the same scroll position, and focus back on the control
    // they were using.
    window.scrollTo(0, scrollY);
    if (focusIndex >= 0) root.querySelectorAll(FOCUSABLE)[focusIndex]?.focus({ preventScroll: true });
  } else {
    window.scrollTo(0, 0);
    const start = root.querySelector('h1') ?? root.querySelector('main [tabindex="-1"]') ?? root.querySelector('main');
    start.tabIndex = -1;
    start.focus({ preventScroll: true });
  }
  screen.after?.({ redraw });
  return undefined;
}

// The phone's back button, or any change of address: ask before losing a half-filled form,
// and if the person stays, put the address back without leaving a stray history entry.
window.addEventListener('hashchange', async () => {
  if (ignoreNextHash) {
    ignoreNextHash = false;
    return;
  }
  const target = location.hash;
  const wasBack = visited.length > 1 && visited[visited.length - 2] === target;
  if (dirty && !leaving && current) {
    const stay = !(await confirmDiscard());
    if (stay) {
      ignoreNextHash = true;
      if (wasBack) history.forward();
      else history.back();
      return;
    }
  }
  if (replacing) visited[visited.length - 1] = target;
  else if (wasBack) visited.pop();
  else visited.push(target);
  replacing = false;
  render();
});

// Another copy of the app saved: redraw, unless the person is typing here (Q119).
store.onOutsideChange(() => {
  if (!dirty) render();
});

// Back on the phone the next day: redraw so "today" is today (L87).
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && store.today() !== lastDay && !dirty) render();
});

store.load();
store.askToKeep();
// Reopened part-way through Set-up: start again at Welcome (Q65).
if (!store.get().person && parse(location.hash).name === 'setup') history.replaceState(null, '', '#/welcome');
visited.push(location.hash || '#/ladder');
render();
if (store.takeRecovered()) tell(SETTINGS.recovered);
