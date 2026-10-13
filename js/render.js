import { groupBySection, loadBody } from './data.js';
import { highlight } from './search.js';

const main = () => document.getElementById('main');

function iconFor(e) {
  const initial = highlight([...e.title][0] || '?');
  if (!e.url) return `<span class="icon" aria-hidden="true">📝</span>`;
  const host = new URL(e.url).hostname;
  return `<span class="icon" aria-hidden="true"><img src="https://www.google.com/s2/favicons?domain=${host}&sz=64" alt="" loading="lazy"
    onerror="this.replaceWith(document.createTextNode('${initial}'))"></span>`;
}

function card(e, q) {
  const isLink = Boolean(e.url);
  const href = isLink ? e.url : `#/note/${encodeURIComponent(e.id)}`;
  const attrs = isLink ? ' target="_blank" rel="noopener noreferrer"' : '';
  const label = `${e.title}（${isLink ? '在新标签页打开' : '查看笔记'}）`;
  const tags = (e.tags || []).map((t) => `<li class="tag">${highlight(t, q)}</li>`).join('');
  return `<li><a class="card" href="${href}"${attrs} aria-label="${highlight(label)}">
    ${iconFor(e)}
    <div class="card-body">
      <h3>${highlight(e.title, q)}</h3>
      ${e.desc ? `<p>${highlight(e.desc, q)}</p>` : ''}
      ${tags ? `<ul class="tags">${tags}</ul>` : ''}
    </div></a></li>`;
}

export function renderHome(entries, q = '') {
  if (!entries.length) {
    main().innerHTML = `<p class="empty">没有匹配“${highlight(q)}”的条目</p>`;
    return;
  }
  const html = [...groupBySection(entries)].map(([name, items], i) => `
    <section class="section" aria-labelledby="s${i}">
      <h2 id="s${i}">${highlight(name)} <span class="n" aria-label="${items.length} 项">${items.length}</span></h2>
      <ul class="grid">${items.map((e) => card(e, q)).join('')}</ul>
    </section>`).join('');
  main().innerHTML = html;
}

export async function renderNote(entry) {
  if (!entry) {
    main().innerHTML = `<p class="empty">未找到该笔记。<a href="#/">返回首页</a></p>`;
    return;
  }
  const { marked } = await import('https://cdn.jsdelivr.net/npm/marked@12/lib/marked.esm.js');
  const body = await loadBody(entry);
  main().innerHTML = `<article class="note">
    <a class="back" href="#/">← 返回</a>
    <p class="meta">${highlight((entry.path || []).join(' / '))} · 更新于 ${highlight(entry.updated || '')}</p>
    ${body ? marked.parse(body) : `<h1>${highlight(entry.title)}</h1><p>${highlight(entry.desc || '')}</p>`}
  </article>`;
  main().focus();
}
