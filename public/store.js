// Everything the person types lives here, in this browser's storage on this phone, under
// one key (L113, Q114). Nothing is sent anywhere.

import { readStored, serialise, localDate } from './rules.js';

const KEY = 'jelly-legs';
const listeners = new Set();
let data;
let recovered = false;

export const now = () => new Date().toISOString();
export const today = () => localDate(new Date());

function readRaw() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

// Read what's on the phone. Unreadable data is kept aside and the app starts fresh (Q108).
export function load() {
  const result = readStored(readRaw());
  data = result.data;
  recovered = result.recovered;
  if (recovered) write(data);
  return data;
}

export const get = () => data;

// Shown once after a fresh start from unreadable data (Q108).
export function takeRecovered() {
  const was = recovered;
  recovered = false;
  return was;
}

function write(next) {
  try {
    localStorage.setItem(KEY, serialise(next, now()));
    return true;
  } catch {
    return false;
  }
}

// Store a new version of everything. If the phone refuses, nothing changes and this
// returns false.
export function save(next) {
  if (!write(next)) return false;
  data = next;
  return true;
}

// Called when another copy of the app, open elsewhere on this phone, saves.
export function onOutsideChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// The app open twice (home-screen icon and a tab): when the other copy saves, read it
// again so this copy never writes over newer changes (Q119).
window.addEventListener('storage', e => {
  if (e.key !== KEY) return;
  data = readStored(e.newValue).data;
  listeners.forEach(fn => fn(data));
});

// Ask the browser to keep this site's data rather than clear it when space runs low (Q114).
export function askToKeep() {
  navigator.storage?.persist?.().catch(() => {});
}
