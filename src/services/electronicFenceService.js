import moment from 'moment';

// 模拟电子围栏数据
const mockElectronicFences = [
  {
    id: 1,
    name: '张家界核心景区围栏',
    type: 'polygon', // polygon: 多边形, circle: 圆形
    description: '张家界国家森林公园核心景区电子围栏，用于监控游客和设备进出',
    status: 'active', // active: 启用, inactive: 禁用
    alarmType: 'enter', // enter: 进入告警, exit: 离开告警, both: 进出都告警
    coordinates: [
      [29.2520, 110.3480], // 纬度，经度
      [29.2540, 110.3520],
      [29.2560, 110.3540],
      [29.2580, 110.3520],
      [29.2570, 110.3480],
      [29.2550, 110.3460],
      [29.2530, 110.3470]
    ],
    center: null, // 圆形围栏的中心点
    radius: null, // 圆形围栏的半径（米）
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-20 14:25:00',
    creator: '管理员',
    deviceCount: 3, // 关联设备数量
    alarmCount: 1, // 告警次数
    alarms: [ // 告警记录
      {
        id: 7,
        alarmTime: '2024-01-15 16:20:45',
        alarmType: 'enter',
        deviceName: '海康威视摄像头-001',
        deviceCode: 'HK-CAM-001',
        description: '检测到海康威视摄像头-001进入核心景区围栏区域，触发进入告警',
        status: 'resolved',
        handler: '李巡护员',
        handleTime: '2024-01-15 16:45:00'
      }
    ], // 告警记录
    associatedDevices: [ // 关联的设备列表
      {
        id: 1,
        name: '海康威视摄像头-001',
        deviceCode: 'HK-CAM-001',
        deviceType: 'network_camera',
        manufacturerName: '海康威视数字技术股份有限公司',
        status: 'online',
        location: '大门入口',
        associatedTime: '2024-01-15 10:30:00'
      },
      {
        id: 2,
        name: 'Mesh电台-001',
        deviceCode: 'MESH-001',
        deviceType: 'mesh_radio',
        manufacturerName: '华为技术有限公司',
        status: 'online',
        location: '中继站点A',
        associatedTime: '2024-01-15 11:15:00'
      },
      {
        id: 3,
        name: '370M基站-002',
        deviceCode: '370M-002',
        deviceType: '370m_base_station',
        manufacturerName: '中兴通讯股份有限公司',
        status: 'online',
        location: '核心景区中心',
        associatedTime: '2024-01-15 12:00:00'
      }
    ]
  },
  {
    id: 2,
    name: '天门山缆车站围栏',
    type: 'circle',
    description: '天门山缆车站周边安全区域围栏，监控设备和人员活动',
    status: 'active',
    alarmType: 'both',
    coordinates: null,
    center: [29.2600, 110.3600], // 纬度，经度
    radius: 500, // 500米半径
    createTime: '2024-01-16 09:15:00',
    updateTime: '2024-01-18 16:30:00',
    creator: '安全管理员',
    deviceCount: 12,
    alarmCount: 4,
    alarms: [ // 告警记录
      {
        id: 1,
        alarmTime: '2024-01-16 14:30:15',
        alarmType: 'enter',
        deviceName: 'Mesh电台-003',
        deviceCode: 'MESH-003',
        description: '检测到Mesh电台-003进入缆车站安全区域，触发进入告警',
        status: 'resolved',
        handler: '张工程师',
        handleTime: '2024-01-16 15:45:30'
      },
      {
        id: 2,
        alarmTime: '2024-01-16 16:22:08',
        alarmType: 'exit',
        deviceName: '370M基站-004',
        deviceCode: '370M-004',
        description: '检测到370M基站-004离开缆车站安全区域，触发离开告警',
        status: 'processing',
        handler: '李技术员',
        handleTime: '2024-01-16 16:30:00'
      },
      {
        id: 3,
        alarmTime: '2024-01-16 18:15:42',
        alarmType: 'enter',
        deviceName: '海康威视摄像头-002',
        deviceCode: 'HK-CAM-002',
        description: '检测到海康威视摄像头-002进入缆车站安全区域，触发进入告警',
        status: 'pending',
        handler: null,
        handleTime: null
      },
      {
        id: 8,
        alarmTime: '2024-01-17 10:30:25',
        alarmType: 'exit',
        deviceName: '单兵执法记录仪-002',
        deviceCode: 'BODY-002',
        description: '检测到单兵执法记录仪-002离开缆车站安全区域，触发离开告警',
        status: 'processing',
        handler: '赵技术员',
        handleTime: '2024-01-17 10:45:00'
      }
    ],
    associatedDevices: [ // 关联的设备列表
      {
        id: 4,
        name: '海康威视摄像头-002',
        deviceCode: 'HK-CAM-002',
        deviceType: 'network_camera',
        manufacturerName: '海康威视数字技术股份有限公司',
        status: 'online',
        location: '缆车站入口',
        associatedTime: '2024-01-16 09:30:00'
      },
      {
        id: 5,
        name: '海康威视摄像头-003',
        deviceCode: 'HK-CAM-003',
        deviceType: 'network_camera',
        manufacturerName: '海康威视数字技术股份有限公司',
        status: 'online',
        location: '缆车站出口',
        associatedTime: '2024-01-16 09:45:00'
      },
      {
        id: 6,
        name: 'Mesh电台-002',
        deviceCode: 'MESH-002',
        deviceType: 'mesh_radio',
        manufacturerName: '华为技术有限公司',
        status: 'online',
        location: '缆车站中继点',
        associatedTime: '2024-01-16 10:00:00'
      },
      {
        id: 7,
        name: '370M基站-003',
        deviceCode: '370M-003',
        deviceType: '370m_base_station',
        manufacturerName: '中兴通讯股份有限公司',
        status: 'online',
        location: '缆车站通信点',
        associatedTime: '2024-01-16 10:15:00'
      },
      {
        id: 8,
        name: '卫星通信设备-001',
        deviceCode: 'SAT-001',
        deviceType: 'satellite_communication',
        manufacturerName: '华为技术有限公司',
        status: 'online',
        location: '缆车站顶部',
        associatedTime: '2024-01-16 10:30:00'
      },
      {
        id: 9,
        name: '单兵执法记录仪-001',
        deviceCode: 'BODY-001',
        deviceType: 'body_camera',
        manufacturerName: '海康威视数字技术股份有限公司',
        status: 'online',
        location: '安保人员1',
        associatedTime: '2024-01-16 11:00:00'
      },
      {
        id: 10,
        name: '单兵执法记录仪-002',
        deviceCode: 'BODY-002',
        deviceType: 'body_camera',
        manufacturerName: '海康威视数字技术股份有限公司',
        status: 'online',
        location: '安保人员2',
        associatedTime: '2024-01-16 11:15:00'
      },
      {
        id: 11,
        name: '应急指挥车布控球-001',
        deviceCode: 'CMD-001',
        deviceType: 'command_vehicle',
        manufacturerName: '海康威视数字技术股份有限公司',
        status: 'online',
        location: '缆车站广场',
        associatedTime: '2024-01-16 11:30:00'
      },
      {
        id: 12,
        name: '固定站光电重载云台-001',
        deviceCode: 'PTZ-001',
        deviceType: 'ptz_camera',
        manufacturerName: '海康威视数字技术股份有限公司',
        status: 'online',
        location: '缆车站制高点',
        associatedTime: '2024-01-16 12:00:00'
      },
      {
        id: 13,
        name: 'Mesh电台-003',
        deviceCode: 'MESH-003',
        deviceType: 'mesh_radio',
        manufacturerName: '华为技术有限公司',
        status: 'offline',
        location: '缆车站备用点',
        associatedTime: '2024-01-16 12:15:00'
      },
      {
        id: 14,
        name: '370M基站-004',
        deviceCode: '370M-004',
        deviceType: '370m_base_station',
        manufacturerName: '中兴通讯股份有限公司',
        status: 'fault',
        location: '缆车站维护点',
        associatedTime: '2024-01-16 12:30:00'
      },
      {
        id: 15,
        name: '卫星通信设备-002',
        deviceCode: 'SAT-002',
        deviceType: 'satellite_communication',
        manufacturerName: '华为技术有限公司',
        status: 'online',
        location: '缆车站应急点',
        associatedTime: '2024-01-16 12:45:00'
      }
    ]
  },
  {
    id: 3,
    name: '金鞭溪保护区围栏',
    type: 'polygon',
    description: '金鞭溪生态保护区围栏，防止设备进入敏感区域',
    status: 'inactive',
    alarmType: 'enter',
    coordinates: [
      [29.2400, 110.3300],
      [29.2420, 110.3350],
      [29.2450, 110.3380],
      [29.2470, 110.3360],
      [29.2460, 110.3320],
      [29.2430, 110.3290]
    ],
    center: null,
    radius: null,
    createTime: '2024-01-10 14:20:00',
    updateTime: '2024-01-12 11:45:00',
    creator: '环保管理员',
    deviceCount: 8,
    alarmCount: 2,
    alarms: [ // 告警记录
      {
        id: 4,
        alarmTime: '2024-01-12 09:45:20',
        alarmType: 'enter',
        deviceName: '单兵执法记录仪-004',
        deviceCode: 'BODY-004',
        description: '检测到设备进入生态保护敏感区域，需要确认是否为授权巡护活动',
        status: 'resolved',
        handler: '王管理员',
        handleTime: '2024-01-12 10:15:00'
      },
      {
        id: 9,
        alarmTime: '2024-01-18 14:20:30',
        alarmType: 'enter',
        deviceName: 'Mesh电台-007',
        deviceCode: 'MESH-007',
        description: '检测到Mesh电台-007进入金鞭溪生态保护敏感区域，触发进入告警',
        status: 'processing',
        handler: '环保巡护员',
        handleTime: '2024-01-18 14:30:00'
      }
    ],
    associatedDevices: [ // 关联的设备列表
      {
        id: 16,
        name: '海康威视摄像头-004',
        deviceCode: 'HK-CAM-004',
        deviceType: 'network_camera',
        manufacturerName: '海康威视数字技术股份有限公司',
        status: 'online',
        location: '金鞭溪入口',
        associatedTime: '2024-01-10 15:00:00'
      },
      {
        id: 17,
        name: '海康威视摄像头-005',
        deviceCode: 'HK-CAM-005',
        deviceType: 'network_camera',
        manufacturerName: '海康威视数字技术股份有限公司',
        status: 'online',
        location: '金鞭溪中段',
        associatedTime: '2024-01-10 15:15:00'
      },
      {
        id: 18,
        name: 'Mesh电台-004',
        deviceCode: 'MESH-004',
        deviceType: 'mesh_radio',
        manufacturerName: '华为技术有限公司',
        status: 'online',
        location: '保护区监测点1',
        associatedTime: '2024-01-10 15:30:00'
      },
      {
        id: 19,
        name: 'Mesh电台-005',
        deviceCode: 'MESH-005',
        deviceType: 'mesh_radio',
        manufacturerName: '华为技术有限公司',
        status: 'online',
        location: '保护区监测点2',
        associatedTime: '2024-01-10 15:45:00'
      },
      {
        id: 20,
        name: '370M基站-005',
        deviceCode: '370M-005',
        deviceType: '370m_base_station',
        manufacturerName: '中兴通讯股份有限公司',
        status: 'online',
        location: '保护区通信基站',
        associatedTime: '2024-01-10 16:00:00'
      },
      {
        id: 21,
        name: '单兵执法记录仪-003',
        deviceCode: 'BODY-003',
        deviceType: 'body_camera',
        manufacturerName: '海康威视数字技术股份有限公司',
        status: 'online',
        location: '巡护员1',
        associatedTime: '2024-01-10 16:15:00'
      },
      {
        id: 22,
        name: '单兵执法记录仪-004',
        deviceCode: 'BODY-004',
        deviceType: 'body_camera',
        manufacturerName: '海康威视数字技术股份有限公司',
        status: 'offline',
        location: '巡护员2',
        associatedTime: '2024-01-10 16:30:00'
      },
      {
        id: 23,
        name: '固定站光电重载云台-002',
        deviceCode: 'PTZ-002',
        deviceType: 'ptz_camera',
        manufacturerName: '海康威视数字技术股份有限公司',
        status: 'online',
        location: '保护区观测点',
        associatedTime: '2024-01-10 16:45:00'
      }
    ]
  },
  {
    id: 4,
    name: '停车场监控围栏',
    type: 'circle',
    description: '主要停车场区域围栏，监控车辆和设备状态',
    status: 'active',
    alarmType: 'exit',
    coordinates: null,
    center: [29.2450, 110.3450],
    radius: 200,
    createTime: '2024-01-20 08:00:00',
    updateTime: '2024-01-22 10:15:00',
    creator: '设施管理员',
    deviceCount: 5,
    alarmCount: 2,
    alarms: [ // 告警记录
      {
        id: 5,
        alarmTime: '2024-01-22 11:30:15',
        alarmType: 'exit',
        deviceName: '海康威视摄像头-006',
        deviceCode: 'HK-CAM-006',
        description: '检测到海康威视摄像头-006离开停车场监控区域，触发离开告警',
        status: 'resolved',
        handler: '王管理员',
        handleTime: '2024-01-22 12:00:00'
      },
      {
        id: 6,
        alarmTime: '2024-01-22 15:45:30',
        alarmType: 'exit',
        deviceName: '应急指挥车布控球-002',
        deviceCode: 'CMD-002',
        deviceType: 'command_vehicle',
        description: '检测到应急指挥车布控球-002离开停车场监控区域，触发离开告警',
        status: 'pending',
        handler: null,
        handleTime: null
      }
    ], // 告警记录
    associatedDevices: [
      {
        id: 24,
        name: '海康威视摄像头-006',
        deviceCode: 'HK-CAM-006',
        deviceType: 'network_camera',
        manufacturerName: '海康威视数字技术股份有限公司',
        status: 'online',
        location: '停车场入口',
        associatedTime: '2024-01-20 08:30:00'
      },
      {
        id: 25,
        name: '海康威视摄像头-007',
        deviceCode: 'HK-CAM-007',
        deviceType: 'network_camera',
        manufacturerName: '海康威视数字技术股份有限公司',
        status: 'online',
        location: '停车场出口',
        associatedTime: '2024-01-20 08:45:00'
      },
      {
        id: 26,
        name: '370M基站-006',
        deviceCode: '370M-006',
        deviceType: '370m_base_station',
        manufacturerName: '中兴通讯股份有限公司',
        status: 'online',
        location: '停车场中央',
        associatedTime: '2024-01-20 09:00:00'
      },
      {
        id: 27,
        name: 'Mesh电台-006',
        deviceCode: 'MESH-006',
        deviceType: 'mesh_radio',
        manufacturerName: '华为技术有限公司',
        status: 'online',
        location: '停车场管理处',
        associatedTime: '2024-01-20 09:15:00'
      },
      {
        id: 28,
        name: '应急指挥车布控球-002',
        deviceCode: 'CMD-002',
        deviceType: 'command_vehicle',
        manufacturerName: '海康威视数字技术股份有限公司',
        status: 'offline',
        location: '停车场应急点',
        associatedTime: '2024-01-20 09:30:00'
      }
    ]
  }
];

