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

- **Ladder complete** (`COMPLETE.message`), Fran's words from her spec (Q138), a Content draft for her to edit. Under the reply after the attempt that settles the goal step, once (Q141): "You've reached what you set out to do. From here, nerves before a speech aren't a sign the step's too big; they're what speaking feels like. Keep logging if you like, but you're not climbing any more."
- **The hint on Log an attempt** (`LOG.hardHint`), Fran's words (Q142). Under "How hard was it to stay?", before the 0 to 10 buttons: "Rate how hard it was to stay to the end, not how nervous you were. Nerves beforehand are normal and don't count."
- **Set a new goal** (`LADDER.setNewGoal`), Fran's words (Q138). The button in place of Suggest a step while the ladder is complete.
- **The goal step and finished ladders**, Fran's words (Q143): the switch on Add a step and Edit is "My goal" (`FORM.goalStep`); the heading at the foot of the Ladder is "Ladders you've finished" (`LADDER.earlier`); the line on a step from one of them is "From a ladder you finished" (`STEP.fromEarlier`). A goal typed in Settings or Set a new goal is rated under Set-up's question, "How frightening does each of these feel right now?" (`SETUP.situationsLabel`, Q88).

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

### The quips under the scene (the look stage), for Fran to rewrite

All eight, in `QUIPS` in strings.js. The first that applies is shown, checked in this order (the order is the builder's call, except the first: Fran's spec shows it whenever the ladder is complete):

1. The ladder is complete, its goal step settled (Q138): "Jelly legs are optional now." Fran's words.
2. No steps yet: "Jelly legs, at the bottom, looking up."
3. Every step settled: "On the stage, legs like concrete."
4. The most recently logged attempt on this ladder was a didn't stay: "Came back down. The ladder's still here." It stays until the next attempt is logged.
5. All but one step settled (with at least two steps): "Nearly there. The lectern's looking smaller."
6. Half or more settled: "Halfway up and the knees have mostly stopped knocking."
7. A quarter or more settled: "Wobbling, climbing, still here."
8. Otherwise, steps on the ladder but under a quarter settled: "One foot on the ladder. That counts."

### The Step screen's lines and the one-step-at-a-time words (Q145, Q146), for Fran to rewrite

The five lines under the Step screen's strip, one for each state (`STEP.now`):

1. Rehearsing: "Rehearse with your distractor on, press +1 each time, and when you reach your number the step is ready."
2. Ready: "Go and do it in the real world. When you have, come back and press Log an attempt."
3. Settled: "Done. Add the next step from the Ladder."
4. Planning: "Too big for now. Edit it smaller, then rehearse."
5. Didn't stay: "Make the next step smaller, then rehearse that one."

Also new, all Fran's words: the strip's stages, "Plan", "Rehearse", "Ready", "Do it", "Log it" (`STEP.stages`); the line under the goal on the Ladder, "One step at a time: rehearse it, do it, log it, then add the next one." (`LADDER.oneAtATime`); and the question before a second step, "You've already got a step on the go: [title]. The ladder works one step at a time. Finish that one first?", with "Go to that step" and "Add another anyway" (`LADDER.onTheGo`, `.goToStep`, `.addAnyway`).

## 3. Builder's calls, not in PLAN.md or the answers

