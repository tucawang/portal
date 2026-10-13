'use strict';
(function () {
  var data = [];
  var $ = function (s) { return document.querySelector(s); };
  var main = $('#main'), side = $('#sidebar'), search = $('#search');

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function reEsc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function hl(text, q) {
    var t = esc(text);
    if (!q) return t;
    return t.replace(new RegExp(reEsc(esc(q)), 'gi'), function (m) { return '<mark>' + m + '</mark>'; });
  }
  function enc(p) { return p.map(encodeURIComponent).join('/'); }

  // ---- nav tree ----
  function buildTree() {
    var root = { children: {}, count: 0 };
    data.forEach(function (e) {
      var n = root; n.count++;
      (e.path || []).forEach(function (seg) {
        n = n.children[seg] = n.children[seg] || { children: {}, count: 0 };
        n.count++;
      });
    });
    return root;
  }
  function renderTree(node, prefix) {
    var keys = Object.keys(node.children).sort();
    if (!keys.length) return '';
    return '<ul>' + keys.map(function (k) {
      var p = prefix.concat(k), c = node.children[k];
      return '<li><a class="nav-link" data-path="' + esc(p.join('/')) + '" href="#/path/' + enc(p) + '">' +
        esc(k) + ' <span class="count">' + c.count + '</span></a>' + renderTree(c, p) + '</li>';
    }).join('') + '</ul>';
  }
  function renderSidebar() {
    var t = buildTree();
    side.innerHTML = '<a class="nav-link" data-path="" href="#/">全部 <span class="count">' + data.length + '</span></a>' +
      (Object.keys(t.children).length ? renderTree(t, []) : '<p class="empty">暂无分类</p>');
  }
  function markActive(p) {
    side.querySelectorAll('.nav-link').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-path') === p);
    });
  }

  // ---- cards ----
  function card(e, q) {
    var tags = (e.tags || []).map(function (t) { return '<span class="tag">' + hl(t, q) + '</span>'; }).join('');
    var snippet = '';
    if (q && e.body && e.body.toLowerCase().indexOf(q.toLowerCase()) >= 0) {
      var i = e.body.toLowerCase().indexOf(q.toLowerCase());
      snippet = '<p class="snippet">…' + hl(e.body.slice(Math.max(0, i - 40), i + 60), q) + '…</p>';
    }
    return '<article class="card"><div class="card-head"><span class="type">' + esc(e.type) + '</span>' +
      '<a class="card-title" href="#/note/' + encodeURIComponent(e.id) + '">' + hl(e.title, q) + '</a></div>' +
      (e.desc ? '<p class="desc">' + hl(e.desc, q) + '</p>' : '') + snippet +
      '<div class="meta">' + tags + '<span class="path">' + esc((e.path || []).join(' / ')) + '</span>' +
      (e.updated ? '<span class="date">' + esc(e.updated) + '</span>' : '') +
      (e.url ? '<a class="ext" href="' + esc(e.url) + '" target="_blank" rel="noopener">打开 ↗</a>' : '') +
      '</div></article>';
  }
  function list(items, heading, q) {
    main.innerHTML = '<h2>' + heading + '</h2>' + (items.length
      ? '<div class="cards">' + items.map(function (e) { return card(e, q); }).join('') + '</div>'
      : '<p class="empty">' + (q ? '没有找到与“' + esc(q) + '”相关的内容' : '这里还没有条目') + '</p>');
  }

  // ---- search ----
  function score(e, q) {
    var s = 0, l = q.toLowerCase();
    var has = function (v) { return v && String(v).toLowerCase().indexOf(l) >= 0; };
    if (has(e.title)) s += 10;
    if ((e.tags || []).some(has)) s += 5;
    if (has(e.desc)) s += 3;
    if (has(e.body)) s += 1;
    return s;
  }
  function doSearch(q) {
    var r = data.map(function (e) { return { e: e, s: score(e, q) }; })
      .filter(function (x) { return x.s > 0; })
      .sort(function (a, b) { return b.s - a.s; })
      .map(function (x) { return x.e; });
    list(r, '搜索：' + esc(q) + '（' + r.length + '）', q);
  }

  // ---- note ----
  function showNote(id) {
    var e = data.filter(function (x) { return x.id === id; })[0];
    if (!e) { main.innerHTML = '<p class="empty">未找到条目：' + esc(id) + '</p>'; return; }
    markActive((e.path || []).join('/'));
    var head = '<article class="note"><p class="crumb">' + esc((e.path || []).join(' / ')) + '</p><h1>' + esc(e.title) + '</h1>' +
      '<p class="meta"><span class="type">' + esc(e.type) + '</span>' +
      (e.updated ? ' 更新于 ' + esc(e.updated) : '') +
      (e.url ? ' · <a href="' + esc(e.url) + '" target="_blank" rel="noopener">' + esc(e.url) + '</a>' : '') + '</p>' +
      (e.desc ? '<p class="desc">' + esc(e.desc) + '</p>' : '');
    var render = function (md) {
      var html = md ? (window.marked ? marked.parse(md) : '<pre>' + esc(md) + '</pre>') : '<p class="empty">暂无正文</p>';
      main.innerHTML = head + '<div class="body">' + html + '</div></article>';
    };
    if (e.body != null) return render(e.body);
    main.innerHTML = head + '<p class="empty">加载中…</p></article>';
    fetch('notes/' + encodeURIComponent(id) + '.md').then(function (r) { return r.ok ? r.text() : ''; })
      .catch(function () { return ''; }).then(function (t) { e.body = t; if (location.hash === '#/note/' + encodeURIComponent(id)) render(t); });
  }

  // ---- router ----
  function route() {
    var h = location.hash.replace(/^#\/?/, '');
    var parts = h.split('/').filter(Boolean).map(function (s) { try { return decodeURIComponent(s); } catch (x) { return s; } });
    closeMenu();
    if (parts[0] === 'note' && parts[1]) return showNote(parts[1]);
    if (parts[0] === 'search') {
      var q = parts.slice(1).join('/');
      if (search.value !== q) search.value = q;
      markActive(null);
      return q ? doSearch(q) : list(data, '全部');
    }
    if (parts[0] === 'path') {
      var p = parts.slice(1);
      markActive(p.join('/'));
      var items = data.filter(function (e) {
        return p.every(function (seg, i) { return (e.path || [])[i] === seg; });
      });
      return list(items, esc(p.join(' / ')));
    }
    markActive('');
    list(data, '全部');
  }

  // ---- UI ----
  var timer;
  search.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      var q = search.value.trim();
      location.hash = q ? '#/search/' + encodeURIComponent(q) : '#/';
    }, 200);
  });
  document.addEventListener('keydown', function (ev) {
    var t = ev.target.tagName;
    if (ev.key === '/' && t !== 'INPUT' && t !== 'TEXTAREA') { ev.preventDefault(); search.focus(); search.select(); }
    if (ev.key === 'Escape') { search.blur(); closeMenu(); }
  });
  function closeMenu() { document.body.classList.remove('menu-open'); }
  $('#menuBtn').addEventListener('click', function () { document.body.classList.toggle('menu-open'); });
  $('#overlay').addEventListener('click', closeMenu);

  var saved = null;
  try { saved = localStorage.getItem('theme'); } catch (x) {}
  if (saved) document.documentElement.setAttribute('data-theme', saved);
  $('#themeBtn').addEventListener('click', function () {
    var cur = document.documentElement.getAttribute('data-theme') ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (x) {}
  });

  window.addEventListener('hashchange', route);
  fetch('data.json', { cache: 'no-cache' }).then(function (r) {
    if (!r.ok) throw new Error(r.status);
    return r.json();
  }).then(function (d) {
    data = Array.isArray(d) ? d : [];
    renderSidebar(); route();
  }).catch(function (err) {
    side.innerHTML = '';
    main.innerHTML = '<p class="empty">数据加载失败：' + esc(err.message) + '</p>';
  });
})();