// 获取围栏列表
export const getElectronicFences = async (params = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredData = [...mockElectronicFences];
      
      // 根据名称搜索
      if (params.name) {
        filteredData = filteredData.filter(fence => 
          fence.name.toLowerCase().includes(params.name.toLowerCase())
        );
      }
      
      // 根据类型筛选
      if (params.type) {
        filteredData = filteredData.filter(fence => fence.type === params.type);
      }
      
      // 根据状态筛选
      if (params.status) {
        filteredData = filteredData.filter(fence => fence.status === params.status);
      }
      
      // 分页处理
      const pageSize = params.pageSize || 10;
      const current = params.current || 1;
      const start = (current - 1) * pageSize;
      const end = start + pageSize;
      const paginatedData = filteredData.slice(start, end);
      
      resolve({
        success: true,
        data: paginatedData,
        total: filteredData.length,
        current: current,
        pageSize: pageSize
      });
    }, 300);
  });
};

// 获取围栏详情
export const getElectronicFenceDetail = async (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const fence = mockElectronicFences.find(item => item.id === parseInt(id));
      if (fence) {
        resolve({
          success: true,
          data: fence
        });
      } else {
        resolve({
          success: false,
          message: '围栏不存在'
        });
      }
    }, 200);
  });
};

// 创建围栏
export const createElectronicFence = async (fenceData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newFence = {
        id: Math.max(...mockElectronicFences.map(f => f.id)) + 1,
        ...fenceData,
        createTime: moment().format('YYYY-MM-DD HH:mm:ss'),
        updateTime: moment().format('YYYY-MM-DD HH:mm:ss'),
        creator: '当前用户',
        deviceCount: fenceData.associatedDevices ? fenceData.associatedDevices.length : 0,
        alarmCount: 0,
        associatedDevices: fenceData.associatedDevices || []
      };
      
      mockElectronicFences.unshift(newFence);
      
      resolve({
        success: true,
        data: newFence,
        message: '围栏创建成功'
      });
    }, 500);
  });
};

