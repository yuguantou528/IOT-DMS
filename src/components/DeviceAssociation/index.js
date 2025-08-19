import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Input,
  Select,
  Button,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Divider,
  message,
  Empty,
  Tooltip
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { getDeviceList } from '../../services/deviceManagement';
import { getManufacturerList } from '../../services/deviceManufacturer';
import { deviceTypes } from '../../services/deviceManagement';
import styles from './index.module.css';

const { Text, Title } = Typography;
const { Option } = Select;

const DeviceAssociation = ({ selectedDevices = [], onDeviceChange }) => {
  const [loading, setLoading] = useState(false);
  const [deviceList, setDeviceList] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [searchParams, setSearchParams] = useState({
    name: '',
    manufacturerId: undefined,
    deviceType: undefined,
    status: undefined // 显示所有状态的设备
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // 获取设备列表
  const fetchDeviceList = async (params = {}) => {
    setLoading(true);
    try {
      const response = await getDeviceList({
        ...searchParams,
        ...params,
        page: pagination.current,
        pageSize: pagination.pageSize
      });
      
      if (response.success) {
        setDeviceList(response.data.list);
        setPagination(prev => ({
          ...prev,
          total: response.data.total
        }));
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('获取设备列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取厂商列表
  const fetchManufacturers = async () => {
    try {
      const response = await getManufacturerList();
      if (response.success) {
        setManufacturers(response.data.list);
      }
    } catch (error) {
      console.error('获取厂商列表失败:', error);
    }
  };

  useEffect(() => {
    fetchDeviceList();
    fetchManufacturers();
  }, []);

  // 搜索处理
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchDeviceList({ page: 1 });
  };

  // 重置搜索
  const handleReset = () => {
    setSearchParams({
      name: '',
      manufacturerId: undefined,
      deviceType: undefined,
      status: undefined // 重置时也显示所有状态
    });
    setPagination(prev => ({ ...prev, current: 1 }));
    setTimeout(() => {
      fetchDeviceList({ page: 1 });
    }, 100);
  };

  // 添加设备到关联列表
  const handleAddDevice = (device) => {
    const isAlreadySelected = selectedDevices.some(d => d.id === device.id);
    if (isAlreadySelected) {
      message.warning('该设备已经关联');
      return;
    }

    // 添加关联时间
    const deviceWithTime = {
      ...device,
      associatedTime: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).replace(/\//g, '-')
    };

    const newSelectedDevices = [...selectedDevices, deviceWithTime];
    onDeviceChange(newSelectedDevices);
    message.success(`已添加设备：${device.name}`);
  };

  // 从关联列表移除设备
  const handleRemoveDevice = (deviceId) => {
    const newSelectedDevices = selectedDevices.filter(d => d.id !== deviceId);
    onDeviceChange(newSelectedDevices);
    message.success('已移除设备');
  };

  // 批量添加设备
  const handleBatchAdd = (deviceIds) => {
    const devicesToAdd = deviceList.filter(device =>
      deviceIds.includes(device.id) &&
      !selectedDevices.some(d => d.id === device.id)
    );

    if (devicesToAdd.length === 0) {
      message.warning('没有可添加的设备');
      return;
    }

    // 为批量添加的设备添加关联时间
    const devicesWithTime = devicesToAdd.map(device => ({
      ...device,
      associatedTime: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).replace(/\//g, '-')
    }));

    const newSelectedDevices = [...selectedDevices, ...devicesWithTime];
    onDeviceChange(newSelectedDevices);
    message.success(`已添加 ${devicesToAdd.length} 个设备`);
  };

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

  // 可选设备表格列配置
  const availableDeviceColumns = [
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true
    },
    {
      title: '设备编码',
      dataIndex: 'deviceCode',
      key: 'deviceCode',
      width: 150,
      ellipsis: true
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
      width: 150,
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
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => {
        const isSelected = selectedDevices.some(d => d.id === record.id);
        return (
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            disabled={isSelected}
            onClick={() => handleAddDevice(record)}
          >
            {isSelected ? '已关联' : '关联'}
          </Button>
        );
      }
    }
  ];

  // 已选设备表格列配置
  const selectedDeviceColumns = [
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true
    },
    {
      title: '设备编码',
      dataIndex: 'deviceCode',
      key: 'deviceCode',
      ellipsis: true
    },
    {
      title: '设备类型',
      dataIndex: 'deviceType',
      key: 'deviceType',
      render: (deviceType) => getDeviceTypeTag(deviceType)
    },
    {
      title: '厂商',
      dataIndex: 'manufacturerName',
      key: 'manufacturerName',
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status)
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveDevice(record.id)}
        >
          移除
        </Button>
      )
    }
  ];

  return (
    <div className={styles.deviceAssociation}>
      <Row gutter={24}>
        {/* 左侧：可选设备列表 */}
        <Col span={14}>
          <Card
            title={
              <Space>
                <InfoCircleOutlined />
                <span>可选设备列表</span>
                <Text type="secondary">({deviceList.length} 个设备)</Text>
              </Space>
            }
            size="small"
          >
            {/* 搜索筛选区域 */}
            <div className={styles.searchSection}>
              <Row gutter={16}>
                <Col span={6}>
                  <Input
                    placeholder="搜索设备名称或编码"
                    value={searchParams.name}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, name: e.target.value }))}
                    onPressEnter={handleSearch}
                    prefix={<SearchOutlined />}
                  />
                </Col>
                <Col span={4}>
                  <Select
                    placeholder="选择厂商"
                    value={searchParams.manufacturerId}
                    onChange={(value) => setSearchParams(prev => ({ ...prev, manufacturerId: value }))}
                    allowClear
                    style={{ width: '100%' }}
                  >
                    {manufacturers.map(manufacturer => (
                      <Option key={manufacturer.id} value={manufacturer.id}>
                        {manufacturer.name}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col span={4}>
                  <Select
                    placeholder="选择设备类型"
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
                    placeholder="选择设备状态"
                    value={searchParams.status}
                    onChange={(value) => setSearchParams(prev => ({ ...prev, status: value }))}
                    allowClear
                    style={{ width: '100%' }}
                  >
                    <Option value="online">在线</Option>
                    <Option value="offline">离线</Option>
                    <Option value="fault">故障</Option>
                  </Select>
                </Col>
                <Col span={6}>
                  <Space>
                    <Button type="primary" onClick={handleSearch}>
                      搜索
                    </Button>
                    <Button onClick={handleReset}>
                      重置
                    </Button>
                  </Space>
                </Col>
              </Row>
            </div>

            {/* 设备列表表格 */}
            <Table
              columns={availableDeviceColumns}
              dataSource={deviceList}
              rowKey="id"
              loading={loading}
              pagination={{
                ...pagination,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                onChange: (page, pageSize) => {
                  setPagination(prev => ({ ...prev, current: page, pageSize }));
                  fetchDeviceList({ page, pageSize });
                }
              }}
              scroll={{ x: 800, y: 450 }}
              size="small"
              rowSelection={{
                type: 'checkbox',
                onSelect: (record, selected, selectedRows) => {
                  if (selected) {
                    handleAddDevice(record);
                  }
                },
                onSelectAll: (selected, selectedRows, changeRows) => {
                  if (selected) {
                    const deviceIds = changeRows.map(device => device.id);
                    handleBatchAdd(deviceIds);
                  }
                },
                getCheckboxProps: (record) => ({
                  disabled: selectedDevices.some(d => d.id === record.id)
                })
              }}
            />
          </Card>
        </Col>

        {/* 右侧：已关联设备列表 */}
        <Col span={10}>
          <Card
            title={
              <Space>
                <CheckCircleOutlined />
                <span>已关联设备</span>
                <Text type="secondary">({selectedDevices.length} 个设备)</Text>
              </Space>
            }
            size="small"
          >
            {selectedDevices.length === 0 ? (
              <Empty
                description="暂无关联设备"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ margin: '40px 0' }}
              />
            ) : (
              <Table
                columns={selectedDeviceColumns}
                dataSource={selectedDevices}
                rowKey="id"
                pagination={false}
                scroll={{ y: 450 }}
                size="small"
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DeviceAssociation;
