import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Tabs,
  Descriptions,
  Badge,
  Button,
  Space,
  message,
  Spin,
  Divider,
  Tag
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  LinkOutlined,
  SettingOutlined,
  NodeIndexOutlined,
  InfoCircleOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import styles from './DeviceDetail.module.css';
import {
  getDeviceDetail,
  testDeviceConnection,
  updateMeshParameters,
  deviceStatuses,
  connectionStatuses,
  deviceTypeMap
} from '../../../services/deviceManagement';
import MeshRadioManager from '../../../components/DeviceSpecific/MeshRadio';
import LiveVideoPlayer from '../../../components/DeviceSpecific/LiveVideoPlayer';
import RecordedVideoManager from '../../../components/DeviceSpecific/RecordedVideoManager';

const { TabPane } = Tabs;

const DeviceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [device, setDevice] = useState(null);
  const [testingConnection, setTestingConnection] = useState(false);

  // 获取设备详情
  useEffect(() => {
    fetchDeviceDetail();
  }, [id]);

  const fetchDeviceDetail = async () => {
    try {
      setLoading(true);
      const response = await getDeviceDetail(id);
      if (response.success) {
        setDevice(response.data);
      } else {
        message.error(response.message || '获取设备详情失败');
        navigate('/device/management');
      }
    } catch (error) {
      message.error('获取设备详情失败');
      navigate('/device/management');
    } finally {
      setLoading(false);
    }
  };

  // 测试连接
  const handleTestConnection = async () => {
    if (!device) return;
    
    setTestingConnection(true);
    try {
      const response = await testDeviceConnection(device.id);
      if (response.success) {
        message.success(`连接成功，响应时间: ${response.data.responseTime}ms`);
        // 刷新设备数据
        fetchDeviceDetail();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('连接测试失败');
    } finally {
      setTestingConnection(false);
    }
  };

  // 编辑设备
  const handleEdit = () => {
    navigate(`/device/management/edit/${id}`);
  };

  // 返回列表
  const handleBack = () => {
    navigate('/device/management');
  };

  // 更新Mesh参数
  const handleMeshParameterUpdate = async (updatedDevice) => {
    try {
      const response = await updateMeshParameters(updatedDevice.id, updatedDevice.meshParameters);
      if (response.success) {
        message.success('Mesh参数更新成功');
        setDevice(response.data);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('Mesh参数更新失败');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
      </div>
    );
  }

  if (!device) {
    return (
      <div className={styles.errorContainer}>
        <div>设备不存在</div>
        <Button type="primary" onClick={handleBack}>
          返回设备列表
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.deviceDetail}>
      {/* 页面头部 */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBack}
            className={styles.backButton}
          >
            返回
          </Button>
          <div className={styles.deviceTitle}>
            <h2>{device.name}</h2>
            <span className={styles.deviceCode}>{device.deviceCode}</span>
          </div>
        </div>
        <div className={styles.headerRight}>
          <Space>
            <Button 
              type="primary" 
              icon={<LinkOutlined />} 
              loading={testingConnection}
              onClick={handleTestConnection}
            >
              测试连接
            </Button>
            <Button 
              icon={<EditOutlined />} 
              onClick={handleEdit}
            >
              编辑设备
            </Button>
          </Space>
        </div>
      </div>

      {/* 设备状态概览 */}
      <Card className={styles.statusCard} size="small">
        <div className={styles.statusOverview}>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>设备状态</span>
            <Badge 
              status={deviceStatuses.find(s => s.value === device.status)?.color || 'default'} 
              text={deviceStatuses.find(s => s.value === device.status)?.label || device.status} 
            />
          </div>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>连接状态</span>
            <Badge 
              status={connectionStatuses.find(s => s.value === device.connectionStatus)?.color || 'default'} 
              text={connectionStatuses.find(s => s.value === device.connectionStatus)?.label || device.connectionStatus} 
            />
          </div>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>设备类型</span>
            <span>{device.deviceTypeName || deviceTypeMap[device.deviceType] || device.deviceType}</span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>最后在线</span>
            <span>{device.lastOnlineTime || '-'}</span>
          </div>
        </div>
      </Card>

      {/* 详情标签页 */}
      <Card className={styles.detailCard}>
        <Tabs defaultActiveKey="basic" type="card" className={styles.detailTabs}>
          {/* 基本信息 */}
          <TabPane 
            tab={
              <span>
                <InfoCircleOutlined />
                基本信息
              </span>
            } 
            key="basic"
          >
            <div className={styles.tabContent}>
              {/* 基础标识信息 */}
              <Descriptions title="基础标识" bordered column={2} className={styles.descriptionSection}>
                <Descriptions.Item label="设备名称" span={2}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '500' }}>{device.name}</span>
                    <Badge
                      status={device.status === 'online' ? 'success' : device.status === 'offline' ? 'default' : 'warning'}
                      text={deviceStatuses.find(s => s.value === device.status)?.label || device.status}
                    />
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="设备编码">{device.deviceCode}</Descriptions.Item>
                <Descriptions.Item label="序列号">{device.serialNumber || '-'}</Descriptions.Item>
              </Descriptions>

              <Divider />

              {/* 分类信息 */}
              <Descriptions title="分类信息" bordered column={2} className={styles.descriptionSection}>
                <Descriptions.Item label="设备类型">
                  <Tag color="blue" style={{ fontSize: '13px' }}>
                    {device.deviceTypeName || deviceTypeMap[device.deviceType] || device.deviceType}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="所属厂商">
                  <span style={{ fontWeight: '500' }}>{device.manufacturerName}</span>
                </Descriptions.Item>
                <Descriptions.Item label="设备描述">
                  <div style={{
                    padding: '8px',
                    background: '#fafafa',
                    borderRadius: '4px',
                    lineHeight: '1.5',
                    color: '#595959'
                  }}>
                    {device.description || '-'}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="设备型号">{device.modelName}</Descriptions.Item>
                <Descriptions.Item label="所属产品">
                  {device.productName ? (
                    <Tag color="green">{device.productName}</Tag>
                  ) : (
                    <span style={{ color: '#8c8c8c' }}>暂未关联</span>
                  )}
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              {/* 位置与连接信息 */}
              <Descriptions title="位置与连接" bordered column={2} className={styles.descriptionSection}>
                <Descriptions.Item label="设备位置" span={2}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <EnvironmentOutlined style={{ color: '#1890ff' }} />
                    <span>{device.location}</span>
                    {device.longitude && device.latitude && (
                      <span style={{ color: '#8c8c8c', fontSize: '12px' }}>
                        ({device.longitude}, {device.latitude})
                      </span>
                    )}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="IP地址">
                  <Tag color="purple">{device.ipAddress}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="端口">
                  <Tag color="orange">{device.port}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="用户名">{device.username || '-'}</Descriptions.Item>
                <Descriptions.Item label="密码">
                  <span style={{ color: '#8c8c8c' }}>******</span>
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              {/* 时间信息 */}
              <Descriptions title="时间信息" bordered column={2} className={styles.descriptionSection}>
                <Descriptions.Item label="安装日期">
                  {device.installDate ? (
                    <span style={{ color: '#52c41a' }}>{device.installDate}</span>
                  ) : (
                    <span style={{ color: '#8c8c8c' }}>未设置</span>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="保修到期">
                  {device.warrantyExpiry ? (
                    <span style={{ color: '#fa8c16' }}>{device.warrantyExpiry}</span>
                  ) : (
                    <span style={{ color: '#8c8c8c' }}>未设置</span>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  <span style={{ fontSize: '12px', color: '#8c8c8c' }}>{device.createTime}</span>
                </Descriptions.Item>
                <Descriptions.Item label="更新时间">
                  <span style={{ fontSize: '12px', color: '#8c8c8c' }}>{device.updateTime}</span>
                </Descriptions.Item>
              </Descriptions>

            </div>
          </TabPane>

          {/* Mesh网络拓扑 - 仅对Mesh电台显示 */}
          {device.deviceType === 'Mesh电台' && (
            <TabPane 
              tab={
                <span>
                  <NodeIndexOutlined />
                  网络拓扑
                </span>
              } 
              key="topology"
            >
              <div className={styles.tabContent}>
                <MeshRadioManager 
                  device={device}
                  onParameterUpdate={handleMeshParameterUpdate}
                  mode="topology"
                />
              </div>
            </TabPane>
          )}

          {/* Mesh参数配置 - 仅对Mesh电台显示 */}
          {device.deviceType === 'Mesh电台' && (
            <TabPane 
              tab={
                <span>
                  <SettingOutlined />
                  参数配置
                </span>
              } 
              key="parameters"
            >
              <div className={styles.tabContent}>
                <MeshRadioManager 
                  device={device}
                  onParameterUpdate={handleMeshParameterUpdate}
                  mode="parameters"
                />
              </div>
            </TabPane>
          )}

          {/* 可以为其他设备类型添加特定的Tab */}
          {device.deviceType === 'network_camera' && (
            <>
              <TabPane
                tab={
                  <span>
                    <SettingOutlined />
                    实时视频
                  </span>
                }
                key="live-video"
              >
                <div className={styles.tabContent}>
                  <LiveVideoPlayer device={device} />
                </div>
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <SettingOutlined />
                    录像视频
                  </span>
                }
                key="recorded-video"
              >
                <div className={styles.tabContent}>
                  <RecordedVideoManager device={device} />
                </div>
              </TabPane>
            </>
          )}
        </Tabs>
      </Card>
    </div>
  );
};

export default DeviceDetail;
