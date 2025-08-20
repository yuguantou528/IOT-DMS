// 可视化监控服务

// 模拟设备数据 - 位于张家界国家森林公园区域
const mockDevices = [
  {
    id: 1,
    name: '智能摄像头-001',
    type: 'camera',
    status: 'online',
    position: [110.3245, 29.2156], // 张家界森林公园入口区域
    address: '湖南省张家界市武陵源区森林公园入口',
    lastUpdate: '2024-01-20 14:30:25',
    alarmCount: 2,
    videoUrl: 'https://example.com/video1.mp4',
    manufacturer: '海康威视',
    model: 'DS-2CD2T47G1-L',
    installDate: '2023-12-15',
    maintainer: '张三',
    phone: '13800138001',
    ip: '192.168.1.101',
    location: '湖南省张家界市武陵源区森林公园入口',
    lastOnline: '2024-01-20 14:30:25',
    description: '高清网络摄像头，支持夜视功能，用于重要区域监控'
  },
  {
    id: 2,
    name: 'Mesh电台-002',
    type: 'radio',
    status: 'online',
    position: [110.3567, 29.2389], // 黄石寨景区
    address: '湖南省张家界市武陵源区黄石寨景区',
    lastUpdate: '2024-01-20 14:28:15',
    alarmCount: 0,
    videoUrl: null,
    manufacturer: '华为',
    model: 'AR6280',
    installDate: '2023-11-20',
    maintainer: '李四',
    phone: '13800138002',
    ip: '192.168.1.102',
    location: '湖南省张家界市武陵源区黄石寨景区',
    lastOnline: '2024-01-20 14:28:15',
    description: 'Mesh网络电台，支持自组网和多跳中继通信'
  },
  {
    id: 3,
    name: '数字网关-003',
    type: 'sensor',
    status: 'offline',
    position: [110.2987, 29.1923], // 金鞭溪区域
    address: '湖南省张家界市武陵源区金鞭溪自然保护区',
    lastUpdate: '2024-01-20 13:45:10',
    alarmCount: 1,
    videoUrl: null,
    manufacturer: '汇川技术',
    model: 'TH-100',
    installDate: '2023-10-10',
    maintainer: '王五',
    phone: '13800138003',
    ip: '192.168.1.103',
    location: '湖南省张家界市武陵源区金鞭溪自然保护区',
    lastOnline: '2024-01-20 13:45:10',
    description: '多功能环境监测网关设备，监测温度、湿度、空气质量'
  },
  {
    id: 4,
    name: '智能摄像头-004',
    type: 'camera',
    status: 'online',
    position: [110.4123, 29.2678], // 袁家界景区
    address: '湖南省张家界市武陵源区袁家界景区',
    lastUpdate: '2024-01-20 14:32:08',
    alarmCount: 0,
    videoUrl: 'https://example.com/video4.mp4',
    manufacturer: '大华',
    model: 'DH-IPC-HFW4433M-I2',
    installDate: '2023-12-01',
    maintainer: '赵六',
    phone: '13800138004',
    ip: '192.168.1.104',
    location: '湖南省张家界市武陵源区袁家界景区',
    lastOnline: '2024-01-20 14:32:08',
    description: '球型云台摄像头，支持360度旋转和远程控制'
  },
  {
    id: 5,
    name: '370M基站-005',
    type: 'base_station',
    status: 'online',
    position: [110.3789, 29.3012], // 天子山区域
    address: '湖南省张家界市武陵源区天子山自然保护区',
    lastUpdate: '2024-01-20 14:35:12',
    alarmCount: 1,
    videoUrl: null,
    manufacturer: '中兴',
    model: 'ZTE-BS370',
    installDate: '2023-09-15',
    maintainer: '孙七',
    phone: '13800138005',
    ip: '192.168.1.105',
    location: '湖南省张家界市武陵源区天子山自然保护区',
    lastOnline: '2024-01-20 14:35:12',
    description: '370M基站设备，提供区域通信覆盖和数据中继服务'
  },
  {
    id: 6,
    name: '单兵执法记录仪-006',
    type: 'body_camera',
    status: 'online',
    position: [110.2654, 29.2534], // 十里画廊区域
    address: '湖南省张家界市武陵源区十里画廊景区',
    lastUpdate: '2024-01-20 14:40:15',
    alarmCount: 0,
    videoUrl: 'https://example.com/video6.mp4',
    manufacturer: '海康威视',
    model: 'DS-MH2111',
    installDate: '2024-01-10',
    maintainer: '李警官',
    phone: '13800138006',
    ip: '192.168.1.106',
    location: '湖南省张家界市武陵源区十里画廊景区',
    lastOnline: '2024-01-20 14:40:15',
    description: '单兵执法记录仪，支持高清录像、实时传输、GPS定位等功能'
  },
  {
    id: 7,
    name: '单兵执法记录仪-007',
    type: 'body_camera',
    status: 'offline',
    position: [110.4456, 29.1789], // 杨家界区域
    address: '湖南省张家界市武陵源区杨家界自然保护区',
    lastUpdate: '2024-01-20 13:20:30',
    alarmCount: 1,
    videoUrl: 'https://example.com/video7.mp4',
    manufacturer: '大华',
    model: 'DH-IVS-F7500-B',
    installDate: '2024-01-08',
    maintainer: '王警官',
    phone: '13800138007',
    ip: '192.168.1.107',
    location: '湖南省张家界市武陵源区杨家界自然保护区',
    lastOnline: '2024-01-20 13:20:30',
    description: '单兵执法记录仪，具备夜视功能和防水防震设计'
  }
];

