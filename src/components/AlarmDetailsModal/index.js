import React from 'react';
import {
  Modal,
  Table,
  Tag,
  Typography,
  Space,
  Empty,
  Tooltip
} from 'antd';
import {
  WarningOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import styles from './index.module.css';

const { Text, Title } = Typography;

const AlarmDetailsModal = ({ 
  visible, 
  onCancel, 
  alarms = [], 
  fenceName = '' 
}) => {


  // 告警类型标签
  const getAlarmTypeTag = (type) => {
    const typeMap = {
      enter: { color: 'volcano', text: '进入告警' },
      exit: { color: 'geekblue', text: '离开告警' },
      both: { color: 'purple', text: '进出告警' }
    };
    const config = typeMap[type] || { color: 'default', text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 告警状态标签
  const getAlarmStatusTag = (status) => {
    const statusMap = {
      pending: { color: 'processing', text: '待处理' },
      processing: { color: 'warning', text: '处理中' },
      resolved: { color: 'success', text: '已解决' },
      ignored: { color: 'default', text: '已忽略' }
    };
    const config = statusMap[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
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
      title: '告警时间',
      dataIndex: 'alarmTime',
      key: 'alarmTime',
      width: 150,
      render: (time) => (
        <Space>
          <ClockCircleOutlined style={{ color: '#1890ff' }} />
          <Text>{time}</Text>
        </Space>
      )
    },
    {
      title: '告警类型',
      dataIndex: 'alarmType',
      key: 'alarmType',
      width: 120,
      render: (type) => getAlarmTypeTag(type)
    },

    {
      title: '触发设备',
      dataIndex: 'deviceName',
      key: 'deviceName',
      width: 180,
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <Text strong>{text}</Text>
        </Tooltip>
      )
    },
    {
      title: '告警描述',
      dataIndex: 'description',
      key: 'description',
      width: 250,
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <Text>{text}</Text>
        </Tooltip>
      )
    },
    {
      title: '处理状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getAlarmStatusTag(status)
    },
    {
      title: '处理人',
      dataIndex: 'handler',
      key: 'handler',
      width: 100,
      ellipsis: true,
      render: (text) => text || '-'
    },
    {
      title: '处理时间',
      dataIndex: 'handleTime',
      key: 'handleTime',
      width: 150,
      render: (time) => time || '-'
    }
  ];

  return (
    <Modal
      title={
        <Space>
          <WarningOutlined />
          <span>告警详情</span>
          {fenceName && (
            <Text type="secondary">- {fenceName}</Text>
          )}
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1400}
      className={styles.alarmDetailsModal}
    >
      <div className={styles.modalContent}>
        {/* 统计信息 */}
        <div className={styles.statisticsSection}>
          <div className={styles.statContainer}>
            <div className={styles.statItem}>
              <WarningOutlined className={styles.statIcon} style={{ color: '#ff4d4f' }} />
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{alarms.length}</div>
                <div className={styles.statLabel}>告警总数</div>
              </div>
            </div>
            <div className={styles.statItem}>
              <ClockCircleOutlined className={styles.statIcon} style={{ color: '#fa8c16' }} />
              <div className={styles.statContent}>
                <div className={styles.statNumber}>
                  {alarms.filter(a => a.status === 'pending').length}
                </div>
                <div className={styles.statLabel}>待处理</div>
              </div>
            </div>
            <div className={styles.statItem}>
              <ClockCircleOutlined className={styles.statIcon} style={{ color: '#1890ff' }} />
              <div className={styles.statContent}>
                <div className={styles.statNumber}>
                  {alarms.filter(a => a.status === 'processing').length}
                </div>
                <div className={styles.statLabel}>处理中</div>
              </div>
            </div>
            <div className={styles.statItem}>
              <ClockCircleOutlined className={styles.statIcon} style={{ color: '#52c41a' }} />
              <div className={styles.statContent}>
                <div className={styles.statNumber}>
                  {alarms.filter(a => a.status === 'resolved').length}
                </div>
                <div className={styles.statLabel}>已解决</div>
              </div>
            </div>
          </div>
        </div>

        {/* 告警列表 */}
        <div className={styles.alarmListSection}>
          {alarms.length === 0 ? (
            <Empty
              description="暂无告警记录"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ margin: '40px 0' }}
            />
          ) : (
            <Table
              columns={columns}
              dataSource={alarms}
              rowKey="id"
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `第 ${range[0]}-${range[1]} 条，共 ${total} 条告警`,
                pageSize: 10,
                pageSizeOptions: ['10', '20', '50', '100']
              }}
              scroll={{ x: 1200, y: 400 }}
              size="small"
              bordered
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AlarmDetailsModal;
