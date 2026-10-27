/* Shared artifact runtime — review chrome only. Pages declare:
   <html data-states="key:Label,key2:Label2" data-default-state="key">
   window.PAGE_STATES = { key: { show:[variant…], text:{bind:value}, html:{bind:markup}, pill:{bind:[tone,label]}, attr:{"selector":{name:value}} } }
   Everything visual still comes from the token file via Tailwind utilities. */
(function () {
  var html = document.documentElement, q = new URLSearchParams(location.search);
  if (q.get("shot")) html.classList.add("shot");
  var saved = null; try { saved = JSON.parse(localStorage.getItem("pb-review") || "null"); } catch (e) {}
  var mode = q.get("mode") || (saved && saved.mode) || "dark";
  var tokens = q.get("tokens") || (saved && saved.tokens) || "portal";
  var states = (html.getAttribute("data-states") || "").split(",").filter(Boolean).map(function (s) { var i = s.indexOf(":"); return [s.slice(0, i), s.slice(i + 1)]; });
  var state = q.get("state") || html.getAttribute("data-default-state") || (states[0] && states[0][0]) || "default";
  var DEFS = window.PAGE_STATES || {};
  var PILL = { success: "border-success bg-success/10 text-foreground", warning: "border-warning bg-warning/10 text-foreground", destructive: "border-destructive bg-destructive/10 text-foreground", info: "border-info bg-info/10 text-foreground", muted: "border-border bg-muted text-foreground" };
  var pillBase = "inline-flex items-center whitespace-nowrap border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ";

  var sel = document.querySelector("[data-set-state]");
  if (sel) { states.forEach(function (s) { var o = document.createElement("option"); o.value = s[0]; o.textContent = s[1]; sel.appendChild(o); }); sel.onchange = function () { state = sel.value; apply(); }; }

  function applyState(s) {
    var def = DEFS[s] || {};
    var show = def.show || ["default"];
    document.querySelectorAll("[data-variant]").forEach(function (el) { el.classList.toggle("is-active", show.indexOf(el.dataset.variant) !== -1); });
    if (def.text) Object.keys(def.text).forEach(function (k) { document.querySelectorAll('[data-bind="' + k + '"]').forEach(function (el) { el.textContent = def.text[k]; }); });
    if (def.html) Object.keys(def.html).forEach(function (k) { document.querySelectorAll('[data-bind="' + k + '"]').forEach(function (el) { el.innerHTML = def.html[k]; }); });
    if (def.pill) Object.keys(def.pill).forEach(function (k) { document.querySelectorAll('[data-bind="' + k + '"]').forEach(function (el) { el.className = pillBase + PILL[def.pill[k][0]]; el.textContent = def.pill[k][1]; }); });
    if (def.attr) Object.keys(def.attr).forEach(function (selq) { document.querySelectorAll(selq).forEach(function (el) { Object.keys(def.attr[selq]).forEach(function (a) { var v = def.attr[selq][a]; if (v === null) el.removeAttribute(a); else el.setAttribute(a, v); }); }); });
    if (sel) sel.value = s;
    if (typeof window.PAGE_HOOK === "function") window.PAGE_HOOK(s, def);
  }
  function applyProgress() {
    var step = parseInt(document.body.getAttribute("data-step") || "0", 10); if (!step) return;
    var labels = ["", "Plan", "Owner", "Pharmacy", "Review & pay"];
    document.querySelectorAll("[data-step-item]").forEach(function (li) {
      var n = parseInt(li.dataset.stepItem, 10), b = li.querySelector("[data-step-badge]");
      li.className = "flex items-center gap-2 " + (n < step ? "text-foreground" : n === step ? "font-semibold text-foreground" : "text-muted-foreground");
      if (n < step) { b.className = "grid h-6 w-6 place-items-center bg-success text-success-foreground"; b.innerHTML = '<svg class="h-3.5 w-3.5"><use href="#i-check"/></svg>'; }
      else if (n === step) { b.className = "grid h-6 w-6 place-items-center bg-primary text-[11px] font-bold text-primary-foreground"; b.textContent = n; li.setAttribute("aria-current", "step"); }
      else { b.className = "grid h-6 w-6 place-items-center border border-border text-[11px] font-bold"; b.textContent = n; }
    });
    var sn = document.querySelector("[data-step-n]"), sl = document.querySelector("[data-step-label]"), sb = document.querySelector("[data-step-bar]");
    if (sn) sn.textContent = step; if (sl) sl.textContent = labels[step]; if (sb) sb.style.width = (step * 25) + "%";
  }
  function apply() {
    html.classList.toggle("dark", mode === "dark");
    html.setAttribute("data-tokens", tokens);
    document.querySelectorAll("[data-set-mode]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.setMode === mode)); });
    document.querySelectorAll("[data-set-tokens]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.setTokens === tokens)); });
    document.querySelectorAll("[data-toggle-theme]").forEach(function (b) { b.setAttribute("aria-label", mode === "dark" ? "Switch to light mode" : "Switch to dark mode"); });
    try { localStorage.setItem("pb-review", JSON.stringify({ mode: mode, tokens: tokens })); } catch (e) {}
    applyState(state); applyProgress();
    if (typeof window.PAGE_MEASURE === "function") requestAnimationFrame(window.PAGE_MEASURE);
  }
  document.querySelectorAll("[data-set-mode]").forEach(function (b) { b.onclick = function () { mode = b.dataset.setMode; apply(); }; });
  document.querySelectorAll("[data-set-tokens]").forEach(function (b) { b.onclick = function () { tokens = b.dataset.setTokens; apply(); }; });
  document.querySelectorAll("[data-toggle-theme]").forEach(function (b) { b.onclick = function () { mode = mode === "dark" ? "light" : "dark"; apply(); }; });
  var mb = document.querySelector("[data-toggle-menu]"), menu = document.getElementById("mobile-menu");
  if (mb && menu) { mb.onclick = function () { var open = menu.classList.toggle("hidden") === false; mb.setAttribute("aria-expanded", String(open)); }; if (q.get("menu")) { menu.classList.remove("hidden"); mb.setAttribute("aria-expanded", "true"); } }
  // Demo-only interactions: [data-goto="state"] buttons switch the review state (mock journeys).
  document.querySelectorAll("[data-goto]").forEach(function (b) { b.addEventListener("click", function (e) { e.preventDefault(); state = b.dataset.goto; apply(); }); });
  apply();
  if (document.fonts && document.fonts.ready && typeof window.PAGE_MEASURE === "function") document.fonts.ready.then(window.PAGE_MEASURE);
})();