// 模拟告警数据 - 更新为张家界森林公园区域坐标
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
    position: [110.3245, 29.2156], // 张家界森林公园入口区域
    description: '在监控区域内检测到可疑人员活动，请及时查看现场情况。建议立即查看实时视频画面并确认是否为正常活动。',
    handler: null,
    handleTime: null,
    handleResult: null,
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
    position: [110.3245, 29.2156], // 张家界森林公园入口区域
    description: '人脸识别系统检测到未授权人员，建议立即核实身份。该人员未在系统白名单中，可能存在安全风险。',
    handler: null,
    handleTime: null,
    handleResult: null,
    solution: '1. 立即查看现场视频\n2. 核实人员身份\n3. 联系安保部门\n4. 必要时启动应急预案'
  },
  {
    id: 3,
    deviceId: 3,
    deviceName: '数字网关-003',
    type: '温度异常',
    level: 'error',
    message: '温度超过阈值',
    time: '2024-01-20 13:45:10',
    status: 'active',
    position: [110.2987, 29.1923], // 金鞭溪区域
    description: '当前温度为45°C，超过设定阈值40°C，可能存在设备过热风险。环境温度异常可能影响设备正常运行。',
    handler: null,
    handleTime: null,
    handleResult: null,
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
    position: [110.3789, 29.3012], // 天子山区域
    description: '基站信号强度低于-85dBm，可能影响通信质量。信号强度偏低可能导致通信中断或质量下降。',
    handler: null,
    handleTime: null,
    handleResult: null,
    solution: '1. 检查天线连接状态\n2. 测试传输链路质量\n3. 检查周围是否有干扰源\n4. 调整天线方向或功率'
  },
  {
    id: 5,
    deviceId: 7,
    deviceName: '单兵执法记录仪-007',
    type: '设备离线告警',
    level: 'error',
    message: '设备失去连接',
    time: '2024-01-20 13:20:30',
    status: 'active',
    position: [110.4456, 29.1789], // 杨家界区域
    description: '执法记录仪设备失去网络连接，无法接收实时数据。可能是网络故障或设备电量不足。',
    handler: null,
    handleTime: null,
    handleResult: null,
    solution: '1. 检查设备电量状态\n2. 确认网络连接状态\n3. 联系现场执法人员\n4. 检查设备是否正常工作'
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
export const handleAlarm = async (alarmId, handleData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const alarmIndex = mockAlarms.findIndex(a => a.id === parseInt(alarmId));
      if (alarmIndex !== -1) {
        mockAlarms[alarmIndex] = {
          ...mockAlarms[alarmIndex],
          status: 'handled',
          handler: handleData.handler || '当前用户',
          handleTime: new Date().toLocaleString('zh-CN'),
          handleResult: handleData.handleResult
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
        alarmDevices: mockDevices.filter(d => d.alarmCount > 0).length, // 有告警的设备数量
        deviceTypes: {
          camera: mockDevices.filter(d => d.type === 'camera').length,
          radio: mockDevices.filter(d => d.type === 'radio').length,
          sensor: mockDevices.filter(d => d.type === 'sensor').length,
          base_station: mockDevices.filter(d => d.type === 'base_station').length,
          body_camera: mockDevices.filter(d => d.type === 'body_camera').length
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

// 模拟设备轨迹数据
const generateTrackData = (deviceId, startTime, endTime) => {
  const tracks = [];
  const device = mockDevices.find(d => d.id === deviceId);
  if (!device) return tracks;

  // 基础位置
  const basePosition = device.position;
  const startTimestamp = new Date(startTime).getTime();
  const endTimestamp = new Date(endTime).getTime();
  const duration = endTimestamp - startTimestamp;

  // 生成轨迹点（每10分钟一个点）
  const pointCount = Math.min(Math.max(Math.floor(duration / (10 * 60 * 1000)), 2), 50);

  for (let i = 0; i < pointCount; i++) {
    const timeOffset = (duration / (pointCount - 1)) * i;
    const timestamp = startTimestamp + timeOffset;

    // 在基础位置周围生成随机轨迹点
    const latOffset = (Math.random() - 0.5) * 0.01; // 约1km范围
    const lngOffset = (Math.random() - 0.5) * 0.01;

    tracks.push({
      id: i + 1,
      deviceId: deviceId,
      position: [basePosition[0] + lngOffset, basePosition[1] + latOffset],
      timestamp: timestamp,
      time: new Date(timestamp).toLocaleString('zh-CN'),
      speed: Math.random() * 60 + 10, // 10-70 km/h
      direction: Math.random() * 360, // 0-360度
      accuracy: Math.random() * 10 + 5 // 5-15米精度
    });
  }

  return tracks;
};

// 获取设备轨迹数据
export const getDeviceTrack = async (deviceId, startTime, endTime) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const trackData = generateTrackData(deviceId, startTime, endTime);

      resolve({
        success: true,
        data: {
          deviceId: deviceId,
          startTime: startTime,
          endTime: endTime,
          totalPoints: trackData.length,
          tracks: trackData
        }
      });
    }, 500);
  });
};
