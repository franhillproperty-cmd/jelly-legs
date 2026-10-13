// Every word Jelly Legs shows a person, in one place, so the wording can be read,
// rewritten and checked against the language rule without reading the code.
// Sources: PLAN.md (Ln) and the answers in QUESTIONS.md (Qn). GAPS.md lists which of
// these are drafts waiting for Fran, and anything still in [square brackets].

export const APP_NAME = 'Jelly Legs';
export const TAGLINE = 'Get over your fear of public speaking in steps so small they feel easy (yes, even to you).'; // L245, Q78

export const COMMON = {
  back: 'Back',
  save: 'Save',
  ok: 'OK',
  yes: 'Yes',
  no: 'No',
  cancel: 'Cancel',
  add: 'Add',
  remove: '[Remove]', // no wording yet
  required: 'Needed before you can save.', // Q76
  wholeNumber: min => `A whole number, ${min} or more.`, // Q76
  saveFailed: '[The phone couldn\'t save that. Fran to write this message.]', // no wording yet
};

export const TABS = { ladder: 'Ladder', breathe: 'Breathe', settings: 'Settings' }; // L109

// ---------------------------------------------------------------- welcome (L208-L218, Q96)

export const WELCOME = {
  paragraphs: [
    'This app helps you get used to speaking in front of people, one small step at a time. You choose the steps.',
    'You\'ll build a ladder of speaking moments, from the easiest you can face to the one you want to reach, and climb it in real rooms, in front of real people. After each one, you\'ll write down how it went. The app tells you when to do a step again and when to move up.',
    'Start with the breathing exercise and practise it every day. Then find somewhere you can speak regularly. Then add your first step, and make it so small it\'s almost silly to count. That\'s the point.',
    'Everything you type stays on this phone. Nothing is sent anywhere.',
    'This is a tool for practising on your own. If your fear of speaking is part of something bigger, or a step is still upsetting you the next day, it\'s worth seeing a private CBT therapist as well as using this.',
  ],
  getStarted: 'Get started', // L76
  importLink: 'Used Jelly Legs on another phone? Import your file.', // Q65
};

// ---------------------------------------------------------------- set-up (L78-L83)

export const VENUE = {
  label: 'Where will you speak regularly?',
  friendsButton: 'Friends and family for now', // must match FRIENDS_AND_FAMILY in rules.js
  startWithFriends: 'Start with friends: if the step is a few lines in front of people you know, your kitchen is the venue and the club can wait.', // L45, Q60
  clubIntro: 'When you do join a club, say what you\'re doing. The app offers a line you can use:', // L45, turned to "you"
  clubLine: '"I\'m getting over a fear of speaking and I\'m taking it in very small steps. Could I start with something short?"', // L45
  clubsStartSmall: 'Clubs can usually start you small: a sentence introducing yourself as a guest, a one-minute report, a short answer in the table-topics round. Ask.', // Q60
  placesIntro: 'Other places where speaking for under a minute is normal:', // L45
  places: [
    'A toast at a family meal',
    'Reading to a child, a grandparent or a pet',
    'A book group where you read a passage aloud',
    'A choir, a drama group or an evening class, where everyone has to speak',
    'A work stand-up or reading the minutes',
    'Asking a question at a parish or council meeting',
    'A quiz team where you read out the answers',
    'Volunteering to read at a library story time or a care home',
    'A video call with the camera on',
    'A voice note sent to a friend',
    'Phoning a shop to ask a question, which is a step with nobody in the room',
  ],
  toastmastersLink: 'toastmasters.org', // Q56 (QUESTIONS.md numbering: venue searches)
  toastmastersUrl: 'https://www.toastmasters.org/',
  searches: [ // L45, L78: shown capitalised, searched as written
    { label: 'Speakers\' clubs near me', phrase: 'speakers\' clubs near me' },
    { label: 'Toastmasters near me', phrase: 'Toastmasters near me' },
    { label: 'Community groups near me', phrase: 'community groups near me' },
  ],
  go: 'Go',
  anyRoom: 'Any room where you\'re allowed to say a few words out loud will do.', // L45
};

