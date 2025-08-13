// 设备型号API服务
import { getManufacturerList } from './deviceManufacturer';

// 模拟数据
let deviceModelData = [
  {
    id: 1,
    name: 'IPC-HFW4431R-Z',
    code: 'HFW4431RZ',
    manufacturerId: 3,
    manufacturerName: '海康威视数字技术股份有限公司',
    deviceType: 'network_camera',
    specifications: {
      resolution: '4MP',
      lens: '2.7-13.5mm',
      nightVision: '60m',
      powerConsumption: '12W',
      workingTemperature: '-30°C ~ +60°C',
      protection: 'IP67'
    },
    applicableScenarios: '室外监控、周界防护、道路监控',
    status: 'active',
    description: '400万像素红外变焦网络摄像机，支持H.265编码',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-20 14:20:00'
  },
  {
    id: 2,
    name: 'DS-2CD2347G2-LU',
    code: 'DS2CD2347G2LU',
    manufacturerId: 3,
    manufacturerName: '海康威视数字技术股份有限公司',
    deviceType: 'network_camera',
    specifications: {
      resolution: '4MP',
      lens: '2.8mm',
      nightVision: '30m',
      powerConsumption: '8W',
      workingTemperature: '-30°C ~ +60°C',
      protection: 'IP67'
    },
    applicableScenarios: '商业监控、住宅安防、停车场监控',
    status: 'active',
    description: '400万像素全彩网络摄像机，24小时彩色成像',
    createTime: '2024-01-16 09:15:00',
    updateTime: '2024-01-18 16:45:00'
  },
  {
    id: 3,
    name: 'Mi Smart Camera 2K',
    code: 'MJSXJ05CM',
    manufacturerId: 2,
    manufacturerName: '小米科技有限责任公司',
    deviceType: 'network_camera',
    specifications: {
      resolution: '2K',
      lens: '3.9mm',
      nightVision: '10m',
      powerConsumption: '5W',
      workingTemperature: '0°C ~ +40°C',
      connectivity: 'Wi-Fi'
    },
    applicableScenarios: '家庭监控、宠物看护、老人照护',
    status: 'active',
    description: '小米智能摄像机2K版，支持AI人形检测',
    createTime: '2024-01-12 14:30:00',
    updateTime: '2024-01-15 10:20:00'
  },
  {
    id: 4,
    name: 'DH-IPC-HFW2431S-S',
    code: 'DHIPC2431SS',
    manufacturerId: 4,
    manufacturerName: '大华技术股份有限公司',
    deviceType: 'network_camera',
    specifications: {
      resolution: '4MP',
      lens: '3.6mm',
      nightVision: '30m',
      powerConsumption: '6.5W',
      workingTemperature: '-30°C ~ +60°C',
      protection: 'IP67'
    },
    applicableScenarios: '小区监控、商铺安防、办公楼监控',
    status: 'active',
    description: '大华400万像素红外网络摄像机',
    createTime: '2024-01-10 11:20:00',
    updateTime: '2024-01-12 13:30:00'
  },
  {
    id: 5,
    name: 'ZTE MF971R',
    code: 'MF971R',
    manufacturerId: 5,
    manufacturerName: '中兴通讯股份有限公司',
    deviceType: 'gateway',
    specifications: {
      networkStandard: '4G LTE',
      wifiStandard: '802.11n',
      maxSpeed: '150Mbps',
      batteryCapacity: '2300mAh',
      workingTime: '6小时',
      maxConnections: '10设备'
    },
    applicableScenarios: '移动办公、临时网络、应急通信',
    status: 'inactive',
    description: '中兴4G便携式路由器，支持多设备共享上网',
    createTime: '2024-01-08 16:45:00',
    updateTime: '2024-01-10 09:30:00'
  },
  {
    id: 6,
    name: 'HW-MESH-433',
    code: 'HWMESH433',
    manufacturerId: 1,
    manufacturerName: '华为技术有限公司',
    deviceType: 'mesh_radio',
    specifications: {
      frequency: '433MHz',
      power: '20dBm',
      sensitivity: '-148dBm',
      dataRate: '0.3-50kbps',
      range: '15km',
      networkTopology: 'Mesh',
      encryption: 'AES-256',
      batteryLife: '5年'
    },
    applicableScenarios: '应急通信、野外作业、智慧城市、物联网',
    status: 'active',
    description: '华为433MHz Mesh自组网电台，支持多跳中继通信',
    createTime: '2024-01-20 08:30:00',
    updateTime: '2024-01-20 08:30:00'
  },
  {
    id: 8,
    name: 'SAT-COM-100',
    code: 'SATCOM100',
    manufacturerId: 2,
    manufacturerName: '中兴通讯股份有限公司',
    deviceType: 'satellite_communication',
    specifications: {
      frequency: 'Ku波段',
      dataRate: '2Mbps',
      power: '50W',
      antennaSize: '0.8m',
      workingTemperature: '-40°C ~ +70°C',
      protocol: 'DVB-S2'
    },
    applicableScenarios: '海上通信、偏远地区、应急救援',
    status: 'active',
    description: '便携式卫星通信终端，全球覆盖',
    createTime: '2024-01-24 16:45:00',
    updateTime: '2024-01-27 11:20:00'
  },
  {
    id: 9,
    name: 'BASE-370M-Pro',
    code: 'BASE370MPRO',
    manufacturerId: 1,
    manufacturerName: '华为技术有限公司',
    deviceType: '370m_base_station',
    specifications: {
      frequency: '370MHz',
      transmitPower: '50W',
      coverage: '30km',
      channels: '16',
      modulation: 'QPSK',
      protocol: 'TETRA'
    },
    applicableScenarios: '公安通信、应急指挥、专网通信',
    status: 'active',
    description: '370MHz专业基站，支持集群通信',
    createTime: '2024-01-25 09:30:00',
    updateTime: '2024-01-28 14:15:00'
  },
  {
    id: 10,
    name: 'TEMP-SENSOR-01',
    code: 'TEMPSENSOR01',
    manufacturerId: 4,
    manufacturerName: '小米科技有限责任公司',
    deviceType: 'sensor',
    specifications: {
      sensorType: '温度传感器',
      range: '-40°C ~ +125°C',
      accuracy: '±0.5°C',
      resolution: '0.1°C',
      protocol: 'LoRaWAN',
      batteryLife: '5年'
    },
    applicableScenarios: '环境监测、仓储管理、农业物联网',
    status: 'active',
    description: '高精度温度传感器，低功耗设计',
    createTime: '2024-01-26 11:45:00',
    updateTime: '2024-01-29 09:30:00'
  },
  {
    id: 11,
    name: 'ZTE-GATEWAY-5G',
    code: 'ZTEGATEWAY5G',
    manufacturerId: 2,
    manufacturerName: '中兴通讯股份有限公司',
    deviceType: 'gateway',
    specifications: {
      networkType: '5G/4G LTE',
      wifiStandard: '802.11ax',
      maxConnections: '64',
      throughput: '2Gbps',
      ports: '4xGigabit Ethernet',
      power: '24V/2A'
    },
    applicableScenarios: '企业网络、智慧园区、工业物联网',
    status: 'active',
    description: '5G工业网关，支持边缘计算',
    createTime: '2024-01-27 13:20:00',
    updateTime: '2024-01-30 10:45:00'
  }
];

