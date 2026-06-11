// Minimal synchronous test harness — no external dependencies.
let _passed = 0, _failed = 0;
const _log = [];

export function assert(condition, message) {
  if (condition) {
    _passed++;
    _log.push({ ok: true, msg: message });
  } else {
    _failed++;
    _log.push({ ok: false, msg: message });
    console.error(`FAIL: ${message}`);
  }
}

export function assertEqual(a, b, message) {
  assert(a === b, `${message}  [expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}]`);
}

export function describe(suite, fn) {
  console.group(suite);
  try { fn(); } catch (e) {
    _failed++;
    _log.push({ ok: false, msg: `${suite}: threw ${e.message}` });
    console.error(e);
  }
  console.groupEnd();
}

export function it(name, fn) {
  try { fn(); }
  catch (e) {
    _failed++;
    _log.push({ ok: false, msg: `${name}: threw ${e.message}` });
    console.error(`FAIL (exception): ${name}`, e);
  }
}

export function getSummary() {
  return { passed: _passed, failed: _failed, total: _passed + _failed, log: _log };
}

export function renderResults(containerEl) {
  const { passed, failed, total, log } = getSummary();
  const header = document.createElement('h2');
  header.style.color = failed === 0 ? '#4caf50' : '#f44336';
  header.textContent = `${passed}/${total} tests passats${failed ? ` — ${failed} fallats` : ''}`;
  containerEl.appendChild(header);

  for (const entry of log) {
    const line = document.createElement('div');
    line.className = entry.ok ? 'test-pass' : 'test-fail';
    line.textContent = `${entry.ok ? '✓' : '✗'} ${entry.msg}`;
    containerEl.appendChild(line);
  }
}
