# Gaps

What is unfinished, provisional, or waiting for Fran. Every on-screen word lives in `public/strings.js`; the keys below are the names to look for there. Q numbers refer to the answered questions in `QUESTIONS.md`, L numbers to lines of `PLAN.md`.

## 1. On screen in square brackets

Nothing in PLAN.md or the answers gives words for these, so they show as bracketed placeholders.

| Where it appears | Key | On screen now |
| --- | --- | --- |
| Set-up, the box for a situation in the person's own words (L81) | `SETUP.ownSituation` | [A situation in your own words] |
| Set-up, the button to remove one of the person's own situations (Q59) | `COMMON.remove` | [Remove] |
| Step screen, the "Show the text" button once the text is showing (Q69) | `STEP.hideText` | [Hide the text] |
| Reply screen and the make-it-smaller message, when the person picks what to turn down (Q5, Q135) | `SMALLER.whichToTurnDown` | [Which would you like to turn down?] |
| Any save the phone refuses (storage full, or blocked in some private-browsing modes) (Q114) | `COMMON.saveFailed` | [The phone couldn't save that. Fran to write this message.] |

## 2. Drafts and decisions waiting for Fran

### Marked FRAN in the answers

| Q | What | Where | Now |
| --- | --- | --- | --- |
| Q44, Q133 | Whether the "plus two" stays at all | `REHEARSAL_BOOST` in `public/rules.js` | 2 |
| Q109 | Test Export on her phone, opened from the home-screen icon | `exportData` in `public/screens/parts.js` | plain download, the share sheet on an iPhone home-screen app |
| Q110 | Git author for this repository | `.git/config` | Fran <franhillproperty@gmail.com> |
| Q120 | An own domain: only before anyone else uses the app, since moving later strands their data | (Railway, stage 3) | the Railway address |

### Values PLAN.md marks "Fran to confirm" (Q79)

| What | Where | Now |
| --- | --- | --- |
| The register link | `SIGNPOST.registerUrl` | https://www.cbtregisteruk.com/ |
| The three paces | `PACE` in `public/rules.js` | slow 110, average 140, quick 170 words a minute |
| The plus two | `REHEARSAL_BOOST` | 2 (above) |

### Content drafts, used word for word (Q73); Fran may rewrite any

- **Welcome** (`WELCOME.paragraphs`), with ", not treatment" dropped from the last paragraph (Q96).
- **The four replies** (`REPLIES`): reply one starts "You went. That matters, even though it doesn't count as a step yet." (Q100); reply three says "more than once" (Q101).
- **Breathe** (`BREATHE`): the exercise as in L85, and the encouragement lines, with the 0 line now "Nothing ticked in the last 7 days. One go, now, counts." (Q91).
- **The example ladder** (`EXAMPLE_LADDER`), replaced by the Q95 table. On screen each row reads like a step row (title, then length and time, people, can see them, matters); the "What changed" column is not shown.

  | Step | Words | People | Can see them | Matters | What changed |
  | --- | --- | --- | --- | --- | --- |
  | Say two lines out loud, alone, with the door shut | 25 | 0 | not at all | not much | (start) |
  | Read the same two lines to one friend in their kitchen | 25 | 1 | clearly | not much | people |
  | Read a short paragraph to that friend | 50 | 1 | clearly | not much | length |
  | The same paragraph to three people you know | 50 | 3 | clearly | not much | people |
  | A longer passage to the same three | 100 | 3 | clearly | not much | length |
  | The same passage with one person you don't know there | 100 | 4 | clearly | not much | one stranger |
  | The same passage at a small gathering of ten | 100 | 10 | clearly | not much | people |
  | A longer reading, same gathering | 200 | 10 | clearly | not much | length |
  | The same reading somewhere it matters a bit, a service or a club | 200 | 10 | clearly | somewhat | matters |
  | The same reading to a big room, lights on you, faces blurred | 200 | 500 | barely | somewhat | people (seeing less is easier, so it doesn't count) |
  | The same room, and this time you can see them | 200 | 500 | clearly | somewhat | can see them |
  | A full page in that room | 400 | 500 | clearly | somewhat | length |

### Wording written in the answers, listed for Fran to put in her own voice

| Q | Key | Words |
| --- | --- | --- |
| Q18 | `FORM.breathingNudge` | A week of the breathing exercise before your first step makes the step easier. You've done [N] of the last 7 days. |
| Q19 | `EARLY_CAUTION.text`, `.deadline` | This one matters a lot, and you've settled fewer than three steps. Early steps work best where the stakes are low. If this moment is being forced on you (a work presentation, a family occasion), add two or three smaller steps before it: the same words, in front of people who don't matter. / They need to fit before [date]. |
| Q20 | `LADDER.notices.tooBig` | That last step came in big. Make the next new one so small it feels silly doing it. |
| Q26 | `SUGGEST.lastTimeRating`, `.lastTimeDidntStay` | Last time: 7 out of 10. / Last time: didn't stay. |
| Q31 | `SMALLER.keepGoing` | One stranger doesn't feel easy yet, and that's fine. Keep going with people you know and stretch a different dial. Come back to this when it feels silly-easy. |
| Q34, Q6 | `SUGGEST.nothingBetween`, `.repeat`, `.top` | There's nothing between your last step and this one on [dial]. Try stretching a different one. / Do your last step again / You're at the top of this ladder. |
| Q46 | `SMALLER.nextTime` | Next time, try turning [dial] down: [old] → [new]. |
| Q47 | `LOG.learning` | This is where the learning is. The embarrassment is part of it, and you'll remember it far longer than anyone else in the room will. |
| Q60 | `VENUE.clubsStartSmall` | Clubs can usually start you small: a sentence introducing yourself as a guest, a one-minute report, a short answer in the table-topics round. Ask. |
| Q65 | `WELCOME.importLink` | Used Jelly Legs on another phone? Import your file. |
| Q75 | `LADDER.notices.findSomewhere`, `.findSomewhereLink` | Your next steps have more people in them. Time to find somewhere to speak regularly. / Find somewhere |
| Q75 | `LADDER.checkInPrompt` | Four weeks on. How frightening does each of these feel now? |
| Q75 | `LADDER.empty` | Your ladder starts here. Add a step, or let the app suggest one. This is the shape a ladder can take: |
| Q75 | `ONE_THING` | More than one thing has changed / Compared with your last settled step: / (one line per change, e.g. "Length: 25 → 50 words") / Changing one thing at a time keeps each step easy. / Change one back / Keep it anyway |
| Q75 | `SMALLER.notQuite`, `.turnDown`, `.savedAsPlanning` | Not quite small enough yet. Try turning [dial] down: [old] → [new]. Saved as planning until it feels silly-easy. |
| Q75 | `STEP.feelQuestion`, `.feels` | Compared with last time, that was: / Easier / About the same / Harder |
| Q75 | `SUGGEST.question` | Which would you like to stretch a little? |
| Q75 | `STEP.readyEarly` | Marked ready after [N] of [M] run-throughs. |
| Q76 | `FORM.discard`, `.leave`, `.stay` | Leave without saving? What you've typed will be lost. / Leave / Stay |
| Q76 | `STEP.deleteQuestion` | Delete this step and its [N] attempts? There's no undo. |
| Q76 | `SETTINGS.deleteFirst`, `.deleteSecond` | Delete everything on this phone? Your ladder, your attempts, your breathing days and your settings. / Last chance. There's no undo. Export a copy first if you want one. |
| Q76 | `SETTINGS.importConfirm`, `.importRefused`, `.imported` | Replace what's on this phone with this file? / That isn't a Jelly Legs file this version can read. Nothing has been changed. / Imported. Your ladder's back. |
| Q76 | `SETTINGS.exportNote` | Everything lives only on this phone. Export a copy to keep it safe, or to move it to another phone. |
| Q76 | `COMMON.required`, `.wholeNumber` | Needed before you can save. / A whole number, [min] or more. |
| Q76 | `TIMING.tryAgain` | That came out at [N] words a minute, which is outside the range the app can use. Try again at your normal reading pace. |
| Q76 | `NOT_FOUND` | Nothing here. / Back to Jelly Legs |
| Q77 | `TIMING.passage` | The 99-word passage about a quiet morning. |
| Q88 | `SETUP.situationsLabel` | How frightening does each of these feel right now? |
| Q108 | `SETTINGS.recovered` | The app couldn't read what was saved on this phone, so it has started fresh and kept a copy of the old data aside. Export from Settings will include the copy. |
| Q132 | `LOG.future` | An attempt can't be dated in the future. |
| Q134 | `SWITCH_OFF` | Try it sitting down. / Try it with people you know. / Try it without the microphone. / Try it with nothing recording. / Try it reading from the page. / Try it without questions afterwards. / Try it without being introduced. / Try it in what you'd usually wear or use. / Try it without this: [their words]. |

### Taken from PLAN.md's own phrasing (Q74 and similar): capital letter, full stop, turned to "you"

| From | Key | On screen |
| --- | --- | --- |
| L41 | `LADDER.notices.friendsOnly` | You've got comfortable with people you know, which is where everyone starts and won't carry over to strangers on its own; make the next step include at least one person you don't know. |
| L43 | `SIGNPOST.setup` | This app is for practising on your own, and fear this size is worth taking to a private CBT therapist as well; it's not a reason to stop using the app. |
| L47 | `SIGNPOST.floor` | If even this doesn't feel easy, a private CBT therapist is the better next step, and the app will still be here afterwards. |
| L43 | `SIGNPOST.register` | How to find one: the BABCP register of accredited CBT therapists, cbtregisteruk.com. |
| L49 | `STEP.asRehearsed` | This is probably as rehearsed as it gets, and if the step still feels silly-easy, it's ready. |
| L83 | `SETUP.savedBanner` | Start here, learn this first. |
| L101 | `STEP.oneMore` | One more run-through first. |
| L53 | `FORM.targetHigher` | Last time you said you needed more rehearsal, so this starts higher. |
| L45 | `VENUE.startWithFriends` | Start with friends: if the step is a few lines in front of people you know, your kitchen is the venue and the club can wait. |
| L45 | `VENUE.clubIntro` | When you do join a club, say what you're doing. The app offers a line you can use: |
| L45 | `VENUE.placesIntro` | Other places where speaking for under a minute is normal: |
| L45 | `VENUE.anyRoom` | Any room where you're allowed to say a few words out loud will do. |
| L79 | `SETUP.townHint` | Used only to fill in the three searches. |
| L82 | `SETUP.ownGoal` | Or type your own (the label of the box for a goal in your own words) |
| L95 | `FORM.pasteText`, `.wordCount` | Paste the text (optional) / Word count |
| L37 | `FORM.checklist` | Things that change without being noticed |
| L37 | `TOGGLE_LABELS` | The eight checklist items, each with a capital letter. |
| Q75 | `OWN_ITEM_LABEL` | Something else (the own item's label, taken from the one-thing dialog's format) |
| L23, L95 | `UNITS.atYourPace`, `.threePaces` | 0:11 at your pace / slow 0:14, average 0:11, quick 0:09 |
| Q76 | `SETUP.wordsAMinute` | [N] words a minute |
| L47 | `SUGGEST.floorWhere` | At home with the door shut (fills Where for the floor step) |

### How given sentences are put together (please check)

- Make-it-smaller when the thing to undo is a toggle: "Not quite small enough yet. Try it sitting down. Saved as planning until it feels silly-easy."
- Make-it-smaller when the person picks: "Not quite small enough yet." / [Which would you like to turn down?] with the choices / "Saved as planning until it feels silly-easy."
- A second press of "I practised today": "Already ticked today." then "Un-tick today?" with Un-tick / Keep (L87 and Q24 together).
- Deleting a step with one attempt says "its 1 attempt" rather than "its 1 attempts".
- In the one-thing dialog, an own item that was blank before shows as "Something else: – → glasses".
- The choices for what to turn down show dials by name (Length, People, Can see them, Matters) and everything else by its switch-off line (Q135).
- Spoken labels a screen reader reads, not shown: each day on the Breathe strip ("Tuesday 13 Oct 2026: ticked"), and the ends of each 0 to 10 control ("0 easy, 10 nearly walked off").

## 3. Builder's calls, not in PLAN.md or the answers

- With nobody there, Suggest doesn't offer "Can see them" (it is fixed at "not at all", Q8). Moving from nobody to one person leaves "Can see them" for the person to set on the form, so the suggestion card doesn't show it.
- "Do your last step again" (Q34) opens Add a step flagged as suggested; the silly-easy question is answered on the form.
- The 28-day check-in counts the phone's calendar days.
- "The attempt that turned the notice on" (Q26) means the first one since the notice last went off.
- Fields added so the rules can work (Q104 approved the list): when a step settled and when its dials last changed; the count and target when it was marked ready early; on each attempt, the run-through count, whether its plus two was used, and the step's state before and after it. The schema version lives on the file's wrapper rather than on the person.
- When the check-in is due, its rating rows sit under the progress line (L89, Q54) and push the step being worked on below the first screenful until the check-in is saved (L91 asks for it to be visible without scrolling).
- Time yourself has no instruction line; the field's question, "How fast do you read aloud?", carries it.
- After a timed reading, Settings shows the timed words a minute under the choices, with none of slow, average or quick picked.
- In Settings, the venue and the town each have a Save button (BUGS.md 2). Pace and goal save the moment they are chosen, since the choice shows on screen.
- The Step screen lists every attempt, including those from before the dials last changed (history only, Q130), without marking them.
- Colours (Q115): one orange, #F97316, the same in light and dark mode. On screen it reads as orange rather than red, so the warmer #FB8C1A wasn't needed. Text and marks on it are #1A1A1A (6.2:1). No text is orange: links and link-like controls (Back, Mark ready now, the outside links) keep the text colour with a 3px orange underline. The orange fills filled buttons, chosen options and ticked days; it is the current step's left edge, the active tab's top bar, and the edge of notices, the signposts, the check-in and the club line. Buttons that aren't filled have a grey edge (3:1 or more) and text in the text colour. The rehearsal box and notices sit on white (near-black in dark mode), not an orange tint. The orange against the off-white ground is 2.6:1, so nothing relies on it alone: words always carry their own contrast. The focus outline is in the text colour. The dark blue-grey for settled and didn't-stay steps is #475569 in light mode and lightened to #94A3B8 in dark mode (both over 7:1). test/colours.test.js checks every pairing, and that no rule colours text orange.
- At the largest text sizes the bars at the top and bottom stop growing (about 22px text), so they never cover the screen; the tab bar wraps to two rows, and the 0 to 10 buttons wrap to as many rows as they need (each at least 48px).

## 4. Not built yet

- Stage 3: the web app manifest and its icon (the ladder in bright orange on white, Q115), the hardened server, the Railway config.
- Stage 4: started early. BUGS.md and TESTING.md exist since bug 1; stage 4 checks them.
