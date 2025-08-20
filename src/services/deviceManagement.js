// 设备管理API服务
import { getManufacturerList } from './deviceManufacturer';
import { getDeviceModelList } from './deviceModel';

// 模拟数据
let deviceData = [
  {
    id: 1,
    name: '海康威视摄像头-001',
    deviceCode: 'HK-CAM-001',
    serialNumber: 'HK20240115001',
    manufacturerId: 3,
    manufacturerName: '海康威视数字技术股份有限公司',
    modelId: 1,
    modelName: 'IPC-HFW4431R-Z',
    deviceType: 'network_camera',
    location: '大门入口',
    ipAddress: '192.168.1.101',
    port: 8000,
    username: 'admin',
    password: 'admin123',
    status: 'online',
    connectionStatus: 'connected',
    lastOnlineTime: '2024-01-21 14:30:00',
    installDate: '2024-01-15',
    warrantyExpiry: '2027-01-15',
    description: '大门入口监控摄像头，负责进出人员监控',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-21 14:30:00',
    // 预设产品关联信息（用于测试）
    productId: 3,
    productName: '智能视频监控产品',
    productCode: 'PROD_VIDEO_001'
  },
  {
    id: 2,
    name: '小米智能摄像机-002',
    deviceCode: 'MI-CAM-002',
    serialNumber: 'MI20240116001',
    manufacturerId: 2,
    manufacturerName: '小米科技有限责任公司',
    modelId: 3, // 修正为正确的型号ID（Mi Smart Camera 2K）
    modelName: 'Mi Smart Camera 2K',
    deviceType: 'network_camera',
    location: '客厅',
    ipAddress: '192.168.1.102',
    port: 8080,
    username: 'admin',
    password: 'xiaomi123',
    status: 'online',
    connectionStatus: 'connected',
    lastOnlineTime: '2024-01-21 14:25:00',
    installDate: '2024-01-16',
    warrantyExpiry: '2026-01-16',
    description: '客厅智能监控摄像机，支持AI人形检测',
    createTime: '2024-01-16 09:15:00',
    updateTime: '2024-01-21 14:25:00'
  },
  {
    id: 3,
    name: '大华摄像头-003',
    deviceCode: 'DH-CAM-003',
    serialNumber: 'DH20240110001',
    manufacturerId: 4,
    manufacturerName: '大华技术股份有限公司',
    modelId: 4, // 修正为正确的型号ID（DH-IPC-HFW2431S-S）
    modelName: 'DH-IPC-HFW2431S-S',
    deviceType: 'network_camera',
    location: '停车场',
    ipAddress: '192.168.1.103',
    port: 37777,
    username: 'admin',
    password: 'dahua123',
    status: 'offline',
    connectionStatus: 'disconnected',
    lastOnlineTime: '2024-01-20 18:30:00',
    installDate: '2024-01-10',
    warrantyExpiry: '2027-01-10',
    description: '停车场监控摄像头，负责车辆进出监控',
    createTime: '2024-01-10 11:20:00',
    updateTime: '2024-01-20 18:30:00'
  },
  {
    id: 4,
    name: '中兴路由器-004',
    deviceCode: 'ZTE-ROUTER-004',
    serialNumber: 'ZTE20240108001',
    manufacturerId: 5,
    manufacturerName: '中兴通讯股份有限公司',
    modelId: 5,
    modelName: 'ZTE MF971R',
    deviceType: 'gateway',
    location: '机房',
    ipAddress: '192.168.1.1',
    port: 80,
    username: 'admin',
    password: 'zte123',
    status: 'maintenance',
    connectionStatus: 'connected',
    lastOnlineTime: '2024-01-21 10:00:00',
    installDate: '2024-01-08',
    warrantyExpiry: '2026-01-08',
    description: '机房4G路由器，提供备用网络连接',
    createTime: '2024-01-08 16:45:00',
    updateTime: '2024-01-21 10:00:00'
  },
  {
    id: 5,
    name: 'Mesh电台-005',
    deviceCode: 'MESH-RADIO-005',
    serialNumber: 'MESH20240120001',
    manufacturerId: 1,
    manufacturerName: '华为技术有限公司',
    modelId: 6,
    modelName: 'HW-MESH-433',
    deviceType: 'mesh_radio',
    productId: 1, // 关联到智能Mesh通信产品
    productName: '智能Mesh通信产品',
    productCode: 'PROD_MESH_001',
    location: '基站A',
    ipAddress: '192.168.1.105',
    port: 8080,
    username: 'admin',
    password: 'mesh123',
    status: 'online',
    connectionStatus: 'connected',
    lastOnlineTime: '2024-01-21 15:30:00',
    installDate: '2024-01-20',
    warrantyExpiry: '2027-01-20',
    description: 'Mesh自组网电台，支持多跳中继通信',
    meshParameters: {
      frequency: '433.000',
      power: 20,
      networkId: 'MESH001',
      encryption: true,
      encryptionKey: 'mesh2024key',
      relayMode: true,
      dataRate: '9600',
      channel: 1,
      bandwidth: '125',
      spreadingFactor: 7
    },
    createTime: '2024-01-20 09:30:00',
    updateTime: '2024-01-21 15:30:00'
  },
  {
    id: 6,
    name: 'Mesh电台-006',
    deviceCode: 'MESH-RADIO-006',
    serialNumber: 'MESH20240120002',
    manufacturerId: 1,
    manufacturerName: '华为技术有限公司',
    modelId: 6,
    modelName: 'HW-MESH-433',
    deviceType: 'mesh_radio',
    productId: 1, // 关联到智能Mesh通信产品
    productName: '智能Mesh通信产品',
    productCode: 'PROD_MESH_001',
    location: '基站B',
    ipAddress: '192.168.1.106',
    port: 8080,
    username: 'admin',
    password: 'mesh123',
    status: 'online',
    connectionStatus: 'connected',
    lastOnlineTime: '2024-01-21 15:25:00',
    installDate: '2024-01-20',
    warrantyExpiry: '2027-01-20',
    description: 'Mesh自组网电台，作为中继节点',
    meshParameters: {
      frequency: '433.000',
      power: 17,
      networkId: 'MESH001',
      encryption: true,
      encryptionKey: 'mesh2024key',
      relayMode: true,
      dataRate: '9600',
      channel: 1,
      bandwidth: '125',
      spreadingFactor: 7
    },
    createTime: '2024-01-20 10:15:00',
    updateTime: '2024-01-21 15:25:00'
  }
];