export const SETUP = {
  heading: 'Set-up',
  town: 'Your town',
  townHint: 'Used only to fill in the three searches.', // L79
  paceLabel: 'How fast do you read aloud?',
  paceChoices: { slow: 'Slow', average: 'Average', quick: 'Quick' },
  timeYourself: 'Time yourself',
  wordsAMinute: n => `${n} words a minute`, // Q76's "words a minute"
  situationsLabel: 'How frightening does each of these feel right now?', // Q88
  ownSituation: '[A situation in your own words]', // L81: no wording yet
  ends: { low: 'not at all', high: 'unbearable' }, // L43, Q88
  goalLabel: 'What do you want to be able to do by the end?',
  goalHint: 'Pick one of the situations above, or type your own.', // L82, Q88
  savedBanner: 'Start here, learn this first.', // L83, Q74
};

export const SITUATION_TEXT = { // L43
  strangers: 'Speaking to a room of strangers',
  toast: 'Giving a toast at a family occasion',
  readAloud: 'Reading aloud at a service or a club',
  colleagues: 'Presenting to colleagues at work',
  fiveMinutes: 'Giving a five-minute talk',
  publicQuestion: 'Asking a question at a public meeting',
  introduce: 'Introducing yourself to a room of people',
};

export const CLARIFYING = { // L43, Q89
  question: 'Which is closer?',
  discomfort: '"It\'s horrible, but I\'ve stood up and done it, badly, and lived"',
  bigger: '"When it\'s happened I\'ve frozen, walked out, been sick or been unable to speak, or I\'ve turned down work or avoided events because of it."',
};

// The signposts (L35, L43, L47, Q74, Q80, Q97). "a private CBT therapist" and the register
// line are the only places the language rule allows that profession to be named.
export const SIGNPOST = {
  setup: 'This app is for practising on your own, and fear this size is worth taking to a private CBT therapist as well; it\'s not a reason to stop using the app.',
  floor: 'If even this doesn\'t feel easy, a private CBT therapist is the better next step, and the app will still be here afterwards.',
  register: 'How to find one: the BABCP register of accredited CBT therapists, cbtregisteruk.com.',
  registerUrl: 'https://www.cbtregisteruk.com/',
};

export const TIMING = { // L80, Q68, Q76, Q77
  heading: 'Time yourself',
  passage: 'On a quiet morning the kitchen is the warmest room in the house. The kettle takes its time, the window steams a little, and the cat decides whether the chair by the radiator is worth the effort. Outside, someone is scraping ice off a windscreen and not enjoying it. There is bread, there is butter, and there is the small question of whether the day starts now or after one more cup. Most mornings it starts after. That is not a failing. It is a plan, and like most good plans it is short, warm, and easy to keep.',
  start: 'Start',
  stop: 'Stop',
  done: 'Done',
  tryAgain: n => `That came out at ${n} words a minute, which is outside the range the app can use. Try again at your normal reading pace.`,
};

// ---------------------------------------------------------------- breathe (L85-L87, Q24, Q91)

export const BREATHE = {
  heading: 'Settle',
  subtitle: 'Two breaths in, one long breath out.',
  paragraphs: [
    'Breathe in through your nose. When your lungs feel full, take one more short sip of air in, through your nose, to fill them right up. Then let it all out through your mouth, slowly, until you\'re empty. That\'s one.',
    'Every day: five minutes of these, at your own pace. Sit or stand, set a timer, and keep going. It works best in the moment if you\'ve practised it when nothing was wrong.',
    'Before you speak: two or three of them, quietly, through your nose. Nobody will notice.',
    'If you feel dizzy, go back to ordinary breathing for a minute. If you have a condition that affects your breathing, check with your doctor before you start.',
  ],
  encouragement: {
    none: 'Nothing ticked in the last 7 days. One go, now, counts.',
    some: n => `${n} of the last 7 days. Keep going; it's the practice that makes it work on the day.`,
    all: 'Seven out of seven. This is the one that\'ll be there when you need it.',
  },
  practised: 'I practised today',
  alreadyTicked: 'Already ticked today.',
  untickQuestion: 'Un-tick today?',
  untick: 'Un-tick',
  keep: 'Keep',
  ticked: 'ticked', // L86, for the strip's spoken labels
  notTicked: 'not ticked',
};

// ---------------------------------------------------------------- dials, toggles, states

