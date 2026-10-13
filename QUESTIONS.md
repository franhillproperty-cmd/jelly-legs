# Jelly Legs: questions before building

> Answered 13 Oct 2026. Answers marked FRAN are provisional: build with the answer given and list the item in GAPS.md; Fran may change it. Everything else is decided.

Every point where PLAN.md leaves a decision open or says two different things. Line numbers (L) refer to PLAN.md.

**How to answer.** Write after **Answer:**. You can name a choice, write your own wording, or say "your call". "Your call" means I use the suggestion shown and record it in GAPS.md. Nothing is built until you've answered.

Sections A to F block stage 1 (rules.js and its tests). The rest can be answered before stage 2.

---

## A. The method

**1. Which order counts as "most recent", "first" and "last settled"?** (L27, 33, 41, 47, 90, 103, 123–124, 192)
A step has no "settled on" date. An attempt has a date the person types, which can be backdated or in the future, and a hidden "logged at" time. Example: step B settles on Wednesday. Then step A settles through an attempt backdated to Tuesday. Which one is "the step settled most recently" for the one-thing check and Suggest?
*If your call:* record when a step first settles. Put everything in the order it was logged. The typed date is for display only.
**Answer:** Record the moment a step first settles (settledAt, from the logged-at time). "Most recent" everywhere means by logged-at order. The typed date is for display only; the date-based rules (28 days, weeks on) use real time, not typed dates.

**2. What is a step's "first stay"?** (L33, 41, 90, 166)
Example: the first attempt was a didn't stay; the second was a stay rated 1. Did that step settle "on an easy first stay"?
*If your call:* "first stay" means the step's first attempt of any kind. If that was a didn't stay, the step has no easy first stay.
**Answer:** Yes. "First stay" means the step's first attempt of any kind. If that attempt was a didn't stay, the step has no easy first stay and never can.

**3. Reply two or reply three: which earlier attempts count as a hard stay?** (L31, 105, 161, 224–226)
(a) Hard, then easy (settled), then hard again on a repeat. Is that "twice and it's still hard"? (b) Does an earlier didn't stay count? (c) Do the third and fourth hard stays get reply three again? (d) L105 doesn't say what happens to the step's state after reply three.
*If your call:* count stays rated above 2 since the step's last easy stay; didn't stays don't count. Reply three is shown for every hard stay after that. The state doesn't change.
**Answer:** As suggested. Count stays rated above 2 since the step's last easy stay; didn't stays don't count towards it. Reply three for every hard stay after the first in that run. The state doesn't change on a hard stay.

**4. A new attempt on a step that is already settled or didn't stay.** (L29, 31, 91, 105)
Read literally, L105 means a didn't stay on a settled repeat un-settles it, which also changes the step that the one-thing check and Suggest compare against. A didn't-stay step retried with a stay rated 5 keeps the label "didn't stay" for ever.
*If your call:* once settled, a step stays settled. On a didn't-stay step, a hard stay moves it to ready and an easy stay settles it.
**Answer:** Once settled, a step stays settled; a later didn't stay on it turns the too-big notice on (25) but leaves the state alone. On a didn't-stay step, a hard stay moves it to ready and an easy stay settles it.

**5. Which dial does "one dial down" turn?** (L23, 29, 31, 35, 98, 163, 222, 226)
This comes up after a didn't stay, after a second hard stay, and after a "no" to the silly-easy question. L23 says the person chooses which dial to turn. L35 and L98 say the app suggests one, but give no rule for which. Test L163 needs a definite answer.
*If your call:* the dial that differs from the last settled step. If none or more than one differs, ask the person which dial (as Suggest does). At the floor, show the signpost line.
**Answer:** The dial that differs from the last settled step, because the thing that changed is the thing that bit. If none or more than one differs, or there is no settled step yet, ask the person which dial, as Suggest does. If the step is already the floor (7), show the floor signpost instead.

**6. One notch from a value that isn't on the notch list.** (L47, 95, 167, 232–243)
Words and people are free numbers, and the example ladder uses 150 words, 40 words and 60 people. What is one notch up or down from 150 words or 4 people? And what happens to a dial already at the top (1000 words, 500 people, "clearly", "a lot")?
*If your call:* move to the next notch strictly above or below. A dial already at the top isn't offered in Suggest.
**Answer:** As suggested. Next notch strictly above or below. A dial at its top isn't offered in Suggest; if every dial is at its top, Suggest says "You're at the top of this ladder." and offers nothing.

**7. What exactly is "the floor"?** (L35, 47, 167, 234)
L35 says ten words, alone, out loud, door shut. L47 adds "not much" and "at home". Neither gives "Can see them" (which is required) or the toggles. Is 5 words below the floor? Is 10 words, 0 people, "barely", with "being recorded" switched on, at the floor?
*If your call:* the floor is 10 words or fewer, 0 people, "not at all", "not much", and no toggles on.
**Answer:** As suggested: 10 words or fewer, 0 people, "not at all", "not much", no toggles on, own item blank.

**8. Steps with nobody there.** (L23, 41, 47, 95)
With 0 people, what do "Can see them" and "I know everyone there" mean? Settling an alone step with that toggle off would clear the friends line under L41, even though no stranger was there. And when Suggest takes people from 0 to 1, the toggle is still off, which says that one person is a stranger.
*If your call:* with 0 people, "Can see them" is fixed at "not at all" and the toggle is ignored. Steps with 0 people neither count towards the friends line nor clear it.
**Answer:** As suggested, plus: when Suggest moves people from 0 to 1 it switches "I know everyone there" on (the first person is a friend), and the person sets "Can see them" on the form. Leaving 0 people counts as one change (the people dial) whatever "Can see them" is set to.

**9. One-thing check: what counts as a difference?** (L27, 98, 164)
Does 25 → 26 words count? Do decreases count? Example: the last settled step was 50 words and 3 people; the new one is 25 words and 5 people. That's two differences by the letter, one stretch by intent. Does different pasted text with the same word count matter?
*If your call:* any change in either direction counts. Only the word count is compared, not the text itself.
**Answer:** Only changes in the harder direction count: more words, more people, seeing more, matters more, or a toggle switching to its harder state (on for every toggle except "I know everyone there", where off is harder). Decreases never count. For words, compare the nearest notch, so 25 to 26 is no change and 25 to 50 is one. Only the word count is compared, never the text.

**10. The person's own checklist item.** (L37, 95, 123)
L37 says "a blank line" and L95 "a text box", but L123 says "any the person added", which is plural. Is it one box per step, or a list of the person's own toggles? In the one-thing check, is "new shoes" against a blank box one change?
*If your call:* one box per step, compared ignoring capitals and extra spaces. Any difference counts as one change.
**Answer:** One box per step. Compared ignoring capitals and spaces at the ends. A non-blank own item that differs from the last settled step's counts as one change; blank against blank is no change.

