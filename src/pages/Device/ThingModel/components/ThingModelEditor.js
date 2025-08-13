import React, { useState, useEffect } from 'react';
import {
  Modal,
  Tabs,
  Table,
  Button,
  Space,
  Form,
  Input,
  Select,
  Switch,
  InputNumber,
  message,
  Popconfirm,
  Tag,
  Card,
  Row,
  Col,
  Typography,
  Alert,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  CodeOutlined,
  SettingOutlined
} from '@ant-design/icons';
import styles from './ThingModelEditor.module.css';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { Text, Title } = Typography;

const ThingModelEditor = ({ visible, model, onCancel, onSave }) => {
  const [activeTab, setActiveTab] = useState('properties');
  const [properties, setProperties] = useState([]);
  const [events, setEvents] = useState([]);
  const [services, setServices] = useState([]);
  const [isPropertyModalVisible, setIsPropertyModalVisible] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [propertyForm] = Form.useForm();
  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm] = Form.useForm();
  const [isServiceModalVisible, setIsServiceModalVisible] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm] = Form.useForm();

  // 数据类型选项
  const dataTypes = [
    { value: 'int', label: '整数(int)', description: '32位有符号整数' },
    { value: 'float', label: '浮点数(float)', description: '单精度浮点数' },
    { value: 'double', label: '双精度(double)', description: '双精度浮点数' },
    { value: 'string', label: '字符串(string)', description: '文本字符串' },
    { value: 'boolean', label: '布尔值(boolean)', description: 'true/false' },
    { value: 'enum', label: '枚举(enum)', description: '预定义值列表' },
    { value: 'array', label: '数组(array)', description: '数组类型' },
    { value: 'object', label: '对象(object)', description: '复合对象' }
  ];

  // 访问模式选项
  const accessModes = [
    { value: 'r', label: '只读(Read)', color: 'blue' },
    { value: 'w', label: '只写(Write)', color: 'orange' },
    { value: 'rw', label: '读写(Read/Write)', color: 'green' }
  ];

  // 事件类型选项
  const eventTypes = [
    { value: 'info', label: '信息事件', color: 'blue', description: '一般信息通知' },
    { value: 'warning', label: '警告事件', color: 'orange', description: '需要注意的警告' },
    { value: 'error', label: '错误事件', color: 'red', description: '系统错误或故障' },
    { value: 'alarm', label: '报警事件', color: 'volcano', description: '紧急报警信息' }
  ];

  // 服务调用类型选项
  const serviceCallTypes = [
    { value: 'sync', label: '同步调用', description: '立即返回结果' },
    { value: 'async', label: '异步调用', description: '后台执行，稍后返回结果' }
  ];

  // 初始化数据
  useEffect(() => {
    if (model && visible) {
      setProperties(model.properties || []);
      setEvents(model.events || []);
      setServices(model.services || []);
    }
  }, [model, visible]);

  // 添加属性
  const handleAddProperty = () => {
    setEditingProperty(null);
    setIsPropertyModalVisible(true);
    propertyForm.resetFields();
  };

  // 编辑属性
  const handleEditProperty = (property) => {
    setEditingProperty(property);
    setIsPropertyModalVisible(true);
    propertyForm.setFieldsValue(property);
  };

  // 删除属性
  const handleDeleteProperty = (id) => {
    setProperties(prev => prev.filter(p => p.id !== id));
    message.success('属性删除成功');
  };

  // 保存属性
  const handleSaveProperty = async () => {
    try {
      const values = await propertyForm.validateFields();
      
      if (editingProperty) {
        // 编辑
        setProperties(prev => prev.map(p => 
          p.id === editingProperty.id ? { ...values, id: editingProperty.id } : p
        ));
      } else {
        // 新增
        const newProperty = {
          ...values,
          id: Date.now() // 简单的ID生成
        };
        setProperties(prev => [...prev, newProperty]);
      }
      
      setIsPropertyModalVisible(false);
      message.success('属性保存成功');
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 添加事件
  const handleAddEvent = () => {
    setEditingEvent(null);
    setIsEventModalVisible(true);
    eventForm.resetFields();
  };

  // 编辑事件
  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setIsEventModalVisible(true);
    eventForm.setFieldsValue(event);
  };

  // 删除事件
  const handleDeleteEvent = (id) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    message.success('事件删除成功');
  };

  // 保存事件
  const handleSaveEvent = async () => {
    try {
      const values = await eventForm.validateFields();

      if (editingEvent) {
        // 编辑
        setEvents(prev => prev.map(e =>
          e.id === editingEvent.id ? { ...values, id: editingEvent.id } : e
        ));
      } else {
        // 新增
        const newEvent = {
          ...values,
          id: Date.now() // 简单的ID生成
        };
        setEvents(prev => [...prev, newEvent]);
      }

      setIsEventModalVisible(false);
      message.success('事件保存成功');
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 添加服务
  const handleAddService = () => {
    setEditingService(null);
    setIsServiceModalVisible(true);
    serviceForm.resetFields();
  };

  // 编辑服务
  const handleEditService = (service) => {
    setEditingService(service);
    setIsServiceModalVisible(true);
    serviceForm.setFieldsValue(service);
  };

  // 删除服务
  const handleDeleteService = (id) => {
    setServices(prev => prev.filter(s => s.id !== id));
    message.success('服务删除成功');
  };

  // 保存服务
  const handleSaveService = async () => {
    try {
      const values = await serviceForm.validateFields();

      if (editingService) {
        // 编辑
        setServices(prev => prev.map(s =>
          s.id === editingService.id ? { ...values, id: editingService.id } : s
        ));
      } else {
        // 新增
        const newService = {
          ...values,
          id: Date.now() // 简单的ID生成
        };
        setServices(prev => [...prev, newService]);
      }

      setIsServiceModalVisible(false);
      message.success('服务保存成功');
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 保存整个物模型
  const handleSaveModel = () => {
    const updatedModel = {
      ...model,
      properties,
      events,
      services,
      updateTime: new Date().toLocaleString('zh-CN')
    };
    
    onSave(updatedModel);
  };

  // 生成JSON预览
  const generateModelJSON = () => {
    return {
      modelId: model?.code,
      modelName: model?.name,
      version: model?.version,
      deviceType: model?.deviceType,
      properties: properties.map(p => ({
        identifier: p.identifier,
        name: p.name,
        dataType: p.dataType,
        accessMode: p.accessMode,
        required: p.required,
        description: p.description,
        specs: p.specs
      })),
      events: events,
      services: services,
      generateTime: new Date().toISOString()
    };
  };

  // 属性表格列定义
  const propertyColumns = [
    {
      title: '标识符',
      dataIndex: 'identifier',
      key: 'identifier',
      width: 120,
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: '属性名称',
      dataIndex: 'name',
      key: 'name',
      width: 120
    },
    {
      title: '数据类型',
      dataIndex: 'dataType',
      key: 'dataType',
      width: 100,
      render: (type) => {
        const dataType = dataTypes.find(t => t.value === type);
        return <Tag color="blue">{dataType?.label || type}</Tag>;
      }
    },
    {
      title: '访问模式',
      dataIndex: 'accessMode',
      key: 'accessMode',
      width: 100,
      render: (mode) => {
        const accessMode = accessModes.find(m => m.value === mode);
        return <Tag color={accessMode?.color}>{accessMode?.label || mode}</Tag>;
      }
    },
    {
      title: '必需',
      dataIndex: 'required',
      key: 'required',
      width: 60,
      render: (required) => required ? <Tag color="red">是</Tag> : <Tag>否</Tag>
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditProperty(record)}
          />
          <Popconfirm
            title="确定要删除这个属性吗？"
            onConfirm={() => handleDeleteProperty(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 事件表格列定义
  const eventColumns = [
    {
      title: '标识符',
      dataIndex: 'identifier',
      key: 'identifier',
      width: 120,
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: '事件名称',
      dataIndex: 'name',
      key: 'name',
      width: 120
    },
    {
      title: '事件类型',
      dataIndex: 'eventType',
      key: 'eventType',
      width: 100,
      render: (type) => {
        const eventType = eventTypes.find(t => t.value === type);
        return <Tag color={eventType?.color}>{eventType?.label || type}</Tag>;
      }
    },
    {
      title: '输出参数',
      dataIndex: 'outputParams',
      key: 'outputParams',
      width: 100,
      render: (params) => `${params?.length || 0}个`
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditEvent(record)}
          />
          <Popconfirm
            title="确定要删除这个事件吗？"
            onConfirm={() => handleDeleteEvent(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 服务表格列定义
  const serviceColumns = [
    {
      title: '标识符',
      dataIndex: 'identifier',
      key: 'identifier',
      width: 120,
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: '服务名称',
      dataIndex: 'name',
      key: 'name',
      width: 120
    },
    {
      title: '调用类型',
      dataIndex: 'callType',
      key: 'callType',
      width: 100,
      render: (type) => {
        const callType = serviceCallTypes.find(t => t.value === type);
        return <Tag color={type === 'sync' ? 'blue' : 'orange'}>{callType?.label || type}</Tag>;
      }
    },
    {
      title: '输入参数',
      dataIndex: 'inputParams',
      key: 'inputParams',
      width: 80,
      render: (params) => `${params?.length || 0}个`
    },
    {
      title: '输出参数',
      dataIndex: 'outputParams',
      key: 'outputParams',
      width: 80,
      render: (params) => `${params?.length || 0}个`
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditService(record)}
          />
          <Popconfirm
            title="确定要删除这个服务吗？"
            onConfirm={() => handleDeleteService(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Modal
      title={
        <div>
          <SettingOutlined style={{ marginRight: 8 }} />
          物模型编辑器 - {model?.name}
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={1200}
      footer={
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={handleSaveModel}>
            保存物模型
          </Button>
        </Space>
      }
      destroyOnClose
    >
      <Alert
        message="物模型编辑说明"
        description="物模型定义了设备的功能描述，包括属性、事件和服务。属性描述设备的状态，事件描述设备主动上报的信息，服务描述设备可执行的指令。"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane 
          tab={
            <span>
              <InfoCircleOutlined />
              属性定义 ({properties.length})
            </span>
          } 
          key="properties"
        >
          <Card
            title="属性列表"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddProperty}>
                添加属性
              </Button>
            }
            size="small"
          >
            <Table
              columns={propertyColumns}
              dataSource={properties}
              rowKey="id"
              size="small"
              pagination={false}
              scroll={{ y: 300 }}
            />
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <InfoCircleOutlined />
              事件定义 ({events.length})
            </span>
          }
          key="events"
        >
          <Card
            title="事件列表"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddEvent}>
                添加事件
              </Button>
            }
            size="small"
          >
            <Table
              columns={eventColumns}
              dataSource={events}
              rowKey="id"
              size="small"
              pagination={false}
              scroll={{ y: 300 }}
            />
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <InfoCircleOutlined />
              服务定义 ({services.length})
            </span>
          }
          key="services"
        >
          <Card
            title="服务列表"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddService}>
                添加服务
              </Button>
            }
            size="small"
          >
            <Table
              columns={serviceColumns}
              dataSource={services}
              rowKey="id"
              size="small"
              pagination={false}
              scroll={{ y: 300 }}
            />
          </Card>
        </TabPane>

        <TabPane 
          tab={
            <span>
              <CodeOutlined />
              JSON预览
            </span>
          } 
          key="json"
        >
          <Card title="物模型JSON" size="small">
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '16px', 
              borderRadius: '6px',
              fontSize: '12px',
              maxHeight: '400px',
              overflow: 'auto'
            }}>
              {JSON.stringify(generateModelJSON(), null, 2)}
            </pre>
          </Card>
        </TabPane>
      </Tabs>

      {/* 属性编辑弹窗 */}
      <Modal
        title={editingProperty ? '编辑属性' : '添加属性'}
        open={isPropertyModalVisible}
        onOk={handleSaveProperty}
        onCancel={() => setIsPropertyModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form form={propertyForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="标识符"
                name="identifier"
                rules={[
                  { required: true, message: '请输入标识符' },
                  { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '标识符必须以字母开头，只能包含字母、数字和下划线' }
                ]}
              >
                <Input placeholder="如：temperature" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="属性名称"
                name="name"
                rules={[{ required: true, message: '请输入属性名称' }]}
              >
                <Input placeholder="如：温度" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="数据类型"
                name="dataType"
                rules={[{ required: true, message: '请选择数据类型' }]}
              >
                <Select placeholder="请选择数据类型">
                  {dataTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      <div>
                        <div>{type.label}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{type.description}</div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="访问模式"
                name="accessMode"
                rules={[{ required: true, message: '请选择访问模式' }]}
              >
                <Select placeholder="请选择访问模式">
                  {accessModes.map(mode => (
                    <Option key={mode.value} value={mode.value}>
                      {mode.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="是否必需"
                name="required"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="描述"
            name="description"
          >
            <TextArea 
              rows={3} 
              placeholder="请输入属性描述..."
              showCount
              maxLength={200}
            />
          </Form.Item>

          <Form.Item
            label="规格说明"
            name="specs"
          >
            <TextArea 
              rows={2} 
              placeholder="如：取值范围、单位、精度等规格说明..."
              showCount
              maxLength={200}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 事件编辑弹窗 */}
      <Modal
        title={editingEvent ? '编辑事件' : '添加事件'}
        open={isEventModalVisible}
        onOk={handleSaveEvent}
        onCancel={() => setIsEventModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form form={eventForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="标识符"
                name="identifier"
                rules={[
                  { required: true, message: '请输入标识符' },
                  { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '标识符必须以字母开头，只能包含字母、数字和下划线' }
                ]}
              >
                <Input placeholder="如：temperature_alarm" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="事件名称"
                name="name"
                rules={[{ required: true, message: '请输入事件名称' }]}
              >
                <Input placeholder="如：温度报警" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="事件类型"
                name="eventType"
                rules={[{ required: true, message: '请选择事件类型' }]}
              >
                <Select placeholder="请选择事件类型">
                  {eventTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      <div>
                        <div>{type.label}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{type.description}</div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="描述"
            name="description"
          >
            <TextArea
              rows={3}
              placeholder="请输入事件描述..."
              showCount
              maxLength={200}
            />
          </Form.Item>

          <Form.Item
            label="输出参数"
            name="outputParams"
            tooltip="事件触发时输出的参数列表"
          >
            <TextArea
              rows={2}
              placeholder="如：[{name: 'temperature', type: 'float', description: '当前温度值'}]"
              showCount
              maxLength={500}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 服务编辑弹窗 */}
      <Modal
        title={editingService ? '编辑服务' : '添加服务'}
        open={isServiceModalVisible}
        onOk={handleSaveService}
        onCancel={() => setIsServiceModalVisible(false)}
        width={700}
        destroyOnClose
      >
        <Form form={serviceForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="标识符"
                name="identifier"
                rules={[
                  { required: true, message: '请输入标识符' },
                  { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '标识符必须以字母开头，只能包含字母、数字和下划线' }
                ]}
              >
                <Input placeholder="如：set_temperature" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="服务名称"
                name="name"
                rules={[{ required: true, message: '请输入服务名称' }]}
              >
                <Input placeholder="如：设置温度" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="调用类型"
                name="callType"
                rules={[{ required: true, message: '请选择调用类型' }]}
              >
                <Select placeholder="请选择调用类型">
                  {serviceCallTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      <div>
                        <div>{type.label}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{type.description}</div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="描述"
            name="description"
          >
            <TextArea
              rows={3}
              placeholder="请输入服务描述..."
              showCount
              maxLength={200}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="输入参数"
                name="inputParams"
                tooltip="调用服务时需要传入的参数列表"
              >
                <TextArea
                  rows={3}
                  placeholder="如：[{name: 'target_temp', type: 'float', description: '目标温度'}]"
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="输出参数"
                name="outputParams"
                tooltip="服务执行后返回的参数列表"
              >
                <TextArea
                  rows={3}
                  placeholder="如：[{name: 'result', type: 'boolean', description: '执行结果'}]"
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Modal>
  );
};

export default ThingModelEditor;
