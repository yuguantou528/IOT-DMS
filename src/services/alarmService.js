// 告警管理服务
import moment from 'moment';

// 模拟告警消息数据
const mockAlarmMessages = [
  {
    id: 1,
    deviceId: 1,
    deviceName: '智能摄像头-001',
    alarmType: 'device_offline',
    alarmLevel: 'error',
    alarmTitle: '设备离线告警',
    alarmDescription: '设备连接中断，无法获取实时数据，请检查网络连接和设备电源状态',
    alarmTime: '2024-01-20 14:30:25',
    status: 'pending',
    handler: null,
    handleTime: null,
    handleRemark: null,
    location: '北京市朝阳区xxx大厦1楼监控室',
    deviceType: '网络摄像头',
    ruleId: 1,
    ruleName: '设备离线告警规则'
  },
  {
    id: 6,
    deviceId: 1,
    deviceName: '智能摄像头-001',
    alarmType: 'video_quality',
    alarmLevel: 'warning',
    alarmTitle: '视频质量异常',
    alarmDescription: '检测到视频画面模糊，可能是镜头污损或焦距调节问题，建议检查设备状态',
    alarmTime: '2024-01-20 13:15:42',
    status: 'pending',
    handler: null,
    handleTime: null,
    handleRemark: null,
    location: '湖南省张家界市武陵源区森林公园入口',
    deviceType: '网络摄像头',
    ruleId: 5,
    ruleName: '视频质量监控规则'
  },
  {
    id: 2,
    deviceId: 2,
    deviceName: 'Mesh电台-002',
    alarmType: 'parameter_abnormal',
    alarmLevel: 'warning',
    alarmTitle: '信号强度异常',
    alarmDescription: '设备信号强度低于正常阈值，当前值为-85dBm，可能影响通信质量',
    alarmTime: '2024-01-20 14:25:18',
    status: 'processing',
    handler: '张三',
    handleTime: '2024-01-20 14:35:00',
    handleRemark: '正在检查设备天线连接，已派遣技术人员前往现场',
    location: '北京市海淀区xxx园区通信基站',
    deviceType: 'Mesh电台',
    ruleId: 3,
    ruleName: '信号强度低告警规则'
  },
  {
    id: 3,
    deviceId: 3,
    deviceName: '数字对讲机-003',
    alarmType: 'data_anomaly',
    alarmLevel: 'critical',
    alarmTitle: '温度数据异常',
    alarmDescription: '检测到温度值超出安全范围，当前温度85°C，超过阈值80°C，可能存在安全隐患',
    alarmTime: '2024-01-20 14:20:10',
    status: 'resolved',
    handler: '李四',
    handleTime: '2024-01-20 14:45:00',
    handleRemark: '已确认为对讲机故障，已更换新设备，温度恢复正常',
    location: '上海市浦东新区xxx工厂车间A区',
    deviceType: '对讲机',
    ruleId: 2,
    ruleName: '温度异常告警规则'
  },
  {
    id: 4,
    deviceId: 4,
    deviceName: '370M基站-004',
    alarmType: 'connection_timeout',
    alarmLevel: 'error',
    alarmTitle: '连接超时告警',
    alarmDescription: '设备连接超时，连续3次心跳检测失败，可能存在网络故障',
    alarmTime: '2024-01-20 13:45:30',
    status: 'resolved',
    handler: '王五',
    handleTime: '2024-01-20 14:10:00',
    handleRemark: '网络故障已修复，设备连接恢复正常',
    location: '广州市天河区xxx通信塔',
    deviceType: '370M基站',
    ruleId: 4,
    ruleName: '连接超时告警规则'
  },
  {
    id: 5,
    deviceId: 5,
    deviceName: '卫星通信设备-005',
    alarmType: 'security_alert',
    alarmLevel: 'critical',
    alarmTitle: '安全告警',
    alarmDescription: '检测到异常访问尝试，可能存在安全威胁，建议立即检查',
    alarmTime: '2024-01-20 13:30:15',
    status: 'pending',
    handler: null,
    handleTime: null,
    handleRemark: null,
    location: '深圳市南山区xxx指挥中心',
    deviceType: '卫星通信设备',
    ruleId: 5,
    ruleName: '安全告警规则'
  }
];

