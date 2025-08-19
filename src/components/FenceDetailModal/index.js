import React, { useEffect, useState } from 'react';
import { Modal, Row, Col, Tag, Badge, Divider, Typography, Space, Card } from 'antd';
import { EnvironmentOutlined, RadiusUpleftOutlined, ClockCircleOutlined, UserOutlined, AlertOutlined, MobileOutlined } from '@ant-design/icons';
import FenceDrawMap from '../FenceDrawMap';
import styles from './index.module.css';

const { Text, Title } = Typography;

const FenceDetailModal = ({
  visible,
  onCancel,
  fenceData
}) => {
  const [mapKey, setMapKey] = useState(0);

  // 当弹窗打开时，重新渲染地图
  useEffect(() => {
    if (visible) {
      // 延迟一下确保DOM已经渲染
      const timer = setTimeout(() => {
        setMapKey(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!fenceData) return null;

  // 告警类型配置
  const alarmTypes = [
    { value: 'enter', label: '进入告警', color: 'orange' },
    { value: 'exit', label: '离开告警', color: 'blue' },
    { value: 'both', label: '进出告警', color: 'red' }
  ];

  // 获取围栏中心点用于地图显示
  const getMapCenter = () => {
    if (fenceData.type === 'circle' && fenceData.center) {
      return [fenceData.center[0], fenceData.center[1]];
    } else if (fenceData.type === 'polygon' && fenceData.coordinates && fenceData.coordinates.length > 0) {
      // 计算多边形中心点
      const lats = fenceData.coordinates.map(coord => coord[0]);
      const lngs = fenceData.coordinates.map(coord => coord[1]);
      const centerLat = (Math.max(...lats) + Math.min(...lats)) / 2;
      const centerLng = (Math.max(...lngs) + Math.min(...lngs)) / 2;
      return [centerLat, centerLng];
    }
    return [29.2500, 110.3500]; // 默认中心点
  };

  return (
    <Modal
      title={
        <Space>
          <EnvironmentOutlined />
          <span>围栏详情</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1000}
      className={styles.fenceDetailModal}
      destroyOnClose
      style={{ top: 20 }}
      bodyStyle={{ height: 'calc(80vh - 120px)', padding: '16px' }}
    >
      <div className={styles.modalContent}>
        <Row gutter={24}>
          {/* 左侧围栏信息 */}
          <Col span={10}>
            <div className={styles.infoSection}>
              <Title level={4} style={{ marginBottom: 8, marginTop: 0, fontSize: '14px' }}>基本信息</Title>
              
              <Card size="small" className={styles.infoCard}>
                <Row gutter={[16, 12]}>
                  <Col span={8}>
                    <Text type="secondary">围栏名称</Text>
                  </Col>
                  <Col span={16}>
                    <Text strong>{fenceData.name}</Text>
                  </Col>
                  
                  <Col span={8}>
                    <Text type="secondary">围栏类型</Text>
                  </Col>
                  <Col span={16}>
                    <Tag icon={fenceData.type === 'polygon' ? <EnvironmentOutlined /> : <RadiusUpleftOutlined />}>
                      {fenceData.type === 'polygon' ? '多边形围栏' : '圆形围栏'}
                    </Tag>
                  </Col>
                  
                  <Col span={8}>
                    <Text type="secondary">告警类型</Text>
                  </Col>
                  <Col span={16}>
                    <Tag color={alarmTypes.find(t => t.value === fenceData.alarmType)?.color}>
                      {alarmTypes.find(t => t.value === fenceData.alarmType)?.label}
                    </Tag>
                  </Col>
                  
                  <Col span={8}>
                    <Text type="secondary">状态</Text>
                  </Col>
                  <Col span={16}>
                    <Badge 
                      status={fenceData.status === 'active' ? 'success' : 'default'} 
                      text={fenceData.status === 'active' ? '启用' : '禁用'} 
                    />
                  </Col>
                </Row>
              </Card>

              <Divider />

              <Title level={4} style={{ marginBottom: 8, marginTop: 0, fontSize: '14px' }}>围栏参数</Title>
              
              <Card size="small" className={styles.infoCard}>
                <Row gutter={[16, 12]}>
                  {fenceData.type === 'polygon' && fenceData.coordinates && (
                    <>
                      <Col span={8}>
                        <Text type="secondary">顶点数量</Text>
                      </Col>
                      <Col span={16}>
                        <Text>{fenceData.coordinates.length} 个</Text>
                      </Col>
                    </>
                  )}
                  
                  {fenceData.type === 'circle' && fenceData.radius && (
                    <>
                      <Col span={8}>
                        <Text type="secondary">半径</Text>
                      </Col>
                      <Col span={16}>
                        <Text>{Math.round(fenceData.radius)} 米</Text>
                      </Col>
                      
                      <Col span={8}>
                        <Text type="secondary">中心坐标</Text>
                      </Col>
                      <Col span={16}>
                        <Text>
                          {fenceData.center[0].toFixed(6)}, {fenceData.center[1].toFixed(6)}
                        </Text>
                      </Col>
                    </>
                  )}
                </Row>
              </Card>

              <Divider />

              <Title level={4} style={{ marginBottom: 8, marginTop: 0, fontSize: '14px' }}>统计信息</Title>
              
              <Card size="small" className={styles.infoCard}>
                <Row gutter={[16, 12]}>
                  <Col span={8}>
                    <Text type="secondary">
                      <MobileOutlined style={{ marginRight: 4 }} />
                      关联设备
                    </Text>
                  </Col>
                  <Col span={16}>
                    <Text>{fenceData.deviceCount || 0} 个</Text>
                  </Col>
                  
                  <Col span={8}>
                    <Text type="secondary">
                      <AlertOutlined style={{ marginRight: 4 }} />
                      告警次数
                    </Text>
                  </Col>
                  <Col span={16}>
                    <Text>{fenceData.alarmCount || 0} 次</Text>
                  </Col>
                  
                  <Col span={8}>
                    <Text type="secondary">
                      <UserOutlined style={{ marginRight: 4 }} />
                      创建人
                    </Text>
                  </Col>
                  <Col span={16}>
                    <Text>{fenceData.creator}</Text>
                  </Col>
                  
                  <Col span={8}>
                    <Text type="secondary">
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      创建时间
                    </Text>
                  </Col>
                  <Col span={16}>
                    <Text>{fenceData.createTime}</Text>
                  </Col>
                  
                  <Col span={8}>
                    <Text type="secondary">更新时间</Text>
                  </Col>
                  <Col span={16}>
                    <Text>{fenceData.updateTime}</Text>
                  </Col>
                </Row>
              </Card>

              {fenceData.description && (
                <>
                  <Divider />
                  <Title level={4} style={{ marginBottom: 8, marginTop: 0, fontSize: '14px' }}>描述信息</Title>
                  <Card size="small" className={styles.descriptionCard}>
                    <Text>{fenceData.description}</Text>
                  </Card>
                </>
              )}
            </div>
          </Col>

          {/* 右侧地图展示 */}
          <Col span={14}>
            <div className={styles.mapSection}>
              <Title level={4} style={{ marginBottom: 8, marginTop: 0, fontSize: '14px' }}>围栏位置</Title>
              
              <div className={styles.mapContainer}>
                <FenceDrawMap
                  key={mapKey}
                  height="100%"
                  readOnly={true}
                  initialFence={{
                    type: fenceData.type,
                    coordinates: fenceData.coordinates,
                    center: fenceData.center,
                    radius: fenceData.radius
                  }}
                  center={getMapCenter()}
                  zoom={14}
                  hideTypeSelector={true}
                />
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </Modal>
  );
};

export default FenceDetailModal;
