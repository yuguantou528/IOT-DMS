import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Card,
  Row,
  Col,
  Select,
  Tag,
  Tooltip,
  Badge,
  Descriptions,
  Divider,
  DatePicker,
  Typography
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  ExportOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  AlertOutlined,
  WarningOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import styles from './index.module.css';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Text } = Typography;

const AlarmMessages = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isHandleModalVisible, setIsHandleModalVisible] = useState(false);
  const [currentAlarm, setCurrentAlarm] = useState(null);
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useState({
    deviceName: '',
    alarmType: undefined,
    alarmLevel: undefined,
    status: undefined,
    dateRange: null
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // 告警级别配置
  const alarmLevels = [
    { value: 'info', label: '信息', color: 'blue' },
    { value: 'warning', label: '警告', color: 'orange' },
    { value: 'error', label: '错误', color: 'red' },
    { value: 'critical', label: '严重', color: 'red' }
  ];

  // 告警类型配置
  const alarmTypes = [
    { value: 'device_offline', label: '设备离线' },
    { value: 'device_fault', label: '设备故障' },
    { value: 'parameter_abnormal', label: '参数异常' },
    { value: 'connection_timeout', label: '连接超时' },
    { value: 'data_anomaly', label: '数据异常' },
    { value: 'security_alert', label: '安全告警' }
  ];

  // 告警状态配置
  const alarmStatuses = [
    { value: 'pending', label: '待处理', color: 'orange' },
    { value: 'processing', label: '处理中', color: 'blue' },
    { value: 'resolved', label: '已解决', color: 'green' },
    { value: 'ignored', label: '已忽略', color: 'gray' }
  ];

  // 模拟数据
  const mockData = [
    {
      id: 1,
      deviceId: 'DEV001',
      deviceName: '海康威视摄像头-001',
      alarmType: 'device_offline',
      alarmLevel: 'error',
      alarmTitle: '设备离线告警',
      alarmDescription: '设备连接中断，无法获取实时数据',
      alarmTime: '2024-01-20 14:30:25',
      status: 'pending',
      handler: null,
      handleTime: null,
      handleRemark: null,
      location: '北京市朝阳区xxx大厦1楼',
      deviceType: '网络摄像头'
    },
    {
      id: 2,
      deviceId: 'DEV002',
      deviceName: 'Mesh电台-002',
      alarmType: 'parameter_abnormal',
      alarmLevel: 'warning',
      alarmTitle: '信号强度异常',
      alarmDescription: '设备信号强度低于正常阈值，可能影响通信质量',
      alarmTime: '2024-01-20 14:25:18',
      status: 'processing',
      handler: '张三',
      handleTime: '2024-01-20 14:35:00',
      handleRemark: '正在检查设备天线连接',
      location: '北京市海淀区xxx园区',
      deviceType: 'Mesh电台'
    },
    {
      id: 3,
      deviceId: 'DEV003',
      deviceName: '数字对讲机-003',
      alarmType: 'data_anomaly',
      alarmLevel: 'critical',
      alarmTitle: '温度数据异常',
      alarmDescription: '检测到温度值超出安全范围，可能存在安全隐患',
      alarmTime: '2024-01-20 14:20:10',
      status: 'resolved',
      handler: '李四',
      handleTime: '2024-01-20 14:45:00',
      handleRemark: '已确认为对讲机故障，已更换新设备',
      location: '上海市浦东新区xxx工厂',
      deviceType: '对讲机'
    }
  ];

  // 获取数据
  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredData = [...mockData];
      
      // 应用搜索过滤
      if (params.deviceName) {
        filteredData = filteredData.filter(item => 
          item.deviceName.toLowerCase().includes(params.deviceName.toLowerCase())
        );
      }
      
      if (params.alarmType) {
        filteredData = filteredData.filter(item => item.alarmType === params.alarmType);
      }
      
      if (params.alarmLevel) {
        filteredData = filteredData.filter(item => item.alarmLevel === params.alarmLevel);
      }
      
      if (params.status) {
        filteredData = filteredData.filter(item => item.status === params.status);
      }
      
      setDataSource(filteredData);
      setPagination(prev => ({
        ...prev,
        total: filteredData.length
      }));
    } catch (error) {
      message.error('获取告警数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(searchParams);
  }, []);

  // 搜索
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchData(searchParams);
  };

  // 重置搜索
  const handleReset = () => {
    setSearchParams({
      deviceName: '',
      alarmType: undefined,
      alarmLevel: undefined,
      status: undefined,
      dateRange: null
    });
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchData({});
  };

  // 查看详情
  const handleViewDetail = (record) => {
    setCurrentAlarm(record);
    setIsDetailModalVisible(true);
  };

  // 处理告警
  const handleAlarm = (record) => {
    setCurrentAlarm(record);
    setIsHandleModalVisible(true);
    form.resetFields();
  };

  // 保存处理结果
  const handleSaveProcess = async () => {
    try {
      const values = await form.validateFields();
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 更新数据
      const updatedData = dataSource.map(item => {
        if (item.id === currentAlarm.id) {
          return {
            ...item,
            status: values.status,
            handler: '当前用户', // 实际应用中从用户信息获取
            handleTime: moment().format('YYYY-MM-DD HH:mm:ss'),
            handleRemark: values.handleRemark
          };
        }
        return item;
      });
      
      setDataSource(updatedData);
      setIsHandleModalVisible(false);
      message.success('告警处理成功');
    } catch (error) {
      message.error('告警处理失败');
    }
  };

  // 导出数据
  const handleExport = () => {
    message.info('导出功能开发中...');
  };

  // 表格列定义
  const columns = [
    {
      title: '告警时间',
      dataIndex: 'alarmTime',
      key: 'alarmTime',
      width: 160,
      sorter: (a, b) => moment(a.alarmTime).unix() - moment(b.alarmTime).unix()
    },
    {
      title: '设备信息',
      key: 'deviceInfo',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.deviceName}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            {record.deviceId} | {record.deviceType}
          </div>
        </div>
      )
    },
    {
      title: '告警类型',
      dataIndex: 'alarmType',
      key: 'alarmType',
      width: 120,
      render: (type) => {
        const typeConfig = alarmTypes.find(t => t.value === type);
        return <Tag color="blue">{typeConfig?.label || type}</Tag>;
      }
    },
    {
      title: '告警级别',
      dataIndex: 'alarmLevel',
      key: 'alarmLevel',
      width: 100,
      render: (level) => {
        const levelConfig = alarmLevels.find(l => l.value === level);
        const icon = level === 'critical' ? <AlertOutlined /> : 
                    level === 'error' ? <WarningOutlined /> : 
                    <InfoCircleOutlined />;
        return (
          <Tag color={levelConfig?.color} icon={icon}>
            {levelConfig?.label || level}
          </Tag>
        );
      }
    },
    {
      title: '告警标题',
      dataIndex: 'alarmTitle',
      key: 'alarmTitle',
      width: 180,
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusConfig = alarmStatuses.find(s => s.value === status);
        return (
          <Badge 
            status={statusConfig?.color} 
            text={statusConfig?.label || status} 
          />
        );
      }
    },
    {
      title: '处理人',
      dataIndex: 'handler',
      key: 'handler',
      width: 100,
      render: (handler) => handler || '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          
          {record.status === 'pending' && (
            <Tooltip title="处理告警">
              <Button
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleAlarm(record)}
              />
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className={styles.container}>
      {/* 搜索区域 */}
      <Card className={styles.searchCard}>
        <Row gutter={16}>
          <Col span={6}>
            <Input
              placeholder="请输入设备名称"
              value={searchParams.deviceName}
              onChange={(e) => setSearchParams(prev => ({ ...prev, deviceName: e.target.value }))}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="告警类型"
              value={searchParams.alarmType}
              onChange={(value) => setSearchParams(prev => ({ ...prev, alarmType: value }))}
              allowClear
              style={{ width: '100%' }}
            >
              {alarmTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="告警级别"
              value={searchParams.alarmLevel}
              onChange={(value) => setSearchParams(prev => ({ ...prev, alarmLevel: value }))}
              allowClear
              style={{ width: '100%' }}
            >
              {alarmLevels.map(level => (
                <Option key={level.value} value={level.value}>
                  {level.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="处理状态"
              value={searchParams.status}
              onChange={(value) => setSearchParams(prev => ({ ...prev, status: value }))}
              allowClear
              style={{ width: '100%' }}
            >
              {alarmStatuses.map(status => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
              <Button icon={<ExportOutlined />} onClick={handleExport}>
                导出
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 数据表格 */}
      <Card className={styles.tableCard}>
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 告警详情弹窗 */}
      <Modal
        title="告警详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {currentAlarm && (
          <div>
            <Descriptions title="基本信息" bordered column={2}>
              <Descriptions.Item label="告警时间">{currentAlarm.alarmTime}</Descriptions.Item>
              <Descriptions.Item label="告警级别">
                <Tag color={alarmLevels.find(l => l.value === currentAlarm.alarmLevel)?.color}>
                  {alarmLevels.find(l => l.value === currentAlarm.alarmLevel)?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="告警类型">
                <Tag color="blue">
                  {alarmTypes.find(t => t.value === currentAlarm.alarmType)?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="处理状态">
                <Badge
                  status={alarmStatuses.find(s => s.value === currentAlarm.status)?.color}
                  text={alarmStatuses.find(s => s.value === currentAlarm.status)?.label}
                />
              </Descriptions.Item>
              <Descriptions.Item label="告警标题" span={2}>
                {currentAlarm.alarmTitle}
              </Descriptions.Item>
              <Descriptions.Item label="告警描述" span={2}>
                <div style={{
                  padding: '12px',
                  background: '#fafafa',
                  borderRadius: '6px',
                  lineHeight: '1.6'
                }}>
                  {currentAlarm.alarmDescription}
                </div>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="设备信息" bordered column={2}>
              <Descriptions.Item label="设备名称">{currentAlarm.deviceName}</Descriptions.Item>
              <Descriptions.Item label="设备编码">{currentAlarm.deviceId}</Descriptions.Item>
              <Descriptions.Item label="设备类型">{currentAlarm.deviceType}</Descriptions.Item>
              <Descriptions.Item label="设备位置">{currentAlarm.location}</Descriptions.Item>
            </Descriptions>

            {currentAlarm.status !== 'pending' && (
              <>
                <Divider />
                <Descriptions title="处理信息" bordered column={2}>
                  <Descriptions.Item label="处理人">{currentAlarm.handler || '-'}</Descriptions.Item>
                  <Descriptions.Item label="处理时间">{currentAlarm.handleTime || '-'}</Descriptions.Item>
                  <Descriptions.Item label="处理备注" span={2}>
                    {currentAlarm.handleRemark || '-'}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* 处理告警弹窗 */}
      <Modal
        title="处理告警"
        open={isHandleModalVisible}
        onOk={handleSaveProcess}
        onCancel={() => setIsHandleModalVisible(false)}
        width={600}
      >
        {currentAlarm && (
          <div>
            <Descriptions title="告警信息" bordered column={1} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="告警标题">{currentAlarm.alarmTitle}</Descriptions.Item>
              <Descriptions.Item label="设备名称">{currentAlarm.deviceName}</Descriptions.Item>
              <Descriptions.Item label="告警时间">{currentAlarm.alarmTime}</Descriptions.Item>
            </Descriptions>

            <Form form={form} layout="vertical">
              <Form.Item
                label="处理状态"
                name="status"
                rules={[{ required: true, message: '请选择处理状态' }]}
              >
                <Select placeholder="请选择处理状态">
                  <Option value="processing">处理中</Option>
                  <Option value="resolved">已解决</Option>
                  <Option value="ignored">已忽略</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="处理备注"
                name="handleRemark"
                rules={[{ required: true, message: '请输入处理备注' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="请详细描述处理过程和结果..."
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AlarmMessages;
