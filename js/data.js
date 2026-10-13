// 加载 data.json；笔记正文缺失时回退到 notes/<id>.md
export async function loadEntries() {
  const res = await fetch('data.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error(`data.json 加载失败：${res.status}`);
  return res.json();
}

export async function loadBody(entry) {
  if (entry.body) return entry.body;
  const res = await fetch(`notes/${encodeURIComponent(entry.id)}.md`);
  return res.ok ? res.text() : '';
}

// 按 path 第一段分组，保持出现顺序
export function groupBySection(entries) {
  const groups = new Map();
  for (const e of entries) {
    const key = e.path?.[0] || '未分类';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(e);
  }
  return groups;
}
