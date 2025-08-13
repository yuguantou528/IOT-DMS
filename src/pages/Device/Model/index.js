import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Select,
  Tag,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  ExportOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import styles from './index.module.css';
import { getManufacturerList } from '../../../services/deviceManufacturer';
import {
  deviceTypes,
  getDeviceModelList,
  createDeviceModel,
  updateDeviceModel,
  deleteDeviceModel
} from '../../../services/deviceModel';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const DeviceModel = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [manufacturers, setManufacturers] = useState([]);
  const [searchParams, setSearchParams] = useState({
    name: '',
    manufacturerId: undefined,
    deviceType: undefined,
    status: undefined
  });



  // 表格列定义
  const columns = [
    {
      title: '型号名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      ellipsis: true
    },
    {
      title: '型号编码',
      dataIndex: 'code',
      key: 'code',
      width: 120
    },
    {
      title: '所属厂商',
      dataIndex: 'manufacturerName',
      key: 'manufacturerName',
      width: 200,
      ellipsis: true
    },
    {
      title: '设备类型',
      dataIndex: 'deviceType',
      key: 'deviceType',
      width: 120,
      render: (type) => {
        const typeLabel = deviceTypes.find(t => t.value === type)?.label || type;
        return <Tag color="blue">{typeLabel}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '启用' : '禁用'}
        </Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>

          <Popconfirm
            title="确定要删除这个设备型号吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  useEffect(() => {
    fetchDataWithParams({});
    fetchManufacturers();
  }, []);

  // 获取设备型号列表
  const fetchData = () => {
    fetchDataWithParams(searchParams);
  };

  // 获取厂商列表
  const fetchManufacturers = async () => {
    try {
      const response = await getManufacturerList({ pageSize: 1000 });
      if (response.success) {
        // 只获取启用状态的厂商
        setManufacturers(response.data.list.filter(m => m.status === 'active'));
      }
    } catch (error) {
      console.error('获取厂商列表失败:', error);
      message.error('获取厂商列表失败');
    }
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setIsModalVisible(true);
    form.setFieldsValue({
      ...record,
      manufacturerId: record.manufacturerId // 确保设置厂商ID而不是厂商名称
    });
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteDeviceModel(id);
      if (response.success) {
        message.success('删除成功');
        fetchData(); // 重新获取数据
      } else {
        message.error(response.message || '删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (editingRecord) {
        // 编辑
        const response = await updateDeviceModel(editingRecord.id, values);
        if (response.success) {
          message.success('更新成功');
          setIsModalVisible(false);
          fetchData(); // 重新获取数据
        } else {
          message.error(response.message || '更新失败');
        }
      } else {
        // 新增
        const response = await createDeviceModel(values);
        if (response.success) {
          message.success('新增成功');
          setIsModalVisible(false);
          fetchData(); // 重新获取数据
        } else {
          message.error(response.message || '新增失败');
        }
      }
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    }
  };

  // 搜索功能
  const handleSearch = () => {
    fetchData();
  };

  // 重置搜索
  const handleReset = () => {
    setSearchParams({
      name: '',
      manufacturerId: undefined,
      deviceType: undefined,
      status: undefined
    });
    // 重置后重新获取数据
    setTimeout(() => {
      fetchData();
    }, 100);
  };

  // 修改fetchData函数支持搜索参数
  const fetchDataWithParams = async (params = searchParams) => {
    setLoading(true);
    try {
      const response = await getDeviceModelList({
        pageSize: 1000,
        ...params
      });
      if (response.success) {
        setDataSource(response.data.list);
      }
    } catch (error) {
      console.error('获取设备型号列表失败:', error);
      message.error('获取设备型号列表失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* 搜索区域 */}
      <Card 
        className={styles.searchCard}
        title={
          <span className={styles.cardTitle}>
            <SearchOutlined style={{ marginRight: 8 }} />
            搜索筛选
          </span>
        }
        size="small"
      >
        <div className={styles.searchArea}>
          <Row gutter={16}>
            <Col span={5}>
              <Search
                placeholder="请输入型号名称"
                value={searchParams.name}
                onChange={(e) => setSearchParams({...searchParams, name: e.target.value})}
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="所属厂商"
                style={{ width: '100%' }}
                allowClear
                value={searchParams.manufacturerId}
                onChange={(value) => setSearchParams({...searchParams, manufacturerId: value})}
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
                placeholder="请选择设备类型"
                style={{ width: '100%' }}
                allowClear
                value={searchParams.deviceType}
                onChange={(value) => setSearchParams({...searchParams, deviceType: value})}
              >
                {deviceTypes.map(type => (
                  <Option key={type.value} value={type.value}>
                    {type.label}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={3}>
              <Select
                placeholder="请选择状态"
                style={{ width: '100%' }}
                allowClear
                value={searchParams.status}
                onChange={(value) => setSearchParams({...searchParams, status: value})}
              >
                <Option value="active">启用</Option>
                <Option value="inactive">禁用</Option>
              </Select>
            </Col>
            <Col span={8}>
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
      </Card>

      {/* 列表区域 */}
      <Card
        className={styles.tableCard}
        title={
          <span className={styles.cardTitle}>
            <AppstoreOutlined style={{ marginRight: 8 }} />
            设备型号列表
          </span>
        }
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增型号
            </Button>
            <Button icon={<ExportOutlined />}>
              导出
            </Button>
          </Space>
        }
        size="small"
      >
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          loading={loading}
          pagination={{
            total: dataSource.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingRecord ? '编辑设备型号' : '新增设备型号'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'active' }}
        >
          <Form.Item
            label="所属厂商"
            name="manufacturerId"
            rules={[{ required: true, message: '请选择所属厂商' }]}
          >
            <Select placeholder="请选择所属厂商">
              {manufacturers.map(manufacturer => (
                <Option key={manufacturer.id} value={manufacturer.id}>
                  {manufacturer.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

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

          <Form.Item
            label="型号名称"
            name="name"
            rules={[{ required: true, message: '请输入型号名称' }]}
          >
            <Input placeholder="请输入型号名称" />
          </Form.Item>

          <Form.Item
            label="型号编码"
            name="code"
            rules={[{ required: true, message: '请输入型号编码' }]}
          >
            <Input placeholder="请输入型号编码" />
          </Form.Item>
          
          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value="active">启用</Option>
              <Option value="inactive">禁用</Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="描述信息" name="description">
            <TextArea rows={3} placeholder="请输入描述信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DeviceModel;