// 模拟告警规则数据
const mockAlarmRules = [
  {
    id: 1,
    ruleName: '设备离线告警规则',
    deviceType: 'network_camera',
    parameter: 'connection_status',
    operator: 'eq',
    threshold: 'offline',
    alarmLevel: 'error',
    enabled: true,
    description: '当设备连接状态为离线时触发告警，用于及时发现设备故障',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-20 14:25:00'
  },
  {
    id: 2,
    ruleName: '温度异常告警规则',
    deviceType: 'sensor',
    parameter: 'temperature',
    operator: 'gt',
    threshold: '80',
    alarmLevel: 'warning',
    enabled: true,
    description: '当对讲机检测值超过80度时触发告警，防止设备过热',
    createTime: '2024-01-15 11:00:00',
    updateTime: '2024-01-18 09:15:00'
  },
  {
    id: 3,
    ruleName: '信号强度低告警规则',
    deviceType: 'mesh_radio',
    parameter: 'signal_strength',
    operator: 'lt',
    threshold: '-80',
    alarmLevel: 'warning',
    enabled: false,
    description: '当Mesh电台信号强度低于-80dBm时触发告警，确保通信质量',
    createTime: '2024-01-16 14:20:00',
    updateTime: '2024-01-19 16:45:00'
  },
  {
    id: 4,
    ruleName: '连接超时告警规则',
    deviceType: 'base_station',
    parameter: 'heartbeat_timeout',
    operator: 'gte',
    threshold: '3',
    alarmLevel: 'error',
    enabled: true,
    description: '当连续心跳检测失败次数大于等于3次时触发告警',
    createTime: '2024-01-17 09:30:00',
    updateTime: '2024-01-20 11:20:00'
  },
  {
    id: 5,
    ruleName: '安全告警规则',
    deviceType: 'satellite',
    parameter: 'security_event',
    operator: 'ne',
    threshold: 'normal',
    alarmLevel: 'critical',
    enabled: true,
    description: '当检测到安全事件时立即触发严重告警，保障系统安全',
    createTime: '2024-01-18 15:45:00',
    updateTime: '2024-01-20 16:30:00'
  }
];

// 获取告警消息列表
export const getAlarmMessages = async (params = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredData = [...mockAlarmMessages];
      
      // 根据设备名称筛选
      if (params.deviceName) {
        filteredData = filteredData.filter(item => 
          item.deviceName.toLowerCase().includes(params.deviceName.toLowerCase())
        );
      }
      
      // 根据告警类型筛选
      if (params.alarmType) {
        filteredData = filteredData.filter(item => item.alarmType === params.alarmType);
      }
      
      // 根据告警级别筛选
      if (params.alarmLevel) {
        filteredData = filteredData.filter(item => item.alarmLevel === params.alarmLevel);
      }
      
      // 根据状态筛选
      if (params.status) {
        filteredData = filteredData.filter(item => item.status === params.status);
      }
      
      // 根据时间范围筛选
      if (params.dateRange && params.dateRange.length === 2) {
        const [startDate, endDate] = params.dateRange;
        filteredData = filteredData.filter(item => {
          const itemTime = moment(item.alarmTime);
          return itemTime.isBetween(startDate, endDate, 'day', '[]');
        });
      }
      
      // 分页处理
      const { current = 1, pageSize = 10 } = params;
      const start = (current - 1) * pageSize;
      const end = start + pageSize;
      const paginatedData = filteredData.slice(start, end);
      
      resolve({
        success: true,
        data: paginatedData,
        total: filteredData.length,
        current,
        pageSize
      });
    }, 300);
  });
};

// 获取告警详情
export const getAlarmDetail = async (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const alarm = mockAlarmMessages.find(item => item.id === parseInt(id));
      if (alarm) {
        resolve({
          success: true,
          data: alarm
        });
      } else {
        reject({
          success: false,
          message: '告警信息不存在'
        });
      }
    }, 200);
  });
};

// 处理告警
export const handleAlarm = async (id, handleData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockAlarmMessages.findIndex(item => item.id === parseInt(id));
      if (index !== -1) {
        mockAlarmMessages[index] = {
          ...mockAlarmMessages[index],
          status: handleData.status,
          handler: handleData.handler || '当前用户',
          handleTime: moment().format('YYYY-MM-DD HH:mm:ss'),
          handleRemark: handleData.handleRemark
        };
      }
      
      resolve({
        success: true,
        message: '告警处理成功'
      });
    }, 500);
  });
};

// 获取告警规则列表
export const getAlarmRules = async (params = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredData = [...mockAlarmRules];
      
      // 根据规则名称筛选
      if (params.ruleName) {
        filteredData = filteredData.filter(item => 
          item.ruleName.toLowerCase().includes(params.ruleName.toLowerCase())
        );
      }
      
      // 根据设备类型筛选
      if (params.deviceType) {
        filteredData = filteredData.filter(item => item.deviceType === params.deviceType);
      }
      
      // 根据启用状态筛选
      if (params.status !== undefined) {
        filteredData = filteredData.filter(item => item.enabled === params.status);
      }
      
      // 分页处理
      const { current = 1, pageSize = 10 } = params;
      const start = (current - 1) * pageSize;
      const end = start + pageSize;
      const paginatedData = filteredData.slice(start, end);
      
      resolve({
        success: true,
        data: paginatedData,
        total: filteredData.length,
        current,
        pageSize
      });
    }, 300);
  });
};

