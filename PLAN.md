# Jelly Legs: Build Plan

Oct 13, 2026 · @Fran

A phone web app that helps someone with a fear of public speaking build and climb their own ladder of speaking moments, one small step at a time, logging each attempt. Version one is the ladder and the logbook; the practice itself happens in the real world. Everything stays on the person's phone.

**To Claude Code, before anything else:** read this whole document through once. Then, before you write any code, tell me every point where you would have to guess, and ask. Do not fill a gap with a sensible default; the rules in The method and the on-screen wording are the product, and a guess there is a bug.

## What it is

A ladder and a logbook for people who are frightened of speaking in front of others and want to get over it without a therapist. The person builds their own ladder of speaking moments, from the smallest thing they can face to the biggest they want to reach, climbs it in the real world, and records how each attempt went. The app's job is to help them size each step sensibly, keep the record, and tell them when to repeat and when to move up.

Who it's for: adults with an ordinary fear of public speaking, using it alone, on their own phone, with no account and no sign-up. The first rungs need nobody (alone, then one friend), so a venue isn't needed to start, but by the middle of the ladder they need somewhere real to speak regularly: a club such as Toastmasters, a church or chapel, a choir, a drama group, a book group, work. Set-up asks for one, shows a list of everyday places where speaking for under a minute is normal, offers ready-made searches for anyone still stuck, and doesn't force a choice: "friends and family for now" is an answer, and the app asks again when a step with more than five people appears and no venue is set.

What it is not: a guided practice session, a coach, a chat, or treatment. The practice happens off the phone. The app holds the plan and the record. One plain line in the welcome screen says this is a self-practice tool and that anyone whose fear is part of something bigger, or who finds a step is still upsetting them the next day, should see a private CBT therapist as well.

Name: Jelly Legs. The home screen inside the app is still called the Ladder.

## The method

These rules come from the procedure Fran followed herself. They are the product; the screens exist to carry them. Claude Code should not add rules, soften these, or substitute textbook versions.

**Four dials, not one ladder.** A step is defined by four things the person sets: the length of the text they'll speak (in words), how many people will be there (a number), how much of the audience they can see (not at all, barely, partly, clearly), and how much it matters to them how it goes (not much, somewhat, a lot). Three lines in front of friends and the same three lines in front of your boss are different steps, and the difference is how difficult that audience is for you, not how many of them there are. The person chooses which dial to turn next. For the length dial the person can paste the text or type a number; the app counts the words and shows roughly how long it takes to say at a slow, average and quick pace (about 110, 140 and 170 words a minute; approximate, and set as three constants Fran can change). The person sets their pace in Set-up, by picking slow, average or quick or by timing themselves reading a short passage the app provides, and can change it any time in Settings in case they misjudged it, and the Ladder shows each step's length as words and minutes. This matters for anyone whose venue times speeches, which Toastmasters does.

**Every step is ridiculously easy.** The test of a right-sized step is the person's own reaction to it: it feels so easy they feel silly doing it. If it doesn't feel silly, it's too big. The reason is that failing at a step teaches the fear it was right, so the app's bias is always towards smaller: when in doubt it says shrink, never stretch. A hard stay isn't a failure, but it is a sign the step was bigger than it needed to be, and the app says so gently.

**One thing at a time.** When the person creates a new step, the app compares it with the step they settled most recently, whatever size that step was. It compares the four dials and every toggle on the checklist. If the new step differs in more than one place, the app warns and suggests putting one of the changes back: a longer text with the same audience, or the same text with a bigger audience, never both at once. It warns; it does not block. The person can still save the step.

**Done means stayed.** An attempt counts only if the person got to the end and did not walk off. How well it went is recorded separately and does not affect whether it counts. Walking off is recorded as "didn't stay", with no blame attached, and the app suggests a smaller version of the same step (one dial down). The reason, said once in the app's own words: leaving early teaches the fear it was right; staying teaches it that it wasn't.

**Repeat if it was hard, move up if it was easy.** After each attempt the person rates how hard it was to stay, 0 (easy) to 10 (nearly walked off). A stay rated at or below the easy line settles the step and the app suggests the next one, even after a single attempt: there is no point repeating something that didn't bother you, though the person can repeat it anyway if they choose to. A stay above the line means the same step again. After two stays above the line on the same step, the app suggests a smaller step instead of a third go, because two hard stays mean the step was bigger than it needed to be. Easy line: 2.

**Notice when a step came in too big.** No model needed; this is a check on the log. If a step's first stay was hard (rated above 2), or it ended in didn't stay, the app shows a notice at the top of the Ladder and again on Add a step: that last step came in big; make the next one so small it feels silly doing it. The notice stays until a step comes in easy. While it's on, Suggest a step offers the same dial move it would anyway, but shows the rating that set the notice off beside it so the person can see why.