export const DIAL_LABELS = { words: 'Length', people: 'People', visibility: 'Can see them', matters: 'Matters' }; // L95, Q86
export const VISIBILITY = { notAtAll: 'not at all', barely: 'barely', partly: 'partly', clearly: 'clearly' };
export const MATTERS = { notMuch: 'not much', somewhat: 'somewhat', aLot: 'a lot' };
export const STATE_LABELS = { // L91
  planning: 'planning', rehearsing: 'rehearsing', ready: 'ready', settled: 'settled', didntStay: 'didn\'t stay',
};

export const TOGGLE_LABELS = { // L37
  knowEveryone: 'I know everyone there',
  standing: 'I\'ll be standing up',
  microphone: 'There\'s a microphone',
  recorded: 'It\'s being recorded or filmed',
  fromMemory: 'I\'m speaking from memory rather than reading',
  questions: 'There\'ll be questions afterwards',
  introduced: 'I\'ll be introduced by name',
  unusualItem: 'I\'ll be wearing or using something I don\'t usually (glasses, contact lenses, a new outfit)',
};
export const OWN_ITEM_LABEL = 'Something else'; // Q75

export const SWITCH_OFF = { // Q129, Q134
  knowEveryone: 'Try it with people you know.',
  standing: 'Try it sitting down.',
  microphone: 'Try it without the microphone.',
  recorded: 'Try it with nothing recording.',
  fromMemory: 'Try it reading from the page.',
  questions: 'Try it without questions afterwards.',
  introduced: 'Try it without being introduced.',
  unusualItem: 'Try it in what you\'d usually wear or use.',
  ownItem: words => `Try it without this: ${words}.`,
};

export const UNITS = {
  word: n => (n === 1 ? '1 word' : `${n} words`),
  person: n => (n === 0 ? 'alone' : n === 1 ? '1 person' : `${n} people`), // Q90
  outOfTen: n => `${n} out of 10`, // Q94
  atYourPace: t => `${t} at your pace`, // L95
  threePaces: (slow, average, quick) => `slow ${slow}, average ${average}, quick ${quick}`, // L23, the line under it (Q17)
  on: 'on',
  off: 'off',
  empty: '–',
};

// Weeks on the progress line are written as words: "Eight weeks on" (L43, Q55).
export const NUMBER_WORDS = {
  small: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'],
  tens: ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'],
  hundred: 'hundred',
  and: 'and',
};

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; // Q90
export const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // Q91, Sunday first as Date.getDay()
export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ---------------------------------------------------------------- the ladder (L89-L93)

export const LADDER = {
  heading: 'Ladder',
  progressStart: (a, n) => `Your goal felt like ${a} ${n} when you started.`, // L43, Q55
  progressNow: (weeks, a, n) => ` ${weeks} on, it's ${a} ${n}.`,
  week: n => (n === 1 ? 'week' : 'weeks'),
  article: n => (n === 8 || n === 11 || n === 18 ? 'an' : 'a'), // "a 9", "an 8"
  checkInPrompt: 'Four weeks on. How frightening does each of these feel now?', // Q75
  notices: {
    tooBig: 'That last step came in big. Make the next new one so small it feels silly doing it.', // Q20
    findSomewhere: 'Your next steps have more people in them. Time to find somewhere to speak regularly.', // Q75
    findSomewhereLink: 'Find somewhere',
    friendsOnly: 'You\'ve got comfortable with people you know, which is where everyone starts and won\'t carry over to strangers on its own; make the next step include at least one person you don\'t know.', // L41, Q74
  },
  empty: 'Your ladder starts here. Add a step, or let the app suggest one. This is the shape a ladder can take:', // Q75
  addStep: 'Add a step',
  suggestStep: 'Suggest a step',
};

