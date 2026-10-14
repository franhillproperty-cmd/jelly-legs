// Small building blocks for the screens: an element helper, dialogs and panels, and the
// form controls every screen shares. No words live here; they come from strings.js.

import { COMMON } from './strings.js';

let uid = 0;
export const nextId = prefix => `${prefix}-${++uid}`;

// h('p', { class: 'x', onclick: fn }, 'text', child, ...)
export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props ?? {})) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'class') el.className = value;
    else if (key === 'text') el.textContent = value;
    else if (key.startsWith('on')) el.addEventListener(key.slice(2), value);
    else if (key in el && typeof value !== 'string') el[key] = value;
    else el.setAttribute(key, value === true ? '' : value);
  }
  append(el, children);
  return el;
}

function append(el, children) {
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
}

// Like replaceChildren, but leaves out empty slots instead of printing "null".
export function fill(el, ...children) {
  el.replaceChildren();
  append(el, children);
  return el;
}

export const paragraphs = list => list.map(text => h('p', {}, text));

// A modal dialog. Resolves with the pressed button's value, or `cancel` if dismissed.
// It is named by its title, or else by its first paragraph, and described by its body,
// so a screen reader reads the question, not just the first button. Focus starts on the
// button marked `safe` (Stay, Keep, Cancel) where there is one.
export function ask({ title, body = [], buttons, cancel = null }) {
  return new Promise(resolve => {
    const titleId = nextId('dialog-title');
    const bodyId = nextId('dialog-body');
    const nodes = body.map(b => (typeof b === 'string' ? h('p', {}, b) : b));
    const name = title ? h('h2', { id: titleId }, title) : null;
    if (!name && nodes[0]) nodes[0].id ||= titleId;
    const d = h('dialog', { class: 'dialog', 'aria-labelledby': titleId, 'aria-describedby': title ? bodyId : null },
      name,
      h('div', { id: bodyId }, nodes),
      h('div', { class: 'dialog-buttons' },
        buttons.map(b => h('button', {
          type: 'button',
          class: `button ${b.primary ? 'primary' : ''} ${b.quiet ? 'quiet' : ''}`,
          autofocus: b.safe ? true : null,
          onclick: () => close(b.value),
        }, b.label))));
    const close = value => {
      d.close();
      d.remove();
      resolve(value);
    };
    d.addEventListener('cancel', e => {
      e.preventDefault();
      close(cancel);
    });
    document.body.append(d);
    d.showModal();
  });
}

export const tell = (body, label = COMMON.ok) => ask({ body: [].concat(body), buttons: [{ label, value: true, primary: true, safe: true }], cancel: true });

// A full-screen panel over the current screen (Q61), with a back control at the top left.
// Each time its content is filled, focus moves to the new heading or first line, so a
// screen reader reads the new step of the panel. `canClose` is asked before the back
// control or Escape closes it, so a panel with typed input can ask first (Q63).
export function panel({ label, canClose = async () => true } = {}) {
  const d = h('dialog', { class: 'panel', 'aria-label': label });
  const content = h('div', { class: 'panel-content' });
  const close = () => {
    d.close();
    d.remove();
  };
  // A second Escape or back gesture with no tap in between can't be held back, so the
  // browser may have closed the panel by the time the person answers; Stay puts it back,
  // with what they typed and where they were.
  const leave = async () => {
    const was = document.activeElement;
    if (await canClose()) close();
    else if (!d.open && d.isConnected) {
      d.showModal();
      if (d.contains(was)) was.focus();
    }
  };
  d.append(h('div', { class: 'topbar' }, h('button', { type: 'button', class: 'back', onclick: leave }, COMMON.back)), content);
  d.addEventListener('cancel', e => {
    e.preventDefault();
    leave();
  });
  document.body.append(d);
  d.showModal();
  return {
    content,
    close,
    fill: (...nodes) => {
      fill(content, ...nodes);
      const start = content.querySelector('h2, p');
      if (start) {
        start.tabIndex = -1;
        start.focus();
      }
    },
  };
}

// A labelled text box. `multiline` makes a textarea. `hint` sits between the label and the
// box; `after` is a line under the box (L53).
export function textField({ label, value = '', hint, after, multiline = false, type = 'text', onInput, ...rest }) {
  const id = nextId('f');
  const input = h(multiline ? 'textarea' : 'input', {
    id, class: 'input', type: multiline ? null : type, rows: multiline ? 4 : null,
    oninput: e => onInput?.(e.target.value), ...rest,
  });
  input.value = value ?? '';
  const hintEl = hint ? h('p', { class: 'hint', id: `${id}-hint` }, hint) : null;
  const afterEl = after ? h('p', { class: 'hint', id: `${id}-after` }, after) : null;
  const error = h('p', { class: 'error', id: `${id}-error`, role: 'alert' });
  input.dataset.describe = [hintEl?.id, afterEl?.id].filter(Boolean).join(' ');
  if (input.dataset.describe) input.setAttribute('aria-describedby', input.dataset.describe);
  const wrap = h('div', { class: 'field' }, h('label', { for: id }, label), hintEl, input, afterEl, error);
  return Object.assign(wrap, { input, setError: msg => setError(error, input, msg) });
}

