/* Todos! — playful vanilla JS
 * Features: add (with inline validation), toggle, delete, filters
 * (all/active/done), items-left counter, clear-done, localStorage persistence
 * + cross-tab sync, plus confetti / emoji reactions. No dependencies.
 */
(() => {
  "use strict";

  const STORAGE_KEY = "todos.v1";
  const FILTERS = ["all", "active", "done"];
  const DONE_EMOJI = ["🎉", "🥳", "⭐", "🍬", "🌈", "✨", "🦄", "💖"];

  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-input");
  const formError = document.getElementById("form-error");
  const list = document.getElementById("todo-list");
  const emptyState = document.getElementById("empty-state");
  const itemsLeft = document.getElementById("items-left");
  const filters = document.getElementById("filters");
  const clearDone = document.getElementById("clear-done");
  const template = document.getElementById("todo-item-template");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /** @type {{id:string,text:string,done:boolean}[]} */
  let todos = load();
  let filter = "all";

  // ---- persistence -------------------------------------------------------
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
          done: Boolean(t.done),
        }));
    } catch {
      return [];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {
      /* storage may be unavailable (private mode) — app still works in memory */
    }
  }

  // ---- fun bits ----------------------------------------------------------
  const CONFETTI_COLORS = [
    "#ff4fa3",
    "#8b5cf6",
    "#ffe066",
    "#3ddc97",
    "#4cc9f0",
    "#ff8c42",
  ];

  /** Burst a few confetti pieces from a point on screen. */
  function burst(x, y, count = 16) {
    if (reduceMotion.matches) return;
    const screenW = window.innerWidth;

    for (let i = 0; i < count; i += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti" + (i % 2 ? " confetti--round" : "");
      piece.style.left = `${x}px`;
      piece.style.top = `${y}px`;
      piece.style.background =
        CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      piece.style.setProperty("--dx", `${(Math.random() - 0.5) * 220}px`);
      piece.style.setProperty("--dy", `${-60 - Math.random() * 160}px`);
      piece.style.setProperty("--rot", `${(Math.random() - 0.5) * 900}deg`);
      piece.style.animationDelay = `${Math.random() * 80}ms`;
      // Keep pieces away from the very edges so they stay visible.
      piece.style.left = `${Math.min(Math.max(x, 8), screenW - 8)}px`;
      document.body.appendChild(piece);
      piece.addEventListener("animationend", () => piece.remove(), {
        once: true,
      });
    }
  }

  /** Confetti burst centred on an element (the clicked checkbox). */
  function burstFromElement(el) {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  function celebrateAll() {
    if (reduceMotion.matches) return;
    // Firework-style bursts across the middle of the viewport.
    const y = window.innerHeight * 0.35;
    [0.25, 0.5, 0.75].forEach((frac, i) =>
      setTimeout(() => burst(window.innerWidth * frac, y, 22), i * 140)
    );
  }

  // ---- actions -----------------------------------------------------------
  function addTodo(text) {
    todos.push({ id: crypto.randomUUID(), text, done: false });
    save();
    render();
  }

  function toggleTodo(id, sourceEl) {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    todo.done = !todo.done;
    save();
    render();

    if (todo.done) {
      burstFromElement(sourceEl);
      if (todos.length > 0 && todos.every((t) => t.done)) celebrateAll();
    }
  }

  function deleteTodo(id) {
    todos = todos.filter((t) => t.id !== id);
    save();
    render();
  }

  function clearCompleted() {
    todos = todos.filter((t) => !t.done);
    save();
    render();
  }

  function setFilter(next) {
    if (!FILTERS.includes(next)) return;
    filter = next;
    render();
  }

  // ---- rendering ---------------------------------------------------------
  function visibleTodos() {
    if (filter === "active") return todos.filter((t) => !t.done);
    if (filter === "done") return todos.filter((t) => t.done);
    return todos;
  }

  function render() {
    const shown = visibleTodos();

    list.replaceChildren(
      ...shown.map((todo) => {
        const node = template.content.firstElementChild.cloneNode(true);
        const label = node.querySelector(".todo-label");
        const toggle = node.querySelector(".todo-toggle");
        const del = node.querySelector(".todo-delete");
        const emoji = node.querySelector(".todo-emoji");

        node.dataset.id = todo.id;
        node.dataset.done = String(todo.done);
        label.textContent = todo.text;

        if (todo.done) {
          emoji.textContent =
            DONE_EMOJI[Math.abs(hashCode(todo.id)) % DONE_EMOJI.length];
        }

        toggle.setAttribute("aria-pressed", String(todo.done));
        toggle.setAttribute(
          "aria-label",
          todo.done
            ? `Mark "${todo.text}" as active`
            : `Mark "${todo.text}" as done`
        );

        del.setAttribute("aria-label", `Delete "${todo.text}"`);

        toggle.addEventListener("click", () => toggleTodo(todo.id, toggle));
        del.addEventListener("click", () => deleteTodo(todo.id));
        return node;
      })
    );

    emptyState.hidden = shown.length > 0;
    emptyState.textContent =
      todos.length === 0
        ? "Nothing here yet. Add your first todo above. 🎈"
        : filter === "active"
          ? "No active todos. Go treat yourself! 🍦"
          : "No done todos yet. You got this! 💪";

    const remaining = todos.filter((t) => !t.done).length;
    itemsLeft.textContent = `${remaining} item${remaining === 1 ? "" : "s"} left`;

    clearDone.disabled = remaining === todos.length;

    for (const btn of filters.querySelectorAll("button[data-filter]")) {
      const active = btn.dataset.filter === filter;
      btn.setAttribute("aria-pressed", String(active));
    }
  }

  /** Tiny deterministic string hash so each todo keeps a stable emoji. */
  function hashCode(str) {
    let h = 0;
    for (let i = 0; i < str.length; i += 1) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return h;
  }

  // ---- events ------------------------------------------------------------
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) {
      showError("Please type something first. 🙈");
      return;
    }
    hideError();
    addTodo(text);
    input.value = "";
    input.focus();
  });

  input.addEventListener("input", () => {
    if (input.classList.contains("is-invalid")) hideError();
  });

  function showError(message) {
    formError.textContent = message;
    formError.hidden = false;
    // Restart the wiggle even if the class is already applied.
    input.classList.remove("is-invalid");
    void input.offsetWidth;
    input.classList.add("is-invalid");
    input.setAttribute("aria-invalid", "true");
    input.focus();
  }

  function hideError() {
    formError.hidden = true;
    formError.textContent = "";
    input.classList.remove("is-invalid");
    input.removeAttribute("aria-invalid");
  }

  filters.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-filter]");
    if (btn) setFilter(btn.dataset.filter);
  });

  clearDone.addEventListener("click", clearCompleted);

  // Keep multiple open tabs in sync.
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    todos = load();
    render();
  });

  render();
})();
