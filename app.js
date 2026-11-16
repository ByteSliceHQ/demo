const KEY = 'grocery-items';
let items = [];
try { items = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { items = []; }

const list = document.getElementById('list');
const summary = document.getElementById('summary');
const form = document.getElementById('add-form');
const nameEl = document.getElementById('name');
const qtyEl = document.getElementById('qty');

function save() { localStorage.setItem(KEY, JSON.stringify(items)); }

function render() {
  list.innerHTML = '';
  for (const it of items) {
    const li = document.createElement('li');
    if (it.done) li.className = 'done';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = it.done;
    cb.onchange = () => { it.done = cb.checked; save(); render(); };
    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = `${it.name} × ${it.qty}`;
    const del = document.createElement('button');
    del.className = 'del';
    del.textContent = '✕';
    del.setAttribute('aria-label', 'Delete ' + it.name);
    del.onclick = () => { items = items.filter(i => i.id !== it.id); save(); render(); };
    li.append(cb, label, del);
    list.append(li);
  }
  const done = items.filter(i => i.done).length;
  summary.textContent = `${items.length} item${items.length === 1 ? '' : 's'}, ${done} completed`;
}

form.onsubmit = e => {
  e.preventDefault();
  const name = nameEl.value.trim();
  if (!name) return;
  items.push({ id: Date.now() + Math.random(), name, qty: Math.max(1, parseInt(qtyEl.value, 10) || 1), done: false });
  save(); render();
  nameEl.value = ''; qtyEl.value = 1; nameEl.focus();
};

document.getElementById('clear').onclick = () => { items = items.filter(i => !i.done); save(); render(); };

render();
