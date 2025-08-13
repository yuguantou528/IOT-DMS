// 可视化监控服务

// 模拟设备数据
const mockDevices = [
  {
    id: 1,
    name: '智能摄像头-001',
    type: 'camera',
    status: 'online',
    position: [116.397428, 39.90923],
    address: '北京市朝阳区建国门外大街1号',
    lastUpdate: '2024-01-20 14:30:25',
    alarmCount: 2,
    videoUrl: 'https://example.com/video1.mp4',
    manufacturer: '海康威视',
    model: 'DS-2CD2T47G1-L',
    installDate: '2023-12-15',
    maintainer: '张三',
    phone: '13800138001',
    ip: '192.168.1.101',
    location: '北京市朝阳区建国门外大街1号',
    lastOnline: '2024-01-20 14:30:25',
    description: '高清网络摄像头，支持夜视功能，用于重要区域监控'
  },
  {
    id: 2,
    name: 'Mesh电台-002',
    type: 'radio',
    status: 'online',
    position: [116.407428, 39.91923],
    address: '北京市朝阳区建国门外大街2号',
    lastUpdate: '2024-01-20 14:28:15',
    alarmCount: 0,
    videoUrl: null,
    manufacturer: '华为',
    model: 'AR6280',
    installDate: '2023-11-20',
    maintainer: '李四',
    phone: '13800138002',
    ip: '192.168.1.102',
    location: '北京市朝阳区建国门外大街2号',
    lastOnline: '2024-01-20 14:28:15',
    description: 'Mesh网络电台，支持自组网和多跳中继通信'
  },
  {
    id: 3,
    name: '温湿度传感器-003',
    type: 'sensor',
    status: 'offline',
    position: [116.387428, 39.89923],
    address: '北京市朝阳区建国门外大街3号',
    lastUpdate: '2024-01-20 13:45:10',
    alarmCount: 1,
    videoUrl: null,
    manufacturer: '汇川技术',
    model: 'TH-100',
    installDate: '2023-10-10',
    maintainer: '王五',
    phone: '13800138003',
    ip: '192.168.1.103',
    location: '北京市朝阳区建国门外大街3号',
    lastOnline: '2024-01-20 13:45:10',
    description: '多功能环境监测传感器，监测温度、湿度、空气质量'
  },
  {
    id: 4,
    name: '智能摄像头-004',
    type: 'camera',
    status: 'online',
    position: [116.417428, 39.92923],
    address: '北京市朝阳区建国门外大街4号',
    lastUpdate: '2024-01-20 14:32:08',
    alarmCount: 0,
    videoUrl: 'https://example.com/video4.mp4',
    manufacturer: '大华',
    model: 'DH-IPC-HFW4433M-I2',
    installDate: '2023-12-01',
    maintainer: '赵六',
    phone: '13800138004',
    ip: '192.168.1.104',
    location: '北京市朝阳区建国门外大街4号',
    lastOnline: '2024-01-20 14:32:08',
    description: '球型云台摄像头，支持360度旋转和远程控制'
  },
  {
    id: 5,
    name: '370M基站-005',
    type: 'base_station',
    status: 'online',
    position: [116.427428, 39.88923],
    address: '北京市朝阳区建国门外大街5号',
    lastUpdate: '2024-01-20 14:35:12',
    alarmCount: 1,
    videoUrl: null,
    manufacturer: '中兴',
    model: 'ZTE-BS370',
    installDate: '2023-09-15',
    maintainer: '孙七',
    phone: '13800138005',
    ip: '192.168.1.105',
    location: '北京市朝阳区建国门外大街5号',
    lastOnline: '2024-01-20 14:35:12',
    description: '370M基站设备，提供区域通信覆盖和数据中继服务'
  }
];

