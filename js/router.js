// 哈希路由：#/ 首页，#/note/<id> 笔记详情
export function parseRoute(hash = location.hash) {
  const m = hash.match(/^#\/note\/(.+)$/);
  return m ? { name: 'note', id: decodeURIComponent(m[1]) } : { name: 'home' };
}

export function onRoute(handler) {
  window.addEventListener('hashchange', () => handler(parseRoute()));
  handler(parseRoute());
}