**11. Adding a stranger: one change or two?** (L41, 98, 238–239)
L41 says one stranger "is one thing changed". But going from 3 friends to 3 friends plus a stranger changes People (3 → 4) and also switches off "I know everyone there", so the check in L98 warns. The example ladder avoids this by keeping 10 people, which means swapping someone out.
*If your call:* "I know everyone there" switched off plus People up by exactly one counts as one change.
**Answer:** Yes. "I know everyone there" switching off together with People going up by exactly one counts as one change.

**12. The one-thing check on edits, and before anything is settled.** (L27, 94, 98, 165)
Editing the most recently settled step would compare it with itself. Re-checking after a title fix would show a warning the person has already answered.
*If your call:* check new steps, and edits that change a dial or toggle. Compare with the most recently settled step other than the one being saved. Don't check anything until a step is settled.
**Answer:** As suggested.

**13. What the one-thing warning suggests.** (L27, 98)
L27 says it "suggests putting one of the changes back". L98's dialog only names the differences, with Change one back and Keep it anyway.
*If your call:* it names the differences only.
**Answer:** As suggested: names the differences only, in the format given in 75.

**14. Which edits clear the silly-easy answer?** (L35, 96)
L35 says an edit that changes a dial. L96 says any dial or toggle. What about the own-item text?
*If your call:* any change to a dial, a toggle or the own item clears it.
**Answer:** Any change to a dial, a toggle or the own item clears it.

**15. Editing a step that already has a state or a history.** (L94, 96, 98)
The Save sequence (L98) applies to edits too. Fixing a typo in a settled step's title would send it back to rehearsing.
*If your call:* if no dial or toggle changed, the state is left alone. If one did change, the new silly-easy answer decides planning or rehearsing; the run-through count, the answers and "rehearsed less than planned" reset; the attempts are kept.
**Answer:** As suggested.

**16. Starting values on a blank Add a step.** (L95, 98)
L95 says the toggles all start off. But if the last settled step had "I know everyone there" and "I'll be standing up" on, a step that only lengthens the text then shows three differences and trips the warning. The dials and the distractor have no starting values.
*If your call:* the four dials start empty and must be chosen. The toggles and the own item start as they were on the last settled step. The distractor starts as it was on the most recent step. What's different starts blank.
**Answer:** As suggested, plus: Where starts as the venue, When starts blank, the target starts as in 44.

**17. How long it takes to say: one time or three?** (L23, 91, 95, 167)
L23 and test L167 say three times (slow, average, quick). L95 says one time, at the person's own pace, on Add a step. How should very short times read? (10 words is about 4 seconds.)
*If your call:* Add a step shows the person's own time with the three under it, and the Ladder shows the person's own time. Times written as minutes and seconds, e.g. "0:04" or "4:38".
**Answer:** As suggested.

**18. "A week of breathing practice before the first step."** (L51)
No screen carries this, and it has no wording. Does "a week" mean 7 ticks ever, or 7 days in a row?
*If your call:* one line on Add a step while fewer than 7 of the last 7 days are ticked and no step exists yet. The words go in as a placeholder for you to write.
**Answer:** One line on Add a step while fewer than 7 of the last 7 days are ticked and no step exists yet. It never blocks. Words: "A week of the breathing exercise before your first step makes the step easier. You've done [N] of the last 7 days."

**19. Early-steps caution.** (L39, 98, 162)
Does "three settled steps" mean settled now or ever? Is "once" once per Save, once per step, or once ever? L39 also says the app suggests two or three smaller steps, uses the big step's date as a deadline and "says so", but L98 has only an Understood button. There's also no way for the person to say the moment is forced on them, and the date is optional.
*If your call:* count steps settled now. Show the caution on each Save where Matters is "a lot". The caution names the step's date if there is one. No deadline tracking.
**Answer:** Count steps settled now. Show on every Save where Matters is "a lot" and fewer than three steps are settled. No deadline tracking. Words: "This one matters a lot, and you've settled fewer than three steps. Early steps work best where the stakes are low. If this moment is being forced on you (a work presentation, a family occasion), add two or three smaller steps before it: the same words, in front of people who don't matter." If the step has a date, add "They need to fit before [date]." Button: Understood. List in GAPS.md for Fran.

**20. After a first hard stay, reply two and the too-big notice point different ways.** (L25, 33, 224)
Reply two says "Do the same one again". At the same moment, the Ladder's notice says "make the next one so small it feels silly". L25 also says the app tells the person, gently, that a hard stay means the step was too big, but reply two says it "is still doing its work". Is that intended?
*If your call:* keep both as drafted: the notice is about the next new step.
**Answer:** Keep both. Change the notice's words to "That last step came in big. Make the next new one so small it feels silly doing it." so it's plainly about the next new step. Reply two stands.

**21. "How well it went is recorded separately" has nowhere to go.** (L29, 103, 124)
Neither the Log an attempt screen nor the attempt record has a field for it.
*If your call:* no new field; the three written answers are that record.
**Answer:** As suggested.

**22. Does any rule use the rating on a didn't stay?** (L29, 103)
A rating is required even when the person didn't stay.
*If your call:* it is kept and shown, but no rule uses it.
**Answer:** As suggested.

**23. The didn't-stay reason, "said once".** (L29, 222)
Reply one already contains it and is shown at every didn't stay. Does "once" mean "in one place", or only the first time ever?
*If your call:* it lives in reply one and is shown every time.
**Answer:** As suggested.

**24. No way to correct mistakes.** (L87, 100–105)
A stray +1, a mis-tapped didn't stay (which changes the state and turns on the too-big notice) and a mistaken breathing tick can't be undone. A forgotten day can't be ticked afterwards. Attempts can't be edited or deleted. Is that intended for version one?
*If your call:* yes, intended.
**Answer:** Not intended; three small undo controls, no editing. On the Step screen each attempt has Delete (confirm: "Delete this attempt? There's no undo." Delete / Keep). The counter has a small "undo that +1" link for 60 seconds after a press. On Breathe, pressing "I practised today" on a day already ticked offers to un-tick it ("Un-tick today?" Un-tick / Keep). No back-dated ticks. Notices recompute (27).

## B. Notices

**25. The too-big notice: L33 and L90 disagree.** (L33, 90, 162)
L33: on after a step's first stay is hard, or it ends in didn't stay, and "stays until a step comes in easy". L90: on when *the most recent attempt* is a hard first stay or a didn't stay. Example: step A's first stay is rated 5, so the notice comes on, and the second is rated 4. Under L90 the latest attempt is no longer a *first* stay, so the notice goes off. Under L33 it stays on.
*If your call:* on after a hard first stay or any didn't stay. Off only when a stay rated 2 or under is logged after that.
**Answer:** As suggested: on after a hard first stay or any didn't stay; off only when a stay rated 2 or under is logged after that.

**26. The rating shown beside Suggest a step while the notice is on.** (L33, 93)
Which rating, if several hard attempts happened? What if a didn't stay turned the notice on? (A didn't stay still has a 0 to 10 rating.)
*If your call:* the rating from the attempt that turned the notice on. For a didn't stay, show "didn't stay" with its rating. The wording is yours to write.
**Answer:** The attempt that turned it on. Words beside the suggestion: "Last time: 7 out of 10." or "Last time: didn't stay."

