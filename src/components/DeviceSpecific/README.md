# 设备类型特定功能组件

## 概述

本目录包含针对不同设备类型的专用功能组件，实现了基于设备类型的动态功能扩展机制。每种设备类型都有其特定的技术特性和配置需求，通过专门的组件来提供相应的管理界面。

## 设计理念

### 1. 设备类型识别机制
- 在设备详情页面根据 `deviceType` 字段动态显示不同的功能模块
- 采用条件渲染的方式加载对应的设备特定组件
- 保持与主设备管理界面的一致性和集成性

### 2. 组件化架构
- 每种设备类型对应一个独立的组件目录
- 组件内部包含该设备类型的所有专用功能
- 通过统一的接口与主设备管理模块交互

### 3. 扩展性设计
- 新增设备类型时只需添加对应的组件
- 不影响现有设备类型的功能
- 支持设备类型功能的独立开发和维护

## 目录结构

```
src/components/DeviceSpecific/
├── README.md                    # 本说明文档
├── MeshRadio/                   # Mesh电台专用组件
│   ├── index.js                 # 主组件
│   ├── index.module.css         # 样式文件
│   └── components/              # 子组件（可选）
├── LiveVideoPlayer/             # 实时视频播放器组件
│   ├── index.js                 # 主组件
│   └── index.module.css         # 样式文件
├── RecordedVideoManager/        # 录像视频管理组件
│   ├── index.js                 # 主组件
│   └── index.module.css         # 样式文件
├── Sensor/                      # 传感器专用组件（待开发）
└── Gateway/                     # 网关设备专用组件（待开发）
```

## 已实现的设备类型

### 1. Mesh电台 (MeshRadio)

#### 功能特性
- **自组网拓扑图**：可视化展示Mesh网络中各节点的连接关系
- **设备参数设置**：频率、功率、网络ID、加密等参数配置
- **网络统计**：总节点数、在线节点、网络负载等统计信息
- **实时监控**：节点状态、信号强度、连接质量监控

#### 技术实现
- 使用 `@antv/G6` 图形库实现拓扑图可视化
- 采用 Tabs 组件分离网络拓扑和参数配置功能
- 支持参数的实时保存和验证
- 提供网络拓扑的交互操作（缩放、拖拽等）

#### 数据结构
```javascript
// Mesh电台参数
meshParameters: {
  frequency: '433.000',        // 工作频率 (MHz)
  power: 20,                   // 发射功率 (dBm)
  networkId: 'MESH001',        // 网络ID
  encryption: true,            // 数据加密开关
  encryptionKey: '',           // 加密密钥
  relayMode: true,             // 中继模式开关
  dataRate: '9600',            // 数据传输速率 (bps)
  channel: 1,                  // 信道
  bandwidth: '125',            // 带宽 (kHz)
  spreadingFactor: 7           // 扩频因子
}
```

#### 使用方式
```jsx
import MeshRadioManager from '../../../components/DeviceSpecific/MeshRadio';

// 在设备详情中使用
{currentDevice.deviceType === 'Mesh电台' && (
  <TabPane tab="Mesh网络管理" key="mesh">
    <MeshRadioManager 
      device={currentDevice}
      onParameterUpdate={handleMeshParameterUpdate}
    />
  </TabPane>
)}
```

### 2. 网络摄像头 (NetworkCamera)

#### 功能特性
- **实时视频播放**：支持多种视频质量切换(1080P/720P/480P/360P)
- **视频控制**：播放/暂停、音量控制、静音、全屏播放
- **实时截图**：一键截图并自动下载
- **视频录制**：支持实时录制功能
- **云台控制(PTZ)**：方向控制、变焦、聚焦、光圈调节
- **录像管理**：录像文件列表、播放、下载、删除
- **智能搜索**：按日期范围、录制类型筛选录像
- **批量操作**：支持批量删除录像文件

#### 技术实现
- 使用 HTML5 Video 元素实现视频播放
- 支持 RTMP、HLS 等多种视频流协议
- 采用 Tabs 组件分离实时视频和录像管理功能
- 使用 Progress 组件显示下载进度

#### 使用示例

```jsx
// 在设备详情页中集成
{device.deviceType === 'network_camera' && (
  <>
    <TabPane tab="实时视频" key="live-video">
      <LiveVideoPlayer device={device} />
    </TabPane>

    <TabPane tab="录像视频" key="recorded-video">
      <RecordedVideoManager device={device} />
    </TabPane>
  </>
)}
```

## 集成方式

### 1. 在设备管理主组件中集成

在 `src/pages/Device/Management/index.js` 中：

