const WEIGHTS = { title: 10, tags: 6, desc: 3, body: 1 };

export function search(entries, query) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return entries;
  return entries
    .map((e) => {
      const fields = { title: e.title, tags: (e.tags || []).join(' '), desc: e.desc, body: e.body };
      let score = 0;
      for (const t of terms) {
        let hit = 0;
        for (const [k, w] of Object.entries(WEIGHTS)) if ((fields[k] || '').toLowerCase().includes(t)) hit += w;
        if (!hit) return null; // 所有词都需命中
        score += hit;
      }
      return { e, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.e);
}

const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// 转义后高亮匹配词
export function highlight(text = '', query = '') {
  const safe = escapeHtml(text);
  const terms = query.split(/\s+/).filter(Boolean).map((t) => escapeRe(escapeHtml(t)));
  return terms.length ? safe.replace(new RegExp(`(${terms.join('|')})`, 'gi'), '<mark>$1</mark>') : safe;
}
