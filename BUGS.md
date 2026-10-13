# Bugs

Every bug found while testing, newest first: what happened, why, what changed, and how to check it stays fixed.

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