- With nobody there, Suggest doesn't offer "Can see them" (it is fixed at "not at all", Q8). Moving from nobody to one person presets "Can see them" to clearly, which the person can change on the form; the suggestion card shows it. That is Fran's change to answer 8 (BUGS.md 5), not a builder's call.
- "Do your last step again" (Q34) opens Add a step flagged as suggested; the silly-easy question is answered on the form.
- The 28-day check-in counts the phone's calendar days.
- "The attempt that turned the notice on" (Q26) means the first one since the notice last went off.
- Fields added so the rules can work (Q104 approved the list): when a step settled and when its dials last changed; the count and target when it was marked ready early; on each attempt, the run-through count, whether its plus two was used, and the step's state before and after it. The schema version lives on the file's wrapper rather than on the person.
- When the check-in is due, its rating rows sit under the progress line (L89, Q54) and push the step being worked on below the first screenful until the check-in is saved (L91 asks for it to be visible without scrolling).
- Time yourself has no instruction line; the field's question, "How fast do you read aloud?", carries it.
- After a timed reading, Settings shows the timed words a minute under the choices, with none of slow, average or quick picked.
- In Settings, the venue and the town each have a Save button (BUGS.md 2). Pace and a picked goal save the moment they are chosen, since the choice shows on screen; a goal typed in the person's own words has its own Save (see "Ladder complete and new goals").
- The Step screen lists every attempt, including those from before the dials last changed (history only, Q130), without marking them.
- Colours (Q115, Q137): the ground is off-white #FBF7F2 in light mode and near-black #141210 in dark. One orange, #F97316, the same in both modes. On screen it reads as orange rather than red, so the warmer #FB8C1A wasn't needed. Text and marks on it are #1A1A1A (6.2:1). No text is orange: links and link-like controls (Back, Mark ready now, the outside links) keep the text colour with a 3px orange underline. The orange fills filled buttons, chosen options and ticked days; it is the current step's left edge, the active tab's top bar, and the edge of notices, the signposts, the check-in, the club line and the ladder-complete message. Buttons that aren't filled have a grey edge (3:1 or more) and text in the text colour. The orange against the off-white ground is 2.6:1, so nothing relies on it alone: words always carry their own contrast. The focus outline is in the text colour. Settled and didn't-stay text, and the dashed edge of those rows, are the blue-grey #4F6F8F in light mode (4.9:1 on the ground, 5.3:1 on white) and #8AA4BF in dark mode (7.3:1 on the ground, 6.6:1 on a card). The decorative blue-grey (the confetti, the scene) stays #4F6F8F in both modes. Cards (step rows, notices, signposts, the check-in, the suggestion card, the rehearsal box, the pasted text, the timing passage, the learning line, the ladder-complete message, dialogs) are white, not an orange tint, or a dark grey in dark mode, with a 14px radius, a soft 1px warm-grey border and, in light mode only, a faint shadow. Settled and didn't-stay rows are see-through, with the dashed blue-grey edge, and the example ladder's rows keep their dashed grey edge. Controls (buttons, text boxes, choices) keep their own 12px corners and their 3:1 edges. test/colours.test.js checks every pairing in both modes, the grounds, the blue-greys and the card radius, and that no rule colours text orange.
- Fonts (Q136): Fraunces for headings, the goal line on the Ladder and the earlier ladders' goals; Source Sans 3 for everything else, controls included, with its own italic for the quip. Both are variable fonts, so one file holds every weight. They are in public/fonts with their licences (the SIL Open Font License) and served by the app itself, so no font comes from another address; the upright Source Sans 3 and Fraunces are preloaded, and the page shows in the phone's own fonts until they arrive. Fallbacks: Georgia for headings, the system fonts for the rest. The phone's text-size setting still sets the size. test/look.test.js checks that every font the stylesheet names is a real WOFF2 file in public/fonts, that each font folder has its licence, that nothing loads from another address, and that the server sends the fonts as fonts.
- At the largest text sizes the bars at the top and bottom stop growing (about 22px text), so they never cover the screen; the tab bar wraps to two rows, and the 0 to 10 buttons wrap to as many rows as they need (each at least 48px).

### The look stage

- The scene sits under the Ladder heading and above the goal, with the quip under it. It is decoration, hidden from screen readers; the quip is ordinary text and is read.
- The ladder in the drawing always has nine rungs, whatever the number of steps. The jelly stands on the rung nearest to settled steps out of all steps, so a quarter, a half and three quarters each land on a rung. With every step settled it is on the stage beside the lectern, facing the audience, with a bigger smile. With no steps it is on the bottom rung.
- The jelly moves only when the Ladder is drawn: coming back after a step settles, it climbs from where it was last shown, in about a second. Adding a step can move it down a rung, since the share settled falls. The first time the app opens it is simply in place.
- The wobble follows the most recent attempt where the person stayed, by when it was logged: full at a rating of 10, falling evenly to none at 2 (the easy line) and below. Before any stay, the legs wobble fully.
- The audience's heads, faces and eyes turn to where the jelly is.
- The scene uses the one orange for the jelly only; the curtain and the stage's edge are the blue-grey (#4F6F8F), with lighter and darker blue-greys and warm greys for the rest. In dark mode the scene's colours are darkened to match.
- The Breathe circle sits under the exercise text and above the seven days. It swells over about two seconds (the breath in), pauses briefly, swells to full over about a second (the sip), then sinks over about six seconds: nine seconds a round. Start and Stop are the words from L80's rehearsal timer; the button reads Start until pressed. Once started it stays on if the person goes to another screen and comes back (starting again from the breath in), and is off again when the app is next opened. With less motion asked for, the circle sits still at its smallest and there is no button.
- Confetti: 48 pieces, alternately the orange and the blue-grey, burst from the middle of the screen for one second, once, on the reply that follows the attempt where a step settles. None when less motion is asked for.

