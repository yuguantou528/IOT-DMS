import React, { useState, useEffect, useRef } from 'react';
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
  Divider
} from 'antd';
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
  NodeIndexOutlined
} from '@ant-design/icons';
import styles from './StandaloneMonitor.module.css';
import { 
  getDeviceList, 
  getAlarmList, 
  getStatistics
} from '../../services/visualMonitorService';

const { Option } = Select;
const { Search } = Input;

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
  const [showDevicePanel, setShowDevicePanel] = useState(true);
  const [showAlarmPanel, setShowAlarmPanel] = useState(true);
  const [mapType, setMapType] = useState('normal'); // 'normal', 'satellite', 'dark', 'tianditu'
  const [deviceInfoVisible, setDeviceInfoVisible] = useState(false);
  const [alarmDetailVisible, setAlarmDetailVisible] = useState(false);
  const [selectedAlarm, setSelectedAlarm] = useState(null);
  const [activeTab, setActiveTab] = useState('status'); // 'status' 或 'monitor'
  const [deviceFilter, setDeviceFilter] = useState('all'); // 'all', 'online', 'offline', 'camera'
  const [selectedVideoDevice, setSelectedVideoDevice] = useState(null);
  const [mapSearchText, setMapSearchText] = useState('');
  const [mapDeviceFilter, setMapDeviceFilter] = useState('all');
  const [showDeviceTracks, setShowDeviceTracks] = useState(false);
  const [selectedTrackDevice, setSelectedTrackDevice] = useState(null);

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

    // 定时刷新数据
    const dataInterval = setInterval(loadData, 30000); // 30秒刷新一次

    // 更新时间
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // 更新天气（每10分钟）
    const weatherInterval = setInterval(updateWeather, 600000);

    return () => {
      clearInterval(dataInterval);
      clearInterval(timeInterval);
      clearInterval(weatherInterval);
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

  // 获取设备类型统计
  const getDeviceTypeStats = () => {
    const typeMap = {
      camera: { name: '摄像头', count: 0 },
      radio: { name: '电台', count: 0 },
      sensor: { name: '传感器', count: 0 },
      base_station: { name: '基站', count: 0 }
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
  };

  // 获取设备类型图标
  const getDeviceTypeIcon = (type) => {
    const icons = {
      camera: '📹',
      radio: '📡',
      sensor: '🔧',
      base_station: '📶'
    };
    return icons[type] || '📱';
  };

  // 获取设备类型颜色
  const getDeviceTypeColor = (type) => {
    const colors = {
      camera: '#1890ff',
      radio: '#52c41a',
      sensor: '#faad14',
      base_station: '#f5222d'
    };
    return colors[type] || '#722ed1';
  };

  // 切换地图类型
  const toggleMapType = () => {
    setMapType(prevType => {
      const types = ['normal', 'satellite', 'dark'];
      const currentIndex = types.indexOf(prevType);
      const nextIndex = (currentIndex + 1) % types.length;
      return types[nextIndex];
    });
  };

  // 处理设备点击
  const handleDeviceClick = (device) => {
    setSelectedDevice(device);
    setDeviceInfoVisible(true);
  };

  // 处理单个设备轨迹查看
  const handleDeviceTrack = (device) => {
    console.log('处理设备轨迹:', device);
    setSelectedTrackDevice(device.id);
    setShowDeviceTracks(true);
    console.log('轨迹状态更新:', { showDeviceTracks: true, selectedTrackDevice: device.id });
    message.success(`已显示 ${device.name} 的轨迹`);
  };

  // 定位到设备
  const locateDevice = (deviceId) => {
    // 找到对应的设备数据
    const device = devices.find(d => d.id === deviceId);
    if (!device || !device.position) {
      message.warning('设备位置信息不可用');
      return;
    }

    console.log('🎯 [定位设备] 开始定位设备:', {
      deviceId,
      deviceName: device.name,
      position: device.position,
      status: device.status
    });

    // 在地图上定位设备标记
    const deviceMarker = document.querySelector(`[data-device-id="${deviceId}"]`);
    if (deviceMarker) {
      // 添加高亮效果到地图标记
      deviceMarker.classList.add(styles.deviceHighlight);

      // 平滑滚动地图容器到设备位置
      const mapContainer = document.querySelector(`.${styles.mapContainer}`);
      if (mapContainer) {
        // 计算设备在地图中的相对位置（这里是模拟计算）
        const containerRect = mapContainer.getBoundingClientRect();
        const markerRect = deviceMarker.getBoundingClientRect();

        // 计算需要滚动的距离，使设备居中显示
        const scrollX = markerRect.left - containerRect.left - containerRect.width / 2;
        const scrollY = markerRect.top - containerRect.top - containerRect.height / 2;

        // 平滑滚动到设备位置
        mapContainer.scrollTo({
          left: mapContainer.scrollLeft + scrollX,
          top: mapContainer.scrollTop + scrollY,
          behavior: 'smooth'
        });
      }

      // 显示定位成功消息
      message.success(`已定位到设备：${device.name}`);

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
    } else {
      // 如果在地图上找不到设备标记，尝试模拟地图缩放和移动
      console.log('📍 [定位设备] 地图标记未找到，模拟地图操作');

      // 显示定位信息
      message.info(`正在定位设备：${device.name}`, 2);

      // 模拟地图缩放和移动动画
      const mapContainer = document.querySelector(`.${styles.mapContainer}`);
      if (mapContainer) {
        // 添加定位动画效果
        mapContainer.style.transition = 'transform 1s ease-in-out';
        mapContainer.style.transform = 'scale(1.1)';

        setTimeout(() => {
          mapContainer.style.transform = 'scale(1)';
          setTimeout(() => {
            mapContainer.style.transition = '';
          }, 1000);
        }, 1000);
      }

      // 显示设备位置信息
      setTimeout(() => {
        message.success(`设备位置：${device.address || '位置信息不详'}`);
      }, 1500);
    }
  };

  // 处理告警详情点击
  const handleAlarmClick = (alarm) => {
    setSelectedAlarm(alarm);
    setAlarmDetailVisible(true);
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



  // 筛选地图上显示的设备
  const getFilteredMapDevices = () => {
    let filtered = devices;

    // 按状态筛选
    if (mapDeviceFilter === 'online') {
      filtered = filtered.filter(device => device.status === 'online');
    } else if (mapDeviceFilter === 'offline') {
      filtered = filtered.filter(device => device.status === 'offline');
    } else if (mapDeviceFilter === 'alarm') {
      filtered = filtered.filter(device => device.alarmCount > 0);
    }

    // 按搜索文本筛选
    if (mapSearchText) {
      const searchText = mapSearchText.toLowerCase();
      filtered = filtered.filter(device => {
        const deviceName = device.name ? device.name.toLowerCase() : '';
        const deviceId = device.id ? String(device.id).toLowerCase() : '';
        const deviceLocation = device.location ? device.location.toLowerCase() : '';
        return deviceName.includes(searchText) ||
               deviceId.includes(searchText) ||
               deviceLocation.includes(searchText);
      });
    }

    return filtered;
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
            <Space>
              <Button
                icon={<HomeOutlined />}
                onClick={goToMainSystem}
                type="text"
                className={styles.headerBtn}
              >
                返回主系统
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadData}
                loading={loading}
                type="text"
                className={styles.headerBtn}
              >
                刷新数据
              </Button>
              <Button
                icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                onClick={toggleFullscreen}
                type="text"
                className={styles.headerBtn}
              >
                {isFullscreen ? '退出全屏' : '全屏显示'}
              </Button>
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
              devices={getFilteredMapDevices()}
              onDeviceClick={handleDeviceClick}
              mapType={mapType}
              height="100%"
              className={styles.leafletMapWrapper}
              showTracks={showDeviceTracks}
              selectedDeviceId={selectedTrackDevice}
            />
            {/* 调试信息 */}
            {showDeviceTracks && (
              <div style={{ 
                position: 'absolute', 
                top: '10px', 
                right: '10px', 
                background: 'rgba(0,0,0,0.7)', 
                color: 'white', 
                padding: '8px', 
                borderRadius: '4px',
                fontSize: '12px',
                zIndex: 1000
              }}>
                轨迹调试: 显示={showDeviceTracks ? '是' : '否'}, 设备ID={selectedTrackDevice}
              </div>
            )}

            {/* 地图搜索控制面板 */}
            <div className={styles.mapSearchPanel}>
              <div className={styles.searchPanelContent}>
                <Input
                  placeholder="搜索设备名称、ID或位置"
                  value={mapSearchText}
                  onChange={(e) => setMapSearchText(e.target.value)}
                  className={styles.mapSearchInput}
                  size="small"
                  prefix={<SearchOutlined style={{ color: 'rgba(255, 255, 255, 0.5)' }} />}
                  allowClear
                />
                <Select
                  value={mapDeviceFilter}
                  onChange={setMapDeviceFilter}
                  size="small"
                  className={styles.mapFilterSelect}
                >
                  <Option value="all">全部设备</Option>
                  <Option value="online">在线设备</Option>
                  <Option value="offline">离线设备</Option>
                  <Option value="alarm">告警设备</Option>
                </Select>
              </div>
              <div className={styles.searchStats}>
                显示 {getFilteredMapDevices().length} / {devices.length} 个设备
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
                            <span>系统状态</span>
                          </span>
                        ),
                        children: (
                          <div>
                      {/* 主要统计数据 */}
                      <div className={styles.mainStatsGrid}>
                        <div className={styles.mainStatItem}>
                          <div className={styles.mainStatIcon}>
                            <MonitorOutlined style={{ color: '#1890ff' }} />
                          </div>
                          <div className={styles.mainStatInfo}>
                            <div className={styles.mainStatNumber}>{stats.totalDevices}</div>
                            <div className={styles.mainStatLabel}>设备总数</div>
                          </div>
                        </div>
                        <div className={styles.mainStatItem}>
                          <div className={styles.mainStatIcon}>
                            <CheckCircleOutlined style={{ color: '#52c41a' }} />
                          </div>
                          <div className={styles.mainStatInfo}>
                            <div className={styles.mainStatNumber} style={{ color: '#52c41a' }}>
                              {stats.onlineDevices}
                            </div>
                            <div className={styles.mainStatLabel}>在线设备</div>
                          </div>
                        </div>
                        <div className={styles.mainStatItem}>
                          <div className={styles.mainStatIcon}>
                            <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                          </div>
                          <div className={styles.mainStatInfo}>
                            <div className={styles.mainStatNumber} style={{ color: '#ff4d4f' }}>
                              {stats.offlineDevices}
                            </div>
                            <div className={styles.mainStatLabel}>离线设备</div>
                          </div>
                        </div>
                        <div className={styles.mainStatItem}>
                          <div className={styles.mainStatIcon}>
                            <WarningOutlined style={{ color: '#faad14' }} />
                          </div>
                          <div className={styles.mainStatInfo}>
                            <div className={styles.mainStatNumber} style={{ color: '#faad14' }}>
                              {stats.activeAlarms}
                            </div>
                            <div className={styles.mainStatLabel}>活跃告警</div>
                          </div>
                        </div>
                      </div>

                      {/* 在线率显示 */}
                      <div className={styles.onlineRateSection}>
                        <div className={styles.onlineRateHeader}>
                          <span className={styles.onlineRateLabel}>设备在线率</span>
                          <span className={styles.onlineRateValue}>{onlineRate}%</span>
                        </div>
                        <Progress
                          percent={onlineRate}
                          size="small"
                          strokeColor={onlineRate >= 90 ? '#52c41a' : onlineRate >= 70 ? '#faad14' : '#ff4d4f'}
                          showInfo={false}
                          strokeWidth={8}
                        />
                        <div className={styles.onlineRateStatus}>
                          {onlineRate >= 90 ? '系统运行良好' : onlineRate >= 70 ? '系统运行正常' : '需要关注'}
                        </div>
                      </div>

                      {/* 设备类型分布 */}
                      <div className={styles.deviceTypeSection}>
                        <div className={styles.sectionTitle}>
                          <SettingOutlined style={{ marginRight: '8px' }} />
                          设备类型分布
                        </div>
                        <div className={styles.deviceTypeChart}>
                          {getDeviceTypeStats().length > 0 ? (
                            getDeviceTypeStats().map((item, index) => (
                              <div key={item.type} className={styles.compactDeviceTypeItem}>
                                <div className={styles.deviceTypeIcon}>
                                  {getDeviceTypeIcon(item.type)}
                                </div>
                                <div className={styles.deviceTypeInfo}>
                                  <div className={styles.deviceTypeName}>{item.name}</div>
                                  <div className={styles.deviceTypeCount}>{item.count}</div>
                                </div>
                                <div className={styles.deviceTypeBar}>
                                  <div
                                    className={styles.deviceTypeProgress}
                                    style={{
                                      width: `${stats.totalDevices > 0 ? (item.count / stats.totalDevices) * 100 : 0}%`,
                                      backgroundColor: getDeviceTypeColor(item.type)
                                    }}
                                  />
                                </div>
                                <div className={styles.deviceTypePercent}>
                                  {stats.totalDevices > 0 ? Math.round((item.count / stats.totalDevices) * 100) : 0}%
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className={styles.emptyState}>
                              <MonitorOutlined style={{ fontSize: '20px', color: '#8c8c8c', marginBottom: '6px' }} />
                              <div>暂无设备数据</div>
                            </div>
                          )}
                        </div>
                      </div>
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
                                <div className={styles.deviceName}>{device.name}</div>
                                <div className={styles.deviceLocation}>
                                  {device.location || '位置未知'}
                                </div>
                              </div>
                              <div className={styles.deviceStatus}>
                                <Badge
                                  status={device.status === 'online' ? 'success' : 'error'}
                                  text={device.status === 'online' ? '在线' : '离线'}
                                />
                              </div>
                              <div className={styles.deviceActions}>
                                <Tooltip title="查看详情">
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<InfoCircleOutlined />}
                                    onClick={() => handleDeviceClick(device)}
                                  />
                                </Tooltip>
                                <Tooltip title="查看轨迹">
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<NodeIndexOutlined />}
                                    onClick={() => handleDeviceTrack(device)}
                                  />
                                </Tooltip>
                                {device.type === 'camera' && (
                                  <Tooltip title="查看视频">
                                    <Button
                                      type="text"
                                      size="small"
                                      icon={<PlayCircleOutlined />}
                                      onClick={() => handleVideoView(device)}
                                      disabled={device.status !== 'online'}
                                    />
                                  </Tooltip>
                                )}
                                <Tooltip title="定位设备">
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<EyeOutlined />}
                                    onClick={() => locateDevice(device.id)}
                                  />
                                </Tooltip>
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
              <div className={`${styles.overlayPanel} ${styles.alarmPanel}`} style={{ top: '20px', right: '20px' }}>
                <div className={styles.panelHeader}>
                  <Space>
                    <WarningOutlined />
                    <span>实时告警监控</span>
                    <Badge count={stats.activeAlarms} />
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
                  {alarms.length > 0 ? (
                    <List
                      size="small"
                      dataSource={alarms.slice(0, 6)}
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
                              <InfoCircleOutlined style={{ marginRight: '4px' }} />
                              点击查看详情
                            </div>
                          </div>
                        </List.Item>
                      )}
                    />
                  ) : (
                    <div className={styles.emptyState}>
                      <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
                      <div>暂无活跃告警</div>
                    </div>
                  )}
                </div>


              </div>
            )}



          </div>
        </div>

        {/* 面板控制按钮 - 右下角 */}
        <div className={styles.bottomRightControls}>
          <Space direction="vertical">
            <Tooltip title="设备状态面板">
              <Button
                type={showDevicePanel ? 'primary' : 'default'}
                icon={<MonitorOutlined />}
                onClick={() => setShowDevicePanel(!showDevicePanel)}
                className={styles.controlBtn}
              />
            </Tooltip>
            <Tooltip title="告警面板">
              <Button
                type={showAlarmPanel ? 'primary' : 'default'}
                icon={<WarningOutlined />}
                onClick={() => setShowAlarmPanel(!showAlarmPanel)}
                className={`${styles.controlBtn} ${stats.activeAlarms > 0 ? styles.alarmBlinking : ''}`}
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
                 selectedDevice.type === 'sensor' ? '🔧' : '📶'}
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
                       selectedDevice.type === 'sensor' ? '传感器' : '基站'}
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
                <h3 className={styles.alarmTitle}>{selectedAlarm.message}</h3>
                <div className={styles.alarmDevice}>设备：{selectedAlarm.deviceName}</div>
              </div>
            </div>

            <div className={styles.alarmDetailContent}>
              <Row gutter={[12, 12]}>
                <Col span={24}>
                  <div className={styles.alarmInfoItem}>
                    <span className={styles.alarmInfoLabel}>告警时间:</span>
                    <span className={styles.alarmInfoValue}>{selectedAlarm.time}</span>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.alarmInfoItem}>
                    <span className={styles.alarmInfoLabel}>告警类型:</span>
                    <span className={styles.alarmInfoValue}>{selectedAlarm.type || '设备异常'}</span>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.alarmInfoItem}>
                    <span className={styles.alarmInfoLabel}>告警级别:</span>
                    <span className={styles.alarmInfoValue}>{getAlarmLevelText(selectedAlarm.level)}</span>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.alarmInfoItem}>
                    <span className={styles.alarmInfoLabel}>设备ID:</span>
                    <span className={styles.alarmInfoValue}>{selectedAlarm.deviceId}</span>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.alarmInfoItem}>
                    <span className={styles.alarmInfoLabel}>处理状态:</span>
                    <span className={styles.alarmInfoValue} style={{ color: selectedAlarm.status === 'resolved' ? '#52c41a' : '#ff4d4f' }}>
                      {selectedAlarm.status === 'resolved' ? '已处理' : '待处理'}
                    </span>
                  </div>
                </Col>
              </Row>
            </div>

            <div className={styles.alarmDescription}>
              <div className={styles.alarmInfoLabel}>详细描述:</div>
              <div className={styles.alarmDescriptionText}>
                {selectedAlarm.description || selectedAlarm.message || '设备出现异常，请及时检查设备状态并进行相应处理。'}
              </div>
            </div>

            {selectedAlarm.solution && (
              <div className={styles.alarmSolution}>
                <div className={styles.alarmInfoLabel}>处理建议:</div>
                <div className={styles.alarmSolutionText}>
                  {selectedAlarm.solution}
                </div>
              </div>
            )}
          </div>
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
    </div>
  );
};

// 辅助函数
const getAlarmColor = (level) => {
  const colors = {
    info: 'blue',
    warning: 'orange',
    error: 'red',
    alarm: 'volcano'
  };
  return colors[level] || 'default';
};

const getAlarmLevelText = (level) => {
  const texts = {
    info: '信息',
    warning: '警告',
    error: '错误',
    alarm: '报警'
  };
  return texts[level] || level;
};

export default StandaloneMonitor;