// 设备状态选项
export const deviceStatuses = [
  { value: 'online', label: '在线', color: 'green' },
  { value: 'offline', label: '离线', color: 'red' },
  { value: 'fault', label: '故障', color: 'red' }
];

// 连接状态选项
export const connectionStatuses = [
  { value: 'connected', label: '已连接', color: 'green' },
  { value: 'disconnected', label: '未连接', color: 'red' },
  { value: 'connecting', label: '连接中', color: 'blue' },
  { value: 'timeout', label: '连接超时', color: 'orange' }
];

// 设备类型选项（与产品管理保持一致）
export const deviceTypes = [
  { value: 'mesh_radio', label: 'Mesh电台' },
  { value: '370m_base_station', label: '370M基站' },
  { value: 'satellite_communication', label: '卫星通信' },
  { value: 'network_camera', label: '网络摄像头' },
  { value: 'video_surveillance', label: '视频监控' },
  { value: 'sensor', label: '对讲机' },
  { value: 'gateway', label: '网关设备' },
  { value: 'other', label: '其他设备' }
];

// 设备类型值到标签的映射
export const deviceTypeMap = deviceTypes.reduce((map, type) => {
  map[type.value] = type.label;
  return map;
}, {});

// 设备类型标签到值的映射（用于向后兼容）
export const deviceTypeLabelMap = {
  'Mesh电台': 'mesh_radio',
  '370M基站': '370m_base_station',
  '卫星通信': 'satellite_communication',
  '网络摄像头': 'network_camera',
  '智能摄像头': 'network_camera',
  '红外摄像头': 'network_camera',
  '球机摄像头': 'network_camera',
  '视频监控': 'video_surveillance',
  '数字对讲机': 'sensor',
  '模拟对讲机': 'sensor',
  '手持对讲机': 'sensor',
  '车载对讲机': 'sensor',
  '4G路由器': 'gateway',
  '网关设备': 'gateway',
  '交换机': 'gateway',
  '硬盘录像机': 'other',
  '显示器': 'other',
  '其他设备': 'other'
};

