import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Tag,
  Tooltip,
  Row,
  Col,
  Divider,
  Typography,
  Alert,
  DatePicker
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  ExportOutlined,
  EyeOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './index.module.css';
import {
  getThingModelList,
  createThingModel,
  updateThingModel,
  deleteThingModel,
  exportThingModel
} from '../../../services/thingModelManagement';
import { getProductList } from '../../../services/productManagement';
import ThingModelEditor from './components/ThingModelEditor';

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text } = Typography;

const ThingModelManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [currentModel, setCurrentModel] = useState(null);
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
  const [productOptions, setProductOptions] = useState([]);
  const [isAssociatedProductsModalVisible, setIsAssociatedProductsModalVisible] = useState(false);
  const [associatedProductsLoading, setAssociatedProductsLoading] = useState(false);
  const [currentAssociatedProducts, setCurrentAssociatedProducts] = useState([]);
  const [currentThingModelName, setCurrentThingModelName] = useState('');

  // 获取产品选项
  const fetchProductOptions = async () => {
    try {
      const response = await getProductList({ page: 1, pageSize: 1000 });
      if (response.success) {
        const options = response.data.list
          .filter(product => !product.thingModelId) // 只显示未关联物模型的产品
          .map(product => ({
            value: product.id,
            label: product.name,
            code: product.code
          }));
        setProductOptions(options);
      }
    } catch (error) {
      console.error('获取产品选项失败:', error);
    }
  };

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

      const response = await getThingModelList(requestParams);

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
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchData({ page: 1 });
  };

  // 重置搜索
  const handleReset = () => {
    setSearchParams({
      name: '',
      status: undefined,
      dateRange: null
    });
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchData({ page: 1 });
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

  // 查看详情/编辑模型
  const handleViewDetail = (record) => {
    setCurrentModel(record);
    setIsEditorVisible(true);
  };

  // 删除
  const handleDelete = async (id) => {
    try {
      const response = await deleteThingModel(id);
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
        response = await updateThingModel(editingRecord.id, values);
      } else {
        response = await createThingModel(values);
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
        console.error('表单验证失败:', error);
      } else {
        message.error('保存失败');
      }
    }
  };

  // 导出物模型
  const handleExport = async (record) => {
    try {
      const response = await exportThingModel(record.id);
      if (response.success) {
        // 创建下载链接
        const blob = new Blob([JSON.stringify(response.data, null, 2)], {
          type: 'application/json'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${record.name}_thing_model.json`;
        link.click();
        window.URL.revokeObjectURL(url);
        message.success('物模型导出成功');
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('导出失败');
    }
  };
  // 查看关联产品
  const handleViewAssociatedProducts = async (record) => {
    try {
      setCurrentThingModelName(record.name);
      setIsAssociatedProductsModalVisible(true);
      setAssociatedProductsLoading(true);

      // 获取关联产品的详细信息
      const response = await getProductList({ page: 1, pageSize: 1000 });
      if (response.success) {
        // 筛选出使用该物模型的产品
        const associatedProducts = response.data.list.filter(product =>
          product.thingModelId === record.id
        );

        console.log('🔍 [ThingModel] 获取关联产品:', {
          thingModelId: record.id,
          thingModelName: record.name,
          associatedProductsCount: associatedProducts.length,
          associatedProducts: associatedProducts.map(p => ({
            id: p.id,
            name: p.name,
            code: p.code,
            deviceType: p.deviceType
          }))
        });

        setCurrentAssociatedProducts(associatedProducts);
      } else {
        message.error('获取关联产品失败');
        setCurrentAssociatedProducts([]);
      }
    } catch (error) {
      console.error('获取关联产品失败:', error);
      message.error('获取关联产品失败');
      setCurrentAssociatedProducts([]);
    } finally {
      setAssociatedProductsLoading(false);
    }
  };





  // 表格列定义
  const columns = [
    {
      title: '物模型名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.code}</div>
        </div>
      )
    },

    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 80,
      render: (version) => <Tag color="blue">v{version}</Tag>
    },
    {
      title: '属性数量',
      key: 'propertyCount',
      width: 100,
      render: (_, record) => (
        <Space>
          <Text type="secondary">{record.properties?.length || 0}个</Text>
        </Space>
      )
    },
    {
      title: '事件数量',
      key: 'eventCount',
      width: 100,
      render: (_, record) => (
        <Space>
          <Text type="secondary">{record.events?.length || 0}个</Text>
        </Space>
      )
    },
    {
      title: '服务数量',
      key: 'serviceCount',
      width: 100,
      render: (_, record) => (
        <Space>
          <Text type="secondary">{record.services?.length || 0}个</Text>
        </Space>
      )
    },
    {
      title: '产品数',
      key: 'productCount',
      width: 100,
      render: (_, record) => {
        const count = record.associatedProductCount || 0;

        return (
          <Button
            type="link"
            size="small"
            style={{
              padding: 0,
              height: 'auto',
              color: count > 0 ? '#1890ff' : '#999',
              cursor: count > 0 ? 'pointer' : 'default'
            }}
            onClick={() => count > 0 && handleViewAssociatedProducts(record)}
            disabled={count === 0}
          >
            {count}个
          </Button>
        );
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => {
        const statusMap = {
          active: { color: 'green', text: '启用' },
          inactive: { color: 'red', text: '禁用' },
          draft: { color: 'orange', text: '草稿' }
        };
        const config = statusMap[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 150,
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
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

          <Tooltip title="编辑">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>

          <Tooltip title="导出">
            <Button
              size="small"
              icon={<ExportOutlined />}
              onClick={() => handleExport(record)}
            />
          </Tooltip>

          <Popconfirm
            title="确定要删除这个物模型吗？"
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

  // 分页变化处理
  const handleTableChange = (paginationConfig) => {
    setPagination(paginationConfig);
    fetchData({
      page: paginationConfig.current,
      pageSize: paginationConfig.pageSize
    });
  };

  useEffect(() => {
    fetchData();
    fetchProductOptions();
  }, []);

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
        extra={
          <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
            💡 物模型定义了设备的数据结构和接口规范
          </span>
        }
      >
        <div className={styles.searchArea}>
          <Row gutter={16}>
            <Col span={6}>
              <Search
                placeholder="请输入物模型名称或编码"
                value={searchParams.name}
                onChange={(e) => setSearchParams({...searchParams, name: e.target.value})}
                onSearch={handleSearch}
                allowClear
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
                <Option value="draft">草稿</Option>
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
            <Col span={4}>
              <div style={{ textAlign: 'right', color: '#8c8c8c', fontSize: '12px' }}>
                共 {dataSource.length} 个物模型
              </div>
            </Col>
          </Row>
        </div>
      </Card>

      {/* 列表区域 */}
      <Card
        className={styles.tableCard}
        title={
          <span className={styles.cardTitle}>
            <SettingOutlined style={{ marginRight: 8 }} />
            物模型列表
          </span>
        }
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增物模型
            </Button>
          </Space>
        }
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
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingRecord ? '编辑物模型' : '新增物模型'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Alert
          message="物模型基本信息"
          description="定义物模型的基本信息，创建后可进入详情页配置具体的属性、事件和服务。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="物模型名称"
                name="name"
                rules={[{ required: true, message: '请输入物模型名称' }]}
              >
                <Input placeholder="如：智能摄像头物模型" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="物模型编码"
                name="code"
                rules={[
                  { required: true, message: '请输入物模型编码' },
                  { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '编码必须以字母开头，只能包含字母、数字和下划线' }
                ]}
              >
                <Input placeholder="如：smart_camera_model" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="关联产品"
                name="productId"
                tooltip="选择要关联的产品，一个物模型只能关联一个产品"
              >
                <Select
                  placeholder="请选择产品（可选）"
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {productOptions.map(product => (
                    <Option key={product.value} value={product.value}>
                      <div>
                        <div>{product.label}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{product.code}</div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="版本号"
                name="version"
                rules={[{ required: true, message: '请输入版本号' }]}
                initialValue="1.0.0"
              >
                <Input placeholder="如：1.0.0" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="描述"
            name="description"
          >
            <Input.TextArea
              rows={3}
              placeholder="请输入物模型的详细描述..."
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
            initialValue="draft"
          >
            <Select placeholder="请选择状态">
              <Option value="draft">草稿</Option>
              <Option value="active">启用</Option>
              <Option value="inactive">禁用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 物模型编辑器 */}
      <ThingModelEditor
        visible={isEditorVisible}
        model={currentModel}
        onCancel={() => setIsEditorVisible(false)}
        onSave={(updatedModel) => {
          setIsEditorVisible(false);
          fetchData();
          message.success('物模型保存成功');
        }}
      />

      {/* 关联产品弹窗 */}
      <Modal
        title={`${currentThingModelName} - 关联产品`}
        open={isAssociatedProductsModalVisible}
        onCancel={() => setIsAssociatedProductsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsAssociatedProductsModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
        destroyOnClose
      >
        <div style={{ minHeight: '300px' }}>
          {associatedProductsLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div>正在加载关联产品...</div>
            </div>
          ) : currentAssociatedProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>暂无关联产品</div>
              <div style={{ fontSize: '14px' }}>该物模型尚未被任何产品使用</div>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '16px', color: '#666' }}>
                共找到 <strong>{currentAssociatedProducts.length}</strong> 个关联产品
              </div>
              <Table
                dataSource={currentAssociatedProducts}
                rowKey="id"
                pagination={false}
                size="small"
                columns={[
                  {
                    title: '产品名称',
                    dataIndex: 'name',
                    key: 'name',
                    width: 200,
                    ellipsis: true,
                    render: (text, record) => (
                      <div>
                        <div style={{ fontWeight: 500 }}>{text}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{record.code}</div>
                      </div>
                    )
                  },
                  {
                    title: '设备类型',
                    dataIndex: 'deviceTypeName',
                    key: 'deviceTypeName',
                    width: 120,
                    render: (text, record) => (
                      <Tag color="blue">{text || record.deviceType}</Tag>
                    )
                  },
                  {
                    title: '产品状态',
                    dataIndex: 'status',
                    key: 'status',
                    width: 100,
                    render: (status) => {
                      const statusMap = {
                        active: { color: 'green', text: '启用' },
                        inactive: { color: 'red', text: '禁用' },
                        development: { color: 'orange', text: '开发中' },
                        deprecated: { color: 'default', text: '已废弃' }
                      };
                      const config = statusMap[status] || { color: 'default', text: status };
                      return <Tag color={config.color}>{config.text}</Tag>;
                    }
                  },
                  {
                    title: '关联设备数',
                    key: 'linkedDevicesCount',
                    width: 120,
                    render: (_, record) => (
                      <span>{record.linkedDevices?.length || 0}个</span>
                    )
                  },
                  {
                    title: '创建时间',
                    dataIndex: 'createTime',
                    key: 'createTime',
                    width: 150,
                    ellipsis: true
                  }
                ]}
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ThingModelManagement;
