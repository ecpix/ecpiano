# ecpiano

A piano toolkit that works like an app: chords now, then scales, a metronome, flashcards and lessons.
Plain HTML, CSS and JavaScript. No build step, no accounts, no cookies. Free to host on GitHub Pages.

> **Sandbox status:** pages carry `<meta name="robots" content="noindex">` so search engines skip them
> while the app is being built. Remove that line from each page's `<head>` at launch.

## Structure

```
index.html          the hub: a grid of tiles
hub/                hub.js (the list of tiles) + hub.css
chords/             tile: chord encyclopedia
favorites/          tile: everything starred, newest first, grouped by type
scales/ metronome/ flashcards/ lessons/    placeholders, locked for students until finished
shared/             code every tile reuses
  theme.css         colors (light + dark), header, settings menu, footer, pop-ups
  theme-init.js     applies dark mode before the page paints
  store.js          ALL saving and loading: settings, favorites, flags (see below)
  user.js           who is using the app (anonymous for now; Google sign-in later)
  theory.js         notes, spelling, chord rules (pure logic, no page code)
  piano.js/.css     draws the keyboard (full size, or a small picture)
  wheel.js          the curved endless wheel picker
  audio.js          the piano-like sound (Web Audio, no sound files)
  shell.js          header, settings menu, footer, install button, pop-ups, toasts
manifest.webmanifest, sw.js, icons/    make it installable and usable offline
fonts/              Fredoka (SIL Open Font License)
```

## Adding a tile

1. Make a folder (copy `scales/index.html` as a starting point) with `<body data-title="Name">`.
2. Add one line to `TILES` in `hub/hub.js`. Use `status: "locked"` until it is ready, then change it to `"live"`.
3. Add its files to `CORE` in `sw.js` and bump `VERSION` so the offline copy refreshes.

## Locked tiles and developer mode

Locked tiles are visible but greyed out; tapping one shows a "coming soon" pop-up.
Open any page once with `?dev=1` (for example `.../ecpiano/?dev=1`) to unlock them on that device. `?dev=0` turns it off.
This is cosmetic: everything is in a public repo, so never put anything private here.

## Saving data (and the plan for Google sign-in)

Everything the app remembers goes through `shared/store.js`. Today it saves on the device (localStorage, no cookies,
under the `ecpiano.` prefix so it never mixes with the old chord encyclopedia site).

- **settings** `{ v, dark, beginner, avoidDouble, avoidOdd, accidentals }`. `v` is a version number; `migrate()` upgrades old saves.
- **favorites** `[{ id, t }]`. IDs are built from theory, not labels: `chord:<pitch class 0-11>:<quality key>`
  (e.g. `chord:3:maj7`), so E-flat and D-sharp are the same favorite. Future types: `scale:<pc>:<key>`.
  `Store.favorites.merge(remote)` unions two lists (newest time wins), for when a student signs in.
- **flags** small on/off switches (the developer unlock).

To add cloud sync later: sign the student in (`shared/user.js`), then load/save through the same `Store` calls
against a database, and call `merge()` once so favorites saved before signing in are kept. No tile has to change.
Leaderboards need a server that validates scores and a nickname filter.

## Updates and offline

`sw.js` is "network first": online, pages/scripts/styles are always fetched fresh (bypassing GitHub Pages' 10-minute
browser cache); offline, the last copy seen is used. A returning student gets a new version the next time they open the app.

## Publishing

Settings → Pages → Build and deployment → Source: *Deploy from a branch* → Branch: `main`, folder `/ (root)`.
The site appears at `https://ecpix.github.io/ecpiano/`. `.nojekyll` is present so GitHub serves the files as they are.
