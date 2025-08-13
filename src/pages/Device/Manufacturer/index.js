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
  DatePicker,
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
import {
  getManufacturerList,
  createManufacturer,
  updateManufacturer,
  deleteManufacturer,
  exportManufacturerData
} from '../../../services/deviceManufacturer';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const DeviceManufacturer = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useState({
    name: '',
    status: undefined,
    dateRange: null
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });



  // 表格列定义
  const columns = [
    {
      title: '厂商名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true
    },
    {
      title: '厂商编码',
      dataIndex: 'code',
      key: 'code',
      width: 120
    },
    {
      title: '联系人',
      dataIndex: 'contact',
      key: 'contact',
      width: 100
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 130
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 180,
      ellipsis: true
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

          <Popconfirm
            title="确定要删除这个厂商吗？"
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

  // 初始化数据
  useEffect(() => {
    fetchData();
  }, []);

  // 获取数据
  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const requestParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        name: searchParams.name,
        status: searchParams.status,
        ...params
      };

      // 处理日期范围
      if (searchParams.dateRange && searchParams.dateRange.length === 2) {
        requestParams.startDate = searchParams.dateRange[0].format('YYYY-MM-DD');
        requestParams.endDate = searchParams.dateRange[1].format('YYYY-MM-DD');
      }

      const response = await getManufacturerList(requestParams);

      if (response.success) {
        setDataSource(response.data.list);
        setPagination(prev => ({
          ...prev,
          total: response.data.total,
          current: response.data.page
        }));
      } else {
        message.error(response.message || '获取数据失败');
      }
    } catch (error) {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 搜索
  const handleSearch = () => {
    // 这里实现搜索逻辑
    console.log('搜索参数:', searchParams);
    fetchData();
  };

  // 重置搜索
  const handleReset = () => {
    setSearchParams({
      name: '',
      status: undefined,
      dateRange: null
    });
    fetchData();
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
      const response = await deleteManufacturer(id);
      if (response.success) {
        message.success(response.message);
        fetchData();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 保存
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      let response;
      if (editingRecord) {
        response = await updateManufacturer(editingRecord.id, values);
      } else {
        response = await createManufacturer(values);
      }

      if (response.success) {
        message.success(response.message);
        setIsModalVisible(false);
        fetchData();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      if (error.errorFields) {
        // 表单验证失败
        console.error('表单验证失败:', error);
      } else {
        message.error('操作失败');
      }
    }
  };

  // 导出
  const handleExport = async () => {
    try {
      const response = await exportManufacturerData(searchParams);
      if (response.success) {
        message.success(response.message);
        // 这里可以实现真实的文件下载逻辑
        console.log('下载链接:', response.data.downloadUrl);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('导出失败');
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
            <Col span={6}>
              <Search
                placeholder="请输入厂商名称"
                value={searchParams.name}
                onChange={(e) => setSearchParams({...searchParams, name: e.target.value})}
                onSearch={handleSearch}
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="请选择状态"
                value={searchParams.status}
                onChange={(value) => setSearchParams({...searchParams, status: value})}
                style={{ width: '100%' }}
                allowClear
              >
                <Option value="active">启用</Option>
                <Option value="inactive">禁用</Option>
              </Select>
            </Col>
            <Col span={6}>
              <RangePicker
                placeholder={['开始日期', '结束日期']}
                value={searchParams.dateRange}
                onChange={(dates) => setSearchParams({...searchParams, dateRange: dates})}
                style={{ width: '100%' }}
              />
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
            厂商列表
          </span>
        }
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增厂商
            </Button>
            <Button icon={<ExportOutlined />} onClick={handleExport}>
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
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({ ...prev, current: page, pageSize }));
              fetchData({ page, pageSize });
            },
            onShowSizeChange: (current, size) => {
              setPagination(prev => ({ ...prev, current: 1, pageSize: size }));
              fetchData({ page: 1, pageSize: size });
            }
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingRecord ? '编辑厂商' : '新增厂商'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'active'
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="厂商名称"
                name="name"
                rules={[{ required: true, message: '请输入厂商名称' }]}
              >
                <Input placeholder="请输入厂商名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="厂商编码"
                name="code"
                rules={[{ required: true, message: '请输入厂商编码' }]}
              >
                <Input placeholder="请输入厂商编码" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="联系人"
                name="contact"
              >
                <Input placeholder="请输入联系人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="联系电话"
                name="phone"
                rules={[
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
                ]}
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { type: 'email', message: '请输入正确的邮箱格式' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            label="地址"
            name="address"
          >
            <Input placeholder="请输入地址" />
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

          <Form.Item
            label="描述"
            name="description"
          >
            <Input.TextArea rows={3} placeholder="请输入描述信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DeviceManufacturer;
