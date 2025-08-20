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
  message
} from 'antd';
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
  PhoneOutlined
} from '@ant-design/icons';
import styles from './FullScreenMonitor.module.css';
import {
  getDeviceList,
  getAlarmList,
  getStatistics
} from '../../services/visualMonitorService';
import AudioCallModal from '../../components/AudioCallModal';

const { Option } = Select;

const FullScreenMonitor = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [devices, setDevices] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [alarmModalVisible, setAlarmModalVisible] = useState(false);
  const [mapType, setMapType] = useState('normal');
  const [showAlarms, setShowAlarms] = useState(true);
  const [showDevices, setShowDevices] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    totalDevices: 0,
    onlineDevices: 0,
    offlineDevices: 0,
    activeAlarms: 0
  });
  const [audioCallModalVisible, setAudioCallModalVisible] = useState(false);
  const [selectedCallDevice, setSelectedCallDevice] = useState(null);

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
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化
  useEffect(() => {
    loadData();

    // 定时刷新数据 - 已注释掉自动刷新功能
    // const dataInterval = setInterval(loadData, 30000); // 30秒刷新一次

    // 更新时间
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      // clearInterval(dataInterval);
      clearInterval(timeInterval);
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

  // 计算在线率
  const onlineRate = stats.totalDevices > 0 ?
    Math.round((stats.onlineDevices / stats.totalDevices) * 100) : 0;

  // 获取设备类型统计
  const getDeviceTypeStats = () => {
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
  };

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

  // 处理语音呼叫
  const handleAudioCall = (device) => {
    if (device.type === 'body_camera') {
      setSelectedCallDevice(device);
      setAudioCallModalVisible(true);
    } else {
      message.warning('该设备不支持语音呼叫功能');
    }
  };

  // 处理呼叫状态变化
  const handleCallStatusChange = (status, data) => {
    console.log('呼叫状态变化:', status, data);
    // 可以在这里更新设备状态或记录通话日志
  };

  // 获取设备类型颜色
  const getDeviceTypeColor = (type) => {
    const colors = {
      camera: '#1890ff',
      radio: '#52c41a',
      sensor: '#faad14',
      base_station: '#f5222d',
      body_camera: '#13c2c2'
    };
    return colors[type] || '#722ed1';
  };

  return (
    <div className={styles.fullScreenMonitor}>
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
        <div className={styles.headerCenter}>
          <div className={styles.currentTime}>
            {currentTime.toLocaleString('zh-CN')}
          </div>
        </div>
        <div className={styles.headerRight}>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadData}
              loading={loading}
              type="text"
              className={styles.headerBtn}
            >
              刷新
            </Button>
            <Button
              icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              onClick={toggleFullscreen}
              type="text"
              className={styles.headerBtn}
            >
              {isFullscreen ? '退出全屏' : '全屏'}
            </Button>
          </Space>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className={styles.content}>
        {/* 顶部统计卡片 */}
        <Row gutter={[24, 24]} className={styles.statsRow}>
          <Col xs={24} sm={6}>
            <Card className={styles.statCard} bodyStyle={{ padding: '20px' }}>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{stats.totalDevices}</div>
                <div className={styles.statLabel}>设备总数</div>
                <div className={styles.statIcon}>
                  <MonitorOutlined />
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className={styles.statCard} bodyStyle={{ padding: '20px' }}>
              <div className={styles.statContent}>
                <div className={styles.statNumber} style={{ color: '#52c41a' }}>
                  {stats.onlineDevices}
                </div>
                <div className={styles.statLabel}>在线设备</div>
                <div className={styles.statIcon} style={{ color: '#52c41a' }}>
                  <CheckCircleOutlined />
                </div>
                <div className={styles.statProgress}>
                  <Progress 
                    percent={onlineRate} 
                    size="small" 
                    strokeColor="#52c41a"
                    showInfo={false}
                  />
                  <span className={styles.progressText}>{onlineRate}%</span>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className={styles.statCard} bodyStyle={{ padding: '20px' }}>
              <div className={styles.statContent}>
                <div className={styles.statNumber} style={{ color: '#ff4d4f' }}>
                  {stats.offlineDevices}
                </div>
                <div className={styles.statLabel}>离线设备</div>
                <div className={styles.statIcon} style={{ color: '#ff4d4f' }}>
                  <CloseCircleOutlined />
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className={styles.statCard} bodyStyle={{ padding: '20px' }}>
              <div className={styles.statContent}>
                <div className={styles.statNumber} style={{ color: '#faad14' }}>
                  {stats.alarmDevices}
                </div>
                <div className={styles.statLabel}>告警设备</div>
                <div className={styles.statIcon} style={{ color: '#faad14' }}>
                  <WarningOutlined />
                </div>
                {stats.activeAlarms > 0 && (
                  <div className={styles.alarmPulse}></div>
                )}
              </div>
            </Card>
          </Col>
        </Row>

        {/* 主要内容区域 */}
        <Row gutter={[24, 24]} className={styles.mainRow}>
          {/* 地图区域 */}
          <Col xs={24} lg={16}>
            <Card 
              className={styles.mapCard}
              bodyStyle={{ padding: 0, height: '100%' }}
              title={
                <Space>
                  <MonitorOutlined />
                  <span>设备分布地图</span>
                </Space>
              }
              extra={
                <Space>
                  <Select
                    value={mapType}
                    onChange={setMapType}
                    style={{ width: 120 }}
                    size="small"
                  >
                    <Option value="normal">标准地图</Option>
                    <Option value="satellite">卫星地图</Option>
                    <Option value="dark">暗色地图</Option>
                  </Select>
                  <Switch
                    checkedChildren="设备"
                    unCheckedChildren="设备"
                    checked={showDevices}
                    onChange={setShowDevices}
                    size="small"
                  />
                  <Switch
                    checkedChildren="告警"
                    unCheckedChildren="告警"
                    checked={showAlarms}
                    onChange={setShowAlarms}
                    size="small"
                  />
                </Space>
              }
            >
              <div ref={mapRef} className={styles.mapContainer}>
                <div className={styles.mapPlaceholder}>
                  <div className={styles.mapIcon}>🗺️</div>
                  <div className={styles.mapTitle}>设备分布地图</div>
                  <div className={styles.mapSubtitle}>
                    地图服务加载中，请稍候...
                  </div>
                  <div className={styles.mapStats}>
                    <div className={styles.mapStatItem}>
                      <span className={styles.mapStatLabel}>总设备:</span>
                      <span className={styles.mapStatValue}>{stats.totalDevices}</span>
                    </div>
                    <div className={styles.mapStatItem}>
                      <span className={styles.mapStatLabel}>在线:</span>
                      <span className={styles.mapStatValue} style={{ color: '#52c41a' }}>
                        {stats.onlineDevices}
                      </span>
                    </div>
                    <div className={styles.mapStatItem}>
                      <span className={styles.mapStatLabel}>离线:</span>
                      <span className={styles.mapStatValue} style={{ color: '#ff4d4f' }}>
                        {stats.offlineDevices}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          {/* 右侧信息面板 */}
          <Col xs={24} lg={8}>
            <Row gutter={[0, 24]}>
              {/* 实时告警 */}
              <Col span={24}>
                <Card
                  className={styles.alarmCard}
                  title={
                    <Space>
                      <WarningOutlined />
                      <span>实时告警</span>
                      <Badge count={stats.activeAlarms} />
                    </Space>
                  }
                  extra={
                    <Button
                      type="link"
                      size="small"
                      onClick={() => setAlarmModalVisible(true)}
                    >
                      查看全部
                    </Button>
                  }
                  bodyStyle={{ padding: '16px', maxHeight: '300px', overflow: 'auto' }}
                >
                  <List
                    size="small"
                    dataSource={alarms.slice(0, 5)}
                    renderItem={alarm => (
                      <List.Item className={styles.alarmItem}>
                        <div className={styles.alarmContent}>
                          <div className={styles.alarmHeader}>
                            <Tag color={getAlarmColor(alarm.level)}>
                              {getAlarmLevelText(alarm.level)}
                            </Tag>
                            <span className={styles.alarmTime}>
                              {alarm.time.split(' ')[1]}
                            </span>
                          </div>
                          <div className={styles.alarmDevice}>{alarm.deviceName}</div>
                          <div className={styles.alarmMessage}>{alarm.message}</div>
                        </div>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>

              {/* 设备状态 */}
              <Col span={24}>
                <Card
                  className={styles.deviceCard}
                  title={
                    <Space>
                      <MonitorOutlined />
                      <span>设备状态</span>
                    </Space>
                  }
                  bodyStyle={{ padding: '16px', maxHeight: '600px', overflow: 'auto' }}
                >
                  <List
                    size="small"
                    dataSource={devices.slice(0, 8)}
                    renderItem={device => (
                      <List.Item className={styles.deviceItem}>
                        <div className={styles.deviceInfo}>
                          <Badge
                            status={device.status === 'online' ? 'success' : 'error'}
                            text={device.name}
                          />
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {device.videoUrl && (
                              <Button
                                type="link"
                                size="small"
                                icon={<EyeOutlined />}
                                onClick={() => {
                                  setSelectedDevice(device);
                                  setVideoModalVisible(true);
                                }}
                              />
                            )}
                            {device.type === 'body_camera' && (
                              <Button
                                type="link"
                                size="small"
                                icon={<PhoneOutlined />}
                                onClick={() => handleAudioCall(device)}
                                disabled={device.status !== 'online'}
                                style={{ color: device.status === 'online' ? '#52c41a' : undefined }}
                              />
                            )}
                          </div>
                        </div>
                        {device.alarmCount > 0 && (
                          <Badge count={device.alarmCount} size="small" />
                        )}
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>

              {/* 设备类型分布 */}
              <Col span={24}>
                <Card
                  className={styles.chartCard}
                  title={
                    <Space>
                      <SettingOutlined />
                      <span>设备类型分布</span>
                    </Space>
                  }
                  bodyStyle={{ padding: '16px' }}
                >
                  <div className={styles.deviceTypeChart}>
                    {getDeviceTypeStats().map((item, index) => (
                      <div key={item.type} className={styles.deviceTypeItem}>
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
                              width: `${(item.count / stats.totalDevices) * 100}%`,
                              backgroundColor: getDeviceTypeColor(item.type)
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>

      {/* 语音呼叫弹窗 */}
      <AudioCallModal
        visible={audioCallModalVisible}
        onCancel={() => setAudioCallModalVisible(false)}
        device={selectedCallDevice}
        onCallStatusChange={handleCallStatusChange}
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

export default FullScreenMonitor;