// The example ladder (Q95): every row changes one thing from the row above.
export const EXAMPLE_LADDER = [
  { title: 'Say two lines out loud, alone, with the door shut', words: 25, people: 0, visibility: 'notAtAll', matters: 'notMuch' },
  { title: 'Read the same two lines to one friend in their kitchen', words: 25, people: 1, visibility: 'clearly', matters: 'notMuch' },
  { title: 'Read a short paragraph to that friend', words: 50, people: 1, visibility: 'clearly', matters: 'notMuch' },
  { title: 'The same paragraph to three people you know', words: 50, people: 3, visibility: 'clearly', matters: 'notMuch' },
  { title: 'A longer passage to the same three', words: 100, people: 3, visibility: 'clearly', matters: 'notMuch' },
  { title: 'The same passage with one person you don\'t know there', words: 100, people: 4, visibility: 'clearly', matters: 'notMuch' },
  { title: 'The same passage at a small gathering of ten', words: 100, people: 10, visibility: 'clearly', matters: 'notMuch' },
  { title: 'A longer reading, same gathering', words: 200, people: 10, visibility: 'clearly', matters: 'notMuch' },
  { title: 'The same reading somewhere it matters a bit, a service or a club', words: 200, people: 10, visibility: 'clearly', matters: 'somewhat' },
  { title: 'The same reading to a big room, lights on you, faces blurred', words: 200, people: 500, visibility: 'barely', matters: 'somewhat' },
  { title: 'The same room, and this time you can see them', words: 200, people: 500, visibility: 'clearly', matters: 'somewhat' },
  { title: 'A full page in that room', words: 400, people: 500, visibility: 'clearly', matters: 'somewhat' },
];

export const SUGGEST = { // L47, L93, Q6, Q26, Q34, Q75
  question: 'Which would you like to stretch a little?',
  sillyEasy: 'Is this step so small it\'s almost silly to count it?',
  lastTimeRating: n => `Last time: ${n} out of 10.`,
  lastTimeDidntStay: 'Last time: didn\'t stay.',
  nothingBetween: dial => `There's nothing between your last step and this one on ${dial}. Try stretching a different one.`,
  top: 'You\'re at the top of this ladder.',
  repeat: 'Do your last step again',
  floorWhere: 'At home with the door shut', // L47; must match FLOOR_WHERE in rules.js
};

// ---------------------------------------------------------------- add a step (L95-L98)

export const FORM = {
  addHeading: 'Add a step',
  title: 'Title',
  length: 'Length',
  pasteText: 'Paste the text (optional)', // L95
  wordCount: 'Word count', // L95
  people: 'People',
  visibility: 'Can see them',
  matters: 'Matters',
  checklist: 'Things that change without being noticed', // L37
  where: 'Where',
  when: 'When',
  whatsDifferent: 'What\'s different this time?',
  nothingDifferent: 'Nothing I can think of', // Q82
  sillyEasy: 'Is this step so small it\'s almost silly to count it?', // Q81
  notReallyEasy: 'If there\'s any version of this where it doesn\'t feel really easy, it isn\'t small enough yet. The floor is ten words, alone, out loud, with the door shut; that\'s a step and it counts.', // L35, Q83
  distractor: 'What do you find distracting?',
  stuck: 'Stuck?',
  distractors: [ // L49: shown capitalised, filled in as written
    'the TV on', 'a talk radio station', 'music with lyrics',
    'someone else talking in the room', 'a window onto a busy street', 'a video playing on the phone',
  ],
  target: 'Run-throughs with it on before you\'re ready',
  targetHigher: 'Last time you said you needed more rehearsal, so this starts higher.', // L53, Q74
  breathingNudge: n => `A week of the breathing exercise before your first step makes the step easier. You've done ${n} of the last 7 days.`, // Q18
  discard: 'Leave without saving? What you\'ve typed will be lost.', // Q76
  leave: 'Leave',
  stay: 'Stay',
};

export const ONE_THING = { // Q75
  title: 'More than one thing has changed',
  intro: 'Compared with your last settled step:',
  outro: 'Changing one thing at a time keeps each step easy.',
  changeBack: 'Change one back',
  keep: 'Keep it anyway',
};

export const EARLY_CAUTION = { // Q19
  text: 'This one matters a lot, and you\'ve settled fewer than three steps. Early steps work best where the stakes are low. If this moment is being forced on you (a work presentation, a family occasion), add two or three smaller steps before it: the same words, in front of people who don\'t matter.',
  deadline: date => `They need to fit before ${date}.`,
  understood: 'Understood',
};

export const SMALLER = { // Q31, Q46, Q75, Q135
  notQuite: 'Not quite small enough yet.',
  savedAsPlanning: 'Saved as planning until it feels silly-easy.',
  turnDown: (dial, from, to) => `Try turning ${dial} down: ${from} → ${to}.`,
  nextTime: (dial, from, to) => `Next time, try turning ${dial} down: ${from} → ${to}.`,
  whichToTurnDown: '[Which would you like to turn down?]', // Q5, Q135: no wording yet
  keepGoing: 'One stranger doesn\'t feel easy yet, and that\'s fine. Keep going with people you know and stretch a different dial. Come back to this when it feels silly-easy.',
};

