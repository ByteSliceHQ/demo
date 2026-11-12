/* Todo app — plain JavaScript, no dependencies. */
(function () {
  "use strict";

  var STORAGE_KEY = "todos.v1";

  var form = document.getElementById("new-todo-form");
  var input = document.getElementById("new-todo-input");
  var list = document.getElementById("todo-list");
  var emptyState = document.getElementById("empty-state");
  var countEl = document.getElementById("count");
  var clearDoneBtn = document.getElementById("clear-done");
  var filterButtons = Array.prototype.slice.call(
    document.querySelectorAll(".filter")
  );

  var todos = load();
  var filter = "all";

  /* ---------- persistence ---------- */

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter(function (t) {
          return t && typeof t.title === "string";
        })
        .map(function (t) {
          return {
            id: String(t.id || makeId()),
            title: t.title,
            done: Boolean(t.done),
          };
        });
    } catch (err) {
      console.warn("Could not read todos from localStorage:", err);
      return [];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (err) {
      console.warn("Could not write todos to localStorage:", err);
    }
  }

  function makeId() {
    return (
      Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
    );
  }

  /* ---------- actions ---------- */

  function addTodo(title) {
    var trimmed = title.trim();
    if (!trimmed) return;
    todos.push({ id: makeId(), title: trimmed, done: false });
    save();
    render();
  }

  function toggleTodo(id) {
    todos = todos.map(function (t) {
      return t.id === id ? { id: t.id, title: t.title, done: !t.done } : t;
    });
    save();
    render();
  }

  function deleteTodo(id) {
    todos = todos.filter(function (t) {
      return t.id !== id;
    });
    save();
    render();
  }

  function clearDone() {
    todos = todos.filter(function (t) {
      return !t.done;
    });
    save();
    render();
  }

  /* ---------- view ---------- */

  function setFilter(next) {
    filter = next;
    filterButtons.forEach(function (btn) {
      btn.classList.toggle("is-active", btn.dataset.filter === filter);
    });
    render();
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

  function render() {
    var visible = visibleTodos();
    list.textContent = "";

    visible.forEach(function (todo) {
      list.appendChild(renderItem(todo));
    });

    emptyState.hidden = visible.length !== 0;
    emptyState.textContent =
      todos.length === 0
        ? "Nothing here yet. Add your first todo above."
        : "No todos match this filter.";

    var remaining = todos.filter(function (t) {
      return !t.done;
    }).length;
    countEl.textContent =
      remaining + " active · " + todos.length + " total";

    var anyDone = todos.some(function (t) {
      return t.done;
    });
    clearDoneBtn.hidden = !anyDone;
  }

  function renderItem(todo) {
    var li = document.createElement("li");
    li.className = "todo" + (todo.done ? " is-done" : "");
    li.dataset.id = todo.id;

    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo__toggle";
    checkbox.checked = todo.done;
    checkbox.setAttribute("aria-label", "Mark todo as done");
    checkbox.addEventListener("change", function () {
      toggleTodo(todo.id);
    });

    var title = document.createElement("span");
    title.className = "todo__title";
    title.textContent = todo.title;
    title.addEventListener("click", function () {
      toggleTodo(todo.id);
    });

    var del = document.createElement("button");
    del.type = "button";
    del.className = "todo__delete";
    del.textContent = "\u00d7";
    del.setAttribute("aria-label", "Delete todo");
    del.addEventListener("click", function () {
      deleteTodo(todo.id);
    });

    li.appendChild(checkbox);
    li.appendChild(title);
    li.appendChild(del);
    return li;
  }

  /* ---------- events ---------- */

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    addTodo(input.value);
    input.value = "";
    input.focus();
  });

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setFilter(btn.dataset.filter);
    });
  });

  clearDoneBtn.addEventListener("click", clearDone);

  /* ---------- init ---------- */

  setFilter("all");
})();
