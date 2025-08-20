import React, { useState } from 'react';
import { Card, Radio, Typography, Space, Button, message } from 'antd';
import CoordinateInput from './index';

const { Title, Text } = Typography;

const CoordinateInputTest = () => {
  const [fenceType, setFenceType] = useState('polygon');
  const [isEditing, setIsEditing] = useState(false);
  const [fenceData, setFenceData] = useState(null);

  const handleFenceChange = (data) => {
    setFenceData(data);
    console.log('围栏数据更新:', data);
  };

  const resetTest = () => {
    setFenceData(null);
    setIsEditing(false);
    message.info('测试重置完成');
  };

  const simulateEditMode = () => {
    setIsEditing(true);
    // 模拟编辑模式的数据
    if (fenceType === 'polygon') {
      setFenceData({
        type: 'polygon',
        coordinates: [
          [29.25, 110.35],
          [29.26, 110.36],
          [29.27, 110.35],
          [29.28, 110.37] // 添加第4个点用于测试
        ],
        center: null,
        radius: null
      });
    } else {
      setFenceData({
        type: 'circle',
        coordinates: null,
        center: [29.25, 110.35],
        radius: 500
      });
    }
    message.info('已切换到编辑模式');
  };

  const testAddMorePoints = () => {
    // 测试添加更多顶点的功能
    if (fenceType === 'polygon') {
      setFenceData({
        type: 'polygon',
        coordinates: [
          [29.25, 110.35],
          [29.26, 110.36],
          [29.27, 110.35],
          [29.28, 110.37],
          [29.29, 110.38],
          [29.30, 110.39] // 6个点
        ],
        center: null,
        radius: null
      });
      message.info('已设置6个顶点用于测试');
    }
  };

  const testThreePoints = () => {
    // 测试3个完整顶点的情况
    if (fenceType === 'polygon') {
      setFenceData({
        type: 'polygon',
        coordinates: [
          [29.25, 110.35],
          [29.26, 110.36],
          [29.27, 110.35]
        ],
        center: null,
        radius: null
      });
      message.info('已设置3个完整顶点，现在可以测试添加第4个顶点');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <Title level={3}>坐标输入组件测试</Title>
        
        <Space style={{ marginBottom: '16px' }}>
          <Text strong>围栏类型：</Text>
          <Radio.Group 
            value={fenceType} 
            onChange={(e) => setFenceType(e.target.value)}
          >
            <Radio value="polygon">多边形</Radio>
            <Radio value="circle">圆形</Radio>
          </Radio.Group>
        </Space>

        <Space style={{ marginBottom: '16px', marginLeft: '16px' }}>
          <Text strong>模式：</Text>
          <Radio.Group 
            value={isEditing} 
            onChange={(e) => setIsEditing(e.target.value)}
          >
            <Radio value={false}>新增模式</Radio>
            <Radio value={true}>编辑模式</Radio>
          </Radio.Group>
        </Space>

        <div style={{ marginBottom: '16px' }}>
          <Space>
            <Button onClick={resetTest}>重置测试</Button>
            <Button type="primary" onClick={simulateEditMode}>
              模拟编辑模式
            </Button>
            <Button onClick={testAddMorePoints} disabled={fenceType !== 'polygon'}>
              测试6个顶点
            </Button>
            <Button onClick={testThreePoints} disabled={fenceType !== 'polygon'}>
              测试3个顶点
            </Button>
          </Space>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <Text strong>测试说明：</Text>
          <ul style={{ marginTop: '8px' }}>
            <li><strong>新增模式</strong>：坐标输入框应该为空，不显示默认值</li>
            <li><strong>编辑模式</strong>：坐标输入框应该显示现有的围栏数据</li>
            <li>只有输入有效坐标后才会触发onChange事件</li>
            <li>多边形需要至少3个有效顶点才会生成围栏数据</li>
            <li>圆形需要中心点和半径都有效才会生成围栏数据</li>
            <li><strong style={{color: '#ff4d4f'}}>测试重点</strong>：验证添加顶点功能，应该能够添加超过3个顶点（最多20个）</li>
          </ul>
        </div>

        <div style={{ 
          border: '1px solid #d9d9d9', 
          borderRadius: '8px', 
          padding: '16px',
          marginBottom: '16px'
        }}>
          <CoordinateInput
            fenceType={fenceType}
            coordinates={fenceData?.coordinates}
            center={fenceData?.center}
            radius={fenceData?.radius}
            onChange={handleFenceChange}
            isEditing={isEditing}
          />
        </div>

        {fenceData && (
          <Card size="small" title="当前围栏数据">
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '8px', 
              borderRadius: '4px', 
              fontSize: '12px',
              overflow: 'auto'
            }}>
              {JSON.stringify(fenceData, null, 2)}
            </pre>
          </Card>
        )}

        {!fenceData && (
          <Card size="small" title="围栏数据状态">
            <Text type="secondary">暂无围栏数据</Text>
          </Card>
        )}
      </Card>
    </div>
  );
};

export default CoordinateInputTest;