// 模拟告警数据
const mockAlarms = [
  {
    id: 1,
    deviceId: 1,
    deviceName: '智能摄像头-001',
    type: '运动检测告警',
    level: 'warning',
    message: '检测到异常移动',
    time: '2024-01-20 14:30:25',
    status: 'active',
    position: [116.397428, 39.90923],
    description: '在监控区域内检测到可疑人员活动，请及时查看现场情况。建议立即查看实时视频画面并确认是否为正常活动。',
    handler: null,
    handleTime: null,
    solution: '1. 立即查看实时视频画面\n2. 确认移动物体性质\n3. 如有必要，派遣安保人员现场查看\n4. 记录事件详情'
  },
  {
    id: 2,
    deviceId: 1,
    deviceName: '智能摄像头-001',
    type: '人脸识别告警',
    level: 'alarm',
    message: '检测到未知人员',
    time: '2024-01-20 14:25:18',
    status: 'active',
    position: [116.397428, 39.90923],
    description: '人脸识别系统检测到未授权人员，建议立即核实身份。该人员未在系统白名单中，可能存在安全风险。',
    handler: null,
    handleTime: null,
    solution: '1. 立即查看现场视频\n2. 核实人员身份\n3. 联系安保部门\n4. 必要时启动应急预案'
  },
  {
    id: 3,
    deviceId: 3,
    deviceName: '温湿度传感器-003',
    type: '温度异常',
    level: 'error',
    message: '温度超过阈值',
    time: '2024-01-20 13:45:10',
    status: 'active',
    position: [116.387428, 39.89923],
    description: '当前温度为45°C，超过设定阈值40°C，可能存在设备过热风险。环境温度异常可能影响设备正常运行。',
    handler: null,
    handleTime: null,
    solution: '1. 检查空调或通风系统\n2. 确认是否有热源异常\n3. 检查设备散热情况\n4. 必要时启动应急降温措施'
  },
  {
    id: 4,
    deviceId: 5,
    deviceName: '370M基站-005',
    type: '信号质量告警',
    level: 'warning',
    message: '信号强度低',
    time: '2024-01-20 14:20:30',
    status: 'active',
    position: [116.427428, 39.88923],
    description: '基站信号强度低于-85dBm，可能影响通信质量。信号强度偏低可能导致通信中断或质量下降。',
    handler: null,
    handleTime: null,
    solution: '1. 检查天线连接状态\n2. 测试传输链路质量\n3. 检查周围是否有干扰源\n4. 调整天线方向或功率'
  }
];

// 获取设备列表
export const getDeviceList = async (params = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredDevices = [...mockDevices];
      
      // 根据状态筛选
      if (params.status) {
        filteredDevices = filteredDevices.filter(device => device.status === params.status);
      }
      
      // 根据类型筛选
      if (params.type) {
        filteredDevices = filteredDevices.filter(device => device.type === params.type);
      }
      
      // 根据名称搜索
      if (params.name) {
        filteredDevices = filteredDevices.filter(device => 
          device.name.toLowerCase().includes(params.name.toLowerCase())
        );
      }
      
      resolve({
        success: true,
        data: filteredDevices,
        total: filteredDevices.length
      });
    }, 300);
  });
};

// 获取设备详情
export const getDeviceDetail = async (deviceId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const device = mockDevices.find(d => d.id === parseInt(deviceId));
      if (device) {
        resolve({
          success: true,
          data: device
        });
      } else {
        resolve({
          success: false,
          message: '设备不存在'
        });
      }
    }, 200);
  });
};

// 获取告警列表
export const getAlarmList = async (params = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredAlarms = [...mockAlarms];
      
      // 根据级别筛选
      if (params.level) {
        filteredAlarms = filteredAlarms.filter(alarm => alarm.level === params.level);
      }
      
      // 根据状态筛选
      if (params.status) {
        filteredAlarms = filteredAlarms.filter(alarm => alarm.status === params.status);
      }
      
      // 根据设备筛选
      if (params.deviceId) {
        filteredAlarms = filteredAlarms.filter(alarm => alarm.deviceId === parseInt(params.deviceId));
      }
      
      resolve({
        success: true,
        data: filteredAlarms,
        total: filteredAlarms.length
      });
    }, 300);
  });
};

// 处理告警
export const handleAlarm = async (alarmId, handler) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const alarmIndex = mockAlarms.findIndex(a => a.id === parseInt(alarmId));
      if (alarmIndex !== -1) {
        mockAlarms[alarmIndex] = {
          ...mockAlarms[alarmIndex],
          status: 'handled',
          handler: handler,
          handleTime: new Date().toLocaleString('zh-CN')
        };
        
        resolve({
          success: true,
          message: '告警处理成功'
        });
      } else {
        resolve({
          success: false,
          message: '告警不存在'
        });
      }
    }, 200);
  });
};

// 获取统计数据
export const getStatistics = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const stats = {
        totalDevices: mockDevices.length,
        onlineDevices: mockDevices.filter(d => d.status === 'online').length,
        offlineDevices: mockDevices.filter(d => d.status === 'offline').length,
        activeAlarms: mockAlarms.filter(a => a.status === 'active').length,
        handledAlarms: mockAlarms.filter(a => a.status === 'handled').length,
        deviceTypes: {
          camera: mockDevices.filter(d => d.type === 'camera').length,
          radio: mockDevices.filter(d => d.type === 'radio').length,
          sensor: mockDevices.filter(d => d.type === 'sensor').length,
          base_station: mockDevices.filter(d => d.type === 'base_station').length
        },
        alarmLevels: {
          info: mockAlarms.filter(a => a.level === 'info').length,
          warning: mockAlarms.filter(a => a.level === 'warning').length,
          error: mockAlarms.filter(a => a.level === 'error').length,
          alarm: mockAlarms.filter(a => a.level === 'alarm').length
        }
      };
      
      resolve({
        success: true,
        data: stats
      });
    }, 200);
  });
};
