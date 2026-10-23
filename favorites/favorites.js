// Favorites: everything the student has starred, newest first, grouped by type.
// To add a type (scales, modes, ...): add it to TYPES and teach parseFavoriteId() in shared/theory.js about it.
const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.8 5.9 6.4.9-4.7 4.5 1.1 6.4L12 17.4l-5.7 3.1 1.1-6.4L2.7 9.6l6.5-.9z"/></svg>';

const TYPES = {
  chord: {
    heading: "Chords",
    describe(fav) {
      const s = Store.settings.get();
      const name = fav.root[s.accidentals];
      return {
        name: chordTitle(name, fav.quality),
        full: chordFullName(name, fav.quality),
        href: Shell.BASE + "chords/?root=" + fav.root.pc + "&q=" + fav.quality.key,
        draw(target) {
          drawPiano(target, fav.root, fav.quality.tones.map(([semis], i) => ({ semis, isRoot: i === 0 })),
            { mini: true, label: chordFullName(name, fav.quality) });
        },
      };
    },
  },
  // scale: { heading: "Scales", describe(fav) { ... } },   (later)
};

function render() {
  const list = document.getElementById("favList");
  const groups = {};
  Store.favorites.list().forEach((item) => {          // newest first
    const parsed = parseFavoriteId(item.id);
    if (!parsed || !TYPES[parsed.type]) return;
    (groups[parsed.type] = groups[parsed.type] || []).push({ id: item.id, view: TYPES[parsed.type].describe(parsed) });
  });
  list.innerHTML = "";
  const types = Object.keys(TYPES).filter((t) => groups[t]);
  if (!types.length) {
    list.innerHTML = `<div class="fav-empty"><span class="big" aria-hidden="true">⭐</span>
      Nothing saved yet.<br>Tap the star on any chord to keep it here.<br><a href="${Shell.BASE}chords/">Open chords</a></div>`;
    return;
  }
  types.forEach((type) => {
    const section = document.createElement("section");
    section.className = "fav-group";
    section.innerHTML = `<h2>${TYPES[type].heading} <span>· ${groups[type].length}</span></h2><div class="fav-grid"></div>`;
    const grid = section.querySelector(".fav-grid");
    groups[type].forEach(({ id, view }) => {
      const card = document.createElement("div");
      card.className = "fav-card";
      card.innerHTML = `<a class="fav-link" href="${view.href}"><span class="fav-name"></span><span class="fav-piano"></span></a>
        <button type="button" class="fav-star" aria-label="Remove from favorites" title="Remove from favorites">${STAR}</button>`;
      card.querySelector(".fav-name").textContent = view.name;
      view.draw(card.querySelector(".fav-piano"));
      card.querySelector(".fav-star").addEventListener("click", () => {
        Store.favorites.remove(id);
        Shell.toast("Removed " + view.name, "Undo", () => Store.favorites.add(id));
      });
      grid.appendChild(card);
    });
    list.appendChild(section);
  });
}

Store.on((key) => { if (key === "favorites" || key === "settings") render(); });
render();