// 创建告警规则
export const createAlarmRule = async (ruleData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newRule = {
        id: Date.now(),
        ...ruleData,
        createTime: moment().format('YYYY-MM-DD HH:mm:ss'),
        updateTime: moment().format('YYYY-MM-DD HH:mm:ss')
      };
      
      mockAlarmRules.unshift(newRule);
      
      resolve({
        success: true,
        data: newRule,
        message: '告警规则创建成功'
      });
    }, 500);
  });
};

// 更新告警规则
export const updateAlarmRule = async (id, ruleData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockAlarmRules.findIndex(item => item.id === parseInt(id));
      if (index !== -1) {
        mockAlarmRules[index] = {
          ...mockAlarmRules[index],
          ...ruleData,
          updateTime: moment().format('YYYY-MM-DD HH:mm:ss')
        };
        
        resolve({
          success: true,
          data: mockAlarmRules[index],
          message: '告警规则更新成功'
        });
      } else {
        reject({
          success: false,
          message: '告警规则不存在'
        });
      }
    }, 500);
  });
};

// 删除告警规则
export const deleteAlarmRule = async (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockAlarmRules.findIndex(item => item.id === parseInt(id));
      if (index !== -1) {
        mockAlarmRules.splice(index, 1);
        resolve({
          success: true,
          message: '告警规则删除成功'
        });
      } else {
        reject({
          success: false,
          message: '告警规则不存在'
        });
      }
    }, 500);
  });
};

// 切换告警规则状态
export const toggleAlarmRuleStatus = async (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockAlarmRules.findIndex(item => item.id === parseInt(id));
      if (index !== -1) {
        mockAlarmRules[index].enabled = !mockAlarmRules[index].enabled;
        mockAlarmRules[index].updateTime = moment().format('YYYY-MM-DD HH:mm:ss');
        
        resolve({
          success: true,
          data: mockAlarmRules[index],
          message: `告警规则已${mockAlarmRules[index].enabled ? '启用' : '禁用'}`
        });
      } else {
        reject({
          success: false,
          message: '告警规则不存在'
        });
      }
    }, 300);
  });
};

// 获取告警统计数据
export const getAlarmStatistics = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const total = mockAlarmMessages.length;
      const pending = mockAlarmMessages.filter(item => item.status === 'pending').length;
      const processing = mockAlarmMessages.filter(item => item.status === 'processing').length;
      const resolved = mockAlarmMessages.filter(item => item.status === 'resolved').length;
      const ignored = mockAlarmMessages.filter(item => item.status === 'ignored').length;
      
      const critical = mockAlarmMessages.filter(item => item.alarmLevel === 'critical').length;
      const error = mockAlarmMessages.filter(item => item.alarmLevel === 'error').length;
      const warning = mockAlarmMessages.filter(item => item.alarmLevel === 'warning').length;
      const info = mockAlarmMessages.filter(item => item.alarmLevel === 'info').length;
      
      resolve({
        success: true,
        data: {
          total,
          byStatus: { pending, processing, resolved, ignored },
          byLevel: { critical, error, warning, info },
          activeRules: mockAlarmRules.filter(rule => rule.enabled).length,
          totalRules: mockAlarmRules.length
        }
      });
    }, 200);
  });
};

// 获取设备告警数据
export const getDeviceAlarms = async (deviceId, deviceName) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 根据设备ID或设备名称筛选告警数据
      const deviceAlarms = mockAlarmMessages.filter(alarm => {
        if (deviceId && alarm.deviceId) {
          return alarm.deviceId === deviceId || alarm.deviceId === String(deviceId);
        }
        if (deviceName && alarm.deviceName) {
          return alarm.deviceName.includes(deviceName) || deviceName.includes(alarm.deviceName);
        }
        return false;
      });

      resolve({
        success: true,
        data: {
          deviceId: deviceId,
          deviceName: deviceName,
          alarms: deviceAlarms,
          totalCount: deviceAlarms.length,
          activeCount: deviceAlarms.filter(alarm => alarm.status === 'pending').length,
          resolvedCount: deviceAlarms.filter(alarm => alarm.status === 'resolved').length
        }
      });
    }, 300);
  });
};
