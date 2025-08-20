// 设备模板管理服务

// 模拟延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 模板状态选项
export const productStatuses = [
  { value: 'active', label: '启用', color: 'success' },
  { value: 'inactive', label: '禁用', color: 'default' },
  { value: 'developing', label: '开发中', color: 'processing' },
  { value: 'deprecated', label: '已废弃', color: 'error' }
];

// 设备类型选项（与设备管理保持一致）
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

// 模拟模板数据
let productData = [
  {
    id: 1,
    name: '智能Mesh通信模板',
    code: 'PROD_MESH_001',
    deviceType: 'mesh_radio',
    deviceTypeName: 'Mesh电台',
    description: '支持多跳自组网的智能通信模板，适用于应急通信场景',
    status: 'active',
    version: 'v1.2.0',
    thingModelId: 2, // 关联Mesh电台物模型
    linkedDevices: [
      // 关联的Mesh电台设备
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
        deviceTypeName: 'Mesh电台',
        location: '基站A',
        ipAddress: '192.168.1.105',
        port: 8080,
        status: 'online',
        connectionStatus: 'connected',
        lastOnlineTime: '2024-01-21 15:30:00'
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
        deviceTypeName: 'Mesh电台',
        location: '基站B',
        ipAddress: '192.168.1.106',
        port: 8080,
        status: 'online',
        connectionStatus: 'connected',
        lastOnlineTime: '2024-01-21 15:25:00'
      }
    ],
    subDevices: [
      {
        id: 1,
        name: 'Mesh主节点',
        code: 'SUB_MESH_MAIN_001',
        description: '网络主控节点，负责网络管理和数据转发',
        specifications: {
          frequency: '433MHz',
          power: '20W',
          range: '5km',
          protocol: 'LoRa'
        }
      },
      {
        id: 2,
        name: 'Mesh中继节点',
        code: 'SUB_MESH_RELAY_001',
        description: '网络中继节点，扩展网络覆盖范围',
        specifications: {
          frequency: '433MHz',
          power: '10W',
          range: '3km',
          protocol: 'LoRa'
        }
      },
      {
        id: 3,
        name: 'Mesh终端节点',
        code: 'SUB_MESH_END_001',
        description: '网络终端节点，用于数据采集和上报',
        specifications: {
          frequency: '433MHz',
          power: '5W',
          range: '1km',
          protocol: 'LoRa'
        }
      }
    ],
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-20 14:20:00'
  },
  {
    id: 2,
    name: '370M基站通信模板',
    code: 'PROD_370M_001',
    deviceType: '370m_base_station',
    deviceTypeName: '370M基站',
    description: '专业级370M频段基站通信模板，支持大范围覆盖',
    status: 'active',
    version: 'v2.1.0',
    linkedDevices: [],
    subDevices: [
      {
        id: 4,
        name: '370M基站主机',
        code: 'SUB_370M_MAIN_001',
        description: '基站主控设备，负责信号发射和接收',
        specifications: {
          frequency: '370-390MHz',
          power: '50W',
          range: '20km',
          channels: '16'
        }
      },
      {
        id: 5,
        name: '370M天线系统',
        code: 'SUB_370M_ANT_001',
        description: '高增益定向天线，提升信号覆盖',
        specifications: {
          gain: '12dBi',
          type: '定向天线',
          frequency: '370-390MHz',
          vswr: '<1.5'
        }
      }
    ],
    createTime: '2024-01-10 09:15:00',
    updateTime: '2024-01-18 16:45:00'
  },
  {
    id: 3,
    name: '智能视频监控模板',
    code: 'PROD_VIDEO_001',
    deviceType: 'network_camera',
    deviceTypeName: '网络摄像头',
    description: 'AI智能视频监控模板，支持人脸识别和行为分析',
    status: 'active',
    version: 'v1.0.0-beta',
    thingModelId: 1, // 关联智能摄像头物模型
    linkedDevices: [
      // 关联的网络摄像头设备
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
        deviceTypeName: '网络摄像头',
        location: '大门入口',
        ipAddress: '192.168.1.101',
        port: 8000,
        status: 'online',
        connectionStatus: 'connected',
        lastOnlineTime: '2024-01-21 14:30:00'
      }
    ],
    subDevices: [
      {
        id: 6,
        name: '4K网络摄像头',
        code: 'SUB_CAM_4K_001',
        description: '4K高清网络摄像头，支持夜视功能',
        specifications: {
          resolution: '4K',
          fps: '30',
          nightVision: '支持',
          zoom: '10倍光学变焦'
        }
      },
      {
        id: 7,
        name: 'AI分析服务器',
        code: 'SUB_AI_SERVER_001',
        description: 'AI视频分析服务器，提供智能识别功能',
        specifications: {
          cpu: 'Intel i7',
          gpu: 'NVIDIA RTX 3080',
          memory: '32GB',
          storage: '2TB SSD'
        }
      }
    ],
    createTime: '2024-01-20 11:00:00',
    updateTime: '2024-01-21 10:30:00'
  },
  {
    id: 4,
    name: '智能网关通信模板',
    code: 'PROD_GATEWAY_001',
    deviceType: 'gateway',
    deviceTypeName: '网关设备',
    description: '多协议智能网关模板，支持4G/5G/WiFi/以太网多种接入方式',
    status: 'active',
    version: 'v1.5.0',
    linkedDevices: [],
    subDevices: [
      {
        id: 8,
        name: '4G/5G通信模块',
        code: 'SUB_GATEWAY_4G_001',
        description: '支持4G/5G网络接入的通信模块',
        specifications: {
          network: '4G/5G',
          bands: 'B1/B3/B8/B20/B28',
          speed: '150Mbps下行/50Mbps上行',
          sim: '双卡双待'
        }
      },
      {
        id: 9,
        name: 'WiFi无线模块',
        code: 'SUB_GATEWAY_WIFI_001',
        description: '双频WiFi无线接入模块',
        specifications: {
          standard: '802.11ac',
          frequency: '2.4GHz/5GHz',
          speed: '1200Mbps',
          antenna: '4x4 MIMO'
        }
      },
      {
        id: 10,
        name: '以太网交换模块',
        code: 'SUB_GATEWAY_ETH_001',
        description: '千兆以太网交换模块',
        specifications: {
          ports: '8口千兆',
          speed: '1000Mbps',
          poe: '支持PoE+',
          management: '网管型'
        }
      }
    ],
    createTime: '2024-01-08 14:30:00',
    updateTime: '2024-01-21 11:15:00'
  },
  {
    id: 5,
    name: '高清摄像头模板',
    code: 'PROD_HD_CAM_001',
    deviceType: 'network_camera',
    deviceTypeName: '网络摄像头',
    description: '高清网络摄像头模板，支持4K录制',
    status: 'active',
    version: 'v2.0.0',
    thingModelId: 1, // 关联智能摄像头物模型
    linkedDevices: [],
    subDevices: [],
    createTime: '2024-01-22 10:00:00',
    updateTime: '2024-01-22 10:00:00'
  },
  {
    id: 6,
    name: 'Mesh中继器模板',
    code: 'PROD_MESH_RELAY_001',
    deviceType: 'mesh_radio',
    deviceTypeName: 'Mesh电台',
    description: 'Mesh网络中继器模板，扩展网络覆盖范围',
    status: 'active',
    version: 'v1.0.0',
    thingModelId: 2, // 关联Mesh电台物模型
    linkedDevices: [],
    subDevices: [],
    createTime: '2024-01-22 11:00:00',
    updateTime: '2024-01-22 11:00:00'
  },
  {
    id: 7,
    name: '便携式Mesh设备',
    code: 'PROD_PORTABLE_MESH_001',
    deviceType: 'mesh_radio',
    deviceTypeName: 'Mesh电台',
    description: '便携式Mesh通信设备，适用于移动场景',
    status: 'active',
    version: 'v1.1.0',
    thingModelId: 2, // 关联Mesh电台物模型
    linkedDevices: [],
    subDevices: [],
    createTime: '2024-01-22 12:00:00',
    updateTime: '2024-01-22 12:00:00'
  }
];

