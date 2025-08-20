import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
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
  Tabs,
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
  LinkOutlined,
  DisconnectOutlined,
  SettingOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined,
  LockOutlined,
  UnorderedListOutlined,
  AppstoreAddOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  WifiOutlined

} from '@ant-design/icons';
import styles from './index.module.css';
import {
  getDeviceList,
  createDevice,
  updateDevice,
  deleteDevice,
  exportDeviceData,
  testDeviceConnection,
  updateMeshParameters,
  deviceStatuses,
  connectionStatuses,
  deviceTypes,
  deviceTypeMap
} from '../../../services/deviceManagement';
import { getManufacturerList } from '../../../services/deviceManufacturer';
import {
  getDeviceModelList,
  getDeviceModelsByType,
  getDeviceModelsByManufacturerAndType
} from '../../../services/deviceModel';
import { getProductList } from '../../../services/productManagement';
import { verifyBidirectionalSync } from '../../../utils/dataConsistencyChecker';
import moment from 'moment';
import MeshRadioManager from '../../../components/DeviceSpecific/MeshRadio';
import MapPicker from '../../../components/MapPicker';
import LiveVideoPlayer from '../../../components/DeviceSpecific/LiveVideoPlayer';
import RecordedVideoManager from '../../../components/DeviceSpecific/RecordedVideoManager';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Text } = Typography;

const DeviceManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [currentDevice, setCurrentDevice] = useState(null);
  const [form] = Form.useForm();
  const [manufacturers, setManufacturers] = useState([]);
  const [models, setModels] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [testingConnection, setTestingConnection] = useState(false);
  const [isMapPickerVisible, setIsMapPickerVisible] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState({ longitude: 116.397428, latitude: 39.90923 });
  const [positioningMethod, setPositioningMethod] = useState('custom');
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState(null);
  const [selectedManufacturerId, setSelectedManufacturerId] = useState(null);
  const [products, setProducts] = useState([]);
  const [productForm] = Form.useForm();
  const [searchParams, setSearchParams] = useState({
    name: '',
    manufacturerId: undefined,
    deviceType: undefined,
    status: undefined,
    location: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // 视图模式状态管理
  const [viewMode, setViewMode] = useState(() => {
    // 从localStorage读取用户偏好，默认为列表视图
    return localStorage.getItem('deviceManagement_viewMode') || 'list';
  });

  // 表格列定义
  const columns = [
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      ellipsis: true,
      render: (text, record) => (
        <div className={styles.deviceNameCell}>
          <span className={styles.deviceName}>{text}</span>
          <span className={styles.deviceCode}>{record.deviceCode}</span>
        </div>
      )
    },
    {
      title: '所属厂商',
      dataIndex: 'manufacturerName',
      key: 'manufacturerName',
      width: 160,
      ellipsis: true
    },
    {
      title: '设备类型',
      dataIndex: 'deviceType',
      key: 'deviceType',
      width: 120,
      render: (type, record) => {
        const typeName = record.deviceTypeName || deviceTypeMap[type] || type;
        return <Tag color="blue">{typeName}</Tag>;
      }
    },
    {
      title: '设备型号',
      dataIndex: 'modelName',
      key: 'modelName',
      width: 160,
      ellipsis: true
    },
    {
      title: '关联模板',
      dataIndex: 'productName',
      key: 'productName',
      width: 140,
      ellipsis: true,
      render: (productName, record) => {
        if (productName) {
          return (
            <Tooltip title={`模板：${productName}\n编码：${record.productCode || '未知'}`}>
              <Tag color="cyan" style={{ cursor: 'help' }}>
                {productName}
              </Tag>
            </Tooltip>
          );
        } else {
          return (
            <span style={{ color: '#8c8c8c', fontSize: '12px' }}>未关联</span>
          );
        }
      }
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 120,
      ellipsis: true,
      render: (location) => (
        <Tooltip title={location}>
          <span>
            <EnvironmentOutlined style={{ marginRight: 4 }} />
            {location}
          </span>
        </Tooltip>
      )
    },
    {
      title: 'IP地址',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 120
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <DeviceStatusDisplay status={status} size="default" />
      )
    },
    {
      title: '连接状态',
      dataIndex: 'connectionStatus',
      key: 'connectionStatus',
      width: 100,
      render: (status) => (
        <ConnectionStatusDisplay status={status} size="default" />
      )
    },
    {
      title: '最后在线时间',
      dataIndex: 'lastOnlineTime',
      key: 'lastOnlineTime',
      width: 160
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

          <Tooltip title="测试连接">
            <Button
              size="small"
              icon={record.connectionStatus === 'connected' ? <DisconnectOutlined /> : <LinkOutlined />}
              onClick={() => handleTestConnection(record)}
            />
          </Tooltip>

          <Tooltip title="编辑">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>

          <Popconfirm
            title="确定要删除这个设备吗？"
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
    fetchManufacturers();
    fetchModels();
    fetchProducts();
  }, []);

  // 当选择厂商时，过滤型号列表
  useEffect(() => {
    if (form.getFieldValue('manufacturerId')) {
      const manufacturerId = form.getFieldValue('manufacturerId');
      setFilteredModels(models.filter(model => model.manufacturerId === manufacturerId));
    } else {
      setFilteredModels(models);
    }
  }, [form.getFieldValue('manufacturerId'), models]);

  // 获取数据
  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const requestParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        name: searchParams.name,
        manufacturerId: searchParams.manufacturerId,
        deviceType: searchParams.deviceType,
        status: searchParams.status,
        location: searchParams.location,
        ...params
      };

      const response = await getDeviceList(requestParams);
      
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

  // 获取厂商列表
  const fetchManufacturers = async () => {
    try {
      const response = await getManufacturerList({ pageSize: 1000 });
      if (response.success) {
        setManufacturers(response.data.list.filter(m => m.status === 'active'));
      }
    } catch (error) {
      console.error('获取厂商列表失败:', error);
    }
  };

  // 获取型号列表
  const fetchModels = async () => {
    try {
      const response = await getDeviceModelList({ pageSize: 1000 });
      if (response.success) {
        setModels(response.data.list.filter(m => m.status === 'active'));
        setFilteredModels(response.data.list.filter(m => m.status === 'active'));
      }
    } catch (error) {
      console.error('获取型号列表失败:', error);
    }
  };

  // 获取模板列表
  const fetchProducts = async () => {
    try {
      const response = await getProductList({ pageSize: 1000 });
      if (response.success) {
        const activeProducts = response.data.list.filter(p => p.status === 'active');
        setProducts(activeProducts);

        // 调试信息：显示获取到的模板列表
        console.log('🔍 [模板列表] 获取模板成功:', {
          totalProducts: response.data.list.length,
          activeProducts: activeProducts.length,
          productDetails: activeProducts.map(p => ({
            id: p.id,
            name: p.name,
            deviceType: p.deviceType,
            deviceTypeName: p.deviceTypeName,
            status: p.status
          }))
        });
      }
    } catch (error) {
      console.error('获取模板列表失败:', error);
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
      manufacturerId: undefined,
      deviceType: undefined,
      status: undefined,
      location: ''
    });
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchData({ page: 1 });
  };

  // 视图模式切换
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    // 保存用户偏好到localStorage
    localStorage.setItem('deviceManagement_viewMode', mode);
  };

  // 自定义设备状态显示组件
  const DeviceStatusDisplay = ({ status, size = 'default' }) => {
    const getStatusConfig = (status) => {
      switch (status) {
        case 'online':
          return {
            icon: <CheckCircleOutlined className={styles.statusIconOnline} />,
            text: '在线',
            color: '#52c41a',
            className: styles.statusOnline
          };
        case 'offline':
          return {
            icon: <CloseCircleOutlined className={styles.statusIconOffline} />,
            text: '离线',
            color: '#8c8c8c',
            className: styles.statusOffline
          };
        case 'fault':
          return {
            icon: <ExclamationCircleOutlined className={styles.statusIconFault} />,
            text: '故障',
            color: '#ff4d4f',
            className: styles.statusFault
          };
        case 'warning':
          return {
            icon: <ExclamationCircleOutlined className={styles.statusIconWarning} />,
            text: '告警',
            color: '#faad14',
            className: styles.statusWarning
          };
        case 'maintenance':
          return {
            icon: <SettingOutlined className={styles.statusIconMaintenance} />,
            text: '维护中',
            color: '#722ed1',
            className: styles.statusMaintenance
          };
        default:
          return {
            icon: <CloseCircleOutlined className={styles.statusIconOffline} />,
            text: '未知',
            color: '#d9d9d9',
            className: styles.statusOffline
          };
      }
    };

    const config = getStatusConfig(status);
    const sizeClass = size === 'small' ? styles.statusDisplaySmall : styles.statusDisplay;

    return (
      <span className={`${sizeClass} ${config.className}`}>
        {config.icon}
        <span className={styles.statusText}>{config.text}</span>
      </span>
    );
  };

  // 自定义连接状态显示组件
  const ConnectionStatusDisplay = ({ status, size = 'default' }) => {
    const getConnectionConfig = (status) => {
      switch (status) {
        case 'connected':
          return {
            icon: <WifiOutlined className={styles.connectionIconConnected} />,
            text: '已连接',
            color: '#52c41a',
            className: styles.connectionConnected
          };
        case 'disconnected':
          return {
            icon: <DisconnectOutlined className={styles.connectionIconDisconnected} />,
            text: '未连接',
            color: '#8c8c8c',
            className: styles.connectionDisconnected
          };
        case 'connecting':
          return {
            icon: <LoadingOutlined className={styles.connectionIconConnecting} />,
            text: '连接中',
            color: '#1890ff',
            className: styles.connectionConnecting
          };
        default:
          return {
            icon: <DisconnectOutlined className={styles.connectionIconDisconnected} />,
            text: '未知',
            color: '#d9d9d9',
            className: styles.connectionDisconnected
          };
      }
    };

    const config = getConnectionConfig(status);
    const sizeClass = size === 'small' ? styles.connectionDisplaySmall : styles.connectionDisplay;

    return (
      <span className={`${sizeClass} ${config.className}`}>
        {config.icon}
        <span className={styles.connectionText}>{config.text}</span>
      </span>
    );
  };

  // 新增
  const handleAdd = () => {
    setEditingRecord(null);
    setCurrentDevice(null); // 清空当前设备
    setIsModalVisible(true);
    setPositioningMethod('custom');
    setSelectedPosition({ longitude: 116.397428, latitude: 39.90923 });

    console.log('🔍 [新增设备] 重置状态');

    // 重置级联选择状态
    setSelectedDeviceType(null);
    setSelectedManufacturerId(null);
    setFilteredModels([]);

    form.resetFields();
    form.setFieldsValue({
      port: 80,
      positioningMethod: 'custom'
    });
  };

  // 定位方式变化处理
  const handlePositioningMethodChange = (value) => {
    setPositioningMethod(value);
    form.setFieldsValue({ positioningMethod: value });
  };

  // 地图选点确认
  const handleMapConfirm = (position) => {
    // 格式化经纬度为6位小数
    const formattedPosition = {
      longitude: parseFloat(position.longitude.toFixed(6)),
      latitude: parseFloat(position.latitude.toFixed(6))
    };

    setSelectedPosition(formattedPosition);
    form.setFieldsValue({
      longitude: formattedPosition.longitude.toFixed(6),
      latitude: formattedPosition.latitude.toFixed(6)
    });
    setIsMapPickerVisible(false);
    message.success('位置选择成功');
  };

  // 打开地图选择器
  const handleOpenMapPicker = () => {
    setIsMapPickerVisible(true);
  };

  // 编辑
  const handleEdit = async (record) => {
    setEditingRecord(record);
    setCurrentDevice(record); // 设置当前设备，用于模板关联等功能
    setIsModalVisible(true);

    console.log('🔍 [编辑设备] 设备信息:', {
      id: record.id,
      name: record.name,
      deviceType: record.deviceType,
      deviceTypeName: record.deviceTypeName,
      manufacturerId: record.manufacturerId,
      modelId: record.modelId
    });

    // 设置定位方式和位置信息
    const positioning = record.positioningMethod || 'custom';
    setPositioningMethod(positioning);

    if (record.longitude && record.latitude) {
      const formattedPosition = {
        longitude: parseFloat(record.longitude),
        latitude: parseFloat(record.latitude)
      };
      setSelectedPosition(formattedPosition);
    }

    // 准备表单数据，格式化经纬度
    const formData = {
      ...record,
      installDate: record.installDate ? moment(record.installDate) : null,
      warrantyExpiry: record.warrantyExpiry ? moment(record.warrantyExpiry) : null,
      positioningMethod: positioning
    };

    // 如果有经纬度，格式化为6位小数
    if (record.longitude && record.latitude) {
      formData.longitude = parseFloat(record.longitude).toFixed(6);
      formData.latitude = parseFloat(record.latitude).toFixed(6);
    }

    form.setFieldsValue(formData);

    // 设置级联选择状态
    setSelectedDeviceType(record.deviceType);
    setSelectedManufacturerId(record.manufacturerId);

    // 设置过滤后的型号列表
    await updateModelList(record.manufacturerId, record.deviceType);
  };

  // 查看详情 - 打开详情弹窗
  const handleViewDetail = (record) => {
    console.log('打开设备详情:', record.name, '设备类型:', record.deviceType);
    setCurrentDevice(record);
    setIsDetailModalVisible(true);
  };

  // 测试连接
  const handleTestConnection = async (record) => {
    setTestingConnection(true);
    try {
      const response = await testDeviceConnection(record.id);
      if (response.success) {
        message.success(`连接成功，响应时间: ${response.data.responseTime}ms`);
        // 刷新数据
        fetchData();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('连接测试失败');
    } finally {
      setTestingConnection(false);
    }
  };

  // 删除
  const handleDelete = async (id) => {
    try {
      const response = await deleteDevice(id);
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

      // 处理日期字段
      if (values.installDate) {
        values.installDate = values.installDate.format('YYYY-MM-DD');
      }
      if (values.warrantyExpiry) {
        values.warrantyExpiry = values.warrantyExpiry.format('YYYY-MM-DD');
      }

      // 处理定位相关字段
      if (values.positioningMethod === 'device') {
        // 设备主动定位时，清除手动输入的经纬度
        delete values.longitude;
        delete values.latitude;
        values.location = '设备主动定位';
      } else if (values.positioningMethod === 'custom') {
        // 自定义位置时，确保经纬度数据格式正确
        if (values.longitude) {
          values.longitude = parseFloat(values.longitude);
        }
        if (values.latitude) {
          values.latitude = parseFloat(values.latitude);
        }
      }

      // 处理预留字段（暂时移除，因为后端可能不支持）
      delete values.companyId;
      delete values.productId;

      let response;
      if (editingRecord) {
        response = await updateDevice(editingRecord.id, values);
      } else {
        // 新增设备时自动设置状态为离线
        values.status = 'offline';
        response = await createDevice(values);
      }

      if (response.success) {
        message.success(response.message);
        setIsModalVisible(false);
        setIsMapPickerVisible(false);
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
      const response = await exportDeviceData(searchParams);
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

  // 厂商变更时更新型号列表
  const handleManufacturerChange = async (value) => {
    setSelectedManufacturerId(value);
    form.setFieldsValue({ modelId: undefined });

    // 根据厂商和设备类型筛选型号
    await updateModelList(value, selectedDeviceType);
  };

  // 设备类型变更时更新型号列表
  const handleDeviceTypeChange = async (value) => {
    setSelectedDeviceType(value);
    form.setFieldsValue({ modelId: undefined });

    // 根据厂商和设备类型筛选型号
    await updateModelList(selectedManufacturerId, value);
  };

  // 更新型号列表的通用函数
  const updateModelList = async (manufacturerId, deviceType) => {
    console.log('🔍 [更新型号列表] 参数:', { manufacturerId, deviceType });

    if (!manufacturerId && !deviceType) {
      console.log('🔍 [更新型号列表] 无筛选条件，使用全部型号');
      setFilteredModels(models);
      return;
    }

    setLoadingModels(true);
    try {
      const response = await getDeviceModelsByManufacturerAndType(manufacturerId, deviceType);
      console.log('🔍 [更新型号列表] API响应:', response);

      if (response.success) {
        console.log('🔍 [更新型号列表] 筛选后的型号数量:', response.data.length);
        console.log('🔍 [更新型号列表] 筛选后的型号列表:', response.data.map(m => ({ id: m.id, name: m.name, code: m.code })));
        setFilteredModels(response.data);
      } else {
        message.error(response.message);
        setFilteredModels([]);
      }
    } catch (error) {
      console.error('获取型号列表失败:', error);
      message.error('获取型号列表失败');
      setFilteredModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  // 更新Mesh电台参数
  const handleMeshParameterUpdate = async (updatedDevice) => {
    try {
      const response = await updateMeshParameters(updatedDevice.id, updatedDevice.meshParameters);
      if (response.success) {
        message.success('Mesh参数更新成功');
        // 更新当前设备数据
        setCurrentDevice(response.data);
        // 刷新设备列表
        fetchData();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('Mesh参数更新失败');
    }
  };

  // 编辑模板关联
  const handleEditProductAssociation = () => {
    setIsProductModalVisible(true);
    productForm.setFieldsValue({
      productId: currentDevice.productId || null
    });

    // 调试信息：检查设备类型和可用模板
    console.log('🔍 [模板关联] 当前设备信息:', {
      deviceId: currentDevice.id,
      deviceName: currentDevice.name,
      deviceType: currentDevice.deviceType,
      deviceTypeName: currentDevice.deviceTypeName
    });

    const matchingProducts = products.filter(product => product.deviceType === currentDevice?.deviceType);
    console.log('🔍 [模板关联] 匹配的模板列表:', {
      totalProducts: products.length,
      matchingProducts: matchingProducts.length,
      matchingProductDetails: matchingProducts.map(p => ({
        id: p.id,
        name: p.name,
        deviceType: p.deviceType,
        deviceTypeName: p.deviceTypeName
      }))
    });
  };

  // 保存模板关联
  const handleSaveProductAssociation = async () => {
    try {
      const values = await productForm.validateFields();
      const selectedProduct = products.find(p => p.id === values.productId);
      const oldProductId = currentDevice.productId;

      console.log('🔄 [模板关联] 开始更新关联关系:', {
        deviceId: currentDevice.id,
        deviceName: currentDevice.name,
        oldProductId,
        newProductId: values.productId,
        selectedProductName: selectedProduct?.name
      });

      // 1. 更新设备数据
      const updateData = {
        ...currentDevice,
        productId: values.productId,
        productName: selectedProduct?.name || null,
        productCode: selectedProduct?.code || null
      };

      const deviceResponse = await updateDevice(currentDevice.id, updateData);
      if (!deviceResponse.success) {
        message.error(deviceResponse.message);
        return;
      }

      // 2. 更新模板数据中的关联设备列表
      try {
        const { updateProductLinkedDevices } = await import('../../../services/productManagement');

        // 如果之前有关联的模板，需要从旧模板中移除该设备
        if (oldProductId && oldProductId !== values.productId) {
          console.log('🔄 [模板关联] 从旧模板中移除设备关联:', {
            oldProductId,
            deviceId: currentDevice.id,
            deviceName: currentDevice.name
          });

          const removeResult = await updateProductLinkedDevices(oldProductId, currentDevice.id, 'remove');
          if (removeResult.success) {
            console.log('✅ [模板关联] 已从旧模板中移除设备关联');
          } else {
            console.warn('⚠️ [模板关联] 从旧模板移除设备关联失败:', removeResult.message);
          }
        }

        // 如果选择了新模板，需要添加到新模板的关联设备列表中
        if (values.productId) {
          console.log('🔄 [模板关联] 添加设备到新模板的关联列表:', {
            newProductId: values.productId,
            deviceId: deviceResponse.data.id,
            deviceName: deviceResponse.data.name
          });

          const addResult = await updateProductLinkedDevices(values.productId, deviceResponse.data, 'add');
          if (addResult.success) {
            console.log('✅ [模板关联] 已添加设备到新模板的关联列表');
          } else {
            console.warn('⚠️ [模板关联] 添加设备到新模板关联列表失败:', addResult.message);
          }
        }

        // 如果是取消关联（从有模板变为无模板）
        if (oldProductId && !values.productId) {
          console.log('🔄 [模板关联] 取消设备模板关联:', {
            oldProductId,
            deviceId: currentDevice.id,
            deviceName: currentDevice.name
          });

          const removeResult = await updateProductLinkedDevices(oldProductId, currentDevice.id, 'remove');
          if (removeResult.success) {
            console.log('✅ [模板关联] 已取消设备模板关联');
          } else {
            console.warn('⚠️ [模板关联] 取消设备模板关联失败:', removeResult.message);
          }
        }

      } catch (productUpdateError) {
        console.error('❌ [模板关联] 模板关联设备列表更新异常:', productUpdateError);
        message.warning('模板关联列表更新失败，但设备关联已更新');
      }

      // 3. 验证双向数据同步
      console.log('🔍 [模板关联] 开始验证双向数据同步...');
      try {
        const action = values.productId ? 'associate' : 'disassociate';
        const verifyResult = await verifyBidirectionalSync(currentDevice.id, values.productId, action);

        if (verifyResult.success) {
          console.log('✅ [模板关联] 双向数据同步验证通过');
        } else {
          console.warn('⚠️ [模板关联] 双向数据同步验证失败:', verifyResult.issues);
          message.warning('数据同步验证存在问题，建议运行数据一致性检查');
        }
      } catch (verifyError) {
        console.error('❌ [模板关联] 数据同步验证异常:', verifyError);
      }

      message.success('模板关联更新成功');
      setCurrentDevice(deviceResponse.data);
      setIsProductModalVisible(false);
      fetchData(); // 刷新列表
    } catch (error) {
      console.error('保存模板关联失败:', error);
      message.error('更新失败');
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
                placeholder="设备名称/编码"
                value={searchParams.name}
                onChange={(e) => setSearchParams({...searchParams, name: e.target.value})}
                onSearch={handleSearch}
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="请选择所属厂商"
                value={searchParams.manufacturerId}
                onChange={(value) => setSearchParams({...searchParams, manufacturerId: value})}
                style={{ width: '100%' }}
                allowClear
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
                value={searchParams.deviceType}
                onChange={(value) => setSearchParams({...searchParams, deviceType: value})}
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
            <Col span={3}>
              <Select
                placeholder="请选择设备状态"
                value={searchParams.status}
                onChange={(value) => setSearchParams({...searchParams, status: value})}
                style={{ width: '100%' }}
                allowClear
              >
                {deviceStatuses.map(status => (
                  <Option key={status.value} value={status.value}>
                    {status.label}
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
            设备列表
          </span>
        }
        extra={
          <Space>
            {/* 视图切换按钮 */}
            <Button.Group>
              <Button
                type={viewMode === 'list' ? 'primary' : 'default'}
                icon={<UnorderedListOutlined />}
                onClick={() => handleViewModeChange('list')}
                size="small"
              >
                列表
              </Button>
              <Button
                type={viewMode === 'card' ? 'primary' : 'default'}
                icon={<AppstoreAddOutlined />}
                onClick={() => handleViewModeChange('card')}
                size="small"
              >
                卡片
              </Button>
            </Button.Group>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增设备
            </Button>
            <Button icon={<ExportOutlined />} onClick={handleExport}>
              导出
            </Button>
          </Space>
        }
        size="small"
      >
        {viewMode === 'list' ? (
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
            scroll={{ x: 1600 }}
          />
        ) : (
          <div className={styles.cardView}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontSize: '16px', color: '#8c8c8c' }}>
                  加载中...
                </div>
              </div>
            ) : dataSource.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontSize: '16px', color: '#8c8c8c', marginBottom: '8px' }}>
                  暂无设备数据
                </div>
                <div style={{ fontSize: '14px', color: '#bfbfbf' }}>
                  请尝试调整搜索条件或添加新设备
                </div>
              </div>
            ) : (
              <Row gutter={[16, 16]}>
                {dataSource.map(device => (
                <Col key={device.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                  <Card
                    className={styles.deviceCard}
                    hoverable
                    size="small"
                    actions={[
                      <Tooltip title="查看详情" key="view">
                        <EyeOutlined onClick={() => handleViewDetail(device)} />
                      </Tooltip>,
                      <Tooltip title="测试连接" key="test">
                        {device.connectionStatus === 'connected' ?
                          <DisconnectOutlined
                            onClick={() => handleTestConnection(device)}
                            style={{ color: testingConnection ? '#d9d9d9' : '#52c41a' }}
                          /> :
                          <LinkOutlined
                            onClick={() => handleTestConnection(device)}
                            style={{ color: testingConnection ? '#d9d9d9' : '#1890ff' }}
                          />
                        }
                      </Tooltip>,
                      <Tooltip title="编辑" key="edit">
                        <EditOutlined onClick={() => handleEdit(device)} />
                      </Tooltip>,
                      <Popconfirm
                        title="确定要删除这个设备吗？"
                        onConfirm={() => handleDelete(device.id)}
                        okText="确定"
                        cancelText="取消"
                        key="delete"
                      >
                        <Tooltip title="删除">
                          <DeleteOutlined style={{ color: '#ff4d4f' }} />
                        </Tooltip>
                      </Popconfirm>
                    ]}
                  >
                    <div className={styles.deviceCardHeader}>
                      <div className={styles.deviceCardTitleRow}>
                        <div className={styles.deviceCardTitle}>
                          <Text strong ellipsis={{ tooltip: device.name }}>
                            {device.name}
                          </Text>
                        </div>
                        <div className={styles.deviceCardStatusGroup}>
                          <DeviceStatusDisplay status={device.status} size="small" />
                          <ConnectionStatusDisplay status={device.connectionStatus} size="small" />
                        </div>
                      </div>
                      <div className={styles.deviceCardCode}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {device.deviceCode}
                        </Text>
                      </div>
                    </div>

                    <div className={styles.deviceCardContent}>
                      <div className={styles.deviceCardInfo}>
                        <Row gutter={[8, 4]}>
                          {/* 左列 */}
                          <Col span={12}>
                            <div className={styles.deviceCardColumn}>
                              <div className={styles.deviceCardRow}>
                                <span className={styles.deviceCardLabel}>厂商</span>
                                <span className={styles.deviceCardValue}>
                                  <Text ellipsis={{ tooltip: device.manufacturerName }}>
                                    {device.manufacturerName}
                                  </Text>
                                </span>
                              </div>

                              <div className={styles.deviceCardRow}>
                                <span className={styles.deviceCardLabel}>类型</span>
                                <span className={styles.deviceCardValue}>
                                  <Tag color="blue" size="small">
                                    {device.deviceTypeName || deviceTypeMap[device.deviceType] || device.deviceType}
                                  </Tag>
                                </span>
                              </div>

                              <div className={styles.deviceCardRow}>
                                <span className={styles.deviceCardLabel}>型号</span>
                                <span className={styles.deviceCardValue}>
                                  <Text ellipsis={{ tooltip: device.modelName }}>
                                    {device.modelName}
                                  </Text>
                                </span>
                              </div>
                            </div>
                          </Col>

                          {/* 右列 */}
                          <Col span={12}>
                            <div className={styles.deviceCardColumn}>
                              <div className={styles.deviceCardRow}>
                                <span className={styles.deviceCardLabel}>IP</span>
                                <span className={styles.deviceCardValue}>
                                  <Text code>
                                    {device.ipAddress}
                                  </Text>
                                </span>
                              </div>

                              <div className={styles.deviceCardRow}>
                                <span className={styles.deviceCardLabel}>位置</span>
                                <span className={styles.deviceCardValue}>
                                  <Text ellipsis={{ tooltip: device.location }} style={{ display: 'flex', alignItems: 'center' }}>
                                    <EnvironmentOutlined style={{ marginRight: 2, color: '#1890ff', fontSize: '10px' }} />
                                    <span>{device.location}</span>
                                  </Text>
                                </span>
                              </div>

                              <div className={styles.deviceCardRow}>
                                <span className={styles.deviceCardLabel}>模板</span>
                                <span className={styles.deviceCardValue}>
                                  {device.productName ? (
                                    <Tag color="cyan" size="small">
                                      {device.productName}
                                    </Tag>
                                  ) : (
                                    <Text style={{ color: '#8c8c8c', fontSize: '11px' }}>
                                      未关联
                                    </Text>
                                  )}
                                </span>
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </div>
                  </Card>
                  </Col>
                ))}
              </Row>
            )}

            {/* 卡片视图分页 - 只在有数据时显示 */}
            {!loading && dataSource.length > 0 && (
              <div className={styles.cardPagination}>
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <div style={{ marginBottom: 16 }}>
                  <Text type="secondary">
                    共 {pagination.total} 条记录
                  </Text>
                </div>
                <Space>
                  <Button
                    disabled={pagination.current === 1}
                    onClick={() => {
                      const newPage = pagination.current - 1;
                      setPagination(prev => ({ ...prev, current: newPage }));
                      fetchData({ page: newPage, pageSize: pagination.pageSize });
                    }}
                  >
                    上一页
                  </Button>
                  <span>
                    第 {pagination.current} 页 / 共 {Math.ceil(pagination.total / pagination.pageSize)} 页
                  </span>
                  <Button
                    disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                    onClick={() => {
                      const newPage = pagination.current + 1;
                      setPagination(prev => ({ ...prev, current: newPage }));
                      fetchData({ page: newPage, pageSize: pagination.pageSize });
                    }}
                  >
                    下一页
                  </Button>
                  <Select
                    value={pagination.pageSize}
                    onChange={(size) => {
                      setPagination(prev => ({ ...prev, current: 1, pageSize: size }));
                      fetchData({ page: 1, pageSize: size });
                    }}
                    style={{ width: 100 }}
                  >
                    <Option value={10}>10条/页</Option>
                    <Option value={20}>20条/页</Option>
                    <Option value={50}>50条/页</Option>
                    <Option value={100}>100条/页</Option>
                  </Select>
                </Space>
              </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingRecord ? '编辑设备' : '新增设备'}
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
            status: 'offline',
            port: 80
          }}
        >
          <Tabs defaultActiveKey="basic">
            <TabPane tab="基本信息" key="basic">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="设备名称"
                    name="name"
                    rules={[{ required: true, message: '请输入设备名称' }]}
                  >
                    <Input placeholder="请输入设备名称" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="设备编码"
                    name="deviceCode"
                    rules={[{ required: true, message: '请输入设备编码' }]}
                  >
                    <Input placeholder="请输入设备编码" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="序列号"
                    name="serialNumber"
                    rules={[{ required: true, message: '请输入序列号' }]}
                  >
                    <Input placeholder="请输入序列号" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="所属厂商"
                    name="manufacturerId"
                    rules={[{ required: true, message: '请选择所属厂商' }]}
                  >
                    <Select
                      placeholder="请选择所属厂商"
                      onChange={handleManufacturerChange}
                    >
                      {manufacturers.map(manufacturer => (
                        <Option key={manufacturer.id} value={manufacturer.id}>
                          {manufacturer.name}
                        </Option>
                      ))}
                    </Select>
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
                    <Select
                      placeholder="请选择设备类型"
                      onChange={handleDeviceTypeChange}
                    >
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
                    label="设备型号"
                    name="modelId"
                    rules={[{ required: true, message: '请选择设备型号' }]}
                  >
                    <Select
                      placeholder={
                        !selectedDeviceType && !selectedManufacturerId
                          ? "请先选择设备类型或厂商"
                          : loadingModels
                            ? "加载中..."
                            : "请选择设备型号"
                      }
                      loading={loadingModels}
                      disabled={!selectedDeviceType && !selectedManufacturerId}
                      notFoundContent={
                        !selectedDeviceType && !selectedManufacturerId
                          ? "请先选择设备类型或厂商"
                          : "暂无匹配的设备型号"
                      }
                    >
                      {filteredModels.filter(model => model && model.name && model.id).map(model => {
                        // 调试信息：检查型号数据
                        console.log('🔍 [设备型号] 型号数据:', {
                          id: model.id,
                          name: model.name,
                          code: model.code,
                          deviceType: model.deviceType,
                          manufacturerId: model.manufacturerId
                        });

                        return (
                          <Option key={model.id} value={model.id}>
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
                                fontWeight: 500
                              }}>
                                {model.name}
                              </span>
                              <span style={{
                                fontSize: 12,
                                color: '#8c8c8c',
                                whiteSpace: 'nowrap'
                              }}>
                                编号: {model.code || '未知'}
                              </span>
                              <span style={{
                                fontSize: 12,
                                color: '#8c8c8c',
                                whiteSpace: 'nowrap'
                              }}>
                                类型: {deviceTypeMap[model.deviceType] || model.deviceType || '未知'}
                              </span>
                            </div>
                          </Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="所属公司"
                    name="companyId"
                    tooltip="数据关联功能开发中，暂时预留字段"
                  >
                    <Select placeholder="请选择所属公司" disabled>
                      <Option value="">数据关联开发中...</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="定位方式"
                    name="positioningMethod"
                    rules={[{ required: true, message: '请选择定位方式' }]}
                  >
                    <Select
                      placeholder="请选择定位方式"
                      onChange={handlePositioningMethodChange}
                    >
                      <Option value="custom">自定义位置</Option>
                      <Option value="device">设备主动定位</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>



              {positioningMethod === 'custom' && (
                <>
                  <Form.Item
                    label="设备位置描述"
                    name="location"
                    rules={[{ required: true, message: '请输入设备位置描述' }]}
                  >
                    <Input placeholder="请输入设备位置描述，如：北京市朝阳区xxx大厦" />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        label="经度"
                        name="longitude"
                        rules={[
                          { required: true, message: '请输入经度' },
                          {
                            validator: (_, value) => {
                              if (value === undefined || value === '') return Promise.resolve();
                              const num = parseFloat(value);
                              if (isNaN(num) || num < -180 || num > 180) {
                                return Promise.reject(new Error('经度范围为-180到180'));
                              }
                              return Promise.resolve();
                            }
                          }
                        ]}
                      >
                        <InputNumber
                          placeholder="请输入经度"
                          precision={6}
                          step={0.000001}
                          min={-180}
                          max={180}
                          style={{ width: '100%' }}
                          onChange={(value) => {
                            if (value !== null && value !== undefined) {
                              setSelectedPosition(prev => ({
                                ...prev,
                                longitude: value
                              }));
                            }
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="纬度"
                        name="latitude"
                        rules={[
                          { required: true, message: '请输入纬度' },
                          {
                            validator: (_, value) => {
                              if (value === undefined || value === '') return Promise.resolve();
                              const num = parseFloat(value);
                              if (isNaN(num) || num < -90 || num > 90) {
                                return Promise.reject(new Error('纬度范围为-90到90'));
                              }
                              return Promise.resolve();
                            }
                          }
                        ]}
                      >
                        <InputNumber
                          placeholder="请输入纬度"
                          precision={6}
                          step={0.000001}
                          min={-90}
                          max={90}
                          style={{ width: '100%' }}
                          onChange={(value) => {
                            if (value !== null && value !== undefined) {
                              setSelectedPosition(prev => ({
                                ...prev,
                                latitude: value
                              }));
                            }
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label=" " colon={false}>
                        <Button
                          type="primary"
                          icon={<EnvironmentOutlined />}
                          onClick={handleOpenMapPicker}
                          style={{ width: '100%' }}
                        >
                          地图选点
                        </Button>
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              )}

              {positioningMethod === 'device' && (
                <Form.Item
                  label="设备位置描述"
                  name="location"
                >
                  <Input
                    placeholder="设备将通过GPS等方式主动上报位置信息"
                    disabled
                  />
                </Form.Item>
              )}

              <Form.Item
                label="设备描述"
                name="description"
              >
                <TextArea rows={3} placeholder="请输入设备描述" />
              </Form.Item>
            </TabPane>

            <TabPane tab="连接信息" key="connection">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="IP地址"
                    name="ipAddress"
                    rules={[
                      { required: true, message: '请输入IP地址' },
                      { pattern: /^(\d{1,3}\.){3}\d{1,3}$/, message: '请输入正确的IP地址格式' }
                    ]}
                  >
                    <Input placeholder="请输入IP地址" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="端口"
                    name="port"
                    rules={[
                      { required: true, message: '请输入端口' },
                      {
                        validator: (_, value) => {
                          if (value === undefined || value === '') return Promise.resolve();
                          const num = parseInt(value, 10);
                          if (isNaN(num) || num < 1 || num > 65535) {
                            return Promise.reject(new Error('端口范围为1-65535'));
                          }
                          return Promise.resolve();
                        }
                      }
                    ]}
                  >
                    <InputNumber
                      placeholder="请输入端口"
                      min={1}
                      max={65535}
                      precision={0}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="用户名"
                    name="username"
                    rules={[{ required: true, message: '请输入用户名' }]}
                  >
                    <Input placeholder="请输入用户名" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="密码"
                    name="password"
                    rules={[{ required: true, message: '请输入密码' }]}
                  >
                    <Input.Password placeholder="请输入密码" />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="其他信息" key="other">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="安装日期"
                    name="installDate"
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="保修到期日"
                    name="warrantyExpiry"
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </Form>
      </Modal>

      {/* 地图选点组件 */}
      <MapPicker
        visible={isMapPickerVisible}
        onCancel={() => setIsMapPickerVisible(false)}
        onConfirm={handleMapConfirm}
        initialPosition={selectedPosition}
      />

      {/* 设备详情弹窗 */}
      <Modal
        title="设备详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        width={1200}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button
                type="primary"
                icon={<LinkOutlined />}
                loading={testingConnection}
                onClick={() => currentDevice && handleTestConnection(currentDevice)}
              >
                测试连接
              </Button>
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  setIsDetailModalVisible(false);
                  currentDevice && handleEdit(currentDevice);
                }}
              >
                编辑
              </Button>
              <Button onClick={() => setIsDetailModalVisible(false)}>
                关闭
              </Button>
            </Space>
          </div>
        }
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}
      >
        {currentDevice && (
          <Tabs defaultActiveKey="basic" type="card">
            <TabPane tab="基本信息" key="basic">
              <Descriptions title="基本信息" bordered column={2}>
                {/* 第一行：设备名称、设备编码 */}
                <Descriptions.Item label="设备名称">{currentDevice.name}</Descriptions.Item>
                <Descriptions.Item label="设备编码">{currentDevice.deviceCode}</Descriptions.Item>

                {/* 第二行：序列号、所属厂商 */}
                <Descriptions.Item label="序列号">{currentDevice.serialNumber || '-'}</Descriptions.Item>
                <Descriptions.Item label="所属厂商">{currentDevice.manufacturerName}</Descriptions.Item>

                {/* 第三行：设备类型、设备型号 */}
                <Descriptions.Item label="设备类型">
                  <Tag color="blue" style={{ fontSize: '13px' }}>
                    {currentDevice.deviceTypeName || deviceTypeMap[currentDevice.deviceType] || currentDevice.deviceType}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="设备型号">{currentDevice.modelName}</Descriptions.Item>

                {/* 第四行：所属公司、定位方式 */}
                <Descriptions.Item label="所属公司">
                  {currentDevice.companyName ? (
                    <Tag color="green">{currentDevice.companyName}</Tag>
                  ) : (
                    <span style={{ color: '#8c8c8c' }}>暂未关联</span>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="定位方式">
                  <Tag color={currentDevice.positioningMethod === 'device' ? 'orange' : 'purple'}>
                    {currentDevice.positioningMethod === 'device' ? '设备主动定位' : '自定义位置'}
                  </Tag>
                </Descriptions.Item>

                {/* 第五行：设备位置 */}
                <Descriptions.Item label="设备位置" span={2}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <EnvironmentOutlined style={{ color: '#1890ff' }} />
                    <span>{currentDevice.location}</span>
                  </div>
                </Descriptions.Item>

                {/* 经纬度（仅自定义位置时显示） */}
                {currentDevice.positioningMethod === 'custom' && currentDevice.longitude && currentDevice.latitude && (
                  <>
                    <Descriptions.Item label="经度">
                      <span style={{ fontFamily: 'Monaco, monospace', color: '#722ed1' }}>
                        {parseFloat(currentDevice.longitude).toFixed(6)}
                      </span>
                    </Descriptions.Item>
                    <Descriptions.Item label="纬度">
                      <span style={{ fontFamily: 'Monaco, monospace', color: '#722ed1' }}>
                        {parseFloat(currentDevice.latitude).toFixed(6)}
                      </span>
                    </Descriptions.Item>
                  </>
                )}

                {/* 设备描述（仅在有描述时显示） */}
                {currentDevice.description && currentDevice.description !== '-' && (
                  <Descriptions.Item label="设备描述" span={2}>
                    <div style={{
                      padding: '12px',
                      background: '#fafafa',
                      borderRadius: '6px',
                      lineHeight: '1.6',
                      color: '#595959',
                      borderLeft: '3px solid #1890ff'
                    }}>
                      {currentDevice.description}
                    </div>
                  </Descriptions.Item>
                )}

                {/* 模板关联信息 */}
                <Descriptions.Item label="所属模板" span={2}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      {currentDevice.productName ? (
                        <div>
                          <Tag color="cyan">{currentDevice.productName}</Tag>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            模板编码：{currentDevice.productCode}
                          </Text>
                        </div>
                      ) : (
                        <span style={{ color: '#8c8c8c' }}>暂未关联</span>
                      )}
                    </div>
                    <Button
                      type="link"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={handleEditProductAssociation}
                    >
                      编辑
                    </Button>
                  </div>
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              <Descriptions title="连接信息" bordered column={2}>
                {/* 第一行：IP地址、端口 */}
                <Descriptions.Item label="IP地址">
                  <Tag color="purple">{currentDevice.ipAddress}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="端口">
                  <Tag color="orange">{currentDevice.port}</Tag>
                </Descriptions.Item>

                {/* 第二行：用户名、密码 */}
                <Descriptions.Item label="用户名">{currentDevice.username || '-'}</Descriptions.Item>
                <Descriptions.Item label="密码">
                  <span style={{ color: '#8c8c8c' }}>******</span>
                </Descriptions.Item>

                {/* 第三行：设备状态、连接状态 */}
                <Descriptions.Item label="设备状态">
                  <Badge
                    status={deviceStatuses.find(s => s.value === currentDevice.status)?.color || 'default'}
                    text={deviceStatuses.find(s => s.value === currentDevice.status)?.label || currentDevice.status}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="连接状态">
                  <Badge
                    status={connectionStatuses.find(s => s.value === currentDevice.connectionStatus)?.color || 'default'}
                    text={connectionStatuses.find(s => s.value === currentDevice.connectionStatus)?.label || currentDevice.connectionStatus}
                  />
                </Descriptions.Item>

                {/* 第四行：最后在线时间 */}
                <Descriptions.Item label="最后在线时间" span={2}>
                  <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
                    {currentDevice.lastOnlineTime || '未知'}
                  </span>
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              <Descriptions title="其他信息" bordered column={2}>
                {/* 第一行：安装日期、保修到期日 */}
                <Descriptions.Item label="安装日期">
                  {currentDevice.installDate ? (
                    <span style={{ color: '#52c41a' }}>{currentDevice.installDate}</span>
                  ) : (
                    <span style={{ color: '#8c8c8c' }}>未设置</span>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="保修到期日">
                  {currentDevice.warrantyExpiry ? (
                    <span style={{ color: '#fa8c16' }}>{currentDevice.warrantyExpiry}</span>
                  ) : (
                    <span style={{ color: '#8c8c8c' }}>未设置</span>
                  )}
                </Descriptions.Item>

                {/* 第二行：创建时间、更新时间 */}
                <Descriptions.Item label="创建时间">
                  <span style={{ fontSize: '12px', color: '#8c8c8c' }}>{currentDevice.createTime}</span>
                </Descriptions.Item>
                <Descriptions.Item label="更新时间">
                  <span style={{ fontSize: '12px', color: '#8c8c8c' }}>{currentDevice.updateTime}</span>
                </Descriptions.Item>
              </Descriptions>
            </TabPane>

            {/* 根据设备类型显示特定功能 - Mesh电台 */}
            {currentDevice.deviceType === 'mesh_radio' && (
              <>
                <TabPane tab="拓扑图" key="mesh-topology">
                  <MeshRadioManager
                    device={currentDevice}
                    onParameterUpdate={handleMeshParameterUpdate}
                    mode="topology"
                  />
                </TabPane>

                <TabPane tab="参数设置" key="mesh-parameters">
                  <MeshRadioManager
                    device={currentDevice}
                    onParameterUpdate={handleMeshParameterUpdate}
                    mode="parameters"
                  />
                </TabPane>
              </>
            )}

            {/* 可以在这里添加其他设备类型的特定功能 */}
            {(currentDevice.deviceType === 'network_camera' || currentDevice.deviceType === '网络摄像头') && (
              <>
                <TabPane tab="实时视频" key="live-video">
                  <LiveVideoPlayer device={currentDevice} />
                </TabPane>

                <TabPane tab="录像视频" key="recorded-video">
                  <RecordedVideoManager device={currentDevice} />
                </TabPane>
              </>
            )}
          </Tabs>
        )}
      </Modal>

      {/* 模板关联编辑Modal */}
      <Modal
        title="编辑模板关联"
        open={isProductModalVisible}
        onOk={handleSaveProductAssociation}
        onCancel={() => setIsProductModalVisible(false)}
        width={500}
      >
        <Form form={productForm} layout="vertical">
          <Form.Item
            label="关联模板"
            name="productId"
            help="只能选择与设备类型匹配的模板"
          >
            <Select
              placeholder="请选择模板"
              allowClear
              showSearch
              optionFilterProp="children"
              notFoundContent={
                products.filter(product => product.deviceType === currentDevice?.deviceType).length === 0
                  ? `暂无${currentDevice?.deviceTypeName || currentDevice?.deviceType}类型的模板`
                  : '暂无数据'
              }
            >
              {products
                .filter(product => {
                  // 调试信息
                  const isMatch = product.deviceType === currentDevice?.deviceType;
                  console.log('🔍 [模板筛选] 筛选检查:', {
                    productName: product.name,
                    productDeviceType: product.deviceType,
                    currentDeviceType: currentDevice?.deviceType,
                    currentDeviceName: currentDevice?.name,
                    isMatch
                  });
                  return isMatch;
                })
                .map(product => (
                  <Option key={product.id} value={product.id}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '4px 0',
                      width: '100%'
                    }}>
                      <Text strong style={{
                        flex: 1,
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {product.name}
                      </Text>
                      <Text type="secondary" style={{
                        fontSize: 12,
                        whiteSpace: 'nowrap',
                        color: '#8c8c8c'
                      }}>
                        编号: {product.code}
                      </Text>
                      <Text type="secondary" style={{
                        fontSize: 12,
                        whiteSpace: 'nowrap',
                        color: '#8c8c8c'
                      }}>
                        类型: {product.deviceTypeName}
                      </Text>
                    </div>
                  </Option>
                ))}
            </Select>
          </Form.Item>

          {currentDevice && (
            <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 6 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                当前设备类型：{currentDevice.deviceTypeName || deviceTypeMap[currentDevice.deviceType] || currentDevice.deviceType}
              </Text>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default DeviceManagement;
