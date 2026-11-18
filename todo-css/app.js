/* Todo app — plain JS, no frameworks, no build step. */
(function () {
  "use strict";

  var STORAGE_KEY = "todo-css.items.v1";
  var FILTER_KEY = "todo-css.filter.v1";
  var FILTERS = ["all", "active", "done"];

  /** @type {{id: string, text: string, done: boolean}[]} */
  var todos = [];
  var filter = "all";

  var listEl = document.getElementById("todo-list");
  var formEl = document.getElementById("composer");
  var inputEl = document.getElementById("new-todo");
  var emptyEl = document.getElementById("empty-state");
  var countEl = document.getElementById("items-left");
  var clearBtn = document.getElementById("clear-done");
  var filterBtns = Array.prototype.slice.call(document.querySelectorAll(".filter"));

  /* ---------------------------------------------------------------
     Persistence
  ---------------------------------------------------------------- */
  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        var seen = Object.create(null);
        todos = parsed
          .filter(function (t) {
            return t && typeof t.text === "string";
          })
          .map(function (t) {
            return {
              id: claimId(seen, t.id),
              text: t.text,
              done: Boolean(t.done)
            };
          });
      }
    } catch (err) {
      todos = [];
    }

    try {
      var savedFilter = localStorage.getItem(FILTER_KEY);
      if (FILTERS.indexOf(savedFilter) !== -1) {
        filter = savedFilter;
      }
    } catch (err) {
      filter = "all";
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
      localStorage.setItem(FILTER_KEY, filter);
    } catch (err) {
      /* Storage may be unavailable (private mode / quota). Ignore. */
    }
  }

  /* ---------------------------------------------------------------
     Helpers
  ---------------------------------------------------------------- */
  function uid() {
    return "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /**
   * Return a unique id, falling back to a fresh one when the stored id is
   * missing, non-string or already used by an earlier item.
   * @param {Object} seen set of ids already handed out
   * @param {*} candidate id read from storage
   */
  function claimId(seen, candidate) {
    var id = typeof candidate === "string" && candidate ? candidate : uid();
    while (seen[id]) {
      id = uid();
    }
    seen[id] = true;
    return id;
  }

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

  /** Position of a todo within the currently visible list, or -1. */
  function visibleIndex(id) {
    var visible = visibleTodos();
    for (var i = 0; i < visible.length; i++) {
      if (visible[i].id === id) return i;
    }
    return -1;
  }

  /** Turn an arbitrary todo id into a valid, unique-ish element id fragment. */
  function idFragment(id, index) {
    return (
      "todo-text-" +
      index +
      "-" +
      String(id).replace(/[^A-Za-z0-9_-]/g, "_")
    );
  }

  /* ---------------------------------------------------------------
     Actions
  ---------------------------------------------------------------- */
  function addTodo(text) {
    var trimmed = text.trim();
    if (!trimmed) return;
    todos.push({ id: uid(), text: trimmed, done: false });
    save();
    render();
  }

  function toggleTodo(id) {
    for (var i = 0; i < todos.length; i++) {
      if (todos[i].id === id) {
        todos[i].done = !todos[i].done;
        break;
      }
    }
    save();
    render({ keepFocus: { id: id, role: "todo__toggle" } });
  }

  function deleteTodo(id) {
    var index = visibleIndex(id);
    todos = todos.filter(function (t) {
      return t.id !== id;
    });
    save();
    render({ focusIndex: index });
  }

  function clearDone() {
    todos = todos.filter(function (t) {
      return !t.done;
    });
    save();
    render();
  }

  function setFilter(next) {
    if (FILTERS.indexOf(next) === -1) return;
    filter = next;
    save();
    render();
  }

  /* ---------------------------------------------------------------
     Rendering
  ---------------------------------------------------------------- */
  function buildItem(todo, index) {
    var li = document.createElement("li");
    li.className = "todo" + (todo.done ? " is-done" : "");
    li.dataset.id = todo.id;

    var textId = idFragment(todo.id, index);
    var deleteLabelId = textId + "-delete";

    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo__toggle";
    checkbox.checked = todo.done;
    checkbox.dataset.todoId = todo.id;
    checkbox.setAttribute("aria-labelledby", textId);
    checkbox.addEventListener("change", function () {
      toggleTodo(todo.id);
    });

    var text = document.createElement("p");
    text.className = "todo__text";
    text.id = textId;
    text.textContent = todo.text;

    var remove = document.createElement("button");
    remove.type = "button";
    remove.className = "todo__delete";
    remove.textContent = "\u00d7";
    remove.dataset.todoId = todo.id;
    remove.setAttribute("aria-labelledby", deleteLabelId);
    remove.addEventListener("click", function () {
      deleteTodo(todo.id);
    });

    // Hidden label giving the delete button a unique, action-specific name.
    var deleteLabel = document.createElement("span");
    deleteLabel.className = "visually-hidden";
    deleteLabel.id = deleteLabelId;
    deleteLabel.textContent = "Delete todo: " + todo.text;

    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(remove);
    li.appendChild(deleteLabel);
    return li;
  }

  /**
   * Rebuild the visible list.
   * @param {{keepFocus?: {id: string, role: string, index: number},
   *          focusIndex?: number}} [options]
   *   keepFocus restores focus to the equivalent element by todo id + role
   *   (used after toggling, so the element stays put). focusIndex focuses the
   *   element at the same visible position (used after deleting, so focus
   *   lands on the next item, or the previous one at the end of the list).
   */
  function render(options) {
    options = options || {};
    var visible = visibleTodos();

    listEl.textContent = "";
    var frag = document.createDocumentFragment();
    visible.forEach(function (todo, index) {
      frag.appendChild(buildItem(todo, index));
    });
    listEl.appendChild(frag);

    var hasTodos = todos.length > 0;
    listEl.hidden = !hasTodos || visible.length === 0;
    if (!hasTodos) {
      emptyEl.hidden = false;
      emptyEl.textContent = "Nothing here yet. Add your first todo above.";
    } else if (visible.length === 0) {
      emptyEl.hidden = false;
      emptyEl.textContent =
        filter === "active" ? "No active todos. Nice work!" : "No done todos yet.";
    } else {
      emptyEl.hidden = true;
    }

    var remaining = todos.filter(function (t) {
      return !t.done;
    }).length;
    countEl.textContent = remaining + (remaining === 1 ? " item left" : " items left");

    var doneCount = todos.length - remaining;
    clearBtn.disabled = doneCount === 0;

    filterBtns.forEach(function (btn) {
      var active = btn.dataset.filter === filter;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    restoreFocus(options);
  }

  /** Move focus back to a predictable element after a re-render. */
  function restoreFocus(options) {
    if (options.keepFocus) {
      var keep = findItem(keepFocusSelector(options.keepFocus));
      if (keep) {
        keep.focus();
        return;
      }
    }
    if (typeof options.focusIndex === "number" && options.focusIndex >= 0) {
      focusItemAt(options.focusIndex);
      return;
    }
  }

  /** Build a CSS selector for a todo id + element role. */
  function keepFocusSelector(keep) {
    return ".todo[data-id='" + cssEscape(keep.id) + "'] ." + keep.role;
  }

  /** Minimal escaping for ids inserted into a CSS attribute selector. */
  function cssEscape(value) {
    return String(value).replace(/["\\]/g, "\\$&");
  }

  function findItem(selector) {
    try {
      return listEl.querySelector(selector);
    } catch (err) {
      return null;
    }
  }

  /**
   * Focus the checkbox at (or nearest before) the given visible index. If the
   * deleted row was last, fall back to the previous row; if nothing remains,
   * focus returns to the composer input so keyboard users are not dropped.
   */
  function focusItemAt(index) {
    var checkboxes = listEl.querySelectorAll(".todo__toggle");
    if (checkboxes.length === 0) {
      inputEl.focus();
      return;
    }
    var target = checkboxes[Math.min(index, checkboxes.length - 1)];
    if (target) target.focus();
  }

  /* ---------------------------------------------------------------
     Events + init
  ---------------------------------------------------------------- */
  formEl.addEventListener("submit", function (event) {
    event.preventDefault();
    addTodo(inputEl.value);
    inputEl.value = "";
    inputEl.focus();
  });

  clearBtn.addEventListener("click", clearDone);

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setFilter(btn.dataset.filter);
    });
  });

  // Keep multiple tabs in sync.
  window.addEventListener("storage", function (event) {
    // event.key is null when another tab called localStorage.clear().
    if (event.key === null || event.key === STORAGE_KEY || event.key === FILTER_KEY) {
      load();
      render();
    }
  });

  load();
  render();
})();
