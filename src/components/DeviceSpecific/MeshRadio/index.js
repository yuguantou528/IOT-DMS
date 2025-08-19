import React, { useState, useEffect, useRef } from 'react';
import {
  Tabs,
  Card,
  Form,
  Input,
  Select,
  Switch,
  Button,
  message,
  Row,
  Col,
  Divider,
  Space,
  Tooltip,
  Badge,
  Statistic,
  Checkbox,
  Radio
} from 'antd';
import {
  SaveOutlined,
  ReloadOutlined,
  SettingOutlined,
  NodeIndexOutlined,
  WifiOutlined,
  ThunderboltOutlined,
  LockOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined
} from '@ant-design/icons';
// import { Graph } from '@antv/g6';
import styles from './index.module.css';

const { TabPane } = Tabs;
const { Option } = Select;

const MeshRadioManager = ({ device, onParameterUpdate, mode = 'full' }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [topologyData, setTopologyData] = useState(null);
  const [networkStats, setNetworkStats] = useState({});
  const [selectedNode, setSelectedNode] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [checkedDevices, setCheckedDevices] = useState([]); // 已勾选的设备ID列表
  const [connectionDataType, setConnectionDataType] = useState('signal'); // 连线数据类型：signal/quality/distance
  const graphRef = useRef(null);
  const containerRef = useRef(null);
  const topologyRef = useRef(null);

  // Mesh电台参数默认值
  const defaultParameters = {
    frequency: '433.000',
    power: 20,
    networkId: 'MESH001',
    encryption: true,
    encryptionKey: '',
    relayMode: true,
    dataRate: '9600',
    channel: 1,
    bandwidth: '125',
    spreadingFactor: 7
  };

  // 模拟网络拓扑数据（专业版本）
  const mockTopologyData = {
    nodes: [
      {
        id: device.id.toString(),
        label: device.name,
        type: 'main',
        status: 'online',
        x: 300,
        y: 200,
        rssi: -30,
        battery: 100,
        frequency: '433.000MHz'
      },
      {
        id: 'node_2',
        label: 'Mesh节点-002',
        type: 'relay',
        status: 'online',
        x: 150,
        y: 120,
        rssi: -45,
        battery: 85,
        frequency: '433.125MHz'
      },
      {
        id: 'node_3',
        label: 'Mesh节点-003',
        type: 'endpoint',
        status: 'online',
        x: 450,
        y: 120,
        rssi: -52,
        battery: 78,
        frequency: '433.250MHz'
      },
      {
        id: 'node_4',
        label: 'Mesh节点-004',
        type: 'endpoint',
        status: 'offline',
        x: 100,
        y: 280,
        rssi: -999,
        battery: 0,
        frequency: '433.375MHz'
      },
      {
        id: 'node_5',
        label: 'Mesh节点-005',
        type: 'relay',
        status: 'online',
        x: 500,
        y: 280,
        rssi: -55,
        battery: 92,
        frequency: '433.500MHz'
      }
    ],
    edges: [
      // 双向连线：设备1 <-> node_2
      {
        id: 'edge_1_2_forward',
        source: device.id.toString(),
        target: 'node_2',
        direction: 'forward',
        signal: '-45dBm',
        quality: '优秀',
        distance: '120m',
        qualityLevel: 'excellent'
      },
      {
        id: 'edge_1_2_backward',
        source: 'node_2',
        target: device.id.toString(),
        direction: 'backward',
        signal: '-47dBm',
        quality: '优秀',
        distance: '120m',
        qualityLevel: 'excellent'
      },
      // 双向连线：设备1 <-> node_3
      {
        id: 'edge_1_3_forward',
        source: device.id.toString(),
        target: 'node_3',
        direction: 'forward',
        signal: '-52dBm',
        quality: '良好',
        distance: '180m',
        qualityLevel: 'good'
      },
      {
        id: 'edge_1_3_backward',
        source: 'node_3',
        target: device.id.toString(),
        direction: 'backward',
        signal: '-54dBm',
        quality: '良好',
        distance: '180m',
        qualityLevel: 'good'
      },
      // 双向连线：node_2 <-> node_4
      {
        id: 'edge_2_4_forward',
        source: 'node_2',
        target: 'node_4',
        direction: 'forward',
        signal: '-68dBm',
        quality: '一般',
        distance: '250m',
        qualityLevel: 'fair'
      },
      {
        id: 'edge_2_4_backward',
        source: 'node_4',
        target: 'node_2',
        direction: 'backward',
        signal: '-70dBm',
        quality: '一般',
        distance: '250m',
        qualityLevel: 'fair'
      },
      // 双向连线：node_3 <-> node_5
      {
        id: 'edge_3_5_forward',
        source: 'node_3',
        target: 'node_5',
        direction: 'forward',
        signal: '-55dBm',
        quality: '良好',
        distance: '160m',
        qualityLevel: 'good'
      },
      {
        id: 'edge_3_5_backward',
        source: 'node_5',
        target: 'node_3',
        direction: 'backward',
        signal: '-57dBm',
        quality: '良好',
        distance: '160m',
        qualityLevel: 'good'
      }
    ]
  };

  // 初始化
  useEffect(() => {
    // 初始化表单数据
    const savedParams = device.meshParameters || defaultParameters;
    form.setFieldsValue(savedParams);

    // 初始化拓扑数据
    setTopologyData(mockTopologyData);

    // 初始化已勾选设备列表（默认全选）
    setCheckedDevices(mockTopologyData.nodes.map(node => node.id));

    // 初始化网络统计
    setNetworkStats({
      totalNodes: 5,
      onlineNodes: 4,
      offlineNodes: 1,
      relayNodes: 2,
      endpointNodes: 2,
      networkLoad: 65
    });
  }, [device, form]);

  // 初始化拓扑图（简化版本，不需要G6）
  useEffect(() => {
    // 简化版本不需要特殊初始化
  }, [topologyData]);

  // 专业拓扑图渲染（参考专业界面设计）
  const renderProfessionalTopology = () => {
    if (!topologyData || !topologyData.nodes) {
      return (
        <div className={styles.topologyContainer}>
          <div style={{ textAlign: 'center', padding: '40px', color: '#8c8c8c' }}>
            <NodeIndexOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
            <div>暂无网络拓扑数据</div>
          </div>
        </div>
      );
    }

    const getNodeColor = (type, status) => {
      if (status === 'offline') return '#ff4d4f';
      switch (type) {
        case 'main': return '#1890ff';
        case 'relay': return '#52c41a';
        case 'endpoint': return '#faad14';
        default: return '#8c8c8c';
      }
    };

    const getNodeTypeText = (type) => {
      switch (type) {
        case 'main': return '主节点';
        case 'relay': return '中继节点';
        case 'endpoint': return '终端节点';
        default: return '未知节点';
      }
    };

    return (
      <div className={styles.professionalTopology} ref={topologyRef}>
        {/* 左侧设备列表 */}
        <div className={styles.deviceList}>
          <div className={styles.deviceListHeader}>
            <div className={styles.headerTitle}>设备列表</div>
            <div className={styles.headerInfo}>
              <span className={styles.deviceCount}>共{topologyData.nodes.length}个设备</span>
              <Checkbox
                indeterminate={checkedDevices.length > 0 && checkedDevices.length < topologyData.nodes.length}
                checked={checkedDevices.length === topologyData.nodes.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className={styles.selectAllCheckbox}
              >
                全选
              </Checkbox>
            </div>
          </div>
          <div className={styles.deviceItems}>
            {topologyData.nodes.map(node => {
              const isChecked = checkedDevices.includes(node.id);
              return (
                <div
                  key={node.id}
                  className={`${styles.deviceItem} ${node.status === 'offline' ? styles.offline : ''} ${!isChecked ? styles.unchecked : ''}`}
                  onClick={() => setSelectedNode(node)}
                >
                  <Checkbox
                    checked={isChecked}
                    onChange={(e) => handleDeviceCheck(node.id, e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div
                    className={styles.deviceIndicator}
                    style={{ backgroundColor: getNodeColor(node.type, node.status) }}
                  />
                  <div className={styles.deviceInfo}>
                    <div className={styles.deviceName}>{node.label}</div>
                    <div className={styles.deviceType}>{getNodeTypeText(node.type)}</div>
                  </div>
                  <div className={styles.deviceStatus}>
                    <Badge
                      status={node.status === 'online' ? 'success' : 'error'}
                      text={node.status === 'online' ? '在线' : '离线'}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 中央拓扑图区域 */}
        <div className={styles.topologyCanvas}>
          <div className={styles.canvasHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span>网络拓扑图</span>
              <Radio.Group
                value={connectionDataType}
                onChange={(e) => setConnectionDataType(e.target.value)}
                size="small"
              >
                <Radio.Button value="signal">信号强度</Radio.Button>
                <Radio.Button value="quality">链路质量</Radio.Button>
                <Radio.Button value="distance">设备距离</Radio.Button>
              </Radio.Group>
            </div>
            <Space>
              <Button size="small" icon={<ReloadOutlined />} onClick={handleRefreshTopology}>
                刷新
              </Button>
              <Button
                size="small"
                icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                onClick={toggleFullscreen}
              >
                {isFullscreen ? '退出全屏' : '全屏'}
              </Button>
            </Space>
          </div>
          <div className={styles.canvasContent}>
            <svg width="100%" height="400" className={styles.topologySvg}>
              {/* 定义箭头标记 */}
              <defs>
                <marker
                  id="arrowhead-excellent"
                  markerWidth="6"
                  markerHeight="4"
                  refX="6"
                  refY="2"
                  orient="auto"
                >
                  <polygon points="0 0, 6 2, 0 4" fill="#52c41a" />
                </marker>
                <marker
                  id="arrowhead-good"
                  markerWidth="6"
                  markerHeight="4"
                  refX="6"
                  refY="2"
                  orient="auto"
                >
                  <polygon points="0 0, 6 2, 0 4" fill="#1890ff" />
                </marker>
                <marker
                  id="arrowhead-fair"
                  markerWidth="6"
                  markerHeight="4"
                  refX="6"
                  refY="2"
                  orient="auto"
                >
                  <polygon points="0 0, 6 2, 0 4" fill="#faad14" />
                </marker>
                <marker
                  id="arrowhead-poor"
                  markerWidth="6"
                  markerHeight="4"
                  refX="6"
                  refY="2"
                  orient="auto"
                >
                  <polygon points="0 0, 6 2, 0 4" fill="#ff4d4f" />
                </marker>
              </defs>
              
              {/* 先绘制连接线 */}
              {topologyData.edges && topologyData.edges.map((edge, index) => {
                const sourceNode = topologyData.nodes.find(n => n.id === edge.source);
                const targetNode = topologyData.nodes.find(n => n.id === edge.target);

                // 只显示两端设备都被勾选的连线
                if (!sourceNode || !targetNode ||
                    !checkedDevices.includes(edge.source) ||
                    !checkedDevices.includes(edge.target)) {
                  return null;
                }

                // 使用节点的实际坐标，如果没有则使用默认位置
                const sourceX = sourceNode.x || 100 + (Math.floor(index / 2) * 120);
                const sourceY = sourceNode.y || 200;
                const targetX = targetNode.x || 300 + (Math.floor(index / 2) * 120);
                const targetY = targetNode.y || 200;

                // 计算双向连线的偏移（增加偏移距离）
                const offset = edge.direction === 'forward' ? 12 : -12;
                const offsetLine = calculateLineOffset(sourceX, sourceY, targetX, targetY, offset);

                // 计算标签位置
                const labelPos = calculateLabelPosition(sourceX, sourceY, targetX, targetY, edge.direction);

                return (
                  <g key={edge.id}>
                    {/* 连线 */}
                    <line
                      x1={offsetLine.x1}
                      y1={offsetLine.y1}
                      x2={offsetLine.x2}
                      y2={offsetLine.y2}
                      stroke={getConnectionColor(edge)}
                      strokeWidth={edge.direction === 'forward' ? "2" : "1.5"}
                      className={`${styles.connectionLine} ${styles.parallelArrowLine} ${
                        edge.direction === 'forward' ? styles.forwardLine : styles.backwardLine
                      }`}
                      markerEnd={`url(#arrowhead-${edge.qualityLevel})`}
                      opacity={edge.direction === 'forward' ? '1' : '0.7'}
                    />

                    {/* 连线标签 */}
                    <g>
                      <rect
                        x={labelPos.x - 15}
                        y={labelPos.y - 7}
                        width="30"
                        height="14"
                        fill="rgba(255, 255, 255, 0.9)"
                        stroke="#e8e8e8"
                        strokeWidth="0.5"
                        rx="2"
                        className={styles.labelBackground}
                      />
                      <text
                        x={labelPos.x}
                        y={labelPos.y + 3}
                        fill="#333"
                        fontSize="9"
                        textAnchor="middle"
                        className={styles.connectionLabel}
                      >
                        {getConnectionLabel(edge)}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* 然后绘制节点 */}
              {topologyData.nodes.map((node, index) => {
                // 只显示已勾选的设备节点
                if (!checkedDevices.includes(node.id)) {
                  return null;
                }

                return (
                  <g key={node.id} className={styles.nodeGroup}>
                    <circle
                      cx={node.x || 100 + (index * 120)}
                      cy={node.y || 200}
                      r="25"
                      fill={getNodeColor(node.type, node.status)}
                      stroke="#fff"
                      strokeWidth="3"
                      className={styles.nodeCircle}
                      onClick={() => setSelectedNode(node)}
                    />
                    {/* 设备ID - 显示在节点中心 */}
                    <text
                      x={node.x || 100 + (index * 120)}
                      y={(node.y || 200) + 4}
                      fill="#fff"
                      fontSize="10"
                      textAnchor="middle"
                      fontWeight="bold"
                      className={styles.nodeIdText}
                    >
                      {node.id}
                    </text>
                    {/* 设备名称 - 显示在节点下方，增加间距 */}
                    <text
                      x={node.x || 100 + (index * 120)}
                      y={(node.y || 200) + 50}
                      fill="#333"
                      fontSize="10"
                      textAnchor="middle"
                      className={styles.nodeLabelText}
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* 右侧详情面板 */}
        <div className={styles.detailPanel}>
          <div className={styles.detailHeader}>
            <span>节点详情</span>
          </div>
          <div className={styles.detailContent}>
            {selectedNode ? (
              <div className={styles.nodeDetails}>
                <div className={styles.nodeTitle}>
                  <div
                    className={styles.nodeTitleIndicator}
                    style={{ backgroundColor: getNodeColor(selectedNode.type, selectedNode.status) }}
                  />
                  <span>{selectedNode.label}</span>
                </div>
                <div className={styles.nodeDetailItem}>
                  <span className={styles.detailLabel}>节点类型:</span>
                  <span>{getNodeTypeText(selectedNode.type)}</span>
                </div>
                <div className={styles.nodeDetailItem}>
                  <span className={styles.detailLabel}>运行状态:</span>
                  <Badge
                    status={selectedNode.status === 'online' ? 'success' : 'error'}
                    text={selectedNode.status === 'online' ? '在线' : '离线'}
                  />
                </div>
                <div className={styles.nodeDetailItem}>
                  <span className={styles.detailLabel}>工作频率:</span>
                  <span>{selectedNode.frequency || '433MHz'}</span>
                </div>
                <div className={styles.nodeDetailItem}>
                  <span className={styles.detailLabel}>信号强度:</span>
                  <span>-45dBm</span>
                </div>
                <div className={styles.nodeDetailItem}>
                  <span className={styles.detailLabel}>电池电量:</span>
                  <span>85%</span>
                </div>
                <div className={styles.nodeDetailItem}>
                  <span className={styles.detailLabel}>数据速率:</span>
                  <span>9600bps</span>
                </div>

                {/* 连接信息 */}
                <div className={styles.connectionSection}>
                  <div className={styles.connectionHeader}>
                    <span className={styles.detailLabel}>连接信息:</span>
                  </div>
                  <div className={styles.connectionList}>
                    {(() => {
                      const connections = getNodeConnections(selectedNode.id);
                      if (connections.length === 0) {
                        return (
                          <div className={styles.noConnections}>
                            <span style={{ color: '#8c8c8c', fontSize: '12px' }}>暂无连接</span>
                          </div>
                        );
                      }

                      return connections.map((connection, index) => (
                        <div key={connection.nodeId} className={styles.connectionItem}>
                          <div className={styles.connectionNodeInfo}>
                            <div className={styles.connectionNodeName}>
                              <div
                                className={styles.connectionNodeIndicator}
                                style={{ backgroundColor: getNodeColor(connection.nodeType, connection.nodeStatus) }}
                              />
                              <span>{connection.nodeName}</span>
                              <Badge
                                status={connection.nodeStatus === 'online' ? 'success' : 'error'}
                                size="small"
                              />
                            </div>
                            <div className={styles.connectionDetails}>
                              <span className={styles.connectionDistance}>距离: {connection.distance}</span>
                              {connection.bidirectional ? (
                                <div className={styles.bidirectionalInfo}>
                                  <div className={styles.signalInfo}>
                                    <span className={styles.signalDirection}>发送:</span>
                                    <span className={styles.signalValue}>{connection.outgoingSignal || 'N/A'}</span>
                                    <span className={styles.qualityBadge} data-quality={connection.qualityLevel}>
                                      {connection.outgoingQuality || 'N/A'}
                                    </span>
                                  </div>
                                  <div className={styles.signalInfo}>
                                    <span className={styles.signalDirection}>接收:</span>
                                    <span className={styles.signalValue}>{connection.incomingSignal || 'N/A'}</span>
                                    <span className={styles.qualityBadge} data-quality={connection.qualityLevel}>
                                      {connection.incomingQuality || 'N/A'}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className={styles.unidirectionalInfo}>
                                  <span className={styles.signalValue}>
                                    {connection.outgoingSignal || connection.incomingSignal || 'N/A'}
                                  </span>
                                  <span className={styles.qualityBadge} data-quality={connection.qualityLevel}>
                                    {connection.outgoingQuality || connection.incomingQuality || 'N/A'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.noSelection}>
                <div style={{ textAlign: 'center', color: '#8c8c8c', padding: '20px' }}>
                  <NodeIndexOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
                  <div>点击节点查看详情</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 保存参数配置
  const handleSaveParameters = async () => {
    try {
      setUpdating(true);
      const values = await form.validateFields();

      // 模拟保存到后端
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 调用父组件的更新方法
      if (onParameterUpdate) {
        onParameterUpdate({
          ...device,
          meshParameters: values
        });
      }

      message.success('参数配置保存成功');
    } catch (error) {
      message.error('参数配置保存失败');
    } finally {
      setUpdating(false);
    }
  };

  // 刷新网络拓扑
  const handleRefreshTopology = () => {
    message.info('正在刷新网络拓扑...');
    // 模拟刷新
    setTimeout(() => {
      message.success('网络拓扑刷新完成');
    }, 1000);
  };

  // 全屏切换功能
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      // 进入全屏
      if (topologyRef.current) {
        if (topologyRef.current.requestFullscreen) {
          topologyRef.current.requestFullscreen();
        } else if (topologyRef.current.webkitRequestFullscreen) {
          topologyRef.current.webkitRequestFullscreen();
        } else if (topologyRef.current.mozRequestFullScreen) {
          topologyRef.current.mozRequestFullScreen();
        } else if (topologyRef.current.msRequestFullscreen) {
          topologyRef.current.msRequestFullscreen();
        }
      }
    } else {
      // 退出全屏
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // 设备复选功能
  const handleDeviceCheck = (deviceId, checked) => {
    if (checked) {
      setCheckedDevices(prev => [...prev, deviceId]);
    } else {
      setCheckedDevices(prev => prev.filter(id => id !== deviceId));
      // 如果取消勾选的设备是当前选中的节点，清除选中状态
      if (selectedNode && selectedNode.id === deviceId) {
        setSelectedNode(null);
      }
    }
  };

  // 全选/取消全选
  const handleSelectAll = (checked) => {
    if (checked) {
      setCheckedDevices(topologyData.nodes.map(node => node.id));
    } else {
      setCheckedDevices([]);
      setSelectedNode(null);
    }
  };

  // 获取连线显示的数据
  const getConnectionLabel = (edge) => {
    switch (connectionDataType) {
      case 'signal':
        return edge.signal;
      case 'quality':
        return edge.quality;
      case 'distance':
        return edge.distance;
      default:
        return edge.signal;
    }
  };

  // 获取节点的连接信息
  const getNodeConnections = (nodeId) => {
    if (!topologyData || !topologyData.edges) return [];

    const connections = [];
    const processedPairs = new Set(); // 用于避免重复的连接对

    topologyData.edges.forEach(edge => {
      let connectedNodeId = null;
      let connectionInfo = null;

      if (edge.source === nodeId) {
        connectedNodeId = edge.target;
        connectionInfo = {
          nodeId: connectedNodeId,
          direction: 'outgoing',
          signal: edge.signal,
          quality: edge.quality,
          distance: edge.distance,
          qualityLevel: edge.qualityLevel
        };
      } else if (edge.target === nodeId) {
        connectedNodeId = edge.source;
        connectionInfo = {
          nodeId: connectedNodeId,
          direction: 'incoming',
          signal: edge.signal,
          quality: edge.quality,
          distance: edge.distance,
          qualityLevel: edge.qualityLevel
        };
      }

      if (connectedNodeId && connectionInfo) {
        // 创建连接对的唯一标识（较小的ID在前）
        const pairKey = [nodeId, connectedNodeId].sort().join('-');

        // 查找是否已有该连接对的记录
        let existingConnection = connections.find(conn => {
          const existingPairKey = [nodeId, conn.nodeId].sort().join('-');
          return existingPairKey === pairKey;
        });

        if (existingConnection) {
          // 如果已存在，更新为双向连接信息
          if (connectionInfo.direction === 'outgoing') {
            existingConnection.outgoingSignal = connectionInfo.signal;
            existingConnection.outgoingQuality = connectionInfo.quality;
          } else {
            existingConnection.incomingSignal = connectionInfo.signal;
            existingConnection.incomingQuality = connectionInfo.quality;
          }
          existingConnection.bidirectional = true;
        } else {
          // 如果不存在，创建新的连接记录
          const connectedNode = topologyData.nodes.find(n => n.id === connectedNodeId);
          if (connectedNode) {
            const newConnection = {
              nodeId: connectedNodeId,
              nodeName: connectedNode.label,
              nodeType: connectedNode.type,
              nodeStatus: connectedNode.status,
              distance: connectionInfo.distance,
              qualityLevel: connectionInfo.qualityLevel,
              bidirectional: false
            };

            if (connectionInfo.direction === 'outgoing') {
              newConnection.outgoingSignal = connectionInfo.signal;
              newConnection.outgoingQuality = connectionInfo.quality;
            } else {
              newConnection.incomingSignal = connectionInfo.signal;
              newConnection.incomingQuality = connectionInfo.quality;
            }

            connections.push(newConnection);
          }
        }
      }
    });

    return connections;
  };

  // 获取连线颜色（根据质量等级）
  const getConnectionColor = (edge) => {
    switch (edge.qualityLevel) {
      case 'excellent':
        return '#52c41a';
      case 'good':
        return '#1890ff';
      case 'fair':
        return '#faad14';
      case 'poor':
        return '#ff4d4f';
      default:
        return '#8c8c8c';
    }
  };

  // 计算双向连线的偏移位置
  const calculateLineOffset = (x1, y1, x2, y2, offset = 8) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0) return { x1, y1, x2, y2 };

    // 计算垂直于连线的单位向量
    const perpX = -dy / length;
    const perpY = dx / length;

    // 显著增加偏移量，使两条线明显分开
    const actualOffset = offset > 0 ? 5 : -5;

    // 计算节点半径和连线方向的单位向量
    const nodeRadius = 25;
    const dirX = dx / length;
    const dirY = dy / length;

    // 调整起点和终点，使连线从节点边缘开始和结束
    const adjustedX1 = x1 + dirX * nodeRadius;
    const adjustedY1 = y1 + dirY * nodeRadius;
    const adjustedX2 = x2 - dirX * (nodeRadius + 3); // 额外偏移3像素，确保箭头完全可见
    const adjustedY2 = y2 - dirY * (nodeRadius + 3);

    return {
      x1: adjustedX1 + perpX * actualOffset,
      y1: adjustedY1 + perpY * actualOffset,
      x2: adjustedX2 + perpX * actualOffset,
      y2: adjustedY2 + perpY * actualOffset
    };
  };

  // 计算标签位置（沿连线方向偏移）
  const calculateLabelPosition = (x1, y1, x2, y2, direction = 'forward') => {
    // 计算原始连线的中点
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0) return { x: x1, y: y1 };

    // 计算节点半径和连线方向的单位向量
    const nodeRadius = 25;
    const dirX = dx / length;
    const dirY = dy / length;
    
    // 调整起点和终点，考虑节点半径
    const adjustedX1 = x1 + dirX * nodeRadius;
    const adjustedY1 = y1 + dirY * nodeRadius;
    const adjustedX2 = x2 - dirX * nodeRadius;
    const adjustedY2 = y2 - dirY * nodeRadius;
    
    // 计算调整后连线的中点
    const midX = (adjustedX1 + adjustedX2) / 2;
    const midY = (adjustedY1 + adjustedY2) / 2;

    // 计算垂直于连线的单位向量
    const perpX = -dy / length;
    const perpY = dx / length;
    
    // 根据方向调整标签位置，偏移量小于连线偏移
    const offset = direction === 'forward' ? 7 : -7;

    return {
      x: midX + perpX * offset,
      y: midY + perpY * offset
    };
  };

  // 网络统计卡片
  const NetworkStatsCard = () => (
    <Card size="small" className={styles.statsCard}>
      <Row gutter={16}>
        <Col span={8}>
          <Statistic
            title="总节点数"
            value={networkStats.totalNodes}
            prefix={<NodeIndexOutlined />}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="在线节点"
            value={networkStats.onlineNodes}
            valueStyle={{ color: '#3f8600' }}
            prefix={<WifiOutlined />}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="网络负载"
            value={networkStats.networkLoad}
            suffix="%"
            valueStyle={{ color: networkStats.networkLoad > 80 ? '#cf1322' : '#3f8600' }}
            prefix={<ThunderboltOutlined />}
          />
        </Col>
      </Row>
    </Card>
  );

  // 根据模式渲染不同内容
  if (mode === 'topology') {
    return (
      <div className={styles.meshRadioManager}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <NetworkStatsCard />

          <Card
            title="Mesh网络拓扑图"
            size="small"
            extra={
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefreshTopology}
                size="small"
              >
                刷新
              </Button>
            }
          >
            {renderProfessionalTopology()}

            <Divider />

            <div className={styles.legend}>
              <Space>
                <Badge status="processing" text="主节点" />
                <Badge status="success" text="中继节点" />
                <Badge status="default" text="终端节点" />
                <Badge status="error" text="离线节点" />
              </Space>
            </div>
          </Card>
        </Space>
      </div>
    );
  }

  if (mode === 'parameters') {
    return (
      <div className={styles.meshRadioManager}>
        <Card title="Mesh电台参数配置" size="small">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSaveParameters}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="工作频率 (MHz)"
                  name="frequency"
                  rules={[{ required: true, message: '请输入工作频率' }]}
                >
                  <Input
                    placeholder="433.000"
                    addonAfter="MHz"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="发射功率 (dBm)"
                  name="power"
                  rules={[{ required: true, message: '请选择发射功率' }]}
                >
                  <Select placeholder="请选择发射功率">
                    <Option value={10}>10 dBm</Option>
                    <Option value={14}>14 dBm</Option>
                    <Option value={17}>17 dBm</Option>
                    <Option value={20}>20 dBm</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="网络ID"
                  name="networkId"
                  rules={[{ required: true, message: '请输入网络ID' }]}
                >
                  <Input placeholder="MESH001" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="信道"
                  name="channel"
                  rules={[{ required: true, message: '请选择信道' }]}
                >
                  <Select placeholder="请选择信道">
                    {[...Array(16)].map((_, i) => (
                      <Option key={i} value={i + 1}>信道 {i + 1}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="数据速率"
                  name="dataRate"
                  rules={[{ required: true, message: '请选择数据速率' }]}
                >
                  <Select placeholder="请选择数据速率">
                    <Option value="1200">1200 bps</Option>
                    <Option value="2400">2400 bps</Option>
                    <Option value="4800">4800 bps</Option>
                    <Option value="9600">9600 bps</Option>
                    <Option value="19200">19200 bps</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="中继模式"
                  name="relayMode"
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="开启"
                    unCheckedChildren="关闭"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="数据加密"
                  name="encryption"
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="开启"
                    unCheckedChildren="关闭"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="加密密钥"
                  name="encryptionKey"
                  rules={[
                    { required: true, message: '请输入加密密钥' },
                    { min: 8, message: '密钥长度至少8位' }
                  ]}
                >
                  <Input.Password placeholder="请输入加密密钥" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={updating}>
                  保存配置
                </Button>
                <Button onClick={() => form.resetFields()}>
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    );
  }

  // 默认完整模式（原有的Tab模式）
  return (
    <div className={styles.meshRadioManager}>
      <Tabs defaultActiveKey="topology" type="card">
        <TabPane 
          tab={
            <span>
              <NodeIndexOutlined />
              网络拓扑
            </span>
          } 
          key="topology"
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <NetworkStatsCard />
            
            <Card
              title="Mesh网络拓扑图"
              size="small"
              extra={
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleRefreshTopology}
                  size="small"
                >
                  刷新
                </Button>
              }
            >
              {renderProfessionalTopology()}

              <Divider />

              <div className={styles.legend}>
                <Space>
                  <Badge status="processing" text="主节点" />
                  <Badge status="success" text="中继节点" />
                  <Badge status="default" text="终端节点" />
                  <Badge status="error" text="离线节点" />
                </Space>
              </div>
            </Card>
          </Space>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <SettingOutlined />
              参数配置
            </span>
          } 
          key="parameters"
        >
          <Card title="Mesh电台参数配置" size="small">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSaveParameters}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="工作频率 (MHz)"
                    name="frequency"
                    rules={[{ required: true, message: '请输入工作频率' }]}
                  >
                    <Input 
                      placeholder="433.000" 
                      addonAfter="MHz"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="发射功率 (dBm)"
                    name="power"
                    rules={[{ required: true, message: '请选择发射功率' }]}
                  >
                    <Select placeholder="请选择发射功率">
                      <Option value={10}>10 dBm</Option>
                      <Option value={14}>14 dBm</Option>
                      <Option value={17}>17 dBm</Option>
                      <Option value={20}>20 dBm</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="网络ID"
                    name="networkId"
                    rules={[{ required: true, message: '请输入网络ID' }]}
                  >
                    <Input placeholder="MESH001" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="信道"
                    name="channel"
                    rules={[{ required: true, message: '请选择信道' }]}
                  >
                    <Select placeholder="请选择信道">
                      {[...Array(16)].map((_, i) => (
                        <Option key={i} value={i + 1}>信道 {i + 1}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="数据速率"
                    name="dataRate"
                    rules={[{ required: true, message: '请选择数据速率' }]}
                  >
                    <Select placeholder="请选择数据速率">
                      <Option value="1200">1200 bps</Option>
                      <Option value="2400">2400 bps</Option>
                      <Option value="4800">4800 bps</Option>
                      <Option value="9600">9600 bps</Option>
                      <Option value="19200">19200 bps</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="带宽 (kHz)"
                    name="bandwidth"
                    rules={[{ required: true, message: '请选择带宽' }]}
                  >
                    <Select placeholder="请选择带宽">
                      <Option value="125">125 kHz</Option>
                      <Option value="250">250 kHz</Option>
                      <Option value="500">500 kHz</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="扩频因子"
                    name="spreadingFactor"
                    rules={[{ required: true, message: '请选择扩频因子' }]}
                  >
                    <Select placeholder="请选择扩频因子">
                      {[...Array(6)].map((_, i) => (
                        <Option key={i} value={i + 7}>SF{i + 7}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="中继模式"
                    name="relayMode"
                    valuePropName="checked"
                  >
                    <Switch 
                      checkedChildren="开启" 
                      unCheckedChildren="关闭"
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <Divider />
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="数据加密"
                    name="encryption"
                    valuePropName="checked"
                  >
                    <Switch 
                      checkedChildren="开启" 
                      unCheckedChildren="关闭"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="加密密钥"
                    name="encryptionKey"
                    rules={[
                      {
                        required: form.getFieldValue('encryption'),
                        message: '开启加密时必须设置密钥'
                      }
                    ]}
                  >
                    <Input.Password 
                      placeholder="请输入加密密钥"
                      prefix={<LockOutlined />}
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={updating}
                    icon={<SaveOutlined />}
                  >
                    保存配置
                  </Button>
                  <Button onClick={() => form.resetFields()}>
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default MeshRadioManager;
