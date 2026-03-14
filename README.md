# 全栈网页项目

基于 **Next.js 15**、**React 19**、**TypeScript**、**Tailwind CSS** 的现代全栈应用。

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 框架 | Next.js 15 | 全栈 React 框架，前后端一体 |
| UI | React 19 | 最新 React，支持 Server Components |
| 语言 | TypeScript | 类型安全 |
| 样式 | Tailwind CSS | 原子化 CSS，响应式与暗色模式 |

## 本地运行

### 1. 安装依赖

```bash
cd D:\Desktop\网页开发
npm install
```

### 2. 开发模式（热更新）

```bash
npm run dev
```

浏览器打开：**http://localhost:3000**

### 3. 生产构建与运行

```bash
npm run build
npm start
```

## 让别人通过网址访问

### 方式一：同一 WiFi 下（局域网）

1. 运行 `npm run dev` 或 `npm start`
2. 查本机 IP（PowerShell）：
   ```powershell
   ipconfig
   ```
   找到「IPv4 地址」，例如 `192.168.1.100`
3. 同一 WiFi 下的别人访问：**http://192.168.1.100:3000**

### 方式二：公网访问（推荐）

把项目部署到云上，会得到一个公网网址，任何人可访问。

**Vercel（免费、和 Next.js 同厂）：**

1. 把代码推到 GitHub
2. 打开 [vercel.com](https://vercel.com)，用 GitHub 登录
3. 选择「Import」导入你的仓库
4. 一路下一步，自动检测 Next.js 并部署
5. 部署完成后会得到类似：`https://你的项目名.vercel.app`

**其他选择：** Railway、Render、Netlify 等也支持部署 Next.js。

## 项目结构说明

```
网页开发/
├── app/
│   ├── layout.tsx      # 根布局（全局 HTML 壳、字体等）
│   ├── page.tsx        # 首页（前端页面）
│   ├── globals.css     # 全局样式 + Tailwind
│   └── api/
│       └── hello/
│           └── route.ts  # 后端 API：GET /api/hello
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── postcss.config.mjs
```

- **前端**：`app/page.tsx` 是首页组件，用 React 写；`app/globals.css` 里用 Tailwind 类名写样式。
- **后端**：`app/api/hello/route.ts` 是接口，请求 `/api/hello` 会执行这里的 `GET`，返回 JSON。
- **前后端一体**：Next.js 同时负责渲染页面和提供 API，无需单独起两个服务。

## 常用命令

| 命令 | 作用 |
|------|------|
| `npm run dev` | 开发模式，改代码自动刷新 |
| `npm run build` | 构建生产版本 |
| `npm start` | 运行生产版本（需先 build） |
| `npm run lint` | 代码检查 |

---

按上面步骤安装依赖并执行 `npm run dev` 即可在本地看到页面；要给别人访问，用局域网 IP 或部署到 Vercel 即可获得网址。
"# yaosirui-web" 
"# yaosirui-web" 
"# yaosirui-web" 
