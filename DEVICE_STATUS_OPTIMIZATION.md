# 设备状态显示优化

## 功能概述

优化了设备管理模块中卡片视图和列表视图下的设备状态和连接状态显示效果，添加了醒目的图标、颜色和动画效果。

## 实现的功能

### 1. 设备状态美化

#### 在线状态
- **图标**：绿色圆形勾选图标 (CheckCircleOutlined)
- **颜色**：#52c41a (绿色)
- **文字**："在线"
- **动画**：呼吸效果 (2秒循环，透明度和缩放变化)

#### 离线状态
- **图标**：灰色圆形关闭图标 (CloseCircleOutlined)
- **颜色**：#8c8c8c (灰色)
- **文字**："离线"
- **动画**：无

#### 告警状态
- **图标**：橙色感叹号图标 (ExclamationCircleOutlined)
- **颜色**：#faad14 (橙色)
- **文字**："告警"
- **动画**：闪烁效果 (1.5秒循环，透明度变化)

#### 维护状态
- **图标**：紫色设置图标 (SettingOutlined)
- **颜色**：#722ed1 (紫色)
- **文字**："维护中"
- **动画**：无

### 2. 连接状态美化

#### 已连接
- **图标**：绿色WiFi图标 (WifiOutlined)
- **颜色**：#52c41a (绿色)
- **文字**："已连接"
- **动画**：无

#### 未连接
- **图标**：灰色断开连接图标 (DisconnectOutlined)
- **颜色**：#8c8c8c (灰色)
- **文字**："未连接"
- **动画**：无

#### 连接中
- **图标**：蓝色加载图标 (LoadingOutlined)
- **颜色**：#1890ff (蓝色)
- **文字**："连接中"
- **动画**：旋转效果 (1秒循环)

### 3. 技术实现

#### 自定义组件
```javascript
// 设备状态显示组件
const DeviceStatusDisplay = ({ status, size = 'default' }) => {
  // 根据状态返回对应的图标、颜色和样式
};

// 连接状态显示组件
const ConnectionStatusDisplay = ({ status, size = 'default' }) => {
  // 根据连接状态返回对应的图标、颜色和样式
};
```

#### CSS动画效果
```css
/* 在线状态呼吸动画 */
@keyframes breathe {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
}

/* 告警状态闪烁动画 */
@keyframes blink {
  0%, 50%, 100% { opacity: 1; }
  25%, 75% { opacity: 0.3; }
}

/* 连接中旋转动画 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### 4. 响应式设计

#### 默认尺寸 (列表视图)
- 图标大小：14px
- 字体大小：继承父元素
- 间距：6px

#### 小尺寸 (卡片视图)
- 图标大小：12px
- 字体大小：11px
- 间距：4px

### 5. 视觉效果

#### 列表视图状态显示
```
✅ 在线    📶 已连接
❌ 离线    📶 未连接
⚠️ 告警    🔄 连接中
🔧 维护中
```

#### 卡片视图状态显示
- 底部左侧：设备状态
- 底部右侧：连接状态
- 图标和文字对齐
- 动画效果保持一致

### 6. 动画效果说明

#### 呼吸动画 (在线状态)
- 持续时间：2秒
- 效果：图标轻微放大缩小，透明度变化
- 目的：吸引注意力，表示设备活跃

#### 闪烁动画 (告警状态)
- 持续时间：1.5秒
- 效果：透明度快速变化
- 目的：警示用户注意异常状态

#### 旋转动画 (连接中状态)
- 持续时间：1秒
- 效果：图标360度旋转
- 目的：表示正在进行的操作

### 7. 兼容性

- 支持列表视图和卡片视图
- 响应式设计，适配不同屏幕尺寸
- 保持与整体设计风格的协调性
- 动画性能优化，不影响页面流畅度

## 使用方式

### 在列表视图中
```javascript
{
  title: '状态',
  render: (status) => (
    <DeviceStatusDisplay status={status} size="default" />
  )
}
```

### 在卡片视图中
```javascript
<div className={styles.deviceCardFooter}>
  <DeviceStatusDisplay status={device.status} size="small" />
  <ConnectionStatusDisplay status={device.connectionStatus} size="small" />
</div>
```

## 总结

通过自定义状态显示组件和CSS动画效果，成功提升了设备状态的视觉表现力，使用户能够更直观地了解设备的运行状态和连接情况，提升了整体用户体验。
