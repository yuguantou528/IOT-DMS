import React, { useState } from 'react';
import { Button, Card, Typography, Space, message } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import MapPicker from './index';

const { Title, Text } = Typography;

const MapPickerTest = () => {
  const [isMapPickerVisible, setIsMapPickerVisible] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState({
    longitude: 110.3500,
    latitude: 29.2500
  });

  const handleMapConfirm = (position) => {
    setSelectedPosition(position);
    setIsMapPickerVisible(false);
    message.success(`位置选择成功: ${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}`);
  };

  const handleOpenMapPicker = () => {
    setIsMapPickerVisible(true);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <Title level={3}>地图选点组件测试</Title>
        
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Text strong>当前选择的位置：</Text>
            <div style={{ marginTop: '8px' }}>
              <Text>经度: {selectedPosition.longitude.toFixed(6)}</Text>
              <br />
              <Text>纬度: {selectedPosition.latitude.toFixed(6)}</Text>
            </div>
          </div>

          <Button
            type="primary"
            icon={<EnvironmentOutlined />}
            onClick={handleOpenMapPicker}
            size="large"
          >
            打开地图选点
          </Button>

          <div style={{ marginTop: '16px' }}>
            <Text strong>使用说明：</Text>
            <ul style={{ marginTop: '8px' }}>
              <li>点击"打开地图选点"按钮打开地图选择器</li>
              <li>在地图上点击任意位置设置位置</li>
              <li>拖拽标记调整精确位置</li>
              <li>手动输入经纬度坐标</li>
              <li>点击"获取当前位置"使用GPS定位</li>
              <li>点击"确定"保存选择的位置</li>
            </ul>
          </div>
        </Space>
      </Card>

      {/* 地图选点组件 */}
      <MapPicker
        visible={isMapPickerVisible}
        onCancel={() => setIsMapPickerVisible(false)}
        onConfirm={handleMapConfirm}
        initialPosition={selectedPosition}
      />
    </div>
  );
};

export default MapPickerTest;
