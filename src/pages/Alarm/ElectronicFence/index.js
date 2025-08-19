import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Row,
  Col,
  Tag,
  Tooltip,
  Modal,
  message,
  Popconfirm,
  Statistic,
  Badge
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  EnvironmentOutlined,
  RadiusUpleftOutlined
} from '@ant-design/icons';
import FenceEditModal from '../../../components/FenceEditModal';
import FenceDetailModal from '../../../components/FenceDetailModal';
import AssociatedDevicesModal from '../../../components/AssociatedDevicesModal';
import AlarmDetailsModal from '../../../components/AlarmDetailsModal';
import {
  getElectronicFences,
  createElectronicFence,
  updateElectronicFence,
  deleteElectronicFence,
  batchDeleteElectronicFences,
  toggleElectronicFenceStatus,
  getElectronicFenceStats
} from '../../../services/electronicFenceService';
import styles from './index.module.css';

const { Search } = Input;
const { Option } = Select;

const ElectronicFence = () => {
  const [loading, setLoading] = useState(false);
  const [fenceList, setFenceList] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchParams, setSearchParams] = useState({
    name: '',
    type: undefined,
    status: undefined
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingFence, setEditingFence] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [viewingFence, setViewingFence] = useState(null);
  const [associatedDevicesModalVisible, setAssociatedDevicesModalVisible] = useState(false);
  const [selectedFenceDevices, setSelectedFenceDevices] = useState([]);
  const [selectedFenceName, setSelectedFenceName] = useState('');
  const [alarmDetailsModalVisible, setAlarmDetailsModalVisible] = useState(false);
  const [selectedFenceAlarms, setSelectedFenceAlarms] = useState([]);

  // 围栏类型选项
  const fenceTypes = [
    { value: 'polygon', label: '多边形围栏', icon: <EnvironmentOutlined /> },
    { value: 'circle', label: '圆形围栏', icon: <RadiusUpleftOutlined /> }
  ];

  // 围栏状态选项
  const fenceStatuses = [
    { value: 'active', label: '启用', color: 'success' },
    { value: 'inactive', label: '禁用', color: 'default' }
  ];

  // 告警类型选项
  const alarmTypes = [
    { value: 'enter', label: '进入告警', color: 'warning' },
    { value: 'exit', label: '离开告警', color: 'error' },
    { value: 'both', label: '进出告警', color: 'processing' }
  ];

  // 加载围栏列表
  const loadFenceList = async (params = {}) => {
    setLoading(true);
    try {
      const response = await getElectronicFences({
        ...searchParams,
        ...params,
        current: pagination.current,
        pageSize: pagination.pageSize
      });

      if (response.success) {
        setFenceList(response.data);
        setPagination(prev => ({
          ...prev,
          total: response.total,
          current: response.current
        }));
      }
    } catch (error) {
      message.error('加载围栏列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载统计信息
  const loadStats = async () => {
    try {
      const response = await getElectronicFenceStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('加载统计信息失败:', error);
    }
  };

  // 初始化加载
  useEffect(() => {
    loadFenceList();
    loadStats();
  }, []);

  // 搜索处理
  const handleSearch = (value, field) => {
    const newSearchParams = { ...searchParams, [field]: value };
    setSearchParams(newSearchParams);
    setPagination(prev => ({ ...prev, current: 1 }));
    loadFenceList({ ...newSearchParams, current: 1 });
  };

  // 重置搜索
  const handleResetSearch = () => {
    setSearchParams({ name: '', type: undefined, status: undefined });
    setPagination(prev => ({ ...prev, current: 1 }));
    loadFenceList({ name: '', type: undefined, status: undefined, current: 1 });
  };

  // 表格分页变化
  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
    loadFenceList({ current: newPagination.current, pageSize: newPagination.pageSize });
  };

  // 新增围栏
  const handleAdd = () => {
    setEditingFence(null);
    setIsModalVisible(true);
  };

  // 编辑围栏
  const handleEdit = (record) => {
    setEditingFence(record);
    setIsModalVisible(true);
  };

  // 查看围栏详情
  const handleView = (record) => {
    setViewingFence(record);
    setIsDetailModalVisible(true);
  };

  // 查看关联设备
  const handleViewAssociatedDevices = (fence) => {
    setSelectedFenceDevices(fence.associatedDevices || []);
    setSelectedFenceName(fence.name);
    setAssociatedDevicesModalVisible(true);
  };

  // 查看告警详情
  const handleViewAlarmDetails = (fence) => {
    setSelectedFenceAlarms(fence.alarms || []);
    setSelectedFenceName(fence.name);
    setAlarmDetailsModalVisible(true);
  };

  // 删除围栏
  const handleDelete = async (id) => {
    try {
      const response = await deleteElectronicFence(id);
      if (response.success) {
        message.success(response.message);
        loadFenceList();
        loadStats();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的围栏');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除选中的 ${selectedRowKeys.length} 个围栏吗？`,
      onOk: async () => {
        try {
          const response = await batchDeleteElectronicFences(selectedRowKeys);
          if (response.success) {
            message.success(response.message);
            setSelectedRowKeys([]);
            loadFenceList();
            loadStats();
          } else {
            message.error(response.message);
          }
        } catch (error) {
          message.error('批量删除失败');
        }
      }
    });
  };

  // 切换围栏状态
  const handleToggleStatus = async (record) => {
    try {
      const response = await toggleElectronicFenceStatus(record.id);
      if (response.success) {
        message.success(response.message);
        loadFenceList();
        loadStats();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('状态切换失败');
    }
  };

  // 保存围栏
  const handleSave = async (fenceData) => {
    setModalLoading(true);
    try {
      let response;
      if (editingFence) {
        response = await updateElectronicFence(editingFence.id, fenceData);
      } else {
        response = await createElectronicFence(fenceData);
      }

      if (response.success) {
        message.success(response.message);
        setIsModalVisible(false);
        loadFenceList();
        loadStats();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error(editingFence ? '更新失败' : '创建失败');
    } finally {
      setModalLoading(false);
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '围栏名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500, color: '#262626' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '2px' }}>
            ID: {record.id}
          </div>
        </div>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => {
        const typeConfig = fenceTypes.find(t => t.value === type);
        return (
          <Tag icon={typeConfig?.icon} color={type === 'polygon' ? 'blue' : 'green'}>
            {typeConfig?.label}
          </Tag>
        );
      }
    },
    {
      title: '告警类型',
      dataIndex: 'alarmType',
      key: 'alarmType',
      width: 100,
      render: (alarmType) => {
        const typeConfig = alarmTypes.find(t => t.value === alarmType);
        return (
          <Tag color={typeConfig?.color}>
            {typeConfig?.label}
          </Tag>
        );
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status, record) => (
        <Badge
          status={status === 'active' ? 'success' : 'default'}
          text={
            <span
              style={{ cursor: 'pointer' }}
              onClick={() => handleToggleStatus(record)}
            >
              {status === 'active' ? '启用' : '禁用'}
            </span>
          }
        />
      )
    },
    {
      title: '关联设备',
      dataIndex: 'deviceCount',
      key: 'deviceCount',
      width: 100,
      render: (count, record) => (
        <Button
          type="link"
          size="small"
          style={{
            padding: 0,
            height: 'auto',
            color: count > 0 ? '#1890ff' : '#8c8c8c',
            cursor: count > 0 ? 'pointer' : 'default'
          }}
          disabled={count === 0}
          onClick={() => count > 0 && handleViewAssociatedDevices(record)}
        >
          {count} 个
        </Button>
      )
    },
    {
      title: '告警次数',
      dataIndex: 'alarmCount',
      key: 'alarmCount',
      width: 100,
      render: (count, record) => (
        <Button
          type="link"
          size="small"
          style={{
            padding: 0,
            height: 'auto',
            color: count > 0 ? '#fa541c' : '#52c41a',
            cursor: count > 0 ? 'pointer' : 'default'
          }}
          disabled={count === 0}
          onClick={() => count > 0 && handleViewAlarmDetails(record)}
        >
          {count} 次
        </Button>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      render: (time) => (
        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
          {time}
        </div>
      )
    }
  ];

  return (
    <div className={styles.container}>
      {/* 统计卡片 */}
      <Row gutter={16} className={styles.statsRow}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总围栏数"
              value={stats.total || 0}
              prefix={<EnvironmentOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="启用围栏"
              value={stats.active || 0}
              prefix={<Badge status="success" />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="关联设备"
              value={stats.totalDevices || 0}
              prefix={<RadiusUpleftOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="告警次数"
              value={stats.totalAlarms || 0}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#fa541c' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索区域 */}
      <Card className={styles.searchCard}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Search
              placeholder="请输入围栏名称进行搜索"
              value={searchParams.name}
              onChange={(e) => setSearchParams(prev => ({ ...prev, name: e.target.value }))}
              onSearch={(value) => handleSearch(value, 'name')}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="全部类型"
              value={searchParams.type}
              onChange={(value) => handleSearch(value, 'type')}
              allowClear
              style={{ width: '100%' }}
            >
              {fenceTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="全部状态"
              value={searchParams.status}
              onChange={(value) => handleSearch(value, 'status')}
              allowClear
              style={{ width: '100%' }}
            >
              {fenceStatuses.map(status => (
                <Option key={status.value} value={status.value}>
                  <Badge status={status.color} text={status.label} />
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Space>
              <Button onClick={handleResetSearch}>重置</Button>
              {selectedRowKeys.length > 0 && (
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleBatchDelete}
                >
                  批量删除 ({selectedRowKeys.length})
                </Button>
              )}
            </Space>
          </Col>
          <Col span={4} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              新增围栏
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 表格区域 */}
      <Card className={styles.tableCard}>
        <Table
          columns={[
            ...columns,
            {
              title: '操作',
              key: 'action',
              width: 180,
              fixed: 'right',
              render: (_, record) => (
                <Space size="small">
                  <Tooltip title="查看详情">
                    <Button
                      type="primary"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => handleView(record)}
                    />
                  </Tooltip>
                  <Tooltip title="编辑围栏">
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(record)}
                    />
                  </Tooltip>
                  <Popconfirm
                    title="确定要删除这个围栏吗？"
                    onConfirm={() => handleDelete(record.id)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Tooltip title="删除围栏">
                      <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                      />
                    </Tooltip>
                  </Popconfirm>
                </Space>
              )
            }
          ]}
          dataSource={fenceList}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
          }}
          onChange={handleTableChange}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            getCheckboxProps: (record) => ({
              disabled: record.status === 'active' && record.deviceCount > 0
            })
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 编辑弹窗 */}
      <FenceEditModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSave}
        editingFence={editingFence}
        loading={modalLoading}
      />

      {/* 围栏详情弹窗 */}
      <FenceDetailModal
        visible={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        fenceData={viewingFence}
      />

      {/* 关联设备详情弹窗 */}
      <AssociatedDevicesModal
        visible={associatedDevicesModalVisible}
        onCancel={() => setAssociatedDevicesModalVisible(false)}
        devices={selectedFenceDevices}
        fenceName={selectedFenceName}
      />

      {/* 告警详情弹窗 */}
      <AlarmDetailsModal
        visible={alarmDetailsModalVisible}
        onCancel={() => setAlarmDetailsModalVisible(false)}
        alarms={selectedFenceAlarms}
        fenceName={selectedFenceName}
      />
    </div>
  );
};

export default ElectronicFence;
