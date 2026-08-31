# 张悦静态简历网站

这是一个使用 React、TypeScript 和 Vite 构建的纯静态简历网站。页面按普通 PDF 简历方式排版，不依赖后端、数据库或路由，可直接部署到 GitHub Pages。

## 本地使用

```bash
npm ci
npm run dev
npm test
npm run test:e2e
npm run build
npm run preview
```

生产构建位于 `dist/`。Vite 使用相对资源路径，因此 GitHub 仓库名称变化时不需要修改页面代码。

## 同步飞书简历

```bash
npm run sync:resume
```

此命令需要本机已经安装并登录 `lark-cli`。它会读取指定飞书文档的最新 revision，将原始 XML、类型化简历数据、规范化文字与链接清单写入 `src/data/`。生成后的数据会提交到仓库；GitHub Actions 构建时不会访问飞书。

## 添加照片

生产环境的照片配置位于 `src/data/photos.ts`，目前数组为空，因此页面不会出现占位框或空白栏。以后需要照片时，可把图片放入 `src/assets/`，在 `photos.ts` 中导入图片并加入 `photos` 数组。桌面端会显示在顶部资料右侧，窄屏会自动排到资料下方。

开发环境访问 `/?photoPreview=1` 可使用内置测试图检查照片布局；该测试图不会进入默认生产页面。

## GitHub Pages

推送到 `main` 后，`.github/workflows/deploy-pages.yml` 会依次安装依赖、运行单元测试、构建静态文件并部署 `dist/`。首次使用时，在仓库 **Settings → Pages → Build and deployment** 中把 Source 设为 **GitHub Actions**。
