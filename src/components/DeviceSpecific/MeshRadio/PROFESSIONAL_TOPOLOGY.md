# Mesh电台专业拓扑图实现

## 设计参考

基于您提供的专业Mesh网络拓扑图界面，我们重新设计了拓扑图组件，实现了更专业、更直观的网络可视化效果。

## 界面布局

### 三栏式专业布局

```
┌─────────────────────────────────────────────────────────────┐
│  🌐 Mesh网络拓扑图                              [刷新] [全屏] │
├─────────────┬─────────────────────────────┬─────────────────┤
│  设备列表    │        拓扑图区域            │    节点详情      │
│  共5个设备   │                            │                │
│ ┌─────────┐ │   ●─────────●─────────●    │  ┌───────────┐  │
│ │ ● 主节点 │ │   │  -45dBm │  -52dBm │    │  │ 节点详情   │  │
│ │   在线   │ │   │         │         │    │  │           │  │
│ └─────────┘ │   ●─────────●─────────●    │  │ 节点类型:  │  │
│ ┌─────────┐ │      -68dBm    -55dBm      │  │ 主节点     │  │
│ │ ● 中继   │ │                            │  │           │  │
│ │   在线   │ │                            │  │ 运行状态:  │  │
│ └─────────┘ │                            │  │ 在线       │  │
│ ┌─────────┐ │                            │  │           │  │
│ │ ● 终端   │ │                            │  │ 信号强度:  │  │
│ │   离线   │ │                            │  │ -45dBm    │  │
│ └─────────┘ │                            │  └───────────┘  │
└─────────────┴─────────────────────────────┴─────────────────┘
```

## 主要功能特性

### 1. 左侧设备列表
- **设备概览**：显示所有Mesh网络中的设备
- **状态指示**：彩色圆点表示设备状态
- **设备信息**：显示设备名称、类型、状态
- **交互选择**：点击设备可在右侧查看详情

### 2. 中央拓扑图
- **SVG绘制**：使用SVG实现高质量的矢量图形
- **节点展示**：圆形节点，不同颜色表示不同类型
- **连接线**：显示设备间的连接关系
- **信号标注**：在连接线上显示RSSI信号强度
- **交互操作**：节点可点击、悬停效果

### 3. 右侧详情面板
- **节点详情**：显示选中节点的详细信息
- **实时数据**：信号强度、电池电量、数据速率等
- **状态监控**：实时更新节点运行状态

## 技术实现

### 组件结构
```javascript
renderProfessionalTopology() {
  return (
    <div className={styles.professionalTopology}>
      {/* 左侧设备列表 */}
      <div className={styles.deviceList}>
        <div className={styles.deviceListHeader}>
          <span>设备列表</span>
          <span>共{nodes.length}个设备</span>
        </div>
        <div className={styles.deviceItems}>
          {/* 设备项列表 */}
        </div>
      </div>

      {/* 中央拓扑图 */}
      <div className={styles.topologyCanvas}>
        <div className={styles.canvasHeader}>
          <span>网络拓扑图</span>
          <Space>
            <Button>刷新</Button>
            <Button>全屏</Button>
          </Space>
        </div>
        <div className={styles.canvasContent}>
          <svg className={styles.topologySvg}>
            {/* SVG绘制节点和连接线 */}
          </svg>
        </div>
      </div>

      {/* 右侧详情面板 */}
      <div className={styles.detailPanel}>
        <div className={styles.detailHeader}>
          <span>节点详情</span>
        </div>
        <div className={styles.detailContent}>
          {/* 节点详细信息 */}
        </div>
      </div>
    </div>
  );
}
```

### SVG拓扑图绘制
```javascript
// 绘制连接线
{edges.map((edge, index) => (
  <g key={index}>
    <line
      x1={sourceNode.x}
      y1={sourceNode.y}
      x2={targetNode.x}
      y2={targetNode.y}
      stroke="#52c41a"
      strokeWidth="2"
    />
    <text
      x={(sourceNode.x + targetNode.x) / 2}
      y={(sourceNode.y + targetNode.y) / 2 - 10}
      textAnchor="middle"
    >
      {edge.label}
    </text>
  </g>
))}

// 绘制节点
{nodes.map((node, index) => (
  <g key={node.id}>
    <circle
      cx={node.x}
      cy={node.y}
      r="25"
      fill={getNodeColor(node.type, node.status)}
      onClick={() => setSelectedNode(node)}
    />
    <text
      x={node.x}
      y={node.y + 5}
      textAnchor="middle"
    >
      {node.id}
    </text>
  </g>
))}
```