// 模拟API延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 初始化设备数据，确保所有设备都有deviceTypeName字段
const initializeDeviceData = () => {
  deviceData = deviceData.map(device => {
    // 将"维护中"或"已禁用"状态的设备改为"故障"状态
    let status = device.status;
    if (status === 'maintenance' || status === 'disabled') {
      status = 'fault';
    }

    return {
    ...device,
      status,
      deviceTypeName: device.deviceTypeName || deviceTypeMap[device.deviceType] || device.deviceType,
      // 初始化产品关联字段
      productId: device.productId || null,
      productName: device.productName || null,
      productCode: device.productCode || null
    };
  });
};

// 初始化数据
initializeDeviceData();

// 转换设备类型标签为统一值格式
const normalizeDeviceType = (deviceType) => {
  // 如果已经是内部值格式，直接返回
  if (Object.values(deviceTypeLabelMap).includes(deviceType)) {
    return deviceType;
  }
  // 如果是中文标签，转换为内部值
  return deviceTypeLabelMap[deviceType] || deviceType;
};

// 获取设备列表
export const getDeviceList = async (params = {}) => {
  await delay(500);
  
  let filteredData = [...deviceData];
  
  // 按设备名称搜索
  if (params.name) {
    filteredData = filteredData.filter(item => 
      item.name.toLowerCase().includes(params.name.toLowerCase()) ||
      item.deviceCode.toLowerCase().includes(params.name.toLowerCase())
    );
  }
  
  // 按厂商筛选
  if (params.manufacturerId) {
    filteredData = filteredData.filter(item => 
      item.manufacturerId === parseInt(params.manufacturerId)
    );
  }
  
  // 按型号筛选
  if (params.modelId) {
    filteredData = filteredData.filter(item => 
      item.modelId === parseInt(params.modelId)
    );
  }
  
  // 按设备类型筛选
  if (params.deviceType) {
    filteredData = filteredData.filter(item => item.deviceType === params.deviceType);
  }
  
  // 按状态筛选
  if (params.status) {
    filteredData = filteredData.filter(item => item.status === params.status);
  }
  
  // 按连接状态筛选
  if (params.connectionStatus) {
    filteredData = filteredData.filter(item => item.connectionStatus === params.connectionStatus);
  }
  
  // 按位置筛选
  if (params.location) {
    filteredData = filteredData.filter(item => 
      item.location.toLowerCase().includes(params.location.toLowerCase())
    );
  }
  
  // 分页
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  // 标准化设备类型
  const normalizedData = filteredData.map(device => {
    const normalizedType = normalizeDeviceType(device.deviceType);
    return {
      ...device,
      deviceType: normalizedType,
      deviceTypeName: deviceTypeMap[normalizedType] || deviceTypeMap[device.deviceType] || device.deviceType // 使用标准化后的类型获取中文标签
    };
  });

  return {
    success: true,
    data: {
      list: normalizedData.slice(startIndex, endIndex),
      total: normalizedData.length,
      page,
      pageSize
    }
  };
};

// 获取设备详情
export const getDeviceDetail = async (id) => {
  await delay(300);

  const device = deviceData.find(item => item.id === parseInt(id));

  if (device) {
    // 确保设备有正确的设备类型名称
    const deviceWithTypeName = {
      ...device,
      deviceTypeName: device.deviceTypeName || deviceTypeMap[device.deviceType] || device.deviceType
    };

    return {
      success: true,
      data: deviceWithTypeName
    };
  } else {
    return {
      success: false,
      message: '设备不存在'
    };
  }
};

