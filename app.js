(function () {
  "use strict";

  var STORAGE_KEY = "todos.v1";

  var form = document.getElementById("todo-form");
  var input = document.getElementById("todo-input");
  var list = document.getElementById("todo-list");
  var emptyState = document.getElementById("empty-state");
  var countEl = document.getElementById("count");
  var clearDoneBtn = document.getElementById("clear-done");
  var filterBtns = Array.prototype.slice.call(
    document.querySelectorAll(".filter-btn")
  );

  var todos = load();
  var filter = "all";

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (err) {
      /* storage unavailable: keep going in-memory */
    }
  }

  function visibleTodos() {
    if (filter === "active") return todos.filter(function (t) { return !t.done; });
    if (filter === "done") return todos.filter(function (t) { return t.done; });
    return todos;
  }

  function renderFilters() {
    filterBtns.forEach(function (btn) {
      var active = btn.dataset.filter === filter;
      btn.className =
        "filter-btn flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition " +
        (active
          ? "bg-white text-indigo-600 shadow-sm"
          : "text-slate-600 hover:text-slate-900");
      btn.setAttribute("aria-pressed", String(active));
    });
  }

  function render() {
    var items = visibleTodos();

    list.innerHTML = "";
    items.forEach(function (todo) {
      list.appendChild(renderItem(todo));
    });

    emptyState.classList.toggle("hidden", items.length > 0);
    emptyState.textContent = todos.length === 0
      ? "Nothing here yet. Add your first task above."
      : "No tasks match this filter.";

    var left = todos.filter(function (t) { return !t.done; }).length;
    countEl.textContent = left + (left === 1 ? " item left" : " items left");
    clearDoneBtn.classList.toggle("invisible", !todos.some(function (t) { return t.done; }));

    renderFilters();
  }

  function renderItem(todo) {
    var li = document.createElement("li");
    li.className =
      "group flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm";

    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = !!todo.done;
    checkbox.className =
      "h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-400";
    checkbox.setAttribute("aria-label", "Toggle task");
    checkbox.addEventListener("change", function () {
      todo.done = checkbox.checked;
      save();
      render();
    });

    var label = document.createElement("span");
    label.textContent = todo.text;
    label.className =
      "flex-1 break-words text-sm " +
      (todo.done ? "text-slate-400 line-through" : "text-slate-800");

    var remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "\u00d7";
    remove.setAttribute("aria-label", "Delete task");
    remove.className =
      "shrink-0 rounded-md px-2 text-lg leading-none text-slate-400 transition hover:bg-red-50 hover:text-red-600";
    remove.addEventListener("click", function () {
      todos = todos.filter(function (t) { return t.id !== todo.id; });
      save();
      render();
    });

    li.appendChild(checkbox);
    li.appendChild(label);
    li.appendChild(remove);
    return li;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    todos.push({ id: String(Date.now()) + Math.random().toString(16).slice(2), text: text, done: false });
    input.value = "";
    save();
    render();
  });

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filter = btn.dataset.filter;
      render();
    });
  });

  clearDoneBtn.addEventListener("click", function () {
    todos = todos.filter(function (t) { return !t.done; });
    save();
    render();
  });

  render();
})();