// ---------------------------------------------------------------- the step screen (L100-L101)

export const STEP = {
  showText: 'Show the text', // Q69
  hideText: '[Hide the text]', // no wording yet
  why: 'The real thing feels easier than a distracted rehearsal, because in the room the distraction is gone.', // L100, Q84
  counter: (distractor, n, m) => `Run-throughs with ${distractor} on: ${n} of ${m}`,
  plusOne: '+1',
  feelQuestion: 'Compared with last time, that was:', // Q75
  feels: { easier: 'Easier', same: 'About the same', harder: 'Harder' },
  feelsInLine: { easier: 'easier', same: 'about the same', harder: 'harder' },
  asRehearsed: 'This is probably as rehearsed as it gets, and if the step still feels silly-easy, it\'s ready.', // L49, Q74
  undo: 'Undo that +1', // Q24
  markReadyNow: 'Mark ready now',
  oneMore: 'One more run-through first.', // L101, Q74
  readyEarly: (n, m) => `Marked ready after ${n} of ${m} run-throughs.`, // Q75
  logAttempt: 'Log an attempt',
  edit: 'Edit',
  delete: 'Delete',
  deleteQuestion: n => `Delete this step and its ${n} ${n === 1 ? 'attempt' : 'attempts'}? There's no undo.`, // Q76
  keep: 'Keep',
  stayed: 'Stayed',
  didntStay: 'Didn\'t stay',
  deleteAttempt: 'Delete',
  deleteAttemptQuestion: 'Delete this attempt? There\'s no undo.', // Q24
};

// ---------------------------------------------------------------- log an attempt (L103-L105)

export const LOG = {
  heading: 'Log an attempt',
  date: 'Date',
  future: 'An attempt can\'t be dated in the future.', // Q132
  stayed: 'Did you stay to the end?',
  hard: 'How hard was it to stay?',
  ends: { low: 'easy', high: 'nearly walked off' }, // L31, Q94
  learning: 'This is where the learning is. The embarrassment is part of it, and you\'ll remember it far longer than anyone else in the room will.', // Q47
  wentWrong: 'What went wrong?',
  wouldChange: 'What would you change?',
  feedback: 'Did anyone give you feedback?',
  rehearsedEnough: 'Had you rehearsed enough?',
  needMore: 'No, I needed more',
};

export const REPLIES = { // L222-L228, Q100, Q101
  didntStay: 'You went. That matters, even though it doesn\'t count as a step yet. Leaving early is the one thing that tells the fear it was right, so the next step is smaller, not braver. Turn one dial down and go again.',
  hard: 'You stayed. That\'s the whole job. It was hard, which means this step is still doing its work. Do the same one again and expect it to feel a little easier.',
  hardAgain: 'You\'ve stayed through it more than once and it\'s still hard. That usually means the step is bigger than it needs to be. Turn one dial down, settle that one, and come back to this.',
  easy: 'That one\'s done. It didn\'t bother you much, so there\'s nothing to repeat. Add the next step, change one thing, and keep it small enough to be almost silly.',
};

// ---------------------------------------------------------------- settings (L107, L117, Q76, Q108)

export const SETTINGS = {
  heading: 'Settings',
  showWelcome: 'Show the welcome again',
  export: 'Export your data',
  exportNote: 'Everything lives only on this phone. Export a copy to keep it safe, or to move it to another phone.',
  import: 'Import a file',
  importConfirm: 'Replace what\'s on this phone with this file?',
  replace: 'Replace',
  importRefused: 'That isn\'t a Jelly Legs file this version can read. Nothing has been changed.',
  imported: 'Imported. Your ladder\'s back.',
  deleteEverything: 'Delete everything',
  deleteFirst: 'Delete everything on this phone? Your ladder, your attempts, your breathing days and your settings.',
  continue: 'Continue',
  deleteSecond: 'Last chance. There\'s no undo. Export a copy first if you want one.',
  recovered: 'The app couldn\'t read what was saved on this phone, so it has started fresh and kept a copy of the old data aside. Export from Settings will include the copy.',
};

export const NOT_FOUND = { text: 'Nothing here.', link: 'Back to Jelly Legs' }; // Q76