// Show or clear an error, keeping any hint the control is already described by.
function setError(errorEl, control, message) {
  errorEl.textContent = message ?? '';
  if (!control) return;
  const ids = [control.dataset.describe, message ? errorEl.id : null].filter(Boolean).join(' ');
  if (ids) control.setAttribute('aria-describedby', ids);
  else control.removeAttribute('aria-describedby');
  control.toggleAttribute('aria-invalid', !!message);
}

// A set of choices shown as large buttons, backed by real radio inputs.
export function choices({ legend, options, value, onChange, disabled = false, columns }) {
  const name = nextId('c');
  const error = h('p', { class: 'error', id: `${name}-error`, role: 'alert' });
  const fieldset = h('fieldset', { class: `choices ${columns ? `cols-${columns}` : ''}` },
    legend ? h('legend', {}, legend) : null,
    h('div', { class: 'choice-row' }, options.map(o => {
      const input = h('input', {
        type: 'radio', name, value: String(o.value), checked: o.value === value,
        disabled: disabled || o.disabled, onchange: () => onChange?.(o.value),
      });
      return h('label', { class: `choice ${o.disabled ? 'is-disabled' : ''}` }, input, h('span', {}, o.label));
    })),
    error);
  return Object.assign(fieldset, {
    setError: msg => setError(error, fieldset, msg),
    setValue: v => fieldset.querySelectorAll('input').forEach(i => { i.checked = i.value === String(v); }),
    setDisabled: off => {
      fieldset.classList.toggle('is-disabled', off);
      fieldset.querySelectorAll('input').forEach(i => { i.disabled = off; });
    },
  });
}

// 0 to 10 as eleven tap buttons in two rows, none picked at first (Q123), with the two
// ends labelled underneath.
export function rating({ legend, value = null, ends, onChange }) {
  const group = choices({
    legend,
    options: Array.from({ length: 11 }, (_, n) => ({ value: n, label: String(n) })),
    value, onChange, columns: 6,
  });
  group.querySelector('.choice-row').after(
    h('div', { class: 'ends', 'aria-hidden': 'true' }, h('span', {}, ends.low), h('span', {}, ends.high)));
  group.querySelector('legend')?.append(h('span', { class: 'visually-hidden' }, ` (0 ${ends.low}, 10 ${ends.high})`));
  return group;
}

// A checkbox shown as a full-width row.
export function toggle({ label, checked, onChange, disabled = false }) {
  return h('label', { class: `toggle ${disabled ? 'is-disabled' : ''}` },
    h('input', { type: 'checkbox', checked, disabled, onchange: e => onChange?.(e.target.checked) }),
    h('span', {}, label));
}

export function button(label, onclick, { primary = false, quiet = false, small = false, disabled = false } = {}) {
  return h('button', {
    type: 'button', class: `button ${primary ? 'primary' : ''} ${quiet ? 'quiet' : ''} ${small ? 'small' : ''}`,
    onclick, disabled,
  }, label);
}

export function link(label, onclick) {
  return h('button', { type: 'button', class: 'link', onclick }, label);
}

export function outLink(label, href) {
  return h('a', { href, target: '_blank', rel: 'noopener noreferrer', class: 'out' }, label);
}

// A one-second burst of orange and blue-grey confetti (the look stage). None when the phone
// asks for less motion.
export function confetti() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const box = h('div', { class: 'confetti', 'aria-hidden': 'true' });
  for (let i = 0; i < 48; i++) {
    const angle = Math.random() * Math.PI * 2;
    const reach = 90 + Math.random() * 170;
    const piece = h('i');
    piece.style.setProperty('--c', i % 2 ? 'var(--orange)' : 'var(--blue-grey)');
    piece.style.setProperty('--x', `${Math.round(Math.cos(angle) * reach)}px`);
    piece.style.setProperty('--y', `${Math.round(Math.sin(angle) * reach + 120)}px`);
    piece.style.setProperty('--r', `${Math.round(Math.random() * 720 - 360)}deg`);
    box.append(piece);
  }
  document.body.append(box);
  setTimeout(() => box.remove(), 1000);
}

export function notice(...children) {
  return h('div', { class: 'notice', role: 'status' }, ...children);
}
