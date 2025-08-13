# 地图选点组件 (MapPicker)

## 功能概述

地图选点组件是一个支持点击选择坐标的地图组件，用于设备位置选择。支持手动输入经纬度、地图点击选点、标记拖拽和GPS定位等功能。

## 主要功能

### 1. 地图交互
- **点击选点**：用户可以在地图上点击任意位置设置设备位置
- **标记拖拽**：支持拖拽地图标记调整精确位置
- **地图缩放**：支持地图缩放和平移操作

### 2. 坐标输入
- **手动输入**：支持手动输入经纬度坐标
- **实时验证**：经纬度输入时进行格式验证
- **双向同步**：手动输入和地图选点数据双向同步

### 3. 定位功能
- **GPS定位**：支持获取用户当前位置
- **权限处理**：处理浏览器定位权限相关问题

## 组件属性

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| visible | boolean | 是 | false | 控制组件显示/隐藏 |
| onCancel | function | 是 | - | 取消选择的回调函数 |
| onConfirm | function | 是 | - | 确认选择的回调函数 |
| initialPosition | object | 否 | {longitude: 116.397428, latitude: 39.90923} | 初始位置坐标 |

## 使用示例

```jsx
import MapPicker from '../../../components/MapPicker';

const [isMapPickerVisible, setIsMapPickerVisible] = useState(false);
const [selectedPosition, setSelectedPosition] = useState({ 
  longitude: 116.397428, 
  latitude: 39.90923 
});

// 地图选点确认
const handleMapConfirm = (position) => {
  setSelectedPosition(position);
  form.setFieldsValue({
    longitude: position.longitude,
    latitude: position.latitude
  });
  setIsMapPickerVisible(false);
  message.success('位置选择成功');
};

// 打开地图选择器
const handleOpenMapPicker = () => {
  setIsMapPickerVisible(true);
};

// 组件使用
<MapPicker
  visible={isMapPickerVisible}
  onCancel={() => setIsMapPickerVisible(false)}
  onConfirm={handleMapConfirm}
  initialPosition={selectedPosition}
/>
```

## 技术实现

### 地图服务
- 使用高德地图API (AMap)
- 需要在 public/index.html 中引入地图API
- 支持地图点击、标记拖拽等交互功能

### 坐标验证
- 经度范围：-180 到 180
- 纬度范围：-90 到 90
- 实时验证输入格式

### 响应式设计
- 支持桌面端和移动端
- 自适应不同屏幕尺寸

## 注意事项

1. **地图API密钥**：需要在 public/index.html 中配置正确的高德地图API密钥
2. **网络连接**：需要确保网络连接正常，能够加载地图服务
3. **浏览器兼容性**：GPS定位功能需要浏览器支持 Geolocation API
4. **HTTPS要求**：GPS定位功能在生产环境中需要HTTPS协议

## 样式定制

组件使用CSS Modules进行样式管理，主要样式类：

- `.mapPickerModal`：模态框样式
- `.mapPickerContainer`：容器样式
- `.coordinateInput`：坐标输入区域样式
- `.mapContainer`：地图容器样式
- `.mapTips`：操作提示样式

## 扩展功能

### 已实现功能
- ✅ 地图点击选点
- ✅ 标记拖拽
- ✅ 手动输入坐标
- ✅ GPS定位
- ✅ 坐标验证
- ✅ 响应式设计

### 计划功能
- 🔄 地址搜索功能
- 🔄 多点选择支持
- 🔄 地图样式切换
- 🔄 离线地图支持
- 🔄 轨迹绘制功能

## 更新日志

### v1.0.0 (2024-01-21)
- 初始版本发布
- 实现基础的地图选点功能
- 添加坐标输入和验证
- 实现GPS定位功能
- 添加响应式设计

---

**开发状态**: 基础版本完成  
**下一步**: 添加地址搜索和多点选择功能  
**维护者**: 开发团队