### Ladder complete and new goals

Fran's spec and answers are Q138 to Q143, and Q52 replaced. Everything below is the builder's call. Fran confirmed the six she was shown on 14 Oct 2026 (Q144): completion worked out fresh each time; a new ladder starting afresh; the plus two carrying across; a typed goal rated that day, without moving the check-in clock, and that rating its baseline; the labels (since worded, Q143); and version 2 of the stored data, with version 1 upgraded.

The data
- The stored data is now version 2. A file or a phone holding version 1 is still read: every step comes in unmarked and there are no earlier ladders, and the next save writes version 2. An older copy of the app can't read a version 2 file.
- Import checks the new parts too: at most one marked step on each ladder, step ids unique across every ladder, and each earlier ladder's goal one of the listed situations. An attempt may belong to a step on any ladder.

A goal in the person's own words (Q52 replaced)
- It is rated on its own, in a dated set of its own marked as added. An added set doesn't move the check-in clock: the 28 days still count from Set-up or the last check-in. The next check-in rates it with everything else.
- A goal's first rating is its baseline. For a goal typed in Settings or Set a new goal, "when you started" on the progress line means when it was typed, and the weeks count from then to the latest check-in. Until it is rated again at least a whole week after it was typed, the line has only the first half. Added ratings don't move the check-in clock, so a goal typed in the week before a check-in is rated twice within the week; that check-in's rating isn't shown, and the second half of the line comes with the next check-in, never as "Zero weeks on". The same if the phone's date goes back between the two. A goal chosen at Set-up works exactly as before.
- Picking a listed situation as the goal, in Settings or Set a new goal, keeps that situation's own first rating as the baseline, usually Set-up's.
- Typed words that match a listed situation, ignoring capitals and spaces at the ends, pick that situation: no rating is needed, any rating given is ignored, and nothing is added.
- No 9-or-10 clarifying question for a typed goal; that stays at Set-up (Q53).
- In Settings, typing shows the rating and a small Save under the box; Enter in the box moves to the rating rather than saving. Picking a situation still saves at once and empties the box. The saved pick stays showing while the person types, since it is already saved. Typed words not yet saved count as unsaved input, so leaving Settings asks first, like the venue. After Save only the goal control is drawn again, so anything typed but not saved in the venue or town box stays, and the new goal shows in the list, picked.
- Settings never starts a new ladder. Changing the goal there leaves the steps where they are; only Set a new goal moves them.

The goal step and the complete ladder
- Saving a step with the switch on takes the mark off any other step. Marking or unmarking isn't a change to the step's size, so the step keeps its state and its run-throughs.
- Nothing on the Ladder or the Step screen shows which step is marked; its switch on Edit does.
- Completion is worked out fresh each time, like the notices (Q27). Deleting the attempt that settled the goal step, editing its dials (it goes back to rehearsing or planning), switching the mark off, or moving the mark to a step that isn't settled all undo it: Suggest a step and the notices come back. Settling the goal step again shows the message again.
- Marking a step that is already settled completes the ladder straight away, with no message: the message only follows an attempt that settles the goal step.
- While the ladder is complete, Add a step still adds to the same ladder, and it stays complete unless the new step is saved with "My goal" on: that moves the mark to a step that isn't settled yet, so the ladder is no longer complete (see above). Logging goes on as normal; a later attempt on the goal step gets the usual reply and no message.
- With the friends line off, a no to a stranger step gets the make-it-smaller message, never the keep-going one (Q31). The find-somewhere line, the early-steps caution, make-it-smaller, the replies, the rehearsal counter and the plus two are unchanged.
- For the one-thing check, "while complete" means as the ladder stands before the save. So editing the goal step's dials on a complete ladder isn't checked, even though that save undoes the completion.
- The message sits under the reply and any smaller-step line, above OK. The confetti fires because the step has settled.
- The hint on Log an attempt sits between "How hard was it to stay?" and the 0 to 10 buttons, and a screen reader reads it with the question, also when the "Needed" error shows. The end labels (Q94) are unchanged.
- The scene: while the ladder is complete the jelly stands at the lectern, even if other steps aren't settled, and the complete quip comes before every other.

