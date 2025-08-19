// 音频调度服务
import moment from 'moment';

// 模拟音频调度数据
const mockAudioDevices = [
  {
    id: 6,
    deviceId: '6', // 匹配visualMonitorService中的设备ID
    deviceName: '单兵执法记录仪-006',
    deviceType: 'body_camera',
    status: 'online',
    audioStatus: 'idle', // idle, calling, talking, busy
    groupId: 'group_001',
    groupName: '巡逻组A',
    lastCallTime: '2024-01-15 14:30:25',
    callDuration: 0,
    signalStrength: 85
  },
  {
    id: 7,
    deviceId: '7', // 匹配visualMonitorService中的设备ID
    deviceName: '单兵执法记录仪-007',
    deviceType: 'body_camera',
    status: 'offline',
    audioStatus: 'offline',
    groupId: 'group_002',
    groupName: '巡逻组B',
    lastCallTime: '2024-01-15 13:45:12',
    callDuration: 0,
    signalStrength: 0
  },
  {
    id: 8,
    deviceId: '8', // 添加一个额外的在线设备用于测试
    deviceName: '单兵执法记录仪-008',
    deviceType: 'body_camera',
    status: 'online',
    audioStatus: 'idle',
    groupId: 'group_001',
    groupName: '巡逻组A',
    lastCallTime: '2024-01-15 12:20:08',
    callDuration: 0,
    signalStrength: 92
  }
];

// 模拟通话记录
const mockCallRecords = [
  {
    id: 1,
    callId: 'call_001',
    callType: 'single', // single, group
    callerDeviceId: 'dispatch_center',
    callerName: '调度中心',
    targetDeviceId: 'body_camera_001',
    targetName: '执法仪-001',
    startTime: '2024-01-15 14:30:25',
    endTime: '2024-01-15 14:32:18',
    duration: 113, // 秒
    status: 'completed',
    recordingUrl: '/recordings/call_001.mp3'
  },
  {
    id: 2,
    callId: 'call_002',
    callType: 'group',
    callerDeviceId: 'dispatch_center',
    callerName: '调度中心',
    targetDeviceId: 'group_001',
    targetName: '巡逻组A',
    startTime: '2024-01-15 13:45:12',
    endTime: '2024-01-15 13:47:35',
    duration: 143,
    status: 'completed',
    recordingUrl: '/recordings/call_002.mp3'
  }
];

// 获取音频设备列表
export const getAudioDevices = async (params = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredData = [...mockAudioDevices];
      
      // 根据设备名称筛选
      if (params.deviceName) {
        filteredData = filteredData.filter(item => 
          item.deviceName.toLowerCase().includes(params.deviceName.toLowerCase())
        );
      }
      
      // 根据状态筛选
      if (params.status) {
        filteredData = filteredData.filter(item => item.status === params.status);
      }
      
      // 根据音频状态筛选
      if (params.audioStatus) {
        filteredData = filteredData.filter(item => item.audioStatus === params.audioStatus);
      }
      
      // 根据组别筛选
      if (params.groupId) {
        filteredData = filteredData.filter(item => item.groupId === params.groupId);
      }
      
      resolve({
        success: true,
        data: filteredData,
        total: filteredData.length
      });
    }, 300);
  });
};

