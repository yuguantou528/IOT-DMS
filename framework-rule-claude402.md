# React B端管理系统基础框架

请帮我在当前工作目录下使用React创建一个完整的响应式的B端管理系统基础框架。

## 项目初始化要求

- 在当前文件夹内直接创建所有必要的项目文件和文件夹结构
- 不需要使用create-react-app，直接提供完整的文件结构
- 包含package.json和所有依赖配置

## 技术栈规范

- **React版本**: React 18 + 函数组件 + Hooks
- **UI组件库**: Ant Design 5.x
- **路由管理**: React Router 6.x
- **样式方案**: CSS模块 + CSS-in-JS (styled-components)
- **构建工具**: Webpack 5 + Babel
- **响应式设计**: 适配桌面端和移动端
- **组件通信**: 通过props进行数据传递

## 构建配置要求

### Webpack配置注意事项
- CSS模块配置：`.module.css`文件需要单独配置loader规则
- CSS模块规则必须在普通CSS规则之前定义
- 开发服务器端口设置为3001（避免3000端口冲突）
- 启用热重载和历史API回退

### package.json脚本配置
- `start`: 启动开发服务器，不自动打开浏览器
- `build`: 构建生产版本
- `dev`: 开发模式别名

## 文件组织结构

```
/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── NavigationBar/
│   │   │   ├── index.js
│   │   │   └── index.module.css
│   │   ├── HeaderBar/
│   │   │   ├── index.js
│   │   │   └── index.module.css
│   │   └── Breadcrumb/
│   │       ├── index.js
│   │       └── index.module.css
│   ├── pages/
│   │   ├── Login/
│   │   │   ├── index.js
│   │   │   └── index.module.css
│   │   └── Dashboard/
│   │       ├── index.js
│   │       └── index.module.css
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
├── webpack.config.js
└── README.md
```

## 页面功能设计

### 1. 登录页面 (Login)
- **表单组件**: 用户名、密码输入框
- **验证码**: 可点击刷新的图形验证码组件
- **示例信息**: 显示演示账号密码提示 (admin/123456)
- **响应式**: 移动端友好的布局设计
- **登录逻辑**: 基础的表单验证和路由跳转

### 2. 首页仪表板 (Dashboard)
- **顶部导航栏**: 可折叠侧边导航栏
- **标题栏**: 包含用户信息和操作按钮
- **面包屑导航**: 位于内容区左上方
- **主内容区**: 可扩展的内容展示区域
- **自适应布局**: 内容区充分利用屏幕空间，支持表格和列表的最大化显示

## 组件设计要求

### NavigationBar 组件
- 可折叠的侧边导航栏（白色背景主题）
- 支持多级菜单结构（手风琴模式展开）
- 移动端适配（抽屉式）
- 菜单项图标和文字（折叠状态下图标居中对齐）
- 流畅的切换动画（避免卡顿效果）
- **菜单结构规范**：
  - 一级菜单：仪表板、系统设置
  - 系统设置子菜单：用户列表、角色管理、权限管理
  - 一级菜单显示图标，二级菜单不显示图标
  - 系统设置相关路由统一使用 `/system/` 前缀

### HeaderBar 组件
- 固定在页面顶部
- 包含用户头像、姓名、退出按钮
- 折叠按钮控制侧边栏
- 响应式布局

### Breadcrumb 组件
- 动态面包屑导航
- 支持路由跳转
- 可配置分隔符

## 路由配置

- `/login` - 登录页面
- `/dashboard` - 首页仪表板
- `/system/users` - 用户列表页面
- `/system/roles` - 角色管理页面
- `/system/permissions` - 权限管理页面
- 登录状态验证和重定向逻辑

## 菜单结构配置

### 标准菜单结构
```javascript
const menuItems = [
  {
    key: 'dashboard',
    icon: <DashboardOutlined />,
    label: '仪表板',
    path: '/dashboard'
  },
  {
    key: 'system',
    icon: <SettingOutlined />,
    label: '系统设置',
    children: [
      {
        key: 'user-list',
        label: '用户列表',
        path: '/system/users'
      },
      {
        key: 'role-management',
        label: '角色管理',
        path: '/system/roles'
      },
      {
        key: 'permission-management',
        label: '权限管理',
        path: '/system/permissions'
      }
    ]
  }
];
```

### 菜单配置原则
- **简洁性**：避免菜单层级过深，保持结构清晰
- **一致性**：相关功能统一路由前缀（如系统设置使用 `/system/`）
- **可扩展性**：预留扩展空间，便于后续功能添加
- **用户体验**：常用功能放在一级菜单，减少点击层级

## 响应式断点

- **桌面端**: >= 1024px
- **平板端**: 768px - 1023px
- **移动端**: < 768px

## 关键技术实现细节

### Webpack配置文件要求
- CSS模块处理：`.module.css`文件使用modules选项
- CSS加载顺序：模块CSS规则在前，普通CSS规则在后，使用exclude排除模块文件
- 开发服务器配置：端口3001，启用热重载，historyApiFallback支持SPA路由
- Babel配置：支持React JSX和ES6+语法

### 布局设计要求
- **内容区自适应**：移除max-width限制，让内容区占满剩余屏幕空间
- **空间利用最大化**：表格和列表能随屏幕缩放自动调整，减少滚动条使用
- **合理的边距**：桌面端16px，平板端14px，移动端12px的左右padding
- **响应式优化**：不同屏幕尺寸下都能充分利用可用空间