**27. Are notices worked out fresh, or stored?** (L90, 105)
L105 re-checks notices only after an attempt is saved. Stored notices would be wrong after deleting the step that caused one, editing the only 6-person step down to 4, or an import.
*If your call:* every notice is worked out fresh from the records each time the screen is drawn.
**Answer:** As suggested: worked out fresh every time a screen is drawn.

**28. The find-somewhere line.** (L13, 45, 78, 90, 166)
L13, L45 and test L166 say "no venue set", which can't happen because the venue is required at Set-up. L90 uses the text "Friends and family for now" instead. Must it match exactly, or also when the person types "friends and family" themselves? Does it go off when the large step is deleted, or only when the venue changes?
*If your call:* on while the venue reads "Friends and family for now" (ignoring capitals and spaces at the ends) and any step has 6 or more people. Worked out fresh each time.
**Answer:** As suggested. The Set-up button sets the box to exactly "Friends and family for now".

**29. Friends rule: "two settled steps in a row".** (L41, 90, 166)
Is the order the order the steps settled, or the order they were made? Example: S1, a known-people step, settles on an easy first stay. S2, also known-people, has a first stay of 5 and then a 1. S3, known-people, settles on an easy first stay. Does S2 break the run?
*If your call:* look at the last two (or three) steps to settle, in the order they settled. Every one of them must have "I know everyone there" on and must have settled on an easy first stay. So yes, S2 breaks the run.
**Answer:** As suggested: order settled; S2 breaks the run.

**30. Friends line: latched, or worked out fresh? Can it come back?** (L41, 90)
L90 keeps it on until a step with the toggle off is settled. L41 says the app "says nothing" while known-people stays are coming in hard. Once it clears, does the count start again?
*If your call:* worked out fresh from the last settled steps, so it can come back.
**Answer:** As suggested: worked out fresh, so it can come back.

**31. "The line waits", and the keep-going message.** (L41, 98)
When the friends line is on and a stranger step gets a "no", which does the person see: L41's "keep going with people you know and grow a different dial", L98's make-it-smaller message, or both? Neither has wording.
*If your call:* the keep-going message instead of make-it-smaller. The line stays on screen.
**Answer:** The keep-going message instead of make-it-smaller, and the line stays on. The step is saved as planning. Words: "One stranger doesn't feel easy yet, and that's fine. Keep going with people you know and stretch a different dial. Come back to this when it feels silly-easy."

## C. Suggest a step

**32. "Yes" to a suggestion: save it, or open a form?** (L47, 93)
L47 says "Yes saves it as their step". L93 says yes opens Add a step pre-filled, and nothing is saved until Save. Add a step also requires a title, What's different and a distractor, which a suggestion doesn't have.
*If your call:* follow L93: open Add a step pre-filled, with the silly-easy answer already set to yes.
**Answer:** Follow L93. Add a step opens pre-filled with the suggestion and the silly-easy answer already Yes; title, What's different and the distractor as in 33.

**33. What a suggestion copies from the last settled step.** (L47, 95)
The toggles, own item, pasted text, Where, When, distractor, run-through target and title?
*If your call:* copy everything except the title, the pasted text and the date. Change the one dial and leave the title blank.
**Answer:** Copy the toggles, own item, Where and distractor from the last settled step. Title blank, no pasted text, no date, What's different blank, target as in 44, the one dial changed.

**34. After a "no", the next suggestion is the settled step itself.** (L47, 93)
Example: the last settled step is 50 words. Stretching length suggests 100. A "no" gives 50, which is the step already done. Another "no" gives 25. Is that intended?
*If your call:* yes, as written.
**Answer:** No. If the smaller suggestion would be at or below the last settled step's value on that dial, don't offer it. Say "There's nothing between your last step and this one on [dial]. Try stretching a different one." and re-ask the dial question with that dial greyed out. If the person says no on every dial, offer "Do your last step again", which opens Add a step pre-filled with the settled step's values; a repeat is allowed.

**35. "The smallest notch": the chosen dial, or the whole floor?** (L47, 93, 167)
L47 says the smallest notch "is the alone-in-a-room step", which is only true for the people dial. Example: the last settled step is 400 words, 10 people. The person picks stakes and says no twice, so Matters is at its bottom with 400 words and 10 people still in place. Does the signpost appear then?
*If your call:* yes. The signpost appears when the chosen dial is at its bottom, then the app returns to the Ladder.
**Answer:** No. The signpost appears only when the floor step itself (7) gets a no. A chosen dial at its bottom is handled by 34.

**36. Suggest before anything is settled.** (L47, 93)
Is the dial question still asked when the answer makes no difference?
*If your call:* skip it and show the floor step. A "no" to that shows the signpost.
**Answer:** As suggested.

**37. The "suggested" flag.** (L47, 123, 147)
Does it stay if the person then changes a dial? No screen shows it, and L147 rules out raw data views.
*If your call:* it stays, and is visible only in the export.
**Answer:** As suggested.

**38. Leaving the Suggest flow part-way.** (L93, 109)
None of its stages has a cancel or back control.
*If your call:* each stage has a back control to the Ladder. The signpost has an OK that goes to the Ladder.
**Answer:** As suggested.

**39. "Nothing goes on the ladder that the person hasn't said yes to."** (L47, 91, 98)
Does that apply only to Suggest? L98 saves a step answered "no" as planning, and planning steps show on the Ladder.
*If your call:* it applies only to Suggest.
**Answer:** As suggested: Suggest only.

## D. Rehearsal and readiness