// 创建设备
export const createDevice = async (data) => {
  await delay(800);
  
  // 检查设备编码是否重复
  const existingCode = deviceData.find(item => item.deviceCode === data.deviceCode);
  if (existingCode) {
    return {
      success: false,
      message: '设备编码已存在'
    };
  }
  
  // 检查序列号是否重复
  const existingSerial = deviceData.find(item => item.serialNumber === data.serialNumber);
  if (existingSerial) {
    return {
      success: false,
      message: '设备序列号已存在'
    };
  }
  
  // 获取厂商信息
  const manufacturerResponse = await getManufacturerList({ pageSize: 1000 });
  const manufacturer = manufacturerResponse.data.list.find(m => m.id === parseInt(data.manufacturerId));
  
  // 获取型号信息
  const modelResponse = await getDeviceModelList({ pageSize: 1000 });
  const model = modelResponse.data.list.find(m => m.id === parseInt(data.modelId));
  
  const newDevice = {
    id: Math.max(...deviceData.map(item => item.id)) + 1,
    ...data,
    manufacturerId: parseInt(data.manufacturerId),
    manufacturerName: manufacturer ? manufacturer.name : '',
    modelId: parseInt(data.modelId),
    modelName: model ? model.name : '',
    deviceType: data.deviceType, // 使用表单中选择的设备类型
    deviceTypeName: deviceTypeMap[data.deviceType] || data.deviceType, // 添加设备类型名称
    connectionStatus: 'disconnected',
    lastOnlineTime: null,
    createTime: new Date().toLocaleString('zh-CN'),
    updateTime: new Date().toLocaleString('zh-CN')
  };
  
  deviceData.push(newDevice);
  
  return {
    success: true,
    data: newDevice,
    message: '创建成功'
  };
};

// 更新设备
export const updateDevice = async (id, data) => {
  await delay(800);
  
  const index = deviceData.findIndex(item => item.id === parseInt(id));
  
  if (index === -1) {
    return {
      success: false,
      message: '设备不存在'
    };
  }
  
  // 检查设备编码是否重复（排除自己）
  const existingCode = deviceData.find(item => 
    item.deviceCode === data.deviceCode && item.id !== parseInt(id)
  );
  if (existingCode) {
    return {
      success: false,
      message: '设备编码已存在'
    };
  }
  
  // 检查序列号是否重复（排除自己）
  const existingSerial = deviceData.find(item => 
    item.serialNumber === data.serialNumber && item.id !== parseInt(id)
  );
  if (existingSerial) {
    return {
      success: false,
      message: '设备序列号已存在'
    };
  }
  
  // 获取厂商信息
  const manufacturerResponse = await getManufacturerList({ pageSize: 1000 });
  const manufacturer = manufacturerResponse.data.list.find(m => m.id === parseInt(data.manufacturerId));
  
  // 获取型号信息
  const modelResponse = await getDeviceModelList({ pageSize: 1000 });
  const model = modelResponse.data.list.find(m => m.id === parseInt(data.modelId));
  
  const finalDeviceType = data.deviceType || deviceData[index].deviceType;

  deviceData[index] = {
    ...deviceData[index],
    ...data,
    manufacturerId: parseInt(data.manufacturerId),
    manufacturerName: manufacturer ? manufacturer.name : '',
    modelId: parseInt(data.modelId),
    modelName: model ? model.name : '',
    deviceType: finalDeviceType, // 保持设备类型
    deviceTypeName: deviceTypeMap[finalDeviceType] || finalDeviceType, // 使用正确的设备类型获取中文标签
    updateTime: new Date().toLocaleString('zh-CN')
  };
  
  return {
    success: true,
    data: deviceData[index],
    message: '更新成功'
  };
};

// 删除设备
export const deleteDevice = async (id) => {
  await delay(500);
  
  const index = deviceData.findIndex(item => item.id === parseInt(id));
  
  if (index === -1) {
    return {
      success: false,
      message: '设备不存在'
    };
  }
  
  deviceData.splice(index, 1);
  
  return {
    success: true,
    message: '删除成功'
  };
};

// 批量删除设备
export const batchDeleteDevice = async (ids) => {
  await delay(800);
  
  deviceData = deviceData.filter(item => !ids.includes(item.id));
  
  return {
    success: true,
    message: `成功删除 ${ids.length} 个设备`
  };
};

