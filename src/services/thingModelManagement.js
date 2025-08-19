// 物模型管理API服务

// 模拟延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 获取关联产品信息的辅助函数
const getAssociatedProducts = async (thingModelId) => {
  try {
    // 动态导入产品管理服务，避免循环依赖
    const { getProductsByThingModelId } = await import('./productManagement');

    // 获取关联指定物模型的产品
    const response = await getProductsByThingModelId(thingModelId);

    if (response.success) {
      return response.data;
    }

    return [];
  } catch (error) {
    console.error('获取关联产品失败:', error);
    return [];
  }
};

// 模拟数据
let thingModelData = [
  {
    id: 1,
    name: '智能摄像头物模型',
    code: 'smart_camera_model',
    productId: 1,
    productName: '海康威视网络摄像头模板',
    productCode: 'HK_CAMERA_001',
    version: '1.0.0',
    status: 'active',
    description: '智能网络摄像头的标准物模型，包含视频流、云台控制、报警等功能',
    properties: [
      {
        id: 1,
        identifier: 'power_status',
        name: '电源状态',
        dataType: 'boolean',
        accessMode: 'r',
        required: true,
        description: '设备电源开关状态',
        specs: 'true=开启, false=关闭'
      },
      {
        id: 2,
        identifier: 'video_resolution',
        name: '视频分辨率',
        dataType: 'enum',
        accessMode: 'rw',
        required: true,
        description: '视频流分辨率设置',
        specs: '1080p, 720p, 480p, 360p'
      },
      {
        id: 3,
        identifier: 'ptz_position',
        name: '云台位置',
        dataType: 'object',
        accessMode: 'rw',
        required: false,
        description: '云台当前位置信息',
        specs: '{pan: 0-360, tilt: -90-90, zoom: 1-10}'
      }
    ],
    events: [
      {
        id: 1,
        identifier: 'motion_detected',
        name: '移动侦测',
        eventType: 'warning',
        description: '检测到画面中有移动物体',
        outputParams: '[{"name": "confidence", "type": "float", "description": "置信度"}, {"name": "area", "type": "object", "description": "检测区域"}]'
      },
      {
        id: 2,
        identifier: 'face_recognized',
        name: '人脸识别',
        eventType: 'info',
        description: '识别到已知人脸',
        outputParams: '[{"name": "person_id", "type": "string", "description": "人员ID"}, {"name": "confidence", "type": "float", "description": "识别置信度"}]'
      },
      {
        id: 3,
        identifier: 'intrusion_alarm',
        name: '入侵报警',
        eventType: 'alarm',
        description: '检测到非法入侵',
        outputParams: '[{"name": "alarm_level", "type": "int", "description": "报警级别"}, {"name": "snapshot", "type": "string", "description": "抓拍图片URL"}]'
      }
    ],
    services: [
      {
        id: 1,
        identifier: 'ptz_control',
        name: '云台控制',
        callType: 'sync',
        description: '控制摄像头云台转动',
        inputParams: '[{"name": "pan", "type": "float", "description": "水平角度"}, {"name": "tilt", "type": "float", "description": "垂直角度"}, {"name": "zoom", "type": "int", "description": "变焦倍数"}]',
        outputParams: '[{"name": "result", "type": "boolean", "description": "执行结果"}, {"name": "message", "type": "string", "description": "结果描述"}]'
      },
      {
        id: 2,
        identifier: 'take_snapshot',
        name: '抓拍照片',
        callType: 'async',
        description: '抓拍当前画面并保存',
        inputParams: '[{"name": "quality", "type": "string", "description": "图片质量"}, {"name": "format", "type": "string", "description": "图片格式"}]',
        outputParams: '[{"name": "image_url", "type": "string", "description": "图片URL"}, {"name": "timestamp", "type": "string", "description": "抓拍时间"}]'
      },
      {
        id: 3,
        identifier: 'start_recording',
        name: '开始录制',
        callType: 'sync',
        description: '开始录制视频',
        inputParams: '[{"name": "duration", "type": "int", "description": "录制时长(秒)"}, {"name": "quality", "type": "string", "description": "录制质量"}]',
        outputParams: '[{"name": "recording_id", "type": "string", "description": "录制任务ID"}, {"name": "status", "type": "string", "description": "录制状态"}]'
      }
    ],
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-20 14:20:00'
  },
  {
    id: 2,
    name: 'Mesh电台物模型',
    code: 'mesh_radio_model',
    productId: 2,
    productName: '华为Mesh电台模板',
    productCode: 'HW_MESH_001',
    version: '1.2.0',
    status: 'active',
    description: 'Mesh自组网电台设备物模型，支持网络拓扑、信号强度等功能',
    properties: [
      {
        id: 1,
        identifier: 'signal_strength',
        name: '信号强度',
        dataType: 'int',
        accessMode: 'r',
        required: true,
        description: '当前信号强度值',
        specs: '范围：-100 ~ 0 dBm'
      },
      {
        id: 2,
        identifier: 'frequency',
        name: '工作频率',
        dataType: 'float',
        accessMode: 'rw',
        required: true,
        description: '设备工作频率',
        specs: '范围：400.0 ~ 470.0 MHz'
      },
      {
        id: 3,
        identifier: 'network_id',
        name: '网络ID',
        dataType: 'string',
        accessMode: 'rw',
        required: true,
        description: 'Mesh网络标识',
        specs: '长度：1-32字符'
      }
    ],
    events: [
      {
        id: 1,
        identifier: 'signal_weak',
        name: '信号弱',
        eventType: 'warning',
        description: '设备信号强度低于阈值',
        outputParams: '[{"name": "signal_strength", "type": "int", "description": "当前信号强度"}, {"name": "threshold", "type": "int", "description": "阈值"}]'
      },
      {
        id: 2,
        identifier: 'network_disconnected',
        name: '网络断开',
        eventType: 'error',
        description: 'Mesh网络连接断开',
        outputParams: '[{"name": "last_connected_time", "type": "string", "description": "最后连接时间"}, {"name": "reason", "type": "string", "description": "断开原因"}]'
      }
    ],
    services: [
      {
        id: 1,
        identifier: 'set_frequency',
        name: '设置频率',
        callType: 'sync',
        description: '设置设备工作频率',
        inputParams: '[{"name": "frequency", "type": "float", "description": "目标频率(MHz)"}]',
        outputParams: '[{"name": "result", "type": "boolean", "description": "设置结果"}, {"name": "actual_frequency", "type": "float", "description": "实际频率"}]'
      },
      {
        id: 2,
        identifier: 'join_network',
        name: '加入网络',
        callType: 'async',
        description: '加入指定的Mesh网络',
        inputParams: '[{"name": "network_id", "type": "string", "description": "网络ID"}, {"name": "password", "type": "string", "description": "网络密码"}]',
        outputParams: '[{"name": "join_result", "type": "boolean", "description": "加入结果"}, {"name": "node_id", "type": "string", "description": "节点ID"}]'
      }
    ],
    createTime: '2024-01-10 09:15:00',
    updateTime: '2024-01-25 16:45:00'
  },
  {
    id: 3,
    name: '温湿度传感器物模型',
    code: 'temp_humidity_sensor_model',
    productId: null,
    productName: null,
    productCode: null,
    version: '1.0.0',
    status: 'active',
    description: '温湿度传感器标准物模型，支持温度、湿度数据采集',
    properties: [
      {
        id: 1,
        identifier: 'temperature',
        name: '温度',
        dataType: 'float',
        accessMode: 'r',
        required: true,
        description: '环境温度值',
        specs: '范围：-40.0 ~ 85.0 ℃，精度：0.1℃'
      },
      {
        id: 2,
        identifier: 'humidity',
        name: '湿度',
        dataType: 'float',
        accessMode: 'r',
        required: true,
        description: '环境湿度值',
        specs: '范围：0.0 ~ 100.0 %RH，精度：0.1%'
      },
      {
        id: 3,
        identifier: 'sampling_interval',
        name: '采样间隔',
        dataType: 'int',
        accessMode: 'rw',
        required: false,
        description: '数据采样间隔时间',
        specs: '范围：1 ~ 3600 秒'
      }
    ],
    events: [],
    services: [],
    createTime: '2024-01-12 14:20:00',
    updateTime: '2024-01-18 11:30:00'
  },
  {
    id: 4,
    name: '智能网关物模型',
    code: 'smart_gateway_model',
    productId: null,
    productName: null,
    productCode: null,
    version: '2.0.0',
    status: 'draft',
    description: '智能网关设备物模型，支持多协议转换、设备管理等功能',
    properties: [
      {
        id: 1,
        identifier: 'online_devices',
        name: '在线设备数',
        dataType: 'int',
        accessMode: 'r',
        required: true,
        description: '当前在线的子设备数量',
        specs: '范围：0 ~ 1000'
      },
      {
        id: 2,
        identifier: 'cpu_usage',
        name: 'CPU使用率',
        dataType: 'float',
        accessMode: 'r',
        required: false,
        description: '网关CPU使用率',
        specs: '范围：0.0 ~ 100.0 %'
      }
    ],
    events: [],
    services: [],
    createTime: '2024-01-20 16:00:00',
    updateTime: '2024-01-20 16:00:00'
  },
  {
    id: 3,
    name: '370M基站物模型',
    code: '370m_base_station_model',
    productId: null,
    productName: null,
    productCode: null,
    version: '1.0.0',
    status: 'active',
    description: '370M频段基站设备物模型，支持大范围通信覆盖',
    properties: [
      {
        id: 1,
        identifier: 'transmission_power',
        name: '发射功率',
        dataType: 'float',
        accessMode: 'rw',
        required: true,
        description: '基站发射功率',
        specs: '范围：1.0 ~ 50.0 W'
      },
      {
        id: 2,
        identifier: 'frequency_band',
        name: '工作频段',
        dataType: 'string',
        accessMode: 'rw',
        required: true,
        description: '基站工作频段',
        specs: '370-390MHz'
      },
      {
        id: 3,
        identifier: 'coverage_radius',
        name: '覆盖半径',
        dataType: 'float',
        accessMode: 'r',
        required: false,
        description: '信号覆盖半径',
        specs: '范围：5.0 ~ 20.0 km'
      }
    ],
    events: [
      {
        id: 1,
        identifier: 'power_overload',
        name: '功率过载',
        eventType: 'alarm',
        description: '发射功率超过安全阈值',
        outputParams: '[{"name": "current_power", "type": "float", "description": "当前功率"}, {"name": "threshold", "type": "float", "description": "阈值"}]'
      }
    ],
    services: [
      {
        id: 1,
        identifier: 'adjust_power',
        name: '调整功率',
        callType: 'sync',
        description: '调整基站发射功率',
        inputParams: '[{"name": "target_power", "type": "float", "description": "目标功率"}]',
        outputParams: '[{"name": "result", "type": "boolean", "description": "调整结果"}]'
      }
    ],
    createTime: '2024-01-18 14:30:00',
    updateTime: '2024-01-21 09:15:00'
  }
];

