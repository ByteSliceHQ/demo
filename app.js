(function () {
  "use strict";

  var STORAGE_ITEMS = "todo-items";
  var STORAGE_THEME = "todo-theme";
  var MAX_LEN = 200;
  var FILTERS = ["all", "active", "done"];

  var todos = [];
  var filter = "all";
  var focusPlan = null;
  var themeChoice = null; // "dark" | "light" | null (null = follow the system)

  var form = document.getElementById("todo-form");
  var input = document.getElementById("todo-input");
  var list = document.getElementById("todo-list");
  var emptyState = document.getElementById("empty-state");
  var itemsLeftEl = document.getElementById("items-left");
  var clearBtn = document.getElementById("clear-completed");
  var themeToggle = document.getElementById("theme-toggle");
  var filterButtons = Array.prototype.slice.call(
    document.querySelectorAll("#filters [data-filter]")
  );

  /* ------------------------------------------------------------------ *
   * Storage helpers (never throw when storage is blocked)
   * ------------------------------------------------------------------ */

  function safeGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function safeSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      /* ignore */
    }
  }

  function makeId() {
    return (
      Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
    );
  }

  // Cap by code points so a surrogate pair is never split in half.
  function capText(text) {
    if (text.length <= MAX_LEN) return text;
    return Array.from(text).slice(0, MAX_LEN).join("");
  }

  /* ------------------------------------------------------------------ *
   * Sanitizing
   * ------------------------------------------------------------------ */

  function sanitize(raw) {
    var arr = raw;
    if (typeof raw === "string") {
      try {
        arr = JSON.parse(raw);
      } catch (e) {
        return [];
      }
    }
    if (!Array.isArray(arr)) return [];

    var out = [];
    var seenIds = Object.create(null);

    for (var i = 0; i < arr.length; i++) {
      var item = arr[i];
      if (!item || typeof item !== "object") continue;
      if (typeof item.text !== "string") continue;

      var text = capText(item.text.trim());
      if (!text) continue;

      // Take the stored id when it is a usable unique string, else mint one.
      var id =
        typeof item.id === "string" && item.id && !seenIds[item.id]
          ? item.id
          : makeId();
      while (seenIds[id]) id = makeId();
      seenIds[id] = true;

      out.push({ id: id, text: text, done: item.done === true });
    }

    return out;
  }

  function load() {
    todos = sanitize(safeGet(STORAGE_ITEMS));
  }

  function save() {
    safeSet(STORAGE_ITEMS, JSON.stringify(todos));
  }

  /* ------------------------------------------------------------------ *
   * Theme
   * ------------------------------------------------------------------ */

  function systemPrefersDark() {
    try {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch (e) {
      return false;
    }
  }

  function readStoredTheme() {
    var stored = safeGet(STORAGE_THEME);
    if (stored === "dark") return "dark";
    if (stored === "light") return "light";
    return null;
  }

  function isDark() {
    if (themeChoice === "dark") return true;
    if (themeChoice === "light") return false;
    return systemPrefersDark();
  }

  function applyTheme(dark) {
    document.documentElement.classList.toggle("dark", dark);
    themeToggle.setAttribute("aria-pressed", dark ? "true" : "false");
  }

  /* ------------------------------------------------------------------ *
   * Element factories
   * ------------------------------------------------------------------ */

  function createCheckbox(todo) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("role", "checkbox");
    btn.setAttribute("aria-checked", todo.done ? "true" : "false");
    btn.setAttribute("aria-label", todo.text);
    btn.dataset.id = todo.id;
    btn.dataset.action = "toggle";
    btn.className =
      "flex h-6 w-6 shrink-0 items-center justify-center rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500";

    var box = document.createElement("span");
    box.setAttribute("aria-hidden", "true");
    box.textContent = "\u2713";
    box.className =
      "flex h-5 w-5 items-center justify-center rounded border text-xs font-bold leading-none " +
      (todo.done
        ? "border-indigo-600 bg-indigo-600 text-white dark:border-indigo-500 dark:bg-indigo-500"
        : "border-slate-500 bg-transparent text-transparent dark:border-slate-400");

    btn.appendChild(box);
    return btn;
  }

  function makeTrashIcon() {
    var NS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("class", "h-4 w-4");
    svg.setAttribute("aria-hidden", "true");

    var paths = [
      "M3 6h18",
      "M8 6V4h8v2",
      "M19 6l-1 14H6L5 6",
      "M10 11v6",
      "M14 11v6",
    ];
    for (var i = 0; i < paths.length; i++) {
      var p = document.createElementNS(NS, "path");
      p.setAttribute("d", paths[i]);
      svg.appendChild(p);
    }
    return svg;
  }

  function createDeleteButton(todo) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.id = todo.id;
    btn.dataset.action = "delete";
    btn.setAttribute("aria-label", 'Delete "' + todo.text + '"');
    btn.className =
      "shrink-0 rounded p-1 text-slate-600 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 dark:text-slate-300 dark:hover:text-red-400";
    btn.appendChild(makeTrashIcon());
    return btn;
  }

  function createRow(todo) {
    var li = document.createElement("li");
    li.dataset.id = todo.id;
    li.className =
      "group flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900";

    var span = document.createElement("span");
    span.className =
      "min-w-0 flex-1 break-words " +
      (todo.done
        ? "text-slate-600 line-through dark:text-slate-400"
        : "text-slate-800 dark:text-slate-100");
    span.textContent = todo.text;

    li.appendChild(createCheckbox(todo));
    li.appendChild(span);
    li.appendChild(createDeleteButton(todo));
    return li;
  }

  /* ------------------------------------------------------------------ *
   * Filtering / focus
   * ------------------------------------------------------------------ */

  function visibleTodos() {
    if (filter === "active") {
      return todos.filter(function (t) {
        return !t.done;
      });
    }
    if (filter === "done") {
      return todos.filter(function (t) {
        return t.done;
      });
    }
    return todos;
  }

  function findRow(id) {
    var rows = list.children;
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].dataset.id === id) return rows[i];
    }
    return null;
  }

  // Focus the button for `action` on the row at `index`, if that row exists.
  // Returns true when focus was moved.
  function focusButtonAt(index, action) {
    var target = list.children[index];
    if (!target) return false;
    var el =
      target.querySelector('button[data-action="' + action + '"]') ||
      target.querySelector('button[data-action="toggle"]') ||
      target.querySelector('button[data-action="delete"]');
    if (!el) return false;
    el.focus();
    return true;
  }

  function applyFocus(plan) {
    if (!plan) return;

    if (plan.type === "input") {
      input.focus();
      return;
    }

    if (plan.type === "self") {
      if (plan.el && document.contains(plan.el)) plan.el.focus();
      return;
    }

    if (plan.type === "checkbox") {
      var row = findRow(plan.id);
      var cb = row && row.querySelector('button[data-action="toggle"]');
      (cb || input).focus();
      return;
    }

    if (plan.type === "row-index") {
      if (focusButtonAt(plan.index, plan.action)) return;
      // Deletes: fall back to the row before the removed one before the input.
      if (plan.tryPrevious && focusButtonAt(plan.index - 1, plan.action)) return;
      input.focus();
      return;
    }
  }

  // Snapshot of a keyboard focus position inside the list, for re-renders that
  // happen outside a user action (e.g. the storage event).
  function captureListFocus() {
    var el = document.activeElement;
    if (!el || !list.contains(el) || !el.dataset || !el.dataset.action) {
      return null;
    }
    return { id: el.dataset.id, action: el.dataset.action };
  }

  function restoreListFocus(snapshot) {
    if (!snapshot) return;
    var row = findRow(snapshot.id);
    var el =
      row &&
      (row.querySelector('button[data-action="' + snapshot.action + '"]') ||
        row.querySelector("button[data-action]"));
    if (el) {
      el.focus();
      return;
    }
    // The focused row is gone: keep focus in the list when possible.
    if (list.children.length > 0) {
      var first = list.children[0].querySelector("button[data-action]");
      if (first) {
        first.focus();
        return;
      }
    }
    input.focus();
  }

  /* ------------------------------------------------------------------ *
   * Rendering
   * ------------------------------------------------------------------ */

  function emptyMessage() {
    if (filter === "active") return "No active todos \u2014 nice!";
    if (filter === "done") return "No completed todos yet.";
    return "No todos yet. Add one above.";
  }

  function render() {
    var visible = visibleTodos();

    // Rebuild the list.
    list.textContent = "";
    for (var i = 0; i < visible.length; i++) {
      list.appendChild(createRow(visible[i]));
    }

    // Empty state.
    if (visible.length === 0) {
      emptyState.textContent = emptyMessage();
      emptyState.classList.remove("hidden");
    } else {
      emptyState.textContent = "";
      emptyState.classList.add("hidden");
    }

    // Items left: only touch the DOM when the text changes so screen readers
    // don't re-announce the live region on unrelated renders.
    var remaining = todos.filter(function (t) {
      return !t.done;
    }).length;
    var itemsLeftText =
      remaining + " item" + (remaining === 1 ? "" : "s") + " left";
    if (itemsLeftEl.textContent !== itemsLeftText) {
      itemsLeftEl.textContent = itemsLeftText;
    }

    // Clear completed availability.
    var hasDone = todos.some(function (t) {
      return t.done;
    });
    clearBtn.disabled = !hasDone;

    // Filters: aria-pressed + active styling (no tab semantics).
    for (var f = 0; f < filterButtons.length; f++) {
      var btn = filterButtons[f];
      var active = btn.dataset.filter === filter;
      btn.setAttribute("aria-pressed", active ? "true" : "false");
      btn.className =
        "rounded-lg px-3 py-1 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 " +
        (active
          ? "bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700");
    }
  }

  function renderAndFocus() {
    render();
    if (focusPlan) {
      applyFocus(focusPlan);
      focusPlan = null;
    }
  }

  /* ------------------------------------------------------------------ *
   * Events
   * ------------------------------------------------------------------ */

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    text = capText(text);

    todos.unshift({ id: makeId(), text: text, done: false });
    input.value = "";
    save();

    focusPlan = { type: "input" };
    renderAndFocus();
  });

  list.addEventListener("click", function (e) {
    if (!e.target || typeof e.target.closest !== "function") return;
    var btn = e.target.closest("button[data-action]");
    if (!btn || !list.contains(btn)) return;

    var id = btn.dataset.id;
    var action = btn.dataset.action;
    var index = -1;
    for (var i = 0; i < todos.length; i++) {
      if (todos[i].id === id) {
        index = i;
        break;
      }
    }
    if (index === -1) return;

    if (action === "toggle") {
      // Record the row's current visible position so focus can stay on the row
      // that takes its place when the filter makes it disappear.
      var visibleNow = visibleTodos();
      var toggleVisibleIndex = -1;
      for (var tv = 0; tv < visibleNow.length; tv++) {
        if (visibleNow[tv].id === id) {
          toggleVisibleIndex = tv;
          break;
        }
      }

      todos[index].done = !todos[index].done;
      save();

      if (toggleVisibleIndex === -1) {
        focusPlan = { type: "checkbox", id: id };
      } else {
        focusPlan = {
          type: "row-index",
          index: toggleVisibleIndex,
          action: "toggle",
          tryPrevious: false,
        };
      }
      renderAndFocus();
      return;
    }

    if (action === "delete") {
      var visibleBefore = visibleTodos();
      var visibleIndex = -1;
      for (var v = 0; v < visibleBefore.length; v++) {
        if (visibleBefore[v].id === id) {
          visibleIndex = v;
          break;
        }
      }

      todos.splice(index, 1);
      save();

      focusPlan = {
        type: "row-index",
        index: visibleIndex,
        action: "delete",
        tryPrevious: true,
      };
      renderAndFocus();
    }
  });

  for (var fb = 0; fb < filterButtons.length; fb++) {
    (function (btn) {
      btn.addEventListener("click", function () {
        var value = btn.dataset.filter;
        if (FILTERS.indexOf(value) === -1) return;
        filter = value;
        focusPlan = { type: "self", el: btn };
        renderAndFocus();
      });
    })(filterButtons[fb]);
  }

  clearBtn.addEventListener("click", function () {
    todos = todos.filter(function (t) {
      return !t.done;
    });
    save();
    focusPlan = { type: "input" };
    renderAndFocus();
  });

  themeToggle.addEventListener("click", function () {
    var nextDark = !isDark();
    themeChoice = nextDark ? "dark" : "light";
    safeSet(STORAGE_THEME, themeChoice);
    applyTheme(nextDark);
  });

  window.addEventListener("storage", function (e) {
    var isItems = e.key === null || e.key === STORAGE_ITEMS;
    var isTheme = e.key === null || e.key === STORAGE_THEME;
    if (!isItems && !isTheme) return;
    // Ignore writes from other storage areas (e.g. sessionStorage).
    if (e.storageArea) {
      var local = null;
      try {
        local = window.localStorage;
      } catch (err) {
        local = null;
      }
      if (e.storageArea !== local) return;
    }

    if (isItems) {
      var focusSnapshot = captureListFocus();
      load();
      render();
      restoreListFocus(focusSnapshot);
    }
    if (isTheme) {
      themeChoice = readStoredTheme();
      applyTheme(isDark());
    }
  });

  // Follow the system preference live until the user makes an explicit choice.
  try {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var onSystemChange = function () {
      if (themeChoice === null) applyTheme(isDark());
    };
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onSystemChange);
    } else if (typeof mq.addListener === "function") {
      mq.addListener(onSystemChange);
    }
  } catch (e) {
    /* ignore */
  }

  /* ------------------------------------------------------------------ *
   * Init
   * ------------------------------------------------------------------ */

  load();
  themeChoice = readStoredTheme();
  applyTheme(isDark());
  render();
})();
