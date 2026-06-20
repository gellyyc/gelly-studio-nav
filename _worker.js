const defaultData = {
  title: "Workspace",
  subtitle: "精选工具与生产力控制台",
  categories: [{ name: "常用工具", links: [{ title: "GitHub", desc: "代码托管平台", url: "https://github.com" }] }]
};

// 后台管理面板的 HTML 模板
const adminHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>控制台管理后台</title>
    <style>
        body { font-family: -apple-system, sans-serif; background: #0b0b0c; color: #f4f4f5; padding: 40px 20px; display: flex; justify-content: center; }
        .box { width: 100%; max-width: 550px; background: #131315; border: 1px solid #222225; padding: 30px; border-radius: 12px; }
        .nav-tabs { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid #222225; padding-bottom: 10px; }
        .tab-btn { background: none; border: none; color: #71717a; cursor: pointer; font-size: 0.9rem; padding: 4px 8px; }
        .tab-btn.active { color: #3b82f6; font-weight: bold; }
        input, select { width: 100%; background: #0b0b0c; border: 1px solid #222225; padding: 10px; border-radius: 6px; color: #fff; margin-bottom: 14px; }
        button { padding: 10px; border-radius: 6px; cursor: pointer; font-weight: 500; background: #3b82f6; border: none; color: white; width: 100%; }
        .form-group label { display: block; font-size: 0.8rem; color: #71717a; margin-bottom: 6px; }
        .manager-item { display: flex; justify-content: space-between; align-items: center; background: #0b0b0c; padding: 10px; border-radius: 6px; border: 1px solid #222225; margin-bottom: 10px; font-size: 0.9rem; }
        .delete-btn { background: none; border: none; color: #ef4444; cursor: pointer; }
        .editor-box { background: #0b0b0c; border: 1px solid #222225; padding: 12px; border-radius: 6px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="box" id="login-zone">
        <h3 style="margin-bottom:20px;">系统身份验证</h3>
        <input type="password" id="pass" placeholder="请输入管理密码">
        <button onclick="login()">确认登录</button>
    </div>

    <div class="box" id="admin-zone" style="display:none;">
        <div class="nav-tabs">
            <button class="tab-btn active" onclick="switchTab('tab-site')">常规</button>
            <button class="tab-btn" onclick="switchTab('tab-theme')">外观</button>
            <button class="tab-btn" onclick="switchTab('tab-cat')">分类</button>
            <button class="tab-btn" onclick="switchTab('tab-link')">网址</button>
            <button class="tab-btn" style="margin-left:auto; color:#ef4444" onclick="logout()">退出</button>
        </div>

        <div id="tab-site" class="tab">
            <div class="form-group"><label>网站标题</label><input type="text" id="cfg-title"></div>
            <div class="form-group"><label>网站副标题</label><input type="text" id="cfg-subtitle"></div>
            <div class="form-group"><label>管理密码 (留空不修改)</label><input type="password" id="cfg-password"></div>
            <button onclick="saveSettings()">保存常规设置</button>
        </div>

        <div id="tab-theme" class="tab" style="display:none;">
            <div class="form-group"><label>背景图片 URL</label><input type="text" id="cfg-bg-url"></div>
            <div class="form-group"><label>背景亮度 (10-100)</label><input type="number" id="cfg-bg-bright"></div>
            <div class="form-group"><label>背景模糊度 (0-20)</label><input type="number" id="cfg-bg-blur"></div>
            <div class="form-group"><label>全局字体大小 (12-22)</label><input type="number" id="cfg-font-size"></div>
            <button onclick="saveTheme()">保存外观设置</button>
        </div>

        <div id="tab-cat" class="tab" style="display:none;">
            <div class="editor-box"><input type="text" id="new-cat-name" placeholder="新分类名称"><button onclick="addCategory()">添加分类</button></div>
            <div id="category-list"></div>
        </div>

        <div id="tab-link" class="tab" style="display:none;">
            <div class="editor-box">
                <select id="link-target-cat"></select>
                <input type="text" id="link-title" placeholder="网站名称">
                <input type="text" id="link-desc" placeholder="网站描述">
                <input type="text" id="link-url" placeholder="跳转链接">
                <button onclick="addLink()">添加网址卡片</button>
            </div>
            <div id="all-links-list"></div>
        </div>
    </div>

    <script>
        let token = localStorage.getItem('nav_token') || '';
        let currentConfig = {};

        async function init() {
            if(token) {
                document.getElementById('login-zone').style.display = 'none';
                document.getElementById('admin-zone').style.display = 'block';
                await loadConfig();
            }
        }

        async function login() {
            const password = document.getElementById('pass').value;
            const res = await fetch('/api/login', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ password })});
            const data = await res.json();
            if(data.success) {
                token = data.token; localStorage.setItem('nav_token', token); location.reload();
            } else { alert('密码错误'); }
        }

        async function loadConfig() {
            const res = await fetch('/api/get-config');
            currentConfig = await res.json();
            document.getElementById('cfg-title').value = currentConfig.title || '';
            document.getElementById('cfg-subtitle').value = currentConfig.subtitle || '';
            const t = currentConfig.theme || {};
            document.getElementById('cfg-bg-url').value = t.bgUrl || '';
            document.getElementById('cfg-bg-bright').value = t.brightness || 100;
            document.getElementById('cfg-bg-blur').value = t.blur || 0;
            document.getElementById('cfg-font-size').value = t.fontSize || 16;
            renderLists();
        }

        function renderLists() {
            const catList = document.getElementById('category-list');
            const catSelect = document.getElementById('link-target-cat');
            const linksList = document.getElementById('all-links-list');
            catList.innerHTML = ''; catSelect.innerHTML = ''; linksList.innerHTML = '';

            (currentConfig.categories || []).forEach((cat, cIdx) => {
                catList.innerHTML += \`<div class="manager-item"><span>\${cat.name}</span><button class="delete-btn" onclick="deleteCategory(\${cIdx})">删除</button></div>\`;
                catSelect.innerHTML += \`<option value="\${cIdx}">\${cat.name}</option>\`;
                cat.links.forEach((link, lIdx) => {
                    linksList.innerHTML += \`<div class="manager-item"><span>[\${cat.name}] \${link.title}</span><button class="delete-btn" onclick="deleteLink(\${cIdx}, \${lIdx})">删除</button></div>\`;
                });
            });
        }

        async function submitDataUpdate() {
            await fetch('/api/save-data', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': token }, body: JSON.stringify({ categories: currentConfig.categories }) });
            loadConfig();
        }

        async function saveSettings() {
            const title = document.getElementById('cfg-title').value;
            const subtitle = document.getElementById('cfg-subtitle').value;
            const newPassword = document.getElementById('cfg-password').value;
            await fetch('/api/save-config', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': token }, body: JSON.stringify({ title, subtitle, newPassword }) });
            alert('保存成功');
        }

        async function saveTheme() {
            if(!currentConfig.theme) currentConfig.theme = {};
            currentConfig.theme.bgUrl = document.getElementById('cfg-bg-url').value;
            currentConfig.theme.brightness = document.getElementById('cfg-bg-bright').value;
            currentConfig.theme.blur = document.getElementById('cfg-bg-blur').value;
            currentConfig.theme.fontSize = document.getElementById('cfg-font-size').value;
            await fetch('/api/save-config', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': token }, body: JSON.stringify({ title: currentConfig.title, subtitle: currentConfig.subtitle, theme: currentConfig.theme }) });
            alert('外观已保存');
        }

        async function addCategory() {
            const name = document.getElementById('new-cat-name').value;
            if(!name) return; currentConfig.categories.push({ name, links: [] });
            document.getElementById('new-cat-name').value = ''; await submitDataUpdate();
        }
        async function deleteCategory(idx) { currentConfig.categories.splice(idx,1); await submitDataUpdate(); }
        async function addLink() {
            const cIdx = document.getElementById('link-target-cat').value;
            const title = document.getElementById('link-title').value;
            const desc = document.getElementById('link-desc').value;
            const url = document.getElementById('link-url').value;
            currentConfig.categories[cIdx].links.push({ title, desc, url });
            await submitDataUpdate();
        }
        async function deleteLink(cIdx, lIdx) { currentConfig.categories[cIdx].links.splice(lIdx, 1); await submitDataUpdate(); }
        function switchTab(id) { document.querySelectorAll('.tab').forEach(t=>t.style.display='none'); document.getElementById(id).style.display='block'; }
        function logout() { localStorage.removeItem('nav_token'); location.reload(); }
        init();
    </script>
</body>
</html>
`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    let adminPassword = await env.NAV_KV.get("admin_password");
    if (!adminPassword) {
      await env.NAV_KV.put("admin_password", "admin");
      await env.NAV_KV.put("site_config", JSON.stringify(defaultData));
      adminPassword = "admin";
    }
    const validToken = btoa(adminPassword);

    // 🌟 当访问 /login 时，直接下发上面写好的独立后台网页
    if (url.pathname === "/login" || url.pathname === "/login.html") {
      return new Response(adminHtml, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    }

    // API 接口逻辑
    if (url.pathname === "/api/get-config") {
      const config = await env.NAV_KV.get("site_config");
      return new Response(config, { headers: { "Content-Type": "application/json" } });
    }
    if (url.pathname === "/api/login" && request.method === "POST") {
      const body = await request.json();
      if (body.password === adminPassword) {
        return new Response(JSON.stringify({ success: true, token: validToken }));
      }
      return new Response(JSON.stringify({ success: false }), { status: 401 });
    }
    if (url.pathname === "/api/save-config" && request.method === "POST") {
      if (request.headers.get("Authorization") !== validToken) return new Response("Unauthorized", { status: 401 });
      const body = await request.json();
      let config = JSON.parse(await env.NAV_KV.get("site_config"));
      config.title = body.title; config.subtitle = body.subtitle;
      if (body.theme) config.theme = body.theme;
      await env.NAV_KV.put("site_config", JSON.stringify(config));
      if (body.newPassword) await env.NAV_KV.put("admin_password", body.newPassword.trim());
      return new Response(JSON.stringify({ success: true }));
    }
    if (url.pathname === "/api/save-data" && request.method === "POST") {
      if (request.headers.get("Authorization") !== validToken) return new Response("Unauthorized", { status: 401 });
      const body = await request.json();
      let config = JSON.parse(await env.NAV_KV.get("site_config"));
      config.categories = body.categories;
      await env.NAV_KV.put("site_config", JSON.stringify(config));
      return new Response(JSON.stringify({ success: true }));
    }

    // 默认返回静态首页
    return env.ASSETS.fetch(request);
  }
};