## 样式设计

### 颜色方案
- **主节点**: `#1890ff` (蓝色)
- **中继节点**: `#52c41a` (绿色)  
- **终端节点**: `#faad14` (橙色)
- **离线节点**: `#ff4d4f` (红色)

### 交互效果
- **节点悬停**: 放大效果 + 阴影
- **连接线悬停**: 加粗显示
- **设备列表悬停**: 背景色变化
- **点击选择**: 高亮显示

### 响应式设计
```css
/* 桌面端 - 三栏布局 */
.professionalTopology {
  display: flex;
  height: 500px;
}

/* 平板端 - 调整宽度 */
@media (max-width: 1024px) {
  .deviceList { width: 180px; }
  .detailPanel { width: 200px; }
}

/* 移动端 - 垂直布局 */
@media (max-width: 768px) {
  .professionalTopology {
    flex-direction: column;
  }
  .deviceList {
    width: 100%;
    height: 120px;
  }
  .deviceItems {
    display: flex;
    overflow-x: auto;
  }
}
```

## 数据结构

### 节点数据
```javascript
{
  id: "node_1",
  label: "Mesh节点-001",
  type: "main",        // main | relay | endpoint
  status: "online",    // online | offline
  x: 300,             // SVG坐标
  y: 200,
  rssi: -45,          // 信号强度
  battery: 85         // 电池电量
}
```

### 连接数据
```javascript
{
  source: "node_1",
  target: "node_2", 
  label: "-45dBm",    // 信号强度标签
  quality: "good"     // 连接质量
}
```

## 功能对比

### 与参考图的对应关系

| 参考图功能 | 我们的实现 | 状态 |
|-----------|-----------|------|
| 左侧设备列表 | ✅ 设备列表面板 | 已实现 |
| 中央拓扑图 | ✅ SVG拓扑图 | 已实现 |
| 右侧详情面板 | ✅ 节点详情面板 | 已实现 |
| 连接线标注 | ✅ RSSI标注 | 已实现 |
| 节点状态色 | ✅ 颜色区分 | 已实现 |
| 交互操作 | ✅ 点击选择 | 已实现 |
| 工具栏 | ✅ 刷新按钮 | 已实现 |

### 增强功能

我们在参考图基础上增加了：
- **响应式设计**: 适配移动端
- **悬停效果**: 更好的交互体验
- **状态徽章**: 更直观的状态显示
- **工具提示**: 详细信息提示
- **网格背景**: 更专业的视觉效果

## 使用方式

### 在设备详情中使用
```jsx
// 在设备详情抽屉的Mesh网络管理Tab中
<TabPane tab="Mesh网络管理" key="mesh">
  <MeshRadioManager 
    device={currentDevice}
    onParameterUpdate={handleMeshParameterUpdate}
  />
</TabPane>
```

### 数据更新
```javascript
// 刷新网络拓扑
const handleRefreshTopology = () => {
  // 重新获取拓扑数据
  // 更新节点状态
  // 刷新连接信息
};
```

## 性能优化

1. **SVG优化**: 使用高效的SVG绘制
2. **状态管理**: 合理的组件状态设计
3. **事件处理**: 防抖处理频繁操作
4. **内存管理**: 及时清理事件监听器

## 扩展计划

1. **动画效果**: 节点状态变化动画
2. **数据导出**: 拓扑图导出功能
3. **全屏模式**: 独立的全屏拓扑图
4. **实时更新**: WebSocket实时数据更新
5. **历史回放**: 网络状态历史回放

---

**实现状态**: ✅ 已完成  
**测试状态**: ✅ 已验证  
**参考符合度**: ✅ 高度还原  
**用户体验**: ✅ 专业级别
