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
  Switch,
  InputNumber,
  Divider,
  Typography
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  SettingOutlined,
  WarningOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import styles from './index.module.css';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const AlarmRules = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useState({
    ruleName: '',
    deviceType: undefined,
    status: undefined
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // 设备类型配置
  const deviceTypes = [
    { value: 'network_camera', label: '网络摄像头' },
    { value: 'mesh_radio', label: 'Mesh电台' },
    { value: 'sensor', label: '传感器' },
    { value: 'base_station', label: '370M基站' },
    { value: 'satellite', label: '卫星通信设备' }
  ];

  // 告警级别配置
  const alarmLevels = [
    { value: 'info', label: '信息', color: 'blue' },
    { value: 'warning', label: '警告', color: 'orange' },
    { value: 'error', label: '错误', color: 'red' },
    { value: 'critical', label: '严重', color: 'red' }
  ];

  // 比较操作符配置
  const operators = [
    { value: 'gt', label: '大于 (>)' },
    { value: 'gte', label: '大于等于 (>=)' },
    { value: 'lt', label: '小于 (<)' },
    { value: 'lte', label: '小于等于 (<=)' },
    { value: 'eq', label: '等于 (=)' },
    { value: 'ne', label: '不等于 (!=)' }
  ];

  // 模拟数据
  const mockData = [
    {
      id: 1,
      ruleName: '设备离线告警规则',
      deviceType: 'network_camera',
      parameter: 'connection_status',
      operator: 'eq',
      threshold: 'offline',
      alarmLevel: 'error',
      enabled: true,
      description: '当设备连接状态为离线时触发告警',
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
      description: '当温度传感器检测值超过80度时触发告警',
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
      description: '当Mesh电台信号强度低于-80dBm时触发告警',
      createTime: '2024-01-16 14:20:00',
      updateTime: '2024-01-19 16:45:00'
    },
    {
      id: 4,
      ruleName: '存储空间不足告警规则',
      deviceType: 'network_camera',
      parameter: 'storage_usage',
      operator: 'gt',
      threshold: '90',
      alarmLevel: 'critical',
      enabled: true,
      description: '当存储空间使用率超过90%时触发严重告警',
      createTime: '2024-01-17 09:30:00',
      updateTime: '2024-01-20 11:20:00'
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
      if (params.ruleName) {
        filteredData = filteredData.filter(item => 
          item.ruleName.toLowerCase().includes(params.ruleName.toLowerCase())
        );
      }
      
      if (params.deviceType) {
        filteredData = filteredData.filter(item => item.deviceType === params.deviceType);
      }
      
      if (params.status !== undefined) {
        filteredData = filteredData.filter(item => item.enabled === params.status);
      }
      
      setDataSource(filteredData);
      setPagination(prev => ({
        ...prev,
        total: filteredData.length
      }));
    } catch (error) {
      message.error('获取告警规则失败');
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
      ruleName: '',
      deviceType: undefined,
      status: undefined
    });
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchData({});
  };

  // 新增
  const handleAdd = () => {
    setEditingRecord(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  // 编辑
  const handleEdit = (record) => {
    setEditingRecord(record);
    setIsModalVisible(true);
    form.setFieldsValue(record);
  };

  // 删除
  const handleDelete = async (id) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newData = dataSource.filter(item => item.id !== id);
      setDataSource(newData);
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 切换启用状态
  const handleToggleStatus = async (record) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newData = dataSource.map(item => {
        if (item.id === record.id) {
          return { ...item, enabled: !item.enabled };
        }
        return item;
      });
      
      setDataSource(newData);
      message.success(`规则已${record.enabled ? '禁用' : '启用'}`);
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 保存
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (editingRecord) {
        // 编辑
        const newData = dataSource.map(item => {
          if (item.id === editingRecord.id) {
            return {
              ...item,
              ...values,
              updateTime: new Date().toLocaleString()
            };
          }
          return item;
        });
        setDataSource(newData);
        message.success('更新成功');
      } else {
        // 新增
        const newRecord = {
          id: Date.now(),
          ...values,
          createTime: new Date().toLocaleString(),
          updateTime: new Date().toLocaleString()
        };
        setDataSource([newRecord, ...dataSource]);
        message.success('添加成功');
      }
      
      setIsModalVisible(false);
    } catch (error) {
      message.error('保存失败');
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '规则名称',
      dataIndex: 'ruleName',
      key: 'ruleName',
      width: 200,
      ellipsis: true
    },
    {
      title: '设备类型',
      dataIndex: 'deviceType',
      key: 'deviceType',
      width: 120,
      render: (type) => {
        const typeConfig = deviceTypes.find(t => t.value === type);
        return <Tag color="blue">{typeConfig?.label || type}</Tag>;
      }
    },
    {
      title: '监控参数',
      dataIndex: 'parameter',
      key: 'parameter',
      width: 120
    },
    {
      title: '条件',
      key: 'condition',
      width: 150,
      render: (_, record) => {
        const operatorConfig = operators.find(op => op.value === record.operator);
        return (
          <span>
            {operatorConfig?.label} {record.threshold}
          </span>
        );
      }
    },
    {
      title: '告警级别',
      dataIndex: 'alarmLevel',
      key: 'alarmLevel',
      width: 100,
      render: (level) => {
        const levelConfig = alarmLevels.find(l => l.value === level);
        return (
          <Tag color={levelConfig?.color}>
            {levelConfig?.label || level}
          </Tag>
        );
      }
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (enabled, record) => (
        <Switch
          checked={enabled}
          onChange={() => handleToggleStatus(record)}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      )
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 160
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          
          <Tooltip title="删除">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: '确认删除',
                  content: '确定要删除这条告警规则吗？',
                  onOk: () => handleDelete(record.id)
                });
              }}
            />
          </Tooltip>
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
              placeholder="请输入规则名称"
              value={searchParams.ruleName}
              onChange={(e) => setSearchParams(prev => ({ ...prev, ruleName: e.target.value }))}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="设备类型"
              value={searchParams.deviceType}
              onChange={(value) => setSearchParams(prev => ({ ...prev, deviceType: value }))}
              allowClear
              style={{ width: '100%' }}
            >
              {deviceTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="启用状态"
              value={searchParams.status}
              onChange={(value) => setSearchParams(prev => ({ ...prev, status: value }))}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value={true}>启用</Option>
              <Option value={false}>禁用</Option>
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
            </Space>
          </Col>
          <Col span={4} style={{ textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增规则
            </Button>
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
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingRecord ? '编辑告警规则' : '新增告警规则'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="规则名称"
                name="ruleName"
                rules={[{ required: true, message: '请输入规则名称' }]}
              >
                <Input placeholder="请输入规则名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="设备类型"
                name="deviceType"
                rules={[{ required: true, message: '请选择设备类型' }]}
              >
                <Select placeholder="请选择设备类型">
                  {deviceTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="监控参数"
                name="parameter"
                rules={[{ required: true, message: '请输入监控参数' }]}
              >
                <Input placeholder="如: temperature" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="比较操作符"
                name="operator"
                rules={[{ required: true, message: '请选择比较操作符' }]}
              >
                <Select placeholder="请选择操作符">
                  {operators.map(op => (
                    <Option key={op.value} value={op.value}>
                      {op.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="阈值"
                name="threshold"
                rules={[{ required: true, message: '请输入阈值' }]}
              >
                <Input placeholder="请输入阈值" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="告警级别"
                name="alarmLevel"
                rules={[{ required: true, message: '请选择告警级别' }]}
              >
                <Select placeholder="请选择告警级别">
                  {alarmLevels.map(level => (
                    <Option key={level.value} value={level.value}>
                      <Tag color={level.color}>{level.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="启用状态"
                name="enabled"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch checkedChildren="启用" unCheckedChildren="禁用" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="规则描述"
            name="description"
            rules={[{ required: true, message: '请输入规则描述' }]}
          >
            <TextArea
              rows={3}
              placeholder="请详细描述告警规则的触发条件和用途..."
            />
          </Form.Item>

          <Divider />

          <div style={{ background: '#f6ffed', padding: '12px', borderRadius: '6px', border: '1px solid #b7eb8f' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <InfoCircleOutlined style={{ color: '#52c41a' }} />
              <Text strong style={{ color: '#52c41a' }}>规则配置说明</Text>
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#595959', fontSize: '13px' }}>
              <li>监控参数：设备上报的具体参数名称，如 temperature、signal_strength 等</li>
              <li>比较操作符：用于比较参数值与阈值的关系</li>
              <li>阈值：触发告警的临界值，可以是数字或字符串</li>
              <li>告警级别：影响告警的显示优先级和处理紧急程度</li>
              <li>规则启用后将实时监控设备参数，满足条件时自动生成告警</li>
            </ul>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AlarmRules;