// 测试设备连接
export const testDeviceConnection = async (id) => {
  await delay(2000);
  
  const device = deviceData.find(item => item.id === parseInt(id));
  if (!device) {
    return {
      success: false,
      message: '设备不存在'
    };
  }
  
  // 模拟连接测试结果
  const isConnected = Math.random() > 0.3; // 70% 成功率
  
  if (isConnected) {
    // 更新设备状态
    const index = deviceData.findIndex(item => item.id === parseInt(id));
    deviceData[index].connectionStatus = 'connected';
    deviceData[index].status = 'online';
    deviceData[index].lastOnlineTime = new Date().toLocaleString('zh-CN');
    
    return {
      success: true,
      message: '连接测试成功',
      data: {
        connectionStatus: 'connected',
        responseTime: Math.floor(Math.random() * 100) + 50 // 50-150ms
      }
    };
  } else {
    return {
      success: false,
      message: '连接测试失败，请检查设备配置',
      data: {
        connectionStatus: 'disconnected'
      }
    };
  }
};

// 更新Mesh电台参数
export const updateMeshParameters = async (deviceId, parameters) => {
  await delay(800);

  const index = deviceData.findIndex(item => item.id === parseInt(deviceId));

  if (index === -1) {
    return {
      success: false,
      message: '设备不存在'
    };
  }

  const device = deviceData[index];
  if (device.deviceType !== 'mesh_radio') {
    return {
      success: false,
      message: '该设备不是Mesh电台'
    };
  }

  deviceData[index] = {
    ...device,
    meshParameters: parameters,
    updateTime: new Date().toLocaleString('zh-CN')
  };

  return {
    success: true,
    data: deviceData[index],
    message: 'Mesh参数更新成功'
  };
};

// 获取Mesh网络拓扑
export const getMeshTopology = async (deviceId) => {
  await delay(500);

  const device = deviceData.find(item => item.id === parseInt(deviceId));

  if (!device || device.deviceType !== 'mesh_radio') {
    return {
      success: false,
      message: '设备不存在或不是Mesh电台'
    };
  }

  // 模拟返回网络拓扑数据
  const topologyData = {
    nodes: [
      {
        id: deviceId.toString(),
        label: device.name,
        type: 'main',
        status: device.status,
        rssi: -30,
        battery: 85,
        workingFrequency: '433.000'
      },
      {
        id: 'mesh_node_2',
        label: 'Mesh节点-002',
        type: 'relay',
        status: 'online',
        rssi: -45,
        battery: 92,
        workingFrequency: '433.000'
      },
      {
        id: 'mesh_node_3',
        label: 'Mesh节点-003',
        type: 'endpoint',
        status: 'online',
        rssi: -52,
        battery: 78,
        workingFrequency: '433.125'
      },
      {
        id: 'mesh_node_4',
        label: 'Mesh节点-004',
        type: 'endpoint',
        status: 'offline',
        rssi: -999,
        battery: 0,
        workingFrequency: '433.250'
      }
    ],
    edges: [
      {
        source: deviceId.toString(),
        target: 'mesh_node_2',
        rssi: -45,
        quality: 'good'
      },
      {
        source: deviceId.toString(),
        target: 'mesh_node_3',
        rssi: -52,
        quality: 'fair'
      },
      {
        source: 'mesh_node_2',
        target: 'mesh_node_4',
        rssi: -68,
        quality: 'poor'
      }
    ],
    statistics: {
      totalNodes: 4,
      onlineNodes: 3,
      offlineNodes: 1,
      networkLoad: 65,
      avgRssi: -49
    }
  };

  return {
    success: true,
    data: topologyData
  };
};

// 导出设备数据
export const exportDeviceData = async (params = {}) => {
  await delay(1000);

  return {
    success: true,
    data: {
      downloadUrl: '/api/download/devices.xlsx',
      filename: `设备数据_${new Date().toISOString().split('T')[0]}.xlsx`
    },
    message: '导出成功'
  };
};
