import "./style.css";

const STORAGE_KEY = "todo-app.items.v1";

/** @typedef {{ id: string, text: string, completed: boolean }} Todo */

/** @type {Todo[]} */
let todos = load();

/** @type {"all" | "active" | "completed"} */
let filter = "all";

const app = document.querySelector("#app");

/* -------------------------------------------------------------------------- */
/* Storage                                                                    */
/* -------------------------------------------------------------------------- */

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((t) => t && typeof t.text === "string")
      .map((t) => ({
        id: String(t.id ?? crypto.randomUUID()),
        text: t.text,
        completed: Boolean(t.completed),
      }));
  } catch {
    return [];
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    /* storage unavailable (private mode, quota) — ignore */
  }
}

/* -------------------------------------------------------------------------- */
/* Actions                                                                    */
/* -------------------------------------------------------------------------- */

function addTodo(text) {
  const value = text.trim();
  if (!value) return;
  todos.unshift({ id: crypto.randomUUID(), text: value, completed: false });
  save();
  render();
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;
  todo.completed = !todo.completed;
  save();
  render();
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  save();
  render();
}

function clearCompleted() {
  todos = todos.filter((t) => !t.completed);
  save();
  render();
}

function setFilter(next) {
  filter = next;
  render();
}

/* -------------------------------------------------------------------------- */
/* Rendering                                                                  */
/* -------------------------------------------------------------------------- */

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const FILTERS = ["all", "active", "completed"];

function visibleTodos() {
  if (filter === "active") return todos.filter((t) => !t.completed);
  if (filter === "completed") return todos.filter((t) => t.completed);
  return todos;
}

function todoItemHtml(todo) {
  return `
    <li
      class="group flex items-center gap-3 border-b border-borderc px-4 py-3.5 last:border-b-0 hover:bg-[#fafbff]"
      data-id="${todo.id}"
    >
      <button
        type="button"
        class="grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 p-0 transition ${
          todo.completed
            ? "border-accent bg-accent text-white"
            : "border-[#cbd0db] bg-transparent text-transparent hover:border-accent"
        }"
        data-action="toggle"
        role="checkbox"
        aria-checked="${todo.completed}"
        aria-label="${todo.completed ? "Mark as active" : "Mark as completed"}"
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M4 10.5l4 4 8-8" stroke="currentColor" stroke-width="2.5"
            stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <span class="min-w-0 flex-1 text-base leading-snug [overflow-wrap:anywhere] ${
        todo.completed ? "text-faint line-through" : ""
      }">${escapeHtml(todo.text)}</span>

      <button
        type="button"
        class="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-transparent p-0 text-faint opacity-0 transition hover:bg-[#fff1f4] hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
        data-action="delete"
        aria-label="Delete todo"
      >
        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M4 6h12M8 6V4h4v2m-6 0l1 10h6l1-10" stroke="currentColor"
            stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </li>`;
}

function filterButtonHtml(label, value) {
  const active = filter === value;
  return `
    <button
      type="button"
      class="rounded-[9px] px-3 py-1.5 text-xs font-medium capitalize transition ${
        active
          ? "bg-white text-accent shadow-[0_1px_3px_rgba(31,36,48,0.12)]"
          : "bg-transparent text-muted hover:text-textc"
      }"
      data-filter="${value}"
      aria-pressed="${active}"
    >
      ${label}
    </button>`;
}

function render() {
  const items = visibleTodos();
  const remaining = todos.filter((t) => !t.completed).length;
  const completed = todos.length - remaining;

  app.innerHTML = `
    <div class="flex min-h-full justify-center px-4 pb-16 pt-10">
      <div class="w-full max-w-[560px]">
        <header class="mb-7 text-center">
          <h1 class="m-0 text-[clamp(1.75rem,6vw,2.5rem)] font-bold tracking-[-0.02em]">
            Todo<span class="text-accent">.</span>
          </h1>
          <p class="mb-0 mt-2 text-sm text-muted">Stay focused and get things done.</p>
        </header>

        <section class="overflow-hidden rounded-card border border-borderc bg-surface shadow-card">
          <form id="todo-form" class="flex gap-2.5 border-b border-borderc p-3.5">
            <label class="sr-only" for="todo-input">New todo</label>
            <input
              id="todo-input"
              class="min-w-0 flex-1 rounded-xl border border-transparent bg-[#f4f5fa] px-4 py-3 text-base text-textc outline-none transition placeholder:text-faint focus:border-accent focus:bg-white focus:shadow-[0_0_0_3px_#eef0ff]"
              type="text"
              autocomplete="off"
              maxlength="200"
              placeholder="What needs to be done?"
            />
            <button
              type="submit"
              class="shrink-0 rounded-xl bg-accent px-5 py-3 text-base font-semibold text-white transition hover:bg-accent-hover active:scale-[0.98]"
            >
              Add
            </button>
          </form>

          ${
            items.length
              ? `<ul class="m-0 list-none p-0">${items.map(todoItemHtml).join("")}</ul>`
              : `<p class="m-0 px-4 py-12 text-center text-sm text-faint">${
                  todos.length === 0
                    ? "No todos yet. Add one above to get started."
                    : "Nothing here in this filter."
                }</p>`
          }

          <footer class="flex flex-wrap items-center justify-between gap-3 border-t border-borderc bg-[#fafbff] px-3.5 py-3 max-[420px]:justify-center">
            <span class="text-[0.85rem] text-muted max-[420px]:order-2">
              <strong class="text-textc">${remaining}</strong> ${remaining === 1 ? "item" : "items"} left
            </span>

            <div class="flex gap-1 rounded-xl bg-[#eef0f6] p-1 max-[420px]:order-1 max-[420px]:w-full max-[420px]:justify-center" role="group" aria-label="Filter todos">
              ${FILTERS.map((f) => filterButtonHtml(f, f)).join("")}
            </div>

            <button
              type="button"
              class="text-[0.85rem] text-muted transition enabled:hover:text-danger disabled:cursor-not-allowed disabled:opacity-40 max-[420px]:order-3"
              data-action="clear-completed"
              ${completed === 0 ? "disabled" : ""}
            >
              Clear completed
            </button>
          </footer>
        </section>

        <p class="mb-0 mt-6 text-center text-xs text-faint">
          Your todos are saved locally in your browser.
        </p>
      </div>
    </div>`;
}

/* -------------------------------------------------------------------------- */
/* Events (delegated)                                                         */
/* -------------------------------------------------------------------------- */

app.addEventListener("submit", (event) => {
  const form = event.target.closest("#todo-form");
  if (!form) return;
  event.preventDefault();
  const input = form.querySelector("#todo-input");
  addTodo(input.value);
  input.value = "";
  input.focus();
});

app.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.filter) {
    setFilter(button.dataset.filter);
    return;
  }

  if (button.dataset.action === "clear-completed") {
    clearCompleted();
    return;
  }

  const li = button.closest("li[data-id]");
  if (!li) return;

  if (button.dataset.action === "toggle") toggleTodo(li.dataset.id);
  if (button.dataset.action === "delete") deleteTodo(li.dataset.id);
});

render();