**Size the step before you take it.** Before a step can be marked ready, the app asks two questions. What is different this time compared with your last step, even if it looks the same? (Free text; "nothing I can think of" is an acceptable answer, but the question is always asked.) Is this step so small it's almost silly to count it? (Yes or no, asked for every new step and every edit that changes a dial, with no exceptions.) Yes means it's the right step. No means it's too big: the step stays in planning and the app suggests which dial to turn down. Under the question, one line: if there's any version of this where it doesn't feel really easy, it isn't small enough yet. The floor is ten words, alone, out loud, with the door shut; that's a step and it counts. If even the floor gets a no, the app says kindly that a private CBT therapist is the better next step, and that it will still be here afterwards.

**Catch what you haven't thought of.** The dials don't cover everything, and the thing that bites is often something the person never counted as a variable. So Add a step shows a short checklist of things that change without being noticed, as toggles the person switches on if they apply: I know everyone there; I'll be standing up; there's a microphone; it's being recorded or filmed; I'm speaking from memory rather than reading; there'll be questions afterwards; I'll be introduced by name; I'll be wearing or using something I don't usually (glasses, contact lenses, a new outfit). Plus a blank line for their own. A toggle that differs from the last settled step counts as a thing changed under the one-thing rule. The free-text question stays too, because no list is complete.

**Early steps are for audiences that don't matter.** When a person sets "a lot" on the matters dial before they have three settled steps, the app cautions: practise where the stakes are low first. If the high-stakes moment is forced on them (work, a family occasion), the app doesn't argue. It suggests adding two or three smaller steps before it, the same content in front of people who don't matter, and it uses the step's date as the deadline those smaller steps have to fit before, and says so. The person adds those steps, with Suggest a step to help if they're stuck.

**Friends are the start, not the test.** Practising only with people you know builds a confidence that doesn't carry into a room of strangers, and a person can climb a long way without noticing they've never risked it. So the app watches the "I know everyone there" toggle, but how much rope it gives depends on how the person is doing, not on a fixed count. While their stays with people they know are still coming in hard, the app says nothing: staying with friends until the fear comes down is the method working. Once they're cruising, two settled steps in a row with the toggle on (three if they rated a room of strangers 7 or more at Set-up) and each settled on an easy first stay (rated 2 or under), a line appears on the Ladder and on Add a step: you've got comfortable with people you know, which is where everyone starts and won't carry over to strangers on its own; make the next step include at least one person you don't know. One stranger in the room counts, and it's one thing changed under the one-thing rule. That stranger step still goes through the usual sizing test. If one stranger doesn't feel so easy it's almost silly, the app says keep going with people you know and grow a different dial until it does, and the line waits. It clears when a step with the toggle off is settled.

**A baseline, and a check-in.** Set-up shows a short list of speaking situations and asks the person to rate each for how frightening it feels right now, 0 (not at all) to 10 (unbearable): speaking to a room of strangers; giving a toast at a family occasion; reading aloud at a service or a club; presenting to colleagues at work; giving a five-minute talk; asking a question at a public meeting; introducing yourself to a room of people; plus any they add in their own words. They pick one as their goal, the top of the ladder, and it shows on the Ladder in their words. The ratings are kept with their date; the first set is the baseline. Every four weeks the app asks for the same ratings again, in one line at the top of the Ladder, and the progress line under the goal shows the movement: "Your goal felt like a 9 when you started. Eight weeks on, it's a 5." This is the only measure of progress the app has that isn't about a single step. The rating for a room of strangers sets the rope in the friends rule: two easy known-people steps before the stranger line if it was 6 or under, three if it was 7 or more. Any 9 or 10 at Set-up gets one clarifying question before anything else, because most people would say they'd rather die than speak in public and mean it only as a figure of speech. Which is closer? "It's horrible, but I've stood up and done it, badly, and lived" or "When it's happened I've frozen, walked out, been sick or been unable to speak, or I've turned down work or avoided events because of it." The first is strong discomfort, and the app carries on as normal. The second gets the signpost line, once and kindly: this app is for practising on your own, and fear this size is worth taking to a private CBT therapist as well; it's not a reason to stop using the app. Private rather than NHS, because NHS services are for distress that is there every day, and this usually isn't. How to find one: the BABCP register of accredited CBT therapists, cbtregisteruk.com; Fran to confirm the link before shipping.

