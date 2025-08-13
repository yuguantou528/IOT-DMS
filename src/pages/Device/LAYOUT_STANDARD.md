# 设备管理模块标准布局规范

## 概述

本文档定义了设备管理系统中所有模块的标准布局模式，确保整个系统的界面一致性和用户体验统一性。

## 标准布局模式

### 双Card布局结构

所有管理模块都应采用以下标准布局：

```
┌─────────────────────────────────────────────────────────┐
│  🔍 搜索筛选                                              │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ [搜索框] [筛选1] [筛选2] [筛选3] [搜索] [重置]        │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                        ↓ 20px 间距
┌─────────────────────────────────────────────────────────┐
│  📋 数据列表                    [新增] [导出] [其他操作]   │
│  ┌─────────────────────────────────────────────────────┐ │
│  │                   数据表格                           │ │
│  │                   分页组件                           │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 布局规范详情

### 1. 搜索区域Card

#### 功能定位
- 专门用于数据筛选和搜索功能
- 不包含数据操作按钮

#### 标题规范
- 标题：`🔍 搜索筛选`
- 图标：`SearchOutlined`
- 背景：渐变背景色

#### 按钮规范
- **保留按钮**：搜索、重置
- **移除按钮**：新增、导出、批量操作等

#### 布局结构
```jsx
<Card 
  className={styles.searchCard}
  title={
    <span className={styles.cardTitle}>
      <SearchOutlined style={{ marginRight: 8 }} />
      搜索筛选
    </span>
  }
  size="small"
>
  <Row gutter={16}>
    <Col span={5}>[搜索框]</Col>
    <Col span={4}>[筛选1]</Col>
    <Col span={4}>[筛选2]</Col>
    <Col span={3}>[筛选3]</Col>
    <Col span={8}>
      <Space>
        <Button type="primary" icon={<SearchOutlined />}>搜索</Button>
        <Button icon={<ReloadOutlined />}>重置</Button>
      </Space>
    </Col>
  </Row>
</Card>
```

### 2. 列表区域Card

#### 功能定位
- 专门用于数据展示和操作
- 包含所有数据相关的操作按钮

#### 标题规范
- 标题：`📋 [模块名称]列表`
- 图标：`AppstoreOutlined`
- 背景：纯白背景

#### 操作按钮规范
- **位置**：Card标题栏右侧（extra属性）
- **必备按钮**：新增、导出
- **可选按钮**：批量删除、批量导入等

#### 布局结构
```jsx
<Card 
  className={styles.tableCard}
  title={
    <span className={styles.cardTitle}>
      <AppstoreOutlined style={{ marginRight: 8 }} />
      [模块名称]列表
    </span>
  }
  extra={
    <Space>
      <Button type="primary" icon={<PlusOutlined />}>新增[模块名称]</Button>
      <Button icon={<ExportOutlined />}>导出</Button>
    </Space>
  }
  size="small"
>
  <Table ... />
</Card>
```

## 样式规范

### CSS类名规范

```css
/* 容器样式 */
.container {
  padding: 24px;
  background: #f0f2f5;
  min-height: calc(100vh - 112px);
}

/* 搜索区域卡片 */
.searchCard {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  border: 1px solid #e8e8e8;
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
  transition: all 0.3s ease;
}

/* 列表区域卡片 */
.tableCard {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #d9d9d9;
  background: #fff;
  transition: all 0.3s ease;
}

/* 卡片标题样式 */
.cardTitle {
  font-weight: 600;
  color: #262626;
  font-size: 16px;
}

/* Card标题栏extra区域样式 */
:global(.ant-card-head-extra) {
  padding: 0;
}

:global(.ant-card-head-extra .ant-space) {
  gap: 8px !important;
}

:global(.ant-card-head-extra .ant-btn) {
  height: 32px;
  font-size: 14px;
}
```

### 响应式设计

```css
@media (max-width: 768px) {
  /* 移动端Card标题栏响应式 */
  :global(.ant-card-head) {
    flex-direction: column;
    align-items: flex-start !important;
  }
  
  :global(.ant-card-head-title) {
    margin-bottom: 8px;
  }
  
  :global(.ant-card-head-extra) {
    width: 100%;
    margin-left: 0 !important;
  }
  
  :global(.ant-card-head-extra .ant-space) {
    width: 100%;
    justify-content: center;
  }
}
```

## 已应用模块

### ✅ 设备厂商管理
- 文件路径：`src/pages/Device/Manufacturer/`
- 应用状态：已完成
- 特点：新增厂商、导出功能移至列表区域标题栏

### ✅ 设备型号管理
- 文件路径：`src/pages/Device/Model/`
- 应用状态：已完成
- 特点：新增型号、导出功能移至列表区域标题栏

## 待应用模块

### 🔄 产品管理
- 文件路径：`src/pages/Device/Product/`
- 预期功能：新增产品、导出产品、批量操作

### 🔄 设备管理
- 文件路径：`src/pages/Device/Management/`
- 预期功能：新增设备、导出设备、批量导入

### 🔄 物模型管理
- 文件路径：`src/pages/Device/ThingModel/`
- 预期功能：新增模型、导出模型、模型验证

## 实现指南

### 1. 新建模块时

```jsx
// 1. 导入必要的组件和图标
import { SearchOutlined, AppstoreOutlined, PlusOutlined, ExportOutlined } from '@ant-design/icons';

// 2. 使用标准布局结构
const ModuleName = () => {
  return (
    <div className={styles.container}>
      {/* 搜索区域 */}
      <Card className={styles.searchCard} title={...}>
        {/* 只包含搜索和筛选功能 */}
      </Card>
      
      {/* 列表区域 */}
      <Card className={styles.tableCard} title={...} extra={...}>
        {/* 包含数据表格和操作功能 */}
      </Card>
    </div>
  );
};
```

### 2. 改造现有模块时

1. **移动操作按钮**：将新增、导出等按钮从搜索区域移至列表区域
2. **更新Card属性**：为列表区域Card添加extra属性
3. **调整样式**：应用标准CSS样式
4. **测试响应式**：确保移动端显示正常

## 优势分析

### 用户体验
- ✅ **功能分离明确**：搜索功能与操作功能分离
- ✅ **视觉层次清晰**：不同功能区域有明显的视觉区分
- ✅ **操作流程顺畅**：符合用户"搜索→查看→操作"的使用习惯

### 界面一致性
- ✅ **统一的布局模式**：所有模块采用相同的布局结构
- ✅ **一致的交互方式**：相同的按钮位置和操作逻辑
- ✅ **标准化的样式**：统一的颜色、间距、字体规范

### 开发效率
- ✅ **可复用的组件**：标准化的布局可以快速复制
- ✅ **清晰的规范**：减少设计决策时间
- ✅ **易于维护**：统一的代码结构便于维护

## 注意事项

1. **按钮数量控制**：标题栏右侧按钮不宜过多，建议不超过3个
2. **移动端适配**：确保小屏幕下按钮布局合理
3. **权限控制**：根据用户权限动态显示操作按钮
4. **国际化支持**：按钮文本支持多语言切换

---

**制定时间**: 2024-01-21  
**适用范围**: 设备管理系统所有模块  
**维护状态**: 持续更新
