import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Tooltip,
  Badge,
  Tabs,
  List,
  Typography
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  ExportOutlined,
  AppstoreOutlined,
  EyeOutlined,
  SettingOutlined,
  NodeIndexOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import styles from './index.module.css';
import {
  getProductList,
  getProductDetail,
  createProduct,
  updateProduct,
  deleteProduct,
  exportProductData,
  productStatuses,
  deviceTypes
} from '../../../services/productManagement';
import { getThingModelOptions } from '../../../services/thingModelManagement';
import { verifyBidirectionalSync } from '../../../utils/dataConsistencyChecker';
import SubDeviceManager from '../../../components/SubDeviceManager';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Text, Title } = Typography;

const ProductManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubDeviceManagerVisible, setIsSubDeviceManagerVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useState({
    name: '',
    deviceType: undefined,
    status: undefined
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [thingModelOptions, setThingModelOptions] = useState([]);

  // 获取物模型选项
  const fetchThingModelOptions = async () => {
    try {
      const response = await getThingModelOptions();
      if (response.success) {
        setThingModelOptions(response.data);
      }
    } catch (error) {
      console.error('获取物模型选项失败:', error);
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
      render: (text, record) => (
        <div className={styles.productNameCell}>
          <span className={styles.productName}>{text}</span>
          <div className={styles.productCode}>{record.code}</div>
        </div>
      )
    },
    {
      title: '设备类型',
      dataIndex: 'deviceTypeName',
      key: 'deviceType',
      width: 120,
      render: (text, record) => (
        <Tag color="blue">{text}</Tag>
      )
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 100,
      render: (text) => (
        <Tag color="green">{text}</Tag>
      )
    },
    {
      title: '物模型',
      key: 'thingModel',
      width: 150,
      render: (_, record) => {
        if (record.thingModelId) {
          const thingModel = thingModelOptions.find(tm => tm.value === record.thingModelId);
          return thingModel ? (
            <div>
              <div style={{ fontWeight: 500, fontSize: '12px' }}>{thingModel.label}</div>
              <div style={{ color: '#666', fontSize: '11px' }}>v{thingModel.version}</div>
            </div>
          ) : (
            <Tag color="orange">未知模型</Tag>
          );
        }
        return <Tag color="default">未关联</Tag>;
      }
    },
    {
      title: '关联设备数量',
      key: 'linkedDeviceCount',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Badge
          count={record.linkedDevices?.length || 0}
          style={{ backgroundColor: '#1890ff' }}
        />
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusConfig = productStatuses.find(s => s.value === status);
        return (
          <Badge
            status={statusConfig?.color || 'default'}
            text={statusConfig?.label || status}
          />
        );
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
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

          <Tooltip title="编辑">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>

          <Tooltip title="子设备管理">
            <Button
              size="small"
              icon={<NodeIndexOutlined />}
              onClick={() => handleManageSubDevices(record)}
            />
          </Tooltip>

          <Popconfirm
            title="确定要删除这个模板吗？"
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

  // 获取数据
  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const response = await getProductList({
        ...searchParams,
        ...params,
        page: pagination.current,
        pageSize: pagination.pageSize
      });
      
      if (response.success) {
        console.log('📋 [ProductList] 获取产品列表数据:', {
          totalCount: response.data.list.length,
          products: response.data.list.map(p => ({
            id: p.id,
            name: p.name,
            linkedDevicesCount: p.linkedDevices?.length || 0,
            hasLinkedDevices: !!p.linkedDevices
          }))
        });
        setDataSource(response.data.list);
        setPagination(prev => ({
          ...prev,
          total: response.data.total
        }));
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    fetchData();
    fetchThingModelOptions();
  }, []);

  // 搜索
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchData({ page: 1 });
  };

  // 重置搜索
  const handleReset = () => {
    setSearchParams({
      name: '',
      deviceType: undefined,
      status: undefined
    });
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchData({ page: 1 });
  };

  // 新增
  const handleAdd = () => {
    setEditingRecord(null);
    setIsModalVisible(true);
    form.resetFields();
    form.setFieldsValue({
      status: 'active',
      version: 'v1.0.0'
    });
  };

  // 编辑
  const handleEdit = (record) => {
    setEditingRecord(record);
    setIsModalVisible(true);
    form.setFieldsValue(record);
  };

  // 查看详情 - 跳转到详情页面
  const handleViewDetail = (record) => {
    navigate(`/device/product/detail/${record.id}`);
  };

  // 子设备管理
  const handleManageSubDevices = async (record) => {
    try {
      console.log('🔍 [ProductList] 获取产品详情用于子设备管理:', {
        productId: record.id,
        productName: record.name,
        listLinkedDevicesCount: record.linkedDevices?.length || 0
      });

      // 获取完整的产品详情数据
      const response = await getProductDetail(record.id);
      if (response.success) {
        console.log('✅ [ProductList] 产品详情获取成功:', {
          productName: response.data.name,
          detailLinkedDevicesCount: response.data.linkedDevices?.length || 0,
          linkedDevices: response.data.linkedDevices
        });
        setCurrentProduct(response.data);
        setIsSubDeviceManagerVisible(true);
      } else {
        message.error('获取模板详情失败');
      }
    } catch (error) {
      console.error('获取模板详情失败:', error);
      message.error('获取模板详情失败');
    }
  };

  // 保存子设备更新
  const handleSaveSubDevices = async (updatedProductData) => {
    try {
      console.log('🔄 [子设备管理] 开始保存子设备更新:', {
        productId: updatedProductData.id,
        productName: updatedProductData.name,
        originalLinkedDevices: currentProduct?.linkedDevices?.length || 0,
        newLinkedDevices: updatedProductData.linkedDevices.length
      });

      // 获取原有的模板数据以比较变化
      const originalProduct = currentProduct;
      const originalLinkedDeviceIds = (originalProduct?.linkedDevices || []).map(d => d.id);
      const newLinkedDeviceIds = updatedProductData.linkedDevices.map(d => d.id);

      console.log('🔍 [子设备管理] 设备关联变化分析:', {
        originalDeviceIds: originalLinkedDeviceIds,
        newDeviceIds: newLinkedDeviceIds,
        addedDevices: newLinkedDeviceIds.filter(id => !originalLinkedDeviceIds.includes(id)),
        removedDevices: originalLinkedDeviceIds.filter(id => !newLinkedDeviceIds.includes(id))
      });

      // 1. 先更新模板数据
      const response = await updateProduct(updatedProductData.id, updatedProductData);
      if (!response.success) {
        message.error(response.message);
        return;
      }

      console.log('✅ [子设备管理] 模板数据更新成功');

      // 2. 同步更新设备的模板关联信息
      const { updateDevice, getDeviceList } = await import('../../../services/deviceManagement');

      // 获取当前所有设备数据，确保我们有最新的设备信息
      const deviceListResponse = await getDeviceList({ page: 1, pageSize: 1000 });
      const allDevices = deviceListResponse.success ? deviceListResponse.data.list : [];

      // 3. 为新关联的设备设置模板信息
      const addedDeviceIds = newLinkedDeviceIds.filter(id => !originalLinkedDeviceIds.includes(id));
      for (const deviceId of addedDeviceIds) {
        try {
          const device = allDevices.find(d => d.id === deviceId) ||
                         updatedProductData.linkedDevices.find(d => d.id === deviceId);

          if (device) {
            const updateResult = await updateDevice(deviceId, {
              ...device,
              productId: updatedProductData.id,
              productName: updatedProductData.name,
              productCode: updatedProductData.code
            });

            if (updateResult.success) {
              console.log('✅ [子设备管理] 已为设备设置模板关联:', {
                deviceId,
                deviceName: device.name,
                productId: updatedProductData.id,
                productName: updatedProductData.name
              });
            } else {
              console.error('❌ [子设备管理] 设备模板关联设置失败:', updateResult.message);
            }
          }
        } catch (deviceUpdateError) {
          console.error('❌ [子设备管理] 设备模板信息更新异常:', {
            deviceId,
            error: deviceUpdateError
          });
        }
      }

      // 4. 为移除关联的设备清除模板信息
      const removedDeviceIds = originalLinkedDeviceIds.filter(id => !newLinkedDeviceIds.includes(id));
      console.log('🗑️ [子设备管理] 准备清除设备模板关联:', {
        removedDeviceIds,
        removedCount: removedDeviceIds.length
      });

      for (const deviceId of removedDeviceIds) {
        try {
          // 从原模板数据或当前设备列表中获取设备信息
          const removedDevice = originalProduct.linkedDevices.find(d => d.id === deviceId) ||
                               allDevices.find(d => d.id === deviceId);

          if (removedDevice) {
            console.log('🔄 [子设备管理] 正在清除设备模板关联:', {
              deviceId,
              deviceName: removedDevice.name,
              currentProductId: removedDevice.productId
            });

            const updateResult = await updateDevice(deviceId, {
              ...removedDevice,
              productId: null,
              productName: null,
              productCode: null
            });

            if (updateResult.success) {
              console.log('✅ [子设备管理] 已清除设备的模板关联信息:', {
                deviceId,
                deviceName: removedDevice.name,
                updatedDevice: updateResult.data
              });
            } else {
              console.error('❌ [子设备管理] 清除设备模板关联失败:', updateResult.message);
              message.warning(`清除设备 "${removedDevice.name}" 的模板关联失败: ${updateResult.message}`);
            }
          } else {
            console.warn('⚠️ [子设备管理] 未找到要移除关联的设备:', { deviceId });
          }
        } catch (deviceUpdateError) {
          console.error('❌ [子设备管理] 清除设备模板信息异常:', {
            deviceId,
            error: deviceUpdateError
          });
          message.error(`清除设备关联时发生异常: ${deviceUpdateError.message}`);
        }
      }

      // 5. 验证双向数据同步
      console.log('🔍 [子设备管理] 开始验证双向数据同步...');
      let syncVerificationPassed = true;

      // 验证新关联的设备
      for (const deviceId of addedDeviceIds) {
        const verifyResult = await verifyBidirectionalSync(deviceId, updatedProductData.id, 'associate');
        if (!verifyResult.success) {
          console.warn('⚠️ [子设备管理] 设备关联同步验证失败:', {
            deviceId,
            issues: verifyResult.issues
          });
          syncVerificationPassed = false;
        }
      }

      // 验证移除关联的设备
      for (const deviceId of removedDeviceIds) {
        const verifyResult = await verifyBidirectionalSync(deviceId, null, 'disassociate');
        if (!verifyResult.success) {
          console.warn('⚠️ [子设备管理] 设备取消关联同步验证失败:', {
            deviceId,
            issues: verifyResult.issues
          });
          syncVerificationPassed = false;
        }
      }

      if (syncVerificationPassed) {
        console.log('✅ [子设备管理] 双向数据同步验证通过');
      } else {
        console.warn('⚠️ [子设备管理] 双向数据同步验证存在问题，建议运行数据一致性检查');
      }

      message.success(`子设备更新成功！${addedDeviceIds.length > 0 ? `新增关联 ${addedDeviceIds.length} 个设备，` : ''}${removedDeviceIds.length > 0 ? `移除关联 ${removedDeviceIds.length} 个设备` : ''}`);
      setIsSubDeviceManagerVisible(false);
      fetchData(); // 刷新模板列表

      console.log('✅ [子设备管理] 子设备更新完成');

    } catch (error) {
      console.error('❌ [子设备管理] 更新失败:', error);
      message.error(`更新失败: ${error.message}`);
    }
  };

  // 删除
  const handleDelete = async (id) => {
    try {
      const response = await deleteProduct(id);
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
        response = await updateProduct(editingRecord.id, values);
      } else {
        response = await createProduct(values);
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
        message.error('操作失败');
      }
    }
  };

  // 导出
  const handleExport = async () => {
    try {
      const response = await exportProductData(searchParams);
      if (response.success) {
        message.success(response.message);
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
                placeholder="请输入模板名称"
                value={searchParams.name}
                onChange={(e) => setSearchParams(prev => ({ ...prev, name: e.target.value }))}
                onSearch={handleSearch}
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="请选择状态"
                value={searchParams.status}
                onChange={(value) => setSearchParams(prev => ({ ...prev, status: value }))}
                style={{ width: '100%' }}
                allowClear
              >
                {productStatuses.map(status => (
                  <Option key={status.value} value={status.value}>
                    {status.label}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={6}>
              <Select
                placeholder="请选择设备类型"
                value={searchParams.deviceType}
                onChange={(value) => setSearchParams(prev => ({ ...prev, deviceType: value }))}
                style={{ width: '100%' }}
                allowClear
              >
                {deviceTypes.map(type => (
                  <Option key={type.value} value={type.value}>
                    {type.label}
                  </Option>
                ))}
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
            模板列表
          </span>
        }
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增模板
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
        title={editingRecord ? '编辑模板' : '新增模板'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'active',
            version: 'v1.0.0'
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="模板名称"
                name="name"
                rules={[{ required: true, message: '请输入模板名称' }]}
              >
                <Input placeholder="请输入模板名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="模板编码"
                name="code"
                rules={[{ required: true, message: '请输入模板编码' }]}
              >
                <Input placeholder="请输入模板编码" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
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
            <Col span={12}>
              <Form.Item
                label="模板状态"
                name="status"
                rules={[{ required: true, message: '请选择模板状态' }]}
              >
                <Select placeholder="请选择模板状态">
                  {productStatuses.map(status => (
                    <Option key={status.value} value={status.value}>
                      {status.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="模板版本"
                name="version"
                rules={[{ required: true, message: '请输入模板版本' }]}
              >
                <Input placeholder="请输入模板版本，如：v1.0.0" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="关联物模型"
                name="thingModelId"
                tooltip="选择与此模板对应的物模型，用于统一数据格式和接口规范"
              >
                <Select
                  placeholder="请选择物模型（可选）"
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {thingModelOptions.map(model => (
                    <Option key={model.value} value={model.value}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '4px 0',
                        width: '100%'
                      }}>
                        <span style={{
                          flex: 1,
                          minWidth: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontWeight: '500'
                        }}>
                          {model.label}
                        </span>
                        <span style={{
                          fontSize: '12px',
                          color: '#8c8c8c',
                          whiteSpace: 'nowrap'
                        }}>
                          {model.code} - v{model.version}
                        </span>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="模板描述"
            name="description"
          >
            <TextArea rows={4} placeholder="请输入模板描述" />
          </Form.Item>
        </Form>
      </Modal>



      {/* 子设备管理组件 */}
      <SubDeviceManager
        visible={isSubDeviceManagerVisible}
        onCancel={() => setIsSubDeviceManagerVisible(false)}
        onSave={handleSaveSubDevices}
        productData={currentProduct}
        title={`${currentProduct?.name} - 子设备管理`}
      />
    </div>
  );
};

export default ProductManagement;
