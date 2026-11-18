/**
 * jsdom smoke test for todo-tailwind/app.js.
 * Run with: node tests/smoke.test.mjs  (or `npm test`)
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { JSDOM } from "jsdom";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const html = readFileSync(path.join(root, "index.html"), "utf8");
const appSrc = readFileSync(path.join(root, "app.js"), "utf8");

const ITEMS_KEY = "todo-tailwind.items.v1";
const FILTER_KEY = "todo-tailwind.filter.v1";

let passed = 0;
let failed = 0;
function check(name, cond) {
  if (cond) {
    passed++;
    console.log("  ok   " + name);
  } else {
    failed++;
    console.log("  FAIL " + name);
  }
}

/** Boot a fresh DOM+app, optionally seeding localStorage first. */
function boot(seed) {
  const dom = new JSDOM(html, {
    url: "http://localhost/",
    runScripts: "outside-only",
    pretendToBeVisual: true
  });
  const { window } = dom;
  if (seed) {
    for (const [k, v] of Object.entries(seed)) window.localStorage.setItem(k, v);
  }
  window.eval(appSrc);
  return { dom, window, document: window.document };
}

function submit(window) {
  const form = window.document.getElementById("composer");
  form.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
}

function todos(window) {
  return Array.from(window.document.querySelectorAll("#todo-list li"));
}
function texts(window) {
  return todos(window).map((li) => li.querySelector("p").textContent);
}
function filterBtn(window, name) {
  return window.document.querySelector(`.filter-btn[data-filter="${name}"]`);
}
function toggleFirst(window) {
  const box = window.document.querySelector("#todo-list input[type=checkbox]");
  box.checked = !box.checked;
  box.dispatchEvent(new window.Event("change", { bubbles: true }));
  return box;
}

/* ------------------------------------------------------------------ */
console.log("add");
{
  const { window, document } = boot();
  const input = document.getElementById("new-todo");
  input.value = "Buy milk";
  submit(window);
  input.value = "Walk dog";
  submit(window);
  check("two items rendered", todos(window).length === 2);
  check("text rendered via textContent", texts(window).join("|") === "Buy milk|Walk dog");
  input.value = "   ";
  submit(window);
  check("blank input ignored", todos(window).length === 2);
  check("items-left says 2", document.getElementById("items-left").textContent === "2 items left");
  check("input cleared", input.value === "");
}

/* ------------------------------------------------------------------ */
console.log("toggle");
{
  const { window, document } = boot();
  const input = document.getElementById("new-todo");
  input.value = "A";
  submit(window);
  const box = document.querySelector("#todo-list input[type=checkbox]");
  box.focus();
  box.checked = true;
  box.dispatchEvent(new window.Event("change", { bubbles: true }));
  check("stored done state true", JSON.parse(window.localStorage.getItem(ITEMS_KEY))[0].done === true);
  check("items-left says 0", document.getElementById("items-left").textContent === "0 items left");
  const box2 = document.querySelector("#todo-list input[type=checkbox]");
  check("checkbox keeps focus after re-render", document.activeElement === box2);
  check("aria-labelledby points at unique text id",
    box2.getAttribute("aria-labelledby") === box2.closest("li").querySelector("p").id);
}

/* ------------------------------------------------------------------ */
console.log("delete + focus");
{
  const { window } = boot();
  const input = window.document.getElementById("new-todo");
  ["A", "B", "C"].forEach((t) => { input.value = t; submit(window); });
  // Delete middle item "B": focus should land on next item's checkbox ("C").
  todos(window)[1].querySelector("button").click();
  check("middle deleted", texts(window).join("|") === "A|C");
  const boxes = window.document.querySelectorAll("#todo-list input[type=checkbox]");
  check("focus moved to next checkbox", window.document.activeElement === boxes[1]);

  // Delete the last remaining item repeatedly.
  todos(window)[1].querySelector("button").click();
  check("last deleted", texts(window).join("|") === "A");
  check("focus moved to previous checkbox", window.document.activeElement === window.document.querySelector("#todo-list input[type=checkbox]"));

  todos(window)[0].querySelector("button").click();
  check("list empty", todos(window).length === 0);
  check("focus returns to composer input", window.document.activeElement === input);
  check("empty state shown", window.document.getElementById("empty-state").hidden === false);
}

/* ------------------------------------------------------------------ */
console.log("filter");
{
  const { window, document } = boot();
  const seed = [
    { id: "a", text: "one", done: false },
    { id: "b", text: "two", done: true }
  ];
  // Boot a second instance with the seed to simulate a reload.
  const w2 = boot({ [ITEMS_KEY]: JSON.stringify(seed) }).window;
  const d2 = w2.document;
  check("all shows both", texts(w2).length === 2);
  filterBtn(w2, "active").click();
  check("active shows 1", texts(w2).join("|") === "one");
  check("active aria-pressed true", filterBtn(w2, "active").getAttribute("aria-pressed") === "true");
  check("all aria-pressed false", filterBtn(w2, "all").getAttribute("aria-pressed") === "false");
  filterBtn(w2, "done").click();
  check("done shows 1", texts(w2).join("|") === "two");
  filterBtn(w2, "all").click();
  check("all shows both again", texts(w2).length === 2);
}