**Somewhere to speak that allows tiny steps.** A venue only works if it will let the person do something very small. Toastmasters clubs run prepared speeches of five to seven minutes, which is far too big a first rung, so the Set-up screen tells the person two things. First, start with friends: if the step is a few lines in front of people you know, your kitchen is the venue and the club can wait. Second, when they do join a club, say what they're doing. The app offers a line they can use: "I'm getting over a fear of speaking and I'm taking it in very small steps. Could I start with something short?" Most clubs can accommodate that through the small speaking parts of a meeting: introducing yourself as a guest in a sentence or two, reading a one-minute report as timer or grammarian, a short table-topics answer, and only then the first prepared speech. Clubs vary, so the app says to ask rather than assume. If none of the list fits, Set-up offers three ready-made searches that open in the phone's browser with the person's town filled in, if they gave one: speakers' clubs near me, Toastmasters near me, community groups near me. The query is shown and editable before it opens, so the person is doing the searching, not the app. Under it, one line: any room where you're allowed to say a few words out loud will do. "Friends and family for now" is an acceptable answer, and the Ladder reminds them to find somewhere once a step with more than five people exists and no venue is set. Set-up also shows a list of other places where speaking for under a minute is normal, for people with no club or chapel: a toast at a family meal; reading to a child, a grandparent or a pet; a book group where you read a passage aloud; a choir, a drama group or an evening class, where everyone has to speak; a work stand-up or reading the minutes; asking a question at a parish or council meeting; a quiz team where you read out the answers; volunteering to read at a library story time or a care home; a video call with the camera on; a voice note sent to a friend; phoning a shop to ask a question, which is a step with nobody in the room.

**If they're stuck, the app may suggest; the person still decides.** The person writes their own steps. When they can't think of one, a Suggest a step button on the Ladder offers one built by rule, not by guesswork. It first asks which they'd like to stretch a little: length, people, seeing them, or stakes. Then it takes the last settled step and turns that one dial up by one notch. Notches: words 10, 25, 50, 100, 200, 400, 700, 1000; people 0 (alone, out loud), 1, 2, 3, 5, 10, 20, 50, 100, 250, 500; can see them not at all, barely, partly, clearly; matters not much, somewhat, a lot. With no settled step yet, the suggestion is the smallest step there is: ten words, nobody there, out loud, not much, at home with the door shut (no venue needed). The suggestion arrives with the same question every step gets: is it so small it's almost silly to count it? Yes saves it as their step, editable like any other. No makes the app go one notch smaller on the same dial; at the smallest notch, which is the alone-in-a-room step, it says kindly that if even this doesn't feel easy, a private CBT therapist is the better next step, and that the app will still be here afterwards. Nothing goes on the ladder that the person hasn't said yes to. A step born this way is flagged as suggested so you can see later whether suggestions get rated as easy as the person's own steps.

**Rehearse with a distractor.** The why comes first, in one line on the step screen before any of the mechanics: rehearsing with something distracting on makes the real thing feel easier by comparison, because when you stand up in front of people the distraction is gone. Then the mechanics, in order. One: the app asks what the person finds distracting, in their own words, and offers a list if they're stuck (the TV on, a talk radio station, music with lyrics, someone else talking in the room, a window onto a busy street, a video playing on the phone). Two: it asks how many full run-throughs with that distractor on they want before the step counts as ready; the box starts at 3 and they can type any number. Three: each time they get to the end of a run-through, however badly it went, they press +1 and answer with one tap: easier than last time, about the same, or harder. The distractor doesn't have to stop bothering them; getting to the end is what counts. Four: the answers show as a line under the counter, oldest first, so they can see the step settling; after three run-throughs it might read: easier, easier, about the same. Two "about the same" answers in a row make the app say this is probably as rehearsed as it gets, and that if the step still feels silly-easy, it's ready. An easier or harder answer clears that message. Five: when the count reaches the number, the step is marked ready. There is no upper limit; they can keep rehearsing past the number and past ready. Six: if a chance to speak arrives before the count is reached, a Mark ready now link asks whether the step still feels so easy it's almost silly. Yes marks it ready and notes it was rehearsed less than planned; no asks for one more run-through.

**Learn to settle before you need it.** The app teaches one short breathing exercise (the cyclic sigh, drafted under Content; Fran edits the words) and asks the person to practise it daily, starting before their first step. A tracker shows how many of the last seven days they practised. The app recommends a week of practice before the first step; it does not block.

**Mistakes are the material.** Every attempt log asks what went wrong, what they'd change, whether anyone gave them feedback, and whether they'd rehearsed enough (yes, or no, I needed more). The app says, once per log, that this is where the learning is, that the embarrassment is part of it rather than a sign something went wrong, and that they'll remember it far longer than anyone who was in the room will. If they answered no, I needed more, the app uses that once: the next time they add a step, the rehearsal box starts at the number of run-throughs they did last time plus two, instead of at 3, with a line under it saying "last time you said you needed more rehearsal, so this starts higher". They can still type any number. Proposed; Fran to confirm the plus two.

**Language rule (the guardrail).** Nothing the person sees uses clinical or textbook vocabulary, with one exception: the signpost line may say "a private CBT therapist", because that is what they need to search for. Applies to every label, button, message, placeholder and error. British spelling. Second person. Short sentences. Warm but not cute.

