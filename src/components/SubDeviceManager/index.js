import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Space,
  List,
  Typography,
  Tag,
  Popconfirm,
  Divider,
  message,
  Badge
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  NodeIndexOutlined,
  LinkOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import styles from './index.module.css';
import DeviceSelector from '../DeviceSelector';

const { Text, Title } = Typography;

const SubDeviceManager = ({
  visible,
  onCancel,
  onSave,
  productData,
  title = "子设备管理"
}) => {
  const [linkedDevices, setLinkedDevices] = useState(productData?.linkedDevices || []);
  const [isDeviceSelectorVisible, setIsDeviceSelectorVisible] = useState(false);

  // 监听productData变化，更新linkedDevices
  useEffect(() => {
    setLinkedDevices(productData?.linkedDevices || []);
  }, [productData]);

  // 添加关联设备
  const handleAddLinkedDevice = () => {
    setIsDeviceSelectorVisible(true);
  };

  // 确认选择设备
  const handleConfirmDeviceSelection = (selectedDevices) => {
    const newLinkedDevices = [...linkedDevices, ...selectedDevices];
    setLinkedDevices(newLinkedDevices);
    setIsDeviceSelectorVisible(false);
    message.success(`成功关联 ${selectedDevices.length} 个设备`);
  };

  // 删除关联设备
  const handleDeleteLinkedDevice = (deviceId) => {
    const newLinkedDevices = linkedDevices.filter(item => item.id !== deviceId);
    setLinkedDevices(newLinkedDevices);
    message.success('设备关联已移除');
  };

  // 保存所有关联设备到模板
  const handleSaveAll = () => {
    const updatedProductData = {
      ...productData,
      linkedDevices: linkedDevices
    };
    onSave(updatedProductData);
  };

  return (
    <>
      {/* 主管理界面 */}
      <Modal
        title={title}
        open={visible}
        onCancel={onCancel}
        width={900}
        footer={[
          <Button key="cancel" onClick={onCancel}>
            取消
          </Button>,
          <Button key="save" type="primary" onClick={handleSaveAll}>
            保存
          </Button>
        ]}
        destroyOnClose
      >
        <div className={styles.subDeviceManager}>
          <div className={styles.header}>
            <div className={styles.templateInfo}>
              <Title level={5}>模板：{productData?.name}</Title>
              <Text type="secondary">设备类型：{productData?.deviceTypeName}</Text>
            </div>
            <Button
              type="primary"
              icon={<LinkOutlined />}
              onClick={handleAddLinkedDevice}
            >
              关联设备
            </Button>
          </div>

          <div className={styles.tipSection}>
            <InfoCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            <Text type="secondary">
              从设备管理模块中选择已存在的设备进行关联，只能关联设备类型为
              <Tag color="green" style={{ margin: '0 4px' }}>{productData?.deviceTypeName}</Tag>
              的设备
            </Text>
          </div>

          <Divider />

          <List
            dataSource={linkedDevices}
            locale={{ emptyText: '暂无关联设备，点击上方按钮关联设备' }}
            renderItem={(device) => (
              <List.Item
                className={styles.subDeviceItem}
                actions={[
                  <Popconfirm
                    title="确定要移除这个设备关联吗？"
                    onConfirm={() => handleDeleteLinkedDevice(device.id)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button type="link" danger icon={<DeleteOutlined />}>
                      移除关联
                    </Button>
                  </Popconfirm>
                ]}
              >
                <List.Item.Meta
                  avatar={<NodeIndexOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                  title={
                    <div>
                      <Text strong>{device.name}</Text>
                      <Tag color="blue" style={{ marginLeft: 8 }}>{device.deviceCode}</Tag>
                      <Badge
                        status={device.status === 'online' ? 'success' : 'default'}
                        text={device.status === 'online' ? '在线' : '离线'}
                        style={{ marginLeft: 8 }}
                      />
                    </div>
                  }
                  description={
                    <div>
                      <p><Text type="secondary">厂商：</Text>{device.manufacturerName}</p>
                      <p><Text type="secondary">型号：</Text>{device.modelName}</p>
                      <p><Text type="secondary">位置：</Text>{device.location}</p>
                      <p><Text type="secondary">IP地址：</Text>{device.ipAddress}:{device.port}</p>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      </Modal>

      {/* 设备选择器 */}
      <DeviceSelector
        visible={isDeviceSelectorVisible}
        onCancel={() => setIsDeviceSelectorVisible(false)}
        onConfirm={handleConfirmDeviceSelection}
        productDeviceType={productData?.deviceType}
        productId={productData?.id}
        excludeDeviceIds={linkedDevices.map(device => device.id)}
        title={`为模板 "${productData?.name}" 选择关联设备`}
      />
    </>
  );
};

export default SubDeviceManager;