// 获取模板列表
export const getProductList = async (params = {}) => {
  await delay(500);
  
  let filteredData = [...productData];
  
  // 按模板名称搜索
  if (params.name) {
    filteredData = filteredData.filter(item => 
      item.name.toLowerCase().includes(params.name.toLowerCase()) ||
      item.code.toLowerCase().includes(params.name.toLowerCase())
    );
  }
  
  // 按设备类型筛选
  if (params.deviceType) {
    filteredData = filteredData.filter(item => 
      item.deviceType === params.deviceType
    );
  }
  
  // 按状态筛选
  if (params.status) {
    filteredData = filteredData.filter(item => 
      item.status === params.status
    );
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

// 获取模板详情
export const getProductDetail = async (id) => {
  await delay(300);
  
  const product = productData.find(item => item.id === parseInt(id));
  
  if (product) {
    return {
      success: true,
      data: product
    };
  } else {
    return {
      success: false,
      message: '模板不存在'
    };
  }
};

// 创建模板
export const createProduct = async (data) => {
  await delay(800);
  
  // 检查编码是否重复
  const existingCode = productData.find(item => item.code === data.code);
  if (existingCode) {
    return {
      success: false,
      message: '模板编码已存在'
    };
  }
  
  // 检查名称是否重复
  const existingName = productData.find(item => item.name === data.name);
  if (existingName) {
    return {
      success: false,
      message: '模板名称已存在'
    };
  }
  
  const newProduct = {
    id: Math.max(...productData.map(item => item.id)) + 1,
    ...data,
    deviceTypeName: deviceTypes.find(type => type.value === data.deviceType)?.label || data.deviceType,
    subDevices: data.subDevices || [],
    createTime: new Date().toLocaleString('zh-CN'),
    updateTime: new Date().toLocaleString('zh-CN')
  };

  productData.push(newProduct);

  // 如果关联了物模型，记录日志
  if (data.thingModelId) {
    console.log('✅ [模板管理] 新模板已关联物模型:', {
      productId: newProduct.id,
      productName: newProduct.name,
      thingModelId: data.thingModelId
    });
  }

  return {
    success: true,
    data: newProduct,
    message: '创建成功'
  };
};

// 更新模板
export const updateProduct = async (id, data) => {
  await delay(800);
  
  const index = productData.findIndex(item => item.id === parseInt(id));
  
  if (index === -1) {
    return {
      success: false,
      message: '模板不存在'
    };
  }
  
  // 检查编码是否重复（排除自己）
  const existingCode = productData.find(item => 
    item.code === data.code && item.id !== parseInt(id)
  );
  if (existingCode) {
    return {
      success: false,
      message: '模板编码已存在'
    };
  }
  
  // 检查名称是否重复（排除自己）
  const existingName = productData.find(item => 
    item.name === data.name && item.id !== parseInt(id)
  );
  if (existingName) {
    return {
      success: false,
      message: '模板名称已存在'
    };
  }
  
  const oldProduct = { ...productData[index] };

  productData[index] = {
    ...productData[index],
    ...data,
    deviceTypeName: deviceTypes.find(type => type.value === data.deviceType)?.label || data.deviceType,
    updateTime: new Date().toLocaleString('zh-CN')
  };

  // 如果物模型关联发生变化，记录日志
  if (oldProduct.thingModelId !== data.thingModelId) {
    console.log('🔄 [模板管理] 物模型关联已更新:', {
      productId: id,
      productName: productData[index].name,
      oldThingModelId: oldProduct.thingModelId,
      newThingModelId: data.thingModelId
    });
  }

  return {
    success: true,
    data: productData[index],
    message: '更新成功'
  };
};

// 删除模板
export const deleteProduct = async (id) => {
  await delay(500);
  
  const index = productData.findIndex(item => item.id === parseInt(id));
  
  if (index === -1) {
    return {
      success: false,
      message: '模板不存在'
    };
  }
  
  productData.splice(index, 1);
  
  return {
    success: true,
    message: '删除成功'
  };
};

// 导出模板数据
export const exportProductData = async (params = {}) => {
  await delay(1000);

  return {
    success: true,
    data: {
      downloadUrl: '/api/export/products.xlsx'
    },
    message: '导出成功'
  };
};

// 根据物模型ID获取关联的模板列表
export const getProductsByThingModelId = async (thingModelId) => {
  await delay(200);

  const associatedProducts = productData.filter(product =>
    product.thingModelId === parseInt(thingModelId)
  );

  return {
    success: true,
    data: associatedProducts,
    message: '获取成功'
  };
};

// 更新模板关联设备列表
// 获取所有已关联的设备ID（按设备类型分组）
export const getAllLinkedDevicesByType = async (deviceType, excludeProductId = null) => {
  await delay(100);
  
  try {
    const linkedDeviceIds = new Set();
    
    productData.forEach(product => {
      // 如果指定了排除的模板ID，则跳过该模板
      if (excludeProductId && product.id === excludeProductId) {
        return;
      }
      
      // 只检查相同设备类型的模板
      if (product.deviceType === deviceType && product.linkedDevices) {
        product.linkedDevices.forEach(device => {
          linkedDeviceIds.add(device.id);
        });
      }
    });
    
    return {
      success: true,
      data: Array.from(linkedDeviceIds),
      message: '获取已关联设备列表成功'
    };
  } catch (error) {
    console.error('获取已关联设备失败:', error);
    return {
      success: false,
      data: [],
      message: '获取已关联设备失败'
    };
  }
};

export const updateProductLinkedDevices = async (productId, deviceData, action) => {
  await delay(200);

  const productIndex = productData.findIndex(item => item.id === parseInt(productId));

  if (productIndex === -1) {
    return {
      success: false,
      message: '模板不存在'
    };
  }

  const product = productData[productIndex];

  // 确保 linkedDevices 数组存在
  if (!product.linkedDevices) {
    product.linkedDevices = [];
  }

  if (action === 'add') {
    // 添加设备到关联列表
    const deviceId = typeof deviceData === 'object' ? deviceData.id : deviceData;

    // 检查设备是否已经在列表中
    const existingIndex = product.linkedDevices.findIndex(device => device.id === deviceId);

    if (existingIndex === -1) {
      // 如果传入的是完整的设备对象，直接添加；否则只添加ID
      if (typeof deviceData === 'object') {
        product.linkedDevices.push(deviceData);
      } else {
        // 这里可以根据需要从设备服务获取完整设备信息
        product.linkedDevices.push({ id: deviceId });
      }

      console.log('✅ [模板服务] 设备已添加到模板关联列表:', {
        productId,
        productName: product.name,
        deviceId,
        totalLinkedDevices: product.linkedDevices.length
      });

      // 同步更新设备的模板关联信息
      try {
        const { updateDevice } = await import('./deviceManagement');
        const { getDeviceList } = await import('./deviceManagement');

        // 获取设备信息
        const deviceListResponse = await getDeviceList({ page: 1, pageSize: 1000 });
        if (deviceListResponse.success) {
          const device = deviceListResponse.data.list.find(d => d.id === deviceId);
          if (device) {
            await updateDevice(deviceId, {
              ...device,
              productId: parseInt(productId),
              productName: product.name,
              productCode: product.code
            });
            console.log('✅ [模板服务] 已同步更新设备的模板关联信息:', {
              deviceId,
              deviceName: device.name,
              productId,
              productName: product.name
            });
          }
        }
      } catch (error) {
        console.warn('⚠️ [模板服务] 同步更新设备模板信息失败:', error);
      }

    } else {
      // 如果设备已存在，更新设备信息
      if (typeof deviceData === 'object') {
        product.linkedDevices[existingIndex] = deviceData;
        console.log('✅ [模板服务] 已更新模板关联设备信息:', {
          productId,
          deviceId
        });
      }
    }
  } else if (action === 'remove') {
    // 从关联列表中移除设备
    const deviceId = typeof deviceData === 'object' ? deviceData.id : deviceData;
    const originalLength = product.linkedDevices.length;

    // 获取要移除的设备信息（用于日志）
    const deviceToRemove = product.linkedDevices.find(device => device.id === deviceId);

    product.linkedDevices = product.linkedDevices.filter(device => device.id !== deviceId);

    console.log('✅ [模板服务] 设备已从模板关联列表移除:', {
      productId,
      productName: product.name,
      deviceId,
      deviceName: deviceToRemove?.name || 'Unknown',
      removedCount: originalLength - product.linkedDevices.length,
      remainingLinkedDevices: product.linkedDevices.length
    });

    // 同步清除设备的模板关联信息
    try {
      const { updateDevice } = await import('./deviceManagement');
      const { getDeviceList } = await import('./deviceManagement');

      // 获取设备信息
      const deviceListResponse = await getDeviceList({ page: 1, pageSize: 1000 });
      if (deviceListResponse.success) {
        const device = deviceListResponse.data.list.find(d => d.id === deviceId);
        if (device) {
          const updateResult = await updateDevice(deviceId, {
            ...device,
            productId: null,
            productName: null,
            productCode: null
          });

          if (updateResult.success) {
            console.log('✅ [模板服务] 已同步清除设备的模板关联信息:', {
              deviceId,
              deviceName: device.name,
              previousProductId: device.productId,
              previousProductName: device.productName
            });
          } else {
            console.error('❌ [模板服务] 清除设备模板关联信息失败:', updateResult.message);
          }
        } else {
          console.warn('⚠️ [模板服务] 未找到要清除关联的设备:', { deviceId });
        }
      }
    } catch (error) {
      console.error('❌ [模板服务] 同步清除设备模板信息异常:', error);
    }
  }

  // 更新模板的更新时间
  product.updateTime = new Date().toLocaleString('zh-CN');

  return {
    success: true,
    data: product,
    message: action === 'add' ? '设备关联成功' : '设备关联已移除'
  };
};