// 获取物模型列表
export const getThingModelList = async (params = {}) => {
  await delay(500);
  
  const { page = 1, pageSize = 10, name = '', status = '' } = params;

  // 过滤数据
  let filteredData = thingModelData;

  if (name) {
    filteredData = filteredData.filter(item =>
      item.name.toLowerCase().includes(name.toLowerCase()) ||
      item.code.toLowerCase().includes(name.toLowerCase())
    );
  }
  
  if (status) {
    filteredData = filteredData.filter(item => item.status === status);
  }
  
  // 分页
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // 为每个物模型添加关联产品信息
  const enrichedData = await Promise.all(
    paginatedData.map(async (model) => {
      const associatedProducts = await getAssociatedProducts(model.id);
      return {
        ...model,
        associatedProducts,
        associatedProductCount: associatedProducts.length
      };
    })
  );

  return {
    success: true,
    data: {
      list: enrichedData,
      total: filteredData.length,
      page,
      pageSize
    },
    message: '获取成功'
  };
};

// 获取物模型详情
export const getThingModelDetail = async (id) => {
  await delay(300);
  
  const model = thingModelData.find(item => item.id === parseInt(id));
  
  if (model) {
    return {
      success: true,
      data: model,
      message: '获取成功'
    };
  } else {
    return {
      success: false,
      message: '物模型不存在'
    };
  }
};

