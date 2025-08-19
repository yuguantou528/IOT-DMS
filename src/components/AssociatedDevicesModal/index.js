import React from 'react';
import {
  Modal,
  Table,
  Tag,
  Typography,
  Space,
  Empty
} from 'antd';
import {
  InfoCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { deviceTypes } from '../../services/deviceManagement';
import styles from './index.module.css';

const { Text, Title } = Typography;

const AssociatedDevicesModal = ({ 
  visible, 
  onCancel, 
  devices = [], 
  fenceName = '' 
}) => {
  // 设备状态标签
  const getStatusTag = (status) => {
    const statusMap = {
      online: { color: 'green', text: '在线' },
      offline: { color: 'red', text: '离线' },
      fault: { color: 'orange', text: '故障' }
    };
    const config = statusMap[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 设备类型标签
  const getDeviceTypeTag = (deviceType) => {
    const typeConfig = deviceTypes.find(t => t.value === deviceType);
    return (
      <Tag color="blue">
        {typeConfig ? typeConfig.label : deviceType}
      </Tag>
    );
  };

  // 表格列配置
  const columns = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1
    },
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
      render: (text) => (
        <Text strong>{text}</Text>
      )
    },
    {
      title: '设备编码',
      dataIndex: 'deviceCode',
      key: 'deviceCode',
      width: 150,
      ellipsis: true,
      render: (text) => (
        <Text code>{text}</Text>
      )
    },
    {
      title: '设备类型',
      dataIndex: 'deviceType',
      key: 'deviceType',
      width: 120,
      render: (deviceType) => getDeviceTypeTag(deviceType)
    },
    {
      title: '厂商',
      dataIndex: 'manufacturerName',
      key: 'manufacturerName',
      width: 180,
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => getStatusTag(status)
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 150,
      ellipsis: true
    },
    {
      title: '关联时间',
      dataIndex: 'associatedTime',
      key: 'associatedTime',
      width: 150,
      render: (time) => time || '未知'
    }
  ];

  return (
    <Modal
      title={
        <Space>
          <InfoCircleOutlined />
          <span>关联设备详情</span>
          {fenceName && (
            <Text type="secondary">- {fenceName}</Text>
          )}
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1200}
      className={styles.associatedDevicesModal}
    >
      <div className={styles.modalContent}>
        {/* 统计信息 */}
        <div className={styles.statisticsSection}>
          <div className={styles.statContainer}>
            <div className={styles.statItem}>
              <CheckCircleOutlined className={styles.statIcon} />
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{devices.length}</div>
                <div className={styles.statLabel}>关联设备总数</div>
              </div>
            </div>
            <div className={styles.statItem}>
              <CheckCircleOutlined className={styles.statIcon} style={{ color: '#52c41a' }} />
              <div className={styles.statContent}>
                <div className={styles.statNumber}>
                  {devices.filter(d => d.status === 'online').length}
                </div>
                <div className={styles.statLabel}>在线设备</div>
              </div>
            </div>
            <div className={styles.statItem}>
              <CheckCircleOutlined className={styles.statIcon} style={{ color: '#ff4d4f' }} />
              <div className={styles.statContent}>
                <div className={styles.statNumber}>
                  {devices.filter(d => d.status === 'offline').length}
                </div>
                <div className={styles.statLabel}>离线设备</div>
              </div>
            </div>
            <div className={styles.statItem}>
              <CheckCircleOutlined className={styles.statIcon} style={{ color: '#fa8c16' }} />
              <div className={styles.statContent}>
                <div className={styles.statNumber}>
                  {devices.filter(d => d.status === 'fault').length}
                </div>
                <div className={styles.statLabel}>故障设备</div>
              </div>
            </div>
          </div>
        </div>

        {/* 设备列表 */}
        <div className={styles.deviceListSection}>
          {devices.length === 0 ? (
            <Empty
              description="暂无关联设备"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ margin: '40px 0' }}
            />
          ) : (
            <Table
              columns={columns}
              dataSource={devices}
              rowKey="id"
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `第 ${range[0]}-${range[1]} 条，共 ${total} 条设备`,
                pageSize: 10,
                pageSizeOptions: ['10', '20', '50', '100']
              }}
              scroll={{ x: 1000, y: 400 }}
              size="small"
              bordered
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AssociatedDevicesModal;
