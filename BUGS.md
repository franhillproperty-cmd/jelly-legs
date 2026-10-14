# Bugs

Every bug found while testing, newest first: what happened, why, what changed, and how to check it stays fixed.

## 6. Step screen: "Undo that +1" and "Mark ready now" ran together

- **Found:** 14 Oct 2026, by Fran, reviewing.
- **What happened:** After a +1, the two links sat side by side with no space between them, so they read as one: "Undo that +1Mark ready now".
- **Why:** Both are links shown in a line, one straight after the other, with nothing between them.
- **Fix:** They sit in a row with a clear gap between them, and go one under the other when the screen is too narrow for both.
- **Commit:** "Fix: review findings on Set-up, Suggest a step, Add a step and the Step screen".
- **Check:** the hand test "Step screen: Undo that +1 and Mark ready now" in TESTING.md.

## 5. Suggest a step: going from nobody to one person left "Can see them" blank

- **Found:** 14 Oct 2026, by Fran, reviewing.
- **What happened:** When Suggest turned People up from alone to 1 person, the suggestion read "1 person · not much", with no "Can see them", and Add a step opened with "Can see them" unpicked, so Save said it was needed.
- **Why:** Answer 8 said the person sets "Can see them" on the form, so Suggest left it blank; with nobody there it had been fixed at "not at all".
- **Fix:** It is preset to "clearly", and the suggestion card shows it; answer 8 has a dated note. The person can still change it on the form, but changing it changes the step's size, so the silly-easy question is asked again, as for any change to a dial (Q14). Either way it is one change from the last settled step, not two: with nobody there before, "Can see them" doesn't count (Q8).
- **Commit:** "Fix: review findings on Set-up, Suggest a step, Add a step and the Step screen".
- **Check:** the hand test "Suggest a step from a step with nobody there" in TESTING.md, and the unit test 'from nobody to one person switches "I know everyone there" on and presets "Can see them" to clearly' in test/rules.test.js.

## 4. A Save that couldn't go ahead didn't show which question needed an answer

- **Found:** 14 Oct 2026, by Fran, reviewing Set-up and Add a step.
- **What happened:** Pressing Save with something missing put "Needed before you can save." under each question still needing an answer, but the page only moved to put the first of those lines in the middle of the screen. The question it belonged to could be off the top, nothing marked it, and focus stayed on Save, so on a long form it was easy to miss which question was meant.
- **Why:** Save scrolled to the line with the message, not to its question, and did nothing else.
- **Fix:** Save now brings the first question with "Needed before you can save." to the top of the screen, just under the Back bar, outlines it in the error red until it has an answer, and moves focus into it, so a text box is ready to type in and a screen reader reads the question and the message. As soon as it is answered (typed in, picked, rated, or filled in by a button such as "Nothing I can think of", a "Stuck?" choice, Friends and family for now, or Time yourself), its message and outline go; press Save again and the next question still needing an answer gets the same. The same happens on Log an attempt, the four-weekly check-in, Set a new goal and a goal typed in Settings, as well as on Set-up and Add a step. On Set-up, the outline around "Where will you speak regularly?" holds only the question, its box and the Friends and family button, not the help under them.
- **Commit:** "Fix: review findings on Set-up, Suggest a step, Add a step and the Step screen".
- **Follow-up, 14 Oct 2026:** Fran's phone is an iPhone XR with Firefox, which on an iPhone runs on Safari's engine. That engine hasn't always honoured the page's scrolling settings, so the scroll is now worked out by the app itself: it puts the question a little under the Back bar wherever the page is. Checked by Fran on 14 Oct 2026, iPhone XR with Firefox: Save goes to the first missing question, and after it is filled in, Save goes to the next. Passes.
- **Check:** the hand test "A Save with something missing" in TESTING.md.

## 3. Set-up: a goal or situation typed in your own words was rated far from its box

- **Found:** 14 Oct 2026, by Fran, reviewing.
- **What happened:** A goal typed under "What do you want to be able to do by the end?" and added was rated at the end of the situations list, higher up the page (on a phone, about a screen above the box), and focus jumped up there. A situation typed in "[A situation in your own words]" was rated just above its box rather than under it.
- **Why:** Every situation, listed or typed, was rated in one list under "How frightening does each of these feel right now?", and anything typed went on the end of it.
- **Fix:** What you type is rated directly under the box you typed it in, newest first, and focus moves to its rating. A goal typed in the goal box is rated there, under Set-up's question (Q88), and is picked as your goal; it is still one of the situations you can pick from, and it is saved with the others. [Remove] sits with each, as before (Q59). A 9 or 10 given under the goal box brings up "Which is closer?" just under that rating, not under the situations higher up, and a screen reader says it has appeared.
- **Commit:** "Fix: review findings on Set-up, Suggest a step, Add a step and the Step screen".
- **Check:** the hand tests "Set-up: type a goal of your own" (updated) and "Set-up: a situation of your own" in TESTING.md.

## 2. Settings: no way to see how to save the venue

- **Found:** 13 Oct 2026, by Fran, testing on her phone.
- **What happened:** In Settings, under "Where will you speak regularly?", there was no Save button, so there was no visible way to keep a new venue. The same went for "Your town".
- **Why:** Both boxes saved silently when you left them, with nothing on screen to show it. That was a builder's call, not something answer 50 or 51 asked for.
- **Fix:** Each box has its own Save button, greyed out until what's typed differs from what's saved. Enter saves too. An empty venue isn't saved and says "Needed before you can save." Leaving with unsaved typing asks before discarding (Q63). Pace and goal still save the moment you choose, since the choice shows on screen.
- **Commit:** "Fix: Settings has a Save button for the venue and the town".
- **Check:** the hand test "Settings: change the venue" in TESTING.md.

## 1. Set-up: a goal typed in your own words was ignored

- **Found:** 13 Oct 2026, by Fran, testing stage 2.
- **What happened:** On Set-up, "What do you want to be able to do by the end?" only let you pick from the listed situations. PLAN.md L82 says you can pick one "or type your own (which is added to the list and rated)", and that its rating is the baseline.
- **Why:** Typing your own only worked through the small Add button under the list. The box had no visible label, Enter did nothing, and anything typed but not added was ignored when you pressed Save, which then said the goal was "Needed before you can save."
- **Fix:** The box is labelled "Or type your own" (from L82). Enter adds what you typed, as Add does. Save takes anything still typed in the box as your goal. Either way your goal joins the list of situations, focus moves to its rating, and that rating is saved as its baseline. The box for a situation in your own words (L81) works the same way.
- **Commit:** "Fix: a goal typed in your own words at Set-up is used".
- **Check:** the hand test "Set-up: type a goal of your own" in TESTING.md, and the unit test "a goal typed in the person's own words joins the situations, must be rated, and its rating is the baseline" in test/rules.test.js.