// 创建物模型
export const createThingModel = async (data) => {
  await delay(800);
  
  // 检查编码是否重复
  const existingCode = thingModelData.find(item => item.code === data.code);
  if (existingCode) {
    return {
      success: false,
      message: '物模型编码已存在'
    };
  }
  
  const newModel = {
    id: Math.max(...thingModelData.map(item => item.id)) + 1,
    ...data,
    productCount: 0,
    // 保留传入的属性、事件、服务数据，如果没有则使用空数组
    properties: data.properties || [],
    events: data.events || [],
    services: data.services || [],
    createTime: new Date().toLocaleString('zh-CN'),
    updateTime: new Date().toLocaleString('zh-CN')
  };
  
  thingModelData.push(newModel);
  
  return {
    success: true,
    data: newModel,
    message: '创建成功'
  };
};

// 更新物模型
export const updateThingModel = async (id, data) => {
  await delay(800);
  
  const index = thingModelData.findIndex(item => item.id === parseInt(id));
  
  if (index === -1) {
    return {
      success: false,
      message: '物模型不存在'
    };
  }
  
  // 检查编码是否重复（排除自己）
  const existingCode = thingModelData.find(item => 
    item.code === data.code && item.id !== parseInt(id)
  );
  if (existingCode) {
    return {
      success: false,
      message: '物模型编码已存在'
    };
  }
  
  thingModelData[index] = {
    ...thingModelData[index],
    ...data,
    updateTime: new Date().toLocaleString('zh-CN')
  };
  
  return {
    success: true,
    data: thingModelData[index],
    message: '更新成功'
  };
};

