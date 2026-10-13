# Testing

The three checklists from PLAN.md's Testing section. Where an answer in QUESTIONS.md changed what you should see, a note says so. Bugs found go in BUGS.md.

Run the unit tests from the project folder with `node --test`.

**Unit tests on `rules.js`** (written by Claude Code, run with `node --test`):

- [ ] Easy: a stay rated at or below the easy line settles the step, even on the first attempt
- [ ] Hard: a stay rated above the easy line keeps the step open and asks for it again; a second hard stay on the same step switches the message to suggest a smaller step
- [ ] Matters set to a lot with fewer than three settled steps raises the early-steps caution. A step whose first stay was hard, or which ended in didn't stay, turns the too-big notice on; one easy stay turns it off
- [ ] Didn't stay sets the state and suggests one dial down, never two
- [ ] More than one thing changed since the last settled step, dials or toggles, raises the warning; one thing does not
- [ ] With no settled step yet, the first step raises no warning
- [ ] Rehearsal count reaching the target marks the step ready; the count keeps going past the target and past ready with no limit. A rehearsed-enough answer of no pre-fills the next step's rehearsal number with the last count plus two. Two about-the-same answers in a row produce the as-rehearsed-as-it-gets line; an easier or harder answer clears it. A step with more than five people and no venue set turns the find-somewhere line on. Two settled steps in a row with "I know everyone there" on, each settled on a first stay rated 2 or under, turn the friends-only line on; a hard first stay on a known-people step keeps it off; settling a step with the toggle off turns it off. A room-of-strangers rating of 7 or more at Set-up raises the friends rule's count to three. Any 9 or 10 at Set-up asks the clarifying question; the second answer shows the signpost line once, the first shows nothing. The check-in appears when the latest ratings are 28 days old, and the progress line shows the goal's baseline and latest rating
- [ ] Feels-easy answered no keeps the step in planning. Suggest a step from a settled step changes exactly one dial by exactly one notch, the one the person chose. Suggest a step with no settled step returns ten words, nobody there, not much. The word counter counts a pasted text correctly and shows three times from the three pace constants. Timing the sample passage sets pace to its word count divided by the minutes taken. No to a suggestion goes one notch smaller on the same dial; at the smallest notch it returns nothing and the app hands back. Mark ready now before the count: yes marks ready and sets readyEarly, no leaves the step rehearsing
  - Note (Q34, Q35): a no to a suggestion now greys out that dial and asks again, since there is nothing between the last step and one notch up; a no on every dial offers "Do your last step again". Only the floor step's no gives the signpost.
- [ ] Import rejects a file with an unknown schema version
- [ ] A grep of every string in the interface finds none of the banned words

**By hand, on a phone, as a first-time user** (clear site data first):

- [ ] Open the link cold: Welcome shows, reads well at 320px, Get started works
- [ ] Set-up: venue, pace (including Time yourself), the situation ratings and the goal save; the Toastmasters link opens
- [ ] Set-up: type a goal of your own in "Or type your own" instead of picking one, and press Save without pressing Add. It joins the list of situations, picked as your goal, and Save asks for its rating. Rate it and save. The Ladder shows it as your goal, and the progress line gives the rating you gave it. Try it again with Enter, and with Add. (Added for BUGS.md 1.)
- [ ] Breathe: tick today, tick again (refused, politely), see the strip
  - Note (Q24): the second press says "Already ticked today." and offers to un-tick it.
- [ ] Add a first step; see it on the Ladder
- [ ] Rehearse to target, answering easier, same or harder each time; state changes to ready; press +1 twice more and see the count keep going
- [ ] Log a hard attempt that stayed; see the do-it-again message; log an easy one; see settled
- [ ] Add a step that turns two dials; see the warning; turn one back. Press Suggest a step, pick people, say no twice, say yes; see it on the ladder, editable
  - Note (Q127): this needs a settled step with at least two people. Note (Q34): each no greys out that dial, so pick another dial for the next go.
- [ ] Log a didn't stay; see the no-blame message and the smaller step suggestion
- [ ] Settings: change the venue. Its Save button lights up; press it and it greys out again; leave Settings and come back to see the new venue. Clear the box and press Save: it says "Needed before you can save." Type a change and tap another tab without saving: the app asks before discarding. Do the same for the town, saving with Enter. (Added for BUGS.md 2.)
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
