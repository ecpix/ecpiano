// Everything the app remembers goes through this file: settings, favorites and flags.
//
// Today it saves on the device (localStorage, no cookies). The rest of the app only talks to
// `Store`, so when Google sign-in and cloud sync arrive, the saving and loading can be swapped
// here, in one place, without touching any tile.
//
// Favorites are saved as stable IDs built from the theory, never from labels:
//   chord:<pitch class 0-11>:<quality key>      e.g. "chord:3:maj7"  (E-flat/D-sharp major 7)
//   scale:<pitch class>:<scale key>             (later)
// so they keep working if a name or a design changes, and two devices can merge them with `merge()`.
const Store = (function () {
  const NS = "ecpiano.";          // our own namespace: never collides with the old chord encyclopedia site
  const memory = {};              // fallback when the browser blocks storage (private mode, etc.)
  const listeners = [];

  function read(key, fallback) {
    try {
      const raw = window.localStorage.getItem(NS + key);
      if (raw !== null) return JSON.parse(raw);
    } catch (e) {}
    return key in memory ? memory[key] : fallback;
  }
  function write(key, value) {
    memory[key] = value;
    try { window.localStorage.setItem(NS + key, JSON.stringify(value)); } catch (e) {}
    emit(key);
  }
  function emit(key) {
    listeners.forEach((fn) => { try { fn(key); } catch (e) { console.error(e); } });
  }
  // Changes made in another tab or window of the app.
  window.addEventListener("storage", (e) => {
    if (e.key && e.key.indexOf(NS) === 0) emit(e.key.slice(NS.length));
  });

  // ----- settings -----
  const SETTINGS_VERSION = 1;
  const DEFAULT_SETTINGS = {
    v: SETTINGS_VERSION,
    dark: false,
    beginner: false,
    avoidDouble: false,      // show G instead of Fx
    avoidOdd: true,          // show B instead of Cb, C instead of B#, ...
    accidentals: "mix",      // "mix" (Auto), "sharp" or "flat"
  };
  function migrate(saved) {
    // Settings saved by an older version of the app get upgraded here.
    return Object.assign({}, DEFAULT_SETTINGS, saved, { v: SETTINGS_VERSION });
  }
  const settings = {
    get() { return migrate(read("settings", {})); },
    set(patch) { write("settings", Object.assign(settings.get(), patch)); },
  };

  // ----- favorites -----
  const validItem = (it) => it && typeof it.id === "string" && typeof it.t === "number";
  const rawFavorites = () => read("favorites", []).filter(validItem);
  const favorites = {
    /** Newest first. Each item is { id, t } (t = when it was saved). */
    list() { return rawFavorites().sort((a, b) => b.t - a.t); },
    has(id) { return rawFavorites().some((it) => it.id === id); },
    add(id) { if (!favorites.has(id)) write("favorites", rawFavorites().concat({ id, t: Date.now() })); },
    remove(id) { write("favorites", rawFavorites().filter((it) => it.id !== id)); },
    /** Flips a favorite and returns whether it is now saved. */
    toggle(id) {
      if (favorites.has(id)) { favorites.remove(id); return false; }
      favorites.add(id); return true;
    },
    /** Merges favorites from another source (e.g. a cloud account after sign-in): union, keeping the newest time. */
    merge(other) {
      const byId = new Map();
      rawFavorites().concat((other || []).filter(validItem)).forEach((it) => {
        const have = byId.get(it.id);
        if (!have || it.t > have.t) byId.set(it.id, { id: it.id, t: it.t });
      });
      write("favorites", Array.from(byId.values()));
    },
  };

  // ----- small on/off flags (for example the developer unlock) -----
  const flags = {
    get(name) { return !!read("flag." + name, false); },
    set(name, value) { write("flag." + name, !!value); },
  };

  return { settings, favorites, flags, on(fn) { listeners.push(fn); } };
})();
