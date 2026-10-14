# Jelly Legs

A phone web app that helps someone with a fear of public speaking build and climb their own ladder of speaking moments, one small step at a time, logging each attempt.

## Run it

Needs Node 24 and nothing else: there are no packages to install.

- `npm start` (or `node server.js`) serves the app on http://localhost:3000. The start-up line also gives the address to open on a phone on the same wifi. Set `PORT` to use another port.
- `npm test` runs every test.
- `node scripts/make-icons.mjs` remakes the home-screen icons in `public/` after the drawing in that script is changed.

Only the `public/` folder is served. PLAN.md, QUESTIONS.md, GAPS.md, BUGS.md and TESTING.md are the plan, the answers, what is still open, the bugs found and the checklists.

## Put it on Railway (Fran)

Railway builds the app from the GitHub repository on every push to `main`. Its builder, Railpack, sees a Node app (package.json), installs Node 24 (`engines` in package.json) and runs `node server.js` (`railpack.json`). There is no `railway.json`: Railway has stopped reading that file for new services (it is deprecated, with a cut-off of 1 December 2026), so the rest is set once in Railway's dashboard.

1. Push this repository to a new GitHub repository, with `main` as its default branch.
2. In Railway: New Project, Deploy from GitHub repo, pick it. Railway starts a first deploy straight away; that's fine. It deploys the repository's default branch: check under the service's Settings, Source that the branch is `main`, and leave automatic deploys on.
3. Leave the builder as Railpack, and leave Custom Start Command empty (railpack.json sets it). If the build log's Deploy section ever shows a start command other than `node server.js` (without railpack.json it would be `npm run start`), or the deploy log starts with `> jelly-legs@1.0.0 start`, put `node server.js` in Custom Start Command. Never `npm start`: npm keeps Railway's stop signal from reaching the server.
4. Networking: Generate Domain. Railway finds the port itself; don't set `PORT`.
5. Settings: Healthcheck Path `/`. Restart Policy: leave On Failure.
6. Draining time 10 seconds (Settings, under Teardown), or the service variable `RAILWAY_DEPLOYMENT_DRAINING_SECONDS=10`. Railway's default is 0, which stops the old deployment the moment it is told to, before the server can finish what it is sending.
7. Leave the CDN off, so phones always get the newest files.
8. Steps 2 to 7 show as changes waiting to be applied, with a banner at the top of the project. Press Deploy on that banner: that applies them and deploys again. (A push to `main` doesn't apply them.)

After that deploy, check:

- the build log shows Node 24 and the start command `node server.js`;
- the healthcheck on `/` passed;
- `curl.exe -sI https://<app>.up.railway.app/` shows each security header once (Content-Security-Policy, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, Cross-Origin-Opener-Policy, Cross-Origin-Resource-Policy, X-Frame-Options, Strict-Transport-Security). In Windows PowerShell type `curl.exe`: plain `curl` is a different command there. On a Mac, or in Git Bash, plain `curl` works;
- `curl.exe -sI http://<app>.up.railway.app/` is a redirect to `https://`, made by Railway;
- the hand tests in TESTING.md under "Live on Railway".

Keep the Railway address for good unless an own domain is wanted before anyone else uses the app (Q120): data on a phone belongs to one address, so moving later leaves everyone's ladder behind.

## For the write-up

Hosting is Railway, deploying from GitHub on every push to `main`. The app reads two environment variables, both set by Railway itself: `PORT`, the port to listen on, and `RAILWAY_ENVIRONMENT_NAME`, used only to leave the local-wifi address out of the start-up line. The only other setting made by hand is the draining time (step 6), which can also be set as the variable `RAILWAY_DEPLOYMENT_DRAINING_SECONDS`; it is Railway's, and the app never reads it. There are no secrets, because there is no third-party service. Security is HTTPS from Railway, strict security headers from the server (nothing loads from anywhere else, nothing inline runs, the app can't be framed), and the absence of any server-side data: everything stays in the phone's browser. Monitoring is Railway's deploy and request logs, which show whether the app is up. They hold no personal data, though Railway's request logs record IP addresses, as any host's do (Q113). The app logs only its start-up line.
