# 物联网设备管理平台原型基础框架

一个基于 React 18 + Ant Design 5 的现代化物联网设备管理平台原型基础框架，具有完整的响应式设计和优雅的用户界面。

## ✨ 特性

- 🚀 **现代技术栈**: React 18 + Hooks + Ant Design 5
- 📱 **响应式设计**: 完美适配桌面端、平板端和移动端
- 🎨 **优雅界面**: 现代化的白色主题导航栏设计
- 🔧 **完整配置**: 包含 Webpack 5 + Babel 完整构建配置
- 📦 **组件化**: 高度模块化的组件设计
- 🎯 **开箱即用**: 无需额外配置，直接运行

## 🛠️ 技术栈

- **前端框架**: React 18.2.0
- **UI组件库**: Ant Design 5.2.0
- **路由管理**: React Router 6.8.0
- **样式方案**: CSS模块 + CSS-in-JS
- **构建工具**: Webpack 5 + Babel
- **开发服务器**: Webpack Dev Server (端口: 3001)

## 📁 项目结构

```
/
├── public/
│   └── index.html              # HTML模板
├── src/
│   ├── components/             # 公共组件
│   │   ├── NavigationBar/      # 侧边导航栏
│   │   ├── HeaderBar/          # 顶部导航栏
│   │   └── Breadcrumb/         # 面包屑导航
│   ├── pages/                  # 页面组件
│   │   ├── Login/              # 登录页面
│   │   └── Dashboard/          # 仪表板页面
│   ├── App.js                  # 主应用组件
│   ├── index.js                # 应用入口
│   └── index.css               # 全局样式
├── package.json                # 项目配置
├── webpack.config.js           # Webpack配置
└── README.md                   # 项目文档
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm start
# 或者
npm run dev
```

### 3. 访问应用

- 开发环境: http://localhost:3001
- 默认账号: `admin` / `123456`

### 4. 构建生产版本

```bash
npm run build
```

## 📋 功能特性

### 🔐 登录系统
- 用户名密码验证
- 图形验证码（可点击刷新）
- 响应式登录表单
- 演示账号提示

### 🏠 仪表板
- 数据统计卡片
- 用户列表表格
- 响应式布局
- 可扩展内容区

### 🧭 导航系统
- **侧边导航栏**:
  - 可折叠设计
  - 手风琴模式展开
  - 白色主题
  - 流畅动画效果
  - 图标居中对齐（折叠状态）
- **顶部导航栏**:
  - 用户信息展示
  - 下拉菜单
  - 折叠控制按钮
- **面包屑导航**:
  - 动态路径显示
  - 支持路由跳转
  - 图标配置

### 📱 响应式设计
- **桌面端** (≥1024px): 完整功能展示
- **平板端** (768px-1023px): 适配中等屏幕
- **移动端** (<768px): 移动优化布局

## 🎯 菜单结构

```
仪表板 (/dashboard)
系统设置
├── 用户列表 (/system/users)
├── 角色管理 (/system/roles)
└── 权限管理 (/system/permissions)
```

## 🔧 配置说明

### Webpack 配置要点

1. **CSS模块处理**: `.module.css` 文件启用CSS模块
2. **开发服务器**: 端口3001，避免3000端口冲突
3. **热重载**: 支持代码热更新
4. **路由支持**: 配置 `historyApiFallback` 支持SPA路由

### 样式设计原则

1. **空间利用最大化**: 内容区自适应屏幕宽度
2. **响应式边距**: 不同屏幕尺寸使用不同边距
3. **流畅动画**: 限制动画时间在0.2s内
4. **兼容性优先**: 尊重Ant Design原生行为

## 🐛 故障排除

### 常见问题及解决方案

1. **端口占用错误**
   ```bash
   Error: EADDRINUSE: address already in use :::3000
   ```
   **解决**: 项目已配置使用3001端口，无需处理

2. **CSS模块编译错误**
   ```bash
   Module parse failed: Unexpected token
   ```
   **解决**: 检查webpack.config.js中CSS模块规则配置

3. **依赖安装失败**
   ```bash
   npm ERR! peer dep missing
   ```
   **解决**: 删除node_modules和package-lock.json，重新安装
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **路由404错误**
   - **问题**: 刷新页面出现404
   - **解决**: webpack配置已包含 `historyApiFallback: true`

5. **导航栏显示异常**
   - **问题**: 菜单项跳动或图标不居中
   - **解决**: 检查CSS模块文件是否正确加载

## 🎨 自定义主题

项目使用Ant Design默认主题，如需自定义：

1. 安装主题定制工具
2. 修改webpack配置中的less-loader
3. 创建主题变量文件

## 📝 开发建议

1. **组件开发**: 遵循单一职责原则，保持组件简洁
2. **样式管理**: 优先使用CSS模块，避免全局样式污染
3. **状态管理**: 简单状态使用useState，复杂状态考虑Context
4. **性能优化**: 合理使用React.memo和useMemo
5. **代码规范**: 保持一致的代码风格和命名规范

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

---

**注意**: 这是一个基础框架，实际项目中请根据具体需求进行扩展和定制。
# IOT-DMS