// 设备类型选项（与设备管理保持一致）
export const deviceTypes = [
  { value: 'mesh_radio', label: 'Mesh电台' },
  { value: '370m_base_station', label: '370M基站' },
  { value: 'satellite_communication', label: '卫星通信' },
  { value: 'network_camera', label: '网络摄像头' },
  { value: 'video_surveillance', label: '视频监控' },
  { value: 'sensor', label: '传感器' },
  { value: 'gateway', label: '网关设备' },
  { value: 'other', label: '其他设备' }
];

// 模拟API延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 获取设备型号列表
export const getDeviceModelList = async (params = {}) => {
  await delay(500);
  
  let filteredData = [...deviceModelData];
  
  // 按型号名称搜索
  if (params.name) {
    filteredData = filteredData.filter(item => 
      item.name.toLowerCase().includes(params.name.toLowerCase())
    );
  }
  
  // 按厂商筛选
  if (params.manufacturerId) {
    filteredData = filteredData.filter(item => 
      item.manufacturerId === parseInt(params.manufacturerId)
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
  
  // 按日期范围筛选
  if (params.startDate && params.endDate) {
    filteredData = filteredData.filter(item => {
      const createTime = new Date(item.createTime);
      const startDate = new Date(params.startDate);
      const endDate = new Date(params.endDate);
      return createTime >= startDate && createTime <= endDate;
    });
  }
  
  // 分页
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    success: true,
    data: {
      list: filteredData.slice(startIndex, endIndex),
      total: filteredData.length,
      page,
      pageSize
    }
  };
};

// 获取设备型号详情
export const getDeviceModelDetail = async (id) => {
  await delay(300);
  
  const model = deviceModelData.find(item => item.id === parseInt(id));
  
  if (model) {
    return {
      success: true,
      data: model
    };
  } else {
    return {
      success: false,
      message: '设备型号不存在'
    };
  }
};

// 创建设备型号
export const createDeviceModel = async (data) => {
  await delay(800);
  
  // 检查型号编码是否重复
  const existingCode = deviceModelData.find(item => item.code === data.code);
  if (existingCode) {
    return {
      success: false,
      message: '型号编码已存在'
    };
  }
  
  // 检查型号名称是否重复
  const existingName = deviceModelData.find(item => item.name === data.name);
  if (existingName) {
    return {
      success: false,
      message: '型号名称已存在'
    };
  }
  
  // 获取厂商信息
  const manufacturerResponse = await getManufacturerList();
  const manufacturer = manufacturerResponse.data.list.find(m => m.id === parseInt(data.manufacturerId));
  
  const newModel = {
    id: Math.max(...deviceModelData.map(item => item.id)) + 1,
    ...data,
    manufacturerId: parseInt(data.manufacturerId),
    manufacturerName: manufacturer ? manufacturer.name : '',
    createTime: new Date().toLocaleString('zh-CN'),
    updateTime: new Date().toLocaleString('zh-CN')
  };
  
  deviceModelData.push(newModel);
  
  return {
    success: true,
    data: newModel,
    message: '创建成功'
  };
};

// 更新设备型号
export const updateDeviceModel = async (id, data) => {
  await delay(800);
  
  const index = deviceModelData.findIndex(item => item.id === parseInt(id));
  
  if (index === -1) {
    return {
      success: false,
      message: '设备型号不存在'
    };
  }
  
  // 检查型号编码是否重复（排除自己）
  const existingCode = deviceModelData.find(item => 
    item.code === data.code && item.id !== parseInt(id)
  );
  if (existingCode) {
    return {
      success: false,
      message: '型号编码已存在'
    };
  }
  
  // 检查型号名称是否重复（排除自己）
  const existingName = deviceModelData.find(item => 
    item.name === data.name && item.id !== parseInt(id)
  );
  if (existingName) {
    return {
      success: false,
      message: '型号名称已存在'
    };
  }
  
  // 获取厂商信息
  const manufacturerResponse = await getManufacturerList();
  const manufacturer = manufacturerResponse.data.list.find(m => m.id === parseInt(data.manufacturerId));
  
  deviceModelData[index] = {
    ...deviceModelData[index],
    ...data,
    manufacturerId: parseInt(data.manufacturerId),
    manufacturerName: manufacturer ? manufacturer.name : '',
    updateTime: new Date().toLocaleString('zh-CN')
  };
  
  return {
    success: true,
    data: deviceModelData[index],
    message: '更新成功'
  };
};

// 删除设备型号
export const deleteDeviceModel = async (id) => {
  await delay(500);

  const index = deviceModelData.findIndex(item => item.id === parseInt(id));

  if (index === -1) {
    return {
      success: false,
      message: '设备型号不存在'
    };
  }

  deviceModelData.splice(index, 1);

  return {
    success: true,
    message: '删除成功'
  };
};

// 根据设备类型获取设备型号列表
export const getDeviceModelsByType = async (deviceType) => {
  await delay(300);

  if (!deviceType) {
    return {
      success: true,
      data: [],
      message: '请先选择设备类型'
    };
  }

  const filteredModels = deviceModelData.filter(model =>
    model.deviceType === deviceType && model.status === 'active'
  );

  return {
    success: true,
    data: filteredModels,
    message: '获取成功'
  };
};

// 根据厂商ID和设备类型获取设备型号列表（双重筛选）
export const getDeviceModelsByManufacturerAndType = async (manufacturerId, deviceType) => {
  await delay(300);

  let filteredModels = deviceModelData.filter(model => model.status === 'active');

  if (manufacturerId) {
    filteredModels = filteredModels.filter(model => model.manufacturerId === parseInt(manufacturerId));
  }

  if (deviceType) {
    filteredModels = filteredModels.filter(model => model.deviceType === deviceType);
  }

  return {
    success: true,
    data: filteredModels,
    message: '获取成功'
  };
};

// 批量删除设备型号
export const batchDeleteDeviceModel = async (ids) => {
  await delay(800);
  
  deviceModelData = deviceModelData.filter(item => !ids.includes(item.id));
  
  return {
    success: true,
    message: `成功删除 ${ids.length} 个设备型号`
  };
};

// 导出设备型号数据
export const exportDeviceModelData = async (params = {}) => {
  await delay(1000);
  
  return {
    success: true,
    data: {
      downloadUrl: '/api/download/device-models.xlsx',
      filename: `设备型号数据_${new Date().toISOString().split('T')[0]}.xlsx`
    },
    message: '导出成功'
  };
};
