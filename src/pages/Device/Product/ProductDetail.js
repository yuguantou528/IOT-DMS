import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Tabs,
  Descriptions,
  Badge,
  Button,
  Space,
  message,
  Spin,
  Divider,
  List,
  Typography,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  SettingOutlined,
  NodeIndexOutlined,
  InfoCircleOutlined,
  AppstoreOutlined,
  ExportOutlined
} from '@ant-design/icons';
import styles from './ProductDetail.module.css';
import {
  getProductDetail,
  updateProduct,
  productStatuses
} from '../../../services/productManagement';
import { verifyBidirectionalSync } from '../../../utils/dataConsistencyChecker';
import {
  getThingModelOptions,
  getThingModelDetail,
  exportThingModel
} from '../../../services/thingModelManagement';
import SubDeviceManager from '../../../components/SubDeviceManager';

const { TabPane } = Tabs;
const { Text, Title } = Typography;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [isSubDeviceManagerVisible, setIsSubDeviceManagerVisible] = useState(false);
  const [thingModelOptions, setThingModelOptions] = useState([]);
  const [currentThingModel, setCurrentThingModel] = useState(null);
  const [thingModelLoading, setThingModelLoading] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();

  // 获取产品详情
  useEffect(() => {
    fetchProductDetail();
    fetchThingModelOptions();
  }, [id]);

  // 当产品数据更新时，获取物模型详情
  useEffect(() => {
    if (product) {
      fetchCurrentThingModel();
    }
  }, [product?.thingModelId]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const response = await getProductDetail(id);
      if (response.success) {
        console.log('📄 [ProductDetail] 获取产品详情数据:', {
          productId: response.data.id,
          productName: response.data.name,
          linkedDevicesCount: response.data.linkedDevices?.length || 0,
          linkedDevices: response.data.linkedDevices
        });
        setProduct(response.data);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('获取产品详情失败');
    } finally {
      setLoading(false);
    }
  };

  // 返回列表
  const handleBack = () => {
    navigate('/device/product');
  };

  // 编辑产品
  const handleEdit = () => {
    setIsEditModalVisible(true);
    editForm.setFieldsValue(product);
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    try {
      const values = await editForm.validateFields();
      const response = await updateProduct(product.id, values);

      if (response.success) {
        message.success('产品更新成功');
        setIsEditModalVisible(false);
        setProduct({ ...product, ...values });
      } else {
        message.error(response.message);
      }
    } catch (error) {
      if (error.errorFields) {
        console.error('表单验证失败:', error);
      } else {
        message.error('更新失败');
      }
    }
  };

  // 获取物模型选项
  const fetchThingModelOptions = async () => {
    try {
      const response = await getThingModelOptions();
      if (response.success) {
        // 过滤掉已被其他产品关联的物模型（除了当前产品）
        const availableModels = response.data.filter(model =>
          !model.productId || model.productId === parseInt(id)
        );
        setThingModelOptions(availableModels);
      }
    } catch (error) {
      console.error('获取物模型选项失败:', error);
    }
  };

  // 获取当前产品的物模型详情
  const fetchCurrentThingModel = async () => {
    if (!product?.thingModelId) {
      setCurrentThingModel(null);
      return;
    }

    try {
      setThingModelLoading(true);
      const response = await getThingModelDetail(product.thingModelId);
      if (response.success) {
        setCurrentThingModel(response.data);
      }
    } catch (error) {
      console.error('获取物模型详情失败:', error);
    } finally {
      setThingModelLoading(false);
    }
  };

  // 关联物模型
  const handleAssociateThingModel = async (thingModelId) => {
    try {
      const response = await updateProduct(product.id, {
        ...product,
        thingModelId
      });

      if (response.success) {
        message.success('物模型关联成功');
        setProduct(prev => ({ ...prev, thingModelId }));
        fetchCurrentThingModel();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('关联失败');
    }
  };

  // 解除物模型关联
  const handleDisassociateThingModel = async () => {
    try {
      const response = await updateProduct(product.id, {
        ...product,
        thingModelId: null
      });

      if (response.success) {
        message.success('已解除物模型关联');
        setProduct(prev => ({ ...prev, thingModelId: null }));
        setCurrentThingModel(null);
        fetchThingModelOptions(); // 重新获取可用选项
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('解除关联失败');
    }
  };

  // 导出物模型JSON
  const handleExportThingModel = async () => {
    if (!currentThingModel) return;

    try {
      const response = await exportThingModel(currentThingModel.id);
      if (response.success) {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], {
          type: 'application/json'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${currentThingModel.name}_thing_model.json`;
        link.click();
        window.URL.revokeObjectURL(url);
        message.success('物模型导出成功');
      }
    } catch (error) {
      message.error('导出失败');
    }
  };

  // 管理子设备
  const handleManageSubDevices = () => {
    setIsSubDeviceManagerVisible(true);
  };

  // 保存关联设备更新
  const handleSaveSubDevices = async (updatedProductData) => {
    try {
      console.log('🔄 [ProductDetail] 开始保存子设备更新:', {
        productId: updatedProductData.id,
        productName: updatedProductData.name,
        originalLinkedDevices: product?.linkedDevices?.length || 0,
        newLinkedDevices: updatedProductData.linkedDevices.length
      });

      // 获取原有的产品数据以比较变化
      const originalProduct = product;
      const originalLinkedDeviceIds = (originalProduct?.linkedDevices || []).map(d => d.id);
      const newLinkedDeviceIds = updatedProductData.linkedDevices.map(d => d.id);

      console.log('🔍 [ProductDetail] 设备关联变化分析:', {
        originalDeviceIds: originalLinkedDeviceIds,
        newDeviceIds: newLinkedDeviceIds,
        addedDevices: newLinkedDeviceIds.filter(id => !originalLinkedDeviceIds.includes(id)),
        removedDevices: originalLinkedDeviceIds.filter(id => !newLinkedDeviceIds.includes(id))
      });

      // 1. 先更新产品数据
      const response = await updateProduct(updatedProductData.id, updatedProductData);
      if (!response.success) {
        message.error(response.message || '更新失败');
        return;
      }

      console.log('✅ [ProductDetail] 产品数据更新成功');

      // 2. 同步更新设备的产品关联信息
      const { updateDevice, getDeviceList } = await import('../../../services/deviceManagement');

      // 获取当前所有设备数据，确保我们有最新的设备信息
      const deviceListResponse = await getDeviceList({ page: 1, pageSize: 1000 });
      const allDevices = deviceListResponse.success ? deviceListResponse.data.list : [];

      // 3. 为新关联的设备设置产品信息
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
              console.log('✅ [ProductDetail] 已为设备设置产品关联:', {
                deviceId,
                deviceName: device.name,
                productId: updatedProductData.id,
                productName: updatedProductData.name
              });
            } else {
              console.error('❌ [ProductDetail] 设备产品关联设置失败:', updateResult.message);
            }
          }
        } catch (deviceUpdateError) {
          console.error('❌ [ProductDetail] 设备产品信息更新异常:', {
            deviceId,
            error: deviceUpdateError
          });
        }
      }

      // 4. 为移除关联的设备清除产品信息
      const removedDeviceIds = originalLinkedDeviceIds.filter(id => !newLinkedDeviceIds.includes(id));
      console.log('🗑️ [ProductDetail] 准备清除设备产品关联:', {
        removedDeviceIds,
        removedCount: removedDeviceIds.length
      });

      for (const deviceId of removedDeviceIds) {
        try {
          // 从原产品数据或当前设备列表中获取设备信息
          const removedDevice = originalProduct.linkedDevices.find(d => d.id === deviceId) ||
                               allDevices.find(d => d.id === deviceId);

          if (removedDevice) {
            console.log('🔄 [ProductDetail] 正在清除设备产品关联:', {
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
              console.log('✅ [ProductDetail] 已清除设备的产品关联信息:', {
                deviceId,
                deviceName: removedDevice.name,
                updatedDevice: updateResult.data
              });
            } else {
              console.error('❌ [ProductDetail] 清除设备产品关联失败:', updateResult.message);
              message.warning(`清除设备 "${removedDevice.name}" 的产品关联失败: ${updateResult.message}`);
            }
          } else {
            console.warn('⚠️ [ProductDetail] 未找到要移除关联的设备:', { deviceId });
          }
        } catch (deviceUpdateError) {
          console.error('❌ [ProductDetail] 清除设备产品信息异常:', {
            deviceId,
            error: deviceUpdateError
          });
          message.error(`清除设备关联时发生异常: ${deviceUpdateError.message}`);
        }
      }

      // 5. 验证双向数据同步
      console.log('🔍 [ProductDetail] 开始验证双向数据同步...');
      let syncVerificationPassed = true;

      // 验证新关联的设备
      for (const deviceId of addedDeviceIds) {
        const verifyResult = await verifyBidirectionalSync(deviceId, updatedProductData.id, 'associate');
        if (!verifyResult.success) {
          console.warn('⚠️ [ProductDetail] 设备关联同步验证失败:', {
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
          console.warn('⚠️ [ProductDetail] 设备取消关联同步验证失败:', {
            deviceId,
            issues: verifyResult.issues
          });
          syncVerificationPassed = false;
        }
      }

      if (syncVerificationPassed) {
        console.log('✅ [ProductDetail] 双向数据同步验证通过');
      } else {
        console.warn('⚠️ [ProductDetail] 双向数据同步验证存在问题，建议运行数据一致性检查');
      }

      message.success(`子设备更新成功！${addedDeviceIds.length > 0 ? `新增关联 ${addedDeviceIds.length} 个设备，` : ''}${removedDeviceIds.length > 0 ? `移除关联 ${removedDeviceIds.length} 个设备` : ''}`);
      setIsSubDeviceManagerVisible(false);
      fetchProductDetail(); // 刷新产品详情数据

      console.log('✅ [ProductDetail] 子设备更新完成');

    } catch (error) {
      console.error('❌ [ProductDetail] 更新失败:', error);
      message.error(`更新失败: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.errorContainer}>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <InfoCircleOutlined style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
            <p>产品不存在或已被删除</p>
            <Button type="primary" onClick={handleBack}>
              返回产品列表
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.productDetail}>
      {/* 页面头部 */}
      <Card className={styles.headerCard}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={handleBack}
              className={styles.backButton}
            >
              返回
            </Button>
            <div className={styles.titleSection}>
              <Title level={3} style={{ margin: 0 }}>
                {product.name}
              </Title>
              <div className={styles.subtitle}>
                <Text type="secondary">{product.code}</Text>
                <Divider type="vertical" />
                <Badge
                  status={productStatuses.find(s => s.value === product.status)?.color || 'default'}
                  text={productStatuses.find(s => s.value === product.status)?.label || product.status}
                />
              </div>
            </div>
          </div>
          <div className={styles.headerRight}>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEdit}
            >
              编辑产品
            </Button>
          </div>
        </div>
      </Card>

      {/* 详情内容 */}
      <Card className={styles.contentCard}>
        <Tabs defaultActiveKey="basic" type="card">
          <TabPane tab="基本信息" key="basic">
            <Descriptions title="基本信息" bordered column={2}>
              <Descriptions.Item label="产品名称" span={2}>{product.name}</Descriptions.Item>
              <Descriptions.Item label="产品编码">{product.code}</Descriptions.Item>
              <Descriptions.Item label="产品版本">{product.version}</Descriptions.Item>
              <Descriptions.Item label="设备类型">{product.deviceTypeName}</Descriptions.Item>
              <Descriptions.Item label="产品状态">
                <Badge
                  status={productStatuses.find(s => s.value === product.status)?.color || 'default'}
                  text={productStatuses.find(s => s.value === product.status)?.label || product.status}
                />
              </Descriptions.Item>
              <Descriptions.Item label="关联设备数量">
                <Badge
                  count={product.linkedDevices?.length || 0}
                  style={{ backgroundColor: '#1890ff' }}
                />
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">{product.createTime}</Descriptions.Item>
              <Descriptions.Item label="更新时间">{product.updateTime}</Descriptions.Item>
              <Descriptions.Item label="产品描述" span={2}>{product.description || '-'}</Descriptions.Item>
            </Descriptions>
          </TabPane>

          <TabPane tab={`子设备管理 (${product.linkedDevices?.length || 0})`} key="subDevices">
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Button
                  type="primary"
                  icon={<SettingOutlined />}
                  onClick={handleManageSubDevices}
                >
                  管理关联设备
                </Button>
                <Text type="secondary">管理产品的关联设备</Text>
              </Space>
            </div>

            {/* 关联设备列表 */}
            {product.linkedDevices && product.linkedDevices.length > 0 ? (
              <List
                dataSource={product.linkedDevices}
                renderItem={(device) => (
                  <List.Item style={{ background: '#f8f9fa', marginBottom: 12, borderRadius: 8, padding: 20 }}>
                    <List.Item.Meta
                      avatar={<NodeIndexOutlined style={{ fontSize: 28, color: '#1890ff' }} />}
                      title={
                        <div style={{ marginBottom: 8 }}>
                          <Text strong style={{ fontSize: 16 }}>{device.name}</Text>
                          <Tag color="blue" style={{ marginLeft: 12, fontSize: 12 }}>{device.deviceCode}</Tag>
                          <Badge
                            status={device.status === 'online' ? 'success' : 'default'}
                            text={device.status === 'online' ? '在线' : '离线'}
                            style={{ marginLeft: 12 }}
                          />
                        </div>
                      }
                      description={
                        <div style={{ fontSize: 14, lineHeight: '1.6' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px 24px' }}>
                            <div><Text type="secondary">厂商：</Text><Text>{device.manufacturerName}</Text></div>
                            <div><Text type="secondary">型号：</Text><Text>{device.modelName}</Text></div>
                            <div><Text type="secondary">位置：</Text><Text>{device.location}</Text></div>
                            <div><Text type="secondary">IP地址：</Text><Text>{device.ipAddress}:{device.port}</Text></div>
                            <div><Text type="secondary">设备类型：</Text><Text>{device.deviceTypeName || device.deviceType}</Text></div>
                            <div><Text type="secondary">序列号：</Text><Text>{device.serialNumber}</Text></div>
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#8c8c8c' }}>
                <NodeIndexOutlined style={{ fontSize: 64, marginBottom: 16, color: '#d9d9d9' }} />
                <p style={{ fontSize: 16, marginBottom: 8 }}>暂无关联设备</p>
                <p style={{ fontSize: 14 }}>点击上方"管理关联设备"按钮添加设备</p>
              </div>
            )}
          </TabPane>

          <TabPane tab={
            <span>
              <SettingOutlined />
              物模型 {currentThingModel ? '(已关联)' : '(未关联)'}
            </span>
          } key="thingModel">
            <Spin spinning={thingModelLoading}>
              {currentThingModel ? (
                // 已关联物模型的显示
                <div>
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <Title level={4} style={{ margin: 0 }}>当前关联的物模型</Title>
                      <Space>
                        <Button
                          type="primary"
                          onClick={handleExportThingModel}
                        >
                          导出JSON
                        </Button>
                        <Button
                          danger
                          onClick={handleDisassociateThingModel}
                        >
                          解除关联
                        </Button>
                      </Space>
                    </div>

                    <Descriptions bordered column={2}>
                      <Descriptions.Item label="物模型名称" span={2}>
                        <Text strong>{currentThingModel.name}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="物模型编码">
                        <Text code>{currentThingModel.code}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="版本">
                        <Tag color="blue">v{currentThingModel.version}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="状态">
                        <Badge
                          status={currentThingModel.status === 'active' ? 'success' : 'default'}
                          text={currentThingModel.status === 'active' ? '启用' : '禁用'}
                        />
                      </Descriptions.Item>
                      <Descriptions.Item label="属性数量">
                        <Text>{currentThingModel.properties?.length || 0} 个</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="事件数量">
                        <Text>{currentThingModel.events?.length || 0} 个</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="服务数量">
                        <Text>{currentThingModel.services?.length || 0} 个</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="创建时间">
                        {currentThingModel.createTime}
                      </Descriptions.Item>
                      <Descriptions.Item label="更新时间">
                        {currentThingModel.updateTime}
                      </Descriptions.Item>
                      <Descriptions.Item label="描述" span={2}>
                        {currentThingModel.description || '-'}
                      </Descriptions.Item>
                    </Descriptions>
                  </div>

                  {/* 属性列表 */}
                  {currentThingModel.properties && currentThingModel.properties.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                      <Title level={5}>属性定义 ({currentThingModel.properties.length})</Title>
                      <List
                        dataSource={currentThingModel.properties}
                        renderItem={(property) => (
                          <List.Item style={{ background: '#f8f9fa', marginBottom: 8, borderRadius: 6, padding: 16 }}>
                            <List.Item.Meta
                              title={
                                <div>
                                  <Text strong>{property.name}</Text>
                                  <Text code style={{ marginLeft: 8 }}>{property.identifier}</Text>
                                  <Tag color="blue" style={{ marginLeft: 8 }}>{property.dataType}</Tag>
                                  <Tag color={property.accessMode === 'rw' ? 'green' : property.accessMode === 'r' ? 'blue' : 'orange'}>
                                    {property.accessMode === 'rw' ? '读写' : property.accessMode === 'r' ? '只读' : '只写'}
                                  </Tag>
                                  {property.required && <Tag color="red">必需</Tag>}
                                </div>
                              }
                              description={
                                <div>
                                  <div>{property.description}</div>
                                  {property.specs && (
                                    <div style={{ marginTop: 4, fontSize: '12px', color: '#666' }}>
                                      规格：{property.specs}
                                    </div>
                                  )}
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    </div>
                  )}

                  {/* 事件列表 */}
                  {currentThingModel.events && currentThingModel.events.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                      <Title level={5}>事件定义 ({currentThingModel.events.length})</Title>
                      <List
                        dataSource={currentThingModel.events}
                        renderItem={(event) => (
                          <List.Item style={{ background: '#f8f9fa', marginBottom: 8, borderRadius: 6, padding: 16 }}>
                            <List.Item.Meta
                              title={
                                <div>
                                  <Text strong>{event.name}</Text>
                                  <Text code style={{ marginLeft: 8 }}>{event.identifier}</Text>
                                  <Tag color={
                                    event.type === 'info' ? 'blue' : 
                                    event.type === 'warning' ? 'orange' : 
                                    event.type === 'error' ? 'red' : 'volcano'
                                  } style={{ marginLeft: 8 }}>
                                    {
                                      event.type === 'info' ? '信息事件' : 
                                      event.type === 'warning' ? '警告事件' : 
                                      event.type === 'error' ? '错误事件' : '报警事件'
                                    }
                                  </Tag>
                                </div>
                              }
                              description={
                                <div>
                                  <div>{event.description}</div>
                                  {event.outputData && event.outputData.length > 0 && (
                                    <div style={{ marginTop: 8 }}>
                                      <div style={{ fontWeight: 500, marginBottom: 4 }}>输出参数:</div>
                                      {event.outputData.map((param, index) => (
                                        <div key={index} style={{ marginLeft: 16, marginBottom: 4 }}>
                                          <Text strong>{param.name}</Text>
                                          <Text type="secondary" style={{ marginLeft: 8 }}>[{param.dataType}]</Text>
                                          {param.description && <Text type="secondary"> - {param.description}</Text>}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    </div>
                  )}

                  {/* 服务列表 */}
                  {currentThingModel.services && currentThingModel.services.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                      <Title level={5}>服务定义 ({currentThingModel.services.length})</Title>
                      <List
                        dataSource={currentThingModel.services}
                        renderItem={(service) => (
                          <List.Item style={{ background: '#f8f9fa', marginBottom: 8, borderRadius: 6, padding: 16 }}>
                            <List.Item.Meta
                              title={
                                <div>
                                  <Text strong>{service.name}</Text>
                                  <Text code style={{ marginLeft: 8 }}>{service.identifier}</Text>
                                  <Tag color={service.callType === 'sync' ? 'green' : 'purple'} style={{ marginLeft: 8 }}>
                                    {service.callType === 'sync' ? '同步调用' : '异步调用'}
                                  </Tag>
                                </div>
                              }
                              description={
                                <div>
                                  <div>{service.description}</div>
                                  <div style={{ marginTop: 8 }}>
                                    {service.inputData && service.inputData.length > 0 && (
                                      <div style={{ marginBottom: 8 }}>
                                        <div style={{ fontWeight: 500, marginBottom: 4 }}>输入参数:</div>
                                        {service.inputData.map((param, index) => (
                                          <div key={index} style={{ marginLeft: 16, marginBottom: 4 }}>
                                            <Text strong>{param.name}</Text>
                                            <Text type="secondary" style={{ marginLeft: 8 }}>[{param.dataType}]</Text>
                                            {param.required && <Tag color="red" size="small">必需</Tag>}
                                            {param.description && <Text type="secondary"> - {param.description}</Text>}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    
                                    {service.outputData && service.outputData.length > 0 && (
                                      <div>
                                        <div style={{ fontWeight: 500, marginBottom: 4 }}>输出参数:</div>
                                        {service.outputData.map((param, index) => (
                                          <div key={index} style={{ marginLeft: 16, marginBottom: 4 }}>
                                            <Text strong>{param.name}</Text>
                                            <Text type="secondary" style={{ marginLeft: 8 }}>[{param.dataType}]</Text>
                                            {param.description && <Text type="secondary"> - {param.description}</Text>}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    </div>
                  )}

                  {/* JSON预览 */}
                  <div>
                    <Title level={5}>JSON预览</Title>
                    <pre style={{
                      background: '#f5f5f5',
                      padding: '16px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      maxHeight: '300px',
                      overflow: 'auto'
                    }}>
                      {JSON.stringify({
                        modelId: currentThingModel.code,
                        modelName: currentThingModel.name,
                        version: currentThingModel.version,
                        properties: currentThingModel.properties || [],
                        events: currentThingModel.events || [],
                        services: currentThingModel.services || []
                      }, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                // 未关联物模型的显示
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <InfoCircleOutlined style={{ fontSize: 64, marginBottom: 16, color: '#d9d9d9' }} />
                  <Title level={4} style={{ color: '#8c8c8c', marginBottom: 8 }}>未关联物模型</Title>
                  <Text type="secondary" style={{ marginBottom: 32, display: 'block' }}>
                    物模型定义了产品的数据结构和接口规范，关联后可实现统一的数据格式输出
                  </Text>

                  {thingModelOptions.length > 0 ? (
                    <div style={{ maxWidth: 500, margin: '0 auto' }}>
                      <Card
                        title="选择物模型"
                        size="small"
                        style={{ textAlign: 'left' }}
                      >
                        <Form layout="vertical">
                          <Form.Item
                            label="可用的物模型"
                            style={{ marginBottom: 16 }}
                          >
                            <Select
                              placeholder="请选择要关联的物模型"
                              style={{ width: '100%' }}
                              size="large"
                              showSearch
                              filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              dropdownRender={(menu) => (
                                <div>
                                  {menu}
                                  <Divider style={{ margin: '8px 0' }} />
                                  <div style={{ padding: '8px', textAlign: 'center' }}>
                                    <Button
                                      type="link"
                                      size="small"
                                      onClick={() => navigate('/device/thing-model')}
                                    >
                                      + 创建新的物模型
                                    </Button>
                                  </div>
                                </div>
                              )}
                              onChange={(value) => {
                                const selectedModel = thingModelOptions.find(m => m.value === value);
                                if (selectedModel) {
                                  Modal.confirm({
                                    title: '确认关联物模型',
                                    content: (
                                      <div>
                                        <p>确定要将产品 <strong>{product?.name}</strong> 关联到物模型 <strong>{selectedModel.label}</strong> 吗？</p>
                                        <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '6px', marginTop: '12px' }}>
                                          <div><strong>物模型信息：</strong></div>
                                          <div>名称：{selectedModel.label}</div>
                                          <div>编码：{selectedModel.code}</div>
                                          <div>版本：v{selectedModel.version}</div>
                                        </div>
                                      </div>
                                    ),
                                    onOk: () => handleAssociateThingModel(value),
                                    okText: '确认关联',
                                    cancelText: '取消'
                                  });
                                }
                              }}
                            >
                              {thingModelOptions.map(model => (
                                <Select.Option key={model.value} value={model.value}>
                                  <div>
                                    <div style={{ fontWeight: 500 }}>{model.label}</div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                      {model.code} - v{model.version}
                                    </div>
                                  </div>
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>

                          <div style={{ textAlign: 'center', color: '#8c8c8c', fontSize: '12px' }}>
                            共 {thingModelOptions.length} 个可用物模型
                          </div>
                        </Form>
                      </Card>
                    </div>
                  ) : (
                    <div>
                      <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
                        暂无可用的物模型
                      </Text>
                      <Button type="primary" onClick={() => navigate('/device/thing-model')}>
                        创建物模型
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Spin>
          </TabPane>
        </Tabs>
      </Card>

      {/* 子设备管理组件 */}
      <SubDeviceManager
        visible={isSubDeviceManagerVisible}
        onCancel={() => setIsSubDeviceManagerVisible(false)}
        onSave={handleSaveSubDevices}
        productData={product}
        title={`${product?.name} - 子设备管理`}
      />

      {/* 编辑产品模态框 */}
      <Modal
        title="编辑产品"
        open={isEditModalVisible}
        onOk={handleSaveEdit}
        onCancel={() => setIsEditModalVisible(false)}
        width={800}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="产品名称"
                name="name"
                rules={[{ required: true, message: '请输入产品名称' }]}
              >
                <Input placeholder="请输入产品名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="产品编码"
                name="code"
                rules={[{ required: true, message: '请输入产品编码' }]}
              >
                <Input placeholder="请输入产品编码" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="产品版本"
                name="version"
                rules={[{ required: true, message: '请输入产品版本' }]}
              >
                <Input placeholder="请输入产品版本，如：v1.0.0" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="产品状态"
                name="status"
                rules={[{ required: true, message: '请选择产品状态' }]}
              >
                <Select placeholder="请选择产品状态">
                  {productStatuses.map(status => (
                    <Select.Option key={status.value} value={status.value}>
                      {status.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="产品描述"
            name="description"
          >
            <Input.TextArea rows={4} placeholder="请输入产品描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductDetail;