**40. What the person can do in each state.** (L35, 49, 100–101)
A planning step (the person said it's too big) could reach ready through +1 or Mark ready now, or settle through an attempt, which skips the sizing question. +1 on a settled step that reaches the target would set it back to ready. Log an attempt is in the button list (L101) but isn't placed on the screen (L100).
*If your call:* planning: Edit only, and changing a dial with a "yes" moves the step to rehearsing. Rehearsing: +1, Mark ready now and Log an attempt. Ready, settled and didn't stay: +1 (it counts but never changes the state) and Log an attempt. Log an attempt sits under the counter.
**Answer:** As suggested, plus Delete in every state. Log an attempt sits under the counter.

**41. Mark ready now: where it shows, and what "no" does.** (L49, 100, 101)
L100 shows it whenever the count is below the target, which includes settled steps. For "no", L49 says "asks for one more run-through"; L101 says it changes nothing.
*If your call:* shown only on a rehearsing step that is below its target. "No" shows "one more run-through first" and changes nothing.
**Answer:** As suggested.

**42. Run-through target limits, and edits.** (L49, 95, 189)
Is 0 allowed? Is there a maximum? If an edit lowers the target to the count or below, does the step become ready? If it raises the target on a ready step, does the step go back?
*If your call:* any whole number from 1 up, with no maximum. A rehearsing step at or past its target becomes ready on Save. Raising the target never takes ready away.
**Answer:** As suggested.

**43. The +1 question on the first run-through.** (L49, 101)
"Easier than last time" means nothing the first time. Can the question be dismissed without an answer?
*If your call:* asked every time, including the first, and an answer is required.
**Answer:** Ask from the second run-through onwards; the first +1 asks nothing, because there is no last time. When asked, an answer is required.

**44. The "plus two" rehearsal carry-over.** (L53, 95)
L53 still says "Proposed; Fran to confirm the plus two." L53 says it is used once; L95 says it applies whenever the last attempt log said no, so it would apply to every new step until the next log. Whose count is used? What if the result is below 3 (marked ready early after 0 run-throughs gives 2, and "this starts higher" would be untrue)?
*If your call:* plus two, used once, on the next new step only (not edits). The count is the run-through count when that attempt was logged. The box starts at whichever is higher, 3 or that count plus two.
**Answer:** Proceed with: plus two, used once, on the next new step only (not edits). The count is the run-through count when that attempt was logged. The box starts at the higher of 3 and that count plus two, and the "this starts higher" line shows only when it really is higher. FRAN TO CONFIRM: whether the plus two stays at all; list in GAPS.md.

**45. Changing the distractor after some run-throughs.** (L49, 96)
The count is "run-throughs with that distractor on".
*If your call:* the count and the answers stay as they are.
**Answer:** As suggested.

## E. Logging attempts and the replies

**46. Where the smaller step appears after a reply.** (L29, 31, 105, 163, 180)
After a didn't stay or a second hard stay, the app "suggests a smaller version of the same step", and hand test L180 expects to "see the smaller step suggestion". But the reply screen has only the message and OK.
*If your call:* under the reply, a short line naming the dial to turn down and showing the smaller step's values. OK returns to the Ladder. The wording is yours to write.
**Answer:** As suggested. Words under the reply: "Next time, try turning [dial] down: [old value] → [new value]." Dial names and values as on Add a step.

**47. "This is where the learning is."** (L53, 103)
No wording and no place on the Log an attempt screen.
*If your call:* L53's sentence, turned to "you", above "What went wrong?", listed for you to rewrite.
**Answer:** Above "What went wrong?": "This is where the learning is. The embarrassment is part of it, and you'll remember it far longer than anyone else in the room will." List in GAPS.md for Fran.

**48. Attempts dated in the future.** (L103, 192)
Break test L192 gives no expected result.
*If your call:* the date can't be later than today.
**Answer:** As suggested. Wording in 76.

**49. Fields not marked required or optional.** (L95, 103)
Where, the own item, the run-through target, the attempt date and the three written questions on Log an attempt.
*If your call:* Where, the own item and the written answers are optional. The target and the date are required.
**Answer:** As suggested.

## F. Set-up, goal and check-in

**50. What Settings holds.** (L77, 107, 117, 147)
L77 says every Set-up field can be changed in Settings. L107 lists venue, town, pace and goal, then says "Nothing else", so the situation ratings can't be changed. L147 says Settings "holds five things", but L107 lists eight controls.
*If your call:* L107's eight controls, plus L117's sentence beside Export. Ratings change only at check-ins.
**Answer:** As suggested.

**51. The venue in Settings.** (L45, 78, 90, 107)
Set-up is shown only once. When the find-somewhere line asks the person to find somewhere, the searches and the list of places can't be reached from anywhere else.
*If your call:* the Settings venue control repeats all of Set-up's Field 1, with the same rules, and the find-somewhere line links to it.
**Answer:** As suggested.

**52. Changing the goal in Settings.** (L43, 82, 107)
A newly typed goal has no Set-up rating, so the progress line has no "when you started".
*If your call:* in Settings the goal can only be picked from the existing situations. Its first rating is the baseline.
**Answer:** As suggested.

**53. The 9-or-10 clarifying question.** (L43, 81, 166)
Is it asked again at check-ins? Does it go away if the 9 is lowered? Does "the signpost line once" mean once ever? Nowhere stores the answer.
*If your call:* Set-up only. It shows while any rating is 9 or 10 and must be answered before Save. The answer is stored. The signpost is shown once ever.
**Answer:** As suggested.

**54. The check-in: one line, or the full list?** (L43, 89, 166)
L43 says "in one line at the top of the Ladder". L89 puts the whole situations list, with ratings and Save, under the progress line. "Every four weeks" (L43) and "when the latest ratings are 28 days old" (L166) aren't quite the same. Can it be skipped? Must every situation be rated?
*If your call:* the full list where L89 puts it. Due once 28 or more days have passed since the latest set. No skip, and every situation must be rated.
**Answer:** The full list where L89 puts it, due once 28 or more days have passed since the latest set. It doesn't block the Ladder; it stays at the top until done. Every situation must be rated to save it.

**55. The progress line.** (L43, 89)
What does it say before the first check-in? How are weeks counted, and are they written as words ("Eight weeks on")?
*If your call:* before any check-in, only "Your goal felt like a 9 when you started." After that, whole weeks, rounded down and written as words.
**Answer:** As suggested.

**56. Timing your pace.** (L23, 80, 121, 167)
Pressing Stop after 2 seconds gives 3000 words a minute. Is the result rounded? Is the slow/average/quick choice stored as well as the number, so that a later change to the three constants applies? What does Settings show after a timed reading?
*If your call:* store the choice and the number, rounded to a whole number. Refuse anything outside 60 to 300 a minute with a try-again message (wording yours). Settings shows the timed number.
**Answer:** As suggested. Try-again wording in 76.

**57. The venue searches.** (L45, 78)
A web page can't open "the phone's search", so it has to send the search to a named engine. Which one? With a town, is it "Toastmasters near me Leeds" or "Toastmasters near Leeds"?
*If your call:* Google, with "near me" replaced by "near Leeds" when a town is given.
**Answer:** Google. "Toastmasters near Leeds" when a town is given, "Toastmasters near me" when not; the same pattern for the other two.

**58. The "start here, learn this first" banner.** (L83)
How long does it stay?
*If your call:* only on that first arrival from Set-up.
**Answer:** As suggested.

**59. Removing a situation added by mistake.** (L81)
There's an Add button but no way to remove one. A typo would have to be rated, and would come back at every check-in.
*If your call:* a remove control for the person's own situations, on Set-up only, before Save.
**Answer:** As suggested.

**60. Which venue sentences show on Set-up?** (L45, 78)
L78 names three things under the box: start with friends, the line to say to a club, and the everyday places. L45 has more: the Toastmasters explanation, the small speaking parts of a meeting, "clubs vary, so ask", and "any room where you're allowed to say a few words out loud will do".
*If your call:* the three things L78 names, plus "any room..." under the searches. The everyday places as a bulleted list.
**Answer:** The three things L78 names, plus one more line under the club line: "Clubs can usually start you small: a sentence introducing yourself as a guest, a one-minute report, a short answer in the table-topics round. Ask." Then "any room..." under the searches. Everyday places as a bulleted list.

## G. Screens and navigation

**61. "Eight screens".** (L72, 80, 93, 105)
The reply after an attempt is "on its own screen", which makes nine. Suggest and Time yourself have no screen of their own.
*If your call:* the reply is its own screen. Suggest and Time yourself open as panels over their screen.
**Answer:** As suggested: nine screens, with Suggest and Time yourself as panels over their screen.

**62. The tab bar during first run and on forms.** (L84, 109)
L84 says Breathe is reached from the tab bar "on every screen". On Set-up, the tab bar would let the person skip the required fields. On a form, it would let them leave without the "discard?" question.
*If your call:* the tab bar shows on Ladder, Breathe, Settings and Step only.
**Answer:** As suggested.

**63. Back controls and the discard question.** (L97, 104, 109, 195)
L97 covers only Add a step. Break test L195 expects every form to ask before discarding. Do the first-run Welcome and the reply screen have a back control?
*If your call:* one back control, top left. Every form with unsaved input asks before discarding. No back control on the first-run Welcome or the reply screen.
**Answer:** As suggested.

**64. "Show the welcome again", then Get started.** (L74, 76, 107)
Get started opens Set-up, which holds the baseline and is meant to be shown once.
*If your call:* from Settings, Welcome has a back control and no Get started.
**Answer:** As suggested.

**65. Half-finished Set-up, Delete everything, and a new phone.** (L74, 77, 107, 181)
Where does the app reopen if it's closed half-way through Set-up? Where does it go after Delete everything, and does that delete the breathing ticks too? Import is only in Settings, so someone with a new phone has to fill in a whole Set-up before they can import their file.
*If your call:* until Set-up is saved, the app reopens at Welcome. Delete everything clears everything, the ticks included, and goes to Welcome. Welcome gets an "import a file" link (wording yours).
**Answer:** As suggested. Import link words: "Used Jelly Legs on another phone? Import your file."

**66. What goes at "the top".** (L33, 41, 43, 89, 91, 95)
The notices, the check-in and the current step are each said to be "at the top" of the Ladder, while L89 gives an order. L95's Add a step field list has no place for the notices that L33 and L41 put there.
*If your call:* the Ladder in L89's order. The too-big and friends notices at the top of Add a step.
**Answer:** As suggested.

**67. The example ladder: shown once, or whenever the Ladder is empty?** (L92, 230)
*If your call:* whenever there are no steps, e.g. after deleting the only one.
**Answer:** As suggested.

**68. Time yourself, after Stop.** (L80)
*If your call:* the panel shows the words per minute with a Done button. It can be done again.
**Answer:** As suggested.

**69. What the Step screen shows of the step.** (L100)
L100 lists title, the four dials, date and state. Should it also show the pasted text (the thing they're rehearsing), Where, the toggles and What's different?
*If your call:* only what L100 lists, with length as words and minutes. The text is reached through Edit.
**Answer:** Add one thing to L100: if text was pasted, a "Show the text" control under the dials that expands it, so the person can rehearse from the screen. Everything else via Edit.

**70. Fixed bars at the largest text size.** (L93, 183)
On a 320px phone with the largest text, the Add/Suggest bar plus the tab bar take a big share of the screen.
*If your call:* both stay fixed, and their labels may wrap.
**Answer:** As suggested.

**71. The phone's own back button and swipe-back.** (L109, 195)
Without handling, Android's back button leaves the app and loses a half-filled form.
*If your call:* the phone's back acts exactly like the app's back control, including the discard question.
**Answer:** As suggested.

**72. Outside links from a half-filled Set-up.** (L45, 78)
The Toastmasters link and the searches leave the app.
*If your call:* they open in a new tab, so Set-up isn't lost. Half-filled forms aren't saved if the app is closed.
**Answer:** As suggested.

## H. On-screen words

**73. Are the Content drafts final?** (L72, 75, 208, 220, 230, 277)
L72 and L75 say to use the drafts word for word. Content calls the welcome "a draft to edit, not to accept", says "Fran rewrites" the replies, and says "edit freely" for the example ladder.
*If your call:* ship every draft word for word. GAPS.md has two sections: bracketed placeholders on screen, and drafts or decisions waiting for you.
**Answer:** Ship every draft word for word, with the GAPS.md sections as suggested. Fran may replace any draft later; none of them blocks the build.

**74. Messages the plan gives only as reported speech.** (L33, 35, 39, 41, 43, 47, 49, 83, 101)
These are written in lower case after a colon, and some in the third person ("it will still be here"):
- the too-big notice ("that last step came in big; make the next one so small it feels silly doing it")
- the friends line
- the early-steps caution
- the two signpost / floor messages
- the as-rehearsed-as-it-gets line
- the "start here, learn this first" banner
- "one more run-through first"
- the plus-two line ("last time you said you needed more rehearsal, so this starts higher")

May I use them as written, with a capital letter, a full stop, and "it" changed to "the app"/"I" where needed?
*If your call:* yes, and each one is listed in GAPS.md for you to check.
**Answer:** Yes, as suggested, and list each in GAPS.md.

**75. Messages with no words at all.** (L41, 45, 49, 90, 92, 93, 98, 101)
- the find-somewhere reminder
- the check-in prompt
- the one sentence on the empty Ladder
- the one-thing dialog (and how differences are named, e.g. "Length: 25 → 50 words")
- the make-it-smaller message (silly-easy "no")
- the keep-going-with-people-you-know message
- the +1 question
- the Suggest dial question and suggestion card
- the "rehearsed less than planned" note

Shall I put bracketed placeholders, or will you write them now?
*If your call:* a bracketed placeholder for each, listed in GAPS.md.
**Answer:** Use these, and list each in GAPS.md.
- Find-somewhere reminder: "Your next steps have more people in them. Time to find somewhere to speak regularly." Link text "Find somewhere", opening the Settings venue control.
- Check-in prompt: "Four weeks on. How frightening does each of these feel now?"
- Empty Ladder: "Your ladder starts here. Add a step, or let the app suggest one. This is the shape a ladder can take:"
- One-thing dialog. Title: "More than one thing has changed". Body: "Compared with your last settled step:" then one line per difference in this format: "Length: 25 → 50 words", "People: 1 → 3", "Can see them: partly → clearly", "Matters: not much → somewhat", "I know everyone there: on → off", "Something else: [old] → [new]". Then: "Changing one thing at a time keeps each step easy." Buttons: Change one back / Keep it anyway.
- Make-it-smaller (silly-easy no): "Not quite small enough yet. Try turning [dial] down: [old] → [new]. Saved as planning until it feels silly-easy."
- Keep-going: see 31.
- +1 question: "Compared with last time, that was:" with Easier / About the same / Harder.
- Suggest dial question: "Which would you like to stretch a little?" with the four Add a step labels. Suggestion card: the step's values in the row format from 90, then "Is this step so small it's almost silly to count it?" with Yes / No.
- Rehearsed less than planned: "Marked ready after [N] of [M] run-throughs." 

**76. Confirmations and errors with no words.** (L97, 101, 107, 117, 126)
- the discard question
- the delete-step confirmation
- the two Delete everything confirmations
- import: confirm, refuse, success
- the line beside Export about data staying on this phone
- required-field and out-of-range errors
- the timing try-again
- a "page not found" page

*If your call:* bracketed placeholders, listed in GAPS.md.
**Answer:** Use these, and list each in GAPS.md.
- Discard: "Leave without saving? What you've typed will be lost." Leave / Stay.
- Delete step: "Delete this step and its [N] attempts? There's no undo." Delete / Keep.
- Delete everything, first: "Delete everything on this phone? Your ladder, your attempts, your breathing days and your settings." Continue / Cancel. Second: "Last chance. There's no undo. Export a copy first if you want one." Delete everything / Cancel.
- Import, confirm: "Replace what's on this phone with this file?" Replace / Cancel. Refuse: "That isn't a Jelly Legs file this version can read. Nothing has been changed." Success: "Imported. Your ladder's back."
- Beside Export: "Everything lives only on this phone. Export a copy to keep it safe, or to move it to another phone."
- Required field: "Needed before you can save." Out of range: "A whole number, [min] or more."
- Timing try-again: "That came out at [N] words a minute, which is outside the range the app can use. Try again at your normal reading pace."
- Page not found: "Nothing here." with a link "Back to Jelly Legs". 

**77. The timing passage.** (L23, 80)
About 100 words for Time yourself. It isn't drafted, and Content says I mustn't invent text.
*If your call:* you write it. Until then, a bracketed placeholder.
**Answer:** Use this passage (99 words; count it in code and store the count). Fran may replace it; list in GAPS.md.

On a quiet morning the kitchen is the warmest room in the house. The kettle takes its time, the window steams a little, and the cat decides whether the chair by the radiator is worth the effort. Outside, someone is scraping ice off a windscreen and not enjoying it. There is bread, there is butter, and there is the small question of whether the day starts now or after one more cup. Most mornings it starts after. That is not a failing. It is a plan, and like most good plans it is short, warm, and easy to keep.

**78. The tagline, the browser tab title and the README line.** (L5, 245)
L245 gives a draft tagline and then marks the gap "[Fran to confirm the tagline]". Following the kickoff rule literally would also put that bracket in the browser tab. For the README's "one-line description", should I use L5's first sentence or the tagline?
*If your call:* Welcome shows the draft tagline followed by "[Fran to confirm the tagline]". The tab title is "Jelly Legs". The README uses L5's first sentence.
**Answer:** The tagline is confirmed; Fran edited it herself. Drop the bracket. Welcome shows "Jelly Legs" as the heading with the tagline under it. Tab title "Jelly Legs". README uses L5's first sentence.

**79. Things marked "Fran to confirm" without square brackets.** (L23, 43, 53)
The register link, cbtregisteruk.com ("Fran to confirm the link before shipping"); the plus two; and the three pace constants. Does the link show on screen before you've confirmed it?
*If your call:* build with the values given, show the link, and list all three in GAPS.md.
**Answer:** As suggested.

**80. Which signpost text goes where?** (L35, 43, 47, 93)
There are two different signpost messages. At Set-up (L43) the therapist is "worth taking ... as well; it's not a reason to stop". At the floor and the smallest notch (L35, L47) the therapist is "the better next step". L93 says just "the signpost line". Does the register link go with each? The "Private rather than NHS" sentence: on screen or a note to you?
*If your call:* L43's text at Set-up and L35/L47's text at the floor, each with the link. The NHS sentence is a note and stays off screen.
**Answer:** As suggested.

**81. Five wordings of the silly-easy question.** (L35, 41, 47, 49, 95, 101)
*If your call:* "Is this step so small it's almost silly to count it?" everywhere, with Yes and No.
**Answer:** As suggested.

**82. "What's different this time?"** (L35, 95)
Which label: L35's long question or L95's short one? How does the person learn that "nothing I can think of" is fine?
*If your call:* L95's label, with a small button that fills in "Nothing I can think of".
**Answer:** As suggested.

**83. The not-really-easy line under the question: one sentence or two?** (L35)
"If there's any version of this where it doesn't feel really easy, it isn't small enough yet." Does "The floor is ten words, alone, out loud, with the door shut; that's a step and it counts." go with it?
*If your call:* both sentences.
**Answer:** As suggested: both sentences.

**84. The why line: two wordings.** (L49, 100)
L49: "rehearsing with something distracting on makes the real thing feel easier by comparison, because when you stand up in front of people the distraction is gone." L100: "the real thing feels easier than a distracted rehearsal, because in the room the distraction is gone."
*If your call:* L100's wording, on the Step screen.
**Answer:** As suggested: L100's wording.

**85. "Run-throughs with [distractor] on" doubles "on".** (L49, 100)
Picking "the TV on" from the Stuck? list gives "with the TV on on".
*If your call:* drop a trailing "on" from the distractor when it's put into the sentence.
**Answer:** As suggested.

**86. Dial names differ.** (L47, 93, 95, 232)
Suggest says "length, people, seeing them, or stakes". Add a step says "Length, People, Can see them, Matters". The example ladder says "Words".
*If your call:* Suggest keeps its own words, as written. Everywhere else uses Add a step's labels.
**Answer:** Use Add a step's labels everywhere, Suggest included: Length, People, Can see them, Matters.

**87. Words the person is never taught.** (L47, 222, 226)
The replies say "turn one dial down" and "settle that one". "Notch", "baseline" and "check-in" are plan words.
*If your call:* the replies stay as drafted. "Notch" and "baseline" never appear on screen.
**Answer:** As suggested.

**88. Set-up field labels.** (L43, 81, 82)
Field 4 (the situations) has no question label. Are "not at all" and "unbearable" shown at the ends of the 0 to 10 control? Is Field 5's "Pick one of the situations above, or type your own" shown as written?
*If your call:* a placeholder label for Field 4; L43's end labels; Field 5's text as written.
**Answer:** Field 4 label: "How frightening does each of these feel right now?" End labels "not at all" and "unbearable". Field 5's text as written.

**89. The clarifying question: any lead-in?** (L43, 81)
*If your call:* none. Just "Which is closer?" and the two quoted answers as the choices.
**Answer:** As suggested.

**90. How a step row reads.** (L91)
*If your call:* the title, then one line: "25 words, 0:11 · 1 person · clearly · not much". 0 people shown as "alone". Dates like "14 Nov 2026". The state in its own words from L91.
**Answer:** As suggested.

**91. The Breathe screen.** (L85–86)
Is "Settle" the heading, with "Two breaths in, one long breath out." under it? Are "Every day:" and "Before you speak:" subheadings? The 0-ticks line says "this week", while the strip shows the last seven days. How are the days on the strip labelled?
*If your call:* yes to the heading and subtitle. "Every day:" and "Before you speak:" open their paragraphs, as written. The days are labelled with weekday initials.
**Answer:** As suggested, and change the 0-ticks line to "Nothing ticked in the last 7 days. One go, now, counts."

**92. The reply screen.** (L105, 222–228)
Are the bold labels ("**Didn't stay.**") shown, or are they notes for me?
*If your call:* notes only; the screen shows the message and OK.
**Answer:** As suggested: notes only.

**93. Screen headings and the back control.** (L72–109)
*If your call:* headings are the screen names; the Step screen uses the step's title. The back control says "Back".
**Answer:** As suggested.

**94. How attempts read on the Step screen, and the 0 to 10 ends on Log an attempt.** (L31, 100, 103)
L100 says each attempt shows "the notes". Which ones? L31's end labels ("easy", "nearly walked off") aren't on any screen.
*If your call:* the date, "Stayed" or "Didn't stay", "4 out of 10", then the three written answers under their questions (blank ones left out). L31's end labels on Log an attempt.
**Answer:** As suggested.

**95. The example ladder breaks its own rules.** (L27, 232–243)
Several rows change two or three dials at once. Row 4 shows a repeat as a new step. 150 words and 60 people aren't notches.
*If your call:* show it as you wrote it and note it in GAPS.md.
**Answer:** Replace the example ladder with this one. Every row changes exactly one thing from the row above, in the harder direction, and the notches only apply to Suggest, so the people numbers between notches are fine for a hand-written step. Put this table in GAPS.md too so Fran sees the change.

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

## I. Language-rule clashes in the drafted text

**96. "treatment" is in the welcome text.** (L64, 75, 218)
"This is a tool for practising on your own, not treatment." "Treatment" is banned, and the welcome is to be used word for word, so the grep test (L169) would fail on your own text.
*If your call:* drop ", not treatment" until you reword it, and list it in GAPS.md.
**Answer:** Change the sentence to "This is a tool for practising on your own." and drop ", not treatment". List in GAPS.md.

**97. Where "therapist" may appear.** (L15, 35, 43, 47, 55, 64)
The exception is worded "a private CBT therapist" (L55) and "a CBT therapist" (L64). It's also needed in the welcome and the floor messages, not only "the signpost line".
*If your call:* allow exactly "a private CBT therapist", and the register link, everywhere a therapist is mentioned.
**Answer:** As suggested.

**98. "avoided" and "condition".** (L43, 85)
The second clarifying answer says "avoided", and "avoidance" is banned. The Breathe text says "a condition that affects your breathing", and "conditioning" is banned.
*If your call:* both stay. The test catches the banned words and their endings ("triggers", "triggered") but not shorter words that happen to start the same way.
**Answer:** As suggested.

**99. First person.** (L37, 43, 45, 55, 103)
L55 says second person, but the toggles ("I know everyone there"), the clarifying answers, the club line and "no, I needed more" are first person.
*If your call:* first person where the person is speaking; the app's own voice is second person.
**Answer:** As suggested.

**100. Reply one: "that counts for a lot".** (L29, 222)
L29 says an attempt counts only if the person stayed.
*If your call:* keep it for you to review.
**Answer:** Change reply one's first line to "You went. That matters, even though it doesn't count as a step yet." The rest stays. List in GAPS.md for Fran.

**101. Reply three says "twice" on the third and later hard stays.** (L226)
*If your call:* keep it; you may change it to "more than once".
**Answer:** Change it to "more than once".

**102. The tagline may joke about the person.** (L68, 245)
"(yes, even to you)". L68 says the joke is always about the fear, never about the person.
*If your call:* keep it; it's already a gap for you.
**Answer:** Keep it. Fran chose those words after reading the humour rule.

**103. Banned words in the repo's documents.** (L196, 274)
TESTING.md must copy "type 'exposure' into a title", and the test file has to list the banned words.
*If your call:* the rule covers what the app shows. The server serves only the app's own folder, so documents can't be opened from the app's address.
**Answer:** As suggested.

## J. Data

**104. Fields the rules need that the record table lacks.** (L121–124)
- when a step settled
- the clarifying-question answer, and whether the signpost has been shown
- whether the plus two has been used
- the run-through count when an attempt was logged
- whether Set-up is finished
- the pace choice

May I add these?
*If your call:* yes, in schema version 1.
**Answer:** Yes, all of them, in schema version 1.

**105. Situations and dated ratings.** (L43, 81, 89, 121)
Can situations be added at a check-in?
*If your call:* fixed ids for the listed situations; ratings stored as dated sets with the first set as the baseline; new situations only at Set-up.
**Answer:** As suggested.

**106. The export file.** (L107, 126)
*If your call:* named `jelly-legs-2026-10-13.json`, marked as a Jelly Legs file with its schema version.
**Answer:** As suggested.

**107. Import.** (L107, 126, 193)
A file from another app might happen to say version 1.
*If your call:* choose the file, then check everything, then ask "replace what's on this phone?", then replace and open the Ladder. Any problem: refuse and change nothing.
**Answer:** As suggested.

**108. Stored data the app can't read** (after an interrupted save, say).
*If your call:* keep a copy aside, start fresh, and show a placeholder message.
**Answer:** As suggested. Words: "The app couldn't read what was saved on this phone, so it has started fresh and kept a copy of the old data aside. Export from Settings will include the copy."

**109. Export from an iPhone home-screen icon.** (L107, 182)
There, a plain download often opens a preview instead of saving the file.
*If your call:* try a plain download first; where that isn't possible, use the phone's share sheet. Please check it on your phone.
**Answer:** As suggested. FRAN TO DO: test Export on her phone from the home-screen icon.

## K. Technical choices (I'll do these unless you object)

**110. Git.** Your name and email aren't set in git on this machine, so commits will fail. May I set them for this repository only as **Fran &lt;franhillproperty@gmail.com&gt;**? Branch `main`. I commit locally only. Creating the GitHub repository, pushing and linking Railway are yours (the GitHub command-line tool isn't installed here). PLAN.md and this file get committed too.
**Answer:** FRAN TO APPROVE (it is her name and email). Recommended: yes, for this repository only, branch main, local commits only, PLAN.md and this file committed too. Fran creates the GitHub repository, pushes and links Railway.

**111. Testing stage 2 on your phone.** server.js arrives in stage 3, but a phone can't open the screens without a server. *Suggest:* bring a minimal server.js forward into stage 2 so you can test on your phone over your wifi. Stage 3 then hardens it and adds the manifest and Railway config.
**Answer:** Yes. Bring a minimal server.js into stage 2 so the screens can be tested on a phone over wifi; stage 3 hardens it and adds the manifest and the Railway config.

**112. Files and layout.** rules.js as a standard module, loaded the same way in the browser and in `node --test`. That needs a `package.json` with no dependencies, which also lets Railway recognise a Node app. The app's files live in a `public/` folder, and only that folder is served, so PLAN.md, the tests and GAPS.md can't be opened from the app's address. Tests in `test/`.
**Answer:** Yes. A package.json with no dependencies is fine and still counts as zero-dependency.

**113. Server.** Strict security headers, with nothing loadable from anywhere else. Phones always check for a newer file, so fixes arrive straight away. A placeholder "page not found". PORT defaults to 3000 locally. Only the start-up line is logged. Note: Railway's own request logs record IP addresses, so L152's "nothing about any person" needs softening in the write-up.
**Answer:** Yes. In the write-up notes change "nothing about any person" to "no personal data; Railway's request logs record IP addresses, as any host's do".

**114. Storage.** The browser's local storage under one key, and the app asks the browser to keep it.
**Answer:** Yes.

**115. Looks.** System fonts, neutral colours with one accent, follows the phone's dark mode, strong contrast, tap targets at least 48px, and a words-only tab bar. Settled and didn't-stay steps shown in grey.
**Answer:** Yes. The accent colour: FRAN TO CHOOSE; until she does, use airforce blue (#4F6F8F), one of her own colours, and list it in GAPS.md.

**116. The icon.** I draw a plain shape (a simple ladder), make the PNG files with a small script, and list it in GAPS.md for you to replace.
**Answer:** Yes.

**117. Manifest.** Name and short name "Jelly Legs", opens full-screen like an app, any orientation, British English, description from L5. No on-screen "add to home screen" help.
**Answer:** Yes.

**118. Phones supported.** The current and previous major versions of Safari on iPhone and Chrome on Android.
**Answer:** Yes.

**119. The app open twice** (home-screen icon plus a browser tab). When one copy saves, the other reloads its data, so it doesn't overwrite newer changes.
**Answer:** Yes.

**120. Web address.** Stored data belongs to one web address, so moving to a custom domain later would leave everyone's ladder behind. *Suggest:* keep the Railway address for good, unless you're planning a domain.
**Answer:** Keep the Railway address. FRAN TO DECIDE: if she might ever want her own domain, it has to be set up before anyone but her uses the app, because moving later strands their data. List in GAPS.md.

## L. Test expectations

**121. The banned-word test.** All on-screen text lives in one strings file, plus index.html and the manifest, and the test checks those. It matches whole words and their endings, ignoring capitals, and allows only "a private CBT therapist". It's written in stage 2, once the screens exist; stage 1 has the rules tests only.
**Answer:** Yes.

**122. Field limits for the break-it tests.** (L187–189)
*If your call:* a title of only spaces counts as blank. Words: a whole number from 1. People: a whole number from 0. Target: a whole number from 1. No decimals or negatives. Errors are placeholders.
**Answer:** Yes.

**123. The 0 to 10 control.** (L81, 103, 188)
*If your call:* eleven tap buttons with none picked at first, and Save is blocked until one is picked. That makes 11 and -1 impossible to enter, and "nothing" is refused.
**Answer:** Yes.

**124. What counts as a word.** (L23, 95, 167, 187)
If the person types a number and then edits the pasted text, which wins?
*If your call:* anything between spaces or line breaks that contains a letter or digit counts as a word. A hyphenated word counts as one. Changing the text always resets the number.
**Answer:** Yes.

**125. Break tests L190 and L191 have no expected result.**
*If your call:* nothing breaks, and everything is worked out again from what's left.
**Answer:** Yes.

**126. Date-based rules (the 28-day check-in, "weeks on").**
These can only be hand-tested by changing the phone's clock, and L147 rules out developer controls.
*If your call:* unit tests only, with the date passed in; no hidden switch.
**Answer:** Yes.

**127. Hand test L179 when the settled step has nobody there.**
With 0 people settled, Suggest offers 1; one "no" gives 0, and a second "no" goes straight to the signpost.
*If your call:* copy the test as written, and add a note that it needs a settled step with at least two people.
**Answer:** Yes.

**128. [N] and [distractor].** (L86, 100)
These use square brackets like the one real gap, but they're filled with live values (a number, the person's distractor), not placeholders. Please confirm.
**Answer:** Confirmed: live values, not placeholders. On screen they are the real number and the person's own distractor.

## M. Raised while building stage 1

**129. No dial left to turn down.** (Q5, Q7, Q35)
"10 words, alone, standing up": every dial is at its bottom, but the toggle keeps it off the floor, so "turn one dial down" has nothing to offer.
**Answer:** When every dial is at its bottom but a toggle or the own item is on, "turn one dial down" means switch one of those off: the toggle that differs from the last settled step if there is one, otherwise the person picks which. The therapist line appears only at the true floor, which is 10 words or fewer, nobody there, not much, no toggles on, own item blank (answer 7). So "10 words, alone, standing up" gets "try it sitting down", not the signpost.

**130. Attempts from before a dial edit.** (Q2, Q3, Q15, Q25, L41)
After a step's dials change, do its old attempts still count for reply three, its first stay, the too-big notice and the friends line?
**Answer:** No. When a step's dials change, the attempts before that moment become history only. They stay visible on the Step screen, but none of the rules read them: "first stay", reply two versus three, the too-big notice and the friends rule all look only at attempts logged after the dials last changed. The step is a new step with its old notes attached. Use the "when its dials last changed" field already added.

**131. Halfway word counts.** (Q9)
For the one-thing check, 75 words is exactly halfway between the 50 and 100 notches.
**Answer:** Yes. Halfway rounds to the higher notch. The one-thing check should warn when in doubt, and 50 to 75 words is more words, so treating 75 as the 100 notch is right.

**132. An attempt dated in the future.** (Q48, Q76)
**Answer:** Block them in the picker and keep a message for the case where the picker can't (some browsers let the person type a date). Words: "An attempt can't be dated in the future."

**133. The plus two after a step's dials change.** (Q44, Q130)
**Answer:** Keep it. The plus two is about the person's rehearsal habit, not about one step, so "I needed more" still stands after that step's dials change. The next new step starts at that attempt's recorded run-through count plus two (or 3 if higher), exactly as now.

**134. Switch-off wording, one per toggle.** (Q129)
**Answer:** In the same shape as "try it sitting down". List them in GAPS.md with the rest of the wording so Fran can rewrite any in her voice.
- I'll be standing up: "Try it sitting down."
- I know everyone there: "Try it with people you know." (Only offered when there's someone there; this toggle's harder state is off, so turning it down means switching it on.)
- There's a microphone: "Try it without the microphone."
- It's being recorded or filmed: "Try it with nothing recording."
- I'm speaking from memory rather than reading: "Try it reading from the page."
- There'll be questions afterwards: "Try it without questions afterwards."
- I'll be introduced by name: "Try it without being introduced."
- I'll be wearing or using something I don't usually: "Try it in what you'd usually wear or use."
- Their own item: "Try it without this: [their words]."

**135. When can "Try it with people you know" ever be offered?** (Q5, Q129, Q134)
Under 129, toggles are only switched off when every dial is at its bottom, and that means nobody is there, when "I know everyone there" is ignored (Q8). So as the rules stand, this suggestion can never appear. The same goes for any switch-off suggestion on a step with people in it. Example: the last settled step was 3 friends; the new step swaps one friend for a stranger (still 3 people, "I know everyone there" off) and gets a didn't stay. Q5 says ask which dial, because no dial changed. Options:
(a) Leave the rules as they are; the wording is kept but only shows at the bottom of every dial.
(b) Whenever the only thing that got harder since the last settled step is a toggle or the own item, suggest switching it off ("the thing that changed is the thing that bit"), whatever the dials are.
(c) When the app asks which dial, also offer the toggles that are on as things to switch off.
**Answer:**