// 发起单呼
export const initiateCall = async (targetDeviceId, callType = 'single') => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('发起呼叫请求，目标设备ID:', targetDeviceId);

      // 为了演示目的，创建一个模拟的目标设备
      const targetDevice = {
        id: targetDeviceId,
        deviceId: targetDeviceId.toString(),
        deviceName: `执法记录仪-${targetDeviceId}`,
        deviceType: 'body_camera',
        status: 'online',
        audioStatus: 'idle',
        groupId: 'group_001',
        groupName: '巡逻组A',
        signalStrength: 85
      };

      // 为了演示目的，总是成功
      console.log('模拟呼叫成功，目标设备:', targetDevice.deviceName);

      // 更新设备状态
      targetDevice.audioStatus = 'calling';

      const callRecord = {
        id: Date.now(),
        callId: `call_${Date.now()}`,
        callType: callType,
        callerDeviceId: 'dispatch_center',
        callerName: '调度中心',
        targetDeviceId: targetDeviceId,
        targetName: targetDevice.deviceName,
        startTime: moment().format('YYYY-MM-DD HH:mm:ss'),
        status: 'calling'
      };

      mockCallRecords.unshift(callRecord);

      resolve({
        success: true,
        message: '呼叫发起成功',
        data: {
          callId: callRecord.callId,
          targetDevice: targetDevice,
          callRecord: callRecord
        }
      });
    }, 1000);
  });
};

// 接听呼叫
export const answerCall = async (callId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const callRecord = mockCallRecords.find(record => record.callId === callId);
      if (callRecord) {
        callRecord.status = 'talking';
        
        // 更新设备状态
        const device = mockAudioDevices.find(d => d.deviceId === callRecord.targetDeviceId);
        if (device) {
          device.audioStatus = 'talking';
        }
      }
      
      resolve({
        success: true,
        message: '通话已接通'
      });
    }, 500);
  });
};

// 结束呼叫
export const endCall = async (callId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const callRecord = mockCallRecords.find(record => record.callId === callId);
      if (callRecord) {
        callRecord.status = 'completed';
        callRecord.endTime = moment().format('YYYY-MM-DD HH:mm:ss');
        
        // 计算通话时长
        const startTime = moment(callRecord.startTime);
        const endTime = moment(callRecord.endTime);
        callRecord.duration = endTime.diff(startTime, 'seconds');
        
        // 更新设备状态
        const device = mockAudioDevices.find(d => d.deviceId === callRecord.targetDeviceId);
        if (device) {
          device.audioStatus = 'idle';
          device.lastCallTime = callRecord.endTime;
          device.callDuration = callRecord.duration;
        }
      }
      
      resolve({
        success: true,
        message: '通话已结束'
      });
    }, 300);
  });
};

// 获取通话记录
export const getCallRecords = async (params = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredData = [...mockCallRecords];
      
      // 根据呼叫类型筛选
      if (params.callType) {
        filteredData = filteredData.filter(item => item.callType === params.callType);
      }
      
      // 根据状态筛选
      if (params.status) {
        filteredData = filteredData.filter(item => item.status === params.status);
      }
      
      // 根据时间范围筛选
      if (params.startDate && params.endDate) {
        filteredData = filteredData.filter(item => {
          const itemDate = moment(item.startTime);
          return itemDate.isBetween(params.startDate, params.endDate, 'day', '[]');
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

// 获取设备音频状态
export const getDeviceAudioStatus = async (deviceId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 尝试多种方式匹配设备
      let device = mockAudioDevices.find(d => d.deviceId === deviceId);

      // 如果没找到，尝试用设备ID匹配
      if (!device) {
        device = mockAudioDevices.find(d => d.deviceId === deviceId.toString());
      }

      // 如果还没找到，尝试用设备ID的数字部分匹配
      if (!device) {
        device = mockAudioDevices.find(d => d.id.toString() === deviceId.toString());
      }

      // 如果仍然没找到，为了演示目的，返回默认状态
      if (!device) {
        resolve({
          success: true,
          data: {
            deviceId: deviceId,
            deviceName: '执法记录仪',
            status: 'online',
            audioStatus: 'idle',
            signalStrength: 85,
            lastCallTime: '2024-01-15 14:30:25'
          }
        });
        return;
      }

      if (device) {
        resolve({
          success: true,
          data: {
            deviceId: device.deviceId,
            deviceName: device.deviceName,
            status: device.status,
            audioStatus: device.audioStatus,
            signalStrength: device.signalStrength,
            lastCallTime: device.lastCallTime
          }
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
