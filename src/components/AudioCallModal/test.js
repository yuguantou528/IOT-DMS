import React, { useState } from 'react';
import { Button, Space } from 'antd';
import AudioCallModal from './index';

const AudioCallTest = () => {
  const [visible, setVisible] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);

  // 模拟设备数据
  const testDevices = [
    {
      id: 6,
      name: '单兵执法记录仪-006',
      type: 'body_camera',
      status: 'online',
      deviceId: '6'
    },
    {
      id: 7,
      name: '单兵执法记录仪-007',
      type: 'body_camera',
      status: 'offline',
      deviceId: '7'
    }
  ];

  const handleTestCall = (device) => {
    setSelectedDevice(device);
    setVisible(true);
  };

  const handleCallStatusChange = (status, data) => {
    console.log('呼叫状态变化:', status, data);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>语音呼叫功能测试</h2>
      <Space direction="vertical" size="large">
        {testDevices.map(device => (
          <div key={device.id} style={{ 
            border: '1px solid #d9d9d9', 
            padding: '16px', 
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div><strong>{device.name}</strong></div>
              <div>状态: {device.status === 'online' ? '在线' : '离线'}</div>
              <div>设备ID: {device.deviceId}</div>
            </div>
            <Button 
              type="primary"
              onClick={() => handleTestCall(device)}
              disabled={device.status !== 'online'}
            >
              语音呼叫
            </Button>
          </div>
        ))}
      </Space>

      <AudioCallModal
        visible={visible}
        onCancel={() => setVisible(false)}
        device={selectedDevice}
        onCallStatusChange={handleCallStatusChange}
      />
    </div>
  );
};

export default AudioCallTest;