### 导航栏设计规范
- **白色主题**：使用白色背景，现代化设计风格
- **手风琴模式**：一级菜单展开时自动关闭其他已展开菜单
- **图标居中对齐**：折叠状态下所有图标完美居中显示
- **流畅动画**：避免过度动画效果，确保切换流畅无卡顿
- **兼容性优先**：尊重Ant Design原生行为，避免过度CSS覆盖
- **菜单图标规范**：一级菜单显示图标，二级菜单不显示图标，保持界面简洁

### 依赖版本要求
- React 18.2.0+
- Ant Design 5.2.0+
- React Router DOM 6.8.0+
- Webpack 5.75.0+
- 确保所有依赖版本兼容

### 常见问题解决方案
1. **端口冲突**：默认使用3001端口，避免3000端口占用
2. **CSS模块错误**：确保webpack配置中CSS模块规则正确排序
3. **路由问题**：配置historyApiFallback支持SPA路由
4. **编译错误**：检查Babel预设配置是否正确
5. **导航栏跳动**：避免使用transform位移动画，只使用颜色过渡
6. **图标对齐问题**：使用calc()计算居中padding，避免复杂flex覆盖
7. **动画卡顿**：限制过渡时间在0.2s以内，避免复杂渐变效果
8. **样式冲突**：尊重Ant Design原生行为，避免过度使用!important

## 交付要求

请提供完整的代码实现，包括：
1. 所有必要的项目文件（包含正确的webpack.config.js）
2. 完整的样式设计（重点：实现内容区自适应布局）
3. 基础的交互功能（重点：导航栏手风琴模式和流畅动画）
4. **标准菜单结构**（重点：仪表板+系统设置的简洁菜单结构）
5. 详细的安装和运行说明
6. 错误处理和常见问题解决方案
7. 空间利用最大化的布局设计（表格和列表能随屏幕缩放）
8. 现代化的白色导航栏设计（避免跳动和卡顿问题）
9. **菜单图标规范**（一级菜单显示图标，二级菜单不显示图标）

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm start
```

### 3. 访问应用
- 开发环境: http://localhost:3001
- 默认账号: admin / 123456

## 故障排除

### 常见错误及解决方案

1. **端口占用错误 (EADDRINUSE)**
   - 问题：3000端口被占用
   - 解决：webpack.config.js中设置port: 3001

2. **CSS模块编译错误**
   - 问题：CSS模块文件编译失败
   - 解决：确保webpack配置中CSS模块规则在普通CSS规则之前

3. **依赖安装失败**
   - 问题：npm install报错
   - 解决：清除node_modules和package-lock.json，重新安装

4. **路由404错误**
   - 问题：刷新页面出现404
   - 解决：webpack devServer配置historyApiFallback: true

5. **导航栏菜单跳动**
   - 问题：鼠标悬停时菜单项位移造成跳动
   - 解决：移除transform: translateX()，只使用背景色过渡

6. **折叠状态图标不居中**
   - 问题：图标左右位置不一致，显示异常
   - 解决：使用padding: 0 calc(50% - 14px)智能居中

7. **导航栏切换卡顿**
   - 问题：展开/折叠时动画过多导致卡顿
   - 解决：简化动画，只动画必要属性，时间控制在0.2s内

8. **Ant Design样式冲突**
   - 问题：过度CSS覆盖导致显示异常
   - 解决：尊重组件原生行为，避免复杂的!important覆盖

### 面包屑导航路由映射配置示例
```javascript
const routeMap = {
  '/dashboard': { title: '仪表板', icon: <HomeOutlined /> },
  '/system/users': { title: '用户列表', parent: '/dashboard' },
  '/system/roles': { title: '角色管理', parent: '/dashboard' },
  '/system/permissions': { title: '权限管理', parent: '/dashboard' }
};
```

### 正确的webpack.config.js配置示例
```javascript
// CSS模块规则必须在前面
{
  test: /\.module\.css$/,
  use: [
    'style-loader',
    {
      loader: 'css-loader',
      options: { modules: true }
    }
  ]
},
// 普通CSS规则在后面，排除模块文件
{
  test: /\.css$/,
  exclude: /\.module\.css$/,
  use: ['style-loader', 'css-loader']
}
```

### 内容区布局CSS配置示例
```css
.contentInner {
  padding: 0 16px 24px;
  /* 重要：不要设置max-width和margin: 0 auto */
  /* 让内容区占满剩余空间，实现自适应布局 */
}

/* 响应式边距设置 */
@media (max-width: 767px) {
  .contentInner {
    padding: 0 12px 16px; /* 移动端 */
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .contentInner {
    padding: 0 14px 20px; /* 平板端 */
  }
}
```

### 导航栏CSS最佳实践
```css
/* 侧边栏 - 白色主题，简洁动画 */
.sidebar {
  background: #fff;
  transition: width 0.2s ease; /* 只动画宽度，避免卡顿 */
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

/* 菜单项 - 避免跳动效果 */
:global(.ant-menu-light .ant-menu-item) {
  transition: background-color 0.2s ease; /* 只动画背景色 */
  /* 避免使用 transform: translateX() */
}

/* 折叠状态图标居中 */
:global(.ant-menu-inline-collapsed .ant-menu-item) {
  padding: 0 calc(50% - 14px); /* 智能计算居中 */
  text-align: center;
}

/* 手风琴模式实现 */
const handleOpenChange = (keys) => {
  const latestOpenKey = keys.find(key => openKeys.indexOf(key) === -1);
  const rootSubmenuKeys = menuItems.filter(item => item.children).map(item => item.key);

  if (rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
    setOpenKeys(keys);
  } else {
    setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
  }
};
```
