import React, { useState } from 'react';
import { Button, Space, Card, Typography, message } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import FenceEditModal from '../../components/FenceEditModal';

const { Title, Text } = Typography;

const FenceTest = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFence, setEditingFence] = useState(null);
  const [fences, setFences] = useState([]);

  // 打开新增围栏弹窗
  const handleAddFence = () => {
    setEditingFence(null);
    setModalVisible(true);
  };

  // 打开编辑围栏弹窗
  const handleEditFence = (fence) => {
    setEditingFence(fence);
    setModalVisible(true);
  };

  // 处理围栏保存
  const handleFenceSave = (fenceData) => {
    if (editingFence) {
      // 编辑模式
      setFences(prev => prev.map(fence => 
        fence.id === editingFence.id ? { ...fenceData, id: editingFence.id } : fence
      ));
      message.success('围栏更新成功');
    } else {
      // 新增模式
      const newFence = {
        ...fenceData,
        id: Date.now(),
        createTime: new Date().toLocaleString()
      };
      setFences(prev => [...prev, newFence]);
      message.success('围栏创建成功');
    }
    setModalVisible(false);
  };

  // 处理弹窗关闭
  const handleModalClose = () => {
    setModalVisible(false);
    setEditingFence(null);
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>电子围栏管理测试</Title>
        <Text type="secondary">
          测试围栏编辑功能，包括手动坐标输入和全屏地图显示
        </Text>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddFence}
          size="large"
        >
          新增围栏
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {fences.map(fence => (
          <Card
            key={fence.id}
            title={fence.name}
            size="small"
            actions={[
              <Button
                key="edit"
                type="link"
                icon={<EditOutlined />}
                onClick={() => handleEditFence(fence)}
              >
                编辑
              </Button>
            ]}
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div>
                <Text strong>类型：</Text>
                <Text>{fence.type === 'polygon' ? '多边形围栏' : '圆形围栏'}</Text>
              </div>
              {fence.type === 'polygon' && fence.coordinates && (
                <div>
                  <Text strong>顶点数：</Text>
                  <Text>{fence.coordinates.length} 个</Text>
                </div>
              )}
              {fence.type === 'circle' && fence.radius && (
                <div>
                  <Text strong>半径：</Text>
                  <Text>{Math.round(fence.radius)} 米</Text>
                </div>
              )}
              <div>
                <Text strong>创建时间：</Text>
                <Text type="secondary">{fence.createTime}</Text>
              </div>
              {fence.description && (
                <div>
                  <Text strong>描述：</Text>
                  <Text>{fence.description}</Text>
                </div>
              )}
            </Space>
          </Card>
        ))}
      </div>

      {fences.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          background: '#fafafa',
          borderRadius: '8px',
          border: '1px dashed #d9d9d9'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
          <Title level={4} type="secondary">暂无围栏数据</Title>
          <Text type="secondary">点击"新增围栏"按钮开始创建您的第一个电子围栏</Text>
        </div>
      )}

      <FenceEditModal
        visible={modalVisible}
        editingFence={editingFence}
        onSave={handleFenceSave}
        onCancel={handleModalClose}
      />
    </div>
  );
};

export default FenceTest;
