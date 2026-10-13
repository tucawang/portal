# Tuca 门户

个人导航门户（纯静态，GitHub Pages 托管）：<https://tucawang.github.io/portal/>

## 功能
- **卡片分组**：按条目 `path` 第一段自动分组（参考 Homer）；链接新标签页打开，笔记进入详情页。
- **搜索**：加权匹配（标题 > 标签 > 描述 > 正文），高亮命中；`/` 聚焦搜索框，`Esc` 清空。
- **主题**：默认暗色，可切换亮色并记住选择（localStorage）。
- **笔记**：哈希路由 `#/note/<id>`，每条笔记有独立链接；Markdown 用 marked 渲染。
- **无障碍 / 响应式**：语义化 HTML、焦点样式、aria 标签、移动端单列。

## data.json 结构
```json
{ "id": "唯一ID", "title": "标题", "type": "链接|笔记", "url": "链接地址，笔记留空",
  "desc": "简介", "tags": ["标签"], "path": ["分组", "..."], "updated": "YYYY-MM-DD",
  "body": "可选 Markdown 正文" }
```

## 添加条目
在 `data.json` 数组中追加一项。笔记正文较长时可省略 `body`，改为新建 `notes/<id>.md`，页面会自动回退加载。

## 技术选型
原生 HTML / CSS 变量 / ES 模块，无构建步骤；唯一依赖 marked 通过 jsDelivr CDN 按需加载；图标来自 DuckDuckGo favicon 服务，失败时显示首字母。

```
index.html  css/style.css
js/data.js   加载与分组
js/search.js 加权搜索与高亮
js/render.js 卡片与笔记渲染
js/router.js 哈希路由
js/main.js   入口：主题、快捷键、启动
```

## 本地运行
```bash
python3 -m http.server 8000   # 打开 http://localhost:8000
```
