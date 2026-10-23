// Runs before the page paints, so dark mode doesn't flash on load.
// Reads the same saved settings as store.js.
(function () {
  try {
    var s = JSON.parse(localStorage.getItem("ecpiano.settings") || "{}");
    if (s.dark) document.documentElement.setAttribute("data-theme", "dark");
  } catch (e) {}
})();
