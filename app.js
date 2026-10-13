(function () {
  var data = window.PORTAL_DATA || {};
  var cats = ["全部"].concat(Object.keys(data));
  var cur = "全部", q = document.getElementById("q");
  var tabs = document.getElementById("tabs"), list = document.getElementById("list");
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return "&#" + c.charCodeAt(0) + ";"; }); }
  function renderTabs() {
    tabs.innerHTML = cats.map(function (c) { return '<button class="' + (c === cur ? "on" : "") + '" data-c="' + esc(c) + '">' + esc(c) + "</button>"; }).join("");
  }
  function render() {
    var kw = q.value.trim().toLowerCase(), out = [];
    Object.keys(data).forEach(function (c) {
      if (!kw && cur !== "全部" && c !== cur) return; // 搜索时跨全部分类
      (data[c] || []).forEach(function (e) {
        var hay = [e.title, e.desc, e.url, (e.tags || []).join(" "), c].join(" ").toLowerCase();
        if (kw && hay.indexOf(kw) < 0) return;
        var t = e.url ? '<a href="' + esc(e.url) + '" target="_blank" rel="noopener">' + esc(e.title) + "</a>" : "<strong>" + esc(e.title) + "</strong>";
        var tags = (e.tags || []).map(function (g) { return '<span class="tag' + (g === "示例" ? " demo" : "") + '">' + esc(g) + "</span>"; }).join("");
        out.push('<div class="card">' + t + '<span class="cat">' + esc(c) + "</span><p>" + esc(e.desc) + "</p>" + tags + "</div>");
      });
    });
    list.innerHTML = out.length ? out.join("") : '<p class="empty">没有匹配的条目</p>';
  }
  tabs.addEventListener("click", function (ev) { var c = ev.target.getAttribute("data-c"); if (c) { cur = c; renderTabs(); render(); } });
  q.addEventListener("input", render);
  renderTabs(); render();
})();
