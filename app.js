(function () {
  'use strict';
  var KEY = 'todos-v1';
  var todos = [];
  var filter = 'all';
  var editingId = null;

  try { todos = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { todos = []; }

  var form = document.getElementById('add-form');
  var input = document.getElementById('new-todo');
  var list = document.getElementById('list');
  var count = document.getElementById('count');
  var clearBtn = document.getElementById('clear');
  var filterBtns = document.querySelectorAll('[data-filter]');

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(todos)); } catch (e) {}
  }

  function el(tag, props) {
    var n = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) { n[k] = props[k]; });
    return n;
  }

  function render() {
    list.textContent = '';
    var visible = todos.filter(function (t) {
      return filter === 'all' || (filter === 'active' ? !t.done : t.done);
    });
    if (!visible.length) {
      list.appendChild(el('li', { className: 'empty', textContent: 'No tasks to show.' }));
    }
    var focusEl = null;
    visible.forEach(function (t) {
      var li = el('li', { className: t.done ? 'done' : '' });
      var cb = el('input', { type: 'checkbox', checked: t.done, id: 'cb-' + t.id });
      cb.addEventListener('change', function () { t.done = cb.checked; save(); render(); });
      li.appendChild(cb);

      if (editingId === t.id) {
        var ed = el('input', { type: 'text', className: 'edit-input', value: t.text });
        ed.setAttribute('aria-label', 'Edit task');
        var finished = false;
        var commit = function (apply) {
          if (finished) return;
          finished = true;
          var v = ed.value.trim();
          if (apply && v) t.text = v;
          editingId = null; save(); render();
        };
        ed.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') commit(true);
          else if (e.key === 'Escape') commit(false);
        });
        ed.addEventListener('blur', function () { commit(true); });
        li.appendChild(ed);
        focusEl = ed;
      } else {
        var lab = el('label', { textContent: t.text });
        lab.htmlFor = cb.id;
        lab.addEventListener('dblclick', function () { editingId = t.id; render(); });
        li.appendChild(lab);
        var eb = el('button', { type: 'button', textContent: 'Edit' });
        eb.setAttribute('aria-label', 'Edit ' + t.text);
        eb.addEventListener('click', function () { editingId = t.id; render(); });
        li.appendChild(eb);
      }
      var del = el('button', { type: 'button', textContent: 'Delete' });
      del.setAttribute('aria-label', 'Delete ' + t.text);
      del.addEventListener('click', function () {
        todos = todos.filter(function (x) { return x !== t; });
        save(); render();
      });
      li.appendChild(del);
      list.appendChild(li);
    });
    if (focusEl) { focusEl.focus(); focusEl.select(); }

    var left = todos.filter(function (t) { return !t.done; }).length;
    count.textContent = left + (left === 1 ? ' item' : ' items') + ' left';
    clearBtn.disabled = left === todos.length;
    filterBtns.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.filter === filter));
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = input.value.trim();
    if (!v) return;
    todos.push({ id: Date.now() + Math.random(), text: v, done: false });
    input.value = '';
    save(); render();
  });

  filterBtns.forEach(function (b) {
    b.addEventListener('click', function () { filter = b.dataset.filter; render(); });
  });

  clearBtn.addEventListener('click', function () {
    todos = todos.filter(function (t) { return !t.done; });
    save(); render();
  });

  render();
})();