/* ------------------------------------------------------------------ */
console.log("persistence");
{
  const first = boot();
  const input = first.window.document.getElementById("new-todo");
  input.value = "Persist me";
  submit(first.window);
  check("singular items-left", first.window.document.getElementById("items-left").textContent === "1 item left");
  filterBtn(first.window, "active").click();
  const items = first.window.localStorage.getItem(ITEMS_KEY);
  const filt = first.window.localStorage.getItem(FILTER_KEY);

  const second = boot({ [ITEMS_KEY]: items, [FILTER_KEY]: filt });
  check("todo restored after reload", texts(second.window).join("|") === "Persist me");
  check("filter restored after reload",
    filterBtn(second.window, "active").getAttribute("aria-pressed") === "true");
}

/* ------------------------------------------------------------------ */
console.log("storage events");
{
  const { window } = boot();
  // Simulate another tab writing new data.
  const newItems = [{ id: "x", text: "from other tab", done: false }];
  window.localStorage.setItem(ITEMS_KEY, JSON.stringify(newItems));
  window.dispatchEvent(new window.StorageEvent("storage", { key: ITEMS_KEY }));
  check("syncs on items key change", texts(window).join("|") === "from other tab");

  // localStorage.clear() in another tab fires key === null.
  window.localStorage.clear();
  window.dispatchEvent(new window.StorageEvent("storage", { key: null }));
  check("syncs on localStorage.clear() (key null)", todos(window).length === 0);
  check("count reset to 0", window.document.getElementById("items-left").textContent === "0 items left");
}

/* ------------------------------------------------------------------ */
console.log("duplicate / bad ids on load");
{
  const seed = [
    { id: "dup", text: "first", done: false },
    { id: "dup", text: "second", done: false },
    { id: "dup", text: "third", done: false }
  ];
  const { window, document } = boot({ [ITEMS_KEY]: JSON.stringify(seed) });
  const idEls = Array.from(document.querySelectorAll("#todo-list p"));
  const ids = idEls.map((el) => el.id);
  check("all three rendered", idEls.length === 3);
  check("ids are unique", new Set(ids).size === 3);
  const labels = Array.from(document.querySelectorAll("#todo-list .visually-hidden")).map((el) => el.id);
  check("delete label ids unique", new Set(labels).size === 3);
  idEls.forEach((el) => {
    const li = el.closest("li");
    const labelledBy = li.querySelector("input").getAttribute("aria-labelledby");
    check("checkbox labelled by its own text (" + el.textContent + ")", labelledBy === el.id);
  });
  const js = ids.join(" ");
  check("no [object Object] / innerHTML artefacts", !js.includes("[object"));
}

/* ------------------------------------------------------------------ */
console.log("toggle under filtered views (focus stays put)");
{
  const seed = [
    { id: "one", text: "one", done: false },
    { id: "two", text: "two", done: false },
    { id: "three", text: "three", done: true }
  ];

  // Completing an item while the Active filter is on removes it from view.
  const active = boot({ [ITEMS_KEY]: JSON.stringify(seed), [FILTER_KEY]: "active" });
  const wA = active.window;
  filterBtn(wA, "active").click();
  check("active shows two", texts(wA).join("|") === "one|two");
  const boxA = wA.document.querySelector("#todo-list input[type=checkbox]");
  boxA.focus();
  toggleFirst(wA);
  check("active view now one item", texts(wA).join("|") === "two");
  check("focus not dropped to body (active)", wA.document.activeElement !== wA.document.body);
  const boxesA = wA.document.querySelectorAll("#todo-list input[type=checkbox]");
  check("focus moved to checkbox at same visible slot (active)",
    wA.document.activeElement === boxesA[0]);

  // Un-completing the only done item while the Done filter is on leaves the view.
  const done = boot({ [ITEMS_KEY]: JSON.stringify(seed), [FILTER_KEY]: "done" });
  const wD = done.window;
  filterBtn(wD, "done").click();
  check("done shows one", texts(wD).join("|") === "three");
  const boxD = wD.document.querySelector("#todo-list input[type=checkbox]");
  boxD.focus();
  toggleFirst(wD);
  check("done view empty", todos(wD).length === 0);
  check("focus not dropped to body (done)", wD.document.activeElement !== wD.document.body);
  check("focus fell back to composer when view empties",
    wD.document.activeElement === wD.document.getElementById("new-todo"));
}

/* ------------------------------------------------------------------ */
console.log("ids containing a single quote");
{
  const seed = [{ id: "it's", text: "quoted", done: false }];
  const { window } = boot({ [ITEMS_KEY]: JSON.stringify(seed) });
  check("item with quote id rendered", texts(window).join("|") === "quoted");
  const box = window.document.querySelector("#todo-list input[type=checkbox]");
  box.focus();
  toggleFirst(window);
  check("toggle with quote id keeps focus off body",
    window.document.activeElement !== window.document.body);
  check("toggle with quote id keeps focus on checkbox",
    window.document.activeElement ===
      window.document.querySelector("#todo-list input[type=checkbox]"));
}

/* ------------------------------------------------------------------ */
console.log("clear done focus");
{
  const seed = [
    { id: "a", text: "a", done: true },
    { id: "b", text: "b", done: false }
  ];
  const { window, document } = boot({ [ITEMS_KEY]: JSON.stringify(seed) });
  const clear = document.getElementById("clear-done");
  check("clear button enabled with done items", clear.disabled === false);
  clear.focus();
  clear.click();
  check("done items cleared", texts(window).join("|") === "b");
  check("clear button now disabled", clear.disabled === true);
  check("focus moved off disabled clear button",
    document.activeElement !== clear);
  check("focus moved to composer input", document.activeElement === document.getElementById("new-todo"));
}

/* ------------------------------------------------------------------ */
console.log("\n" + passed + " passed, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