```jsx
// 导入设备特定组件
import MeshRadioManager from '../../../components/DeviceSpecific/MeshRadio';

// 在设备详情抽屉中添加条件渲染
{currentDevice.deviceType === 'Mesh电台' && (
  <TabPane tab="Mesh网络管理" key="mesh">
    <MeshRadioManager 
      device={currentDevice}
      onParameterUpdate={handleMeshParameterUpdate}
    />
  </TabPane>
)}
```

### 2. 参数更新处理

```jsx
// 处理设备特定参数的更新
const handleMeshParameterUpdate = async (updatedDevice) => {
  try {
    const response = await updateMeshParameters(updatedDevice.id, updatedDevice.meshParameters);
    if (response.success) {
      message.success('Mesh参数更新成功');
      setCurrentDevice(response.data);
      fetchData();
    }
  } catch (error) {
    message.error('Mesh参数更新失败');
  }
};
```

## 开发新设备类型组件

### 1. 创建组件目录

```bash
mkdir src/components/DeviceSpecific/[DeviceTypeName]
```

### 2. 组件基本结构

```jsx
import React, { useState, useEffect } from 'react';
import { Card, Tabs, Form, Button, message } from 'antd';
import styles from './index.module.css';

const DeviceTypeManager = ({ device, onParameterUpdate }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 组件初始化
  useEffect(() => {
    // 初始化设备特定数据
  }, [device]);

  // 参数保存处理
  const handleSaveParameters = async () => {
    try {
      const values = await form.validateFields();
      // 调用父组件的更新方法
      if (onParameterUpdate) {
        onParameterUpdate({
          ...device,
          specificParameters: values
        });
      }
      message.success('参数保存成功');
    } catch (error) {
      message.error('参数保存失败');
    }
  };

  return (
    <div className={styles.deviceTypeManager}>
      <Tabs defaultActiveKey="config">
        <TabPane tab="参数配置" key="config">
          {/* 设备特定的配置界面 */}
        </TabPane>
        <TabPane tab="状态监控" key="monitor">
          {/* 设备特定的监控界面 */}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default DeviceTypeManager;
```

### 3. 在主组件中集成

```jsx
// 导入新的设备类型组件
import DeviceTypeManager from '../../../components/DeviceSpecific/[DeviceTypeName]';

// 在设备详情中添加条件渲染
{currentDevice.deviceType === '[设备类型名称]' && (
  <TabPane tab="[功能名称]" key="[key]">
    <DeviceTypeManager 
      device={currentDevice}
      onParameterUpdate={handle[DeviceType]ParameterUpdate}
    />
  </TabPane>
)}
```

## 待开发的设备类型

### 1. 网络摄像头 (NetworkCamera)
- **视频流管理**：实时视频预览、录像回放
- **云台控制**：PTZ控制、预置位设置
- **图像参数**：亮度、对比度、饱和度调节
- **录像设置**：录像计划、存储配置

### 2. 传感器设备 (Sensor)
- **数据采集**：实时数据展示、历史数据查询
- **阈值设置**：告警阈值配置、通知设置
- **校准功能**：传感器校准、精度调整
- **数据导出**：数据报表、趋势分析

### 3. 网关设备 (Gateway)
- **子设备管理**：连接的子设备列表、状态监控
- **协议配置**：通信协议设置、数据转换
- **网络设置**：网络参数配置、连接管理
- **数据转发**：数据路由、转发规则

## 技术规范

### 1. 组件接口规范

```jsx
// 组件Props接口
interface DeviceSpecificProps {
  device: Device;                    // 设备信息对象
  onParameterUpdate?: (device: Device) => void;  // 参数更新回调
}
```

### 2. 样式规范

- 使用CSS Modules进行样式隔离
- 保持与主界面的设计风格一致
- 支持响应式设计
- 使用Ant Design的设计规范

### 3. 数据规范

- 设备特定参数存储在设备对象的专用字段中
- 参数更新通过统一的API接口进行
- 支持参数的验证和错误处理

## 最佳实践

### 1. 组件设计
- 保持组件的独立性和可复用性
- 使用清晰的接口定义
- 提供完善的错误处理

### 2. 用户体验
- 保持界面的一致性
- 提供及时的操作反馈
- 支持操作的撤销和重做

### 3. 性能优化
- 避免不必要的重新渲染
- 使用适当的数据缓存
- 优化大数据量的展示

---

**维护状态**: 持续开发中
**当前版本**: v1.1.0
**最后更新**: 2024-12-02
**新增功能**: 网络摄像头实时视频和录像管理功能
