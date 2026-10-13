// The language rule (PLAN.md L55-L66, Q97, Q98, Q121): nothing the person sees uses the
// banned words. Every file the app serves is scanned, comments and all, so nothing slips
// through from code into a screen.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PUBLIC = fileURLToPath(new URL('../public/', import.meta.url));
const SERVED = ['.html', '.js', '.css', '.json', '.webmanifest', '.svg'];

// The table in L57-L66, plus "anxiety" on its own (Q119).
const BANNED = [
  'exposure', 'desensitisation', 'desensitization', 'systematic', 'hierarchy',
  'anxiety', 'SUDS', 'distress',
  'extinction', 'habituation', 'reinforcement', 'conditioning',
  'trigger', 'phobia', 'disorder', 'symptom',
  'therapy', 'treatment', 'patient', 'client', 'intervention',
  'homework', 'assignment', 'relapse', 'avoidance',
];
// A banned word with its endings ("triggers", "triggered"), never a shorter word that
// happens to start the same way ("condition" is fine, Q98).
const ENDINGS = '(?:s|es|ed|d|ing|al|ally|ic)?';
const banned = new RegExp(`\\b(?:${BANNED.join('|')})${ENDINGS}\\b`, 'gi');

// The one exception (L55, L64, Q97): these exact phrases may name a therapist.
const ALLOWED = ['a private CBT therapist', 'accredited CBT therapists'];
const therapist = /\btherapists?\b/gi;

function servedFiles(dir) {
  return readdirSync(dir, { recursive: true })
    .map(f => join(dir, f))
    .filter(f => SERVED.includes(extname(f)));
}

function findings(text) {
  const found = [...text.matchAll(banned)].map(m => m[0]);
  const withoutAllowed = ALLOWED.reduce((t, phrase) => t.split(phrase).join(''), text);
  found.push(...[...withoutAllowed.matchAll(therapist)].map(m => m[0]));
  return found;
}

describe('A grep of every string in the interface finds none of the banned words', () => {
  const files = servedFiles(PUBLIC);

  it('scans the app\'s files', () => {
    assert.ok(files.length >= 10, `only found ${files.length} files`);
  });

  for (const file of files) {
    it(file.slice(PUBLIC.length), () => {
      assert.deepEqual(findings(readFileSync(file, 'utf8')), []);
    });
  }

  it('the check itself catches banned words and their endings, and lets the exceptions through', () => {
    assert.deepEqual(findings('Triggers, exposure and a phobia.'), ['Triggers', 'exposure', 'phobia']);
    assert.deepEqual(findings('a private CBT therapist; the BABCP register of accredited CBT therapists'), []);
    assert.deepEqual(findings('see a therapist'), ['therapist']);
    assert.deepEqual(findings('a condition that affects your breathing; avoided events'), []);
  });
});

describe('British spelling in the words on screen (L55)', () => {
  it('strings.js has none of the common American spellings', () => {
    const text = readFileSync(join(PUBLIC, 'strings.js'), 'utf8');
    const american = /\b(?:color|favorite|center|behavior|realiz\w*|organiz\w*|practicing|practiced|apologiz\w*|recogniz\w*)\b/gi;
    assert.deepEqual(text.match(american) ?? [], []);
  });
});
