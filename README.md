# gelly-studio-nav（Gelly-Studio Navigation System）

一个基于 Cloudflare Pages + Functions + KV 构建的极简主义个人导航系统。
前台采用现代无衬线、暗黑磨砂玻璃视觉（摒弃大圆角和无意义的渐变），纯网页端可视化管理，不依赖外部服务器，完全免费。

## ✨ 特性

- **真·无缝部署**：基于 Cloudflare 边缘网络，支持代码拖拽、Git 同步，0 成本全网加速。
- **纯可视化后台**：通过 `/login` 进入独立的管理面板。添加分类、增删网址卡片、调整布局全表单操作，彻底告别手动修改 JSON 的低效与高错率。
- **高阶外观自定义**：支持在后台直接粘贴任意图片直链作为背景，内置滑块可实时调节背景模糊度（Blur）和亮度（Brightness），支持全局字体大小自由缩放。
- **安全隔离**：前台极简轻量，不暴露任何管理入口与后台冗余代码。修改后的密码保存在你私有的 Cloudflare KV 中，不写入开源代码，安全无虞。

## 🚀 3分钟极速部署指南

### 1. 准备数据库 (Cloudflare KV)
1. 登录 Cloudflare 控制台，进入左侧 **存储与数据库 (Storage & Databases)** -> **KV**。
2. 点击 **创建命名空间 (Create Namespace)**，命名为 `NAV_KV`。

### 2. 部署到 Cloudflare Pages
1. 在本仓库下载 `index.html` 和 `_worker.js` 到本地同一个文件夹内。
2. 在 Cloudflare 控制台进入 **Workers 和 Pages** -> **创建** -> **Pages** -> **直接上传**。
3. 输入你的项目名称，将文件夹拖拽上传，点击部署。

### 3. 绑定数据库
1. 部署完成后，进入该 Pages 项目的管理页面。
2. 点击 **设置 (Settings)** -> **函数 (Functions)** -> 找到 **KV 命名空间绑定**。
3. 点击 **添加绑定**：
   - **变量名称**：务必填写 `NAV_KV`
   - **KV 命名空间**：选择你第一步创建的 `NAV_KV`
4. 点击保存。
5. 回到 **部署 (Deployments)** 页面，找到刚刚那次部署，点击右侧三个点，选择 **重新部署 (Redeploy)** 以激活绑定。

---

## 🛠️ 日常维护与使用

### 首次登录
- 打开 Cloudflare 分配给你的网址，在地址栏后面手动加上 `/login`（例如 `https://your-site.pages.dev/login`）。
- 默认初始管理密码为：`admin`
- **注意**：登录后请务必第一时间在「常规」选项卡中修改你的管理员密码。

### 自定义域名
1. 在 Pages 项目的 **自定义域 (Custom domains)** 选项卡中点击 **设置自定义域**。
2. 输入你的域名（如 `nav.yourdomain.com`）。
3. 如果域名在 Cloudflare 托管，一键确认即可；如果是外部域名，去域名服务商处添加一条 `CNAME` 记录指向原本的 `.pages.dev` 网址即可。

## 📝 许可证

基于 MIT License 开源。你可以自由修改、分发或用于个人/商业项目。