| Never on screen | Say instead |
| --- | --- |
| exposure, desensitisation, systematic | step, practice, getting used to it |
| hierarchy | ladder |
| anxiety rating, SUDS, distress | how hard was it to stay (0 to 10) |
| extinction, habituation, reinforcement, conditioning | (not needed; say what happens in plain words) |
| trigger, phobia, disorder, symptom | fear of speaking, nerves |
| therapy, treatment, patient, client, intervention | (not used, with one exception: the signpost line may say "a CBT therapist", because that is what the person needs to search for) |
| homework, assignment | your next step, your rehearsal |
| relapse, avoidance | didn't stay, a smaller step |

**Humour.** The app's name is a joke about the fear, and a light touch takes some of the dread out of a frightening subject. Two limits. The joke is always about the fear, never about the person: jelly legs are something that happens to you, not something you are. And it stays out of the didn't-stay message, where the person may be raw; that one is plain and kind. The name itself is the main use. Claude Code does not add jokes of its own; any further use of the phrase is Fran's to write into the on-screen text.

## Screens and flow

Eight screens, phone-width, one job per screen. The Ladder is home. For each screen: what it shows, top to bottom; what it asks for; its buttons; and what happens when a button is pressed. Where a message's words are needed, they are the drafts under Content, used word for word. Written as a list rather than a diagram because the main reader of this section is Claude Code.

1. **Welcome.** Shown once, the first time the app is opened. After that it is reached only from Settings.
   - Shows: the welcome text from Content, word for word.
   - Buttons: one, Get started. Pressing it opens Set-up.
