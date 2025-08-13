import React, { useState } from 'react';
import { Badge, Space, Typography } from 'antd';
import styles from './index.module.css';

const { Text } = Typography;

const TopologyRenderer = ({ topologyType = 'mesh', deviceInfo, onNodeSelect }) => {
  const [selectedNode, setSelectedNode] = useState(null);

  // 节点颜色配置
  const getNodeColor = (type, status) => {
    if (status === 'offline') return '#ff4d4f';
    switch (type) {
      case 'main': return '#1890ff';
      case 'relay': return '#52c41a';
      case 'endpoint': return '#faad14';
      default: return '#722ed1';
    }
  };

  // 处理节点点击
  const handleNodeClick = (node) => {
    setSelectedNode(node);
    if (onNodeSelect) {
      onNodeSelect(node);
    }
  };

  // 星型拓扑
  const renderStarTopology = () => {
    const centerNode = { id: 'center', label: '中心节点', type: 'main', status: 'online', x: 300, y: 200 };
    const leafNodes = [
      { id: 'leaf1', label: '终端-1', type: 'endpoint', status: 'online', x: 200, y: 120 },
      { id: 'leaf2', label: '终端-2', type: 'endpoint', status: 'online', x: 400, y: 120 },
      { id: 'leaf3', label: '终端-3', type: 'endpoint', status: 'online', x: 450, y: 250 },
      { id: 'leaf4', label: '终端-4', type: 'endpoint', status: 'offline', x: 400, y: 380 },
      { id: 'leaf5', label: '终端-5', type: 'endpoint', status: 'online', x: 200, y: 380 },
      { id: 'leaf6', label: '终端-6', type: 'endpoint', status: 'online', x: 150, y: 250 }
    ];

    return (
      <svg className={styles.topologySvg} viewBox="0 0 600 500">
        {/* 连接线 */}
        {leafNodes.map((node, index) => (
          <line
            key={`line-${index}`}
            x1={centerNode.x}
            y1={centerNode.y}
            x2={node.x}
            y2={node.y}
            stroke="#52c41a"
            strokeWidth="2"
            className={styles.connectionLine}
          />
        ))}
        
        {/* 叶子节点 */}
        {leafNodes.map((node) => (
          <g key={node.id} className={styles.nodeGroup} onClick={() => handleNodeClick(node)}>
            <circle
              cx={node.x}
              cy={node.y}
              r="20"
              fill={getNodeColor(node.type, node.status)}
              stroke="#fff"
              strokeWidth="2"
              className={styles.nodeCircle}
            />
            <text
              x={node.x}
              y={node.y + 4}
              fill="#fff"
              fontSize="10"
              textAnchor="middle"
              fontWeight="bold"
            >
              {node.id.replace('leaf', '')}
            </text>
            <text
              x={node.x}
              y={node.y + 35}
              fill="#333"
              fontSize="9"
              textAnchor="middle"
            >
              {node.label}
            </text>
          </g>
        ))}
        
        {/* 中心节点 */}
        <g className={styles.nodeGroup} onClick={() => handleNodeClick(centerNode)}>
          <circle
            cx={centerNode.x}
            cy={centerNode.y}
            r="25"
            fill={getNodeColor(centerNode.type, centerNode.status)}
            stroke="#fff"
            strokeWidth="3"
            className={styles.nodeCircle}
          />
          <text
            x={centerNode.x}
            y={centerNode.y + 4}
            fill="#fff"
            fontSize="12"
            textAnchor="middle"
            fontWeight="bold"
          >
            HUB
          </text>
          <text
            x={centerNode.x}
            y={centerNode.y + 45}
            fill="#333"
            fontSize="10"
            textAnchor="middle"
          >
            {centerNode.label}
          </text>
        </g>
      </svg>
    );
  };

  // 树型拓扑
  const renderTreeTopology = () => {
    const nodes = [
      { id: 'root', label: '根节点', type: 'main', status: 'online', x: 300, y: 80 },
      { id: 'branch1', label: '分支-1', type: 'relay', status: 'online', x: 200, y: 180 },
      { id: 'branch2', label: '分支-2', type: 'relay', status: 'online', x: 400, y: 180 },
      { id: 'leaf1', label: '叶子-1', type: 'endpoint', status: 'online', x: 150, y: 280 },
      { id: 'leaf2', label: '叶子-2', type: 'endpoint', status: 'online', x: 250, y: 280 },
      { id: 'leaf3', label: '叶子-3', type: 'endpoint', status: 'offline', x: 350, y: 280 },
      { id: 'leaf4', label: '叶子-4', type: 'endpoint', status: 'online', x: 450, y: 280 }
    ];

    const connections = [
      { from: 'root', to: 'branch1' },
      { from: 'root', to: 'branch2' },
      { from: 'branch1', to: 'leaf1' },
      { from: 'branch1', to: 'leaf2' },
      { from: 'branch2', to: 'leaf3' },
      { from: 'branch2', to: 'leaf4' }
    ];

    return (
      <svg className={styles.topologySvg} viewBox="0 0 600 400">
        {/* 连接线 */}
        {connections.map((conn, index) => {
          const fromNode = nodes.find(n => n.id === conn.from);
          const toNode = nodes.find(n => n.id === conn.to);
          return (
            <line
              key={`line-${index}`}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke="#52c41a"
              strokeWidth="2"
              className={styles.connectionLine}
            />
          );
        })}
        
        {/* 节点 */}
        {nodes.map((node) => (
          <g key={node.id} className={styles.nodeGroup} onClick={() => handleNodeClick(node)}>
            <circle
              cx={node.x}
              cy={node.y}
              r="22"
              fill={getNodeColor(node.type, node.status)}
              stroke="#fff"
              strokeWidth="2"
              className={styles.nodeCircle}
            />
            <text
              x={node.x}
              y={node.y + 4}
              fill="#fff"
              fontSize="10"
              textAnchor="middle"
              fontWeight="bold"
            >
              {node.id === 'root' ? 'R' : node.id.includes('branch') ? 'B' : 'L'}
            </text>
            <text
              x={node.x}
              y={node.y + 35}
              fill="#333"
              fontSize="9"
              textAnchor="middle"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  // 环型拓扑
  const renderRingTopology = () => {
    const centerX = 300;
    const centerY = 220;
    const radius = 120;
    const nodeCount = 6;
    
    const nodes = Array.from({ length: nodeCount }, (_, i) => {
      const angle = (i * 2 * Math.PI) / nodeCount - Math.PI / 2;
      return {
        id: `node${i + 1}`,
        label: `节点-${i + 1}`,
        type: i === 0 ? 'main' : 'relay',
        status: i === 3 ? 'offline' : 'online',
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        angle
      };
    });

    return (
      <svg className={styles.topologySvg} viewBox="0 0 600 440">
        {/* 环形连接线 */}
        {nodes.map((node, index) => {
          const nextNode = nodes[(index + 1) % nodes.length];
          return (
            <line
              key={`line-${index}`}
              x1={node.x}
              y1={node.y}
              x2={nextNode.x}
              y2={nextNode.y}
              stroke="#52c41a"
              strokeWidth="2"
              className={styles.connectionLine}
            />
          );
        })}
        
        {/* 节点 */}
        {nodes.map((node, index) => (
          <g key={node.id} className={styles.nodeGroup} onClick={() => handleNodeClick(node)}>
            <circle
              cx={node.x}
              cy={node.y}
              r="22"
              fill={getNodeColor(node.type, node.status)}
              stroke="#fff"
              strokeWidth="2"
              className={styles.nodeCircle}
            />
            <text
              x={node.x}
              y={node.y + 4}
              fill="#fff"
              fontSize="10"
              textAnchor="middle"
              fontWeight="bold"
            >
              {index + 1}
            </text>
            <text
              x={node.x}
              y={node.y + 35}
              fill="#333"
              fontSize="9"
              textAnchor="middle"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  // 总线型拓扑
  const renderBusTopology = () => {
    const busY = 220;
    const busStartX = 100;
    const busEndX = 500;
    
    const nodes = [
      { id: 'node1', label: '节点-1', type: 'main', status: 'online', x: 150, y: busY },
      { id: 'node2', label: '节点-2', type: 'relay', status: 'online', x: 220, y: busY },
      { id: 'node3', label: '节点-3', type: 'relay', status: 'online', x: 290, y: busY },
      { id: 'node4', label: '节点-4', type: 'endpoint', status: 'offline', x: 360, y: busY },
      { id: 'node5', label: '节点-5', type: 'endpoint', status: 'online', x: 430, y: busY }
    ];

    return (
      <svg className={styles.topologySvg} viewBox="0 0 600 440">
        {/* 总线 */}
        <line
          x1={busStartX}
          y1={busY}
          x2={busEndX}
          y2={busY}
          stroke="#722ed1"
          strokeWidth="4"
          className={styles.busLine}
        />
        
        {/* 节点连接到总线的短线 */}
        {nodes.map((node, index) => (
          <line
            key={`connector-${index}`}
            x1={node.x}
            y1={node.y - 30}
            x2={node.x}
            y2={node.y}
            stroke="#52c41a"
            strokeWidth="2"
            className={styles.connectionLine}
          />
        ))}
        
        {/* 节点 */}
        {nodes.map((node, index) => (
          <g key={node.id} className={styles.nodeGroup} onClick={() => handleNodeClick(node)}>
            <circle
              cx={node.x}
              cy={node.y - 30}
              r="22"
              fill={getNodeColor(node.type, node.status)}
              stroke="#fff"
              strokeWidth="2"
              className={styles.nodeCircle}
            />
            <text
              x={node.x}
              y={node.y - 26}
              fill="#fff"
              fontSize="10"
              textAnchor="middle"
              fontWeight="bold"
            >
              {index + 1}
            </text>
            <text
              x={node.x}
              y={node.y + 15}
              fill="#333"
              fontSize="9"
              textAnchor="middle"
            >
              {node.label}
            </text>
          </g>
        ))}
        
        {/* 总线标签 */}
        <text
          x={300}
          y={busY + 30}
          fill="#722ed1"
          fontSize="12"
          textAnchor="middle"
          fontWeight="bold"
        >
          数据总线
        </text>
      </svg>
    );
  };

  // 渲染不同类型的拓扑图
  const renderTopology = () => {
    switch (topologyType) {
      case 'star':
        return renderStarTopology();
      case 'tree':
        return renderTreeTopology();
      case 'ring':
        return renderRingTopology();
      case 'bus':
        return renderBusTopology();
      case 'mesh':
      default:
        // 默认使用原有的MeshRadioManager组件
        return null;
    }
  };

  const topology = renderTopology();
  
  if (!topology) {
    // 如果是mesh类型或其他，返回null让父组件使用MeshRadioManager
    return null;
  }

  return (
    <div className={styles.topologyRenderer}>
      <div className={styles.topologyContainer}>
        {topology}
      </div>
      
      {/* 图例 */}
      <div className={styles.legend}>
        <Space size="large">
          <Space size="small">
            <div className={styles.legendDot} style={{ backgroundColor: '#1890ff' }}></div>
            <Text style={{ fontSize: 12 }}>主节点</Text>
          </Space>
          <Space size="small">
            <div className={styles.legendDot} style={{ backgroundColor: '#52c41a' }}></div>
            <Text style={{ fontSize: 12 }}>中继节点</Text>
          </Space>
          <Space size="small">
            <div className={styles.legendDot} style={{ backgroundColor: '#faad14' }}></div>
            <Text style={{ fontSize: 12 }}>终端节点</Text>
          </Space>
          <Space size="small">
            <div className={styles.legendDot} style={{ backgroundColor: '#ff4d4f' }}></div>
            <Text style={{ fontSize: 12 }}>离线节点</Text>
          </Space>
        </Space>
      </div>
    </div>
  );
};

export default TopologyRenderer; 