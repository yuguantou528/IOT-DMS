import React, { useState, useEffect } from 'react';
import {
  Modal,
  Table,
  Button,
  Space,
  Input,
  Select,
  message,
  Tag,
  Badge,
  Row,
  Col,
  Typography
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  CheckOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import styles from './index.module.css';
import { getDeviceList, deviceStatuses, deviceTypeMap } from '../../services/deviceManagement';
import { getManufacturerList } from '../../services/deviceManufacturer';
import { getAllLinkedDevicesByType } from '../../services/productManagement';

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;

const DeviceSelector = ({ 
  visible, 
  onCancel, 
  onConfirm, 
  productDeviceType,
  productId,
  excludeDeviceIds = [],
  title = "选择设备"
}) => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [linkedDeviceIds, setLinkedDeviceIds] = useState([]);
  const [searchParams, setSearchParams] = useState({
    name: '',
    manufacturerId: '',
    status: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // 表格列定义
  const columns = [
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
      render: (text, record) => (
        <div className={styles.deviceNameCell}>
          <span className={styles.deviceName}>{text}</span>
          <div className={styles.deviceCode}>{record.deviceCode}</div>
        </div>
      )
    },
    {
      title: '设备类型',
      dataIndex: 'deviceTypeName',
      key: 'deviceTypeName',
      width: 120,
      render: (text, record) => (
        <Tag color={record.deviceType === productDeviceType ? 'green' : 'default'}>
          {text}
        </Tag>
      )
    },
    {
      title: '厂商',
      dataIndex: 'manufacturerName',
      key: 'manufacturerName',
      width: 120,
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusConfig = deviceStatuses.find(s => s.value === status);
        return (
          <Badge
            status={statusConfig?.color || 'default'}
            text={statusConfig?.label || status}
          />
        );
      }
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
        const isSelected = selectedDevices.some(device => device.id === record.id);
        const isExcluded = excludeDeviceIds.includes(record.id);
        const isWrongType = record.deviceType !== productDeviceType;
        const isLinkedToOther = linkedDeviceIds.includes(record.id);

        if (isExcluded) {
          return <Text type="secondary">已关联</Text>;
        }

        if (isLinkedToOther) {
          return <Text type="warning">已被其他产品关联</Text>;
        }

        if (isWrongType) {
          return <Text type="secondary">类型不匹配</Text>;
        }

        return (
          <Button
            type={isSelected ? 'primary' : 'default'}
            size="small"
            icon={isSelected ? <CheckOutlined /> : null}
            onClick={() => handleToggleDevice(record)}
          >
            {isSelected ? '已选择' : '选择'}
          </Button>
        );
      }
    }
  ];

  // 获取数据
  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const response = await getDeviceList({
        ...searchParams,
        ...params,
        page: pagination.current,
        pageSize: pagination.pageSize
      });
      
      if (response.success) {
        setDataSource(response.data.list);
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

  // 获取已关联的设备列表
  const fetchLinkedDevices = async () => {
    if (!productDeviceType) return;
    
    try {
      const response = await getAllLinkedDevicesByType(productDeviceType, productId);
      if (response.success) {
        setLinkedDeviceIds(response.data);
      }
    } catch (error) {
      console.error('获取已关联设备失败:', error);
    }
  };

  // 初始化数据
  useEffect(() => {
    if (visible) {
      fetchData();
      fetchManufacturers();
      fetchLinkedDevices();
    }
  }, [visible]);

  // 搜索
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchData({ page: 1 });
  };

  // 重置搜索
  const handleReset = () => {
    setSearchParams({
      name: '',
      manufacturerId: '',
      status: ''
    });
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchData({ page: 1 });
  };

  // 切换设备选择状态
  const handleToggleDevice = (device) => {
    const isSelected = selectedDevices.some(d => d.id === device.id);
    
    if (isSelected) {
      setSelectedDevices(prev => prev.filter(d => d.id !== device.id));
    } else {
      setSelectedDevices(prev => [...prev, device]);
    }
  };

  // 确认选择
  const handleConfirm = () => {
    if (selectedDevices.length === 0) {
      message.warning('请至少选择一个设备');
      return;
    }
    onConfirm(selectedDevices);
  };

  // 取消选择
  const handleCancel = () => {
    setSelectedDevices([]);
    onCancel();
  };

  // 表格分页变化
  const handleTableChange = (pagination) => {
    setPagination(pagination);
    fetchData({ page: pagination.current, pageSize: pagination.pageSize });
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={handleCancel}
      onOk={handleConfirm}
      width={1000}
      destroyOnClose
      okText={`确定选择 (${selectedDevices.length})`}
      cancelText="取消"
    >
      <div className={styles.deviceSelector}>
        {/* 提示信息 */}
        <div className={styles.tipSection}>
          <InfoCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
          <Text type="secondary">
            只能选择设备类型为 <Tag color="green">{deviceTypeMap[productDeviceType] || productDeviceType}</Tag> 的设备作为子设备
          </Text>
        </div>

        {/* 搜索区域 */}
        <div className={styles.searchSection}>
          <Row gutter={16}>
            <Col span={8}>
              <Search
                placeholder="请输入设备名称或编码"
                value={searchParams.name}
                onChange={(e) => setSearchParams(prev => ({ ...prev, name: e.target.value }))}
                onSearch={handleSearch}
                allowClear
              />
            </Col>
            <Col span={6}>
              <Select
                placeholder="厂商"
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
            <Col span={6}>
              <Select
                placeholder="状态"
                value={searchParams.status}
                onChange={(value) => setSearchParams(prev => ({ ...prev, status: value }))}
                allowClear
                style={{ width: '100%' }}
              >
                {deviceStatuses.map(status => (
                  <Option key={status.value} value={status.value}>
                    {status.label}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={4}>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                  搜索
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  重置
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* 设备列表 */}
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
          }}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
          size="middle"
          rowClassName={(record) => {
            if (excludeDeviceIds.includes(record.id)) {
              return styles.excludedRow;
            }
            if (record.deviceType !== productDeviceType) {
              return styles.mismatchedRow;
            }
            if (selectedDevices.some(device => device.id === record.id)) {
              return styles.selectedRow;
            }
            return '';
          }}
        />
      </div>
    </Modal>
  );
};

export default DeviceSelector;
