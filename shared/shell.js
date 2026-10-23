// The frame around every page: header with logo, settings menu, footer, pop-ups, install button.
// A page only needs <body data-title="..."> and its own <main>; this file adds the rest.
const Shell = (function () {
  // Site root (works on GitHub Pages and when opened from files): this script lives in <root>/shared/.
  const BASE = new URL("../", document.currentScript.src).href;
  const VERSION_LABEL = "Beta v0.1";
  const SKOOL = "https://www.skool.com/ecpiano-1707";
  const SUPPORT = "https://sociabuzz.com/ecpi_x/tribe";
  const ICON_EXT = '<svg class="ext-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9"/></svg>';
  const ICON_EXT_SM = '<svg class="ext-icon-sm" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9"/></svg>';
  const $ = (id) => document.getElementById(id);

  // Developer unlock: open any page with ?dev=1 once (saved on this device); ?dev=0 turns it off.
  const params = new URLSearchParams(location.search);
  if (params.has("dev")) Store.flags.set("dev", params.get("dev") === "1");
  const isDev = () => Store.flags.get("dev");

  const title = document.body.dataset.title || "ecpiano";

  document.body.insertAdjacentHTML("afterbegin", `
    <header class="topbar">
      <a class="brand" href="${BASE}" aria-label="ecpiano home">
        <img src="${BASE}icons/logo-128.png" width="40" height="40" alt="">
        <h1>${title}</h1>
      </a>
      <div class="topbar-right">
        ${isDev() ? '<span class="dev-chip" title="Developer mode is on (?dev=0 turns it off)">dev</span>' : ""}
        <button class="menu-btn" id="menuBtn" aria-label="Open settings" aria-expanded="false" aria-controls="menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
    <div class="scrim" id="scrim" hidden></div>
    <aside class="menu" id="menu" aria-label="Settings" hidden>
      <div class="menu-head">
        <div class="menu-title"><img src="${BASE}icons/logo-128.png" alt=""><h2>Settings</h2></div>
        <div class="menu-actions">
          <button class="icon-btn" id="themeBtn" aria-label="Switch to dark mode" title="Dark mode">
            <svg class="icon-moon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
            <svg class="icon-sun" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
          </button>
          <button class="icon-btn" id="menuClose" aria-label="Close settings">✕</button>
        </div>
      </div>
      <button class="switch-row" id="installRow" hidden>
        <span><b>Install ecpiano</b><small>Add it to your home screen like an app.</small></span>
      </button>
      <label class="switch-row">
        <span><b>Beginner mode</b><small>Basic chords only, no formula, simpler note names.</small></span>
        <input type="checkbox" id="optBeginner" role="switch">
      </label>
      <label class="switch-row" id="rowAvoid">
        <span><b>Avoid double sharps &amp; flats</b><small>Shows G instead of Fx. The formula keeps the exact spelling.</small></span>
        <input type="checkbox" id="optAvoid" role="switch">
      </label>
      <label class="switch-row" id="rowOdd">
        <span><b>Avoid C♭, B♯, E♯ &amp; F♭</b><small>Shows B, C, F and E instead. Turn off to see them.</small></span>
        <input type="checkbox" id="optOdd" role="switch">
      </label>
      <a class="switch-row link-row" href="${SUPPORT}" target="_blank" rel="noopener noreferrer">
        <span><b>☕ Find this helpful? Show some love ❤️</b></span>${ICON_EXT}
      </a>
      <a class="switch-row link-row" href="${SKOOL}" target="_blank" rel="noopener noreferrer">
        <span><b>Join the ecpiano community!</b></span>${ICON_EXT}
      </a>
      <div class="menu-foot"><small>${VERSION_LABEL}</small></div>
    </aside>`);

  document.body.insertAdjacentHTML("beforeend", `
    <footer>
      <a class="support" href="${SKOOL}" target="_blank" rel="noopener noreferrer">Join the ecpiano community! ${ICON_EXT_SM}</a>
      <a class="support" href="${SUPPORT}" target="_blank" rel="noopener noreferrer">☕ Find this helpful? Show some love ❤️ ${ICON_EXT_SM}</a>
      <p>© 2026 <a href="${SKOOL}" target="_blank" rel="noopener noreferrer">ecpiano</a></p>
    </footer>`);

  // ----- settings menu -----
  const menu = $("menu"), scrim = $("scrim"), menuBtn = $("menuBtn");
  function openMenu() { menu.hidden = scrim.hidden = false; menuBtn.setAttribute("aria-expanded", "true"); $("menuClose").focus(); }
  function closeMenu() { menu.hidden = scrim.hidden = true; menuBtn.setAttribute("aria-expanded", "false"); menuBtn.focus(); }
  menuBtn.addEventListener("click", openMenu);
  $("menuClose").addEventListener("click", closeMenu);
  scrim.addEventListener("click", closeMenu);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) closeMenu(); });

  function syncSettings() {
    const s = Store.settings.get();
    document.documentElement.dataset.theme = s.dark ? "dark" : "light";
    $("themeBtn").setAttribute("aria-label", s.dark ? "Switch to light mode" : "Switch to dark mode");
    $("themeBtn").title = s.dark ? "Light mode" : "Dark mode";
    $("optBeginner").checked = s.beginner;
    // Beginner mode always uses the simplest spellings, so those switches show on and are locked.
    $("optAvoid").checked = s.beginner || s.avoidDouble;
    $("optOdd").checked = s.beginner || s.avoidOdd;
    $("optAvoid").disabled = $("optOdd").disabled = s.beginner;
    $("rowAvoid").classList.toggle("disabled", s.beginner);
    $("rowOdd").classList.toggle("disabled", s.beginner);
  }
  const bind = (id, key) => $(id).addEventListener("change", (e) => Store.settings.set({ [key]: e.target.checked }));
  bind("optBeginner", "beginner"); bind("optAvoid", "avoidDouble"); bind("optOdd", "avoidOdd");
  $("themeBtn").addEventListener("click", () => Store.settings.set({ dark: !Store.settings.get().dark }));
  Store.on((key) => { if (key === "settings") syncSettings(); });
  syncSettings();

  // ----- "Install ecpiano" (only appears where the browser offers it, e.g. Chrome on Android) -----
  let installEvent = null;
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installEvent = e; $("installRow").hidden = false; });
  window.addEventListener("appinstalled", () => { installEvent = null; $("installRow").hidden = true; });
  $("installRow").addEventListener("click", async () => {
    if (!installEvent) return;
    installEvent.prompt();
    try { await installEvent.userChoice; } catch (e) {}
    installEvent = null; $("installRow").hidden = true;
  });

  // ----- offline use and automatic updates -----
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener("load", () => { navigator.serviceWorker.register(BASE + "sw.js").catch(() => {}); });
  }

  // ----- pop-up and toast -----
  function popup(heading, text) {
    const wrap = document.createElement("div");
    wrap.className = "popup-scrim";
    wrap.innerHTML = `<div class="popup" role="dialog" aria-modal="true" aria-label="${heading}">
        <button class="icon-btn popup-x" aria-label="Close">✕</button>
        <h2></h2><p></p><button class="pill" type="button">Got it!</button></div>`;
    wrap.querySelector("h2").textContent = heading;
    wrap.querySelector("p").textContent = text;
    const close = () => { wrap.remove(); document.removeEventListener("keydown", onKey); };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    wrap.addEventListener("click", (e) => { if (e.target === wrap) close(); });
    wrap.querySelector(".popup-x").addEventListener("click", close);
    wrap.querySelector(".pill").addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    document.body.appendChild(wrap);
    wrap.querySelector(".pill").focus();
  }

  let toastTimer = null;
  function toast(text, actionLabel, onAction) {
    let t = $("toast");
    if (!t) { document.body.insertAdjacentHTML("beforeend", '<div class="toast" id="toast" role="status" hidden></div>'); t = $("toast"); }
    t.innerHTML = "<span></span>";
    t.firstChild.textContent = text;
    if (actionLabel) {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = actionLabel;
      b.addEventListener("click", () => { t.hidden = true; onAction && onAction(); });
      t.appendChild(b);
    }
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 5000);
  }

  return { BASE, isDev, popup, toast, ICON_EXT };
})();
