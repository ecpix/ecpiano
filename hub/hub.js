// Home page: the tiles. "live" tiles open; "locked" tiles show a fun "coming soon" pop-up
// (unless developer mode is on: open any page once with ?dev=1).
const COMING_SOON_TITLE = "Coming soon!";
const GENERIC_LINES = [
  "Coming soon! 🎹 This one's still in rehearsal.",
  "Almost ready! 🎶 We're tuning this one up.",
  "Something fun is on the way! ✨",
];

// To add a tile: add a line here and create its folder. Change status to "live" when it is ready.
const TILES = [
  { id: "chords",     title: "Chords",     desc: "See any chord on the piano", icon: "🎹", href: "chords/", status: "live" },
  { id: "favorites",  title: "Favorites",  desc: "Your saved chords",          icon: "⭐", href: "favorites/", status: "live" },
  { id: "scales",     title: "Scales",     desc: "Scales and modes",           icon: "🎼", href: "scales/", status: "locked",
    lines: ["Still scaling this one! 🎹", "Climbing the scale… almost at the top! 🪜"] },
  { id: "metronome",  title: "Metronome",  desc: "Keep steady time",           icon: "⏱️", href: "metronome/", status: "locked",
    lines: ["Locking in the tempo real soon! ⏱️", "Counting in… 1, 2, 3, 4! 🥁"] },
  { id: "flashcards", title: "Flashcards", desc: "Games and flashcards",       icon: "🃏", href: "flashcards/", status: "locked",
    lines: ["Shuffling the deck… flashcards are coming! 🃏", "Game on soon! 🎮"] },
  { id: "lessons",    title: "Lessons",    desc: "Classroom, modules, lessons", icon: "🎓", href: "lessons/", status: "locked",
    lines: ["Class is almost in session! 🎓", "The lesson plan is being tuned up… 📚"] },
];
const COMMUNITY = { title: "Community", desc: "Join the ecpiano community", icon: "💬", href: "https://www.skool.com/ecpiano-1707" };

const pick = (list) => list[Math.floor(Math.random() * list.length)];
// Mostly a line that fits the tile, sometimes one of the general ones.
const comingSoonLine = (tile) => (tile.lines && Math.random() < 0.65 ? pick(tile.lines) : pick(GENERIC_LINES.concat(tile.lines || [])));

function favoritesText() {
  const n = Store.favorites.list().length;
  return n === 0 ? "Tap ☆ on any chord to save it" : n === 1 ? "1 saved" : n + " saved";
}

function renderTiles() {
  const dev = Shell.isDev();
  const root = document.getElementById("tiles");
  root.innerHTML = "";
  TILES.forEach((t) => {
    const locked = t.status === "locked" && !dev;
    const el = document.createElement(locked ? "button" : "a");
    el.className = "tile " + (t.status === "live" ? "live" : "locked");
    if (locked) el.type = "button"; else el.href = t.href;
    el.innerHTML = `<span class="tile-icon" aria-hidden="true">${t.icon}</span>
      <span class="tile-title">${t.title}</span>
      <span class="tile-desc">${t.id === "favorites" ? favoritesText() : t.status === "locked" ? "Coming soon" : t.desc}</span>`;
    if (t.status === "locked") el.insertAdjacentHTML("beforeend", dev ? '<span class="tile-dev">dev</span>' : '<span class="tile-lock" aria-hidden="true">🔒</span>');
    if (locked) el.addEventListener("click", () => Shell.popup(COMING_SOON_TITLE, comingSoonLine(t)));
    root.appendChild(el);
  });
  const c = document.createElement("a");
  c.className = "tile live wide";
  c.href = COMMUNITY.href; c.target = "_blank"; c.rel = "noopener noreferrer";
  c.innerHTML = `<span class="tile-icon" aria-hidden="true">${COMMUNITY.icon}</span>
    <span class="tile-text"><span class="tile-title">${COMMUNITY.title}</span><span class="tile-desc">${COMMUNITY.desc}</span></span>${Shell.ICON_EXT}`;
  root.appendChild(c);
}

Store.on((key) => { if (key === "favorites") renderTiles(); });
renderTiles();
