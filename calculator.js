const http = require('http');
const { URL } = require('url');

const port = process.env.PORT || 3000;

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function parseCalculation(searchParams) {
  const left = Number(searchParams.get('left'));
  const right = Number(searchParams.get('right'));
  const operator = searchParams.get('operator');

  if (!searchParams.get('left') && !searchParams.get('right') && !operator) {
    return { left: '', right: '', operator: '+', result: '', message: 'Enter two numbers and choose an operation.' };
  }

  if (!Number.isFinite(left) || !Number.isFinite(right)) {
    return { left: searchParams.get('left') || '', right: searchParams.get('right') || '', operator: operator || '+', result: '', message: 'Please enter valid numbers.' };
  }

  let result;

  switch (operator) {
    case '+':
      result = left + right;
      break;
    case '-':
      result = left - right;
      break;
    case '*':
      result = left * right;
      break;
    case '/':
      if (right === 0) {
        return { left, right, operator, result: '', message: 'Cannot divide by zero.' };
      }
      result = left / right;
      break;
    case '%':
      result = left % right;
      break;
    default:
      return { left, right, operator: '+', result: '', message: 'Choose a valid operator.' };
  }

  return {
    left,
    right,
    operator,
    result: Number.isInteger(result) ? String(result) : String(Number(result.toFixed(10))),
    message: 'Calculation complete.',
  };
}

function renderPage(state) {
  const operators = ['+', '-', '*', '/', '%'];

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Calculator</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #0b1020;
        --bg-2: #111935;
        --panel: rgba(17, 25, 53, 0.88);
        --panel-border: rgba(255, 255, 255, 0.08);
        --text: #f5f7ff;
        --muted: #94a3b8;
        --accent: #56e39f;
        --accent-2: #67b7ff;
        --danger: #ff7b72;
        --key: rgba(255, 255, 255, 0.08);
        --key-hover: rgba(255, 255, 255, 0.14);
        --shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: var(--text);
        background:
          radial-gradient(circle at top left, rgba(86, 227, 159, 0.18), transparent 28%),
          radial-gradient(circle at top right, rgba(103, 183, 255, 0.16), transparent 24%),
          linear-gradient(160deg, var(--bg), var(--bg-2));
        padding: 24px;
      }

      .shell {
        width: min(100%, 460px);
        background: var(--panel);
        border: 1px solid var(--panel-border);
        border-radius: 28px;
        box-shadow: var(--shadow);
        overflow: hidden;
        backdrop-filter: blur(18px);
      }

      .top {
        padding: 24px 24px 18px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }

      .eyebrow {
        margin: 0 0 8px;
        color: var(--accent);
        font-size: 0.78rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }

      h1 { margin: 0; font-size: 1.6rem; line-height: 1.1; }

      .hint {
        margin: 10px 0 0;
        color: var(--muted);
        font-size: 0.95rem;
      }

      .display {
        padding: 22px 24px 16px;
        text-align: right;
        word-break: break-all;
      }

      .expression {
        min-height: 24px;
        color: var(--muted);
        font-size: 1rem;
        letter-spacing: 0.02em;
      }

      .result {
        min-height: 62px;
        font-size: clamp(2.2rem, 6vw, 3.4rem);
        font-weight: 700;
        line-height: 1.05;
      }

      form { margin: 0; }

      .controls {
        padding: 0 18px 18px;
        display: grid;
        gap: 12px;
      }

      .field {
        display: grid;
        gap: 8px;
      }

      label {
        color: var(--muted);
        font-size: 0.9rem;
      }

      input, select, button {
        font: inherit;
        border-radius: 18px;
        border: 0;
      }

      input, select {
        min-height: 56px;
        padding: 0 16px;
        color: var(--text);
        background: var(--key);
        outline: none;
      }

      input::placeholder { color: #7c8aa8; }

      .row {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        gap: 10px;
        align-items: end;
      }

      .operator {
        min-width: 88px;
      }

      .actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }

      button {
        min-height: 58px;
        color: var(--text);
        background: var(--key);
        cursor: pointer;
        transition: transform 120ms ease, background 120ms ease, box-shadow 120ms ease;
      }

      button:hover { background: var(--key-hover); }
      button:active { transform: translateY(1px) scale(0.99); }

      .primary {
        background: linear-gradient(135deg, var(--accent), var(--accent-2));
        color: #08111f;
        font-weight: 700;
      }

      .primary:hover { box-shadow: 0 10px 24px rgba(86, 227, 159, 0.2); }

      .message {
        margin: 0 18px 18px;
        padding: 12px 14px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.06);
        color: var(--muted);
      }

      .message.error { color: #ffd5d1; }

      @media (max-width: 520px) {
        .shell { border-radius: 22px; }
        .row { grid-template-columns: 1fr; }
        .operator { min-width: 0; }
      }
    </style>
  </head>
  <body>
    <main class="shell" aria-label="Calculator app">
      <section class="top">
        <p class="eyebrow">Node.js Calculator</p>
        <h1>Calculator</h1>
        <p class="hint">Server-side calculation with a plain HTML form. No browser JavaScript.</p>
      </section>

      <section class="display" aria-live="polite">
        <div class="expression">${escapeHtml(state.left !== '' && state.right !== '' ? `${state.left} ${state.operator} ${state.right}` : 'Ready')}</div>
        <div class="result">${escapeHtml(state.result || '0')}</div>
      </section>

      <form method="GET" action="/">
        <div class="controls">
          <div class="row">
            <div class="field">
              <label for="left">First number</label>
              <input id="left" name="left" type="number" step="any" value="${escapeHtml(state.left)}" placeholder="12" />
            </div>

            <div class="field">
              <label for="operator">Operator</label>
              <select id="operator" class="operator" name="operator">
                ${operators.map((operator) => `<option value="${operator}" ${state.operator === operator ? 'selected' : ''}>${escapeHtml(operator)}</option>`).join('')}
              </select>
            </div>

            <div class="field">
              <label for="right">Second number</label>
              <input id="right" name="right" type="number" step="any" value="${escapeHtml(state.right)}" placeholder="3" />
            </div>
          </div>

          <div class="actions">
            <button class="primary" type="submit">Calculate</button>
            <button type="reset" onclick="window.location.href='/'">Clear</button>
          </div>
        </div>
      </form>

      <p class="message ${state.message && state.message !== 'Calculation complete.' ? 'error' : ''}">${escapeHtml(state.message)}</p>
    </main>
  </body>
</html>`;
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);

  if (requestUrl.pathname !== '/') {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  const state = parseCalculation(requestUrl.searchParams);

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(renderPage(state));
});

server.listen(port, () => {
  console.log(`Calculator running at http://localhost:${port}`);
});