Set a new goal and the earlier ladders
- Set a new goal opens a full-screen panel, like Suggest: Set-up's goal question as its heading, every situation in one column with none picked, then "Or type your own" with its rating under it once the box has text, and one Save. Set-up's hint, "Pick one of the situations above, or type your own.", isn't shown, since it points "above".
- Typing un-picks the situation; picking a situation empties the box. The rating belongs to the typed words: when the box empties, the rating hides and its answer is cleared. Enter in the box moves to the rating.
- The same goal can be picked again.
- No "are you sure?" before a new ladder starts: Save starts it. Back with typed words asks first (Q63); a picked situation alone doesn't.
- After Save the Ladder goes back to the top and the new goal line takes focus, so a screen reader reads the new goal and the jelly can be seen coming down. If the ladder stopped being complete while the panel was open (the app open twice, Q119), Save just closes the panel and shows the Ladder as it now is.
- On the new ladder everything starts afresh: Suggest offers the floor, the early-steps caution counts from nothing, there is no one-thing base, and the too-big notice and the friends line read only the new steps. The old ladder's attempts stay with their steps but count towards none of these.
- Two things carry across: the plus two, because it is about the person's rehearsal habit (Q133), and the breathing nudge, which shows only before the person's first step on any ladder. The distractor doesn't: the first blank Add a step on a new ladder starts with it empty.
- The wobble and the didn't-stay quip read only the current ladder's attempts, so a new ladder's jelly wobbles fully until its first stay there.
- Earlier ladders sit at the foot of the Ladder, under "Ladders you've finished", newest ladder first. Each has its goal as a heading (no end date), then its steps, newest first, in the quiet look whatever their state.
- A step from an earlier ladder opens read-only: title, values, date, state, "From a ladder you finished", Show the text if it has text, and its attempts with their notes but no Delete. No rehearsal counter, Log an attempt, Edit or Delete. Back goes to the Ladder.

### The step strip, one step at a time, and the jelly elsewhere (Q145 to Q147)

- The strip and its line sit under the step's title, so the title still comes first and a screen reader reads them straight after it. The current stage is an orange pill and is marked for screen readers as the current step; the stages before it are in the text colour, the ones after in grey.
- Which stage each state is at: planning, Plan; rehearsing, Rehearse; ready, Ready; settled and didn't stay, Log it, since the step has been done and logged. On a settled step every stage counts as done. "Do it" is never the marked stage: the app can't know when the person is out doing it.
- A step on a finished ladder has no strip and no line: it can't be changed, and the lines tell the person what to do next.
- The Ladder's one-step line sits under the progress line, so the goal and its progress stay together. It shows always, also with no steps and on a complete ladder.
- The step "on the go" is the one at the top of the Ladder: the most recently made step that is planning, rehearsing or ready. The question comes only from Add a step, not from Suggest a step. Go to that step is the button picked first; dismissing the question (Escape, or the phone's back) stays on the Ladder.
- The jelly beside the strip wobbles fully while the step is planning, rehearsing or didn't stay, half as much once it is ready, and not at all once settled.
- The Welcome screen and the replies show the part of the Ladder's scene around the ladder, larger: the floor, the ladder, the stage's edge and the first of the audience. On Welcome the jelly stands on the bottom rung, legs wobbling.
- The replies don't follow the person's real place on their ladder. After an easy stay (reply four) the jelly climbs from the fourth rung to the fifth, one leg lifted and leaning up the ladder, then stands there. After a hard stay (replies two and three) it sits on the fourth rung, legs hanging, not wobbling. After a didn't stay (reply one) it stands on the floor at the foot of the ladder, looking up, smiling, legs wobbling a little. The reply that completes a ladder is an easy stay, so the jelly climbs; it isn't shown at the lectern there.
- On Breathe the jelly glows and grows from its feet, so it swells upwards and settles back down; its legs don't wobble. Start and Stop work as before.
- With less motion asked for, no jelly moves anywhere: the Welcome jelly and the step jelly stand still, the reply jelly is already in its place, and the Breathe jelly sits at its smallest with no Start button.

## 4. Not built yet

- Stage 3: the web app manifest and its icon (the ladder in bright orange on white, Q115), the hardened server, the Railway config. The server sends every file with no-cache and nothing to check it against, so the fonts (about 350 KB) download again on each visit; the hardened server should let the phone keep them.
- Stage 4: started early. BUGS.md and TESTING.md exist since bug 1; stage 4 checks them.