// 更新围栏
export const updateElectronicFence = async (id, fenceData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockElectronicFences.findIndex(item => item.id === parseInt(id));
      if (index !== -1) {
        mockElectronicFences[index] = {
          ...mockElectronicFences[index],
          ...fenceData,
          updateTime: moment().format('YYYY-MM-DD HH:mm:ss'),
          deviceCount: fenceData.associatedDevices ? fenceData.associatedDevices.length : mockElectronicFences[index].deviceCount,
          associatedDevices: fenceData.associatedDevices || mockElectronicFences[index].associatedDevices || []
        };
        
        resolve({
          success: true,
          data: mockElectronicFences[index],
          message: '围栏更新成功'
        });
      } else {
        resolve({
          success: false,
          message: '围栏不存在'
        });
      }
    }, 500);
  });
};

// 删除围栏
export const deleteElectronicFence = async (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockElectronicFences.findIndex(item => item.id === parseInt(id));
      if (index !== -1) {
        mockElectronicFences.splice(index, 1);
        resolve({
          success: true,
          message: '围栏删除成功'
        });
      } else {
        resolve({
          success: false,
          message: '围栏不存在'
        });
      }
    }, 300);
  });
};

// 批量删除围栏
export const batchDeleteElectronicFences = async (ids) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const deletedCount = ids.filter(id => {
        const index = mockElectronicFences.findIndex(item => item.id === parseInt(id));
        if (index !== -1) {
          mockElectronicFences.splice(index, 1);
          return true;
        }
        return false;
      }).length;
      
      resolve({
        success: true,
        message: `成功删除 ${deletedCount} 个围栏`
      });
    }, 500);
  });
};

