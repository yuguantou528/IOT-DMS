import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Row,
  Col,
  Divider,
  Typography,
  Alert,
  Space,
  Radio,
  Card,
  Steps,
  Button,
  Tabs
} from 'antd';
import {
  InfoCircleOutlined,
  EnvironmentOutlined,
  RadiusUpleftOutlined,
  EditOutlined,
  AimOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import FenceDrawMap from '../FenceDrawMap';
import CoordinateInput from '../CoordinateInput';
import DeviceAssociation from '../DeviceAssociation';
import styles from './index.module.css';

const { TextArea } = Input;
const { Option } = Select;
const { Text, Title } = Typography;
const { Step } = Steps;

const FenceEditModal = ({
  visible,
  onCancel,
  onOk,
  editingFence = null,
  loading = false
}) => {
  const [form] = Form.useForm();
  const [fenceData, setFenceData] = useState(null);
  const [mapKey, setMapKey] = useState(0); // 用于强制重新渲染地图

  // 新增状态管理
  const [fenceType, setFenceType] = useState('polygon'); // 围栏类型：polygon | circle
  const [inputMethod, setInputMethod] = useState('map'); // 输入方式：map | coordinate
  const [associatedDevices, setAssociatedDevices] = useState([]); // 关联的设备列表
  const [activeTab, setActiveTab] = useState('basic'); // 当前激活的标签页

  // 告警类型选项
  const alarmTypes = [
    { value: 'enter', label: '进入告警', description: '设备进入围栏区域时触发告警' },
    { value: 'exit', label: '离开告警', description: '设备离开围栏区域时触发告警' },
    { value: 'both', label: '进出告警', description: '设备进入或离开围栏区域时都触发告警' }
  ];



  // 处理围栏类型变化
  const handleFenceTypeChange = (e) => {
    const newType = e.target.value;
    setFenceType(newType);
    setFenceData(null); // 清空之前的围栏数据
    setMapKey(prev => prev + 1); // 重新渲染地图
  };

  // 处理输入方式变化
  const handleInputMethodChange = (e) => {
    const newMethod = e.target.value;
    setInputMethod(newMethod);

    // 如果切换到地图绘制模式，清除之前的围栏数据（除非是编辑模式）
    if (newMethod === 'map' && !editingFence) {
      setFenceData(null);
      setMapKey(prev => prev + 1); // 重新渲染地图
    }
  };

  // 初始化表单数据
  useEffect(() => {
    if (visible) {
      if (editingFence) {
        // 编辑模式：设置初始状态
        setFenceType(editingFence.type);
        // 编辑模式
        form.setFieldsValue({
          name: editingFence.name,
          description: editingFence.description,
          alarmType: editingFence.alarmType,
          status: editingFence.status === 'active'
        });

        // 设置围栏数据
        if (editingFence.type === 'polygon') {
          setFenceData({
            type: 'polygon',
            coordinates: editingFence.coordinates,
            center: null,
            radius: null
          });
        } else if (editingFence.type === 'circle') {
          setFenceData({
            type: 'circle',
            coordinates: null,
            center: editingFence.center,
            radius: editingFence.radius
          });
        }

        // 设置关联设备数据
        setAssociatedDevices(editingFence.associatedDevices || []);
      } else {
        // 新增模式：重置所有状态
        form.resetFields();
        form.setFieldsValue({
          status: true, // 默认启用
          alarmType: 'both' // 默认进出告警
        });
        setFenceData(null);
        setFenceType('polygon');
        setInputMethod('map');
        setAssociatedDevices([]);
        setActiveTab('basic');
      }

      // 延迟重新渲染地图，确保DOM已经准备好
      setTimeout(() => {
        setMapKey(prev => prev + 1);
      }, 100);
    }
  }, [visible, editingFence, form]);

  // 处理围栏数据变化（来自地图绘制）
  const handleFenceChange = (newFenceData) => {
    setFenceData(newFenceData);
  };

  // 处理坐标输入变化
  const handleCoordinateChange = (newFenceData) => {
    setFenceData(newFenceData);
    // 强制重新渲染地图以同步坐标输入的变化
    setMapKey(prev => prev + 1);
  };

  // 坐标验证函数
  const validateCoordinates = (fenceData) => {
    if (!fenceData) {
      return { valid: false, message: '请在地图上绘制围栏区域或手动输入坐标' };
    }

    if (fenceData.type === 'polygon') {
      if (!fenceData.coordinates || fenceData.coordinates.length < 3) {
        return { valid: false, message: '多边形围栏至少需要3个顶点' };
      }

      // 验证每个坐标点
      for (let i = 0; i < fenceData.coordinates.length; i++) {
        const [lat, lng] = fenceData.coordinates[i];
        if (lat < -90 || lat > 90) {
          return { valid: false, message: `第${i + 1}个顶点的纬度超出范围(-90°到90°)` };
        }
        if (lng < -180 || lng > 180) {
          return { valid: false, message: `第${i + 1}个顶点的经度超出范围(-180°到180°)` };
        }
      }
    } else if (fenceData.type === 'circle') {
      if (!fenceData.center || fenceData.center.length !== 2) {
        return { valid: false, message: '请设置圆形围栏的中心点坐标' };
      }

      const [lat, lng] = fenceData.center;
      if (lat < -90 || lat > 90) {
        return { valid: false, message: '中心点纬度超出范围(-90°到90°)' };
      }
      if (lng < -180 || lng > 180) {
        return { valid: false, message: '中心点经度超出范围(-180°到180°)' };
      }

      if (!fenceData.radius || fenceData.radius < 10 || fenceData.radius > 100000) {
        return { valid: false, message: '圆形围栏半径应在10米到100公里之间' };
      }
    }

    return { valid: true };
  };

  // 处理确认
  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      // 验证围栏数据
      const validation = validateCoordinates(fenceData);
      if (!validation.valid) {
        Modal.error({
          title: '围栏数据验证失败',
          content: validation.message
        });
        return;
      }

      // 组装提交数据
      const submitData = {
        name: values.name,
        description: values.description,
        alarmType: values.alarmType,
        status: values.status ? 'active' : 'inactive',
        type: fenceData.type,
        coordinates: fenceData.coordinates,
        center: fenceData.center,
        radius: fenceData.radius,
        associatedDevices: associatedDevices
      };

      await onOk(submitData);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 处理取消
  const handleCancel = () => {
    form.resetFields();
    setFenceData(null);
    setAssociatedDevices([]);
    setActiveTab('basic');
    onCancel();
  };

  return (
    <Modal
      title={editingFence ? '编辑电子围栏' : '新增电子围栏'}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={1400}
      className={styles.fenceEditModal}
      confirmLoading={loading}
      destroyOnClose
      maskClosable={false}
      style={{ top: 20 }}
      styles={{
        header: {
          padding: '8px 24px',
          minHeight: 'auto',
          fontSize: '16px',
          fontWeight: '500'
        },
        body: {
          padding: '16px 24px',
          maxHeight: 'calc(100vh - 180px)',
          overflowY: 'auto',
          overflowX: 'hidden'
        },
        footer: {
          padding: '8px 24px',
          minHeight: 'auto'
        }
      }}
    >
      <div className={styles.modalContent}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'basic',
              label: '基本信息',
              children: (
                <Row gutter={24}>
          {/* 左侧表单和坐标输入 */}
          <Col span={10}>
            <div className={styles.formSection}>
              {/* 围栏类型和输入方式选择 */}
              {!editingFence && (
                <Card size="small" className={styles.selectionCard} style={{ marginBottom: 16 }}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <div className={styles.selectorGroup}>
                        <Text strong style={{ display: 'block', marginBottom: 8 }}>围栏类型</Text>
                        <Radio.Group
                          value={fenceType}
                          onChange={handleFenceTypeChange}
                          style={{ width: '100%' }}
                        >
                          <Radio.Button value="polygon" style={{ width: '50%', textAlign: 'center' }}>
                            多边形
                          </Radio.Button>
                          <Radio.Button value="circle" style={{ width: '50%', textAlign: 'center' }}>
                            圆形
                          </Radio.Button>
                        </Radio.Group>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className={styles.selectorGroup}>
                        <Text strong style={{ display: 'block', marginBottom: 8 }}>输入方式</Text>
                        <Radio.Group
                          value={inputMethod}
                          onChange={handleInputMethodChange}
                          style={{ width: '100%' }}
                        >
                          <Radio.Button value="map" style={{ width: '50%', textAlign: 'center' }}>
                            地图绘制
                          </Radio.Button>
                          <Radio.Button value="coordinate" style={{ width: '50%', textAlign: 'center' }}>
                            坐标输入
                          </Radio.Button>
                        </Radio.Group>
                      </div>
                    </Col>
                  </Row>
                </Card>
              )}

              {/* 围栏信息配置表单 */}
              <Form
                form={form}
                layout="vertical"
                className={styles.fenceForm}
              >
                <Form.Item
                  label="围栏名称"
                  name="name"
                  rules={[
                    { required: true, message: '请输入围栏名称' },
                    { max: 50, message: '围栏名称不能超过50个字符' }
                  ]}
                >
                  <Input placeholder="请输入围栏名称" />
                </Form.Item>

                <Form.Item
                  label="告警类型"
                  name="alarmType"
                  rules={[{ required: true, message: '请选择告警类型' }]}
                >
                  <Select placeholder="请选择告警类型">
                    {alarmTypes.map(type => (
                      <Option key={type.value} value={type.value}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '500' }}>{type.label}</span>
                          <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
                            {type.description}
                          </span>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="启用状态"
                  name="status"
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="启用"
                    unCheckedChildren="禁用"
                  />
                </Form.Item>

                {/* 围栏信息显示 - 移到中间位置 */}
                {fenceData && (
                  <div className={styles.fenceInfo}>
                    <Divider orientation="left" orientationMargin="0">
                      <Text strong>围栏信息</Text>
                    </Divider>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <div className={styles.infoItem}>
                        <Text type="secondary">类型：</Text>
                        <Text>{fenceData.type === 'polygon' ? '多边形围栏' : '圆形围栏'}</Text>
                      </div>
                      {fenceData.type === 'polygon' && fenceData.coordinates && (
                        <div className={styles.infoItem}>
                          <Text type="secondary">顶点数：</Text>
                          <Text>{fenceData.coordinates.length} 个</Text>
                        </div>
                      )}
                      {fenceData.type === 'circle' && fenceData.radius && (
                        <div className={styles.infoItem}>
                          <Text type="secondary">半径：</Text>
                          <Text>{Math.round(fenceData.radius)} 米</Text>
                        </div>
                      )}
                    </Space>
                  </div>
                )}

                <Form.Item
                  label="围栏描述"
                  name="description"
                  rules={[
                    { required: true, message: '请输入围栏描述' },
                    { max: 200, message: '描述不能超过200个字符' }
                  ]}
                >
                  <TextArea
                    rows={4}
                    placeholder="请详细描述围栏的用途和监控范围..."
                    showCount
                    maxLength={200}
                  />
                </Form.Item>
              </Form>


            </div>
          </Col>

          {/* 右侧地图 - 仅在地图绘制模式下显示 */}
          <Col span={14}>
            {inputMethod === 'map' && (
                <div className={styles.mapSection}>
                  <div className={styles.mapHeader}>
                    <Text strong>围栏绘制</Text>
                    <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                      在地图上绘制{editingFence?.type === 'circle' || fenceType === 'circle' ? '圆形' : '多边形'}围栏区域
                    </Text>
                  </div>

                  <FenceDrawMap
                    key={mapKey}
                    height="450px"
                    onFenceChange={handleFenceChange}
                    drawMode={editingFence?.type || fenceType}
                    hideTypeSelector={true}
                    initialFence={editingFence || (inputMethod === 'coordinate' && fenceData ? {
                      type: fenceData.type,
                      coordinates: fenceData.coordinates,
                      center: fenceData.center,
                      radius: fenceData.radius
                    } : null)}
                    center={fenceData?.center || fenceData?.coordinates?.[0] || editingFence?.center || editingFence?.coordinates?.[0] || [29.2500, 110.3500]}
                    zoom={fenceData || editingFence ? 14 : 12}
                  />

                  <Alert
                    message="绘制说明"
                    description={
                      <ul style={{ margin: '8px 0 0 0', paddingLeft: '16px' }}>
                        {(editingFence?.type === 'polygon' || fenceType === 'polygon') && (
                          <li>多边形围栏：点击地图设置顶点，双击完成绘制（至少需要3个顶点）</li>
                        )}
                        {(editingFence?.type === 'circle' || fenceType === 'circle') && (
                          <li>圆形围栏：点击设置圆心，移动鼠标调整半径，双击完成</li>
                        )}
                        <li>可以使用工具栏的撤销、清除、完成等功能</li>
                      </ul>
                    }
                    type="info"
                    showIcon
                    icon={<InfoCircleOutlined />}
                    style={{ marginTop: '12px' }}
                  />
                </div>
            )}

            {/* 坐标输入模式 */}
            {inputMethod === 'coordinate' && (
              <div className={styles.coordinateSection}>
                <div className={styles.coordinateHeader}>
                  <Text strong>坐标输入</Text>
                  <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                    手动输入精确的{fenceType === 'circle' ? '圆形' : '多边形'}围栏坐标
                  </Text>
                </div>

                <CoordinateInput
                  fenceType={editingFence?.type || fenceType}
                  coordinates={fenceData?.coordinates}
                  center={fenceData?.center}
                  radius={fenceData?.radius}
                  onChange={handleCoordinateChange}
                />
              </div>
            )}
          </Col>
                </Row>
              )
            },
            {
              key: 'devices',
              label: '关联设备',
              children: (
                <DeviceAssociation
                  selectedDevices={associatedDevices}
                  onDeviceChange={setAssociatedDevices}
                />
              )
            }
          ]}
        />
      </div>
    </Modal>
  );
};

export default FenceEditModal;