// 删除物模型
export const deleteThingModel = async (id) => {
  await delay(500);
  
  const index = thingModelData.findIndex(item => item.id === parseInt(id));
  
  if (index === -1) {
    return {
      success: false,
      message: '物模型不存在'
    };
  }
  
  // 检查是否有关联产品
  const model = thingModelData[index];
  if (model.productCount > 0) {
    return {
      success: false,
      message: `该物模型已关联 ${model.productCount} 个产品，无法删除`
    };
  }
  
  thingModelData.splice(index, 1);
  
  return {
    success: true,
    message: '删除成功'
  };
};

// 导出物模型
export const exportThingModel = async (id) => {
  await delay(300);
  
  const model = thingModelData.find(item => item.id === parseInt(id));
  
  if (!model) {
    return {
      success: false,
      message: '物模型不存在'
    };
  }
  
  // 生成标准化的物模型JSON
  const exportData = {
    modelInfo: {
      modelId: model.code,
      modelName: model.name,
      version: model.version,
      deviceType: model.deviceType,
      description: model.description,
      createTime: model.createTime,
      updateTime: model.updateTime
    },
    properties: model.properties.map(p => ({
      identifier: p.identifier,
      name: p.name,
      dataType: p.dataType,
      accessMode: p.accessMode,
      required: p.required,
      description: p.description,
      specs: p.specs
    })),
    events: model.events || [],
    services: model.services || [],
    exportInfo: {
      exportTime: new Date().toISOString(),
      exportVersion: '1.0.0',
      format: 'JSON'
    }
  };
  
  return {
    success: true,
    data: exportData,
    message: '导出成功'
  };
};

// 获取物模型选项（用于产品关联）
export const getThingModelOptions = async () => {
  await delay(200);
  
  const options = thingModelData
    .filter(model => model.status === 'active')
    .map(model => ({
      value: model.id,
      label: model.name,
      code: model.code,
      deviceType: model.deviceType,
      version: model.version
    }));
  
  return {
    success: true,
    data: options,
    message: '获取成功'
  };
};