// 切换围栏状态
export const toggleElectronicFenceStatus = async (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockElectronicFences.findIndex(item => item.id === parseInt(id));
      if (index !== -1) {
        const currentStatus = mockElectronicFences[index].status;
        mockElectronicFences[index].status = currentStatus === 'active' ? 'inactive' : 'active';
        mockElectronicFences[index].updateTime = moment().format('YYYY-MM-DD HH:mm:ss');
        
        resolve({
          success: true,
          data: mockElectronicFences[index],
          message: `围栏已${mockElectronicFences[index].status === 'active' ? '启用' : '禁用'}`
        });
      } else {
        resolve({
          success: false,
          message: '围栏不存在'
        });
      }
    }, 300);
  });
};

// 获取围栏统计信息
export const getElectronicFenceStats = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const total = mockElectronicFences.length;
      const active = mockElectronicFences.filter(f => f.status === 'active').length;
      const inactive = total - active;
      const polygonCount = mockElectronicFences.filter(f => f.type === 'polygon').length;
      const circleCount = mockElectronicFences.filter(f => f.type === 'circle').length;
      const totalDevices = mockElectronicFences.reduce((sum, f) => sum + f.deviceCount, 0);
      const totalAlarms = mockElectronicFences.reduce((sum, f) => sum + f.alarmCount, 0);
      
      resolve({
        success: true,
        data: {
          total,
          active,
          inactive,
          polygonCount,
          circleCount,
          totalDevices,
          totalAlarms
        }
      });
    }, 200);
  });
};
