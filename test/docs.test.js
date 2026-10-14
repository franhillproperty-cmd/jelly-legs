// Stage 4: TESTING.md keeps every checklist line from PLAN.md's Testing section, and every
// entry in BUGS.md is complete and points at checks that exist.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const read = name => readFileSync(join(ROOT, name), 'utf8').replace(/\r\n/g, '\n');
const plan = read('PLAN.md');
const testing = read('TESTING.md');
const bugs = read('BUGS.md');
const testCode = readdirSync(join(ROOT, 'test')).filter(f => f.endsWith('.js')).map(f => read(join('test', f))).join('\n');

const testingSection = plan.slice(plan.indexOf('## Testing'), plan.indexOf('## Content only Fran can write'));
const items = text => [...text.matchAll(/^- \[[ x]\] (.+)$/gm)].map(m => m[1]);
// A hand test is named by its opening words.
const handTests = items(testing);
const handTestExists = name => handTests.some(line => line.startsWith(name));

describe('TESTING.md copies PLAN.md\'s three checklists', () => {
  it('every checklist line in PLAN.md is in TESTING.md, word for word', () => {
    const planItems = items(testingSection);
    assert.equal(planItems.length, 31);
    const ours = items(testing);
    for (const line of planItems) assert.ok(ours.some(o => o.startsWith(line)), line);
  });

  it('under the same three headings, and the review by someone who didn\'t build it', () => {
    for (const heading of ['**Unit tests on `rules.js`**', '**By hand, on a phone, as a first-time user**', '**Break it on purpose**', '**Review by someone who didn\'t build it**']) {
      assert.ok(testing.includes(heading), heading);
    }
  });

  it('a ticked item says when and how it was checked', () => {
    for (const line of testing.split('\n').filter(l => l.startsWith('- [x]'))) {
      assert.match(line, /\((Checked|Passed|Ticked)[^)]*\d{1,2} [A-Z][a-z]{2} 20\d\d/, line.slice(0, 80));
    }
  });
});

describe('BUGS.md', () => {
  const entries = bugs.split(/^## /m).slice(1).map(text => ({ number: Number(text.match(/^(\d+)\./)?.[1]), text }));

  it('numbered from the newest down, with none missing', () => {
    assert.ok(entries.length >= 7);
    assert.deepEqual(entries.map(e => e.number), entries.map((_, i) => entries.length - i));
  });

  it('each entry says when it was found, what happened, why, the fix, the commit and how to check it', () => {
    for (const { number, text } of entries) {
      for (const part of ['Found', 'What happened', 'Why', 'Fix', 'Commit', 'Check']) {
        assert.match(text, new RegExp(`^- \\*\\*${part}:\\*\\* \\S`, 'm'), `bug ${number}: ${part}`);
      }
    }
  });

  it('every hand test an entry points to is in TESTING.md, and every unit test in test/', () => {
    for (const { number, text } of entries) {
      const check = text.match(/^- \*\*Check:\*\* (.+)$/m)[1];
      for (const [, name] of check.matchAll(/hand tests? "([^"]+)"/g)) {
        assert.ok(handTestExists(name), `bug ${number}: hand test "${name}"`);
      }
      for (const [, first, second] of check.matchAll(/"([^"]+)" (?:and "([^"]+)" )?in TESTING\.md/g)) {
        for (const name of [first, second].filter(Boolean)) assert.ok(handTestExists(name), `bug ${number}: "${name}"`);
      }
      for (const [, name] of check.matchAll(/unit tests? '([^']+)'/g)) {
        assert.ok(testCode.includes(name), `bug ${number}: unit test '${name}'`);
      }
    }
  });
});
