import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Badge,
  Tag,
  Space,
  Button,
  Modal,
  List,
  Statistic,
  Switch,
  Select,
  Tooltip,
  Progress,
  message,
  Tabs,
  Input,
  Divider,
  DatePicker,
  Dropdown,
  Form
} from 'antd';
import dayjs from 'dayjs';
import LeafletMap from '../../components/LeafletMap';
import {
  MonitorOutlined,
  VideoCameraOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  EyeOutlined,
  ReloadOutlined,
  SettingOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  GlobalOutlined,
  SearchOutlined,
  PlayCircleOutlined,
  DesktopOutlined,
  NodeIndexOutlined,
  PhoneOutlined,
  LineOutlined,
  BorderInnerOutlined,
  MoreOutlined,
  CloseOutlined
} from '@ant-design/icons';
import styles from './StandaloneMonitor.module.css';
import {
  getDeviceList,
  getAlarmList,
  getStatistics,
  getDeviceTrack
} from '../../services/visualMonitorService';
import { getDeviceAlarms } from '../../services/alarmService';
import AudioCallModal from '../../components/AudioCallModal';
import DeviceOverviewCharts from '../../components/DeviceOverviewCharts';

const { Option } = Select;
const { Search } = Input;

// 计算两个经纬度点之间的距离（使用Haversine公式）
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // 地球半径（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // 距离（公里）
};

// 计算轨迹总距离
const calculateTotalDistance = (trackData) => {
  if (!trackData || trackData.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 1; i < trackData.length; i++) {
    const prev = trackData[i - 1];
    const curr = trackData[i];

    if (prev.position && curr.position &&
        prev.position.length >= 2 && curr.position.length >= 2) {
      const distance = calculateDistance(
        prev.position[1], prev.position[0], // 前一点的纬度、经度（position格式：[经度, 纬度]）
        curr.position[1], curr.position[0]  // 当前点的纬度、经度
      );
      totalDistance += distance;
    }
  }

  return totalDistance;
};

// 计算平均速度
const calculateAverageSpeed = (trackData) => {
  if (!trackData || trackData.length === 0) return 0;

  // 方法1：如果轨迹点有speed字段，计算平均值
  const speedValues = trackData.filter(point => point.speed && point.speed > 0);
  if (speedValues.length > 0) {
    const totalSpeed = speedValues.reduce((sum, point) => sum + point.speed, 0);
    return totalSpeed / speedValues.length;
  }

  // 方法2：基于总距离和总时长计算
  if (trackData.length >= 2) {
    const totalDistance = calculateTotalDistance(trackData);
    const startTime = new Date(trackData[0].timestamp).getTime();
    const endTime = new Date(trackData[trackData.length - 1].timestamp).getTime();
    const totalTimeHours = (endTime - startTime) / (1000 * 60 * 60); // 转换为小时

    if (totalTimeHours > 0) {
      return totalDistance / totalTimeHours;
    }
  }

  return 0;
};

// 防抖工具函数
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// 节流工具函数
const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// 添加即时反馈效果
const addInstantFeedback = (element) => {
  if (element && !element.classList.contains('instant-feedback-added')) {
    element.classList.add('instant-feedback-added');
    element.addEventListener('mousedown', () => {
      element.classList.add(styles.quickClick);
      setTimeout(() => {
        element.classList.remove(styles.quickClick);
      }, 150);
    });
  }
};

