import { loadEntries } from './data.js';
import { search } from './search.js';
import { renderHome, renderNote } from './render.js';
import { onRoute } from './router.js';

const input = document.getElementById('q');
const root = document.documentElement;

function initTheme() {
  document.getElementById('theme').addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch { /* 隐私模式忽略 */ }
  });
}

function initKeys() {
  document.addEventListener('keydown', (e) => {
    const typing = /INPUT|TEXTAREA/.test(document.activeElement?.tagName);
    if (e.key === '/' && !typing) { e.preventDefault(); input.focus(); }
    else if (e.key === 'Escape' && document.activeElement === input) {
      input.value = '';
      input.dispatchEvent(new Event('input'));
    }
  });
}

async function start() {
  initTheme();
  initKeys();
  let entries;
  try {
    entries = await loadEntries();
  } catch (err) {
    document.getElementById('main').innerHTML = `<p class="empty">${err.message}</p>`;
    return;
  }
  document.getElementById('count').textContent = `${entries.length} 个条目`;
  const showHome = () => renderHome(search(entries, input.value.trim()), input.value.trim());

  input.addEventListener('input', () => {
    if (location.hash.startsWith('#/note/')) location.hash = '#/';
    else showHome();
  });
  onRoute((route) => {
    if (route.name === 'note') renderNote(entries.find((e) => e.id === route.id));
    else showHome();
  });
}

start();