2. **Set-up.** Shown once, straight after Welcome. Every field on it can be changed later in Settings.
   - Field 1, Where will you speak regularly? A text box, plus a button that fills it with "Friends and family for now". Under the box: the start-with-friends line, the line to say to a club, and the list of everyday places, all from The method; a link to toastmasters.org; and three Search buttons (speakers' clubs near me, Toastmasters near me, community groups near me). Pressing a Search button shows the query in an editable box with the town filled in if one was given, and a Go button that opens the phone's browser with that query. Required: the box must contain something.
   - Field 2, Your town. A text box. Optional. Used only to fill in the three searches.
   - Field 3, How fast do you read aloud? Three choices (slow, average, quick) and a Time yourself button. Time yourself shows a passage of about 100 words with a Start button; Start becomes Stop; pressing Stop sets the pace to the passage's word count divided by the minutes taken, and shows it as words per minute. Leaving the passage before pressing Stop changes nothing. Required: a choice or a timed result.
   - Field 4, the speaking situations. The list from The method, each with a 0 to 10 rating control, plus a text box and an Add button for situations in the person's own words, each of which then gets its own rating control. Required: every listed situation rated. Any rating of 9 or 10 makes the clarifying question from The method appear directly under the list, before the person can continue; the second answer shows the signpost line once.
   - Field 5, What do you want to be able to do by the end? Pick one of the situations above, or type your own (which is added to the list and rated). Required. This is the goal; its rating today is the baseline.
   - Buttons: one, Save. Pressing it saves everything and opens Breathe, with a one-line banner: start here, learn this first.
3. **Breathe.** Reached from the tab bar on every screen.
   - Shows, top to bottom: the exercise text below, word for word (Fran's to edit). Title: Settle. Two breaths in, one long breath out. Instructions: Breathe in through your nose. When your lungs feel full, take one more short sip of air in, through your nose, to fill them right up. Then let it all out through your mouth, slowly, until you're empty. That's one. Every day: five minutes of these, at your own pace. Sit or stand, set a timer, and keep going. It works best in the moment if you've practised it when nothing was wrong. Before you speak: two or three of them, quietly, through your nose. Nobody will notice. If you feel dizzy, go back to ordinary breathing for a minute. If you have a condition that affects your breathing, check with your doctor before you start.
   - Then: a seven-day strip, today at the right end, each day ticked or not. Under it, one line of encouragement chosen by how many of the seven are ticked: one wording for 0, one for 1 to 6, one for 7. Drafts, Fran's to edit. For 0: "Nothing ticked yet this week. One go, now, counts." For 1 to 6: "\[N\] of the last 7 days. Keep going; it's the practice that makes it work on the day." For 7: "Seven out of seven. This is the one that'll be there when you need it."
   - Buttons: one, I practised today. Pressing it ticks today. Pressing it again the same day does nothing except show "Already ticked today". Days are the phone's local calendar days.
4. **Ladder.** Home. Reached from the tab bar.
   - Shows, top to bottom: the goal, in the person's words. Under it, the progress line: the goal's rating at Set-up and at the latest check-in, worded as in The method. Under that, when due, the check-in itself (every 28 days: the situations list with rating controls and a Save button; saving adds a dated set of ratings). Under that, any notices that are on (next bullet). Then the steps.
   - Notices: up to three one-line notices, each with its own on and off rule in The method. The too-big notice: on when the most recent attempt on any step was a first stay rated above 2, or a didn't stay; off when a stay rated 2 or under is logged. The find-somewhere line: on when any step has more than five people and the venue is "Friends and family for now"; off when the venue is changed to anything else. The friends-only line: on when the rope rule in The method is met; off when a step with "I know everyone there" switched off is settled. When more than one is on, they stack in that order.
   - The steps: the step the person is working on now (the most recently made step whose state is planning, rehearsing or ready) sits at the top, so it is visible without scrolling. Under it, all other steps, newest first. Settled steps and didn't-stay steps are shown in a quieter style. Each step row shows: title; the four dial values, with length as words and minutes; the date if one was set; the state (planning, rehearsing, ready, settled, didn't stay). Tapping a row opens that step's Step screen.
   - Empty state, before any step exists: one sentence and the example ladder from Content, shown as an illustration, not as steps.
   - Buttons: two, in a bar fixed just above the tab bar so they never scroll out of view: Add a step, which opens Add a step blank; and Suggest a step, which asks which dial to stretch (length, people, seeing them, stakes), then shows the suggested step with the silly-easy question. Yes opens Add a step pre-filled with the suggestion; no shows a smaller suggestion on the same dial, or at the smallest notch the signpost line from The method. Nothing is saved until the person presses Save on Add a step.
5. **Add a step.** Also used for editing an existing step; the only difference is that the fields start filled.
   - Fields, in this order: Title (text, required). Length: a box to paste the text into (optional) and a number box for the word count (required; filled automatically if text is pasted), with the minutes at the person's pace shown beside it. People (a whole number, 0 allowed, required). Can see them (not at all, barely, partly, clearly; required). Matters (not much, somewhat, a lot; required). The checklist from The method, as toggles, all off by default, plus a text box for anything else. Where (text, filled with the venue from Set-up). When (a date, optional). What's different this time? (text, required; "nothing I can think of" is accepted). Is this step so small it's almost silly to count it? (yes or no, required), with the not-really-easy line under it. What do you find distracting? (text, with a Stuck? button that shows the list from The method; required). Run-throughs with it on before you're ready (number, starts at 3, or at last time's count plus two if the last attempt log said more rehearsal was needed).
   - When editing: if any dial or toggle is changed, the silly-easy answer is cleared and must be answered again before Save.
   - Buttons: Save, and Back. Back with unsaved changes asks before discarding.
   - On Save, in this order. First, the one-thing check: compare the dials and toggles with the most recently settled step; if more than one differs, show a dialog naming the differences, with Change one back (returns to the form) and Keep it anyway (continues). Second, the early-steps caution: if Matters is "a lot" and fewer than three steps are settled, show the caution text once, with one button, Understood. Third, the silly-easy answer: yes saves the step in state rehearsing; no saves it in state planning and shows the make-it-smaller message with the dial the app suggests turning down. Then return to the Ladder.
6. **Step.** One step, opened from the Ladder.
   - Shows, top to bottom: title, the four dial values, the date if set, the state. The why line: the real thing feels easier than a distracted rehearsal, because in the room the distraction is gone. The counter: "Run-throughs with \[distractor\] on: N of M" and a large +1 button. Under the counter, the answers so far, oldest first (easier, easier, about the same). When the last two answers are both about the same: the as-rehearsed-as-it-gets line from The method. While N is less than M: a Mark ready now link. The attempts for this step, newest first, each showing date, stayed or didn't, the 0 to 10 rating, and the notes. At the bottom: Edit and Delete.
   - Buttons and what they do: +1 adds one to N and immediately asks one question with three choices, easier than last time, about the same, harder; the answer is stored and shown in the answers line. When N reaches M the state becomes ready; N keeps counting after that with no limit. Mark ready now asks the silly-easy question; yes sets the state to ready and records that the step was rehearsed less than planned, no shows "one more run-through first" and changes nothing. Log an attempt opens Log an attempt for this step. Edit opens Add a step filled with this step. Delete asks for confirmation, warns that the step's attempts go with it, and on yes deletes both and returns to the Ladder.
7. **Log an attempt.** Opened from a Step.
   - Fields, in this order: Date (starts at today). Did you stay to the end? (yes or no, required). How hard was it to stay? (0 to 10, required). What went wrong? (text). What would you change? (text). Did anyone give you feedback? (text). Had you rehearsed enough? (yes, or no, I needed more; required).
   - Buttons: Save, and Back.
   - On Save, the app picks one of four replies from Content and shows it on its own screen with one button, OK, which returns to the Ladder. Didn't stay: reply one; the step's state becomes didn't stay. Stayed, rating above 2, and no earlier hard stay on this step: reply two; state unchanged. Stayed, rating above 2, and this step already has a hard stay: reply three. Stayed, rating 2 or under: reply four; the step's state becomes settled. After any save, the notices on the Ladder are re-checked.
8. **Settings.** Reached from the tab bar.
   - Shows, as a list of controls: venue, town, pace (including Time yourself) and goal, each editable; Show the welcome again; Export your data (downloads one JSON file); Import a file (reads one JSON file, after confirming it will replace what is on the phone); Delete everything (asks for confirmation twice). Nothing else.

**Navigation**: a bottom tab bar with Ladder, Breathe, Settings. Every other screen has a back control at the top left. No hamburger menus, no gestures the person has to discover.

## Data and privacy

Everything the person types stays in their phone's browser storage. There is no account, no server-side database, no analytics, no cookies, no third-party scripts and no external fonts. The server serves files and nothing else. The only way data leaves the phone is the person pressing Export, which downloads a single JSON file they own. The ready-made venue searches open the phone's browser with a query the person sees and can edit first; that is them searching, not the app sending anything.

This is the privacy design, not a shortcut: the records are a frightened person's account of their own worst moments and nobody else needs to hold them. The welcome screen says so in one line.

Consequences to accept and state in the write-up: clearing the browser's site data wipes the app; a new phone starts empty unless the person imports their export; two phones never share a ladder. Settings says this plainly beside the Export button.

| Record | Fields |
| --- | --- |
| Person (one) | venue, town (optional), goal, pace (words per minute, from a timed reading, or 110, 140 or 170 for slow, average, quick), situations (the list of speaking situations, the person's own included, each with its ratings by date; the first set is the baseline), goalSituation, welcomeSeen, schemaVersion |
| Breathing practice | one entry per date practised |
| Step | id, title, words, text (optional, if pasted), people, visibility (not at all, barely, partly, clearly), matters (not much, somewhat, a lot), toggles (the checklist items switched on, plus any the person added), where, whatsDifferent, feelsEasy (yes, no), suggested (yes, no), distractor, rehearsalTarget, rehearsalCount, rehearsalFeel (a list, one of easier, same, harder per run-through), readyEarly (yes, no), when (optional date), state (planning, rehearsing, ready, settled, didntStay), createdAt |
| Attempt | id, stepId, date, stayed (yes, no), hardToStay (0 to 10), rehearsedEnough (yes, no), wentWrong, wouldChange, feedback, createdAt |

The schema carries a version number so a later release can migrate old data. Export and import use the same JSON shape; import validates the version and refuses anything it doesn't recognise with a plain message.

## Technical choices and deployment

Plain HTML, CSS and JavaScript, no framework and no build step. One `index.html`, one stylesheet, a small set of script files with the rules in their own module (`rules.js`) so they can be tested without a browser. The reasons: nothing to install, nothing to compile, every bug is visible in the file that caused it, and Claude Code debugs this kind of app fastest.

Mobile first. Designed at 375px wide and checked at 320px. Large tap targets, system fonts, high contrast, works with the phone's text-size setting. A web app manifest so the person can add it to their home screen with its own icon. No service worker in version one.

Server: a zero-dependency Node server (`server.js`, the built-in `http` module, no `package.json` dependencies) that serves the static files and reads its port from the `PORT` environment variable. Hosting: Railway, deploying from the GitHub repository on every push to `main`. Railway provides HTTPS, deploy logs and the environment variables panel.

Version control from the first commit. A GitHub repository is both the course's "code link" and the version history: `git log` to see what changed, `git revert` to undo a change that made things worse.

Tests: the rules module gets unit tests with Node's built-in test runner (`node --test`), so testing adds no dependencies. Everything on screen is tested by hand against the checklist in Testing.

| Course step | Here |
| --- | --- |
| Version history (AI Studio) | git commits on GitHub; one commit per fix |
| Describe a bug in words or with a screenshot | the same, to Claude Code |
| Add a rule the app follows from now on | the language rule in The method; a test greps the interface for the banned words |
| Stress-test the logic | the edge cases in Testing |
| Welcome message | the Welcome screen |
| Tailor to the user, cut what they don't need | no developer controls, no raw data views; Settings holds five things |
| Test as a first-time user | clear site data, open the link cold, follow the checklist |
| Share with one person first (soft launch) | send the Railway link to one person; fix what they hit |
| Publish | the Railway link is public; there is no Share mode because there is no private data on the server |

For the write-up: hosting is Railway from GitHub; the only environment variable is `PORT`, which Railway sets; there are no secrets because there is no third-party service; security is HTTPS from Railway plus the absence of any server-side data; monitoring is Railway's deploy and request logs, which show whether the app is up and nothing about any person.

## Testing

Three layers: unit tests on the rules, a walk-through by hand on a phone, and a set of deliberate attempts to break it. Keep a bug list in `BUGS.md` in the repository; the course's reflection question wants it.

**Unit tests on `rules.js`** (written by Claude Code, run with `node --test`):

- [ ] Easy: a stay rated at or below the easy line settles the step, even on the first attempt
- [ ] Hard: a stay rated above the easy line keeps the step open and asks for it again; a second hard stay on the same step switches the message to suggest a smaller step
- [ ] Matters set to a lot with fewer than three settled steps raises the early-steps caution. A step whose first stay was hard, or which ended in didn't stay, turns the too-big notice on; one easy stay turns it off
- [ ] Didn't stay sets the state and suggests one dial down, never two
- [ ] More than one thing changed since the last settled step, dials or toggles, raises the warning; one thing does not
- [ ] With no settled step yet, the first step raises no warning
- [ ] Rehearsal count reaching the target marks the step ready; the count keeps going past the target and past ready with no limit. A rehearsed-enough answer of no pre-fills the next step's rehearsal number with the last count plus two. Two about-the-same answers in a row produce the as-rehearsed-as-it-gets line; an easier or harder answer clears it. A step with more than five people and no venue set turns the find-somewhere line on. Two settled steps in a row with "I know everyone there" on, each settled on a first stay rated 2 or under, turn the friends-only line on; a hard first stay on a known-people step keeps it off; settling a step with the toggle off turns it off. A room-of-strangers rating of 7 or more at Set-up raises the friends rule's count to three. Any 9 or 10 at Set-up asks the clarifying question; the second answer shows the signpost line once, the first shows nothing. The check-in appears when the latest ratings are 28 days old, and the progress line shows the goal's baseline and latest rating
- [ ] Feels-easy answered no keeps the step in planning. Suggest a step from a settled step changes exactly one dial by exactly one notch, the one the person chose. Suggest a step with no settled step returns ten words, nobody there, not much. The word counter counts a pasted text correctly and shows three times from the three pace constants. Timing the sample passage sets pace to its word count divided by the minutes taken. No to a suggestion goes one notch smaller on the same dial; at the smallest notch it returns nothing and the app hands back. Mark ready now before the count: yes marks ready and sets readyEarly, no leaves the step rehearsing
- [ ] Import rejects a file with an unknown schema version
- [ ] A grep of every string in the interface finds none of the banned words

**By hand, on a phone, as a first-time user** (clear site data first):

- [ ] Open the link cold: Welcome shows, reads well at 320px, Get started works
- [ ] Set-up: venue, pace (including Time yourself), the situation ratings and the goal save; the Toastmasters link opens
- [ ] Breathe: tick today, tick again (refused, politely), see the strip
- [ ] Add a first step; see it on the Ladder
- [ ] Rehearse to target, answering easier, same or harder each time; state changes to ready; press +1 twice more and see the count keep going
- [ ] Log a hard attempt that stayed; see the do-it-again message; log an easy one; see settled
- [ ] Add a step that turns two dials; see the warning; turn one back. Press Suggest a step, pick people, say no twice, say yes; see it on the ladder, editable
- [ ] Log a didn't stay; see the no-blame message and the smaller step suggestion
- [ ] Export, delete everything, import; see the ladder return
- [ ] Add to home screen; open from the icon
- [ ] Phone text size at largest: nothing overlaps or gets cut off

**Break it on purpose** (the course's stress test):

- [ ] A step with a blank title, zero words, zero people; a pasted text of 650 words with odd spacing and line breaks
- [ ] A rating of 11, of -1, of nothing
- [ ] A rehearsal target of 0, of 999
- [ ] A ladder with one step and an attempt on it
- [ ] Delete a step that has attempts; confirm; check nothing else vanished
- [ ] Log an attempt dated in the future
- [ ] Import a file that isn't JSON; import a JSON file from a different app
- [ ] Rotate the phone mid-form; nothing typed is lost
- [ ] Press back mid-form; the app asks before discarding
- [ ] Break the language rule on purpose: type "exposure" into a title; it saves (the rule governs the app's words, not the person's)

**Review by someone who didn't build it**: before the soft launch, ask Claude Code to run a fresh review of the interface copy against The method and the language rule, in a new session with no memory of the build.

## Content only Fran can write

Claude Code must not invent any of these. Where a gap is empty, it should put the placeholder text on screen in square brackets and list it as unfinished.

**The breathing exercise.** Now written out in full under Screens, Breathe, where Claude Code will read it; the pattern is the cyclic sigh (a long slow out-breath), practised daily and used in the minute before speaking, and the sources are in the chat where it was researched. Fran edits the words there.

**The easy line.** The method moves a person up when a stay is rated at or below the easy line, which is 2. After two hard stays on one step it suggests a smaller step. Nothing left to decide here.

**The welcome screen.** A draft to edit, not to accept:

> This app helps you get used to speaking in front of people, one small step at a time. You choose the steps.
>
> You'll build a ladder of speaking moments, from the easiest you can face to the one you want to reach, and climb it in real rooms, in front of real people. After each one, you'll write down how it went. The app tells you when to do a step again and when to move up.
>
> Start with the breathing exercise and practise it every day. Then find somewhere you can speak regularly. Then add your first step, and make it so small it's almost silly to count. That's the point.
>
> Everything you type stays on this phone. Nothing is sent anywhere.
>
> This is a tool for practising on your own, not treatment. If your fear of speaking is part of something bigger, or a step is still upsetting you the next day, it's worth seeing a private CBT therapist as well as using this.

**The replies after an attempt.** Four messages, one per case, shown on screen the moment the log is saved. Drafts in a plain voice; Fran rewrites in hers.

> **Didn't stay.** You went, and that counts for a lot. Leaving early is the one thing that tells the fear it was right, so the next step is smaller, not braver. Turn one dial down and go again.
>
> **Stayed, and it was hard.** You stayed. That's the whole job. It was hard, which means this step is still doing its work. Do the same one again and expect it to feel a little easier.
>
> **Stayed, hard, for the second time.** You've stayed through it twice and it's still hard. That usually means the step is bigger than it needs to be. Turn one dial down, settle that one, and come back to this.
>
> **Stayed, and it was easy.** That one's done. It didn't bother you much, so there's nothing to repeat. Add the next step, change one thing, and keep it small enough to be almost silly.

**An example ladder.** Shown once, on the empty Ladder screen, so a new person can see what a ladder looks like before they build one. Drafted from the shape of your own, dials included; edit freely:

| Step | Words | People | Can see them | Matters |
| --- | --- | --- | --- | --- |
| Say two lines out loud, alone, with the door shut | 25 | 0 | not at all | not much |
| Read two lines aloud to one friend in their kitchen | 25 | 1 | clearly | not much |
| Read a short passage at a small gathering where you know everyone | 150 | 10 | clearly | not much |
| The same, again, if it was hard | 150 | 10 | clearly | not much |
| A longer reading, same room | 400 | 10 | clearly | not much |
| The same reading, with one person you don't know in the room | 400 | 10 | clearly | not much |
| A few lines in a bigger room | 40 | 60 | partly | not much |
| A short reading in the bigger room | 200 | 60 | partly | somewhat |
| A full page in a hall, lights on you, faces blurred | 300 | 500 | barely | somewhat |
| The same hall, same page, and this time you can see them | 300 | 500 | clearly | somewhat |

**The name, the tagline and the icon.** A short name for the home-screen icon (phones cut labels after about twelve characters) and a one-line tagline that carries the description, used under the name on the Welcome screen and as the page title people see in a browser tab and in search. Name: Jelly Legs. Tagline, a draft to edit: "Get over your fear of public speaking in steps so small they feel easy (yes, even to you)." Gap: \[Fran to confirm the tagline\]. The icon can be a simple drawn shape; no stock imagery.

## Version two

Named here so they stay out of version one and so there is an answer when the course asks what you'd build next. None of these are to be started, stubbed, or left as hidden switches in the first build.

- A guided rehearsal session on the phone: a timer, the distractor playing, a rating before and after
- A model-based step-suggester that writes a step in words, not just dial values, calling a model through a server-side function with a key in Railway's variables (version one's suggester is rule-based and works offline)
- Recording a rehearsal and playing it back
- A reminder to practise breathing, as a notification
- Offline use with a service worker, if people report the app failing to load at venues with no signal
- Sharing a ladder between two phones, which would mean accounts and a database and a privacy decision
- A page for Toastmasters clubs or teachers who want to point members at the app

## Kickoff prompt for Claude Code

Before you start: fill the gaps in Content only Fran can write, export this doc as Markdown, save it as `PLAN.md` in an empty folder, open Claude Code in that folder, and paste the prompt below. Work in stages and test each one before asking for the next; that is the course's own loop and it keeps you in control of what gets built.

```markdown
Read PLAN.md in full before doing anything. It is the specification for a small phone web app. Build version one exactly as it describes, and nothing from the Version two section.

Before you write any code, list every decision PLAN.md leaves open or anything in it you think is contradictory, and ask me. Do not fill gaps with your own guesses, especially in The method and the on-screen wording.

Then build in this order, stopping after each stage so I can test it:
1. git init, a README with the one-line description, and rules.js with its unit tests. Run the tests and show me the results.
2. The screens, with the on-screen text taken from PLAN.md. Where PLAN.md marks a gap in square brackets, put that bracketed placeholder on screen and list it in a file called GAPS.md.
3. server.js (zero dependencies, PORT from the environment), the web app manifest, and the Railway deployment config.
4. BUGS.md, started empty, and a short TESTING.md that copies the three checklists from PLAN.md.

Rules for the whole build: no frameworks, no build step, no npm dependencies, no analytics, no external fonts or scripts, nothing stored anywhere but the browser. Never use any word from the banned list in The method anywhere a person could see it. Commit after each stage with a plain message saying what changed.
```

When it asks its questions, answer the ones you can and say "your call, note it in GAPS.md" for the rest. Then test each stage on your phone against the checklists before moving on. The three checklists plus `BUGS.md` are the raw material for the course's reflection answer.
