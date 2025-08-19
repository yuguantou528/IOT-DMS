import React, { useState } from 'react';
import { Button, Card, Space, Typography, message } from 'antd';
import FenceDrawMap from './index';

const { Title, Text } = Typography;

const FullscreenTest = () => {
  const [fenceData, setFenceData] = useState(null);
  const [drawMode, setDrawMode] = useState('polygon');

  const handleFenceChange = (data) => {
    setFenceData(data);
    console.log('围栏数据更新:', data);
  };

  const testFullscreenAPI = () => {
    if (document.fullscreenEnabled || 
        document.webkitFullscreenEnabled || 
        document.mozFullScreenEnabled || 
        document.msFullscreenEnabled) {
      message.success('浏览器支持全屏API');
    } else {
      message.error('浏览器不支持全屏API');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <Title level={3}>围栏地图全屏功能测试</Title>
        
        <Space style={{ marginBottom: '16px' }}>
          <Button 
            type={drawMode === 'polygon' ? 'primary' : 'default'}
            onClick={() => setDrawMode('polygon')}
          >
            多边形模式
          </Button>
          <Button 
            type={drawMode === 'circle' ? 'primary' : 'default'}
            onClick={() => setDrawMode('circle')}
          >
            圆形模式
          </Button>
          <Button onClick={testFullscreenAPI}>
            测试全屏API支持
          </Button>
        </Space>

        <div style={{ marginBottom: '16px' }}>
          <Text strong>使用说明：</Text>
          <ul style={{ marginTop: '8px' }}>
            <li>点击地图工具栏中的全屏按钮进入全屏模式</li>
            <li>在全屏模式下可以正常绘制围栏</li>
            <li>按ESC键或点击退出全屏按钮退出全屏</li>
            <li>全屏状态下围栏数据会保持不变</li>
          </ul>
        </div>

        <div style={{ height: '500px', border: '1px solid #d9d9d9', borderRadius: '8px' }}>
          <FenceDrawMap
            height="100%"
            drawMode={drawMode}
            onFenceChange={handleFenceChange}
            hideTypeSelector={false}
          />
        </div>

        {fenceData && (
          <Card style={{ marginTop: '16px' }} size="small">
            <Title level={5}>当前围栏数据：</Title>
            <pre style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px', fontSize: '12px' }}>
              {JSON.stringify(fenceData, null, 2)}
            </pre>
          </Card>
        )}
      </Card>
    </div>
  );
};

export default FullscreenTest;
