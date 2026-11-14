const display = document.getElementById('display');
let current = '0';   // number being typed
let stored = null;   // left operand
let op = null;       // pending operator
let fresh = false;   // next digit starts a new number

function compute(a, b, o) {
  switch (o) {
    case '+': return a + b;
    case '-': return a - b;
    case '×': return a * b;
    case '÷': return b === 0 ? NaN : a / b;
  }
  return b;
}

function format(n) {
  if (!isFinite(n)) return 'Error';
  return String(parseFloat(n.toPrecision(12)));
}

function show() { display.textContent = current; }

function reset() { current = '0'; stored = null; op = null; fresh = false; }

function pressDigit(d) {
  if (current === 'Error') reset();
  if (fresh) { current = '0'; fresh = false; }
  if (d === '.') {
    if (!current.includes('.')) current += '.';
  } else {
    current = current === '0' ? d : current + d;
  }
}

function pressOp(o) {
  if (current === 'Error') return;
  if (op && !fresh) {
    current = format(compute(stored, parseFloat(current), op));
    if (current === 'Error') { stored = null; op = null; return; }
  }
  stored = parseFloat(current);
  op = o;
  fresh = true;
}

function pressEquals() {
  if (op === null || current === 'Error') return;
  current = format(compute(stored, parseFloat(current), op));
  stored = null;
  op = null;
  fresh = true;
}

document.querySelector('.keys').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.digit) pressDigit(b.dataset.digit);
  else if (b.dataset.op) pressOp(b.dataset.op);
  else if (b.dataset.action === 'equals') pressEquals();
  else if (b.dataset.action === 'clear') reset();
  show();
});