const StandaloneMonitor = () => {
  const [devices, setDevices] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [alarmModalVisible, setAlarmModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({
    temperature: '22°C',
    condition: '晴',
    humidity: '65%',
    icon: '☀️'
  });
  const [showDevicePanel, setShowDevicePanel] = useState(false);
  const [showAlarmPanel, setShowAlarmPanel] = useState(false);
  const [mapType, setMapType] = useState('normal'); // 'normal', 'satellite', 'dark', 'tianditu'
  const [deviceInfoVisible, setDeviceInfoVisible] = useState(false);
  const [alarmDetailVisible, setAlarmDetailVisible] = useState(false);
  const [selectedAlarm, setSelectedAlarm] = useState(null);
  const [alarmHandleVisible, setAlarmHandleVisible] = useState(false);
  const [selectedHandleAlarm, setSelectedHandleAlarm] = useState(null);
  const [deviceAlarmDetailVisible, setDeviceAlarmDetailVisible] = useState(false);
  const [selectedDeviceForAlarm, setSelectedDeviceForAlarm] = useState(null);
  const [deviceAlarms, setDeviceAlarms] = useState([]);
  const [alarmActiveTab, setAlarmActiveTab] = useState('active');
  const [activeTab, setActiveTab] = useState('status'); // 'status' 或 'monitor'
  const [deviceFilter, setDeviceFilter] = useState('all'); // 'all', 'online', 'offline', 'camera'
  const [selectedVideoDevice, setSelectedVideoDevice] = useState(null);
  const [mapSearchText, setMapSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showDeviceTracks, setShowDeviceTracks] = useState(false);
  const [selectedTrackDevice, setSelectedTrackDevice] = useState(null);
  const [trackTimeModalVisible, setTrackTimeModalVisible] = useState(false);
  const [audioCallModalVisible, setAudioCallModalVisible] = useState(false);
  const [selectedCallDevice, setSelectedCallDevice] = useState(null);
  const [isCallMinimized, setIsCallMinimized] = useState(false);
  const [callStatus, setCallStatus] = useState('idle');
  const [dragPosition, setDragPosition] = useState({ x: 20, y: 120 }); // 默认位置：右下角
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [trackStartTime, setTrackStartTime] = useState(null);
  const [trackEndTime, setTrackEndTime] = useState(null);
  const [currentTrackDevice, setCurrentTrackDevice] = useState(null);
  const [deviceTrackData, setDeviceTrackData] = useState([]);
  const [quickTrackModalVisible, setQuickTrackModalVisible] = useState(false);
  const [currentQuickTrackDevice, setCurrentQuickTrackDevice] = useState(null);
  const [isRealTimeTracking, setIsRealTimeTracking] = useState(false);
  const [realTimeTrackData, setRealTimeTrackData] = useState([]);
  const [trackingStartTime, setTrackingStartTime] = useState(null);

  // 计算轨迹统计信息
  const trackStats = useMemo(() => {
    const currentTrackData = isRealTimeTracking ? realTimeTrackData : deviceTrackData;
    const totalDistance = calculateTotalDistance(currentTrackData);
    const averageSpeed = calculateAverageSpeed(currentTrackData);

    return {
      totalDistance: totalDistance.toFixed(1),
      averageSpeed: averageSpeed.toFixed(1)
    };
  }, [deviceTrackData, realTimeTrackData, isRealTimeTracking]);

  // 地图控制状态
  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(null);

  const [stats, setStats] = useState({
    totalDevices: 0,
    onlineDevices: 0,
    offlineDevices: 0,
    activeAlarms: 0
  });

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const [deviceRes, alarmRes, statsRes] = await Promise.all([
        getDeviceList(),
        getAlarmList(),
        getStatistics()
      ]);

      if (deviceRes.success) {
        setDevices(deviceRes.data);
      }
      
      if (alarmRes.success) {
        setAlarms(alarmRes.data);
      }
      
      if (statsRes.success) {
        setStats(statsRes.data);
      }
      
      message.success('数据刷新成功');
    } catch (error) {
      console.error('加载数据失败:', error);
      message.error('数据加载失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 模拟天气数据更新
  const updateWeather = () => {
    const weatherConditions = [
      { condition: '晴', icon: '☀️', temp: 22 + Math.floor(Math.random() * 8) },
      { condition: '多云', icon: '⛅', temp: 18 + Math.floor(Math.random() * 6) },
      { condition: '阴', icon: '☁️', temp: 15 + Math.floor(Math.random() * 8) },
      { condition: '小雨', icon: '🌦️', temp: 12 + Math.floor(Math.random() * 6) }
    ];

    const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    setWeather({
      temperature: `${randomWeather.temp}°C`,
      condition: randomWeather.condition,
      humidity: `${60 + Math.floor(Math.random() * 20)}%`,
      icon: randomWeather.icon
    });
  };

  // 初始化
  useEffect(() => {
    // 设置页面标题
    document.title = '可视化监控大屏 - 实时监控系统';

    // 初始加载数据
    loadData();
    updateWeather();

    // 定时刷新数据 - 已注释掉自动刷新功能
    // const dataInterval = setInterval(loadData, 30000); // 30秒刷新一次

    // 更新时间
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // 更新天气（每10分钟） - 已注释掉自动刷新功能
    // const weatherInterval = setInterval(updateWeather, 600000);

    return () => {
      // clearInterval(dataInterval);
      clearInterval(timeInterval);
      // clearInterval(weatherInterval);
    };
  }, []);

  // 全屏切换
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // 实时轨迹跟踪
  useEffect(() => {
    let trackingInterval = null;

    if (isRealTimeTracking && selectedTrackDevice) {
      // 每10秒模拟接收一个新的位置点
      trackingInterval = setInterval(() => {
        setDevices(prevDevices => {
          const currentDevice = prevDevices.find(d => d.id === selectedTrackDevice);
          if (!currentDevice || currentDevice.status !== 'online') {
            // 设备离线，停止跟踪
            setIsRealTimeTracking(false);
            message.warning('设备已离线，轨迹跟踪已停止');
            return prevDevices;
          }

          // 生成新的位置点（模拟设备移动）
          setRealTimeTrackData(prevTrackData => {
            const lastPoint = prevTrackData[prevTrackData.length - 1];
            if (lastPoint) {
              // 在上一个位置基础上生成新位置（模拟移动）
              const basePosition = lastPoint.position;
              const moveDistance = 0.001; // 约100米的移动距离
              const angle = Math.random() * 2 * Math.PI; // 随机方向

              const newPosition = [
                basePosition[0] + Math.cos(angle) * moveDistance, // 经度
                basePosition[1] + Math.sin(angle) * moveDistance  // 纬度
              ];

              const newTrackPoint = {
                id: prevTrackData.length + 1,
                position: newPosition,
                timestamp: new Date().toISOString(),
                speed: Math.random() * 30 + 10, // 10-40 km/h
                status: Math.random() > 0.9 ? 'alert' : 'normal'
              };

              // 更新轨迹数据
              setDeviceTrackData(prev => [...prev, newTrackPoint]);

              // 在实时跟踪时，不更新devices数组中的设备位置，避免触发地图重新渲染
              // 设备的实时位置通过轨迹数据来体现

              return [...prevTrackData, newTrackPoint];
            }
            return prevTrackData;
          });

          return prevDevices;
        });
      }, 10000); // 每10秒更新一次
    }

    return () => {
      if (trackingInterval) {
        clearInterval(trackingInterval);
      }
    };
  }, [isRealTimeTracking, selectedTrackDevice]);

  // 返回主系统
  const goToMainSystem = () => {
    window.close(); // 尝试关闭当前标签页
    // 如果无法关闭，则跳转到主系统
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 100);
  };

  // 计算在线率
  const onlineRate = stats.totalDevices > 0 ? 
    Math.round((stats.onlineDevices / stats.totalDevices) * 100) : 0;

  // 获取设备类型统计 - 使用useMemo缓存计算结果
  const deviceTypeStats = useMemo(() => {
    const typeMap = {
      camera: { name: '摄像头', count: 0 },
      radio: { name: '电台', count: 0 },
      sensor: { name: '网关设备', count: 0 },
      base_station: { name: '基站', count: 0 },
      body_camera: { name: '执法仪', count: 0 }
    };

    devices.forEach(device => {
      if (typeMap[device.type]) {
        typeMap[device.type].count++;
      }
    });

    return Object.entries(typeMap).map(([type, data]) => ({
      type,
      name: data.name,
      count: data.count
    })).filter(item => item.count > 0);
  }, [devices]);

  // 获取设备类型图标
  const getDeviceTypeIcon = (type) => {
    const icons = {
      camera: '📹',
      radio: '📡',
      sensor: '🔧',
      base_station: '📶',
      body_camera: '📷'
    };
    return icons[type] || '📱';
  };

  // 获取设备类型颜色 - 使用useMemo缓存
  const getDeviceTypeColor = useMemo(() => {
    const colors = {
      camera: '#1890ff',
      radio: '#52c41a',
      sensor: '#faad14',
      base_station: '#f5222d',
      body_camera: '#13c2c2'
    };
    return (type) => colors[type] || '#722ed1';
  }, []);

  // 切换地图类型 - 使用useCallback优化
  const toggleMapType = useCallback(() => {
    setMapType(prevType => {
      const types = ['normal', 'satellite', 'dark'];
      const currentIndex = types.indexOf(prevType);
      const nextIndex = (currentIndex + 1) % types.length;
      return types[nextIndex];
    });
  }, []);

  // 处理地图设备点击（只显示白色气泡框，不显示Modal）- 使用useCallback优化
  const handleMapDeviceClick = useCallback((device) => {
    setSelectedDevice(device);
    // 不设置 setDeviceInfoVisible(true)，只让Leaflet的Popup显示
  }, []);

  // 处理监控列表设备详情点击（显示Modal弹窗）- 使用useCallback优化
  const handleDeviceDetailClick = useCallback((device) => {
    setSelectedDevice(device);
    setDeviceInfoVisible(true);
  }, []);

  // 处理单个设备轨迹查看
  const handleDeviceTrack = (device) => {
    setCurrentTrackDevice(device);
    setTrackTimeModalVisible(true);

    // 设置默认时间范围（最近24小时）
    const now = dayjs();
    const yesterday = dayjs().subtract(24, 'hour');
    setTrackStartTime(yesterday);
    setTrackEndTime(now);
  };

  // 快速轨迹跟踪（开始实时轨迹跟踪）
  const handleQuickTrack = (device) => {
    setCurrentQuickTrackDevice(device);
    setQuickTrackModalVisible(true);
  };

  // 确认快速轨迹跟踪 - 开始实时跟踪
  const handleConfirmQuickTrack = () => {
    if (!currentQuickTrackDevice) return;

    // 初始化实时跟踪
    const startTime = new Date();
    setTrackingStartTime(startTime);
    setIsRealTimeTracking(true);
    setSelectedTrackDevice(currentQuickTrackDevice.id);
    setShowDeviceTracks(true);
    setQuickTrackModalVisible(false);

    // 初始化轨迹数据，以设备当前位置作为起点
    const initialTrackPoint = {
      id: 1,
      position: currentQuickTrackDevice.position, // [经度, 纬度]
      timestamp: startTime.toISOString(),
      speed: 0,
      status: 'normal'
    };

    setRealTimeTrackData([initialTrackPoint]);
    setDeviceTrackData([initialTrackPoint]);

    // 自动将地图居中到设备当前位置（开始跟踪时执行）
    if (currentQuickTrackDevice.position && currentQuickTrackDevice.position.length >= 2) {
      setMapCenter([currentQuickTrackDevice.position[1], currentQuickTrackDevice.position[0]]); // [纬度, 经度]
      setMapZoom(16);

      // 短暂延迟后清除地图控制状态
      setTimeout(() => {
        setMapCenter(null);
        setMapZoom(null);
      }, 2000);
    }

    message.success(`开始实时跟踪 ${currentQuickTrackDevice.name} 的移动轨迹`);
    setCurrentQuickTrackDevice(null);
  };

  // 取消快速轨迹跟踪
  const handleCancelQuickTrack = () => {
    setQuickTrackModalVisible(false);
    setCurrentQuickTrackDevice(null);
  };

  // 查询设备轨迹
  const handleTrackQuery = async () => {
    if (!currentTrackDevice || !trackStartTime || !trackEndTime) {
      message.warning('请选择完整的时间范围');
      return;
    }

    if (trackStartTime >= trackEndTime) {
      message.warning('开始时间必须早于结束时间');
      return;
    }

    try {
      setLoading(true);
      const response = await getDeviceTrack(
        currentTrackDevice.id,
        trackStartTime.toISOString(),
        trackEndTime.toISOString()
      );

      if (response.success) {
        setDeviceTrackData(response.data.tracks);
        setSelectedTrackDevice(currentTrackDevice.id);
        setShowDeviceTracks(true);
        setTrackTimeModalVisible(false);

        // 自动将地图居中到轨迹终点位置
        if (response.data.tracks && response.data.tracks.length > 0) {
          const lastTrackPoint = response.data.tracks[response.data.tracks.length - 1];
          if (lastTrackPoint && lastTrackPoint.position && lastTrackPoint.position.length >= 2) {
            // 轨迹数据格式：[经度, 纬度]，地图需要 [纬度, 经度]
            const centerPoint = [lastTrackPoint.position[1], lastTrackPoint.position[0]];

            // 设置地图中心点为轨迹终点，并调整缩放级别以显示完整轨迹
            setMapCenter(centerPoint);
            setMapZoom(14); // 适合查看轨迹细节的缩放级别

            // 延迟一下再清除地图控制状态，让动画完成
            setTimeout(() => {
              setMapCenter(null);
              setMapZoom(null);
            }, 2000);
          }
        }

        message.success(`已加载 ${currentTrackDevice.name} 的轨迹数据，共 ${response.data.totalPoints} 个点`);
      } else {
        message.error('获取轨迹数据失败');
      }
    } catch (error) {
      console.error('获取轨迹数据错误:', error);
      message.error('获取轨迹数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 取消轨迹查询
  const handleTrackCancel = () => {
    setTrackTimeModalVisible(false);
    setCurrentTrackDevice(null);
    setTrackStartTime(null);
    setTrackEndTime(null);
  };

  // 清除轨迹显示
  const clearDeviceTracks = () => {
    const deviceName = devices.find(d => d.id === selectedTrackDevice)?.name || '设备';

    // 停止实时跟踪
    setIsRealTimeTracking(false);
    setRealTimeTrackData([]);
    setTrackingStartTime(null);

    // 重置所有轨迹相关状态
    setShowDeviceTracks(false);
    setSelectedTrackDevice(null);
    setDeviceTrackData([]);

    // 重置时间选择器相关状态
    setTrackTimeModalVisible(false);
    setCurrentTrackDevice(null);
    setTrackStartTime(null);
    setTrackEndTime(null);

    const actionText = isRealTimeTracking ? '已停止轨迹跟踪' : '已清除轨迹显示';
    message.success(`${deviceName} ${actionText}`);
  };

  // 定位到设备
  const locateDevice = (deviceId) => {
    // 找到对应的设备数据
    const device = devices.find(d => d.id === deviceId);
    if (!device || !device.position) {
      message.warning('设备位置信息不可用');
      return;
    }

    // 使用地图控制状态来居中显示设备
    if (device.position && device.position.length >= 2) {
      // 设备位置格式：[经度, 纬度]，地图需要 [纬度, 经度]
      const deviceCenter = [device.position[1], device.position[0]];

      // 设置地图中心点为设备位置，并调整缩放级别
      setMapCenter(deviceCenter);
      setMapZoom(16); // 高缩放级别，确保设备标记清晰可见

      // 显示定位成功消息
      message.success(`已定位到设备：${device.name}`);

      // 延迟一下再清除地图控制状态，让动画完成
      setTimeout(() => {
        setMapCenter(null);
        setMapZoom(null);
      }, 2000);

      // 添加设备高亮效果（如果设备标记存在）
      setTimeout(() => {
        const deviceMarker = document.querySelector(`[data-device-id="${deviceId}"]`);
        if (deviceMarker) {
          // 添加高亮效果到地图标记
          deviceMarker.classList.add(styles.deviceHighlight);

          // 添加定位指示器
          const locateIndicator = document.createElement('div');
          locateIndicator.className = styles.locateIndicator;
          locateIndicator.innerHTML = '📍';
          locateIndicator.style.position = 'absolute';
          locateIndicator.style.top = '-10px';
          locateIndicator.style.right = '-10px';
          locateIndicator.style.zIndex = '25';
          locateIndicator.style.fontSize = '20px';
          locateIndicator.style.animation = 'bounce 0.5s ease-in-out 3';
          deviceMarker.appendChild(locateIndicator);

          // 3秒后移除高亮效果和指示器
          setTimeout(() => {
            deviceMarker.classList.remove(styles.deviceHighlight);
            if (locateIndicator.parentNode) {
              locateIndicator.parentNode.removeChild(locateIndicator);
            }
          }, 3000);
        }
      }, 500); // 等待地图移动动画开始后再添加高亮效果
    } else {
      // 如果设备位置信息不完整，显示错误信息
      message.error(`设备 ${device.name} 的位置信息不完整`);
    }
  };

  // 处理告警详情点击 - 使用节流优化
  const handleAlarmClick = useCallback(throttle((alarm) => {
    setSelectedAlarm(alarm);
    setAlarmDetailVisible(true);
  }, 300), []);

  // 处理告警处理按钮点击 - 使用节流优化
  const handleAlarmProcess = useCallback(throttle((alarm, e) => {
    e.stopPropagation(); // 阻止事件冒泡
    setSelectedHandleAlarm(alarm);
    setAlarmHandleVisible(true);
  }, 300), []);

  // 提交告警处理
  const handleAlarmSubmit = async (values) => {
    try {
      // 更新告警状态
      const updatedAlarms = alarms.map(alarm => {
        if (alarm.id === selectedHandleAlarm.id) {
          return {
            ...alarm,
            status: 'handled',
            handler: values.handler || '当前用户',
            handleTime: new Date().toLocaleString('zh-CN'),
            handleResult: values.handleResult
          };
        }
        return alarm;
      });

      setAlarms(updatedAlarms);

      // 更新统计数据
      const activeCount = updatedAlarms.filter(alarm => alarm.status === 'active').length;
      setStats(prev => ({
        ...prev,
        activeAlarms: activeCount
      }));

      setAlarmHandleVisible(false);
      setSelectedHandleAlarm(null);
      message.success('告警处理成功');
    } catch (error) {
      message.error('告警处理失败');
    }
  };

  // 获取不同状态的告警列表
  const getActiveAlarms = () => {
    return alarms.filter(alarm => alarm.status === 'active');
  };

  const getHandledAlarms = () => {
    return alarms.filter(alarm => alarm.status === 'handled');
  };

  const getCurrentTabAlarms = () => {
    return alarmActiveTab === 'active' ? getActiveAlarms() : getHandledAlarms();
  };

  // 筛选设备列表
  const getFilteredDevices = () => {
    let filtered = devices;

    // 按状态筛选
    if (deviceFilter === 'online') {
      filtered = filtered.filter(device => device.status === 'online');
    } else if (deviceFilter === 'offline') {
      filtered = filtered.filter(device => device.status === 'offline');
    }

    // 搜索功能已移除，保持所有设备显示

    return filtered;
  };

  // 处理视频查看
  const handleVideoView = (device) => {
    if (device.type === 'camera') {
      setSelectedVideoDevice(device);
      setVideoModalVisible(true);
    } else {
      message.warning('该设备不支持视频查看功能');
    }
  };

  // 处理设备告警详情
  const handleDeviceAlarmDetail = async (device) => {
    if (!device.alarmCount || device.alarmCount === 0) {
      message.warning('该设备暂无告警信息');
      return;
    }

    try {
      setSelectedDeviceForAlarm(device);
      setDeviceAlarmDetailVisible(true);

      // 调用API获取设备的告警数据
      const response = await getDeviceAlarms(device.id, device.name);
      if (response.success) {
        setDeviceAlarms(response.data.alarms);
      } else {
        message.error('获取设备告警信息失败');
        setDeviceAlarms([]);
      }
    } catch (error) {
      console.error('获取设备告警信息失败:', error);
      message.error('获取设备告警信息失败');
      setDeviceAlarms([]);
    }
  };

  // 处理语音呼叫
  const handleAudioCall = (device) => {
    if (device.type === 'body_camera') {
      // 只在开始新通话时重置状态（不是从最小化恢复）
      if (!audioCallModalVisible || !isCallMinimized) {
        setCallStatus('idle');
      }
      setIsCallMinimized(false);
      setSelectedCallDevice(device);
      setAudioCallModalVisible(true);
    } else {
      message.warning('该设备不支持语音呼叫功能');
    }
  };

  // 处理呼叫状态变化
  const handleCallStatusChange = (status, data) => {
    console.log('呼叫状态变化:', status, data);
    // 同步更新父组件的通话状态，确保最小化浮窗显示正确
    setCallStatus(status);
    // 可以在这里更新设备状态或记录通话日志
  };

  // 最小化语音呼叫
  const handleMinimizeCall = () => {
    setIsCallMinimized(true);
  };

  // 恢复语音呼叫
  const handleRestoreCall = () => {
    // 只恢复显示状态，不重置通话状态
    setIsCallMinimized(false);
    // 不调用 setCallStatus，保持当前通话状态
  };

  // 处理浮窗点击
  const handleFloatClick = (e) => {
    e.stopPropagation();
    // 只有在没有拖动的情况下才执行点击操作
    if (!hasMoved) {
      handleRestoreCall();
    }
  };

  // 关闭语音呼叫
  const handleCloseCall = () => {
    // 完全关闭通话，重置所有状态
    setAudioCallModalVisible(false);
    setIsCallMinimized(false);
    setSelectedCallDevice(null);
    setCallStatus('idle');
    // 重置拖动位置
    setDragPosition({ x: 20, y: 120 });
  };

  // 拖动处理函数
  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    setIsDragging(true);
    setHasMoved(false);

    // 记录拖动开始位置
    setDragStartPos({ x: clientX, y: clientY });

    // 计算鼠标在浮窗内的相对位置
    setDragOffset({
      x: clientX - rect.left,
      y: clientY - rect.top
    });
  };

  // 触摸开始处理
  const handleTouchStart = (e) => {
    e.preventDefault();
    handleMouseDown(e);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // 检查是否真的移动了（移动距离超过5px才算拖动）
    const moveDistance = Math.sqrt(
      Math.pow(clientX - dragStartPos.x, 2) + Math.pow(clientY - dragStartPos.y, 2)
    );

    if (moveDistance > 5) {
      setHasMoved(true);
    }

    // 只有真正移动时才更新位置
    if (hasMoved || moveDistance > 5) {
      // 计算新位置（基于鼠标位置减去拖动偏移）
      const newX = clientX - dragOffset.x;
      const newY = clientY - dragOffset.y;

      // 浮窗尺寸
      const floatWidth = 280;
      const floatHeight = 100;

      // 限制拖动范围，确保浮窗不会超出屏幕
      const boundedX = Math.max(0, Math.min(newX, window.innerWidth - floatWidth));
      const boundedY = Math.max(0, Math.min(newY, window.innerHeight - floatHeight));

      // 转换为 right 和 bottom 定位
      const rightPos = window.innerWidth - boundedX - floatWidth;
      const bottomPos = window.innerHeight - boundedY - floatHeight;

      setDragPosition({ x: rightPos, y: bottomPos });
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      // 重置移动状态
      setTimeout(() => {
        setHasMoved(false);
      }, 100);
    }
  };

  // 触摸移动和结束处理
  const handleTouchMove = (e) => {
    e.preventDefault(); // 防止页面滚动
    handleMouseMove(e);
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  // 添加全局鼠标和触摸事件监听
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, dragOffset]);

  // 筛选地图上显示的设备 - 使用useMemo缓存筛选结果
  const filteredMapDevices = useMemo(() => {
    // 如果没有搜索文本，显示所有设备
    if (!mapSearchText) {
      return devices;
    }

    // 按搜索文本筛选
    const searchText = mapSearchText.toLowerCase();
    return devices.filter(device => {
      const deviceName = device.name ? device.name.toLowerCase() : '';
      const deviceId = device.id ? String(device.id).toLowerCase() : '';
      const deviceLocation = device.location ? device.location.toLowerCase() : '';
      return deviceName.includes(searchText) ||
             deviceId.includes(searchText) ||
             deviceLocation.includes(searchText);
    });
  }, [devices, mapSearchText]);

  // 获取搜索结果（用于下拉选择）
  const getSearchResults = (searchText) => {
    if (!searchText || searchText.length < 1) {
      return [];
    }

    const text = searchText.toLowerCase();
    return devices.filter(device => {
      const deviceName = device.name ? device.name.toLowerCase() : '';
      const deviceId = device.id ? String(device.id).toLowerCase() : '';
      const deviceLocation = device.location ? device.location.toLowerCase() : '';
      return deviceName.includes(text) ||
             deviceId.includes(text) ||
             deviceLocation.includes(text);
    }).slice(0, 8); // 限制显示最多8个结果
  };

  // 防抖搜索函数
  const debouncedSearch = useMemo(
    () => debounce((value) => {
      const results = getSearchResults(value);
      setSearchResults(results);
      setShowSearchResults(value.length > 0 && results.length > 0);
    }, 200),
    [devices]
  );

  // 处理搜索输入变化 - 使用防抖优化
  const handleSearchChange = useCallback((value) => {
    setMapSearchText(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  // 处理搜索结果选择
  const handleSearchResultSelect = (device) => {
    setMapSearchText(device.name);
    setShowSearchResults(false);
    // 自动定位到选中的设备
    locateDevice(device.id);
  };

  // 处理搜索框失焦
  const handleSearchBlur = () => {
    // 延迟隐藏搜索结果，以便用户能够点击选项
    setTimeout(() => {
      setShowSearchResults(false);
    }, 200);
  };

  return (
    <div className={styles.standaloneMonitor}>
      {/* 顶部标题栏 */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.title}>
            <MonitorOutlined className={styles.titleIcon} />
            <span>可视化监控大屏</span>
          </div>
          <div className={styles.subtitle}>
            实时监控 · 智能预警 · 数据可视化
          </div>
        </div>
        <div className={styles.headerRight}>
          <Space size="large">
            {/* 控制按钮 */}
            <Space size="large">
              <Button
                icon={<HomeOutlined style={{ fontSize: '22px' }} />}
                onClick={goToMainSystem}
                type="text"
                className={styles.headerIconBtn}
                title="返回主系统"
              />
              <Button
                icon={<ReloadOutlined style={{ fontSize: '22px' }} />}
                onClick={loadData}
                loading={loading}
                type="text"
                className={styles.headerIconBtn}
                title="刷新数据"
              />
              <Button
                icon={isFullscreen ?
                  <FullscreenExitOutlined style={{ fontSize: '22px' }} /> :
                  <FullscreenOutlined style={{ fontSize: '22px' }} />
                }
                onClick={toggleFullscreen}
                type="text"
                className={styles.headerIconBtn}
                title={isFullscreen ? '退出全屏' : '全屏显示'}
              />
            </Space>

            {/* 天气信息 */}
            <div className={styles.weatherInfo}>
              <div className={styles.weatherIcon}>{weather.icon}</div>
              <div className={styles.weatherDetails}>
                <div className={styles.temperature}>{weather.temperature}</div>
                <div className={styles.weatherCondition}>{weather.condition}</div>
              </div>
              <div className={styles.humidity}>湿度 {weather.humidity}</div>
            </div>

            {/* 时间显示 */}
            <div className={styles.currentTime}>
              <div className={styles.timeMain}>
                {currentTime.toLocaleTimeString('zh-CN')}
              </div>
              <div className={styles.dateMain}>
                {currentTime.toLocaleDateString('zh-CN')}
              </div>
            </div>
          </Space>
        </div>
      </div>

      {/* 主要内容区域 - 全屏地图 */}
      <div className={styles.content}>

        {/* 主要地图区域 */}
        <div className={styles.mapMainContainer}>
          <div className={styles.mapContainer}>
            {/* Leaflet地图 */}
            <LeafletMap
              devices={filteredMapDevices}
              onDeviceClick={handleMapDeviceClick}
              mapType={mapType}
              height="100%"
              className={styles.leafletMapWrapper}
              showTracks={showDeviceTracks}
              selectedDeviceId={selectedTrackDevice}
              trackData={deviceTrackData}
              mapCenter={mapCenter}
              mapZoom={mapZoom}
              isRealTimeTracking={isRealTimeTracking}
              enableTrackPlayback={showDeviceTracks && !isRealTimeTracking}
              // 操作函数props
              onDeviceDetail={handleDeviceDetailClick}
              onQuickTrack={handleQuickTrack}
              onDeviceTrack={handleDeviceTrack}
              onVideoView={handleVideoView}
              onAudioCall={handleAudioCall}
              onLocateDevice={locateDevice}
              onAlarmDetail={handleDeviceAlarmDetail}
            />

            {/* 地图搜索控制面板 */}
            <div className={styles.mapSearchPanel}>
              <div className={styles.searchPanelContent}>
                <div className={styles.searchContainer}>
                  <Input
                    placeholder="搜索设备名称、ID、位置"
                    value={mapSearchText}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onBlur={handleSearchBlur}
                    onFocus={() => {
                      if (mapSearchText && searchResults.length > 0) {
                        setShowSearchResults(true);
                      }
                    }}
                    className={styles.mapSearchInput}
                    size="medium"
                    prefix={<SearchOutlined style={{ color: 'rgba(255, 255, 255, 0.6)' }} />}
                    allowClear
                    onClear={() => {
                      setMapSearchText('');
                      setSearchResults([]);
                      setShowSearchResults(false);
                    }}
                  />

                  {/* 搜索结果下拉列表 */}
                  {showSearchResults && searchResults.length > 0 && (
                    <div className={styles.searchResultsDropdown}>
                      {searchResults.map((device) => (
                        <div
                          key={device.id}
                          className={styles.searchResultItem}
                          onClick={() => handleSearchResultSelect(device)}
                        >
                          <div className={styles.searchResultIcon}>
                            {device.type === 'camera' ? '📹' :
                             device.type === 'radio' ? '📡' :
                             device.type === 'sensor' ? '🔧' :
                             device.type === 'body_camera' ? '📷' : '📶'}
                          </div>
                          <div className={styles.searchResultInfo}>
                            <div className={styles.searchResultName}>{device.name}</div>
                            <div className={styles.searchResultLocation}>
                              {device.location || '位置未知'}
                            </div>
                          </div>
                          <div className={styles.searchResultStatus}>
                            <Badge
                              status={device.status === 'online' ? 'success' : 'error'}
                              text={device.status === 'online' ? '在线' : '离线'}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 地图图例 - 浮在地图上方 */}
            <div className={styles.mapLegend}>
              <div className={styles.legendTitle}>图例</div>
              <div className={styles.legendItems}>
                <div className={styles.legendItem}>
                  <div className={`${styles.legendMarker} ${styles.onlineMarker}`}></div>
                  <span>在线设备</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={`${styles.legendMarker} ${styles.offlineMarker}`}></div>
                  <span>离线设备</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={styles.legendAlarm}>!</div>
                  <span>告警设备</span>
                </div>
              </div>
            </div>

            {/* 轨迹控制面板 - 只在显示轨迹时出现 */}
            {showDeviceTracks && selectedTrackDevice && (
              <div className={styles.trackControlPanel}>
                <div className={styles.trackControlHeader}>
                  <div className={styles.trackControlTitle}>
                    <NodeIndexOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
                    <span>{isRealTimeTracking ? '实时轨迹跟踪' : '历史轨迹查询'}</span>
                    {isRealTimeTracking && (
                      <span className={styles.trackingStatus}>
                        <span className={styles.trackingDot}></span>
                        跟踪中
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.trackControlContent}>
                  <div className={styles.trackInfo}>
                    <div className={styles.trackDeviceName}>
                      {devices.find(d => d.id === selectedTrackDevice)?.name || '未知设备'}
                    </div>
                    <div className={styles.trackStats}>
                      <span className={styles.trackPointCount}>
                        轨迹点: {deviceTrackData.length}
                      </span>
                      {deviceTrackData.length > 0 && (
                        <span className={styles.trackTimeRange}>
                          {isRealTimeTracking ? (
                            trackingStartTime ?
                              `跟踪时长: ${Math.round((new Date() - new Date(trackingStartTime)) / (1000 * 60))}分钟` :
                              '实时跟踪'
                          ) : (
                            deviceTrackData.length > 1 ?
                              `时长: ${Math.round((new Date(deviceTrackData[deviceTrackData.length - 1].timestamp) -
                                               new Date(deviceTrackData[0].timestamp)) / (1000 * 60))}分钟` :
                              '历史查询'
                          )}
                        </span>
                      )}
                    </div>
                    {deviceTrackData.length > 0 && (
                      <div className={styles.trackDetails}>
                        <div className={styles.trackDetailItem}>
                          <span className={styles.trackDetailLabel}>起始时间:</span>
                          <span className={styles.trackDetailValue}>
                            {new Date(deviceTrackData[0].timestamp).toLocaleTimeString('zh-CN')}
                          </span>
                        </div>
                        <div className={styles.trackDetailItem}>
                          <span className={styles.trackDetailLabel}>
                            {isRealTimeTracking ? '最新时间:' : '结束时间:'}
                          </span>
                          <span className={styles.trackDetailValue}>
                            {new Date(deviceTrackData[deviceTrackData.length - 1].timestamp).toLocaleTimeString('zh-CN')}
                          </span>
                        </div>
                        <div className={styles.trackDetailItem}>
                          <span className={styles.trackDetailLabel}>总距离:</span>
                          <span className={styles.trackDetailValue}>
                            {trackStats.totalDistance} km
                          </span>
                        </div>
                        <div className={styles.trackDetailItem}>
                          <span className={styles.trackDetailLabel}>平均速度:</span>
                          <span className={styles.trackDetailValue}>
                            {trackStats.averageSpeed} km/h
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className={styles.trackActions}>
                    <Button
                      type="primary"
                      danger
                      size="small"
                      icon={<CloseCircleOutlined />}
                      onClick={clearDeviceTracks}
                      className={styles.clearTrackButton}
                    >
                      {isRealTimeTracking ? '取消跟踪' : '关闭轨迹'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* 地图上的叠加面板 */}
            {/* 左侧面板 - 标签页形式 */}
            {showDevicePanel && (
              <div className={`${styles.overlayPanel} ${styles.standardPanel}`} style={{ top: '20px', left: '20px' }}>
                <div className={styles.panelHeader}>
                  <Space>
                    <DesktopOutlined />
                    <span>监控面板</span>
                  </Space>
                  <Button
                    type="text"
                    size="small"
                    onClick={() => setShowDevicePanel(false)}
                    className={styles.panelCloseBtn}
                  >
                    ×
                  </Button>
                </div>
                <div className={styles.panelContent}>
                  <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    className={styles.panelTabs}
                    size="small"
                    items={[
                      {
                        key: 'status',
                        label: (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MonitorOutlined />
                            <span>设备概览</span>
                          </span>
                        ),
                        children: (
                          <div style={{ height: '100%', overflow: 'hidden' }}>
                            <DeviceOverviewCharts stats={stats} />
                          </div>
                        )
                      },
                      {
                        key: 'monitor',
                        label: (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <VideoCameraOutlined />
                            <span>监控设备</span>
                          </span>
                        ),
                        children: (
                          <div>
                      {/* 设备搜索和筛选 */}
                      <div className={styles.deviceControls}>
                        <Select
                          value={deviceFilter}
                          onChange={setDeviceFilter}
                          size="small"
                          className={styles.deviceFilter}
                        >
                          <Option value="all">全部设备</Option>
                          <Option value="online">在线设备</Option>
                          <Option value="offline">离线设备</Option>
                        </Select>
                      </div>

                      {/* 设备列表 */}
                      <div className={styles.deviceList}>
                        {getFilteredDevices().length > 0 ? (
                          getFilteredDevices().map((device) => (
                            <div key={device.id} className={styles.deviceItem}>
                              <div className={styles.deviceIcon}>
                                {getDeviceTypeIcon(device.type)}
                              </div>
                              <div className={styles.deviceInfo}>
                                <div className={styles.deviceHeader}>
                                  <div className={styles.deviceName}>{device.name}</div>
                                  <Badge
                                    status={device.status === 'online' ? 'success' : 'error'}
                                    text={device.status === 'online' ? '在线' : '离线'}
                                    className={styles.deviceStatusBadge}
                                  />
                                </div>
                                <div className={styles.deviceLocation}>
                                  {device.location || '位置未知'}
                                </div>
                              </div>
                              <div className={styles.deviceActions}>
                                <Space size="small">
                                  <Dropdown
                                    menu={{
                                      items: [
                                        {
                                          key: 'detail',
                                          label: '查看详情',
                                          icon: <InfoCircleOutlined />,
                                          onClick: () => handleDeviceDetailClick(device)
                                        },
                                        {
                                          key: 'quickTrack',
                                          label: '轨迹跟踪',
                                          icon: <NodeIndexOutlined />,
                                          disabled: device.status !== 'online',
                                          onClick: () => handleQuickTrack(device)
                                        },
                                        {
                                          key: 'track',
                                          label: '轨迹查询',
                                          icon: <NodeIndexOutlined />,
                                          onClick: () => handleDeviceTrack(device)
                                        },
                                        ...(device.type === 'camera' ? [{
                                          key: 'video',
                                          label: '查看视频',
                                          icon: <PlayCircleOutlined />,
                                          disabled: device.status !== 'online',
                                          onClick: () => handleVideoView(device)
                                        }] : []),
                                        ...(device.type === 'body_camera' ? [{
                                          key: 'call',
                                          label: '语音呼叫',
                                          icon: <PhoneOutlined />,
                                          disabled: device.status !== 'online',
                                          onClick: () => handleAudioCall(device)
                                        }] : []),
                                        {
                                          key: 'locate',
                                          label: '定位设备',
                                          icon: <EyeOutlined />,
                                          onClick: () => locateDevice(device.id)
                                        }
                                      ]
                                    }}
                                    placement="bottomRight"
                                    trigger={['click']}
                                  >
                                    <Button
                                      type="text"
                                      size="small"
                                      icon={<MoreOutlined />}
                                      className={styles.deviceActionBtn}
                                    />
                                  </Dropdown>
                                </Space>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className={styles.emptyState}>
                            <VideoCameraOutlined style={{ fontSize: '20px', color: '#8c8c8c', marginBottom: '6px' }} />
                            <div>暂无匹配的设备</div>
                          </div>
                        )}
                      </div>
                          </div>
                        )
                      }
                    ]}
                  />
                </div>
              </div>
            )}

            {/* 实时告警面板 - 右侧 */}
            {showAlarmPanel && (
              <div className={`${styles.overlayPanel} ${styles.alarmPanel}`} style={{ top: '68px', right: '20px' }}>
                <div className={styles.panelHeader}>
                  <Space>
                    <WarningOutlined />
                    <span>实时告警监控</span>
                  </Space>
                  <Button
                    type="text"
                    size="small"
                    onClick={() => setShowAlarmPanel(false)}
                    className={styles.panelCloseBtn}
                  >
                    ×
                  </Button>
                </div>
                <div className={`${styles.panelContent} ${styles.alarmPanelContent}`}>
                  <Tabs
                    activeKey={alarmActiveTab}
                    onChange={setAlarmActiveTab}
                    size="small"
                    className={styles.alarmTabs}
                    items={[
                      {
                        key: 'active',
                        label: (
                          <Space>
                            <span>未处理</span>
                            <Badge count={getActiveAlarms().length} size="small" />
                          </Space>
                        ),
                        children: (
                          <div className={styles.alarmTabContent}>
                            {getActiveAlarms().length > 0 ? (
                              <List
                                size="small"
                                dataSource={getActiveAlarms().slice(0, 10)}
                                renderItem={alarm => (
                                  <List.Item
                                    className={styles.overlayAlarmItem}
                                    onClick={() => handleAlarmClick(alarm)}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    <div className={styles.alarmContent}>
                                      <div className={styles.alarmHeader}>
                                        <Tag color={getAlarmColor(alarm.level)} size="small">
                                          {getAlarmLevelText(alarm.level)}
                                        </Tag>
                                        <span className={styles.alarmTime}>
                                          {alarm.time.split(' ')[1]}
                                        </span>
                                      </div>
                                      <div className={styles.alarmDevice}>{alarm.deviceName}</div>
                                      <div className={styles.alarmMessage}>{alarm.message}</div>
                                      <div className={styles.alarmAction}>
                                        <Space>
                                          <span>
                                            <InfoCircleOutlined style={{ marginRight: '4px' }} />
                                            点击查看详情
                                          </span>
                                          <Button
                                            type="primary"
                                            size="small"
                                            onClick={(e) => handleAlarmProcess(alarm, e)}
                                            className={styles.processBtn}
                                          >
                                            处理
                                          </Button>
                                        </Space>
                                      </div>
                                    </div>
                                  </List.Item>
                                )}
                              />
                            ) : (
                              <div className={styles.emptyState}>
                                <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
                                <div>暂无未处理告警</div>
                              </div>
                            )}
                          </div>
                        )
                      },
                      {
                        key: 'handled',
                        label: (
                          <Space>
                            <span>已处理</span>
                            <Badge count={getHandledAlarms().length} size="small" />
                          </Space>
                        ),
                        children: (
                          <div className={styles.alarmTabContent}>
                            {getHandledAlarms().length > 0 ? (
                              <List
                                size="small"
                                dataSource={getHandledAlarms().slice(0, 10)}
                                renderItem={alarm => (
                                  <List.Item
                                    className={styles.overlayAlarmItem}
                                    onClick={() => handleAlarmClick(alarm)}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    <div className={styles.alarmContent}>
                                      <div className={styles.alarmHeader}>
                                        <Tag color={getAlarmColor(alarm.level)} size="small">
                                          {getAlarmLevelText(alarm.level)}
                                        </Tag>
                                        <span className={styles.alarmTime}>
                                          {alarm.time.split(' ')[1]}
                                        </span>
                                      </div>
                                      <div className={styles.alarmDevice}>{alarm.deviceName}</div>
                                      <div className={styles.alarmMessage}>{alarm.message}</div>
                                      <div className={styles.alarmAction}>
                                        <Space>
                                          <span>
                                            <InfoCircleOutlined style={{ marginRight: '4px' }} />
                                            点击查看详情
                                          </span>
                                          <Tag color="success" size="small">
                                            已处理
                                          </Tag>
                                        </Space>
                                      </div>
                                    </div>
                                  </List.Item>
                                )}
                              />
                            ) : (
                              <div className={styles.emptyState}>
                                <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
                                <div>暂无已处理告警</div>
                              </div>
                            )}
                          </div>
                        )
                      }
                    ]}
                  />
                </div>


              </div>
            )}



          </div>
        </div>



        {/* 测量工具按钮 - 右下角上方 */}
        <div className={styles.measurementControls}>
          <Space direction="vertical" size={8}>
            <Tooltip title="测距工具">
              <Button
                type="default"
                icon={<LineOutlined />}
                onClick={() => message.info('测距功能开发中')}
                className={styles.controlBtn}
              />
            </Tooltip>
            <Tooltip title="测面积工具">
              <Button
                type="default"
                icon={<BorderInnerOutlined />}
                onClick={() => message.info('测面积功能开发中')}
                className={styles.controlBtn}
              />
            </Tooltip>
          </Space>
        </div>

        {/* 面板控制按钮 - 右下角 */}
        <div className={styles.bottomRightControls}>
          <Space direction="vertical" size={8}>
            <Tooltip title="设备状态面板">
              <Button
                type={showDevicePanel ? 'primary' : 'default'}
                icon={<MonitorOutlined />}
                onClick={() => setShowDevicePanel(!showDevicePanel)}
                className={styles.controlBtn}
              />
            </Tooltip>
            <Tooltip title={`当前：${mapType === 'normal' ? '标准地图' : mapType === 'satellite' ? '卫星地图' : '暗色地图'} - 点击切换`}>
              <Button
                type="default"
                icon={<GlobalOutlined />}
                onClick={toggleMapType}
                className={styles.controlBtn}
              />
            </Tooltip>
          </Space>
        </div>
      </div>

      {/* 设备信息弹窗 */}
      <Modal
        title={
          <Space>
            <MonitorOutlined />
            <span>设备详细信息</span>
          </Space>
        }
        open={deviceInfoVisible}
        onCancel={() => setDeviceInfoVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDeviceInfoVisible(false)}>
            关闭
          </Button>
        ]}
        width={420}
        height={500}
        className={styles.deviceInfoModal}
        bodyStyle={{
          padding: '16px',
          maxHeight: '400px',
          overflowY: 'auto'
        }}
      >
        {selectedDevice && (
          <div className={styles.deviceInfo}>
            <div className={styles.deviceInfoHeader}>
              <div className={styles.deviceIcon}>
                {selectedDevice.type === 'camera' ? '📹' :
                 selectedDevice.type === 'radio' ? '📡' :
                 selectedDevice.type === 'sensor' ? '🔧' :
                 selectedDevice.type === 'body_camera' ? '📷' : '📶'}
              </div>
              <div className={styles.deviceBasicInfo}>
                <h3 className={styles.deviceName}>{selectedDevice.name}</h3>
                <Tag
                  color={selectedDevice.status === 'online' ? 'green' : 'red'}
                  className={styles.deviceStatus}
                >
                  {selectedDevice.status === 'online' ? '在线' : '离线'}
                </Tag>
              </div>
            </div>

            <div className={styles.deviceDetails}>
              <Row gutter={[12, 12]}>
                <Col span={12}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>设备ID:</span>
                    <span className={styles.infoValue}>{selectedDevice.id}</span>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>设备类型:</span>
                    <span className={styles.infoValue}>
                      {selectedDevice.type === 'camera' ? '摄像头' :
                       selectedDevice.type === 'radio' ? '电台' :
                       selectedDevice.type === 'sensor' ? '网关设备' :
                       selectedDevice.type === 'body_camera' ? '执法仪' : '基站'}
                    </span>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>IP地址:</span>
                    <span className={styles.infoValue}>{selectedDevice.ip || '192.168.1.100'}</span>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>位置:</span>
                    <span className={styles.infoValue}>{selectedDevice.location || '北京市朝阳区'}</span>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>经度:</span>
                    <span className={styles.infoValue}>
                      {selectedDevice.position ? selectedDevice.position[0].toFixed(6) : '116.397428'}
                    </span>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>纬度:</span>
                    <span className={styles.infoValue}>
                      {selectedDevice.position ? selectedDevice.position[1].toFixed(6) : '39.909230'}
                    </span>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>最后上线:</span>
                    <span className={styles.infoValue}>{selectedDevice.lastOnline || '2024-01-15 14:30:25'}</span>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>告警数量:</span>
                    <span className={styles.infoValue} style={{ color: selectedDevice.alarmCount > 0 ? '#ff4d4f' : '#52c41a' }}>
                      {selectedDevice.alarmCount || 0}
                    </span>
                  </div>
                </Col>
              </Row>
            </div>

            {selectedDevice.description && (
              <div className={styles.deviceDescription}>
                <div className={styles.infoLabel}>设备描述:</div>
                <div className={styles.descriptionText}>{selectedDevice.description}</div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 告警详情弹窗 */}
      <Modal
        title={
          <Space>
            <WarningOutlined />
            <span>告警详细信息</span>
          </Space>
        }
        open={alarmDetailVisible}
        onCancel={() => setAlarmDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setAlarmDetailVisible(false)}>
            关闭
          </Button>
        ]}
        width={480}
        height={550}
        className={styles.alarmDetailModal}
        bodyStyle={{
          padding: '16px',
          maxHeight: '450px',
          overflowY: 'auto'
        }}
      >
        {selectedAlarm && (
          <div className={styles.alarmDetail}>
            <div className={styles.alarmDetailHeader}>
              <div className={styles.alarmLevelBadge}>
                <Tag
                  color={getAlarmColor(selectedAlarm.level)}
                  className={styles.alarmLevelTag}
                >
                  {getAlarmLevelText(selectedAlarm.level)}
                </Tag>
              </div>
              <div className={styles.alarmBasicInfo}>
                <h3 className={styles.alarmTitle}>{selectedAlarm.type}</h3>
                <div className={styles.alarmDevice}>{selectedAlarm.deviceName}</div>
              </div>
            </div>

            <div className={styles.alarmDetailContent}>
              <Row gutter={[12, 12]}>
                <Col span={12}>
                  <div className={styles.alarmInfoItem}>
                    <div className={styles.alarmInfoLabel}>告警时间</div>
                    <div className={styles.alarmInfoValue}>{selectedAlarm.time}</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.alarmInfoItem}>
                    <div className={styles.alarmInfoLabel}>告警状态</div>
                    <div className={styles.alarmInfoValue}>
                      {(() => {
                        switch(selectedAlarm.status) {
                          case 'pending':
                            return '待处理';
                          case 'processing':
                            return '处理中';
                          case 'resolved':
                            return '已解决';
                          case 'ignored':
                            return '已忽略';
                          case 'active':
                            return '待处理';
                          case 'handled':
                            return '已处理';
                          default:
                            return selectedAlarm.status || '未知状态';
                        }
                      })()}
                    </div>
                  </div>
                </Col>
                {selectedAlarm.handler && (
                  <>
                    <Col span={12}>
                      <div className={styles.alarmInfoItem}>
                        <div className={styles.alarmInfoLabel}>处理人员</div>
                        <div className={styles.alarmInfoValue}>{selectedAlarm.handler}</div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className={styles.alarmInfoItem}>
                        <div className={styles.alarmInfoLabel}>处理时间</div>
                        <div className={styles.alarmInfoValue}>{selectedAlarm.handleTime}</div>
                      </div>
                    </Col>
                  </>
                )}
              </Row>
            </div>

            <div className={styles.alarmDescription}>
              <div className={styles.alarmInfoLabel}>告警描述</div>
              <div className={styles.alarmDescriptionText}>{selectedAlarm.description}</div>
            </div>

            {selectedAlarm.handleResult && (
              <div className={styles.alarmDescription}>
                <div className={styles.alarmInfoLabel}>处理结果</div>
                <div className={styles.alarmDescriptionText}>{selectedAlarm.handleResult}</div>
              </div>
            )}

            <div className={styles.alarmSolution}>
              <div className={styles.alarmInfoLabel}>建议解决方案</div>
              <div className={styles.alarmSolutionText}>
                {selectedAlarm.solution?.split('\n').map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 告警处理弹窗 */}
      <Modal
        title={
          <Space>
            <WarningOutlined />
            <span>处理告警</span>
            {selectedHandleAlarm && (
              <Tag color={getAlarmColor(selectedHandleAlarm.level)}>
                {getAlarmLevelText(selectedHandleAlarm.level)}
              </Tag>
            )}
          </Space>
        }
        open={alarmHandleVisible}
        onCancel={() => {
          setAlarmHandleVisible(false);
          setSelectedHandleAlarm(null);
        }}
        footer={null}
        width={600}
        className={styles.alarmHandleModal}
      >
        {selectedHandleAlarm && (
          <Form
            layout="vertical"
            onFinish={handleAlarmSubmit}
            initialValues={{
              handler: '当前用户'
            }}
          >
            {/* 告警信息展示 */}
            <div className={styles.alarmInfo}>
              <div className={styles.alarmInfoRow}>
                <span className={styles.alarmInfoLabel}>设备名称：</span>
                <span className={styles.alarmInfoValue}>{selectedHandleAlarm.deviceName}</span>
              </div>
              <div className={styles.alarmInfoRow}>
                <span className={styles.alarmInfoLabel}>告警类型：</span>
                <span className={styles.alarmInfoValue}>{selectedHandleAlarm.type}</span>
              </div>
              <div className={styles.alarmInfoRow}>
                <span className={styles.alarmInfoLabel}>告警时间：</span>
                <span className={styles.alarmInfoValue}>{selectedHandleAlarm.time}</span>
              </div>
              <div className={styles.alarmInfoRow}>
                <span className={styles.alarmInfoLabel}>告警描述：</span>
                <span className={styles.alarmInfoValue}>{selectedHandleAlarm.message}</span>
              </div>
            </div>

            <Divider />

            {/* 处理表单 */}
            <Form.Item
              name="handleResult"
              label="处理结果"
              rules={[
                { required: true, message: '请输入处理结果' },
                { min: 10, message: '处理结果至少需要10个字符' }
              ]}
            >
              <Input.TextArea
                rows={4}
                placeholder="请详细描述处理过程和结果..."
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Form.Item
              name="handler"
              label="处理人员"
            >
              <Input placeholder="处理人员姓名" />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  确认处理
                </Button>
                <Button onClick={() => {
                  setAlarmHandleVisible(false);
                  setSelectedHandleAlarm(null);
                }}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* 视频查看弹窗 */}
      <Modal
        title={
          <Space>
            <VideoCameraOutlined />
            <span>实时视频监控</span>
            {selectedVideoDevice && (
              <Tag color="blue">{selectedVideoDevice.name}</Tag>
            )}
          </Space>
        }
        open={videoModalVisible}
        onCancel={() => setVideoModalVisible(false)}
        footer={[
          <Button key="fullscreen" icon={<FullscreenOutlined />}>
            全屏
          </Button>,
          <Button key="record" icon={<VideoCameraOutlined />}>
            录像
          </Button>,
          <Button key="close" onClick={() => setVideoModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
        height={600}
        className={styles.videoModal}
        bodyStyle={{
          padding: '16px',
          height: '500px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {selectedVideoDevice && (
          <div className={styles.videoContainer}>
            <div className={styles.videoPlayer}>
              {/* 模拟视频播放器 */}
              <div className={styles.videoPlaceholder}>
                <VideoCameraOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                <div className={styles.videoText}>
                  <div>设备：{selectedVideoDevice.name}</div>
                  <div>状态：{selectedVideoDevice.status === 'online' ? '在线直播中' : '设备离线'}</div>
                  <div>分辨率：1920x1080</div>
                  <div>帧率：25fps</div>
                </div>
              </div>
            </div>

            <div className={styles.videoControls}>
              <Space>
                <Button icon={<PlayCircleOutlined />} type="primary">
                  播放
                </Button>
                <Button icon={<VideoCameraOutlined />}>
                  截图
                </Button>
                <Select defaultValue="high" size="small" style={{ width: 100 }}>
                  <Option value="high">高清</Option>
                  <Option value="medium">标清</Option>
                  <Option value="low">流畅</Option>
                </Select>
                <div className={styles.videoInfo}>
                  <span>码率: 2048kbps</span>
                  <Divider type="vertical" />
                  <span>延迟: 200ms</span>
                </div>
              </Space>
            </div>
          </div>
        )}
      </Modal>

      {/* 设备告警详情弹窗 */}
      <Modal
        title={
          <Space>
            <WarningOutlined />
            <span>设备告警详情</span>
            {selectedDeviceForAlarm && (
              <Tag color="blue">{selectedDeviceForAlarm.name}</Tag>
            )}
          </Space>
        }
        open={deviceAlarmDetailVisible}
        onCancel={() => {
          setDeviceAlarmDetailVisible(false);
          setSelectedDeviceForAlarm(null);
          setDeviceAlarms([]);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setDeviceAlarmDetailVisible(false);
            setSelectedDeviceForAlarm(null);
            setDeviceAlarms([]);
          }}>
            关闭
          </Button>
        ]}
        width={800}
        className={styles.deviceAlarmModal}
        bodyStyle={{
          padding: '16px',
          maxHeight: '500px',
          overflowY: 'auto'
        }}
      >
        {selectedDeviceForAlarm && (
          <div className={styles.deviceAlarmContent}>
            {/* 设备基本信息 */}
            <div className={styles.deviceAlarmHeader}>
              <div className={styles.deviceAlarmInfo}>
                <div className={styles.deviceAlarmItem}>
                  <span className={styles.deviceAlarmLabel}>设备ID:</span>
                  <span className={styles.deviceAlarmValue}>{selectedDeviceForAlarm.id}</span>
                </div>
                <div className={styles.deviceAlarmItem}>
                  <span className={styles.deviceAlarmLabel}>设备位置:</span>
                  <span className={styles.deviceAlarmValue}>{selectedDeviceForAlarm.location || '位置未知'}</span>
                </div>
                <div className={styles.deviceAlarmItem}>
                  <span className={styles.deviceAlarmLabel}>设备状态:</span>
                  <Badge
                    status={selectedDeviceForAlarm.status === 'online' ? 'success' : 'error'}
                    text={
                      <span style={{ color: '#ffffff' }}>
                        {selectedDeviceForAlarm.status === 'online' ? '在线' : '离线'}
                      </span>
                    }
                  />
                </div>
                <div className={styles.deviceAlarmItem}>
                  <span className={styles.deviceAlarmLabel}>告警数量:</span>
                  <span className={styles.deviceAlarmValue} style={{ color: '#ff4d4f' }}>
                    {selectedDeviceForAlarm.alarmCount} 条
                  </span>
                </div>
              </div>
            </div>

            <Divider />

            {/* 告警列表 */}
            <div className={styles.deviceAlarmList}>
              <div className={styles.deviceAlarmListTitle}>告警详情列表</div>
              {deviceAlarms.length > 0 ? (
                <List
                  size="small"
                  dataSource={deviceAlarms}
                  renderItem={(alarm) => (
                    <List.Item className={styles.deviceAlarmListItem}>
                      <div className={styles.alarmItemContent}>
                        <div className={styles.alarmItemHeader}>
                          <span className={styles.alarmItemTitle}>{alarm.alarmTitle}</span>
                          <Tag color={getAlarmColor(alarm.alarmLevel)}>
                            {getAlarmLevelText(alarm.alarmLevel)}
                          </Tag>
                        </div>
                        <div className={styles.alarmItemTime}>
                          告警时间: {alarm.alarmTime}
                        </div>
                        <div className={styles.alarmItemDesc}>
                          {alarm.alarmDescription}
                        </div>
                        <div className={styles.alarmItemStatus}>
                          状态: {getAlarmStatusTag(alarm.status)}
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              ) : (
                <div className={styles.noAlarmData}>
                  <WarningOutlined style={{ fontSize: '24px', color: '#d9d9d9' }} />
                  <div>暂无告警数据</div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* 轨迹时间选择器 Modal */}
      <Modal
        title={
          <Space>
            <NodeIndexOutlined />
            <span>轨迹查询</span>
          </Space>
        }
        open={trackTimeModalVisible}
        onOk={handleTrackQuery}
        onCancel={handleTrackCancel}
        confirmLoading={loading}
        okText="查询轨迹"
        cancelText="取消"
        width={500}
        className={`${styles.trackTimeModal} track-time-modal`}
      >
        {currentTrackDevice && (
          <div className={styles.trackTimeContent}>
            <div className={styles.deviceInfo}>
              <div className={styles.deviceIcon}>
                {getDeviceTypeIcon(currentTrackDevice.type)}
              </div>
              <div className={styles.deviceDetails}>
                <div className={styles.deviceName}>{currentTrackDevice.name}</div>
                <div className={styles.deviceLocation}>{currentTrackDevice.location}</div>
              </div>
            </div>

            <Divider />

            <div className={styles.timeRangeSelector}>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div className={styles.timeLabel}>选择查询时间范围：</div>
                </Col>
                <Col span={12}>
                  <div className={styles.timeInputGroup}>
                    <label>开始时间：</label>
                    <DatePicker
                      showTime
                      value={trackStartTime}
                      onChange={setTrackStartTime}
                      placeholder="选择开始时间"
                      format="YYYY-MM-DD HH:mm:ss"
                      style={{ width: '100%' }}
                      size="small"
                    />
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.timeInputGroup}>
                    <label>结束时间：</label>
                    <DatePicker
                      showTime
                      value={trackEndTime}
                      onChange={setTrackEndTime}
                      placeholder="选择结束时间"
                      format="YYYY-MM-DD HH:mm:ss"
                      style={{ width: '100%' }}
                      size="small"
                    />
                  </div>
                </Col>
                <Col span={24}>
                  <div className={styles.quickTimeButtons}>
                    <Space wrap>
                      <Button
                        size="small"
                        onClick={() => {
                          const now = dayjs();
                          const oneHourAgo = dayjs().subtract(1, 'hour');
                          setTrackStartTime(oneHourAgo);
                          setTrackEndTime(now);
                        }}
                      >
                        最近1小时
                      </Button>
                      <Button
                        size="small"
                        onClick={() => {
                          const now = dayjs();
                          const sixHoursAgo = dayjs().subtract(6, 'hour');
                          setTrackStartTime(sixHoursAgo);
                          setTrackEndTime(now);
                        }}
                      >
                        最近6小时
                      </Button>
                      <Button
                        size="small"
                        onClick={() => {
                          const now = dayjs();
                          const oneDayAgo = dayjs().subtract(1, 'day');
                          setTrackStartTime(oneDayAgo);
                          setTrackEndTime(now);
                        }}
                      >
                        最近24小时
                      </Button>
                      <Button
                        size="small"
                        onClick={() => {
                          const now = dayjs();
                          const threeDaysAgo = dayjs().subtract(3, 'day');
                          setTrackStartTime(threeDaysAgo);
                          setTrackEndTime(now);
                        }}
                      >
                        最近3天
                      </Button>
                    </Space>
                  </div>
                </Col>
              </Row>
            </div>

            <div className={styles.trackTips}>
              <div className={styles.tipsTitle}>提示：</div>
              <ul className={styles.tipsList}>
                <li>轨迹查询时间范围不能超过7天</li>
                <li>查询结果将在地图上以线条形式显示</li>
                <li>轨迹点包含时间、位置、速度等信息</li>
                <li>可以点击轨迹点查看详细信息</li>
              </ul>
            </div>
          </div>
        )}
      </Modal>

      {/* 告警按钮 - 右上角 */}
      <div className={styles.alarmButtonContainer}>
        <Tooltip title="告警面板">
          <Button
            type={showAlarmPanel ? 'primary' : 'default'}
            icon={<WarningOutlined />}
            onClick={() => setShowAlarmPanel(!showAlarmPanel)}
            className={`${styles.controlBtn} ${styles.alarmButton} ${stats.activeAlarms > 0 ? styles.alarmBlinking : ''}`}
          />
        </Tooltip>
      </div>

      {/* 最小化语音呼叫浮动按钮 */}
      {audioCallModalVisible && isCallMinimized && selectedCallDevice && (
        <div
          className={`${styles.minimizedCallFloat} ${isDragging ? styles.dragging : ''}`}
          style={{
            right: `${dragPosition.x}px`,
            bottom: `${dragPosition.y}px`
          }}
        >
          <div
            className={styles.minimizedCallContent}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onClick={handleFloatClick}
          >
            <div className={styles.minimizedCallHeader}>
              <PhoneOutlined className={styles.minimizedCallIcon} />
              <div className={styles.minimizedCallInfo}>
                <div className={styles.minimizedCallDevice}>{selectedCallDevice.name}</div>
                <div className={styles.minimizedCallStatus}>
                  {callStatus === 'calling' && (
                    <>
                      <div className={styles.callingIndicator}></div>
                      <span>呼叫中...</span>
                    </>
                  )}
                  {callStatus === 'talking' && (
                    <>
                      <div className={styles.talkingIndicator}></div>
                      <span>通话中</span>
                    </>
                  )}
                  {callStatus === 'idle' && <span>准备呼叫</span>}
                </div>
              </div>
            </div>
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleCloseCall();
              }}
              className={styles.minimizedCallClose}
              title="结束通话"
            />
          </div>
        </div>
      )}

      {/* 轨迹跟踪确认弹窗 */}
      <Modal
        title={
          <Space>
            <NodeIndexOutlined />
            <span>轨迹跟踪</span>
          </Space>
        }
        open={quickTrackModalVisible}
        onOk={handleConfirmQuickTrack}
        onCancel={handleCancelQuickTrack}
        confirmLoading={loading}
        okText="开始跟踪"
        cancelText="取消"
        width={450}
        className={`${styles.trackTimeModal} track-time-modal`}
      >
        {currentQuickTrackDevice && (
          <div className={styles.trackTimeContent}>
            <div className={styles.deviceInfo}>
              <div className={styles.deviceIcon}>
                {getDeviceTypeIcon(currentQuickTrackDevice.type)}
              </div>
              <div className={styles.deviceDetails}>
                <div className={styles.deviceName}>{currentQuickTrackDevice.name}</div>
                <div className={styles.deviceLocation}>
                  {currentQuickTrackDevice.location || '位置未知'}
                </div>
              </div>
            </div>

            <div className={styles.trackDescription}>
              <div className={styles.trackDescTitle}>功能说明：</div>
              <div className={styles.trackDescContent}>
                轨迹跟踪将从当前时刻开始，实时接收并显示该设备的移动轨迹。
                通过连续的位置点连线，动态呈现设备的实时移动路径。
              </div>
            </div>

            <div className={styles.trackTips}>
              <div className={styles.tipsTitle}>提示：</div>
              <ul className={styles.tipsList}>
                <li>从当前时刻开始实时跟踪设备移动</li>
                <li>轨迹将以彩色线条在地图上动态显示</li>
                <li>设备离线时自动停止跟踪</li>
                <li>可随时停止轨迹跟踪</li>
              </ul>
            </div>
          </div>
        )}
      </Modal>

      {/* 语音呼叫弹窗 */}
      <AudioCallModal
        visible={audioCallModalVisible}
        onCancel={handleCloseCall}
        device={selectedCallDevice}
        onCallStatusChange={handleCallStatusChange}
        isMinimized={isCallMinimized}
        onMinimize={handleMinimizeCall}
        onRestore={handleRestoreCall}
      />
    </div>
  );
};

// 辅助函数
const getAlarmColor = (level) => {
  const colors = {
    info: 'blue',
    warning: 'orange',
    error: 'red',
    critical: 'volcano',
    alarm: 'volcano'
  };
  return colors[level] || 'default';
};

const getAlarmLevelText = (level) => {
  const texts = {
    info: '信息',
    warning: '警告',
    error: '错误',
    critical: '严重',
    alarm: '报警'
  };
  return texts[level] || level;
};

const getAlarmStatusTag = (status) => {
  const statusConfig = {
    pending: { color: 'orange', text: '待处理' },
    processing: { color: 'blue', text: '处理中' },
    resolved: { color: 'green', text: '已解决' },
    ignored: { color: 'gray', text: '已忽略' }
  };

  const config = statusConfig[status] || { color: 'default', text: status };
  return <Tag color={config.color}>{config.text}</Tag>;
};

export default StandaloneMonitor;
