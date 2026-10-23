// The chord encyclopedia tile: pick a note and a chord type, see it on the piano, hear it, save it as a favorite.
let settings = Store.settings.get();
const $ = (id) => document.getElementById(id);

let rootIndex = 0;           // C
let qualityKey = "min";      // start on C minor
let pinnedKey = null;        // a chord type opened from a favorite stays available even if Beginner mode would hide it

// Opened from a favorite? The link looks like  chords/?root=<pitch class>&q=<quality key>
(function readLink() {
  const q = new URLSearchParams(location.search);
  const i = ROOTS.findIndex((r) => r.pc === parseInt(q.get("root"), 10));
  if (i >= 0) rootIndex = i;
  if (QUALITIES.some((x) => x.key === q.get("q"))) qualityKey = pinnedKey = q.get("q");
})();

// "mix" is Auto: D♭ E♭ F♯ A♭ B♭. "sharp" and "flat" force one kind of accidental.
const rootName = (root) => root[settings.accidentals];
const rootLabel = (root) => fmt(rootName(root));
function availableQualities() {
  let list = settings.beginner ? QUALITIES.filter((q) => q.beginner).sort((a, b) => a.beginner - b.beginner) : QUALITIES;
  if (pinnedKey && !list.some((q) => q.key === pinnedKey)) list = list.concat(QUALITIES.find((q) => q.key === pinnedKey));
  return list;
}
const currentQuality = () => QUALITIES.find((q) => q.key === qualityKey);

// ---------- Rendering ----------
function render() {
  const root = ROOTS[rootIndex], quality = currentQuality(), name = rootName(root);
  // Beginner mode always uses the simplest spellings.
  const notes = buildChord(name, quality, {
    avoidDouble: settings.beginner || settings.avoidDouble,
    avoidOdd: settings.beginner || settings.avoidOdd,
  });
  drawPiano($("piano"), root, notes);

  $("chordTitle").textContent = chordTitle(name, quality);   // read by screen readers only
  $("chordFull").textContent = chordFullName(name, quality);
  const cell = (n, text) => `<td${n.isRoot ? ' class="root"' : ""}><span>${text}</span></td>`;
  $("noteTable").innerHTML =
    "<tr>" + notes.map((n) => cell(n, n.name)).join("") + "</tr>" +
    (settings.beginner ? "" : "<tr>" + notes.map((n) => cell(n, n.degree)).join("") + "</tr>");
  const aliases = settings.beginner ? [] : chordAliases(name, quality);
  $("aliases").textContent = aliases.length ? "Also written as: " + aliases.join(" · ") : "";
  updateStar();
}

// ---------- Favorite star ----------
const favoriteId = () => chordFavoriteId(ROOTS[rootIndex].pc, qualityKey);
function updateStar() {
  const saved = Store.favorites.has(favoriteId());
  $("favBtn").setAttribute("aria-pressed", String(saved));
  $("favBtn").setAttribute("aria-label", saved ? "Remove from favorites" : "Save to favorites");
  $("favBtn").title = saved ? "Remove from favorites" : "Save to favorites";
}
$("favBtn").addEventListener("click", () => {
  const id = favoriteId();
  const nowSaved = Store.favorites.toggle(id);
  $("favBtn").classList.remove("pop"); void $("favBtn").offsetWidth; $("favBtn").classList.add("pop");
  if (nowSaved) Shell.toast("Saved to favorites ⭐", "See all", () => { location.href = Shell.BASE + "favorites/"; });
  else Shell.toast("Removed from favorites", "Undo", () => Store.favorites.add(id));
});

// ---------- Wheels ----------
const rootWheel = createWheel($("rootPicker"), "left", rootLabel, () => "",
  (r) => { rootIndex = ROOTS.indexOf(r); render(); });
const qualityWheel = createWheel($("qualityPicker"), "right", (q) => q.abbr, (q) => q.full,
  (q) => { qualityKey = q.key; render(); });

function refreshWheels() {
  rootWheel.setOptions(ROOTS, rootIndex);
  const list = availableQualities();
  if (!list.some((q) => q.key === qualityKey)) qualityKey = "maj";   // e.g. Beginner mode hides this chord
  qualityWheel.setOptions(list, list.findIndex((q) => q.key === qualityKey));
}

// ---------- Sound ----------
const playChord = (arpeggio) => playMidiNotes(chordMidiNotes(ROOTS[rootIndex], currentQuality()), arpeggio);
$("playBtn").addEventListener("click", () => playChord(false));
$("arpBtn").addEventListener("click", () => playChord(true));

// ---------- Sharps / flats button: cycles Auto -> sharps -> flats ----------
const ACCIDENTAL_MODES = [
  { mode: "mix",   symbol: "♯♭", name: "Auto" },
  { mode: "sharp", symbol: "♯",  name: "Sharps" },
  { mode: "flat",  symbol: "♭",  name: "Flats" },
];
$("accBtn").addEventListener("click", () => {
  const i = ACCIDENTAL_MODES.findIndex((m) => m.mode === settings.accidentals);
  Store.settings.set({ accidentals: ACCIDENTAL_MODES[(i + 1) % ACCIDENTAL_MODES.length].mode });
});

function applySettings() {
  const acc = ACCIDENTAL_MODES.find((m) => m.mode === settings.accidentals) || ACCIDENTAL_MODES[0];
  $("accBtn").textContent = acc.symbol;
  $("accBtn").setAttribute("aria-label", `Sharps and flats: ${acc.name}. Tap to change.`);
  $("accBtn").title = `Sharps and flats: ${acc.name}`;
  refreshWheels();
  render();
}

// Settings (from the menu) and favorites (from another tab, or Undo) can change at any time.
Store.on((key) => {
  if (key === "settings") { settings = Store.settings.get(); applySettings(); }
  else if (key === "favorites") updateStar();
});

applySettings();
