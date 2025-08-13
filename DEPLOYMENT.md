# 部署说明

## Vercel 部署配置

本项目已配置为可在 Vercel 上部署的 React SPA 应用。

### 配置文件说明

1. **vercel.json** - Vercel 部署配置
   - 使用 `@vercel/static-build` 构建器
   - 构建输出目录设置为 `dist`

2. **_redirects** - SPA 路由重定向规则
   - 所有路由都重定向到 `index.html`，支持 React Router

3. **webpack.config.js** - 构建配置
   - 输出目录：`dist`
   - 支持 CSS 模块和普通 CSS
   - 包含 CopyWebpackPlugin 复制 _redirects 文件

### 部署步骤

1. 确保所有文件已提交到 Git 仓库
2. 在 Vercel 中导入项目
3. Vercel 会自动检测到 `vercel.json` 配置
4. 构建命令会自动运行 `npm run build`

### 故障排除

如果部署后链接打不开，可能的原因：

1. **构建失败** - 检查 Vercel 构建日志
2. **路由问题** - 确保 `_redirects` 文件存在于 `dist` 目录
3. **静态资源路径** - 检查 webpack `publicPath` 配置
4. **依赖问题** - 确保所有依赖都在 `package.json` 中

### 本地测试

```bash
# 构建项目
npm run build

# 本地测试构建结果
npx serve dist -p 3008
```

### 性能优化建议

当前构建包较大 (3.37 MiB)，建议：

1. 启用代码分割 (Code Splitting)
2. 使用动态导入 (Dynamic Imports)
3. 优化第三方库的引入
4. 启用 Tree Shaking
