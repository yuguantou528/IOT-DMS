import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Card, Row, Col, Button, Select, Space, Tooltip, Badge, Statistic, Typography, Tag, Progress, Tree
} from 'antd';
import {
  NodeIndexOutlined, AimOutlined, DownloadOutlined, FullscreenOutlined, FullscreenExitOutlined,
  ZoomInOutlined, ZoomOutOutlined, EyeOutlined, EyeInvisibleOutlined, InfoCircleOutlined,
  CloseOutlined, SettingOutlined, DragOutlined, FolderOutlined, FolderOpenOutlined, FileOutlined
} from '@ant-design/icons';
import styles from './index.module.css';

const { Option } = Select;
const { Text } = Typography;

const TopologyManagement2 = () => {
  // 拓扑图状态
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [scale, setScale] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [labelMode, setLabelMode] = useState('latency');
  const [nodeFilter, setNodeFilter] = useState('all');
  const [hiddenNodes, setHiddenNodes] = useState(new Set());
  const [isTopologyFocused, setIsTopologyFocused] = useState(false);
  
  // 内部面板显示状态
  const [showStatsPanel, setShowStatsPanel] = useState(true);
  const [showNodeList, setShowNodeList] = useState(true);
  const [showNodeDetails, setShowNodeDetails] = useState(false);

  // 树形结构状态
  const [expandedKeys, setExpandedKeys] = useState(['company-a']);
  const [selectedKeys, setSelectedKeys] = useState(['topology-management-2']);
  const [currentTopology, setCurrentTopology] = useState('topology-management-2');

  // 拖拽相关状态
  const [draggedNode, setDraggedNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);
  const dragRef = useRef(false);

  // 网络统计数据
  const [networkStats, setNetworkStats] = useState({
    total: 6,
    online: 4,
    warning: 1,
    offline: 1,
    coverage: 67,
    avgLatency: 215
  });

  // 树形数据结构
  const treeData = [
    {
      title: '公司A',
      key: 'company-a',
      icon: <FolderOutlined />,
      children: [
        {
          title: '拓扑图管理一',
          key: 'topology-management-1',
          icon: <FileOutlined />,
          isLeaf: true
        },
        {
          title: '拓扑图管理二',
          key: 'topology-management-2',
          icon: <FileOutlined />,
          isLeaf: true
        },
        {
          title: '拓扑图管理三',
          key: 'topology-management-3',
          icon: <FileOutlined />,
          isLeaf: true
        }
      ]
    },
    {
      title: '公司B',
      key: 'company-b',
      icon: <FolderOutlined />,
      children: [
        {
          title: '网络拓扑图A',
          key: 'network-topology-a',
          icon: <FileOutlined />,
          isLeaf: true
        },
        {
          title: '网络拓扑图B',
          key: 'network-topology-b',
          icon: <FileOutlined />,
          isLeaf: true
        }
      ]
    },
    {
      title: '公司C',
      key: 'company-c',
      icon: <FolderOutlined />,
      children: [
        {
          title: '核心网络拓扑',
          key: 'core-network-topology',
          icon: <FileOutlined />,
          isLeaf: true
        },
        {
          title: '边缘网络拓扑',
          key: 'edge-network-topology',
          icon: <FileOutlined />,
          isLeaf: true
        },
        {
          title: '备份网络拓扑',
          key: 'backup-network-topology',
          icon: <FileOutlined />,
          isLeaf: true
        }
      ]
    }
  ];

  // 模拟数据
  useEffect(() => {
    const mockNodes = [
      { id: 'GATEWAY-001', name: 'GATEWAY-001', type: 'gateway', status: 'online', x: 400, y: 200, ip: '192.168.1.1', mac: '00:11:22:33:44:55', frequency: 2400, rssi: -45, links: ['REPEATER-001', 'REPEATER-002'] },
      { id: 'REPEATER-001', name: 'REPEATER-001', type: 'repeater', status: 'online', x: 200, y: 300, ip: '192.168.1.2', mac: '00:11:22:33:44:56', frequency: 2400, rssi: -65, links: ['GATEWAY-001', 'TERMINAL-001'] },
      { id: 'REPEATER-002', name: 'REPEATER-002', type: 'repeater', status: 'warning', x: 600, y: 300, ip: '192.168.1.3', mac: '00:11:22:33:44:57', frequency: 2400, rssi: -70, links: ['GATEWAY-001', 'TERMINAL-002'] },
      { id: 'TERMINAL-001', name: 'TERMINAL-001', type: 'terminal', status: 'online', x: 100, y: 450, ip: '192.168.1.4', mac: '00:11:22:33:44:58', frequency: 2400, rssi: -75, links: ['REPEATER-001'] },
      { id: 'TERMINAL-002', name: 'TERMINAL-002', type: 'terminal', status: 'online', x: 700, y: 450, ip: '192.168.1.5', mac: '00:11:22:33:44:59', frequency: 2400, rssi: -80, links: ['REPEATER-002'] },
      { id: 'TERMINAL-003', name: 'TERMINAL-003', type: 'terminal', status: 'offline', x: 500, y: 450, ip: '192.168.1.6', mac: '00:11:22:33:44:60', frequency: 2400, rssi: -90, links: [] }
    ];

    const mockLinks = [
      { id: 'link1', source: 'GATEWAY-001', target: 'REPEATER-001', latency: 12, distance: 150, rssi: -55, bandwidth: 54 },
      { id: 'link2', source: 'GATEWAY-001', target: 'REPEATER-002', latency: 15, distance: 180, rssi: -60, bandwidth: 48 },
      { id: 'link3', source: 'REPEATER-001', target: 'TERMINAL-001', latency: 8, distance: 100, rssi: -65, bandwidth: 36 },
      { id: 'link4', source: 'REPEATER-002', target: 'TERMINAL-002', latency: 10, distance: 120, rssi: -70, bandwidth: 24 }
    ];

    setNodes(mockNodes);
    setLinks(mockLinks);
  }, []);

  // 获取节点状态配置
  const getStatusConfig = (status) => {
    const configs = {
      online: { color: '#52c41a', text: '在线' },
      warning: { color: '#faad14', text: '告警' },
      offline: { color: '#ff4d4f', text: '离线' }
    };
    return configs[status] || configs.offline;
  };

  // 获取节点类型配置
  const getNodeTypeConfig = (type) => {
    const configs = {
      gateway: { color: '#1890ff', text: '网关', size: 20 },
      repeater: { color: '#722ed1', text: '中继器', size: 16 },
      terminal: { color: '#13c2c2', text: '终端', size: 12 }
    };
    return configs[type] || configs.terminal;
  };

  // 过滤可见节点
  const visibleNodes = nodes.filter(node => {
    if (hiddenNodes.has(node.id)) return false;
    if (nodeFilter === 'all') return true;
    return node.status === nodeFilter;
  });

  // 过滤可见连接
  const visibleLinks = links.filter(link => {
    const sourceVisible = visibleNodes.some(n => n.id === link.source);
    const targetVisible = visibleNodes.some(n => n.id === link.target);
    return sourceVisible && targetVisible;
  });

  // 节点点击处理
  const handleNodeClick = (node) => {
    setSelectedNode(node);
    setShowNodeDetails(true);
  };

  // 切换节点可见性
  const toggleNodeVisibility = (nodeId) => {
    setHiddenNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  // 树形结构事件处理
  const onTreeExpand = (expandedKeysValue) => {
    setExpandedKeys(expandedKeysValue);
  };

  const onTreeSelect = (selectedKeysValue, info) => {
    if (info.node.isLeaf) {
      setSelectedKeys(selectedKeysValue);
      setCurrentTopology(selectedKeysValue[0]);
      // 这里可以根据选中的拓扑图加载不同的数据
      loadTopologyData(selectedKeysValue[0]);
    }
  };

  // 加载拓扑图数据
  const loadTopologyData = (topologyKey) => {
    // 根据不同的拓扑图key加载不同的数据
    // 这里可以调用API或者切换数据源
    console.log('Loading topology data for:', topologyKey);

    // 示例：根据不同拓扑图显示不同的网络统计
    switch (topologyKey) {
      case 'topology-management-1':
        setNetworkStats({
          total: 8,
          online: 6,
          warning: 1,
          offline: 1,
          coverage: 75,
          avgLatency: 180
        });
        break;
      case 'topology-management-2':
        setNetworkStats({
          total: 6,
          online: 4,
          warning: 1,
          offline: 1,
          coverage: 67,
          avgLatency: 215
        });
        break;
      case 'topology-management-3':
        setNetworkStats({
          total: 10,
          online: 8,
          warning: 2,
          offline: 0,
          coverage: 80,
          avgLatency: 160
        });
        break;
      default:
        // 其他公司的拓扑图可以有不同的默认数据
        setNetworkStats({
          total: 5,
          online: 3,
          warning: 1,
          offline: 1,
          coverage: 60,
          avgLatency: 250
        });
    }
  };

  // 鼠标事件处理
  const onMouseMove = (e) => {
    if (draggedNode && dragRef.current && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - dragOffset.x) / scale;
      const y = (e.clientY - rect.top - dragOffset.y) / scale;

      // 确保节点不会被拖到视图外
      const minX = 50;
      const minY = 50;
      const maxX = 750;
      const maxY = 550;

      const clampedX = Math.max(minX, Math.min(maxX, x));
      const clampedY = Math.max(minY, Math.min(maxY, y));

      setNodes(prev => prev.map(node =>
        node.id === draggedNode.id ? { ...node, x: clampedX, y: clampedY } : node
      ));
    }
  };

  const onMouseUp = () => {
    setDraggedNode(null);
    dragRef.current = false;
  };

  const onNodeMouseDown = (node, e) => {
    e.stopPropagation();
    setDraggedNode(node);
    dragRef.current = true;
    const rect = svgRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left - node.x * scale,
      y: e.clientY - rect.top - node.y * scale
    });
  };

  // 缩放处理 - 需要先点击才能使用滚轮缩放
  const onWheel = useCallback((e) => {
    // 只有在拓扑图获得焦点后才允许滚轮缩放
    if (!isTopologyFocused) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.4, Math.min(2.5, prev * delta)));
  }, [isTopologyFocused]);

  // 处理拓扑图点击事件
  const handleTopologyClick = useCallback((e) => {
    setIsTopologyFocused(true);
    e.currentTarget.focus();
  }, []);

  // 处理失去焦点事件
  const handleTopologyBlur = useCallback(() => {
    setIsTopologyFocused(false);
  }, []);

  // 重置视图
  const resetView = () => {
    setScale(1);
    setPanX(0);
    setPanY(0);
  };

  // 导出SVG
  const exportSVG = () => {
    if (svgRef.current) {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'topology.svg';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // 全屏处理
  const topologyRef = useRef(null);

  const goFullscreen = () => {
    if (topologyRef.current) {
      if (topologyRef.current.requestFullscreen) {
        topologyRef.current.requestFullscreen();
      } else if (topologyRef.current.webkitRequestFullscreen) {
        topologyRef.current.webkitRequestFullscreen();
      } else if (topologyRef.current.msRequestFullscreen) {
        topologyRef.current.msRequestFullscreen();
      }
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  };

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement || !!document.webkitFullscreenElement;
      setIsFullscreen(isNowFullscreen);

      // 全屏模式下强制修复下拉框样式
      if (isNowFullscreen) {
        setTimeout(() => {
          const dropdowns = document.querySelectorAll('.ant-select-dropdown');
          dropdowns.forEach(dropdown => {
            dropdown.style.zIndex = '99999';
            dropdown.style.position = 'fixed';
            dropdown.style.background = 'rgba(0, 0, 0, 0.9)';
            dropdown.style.border = '1px solid rgba(255, 255, 255, 0.2)';
            dropdown.style.backdropFilter = 'blur(10px)';
          });
        }, 100);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className={styles.container}>
      {/* 背景装饰 */}
      <div className={styles.backgroundDecoration} />

      <Row gutter={[20, 20]} style={{ height: '100vh', position: 'relative', zIndex: 1 }}>
        {/* 左侧树形菜单 */}
        <Col span={6}>
          <Card
            title={
              <Space>
                <div className={styles.iconWrapper}>
                  <NodeIndexOutlined style={{ fontSize: '16px' }} />
                </div>
                <span className={styles.cardTitle}>拓扑图管理</span>
                <Badge
                  count={treeData.reduce((total, company) => total + company.children.length, 0)}
                  className={styles.countBadge}
                />
              </Space>
            }
            className={styles.leftCard}
            bodyStyle={{ padding: '12px 0' }}
            headStyle={{ borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}
          >
            <div className={styles.treeContainer}>
              <Tree
                showIcon
                expandedKeys={expandedKeys}
                selectedKeys={selectedKeys}
                treeData={treeData}
                onExpand={onTreeExpand}
                onSelect={onTreeSelect}
                className={styles.topologyTree}
                switcherIcon={({ expanded }) =>
                  expanded ? <FolderOpenOutlined /> : <FolderOutlined />
                }
              />
            </div>
          </Card>
        </Col>

        {/* 主拓扑图区域 - 占据整个可用空间 */}
        <Col span={18}>
          <Card
            ref={topologyRef}
            title={
              <Space>
                <div className={styles.iconWrapper}>
                  <NodeIndexOutlined style={{ fontSize: '16px' }} />
                </div>
                <span className={styles.cardTitle}>网络拓扑图</span>
                <Badge
                  status={networkStats.coverage > 80 ? 'success' : 'warning'}
                  text={`${networkStats.coverage}% 覆盖率`}
                  className={styles.statusBadge}
                />
              </Space>
            }
            extra={
              <Space size="middle">
                <Select
                  value={labelMode}
                  onChange={setLabelMode}
                  className={styles.toolbarSelect}
                  placeholder="连接标签"
                  getPopupContainer={() => document.body}
                  onOpenChange={(open) => {
                    if (open && isFullscreen) {
                      setTimeout(() => {
                        const dropdowns = document.querySelectorAll('.ant-select-dropdown');
                        dropdowns.forEach(dropdown => {
                          dropdown.style.zIndex = '99999';
                          dropdown.style.background = 'rgba(0, 0, 0, 0.9)';
                          dropdown.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                          dropdown.style.backdropFilter = 'blur(10px)';
                          dropdown.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.5)';

                          const items = dropdown.querySelectorAll('.ant-select-item');
                          items.forEach(item => {
                            item.style.color = '#ffffff';
                            item.style.background = 'transparent';
                          });
                        });
                      }, 10);
                    }
                  }}
                >
                  <Option value="none">隐藏标签</Option>
                  <Option value="latency">延迟</Option>
                  <Option value="distance">距离</Option>
                  <Option value="rssi">信号强度</Option>
                  <Option value="bandwidth">带宽</Option>
                </Select>
                <Select
                  value={nodeFilter}
                  onChange={setNodeFilter}
                  className={styles.toolbarSelect}
                  placeholder="节点筛选"
                  getPopupContainer={() => document.body}
                  onOpenChange={(open) => {
                    if (open && isFullscreen) {
                      setTimeout(() => {
                        const dropdowns = document.querySelectorAll('.ant-select-dropdown');
                        dropdowns.forEach(dropdown => {
                          dropdown.style.zIndex = '99999';
                          dropdown.style.background = 'rgba(0, 0, 0, 0.9)';
                          dropdown.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                          dropdown.style.backdropFilter = 'blur(10px)';
                          dropdown.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.5)';

                          const items = dropdown.querySelectorAll('.ant-select-item');
                          items.forEach(item => {
                            item.style.color = '#ffffff';
                            item.style.background = 'transparent';
                          });
                        });
                      }, 10);
                    }
                  }}
                >
                  <Option value="all">全部节点</Option>
                  <Option value="online">在线节点</Option>
                  <Option value="warning">告警节点</Option>
                  <Option value="offline">离线节点</Option>
                </Select>
                <Tooltip title="重置视图">
                  <Button className={styles.toolbarButton} icon={<AimOutlined />} onClick={resetView} />
                </Tooltip>
                <Tooltip title="导出SVG">
                  <Button className={styles.toolbarButton} icon={<DownloadOutlined />} onClick={exportSVG} />
                </Tooltip>
                <Tooltip title={isFullscreen ? "退出全屏" : "全屏显示"}>
                  <Button
                    className={styles.toolbarButton}
                    icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                    onClick={isFullscreen ? exitFullscreen : goFullscreen}
                  />
                </Tooltip>
              </Space>
            }
            className={styles.rightCard}
            bodyStyle={{ padding: 0, height: 'calc(100% - 53px)', position: 'relative' }}
            headStyle={{ borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                overflow: 'hidden'
              }}
              className={styles.topologyView}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onWheel={onWheel}
              onClick={handleTopologyClick}
              onBlur={handleTopologyBlur}
              tabIndex={0}
            >
              {/* 网络概览统计悬浮面板 */}
              {showStatsPanel && (
                <div className={styles.statsPanel}>
                  <div className={styles.panelHeader}>
                    <Space>
                      <div className={styles.panelIcon}>
                        <SettingOutlined />
                      </div>
                      <Text strong className={styles.panelTitle}>网络概览</Text>
                    </Space>
                    <Button
                      type="text"
                      size="small"
                      icon={<CloseOutlined />}
                      onClick={() => setShowStatsPanel(false)}
                      className={styles.closeButton}
                    />
                  </div>
                  <div style={{
                    padding: '12px 16px',
                    height: 'calc(100% - 53px)'
                  }}>
                    <Row gutter={[16, 12]}>
                      <Col span={12}>
                        <Statistic
                          title="总节点"
                          value={networkStats.total}
                          valueStyle={{ fontSize: 14 }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="在线节点"
                          value={networkStats.online}
                          valueStyle={{ color: '#52c41a', fontSize: 14 }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="告警节点"
                          value={networkStats.warning}
                          valueStyle={{ color: '#faad14', fontSize: 14 }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="离线节点"
                          value={networkStats.offline}
                          valueStyle={{ color: '#ff4d4f', fontSize: 14 }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="覆盖率"
                          value={networkStats.coverage}
                          suffix="%"
                          valueStyle={{
                            color: networkStats.coverage > 80 ? '#52c41a' : '#faad14',
                            fontSize: 14
                          }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="平均延迟"
                          value={networkStats.avgLatency}
                          suffix="ms"
                          valueStyle={{
                            color: networkStats.avgLatency < 20 ? '#52c41a' : '#faad14',
                            fontSize: 14
                          }}
                        />
                      </Col>
                    </Row>
                  </div>
                </div>
              )}

              {/* 左侧节点列表悬浮面板 */}
              {showNodeList && (
                <div className={`${styles.nodeListPanel} ${showStatsPanel ? styles.withStatsPanel : ''}`}>
                  <div className={styles.panelHeader}>
                    <Space>
                      <div className={styles.panelIcon}>
                        <NodeIndexOutlined />
                      </div>
                      <Text strong className={styles.panelTitle}>节点列表</Text>
                      <Badge count={nodes.length} className={styles.countBadge} />
                    </Space>
                    <Button
                      type="text"
                      size="small"
                      icon={<CloseOutlined />}
                      onClick={() => setShowNodeList(false)}
                      className={styles.closeButton}
                    />
                  </div>
                  <div style={{
                    maxHeight: 'calc(100% - 53px)',
                    overflow: 'auto',
                    padding: 0
                  }}>
                    {nodes.map(node => {
                      const statusConfig = getStatusConfig(node.status);
                      const typeConfig = getNodeTypeConfig(node.type);
                      const isHidden = hiddenNodes.has(node.id);
                      const isSelected = selectedNode && selectedNode.id === node.id;

                      return (
                        <div
                          key={node.id}
                          style={{
                            padding: '8px 16px',
                            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                            background: isSelected ? 'rgba(24, 144, 255, 0.1)' :
                                       isHidden ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
                            borderLeft: isSelected ? '3px solid #1890ff' : '3px solid transparent',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onClick={() => handleNodeClick(node)}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.target.style.backgroundColor = 'rgba(24, 144, 255, 0.06)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.target.style.backgroundColor = isHidden ? 'rgba(0, 0, 0, 0.02)' : 'transparent';
                            }
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div
                                  style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: statusConfig.color
                                  }}
                                />
                                <Text strong style={{ fontSize: 12 }}>{node.name}</Text>
                              </div>
                              <div style={{ marginTop: 2 }}>
                                <Text type="secondary" style={{ fontSize: 10 }}>
                                  {typeConfig.text} · {node.ip}
                                </Text>
                              </div>
                            </div>
                            <Tooltip title={isHidden ? "显示节点" : "隐藏节点"}>
                              <Button
                                size="small"
                                type="text"
                                icon={isHidden ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleNodeVisibility(node.id);
                                }}
                              />
                            </Tooltip>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 右上角节点详情悬浮面板 */}
              {showNodeDetails && selectedNode && (
                <div className={styles.nodeDetailsPanel}>
                  <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Space>
                      <InfoCircleOutlined />
                      <Text strong>节点详情</Text>
                      <Badge
                        status={selectedNode.status === 'online' ? 'success' :
                               selectedNode.status === 'warning' ? 'warning' : 'error'}
                        text={getStatusConfig(selectedNode.status).text}
                      />
                    </Space>
                    <Button
                      type="text"
                      size="small"
                      icon={<CloseOutlined />}
                      onClick={() => {
                        setShowNodeDetails(false);
                        setSelectedNode(null);
                      }}
                    />
                  </div>
                  <div style={{
                    maxHeight: 'calc(100% - 53px)',
                    overflow: 'auto',
                    padding: '12px 16px'
                  }}>
                    <div style={{ marginBottom: 16 }}>
                      <Text strong style={{ fontSize: 13, color: '#1890ff' }}>基本信息</Text>
                      <div style={{ marginTop: 8, fontSize: 12 }}>
                        <div style={{ marginBottom: 6 }}>
                          <Text strong>节点ID: </Text>
                          <Text>{selectedNode.id}</Text>
                        </div>
                        <div style={{ marginBottom: 6 }}>
                          <Text strong>节点名称: </Text>
                          <Text>{selectedNode.name}</Text>
                        </div>
                        <div style={{ marginBottom: 6 }}>
                          <Text strong>节点类型: </Text>
                          <Tag color={getNodeTypeConfig(selectedNode.type).color} size="small">
                            {getNodeTypeConfig(selectedNode.type).text}
                          </Tag>
                        </div>
                        <div>
                          <Text strong>状态: </Text>
                          <Badge
                            status={selectedNode.status === 'online' ? 'success' :
                                   selectedNode.status === 'warning' ? 'warning' : 'error'}
                            text={getStatusConfig(selectedNode.status).text}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <Text strong style={{ fontSize: 13, color: '#1890ff' }}>网络信息</Text>
                      <div style={{ marginTop: 8, fontSize: 12 }}>
                        <div style={{ marginBottom: 6 }}>
                          <Text strong>IP地址: </Text>
                          <Text code>{selectedNode.ip}</Text>
                        </div>
                        <div style={{ marginBottom: 6 }}>
                          <Text strong>MAC地址: </Text>
                          <Text code>{selectedNode.mac}</Text>
                        </div>
                        <div style={{ marginBottom: 6 }}>
                          <Text strong>工作频率: </Text>
                          <Text>{selectedNode.frequency}MHz</Text>
                        </div>
                        <div>
                          <Text strong>信号强度: </Text>
                          <div style={{ marginTop: 4 }}>
                            <Text>{selectedNode.rssi}dBm</Text>
                            <Progress
                              percent={Math.max(0, Math.min(100, (selectedNode.rssi + 100) * 2))}
                              size="small"
                              status={selectedNode.rssi > -60 ? 'success' : selectedNode.rssi > -80 ? 'normal' : 'exception'}
                              style={{ marginTop: 4 }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Text strong style={{ fontSize: 13, color: '#1890ff' }}>连接信息</Text>
                      <div style={{ marginTop: 8, fontSize: 12 }}>
                        <Text strong>连接节点 ({selectedNode.links?.length || 0}):</Text>
                        <div style={{ marginTop: 8 }}>
                          {selectedNode.links?.map(linkId => {
                            const linkedNode = nodes.find(n => n.id === linkId);
                            const link = links.find(l =>
                              (l.source === selectedNode.id && l.target === linkId) ||
                              (l.target === selectedNode.id && l.source === linkId)
                            );

                            return linkedNode ? (
                              <div key={linkId} style={{
                                padding: '6px 8px',
                                margin: '4px 0',
                                background: 'rgba(24, 144, 255, 0.06)',
                                borderRadius: '4px',
                                fontSize: 11
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Text strong style={{ fontSize: 11 }}>{linkedNode.name}</Text>
                                  <Badge
                                    status={linkedNode.status === 'online' ? 'success' :
                                           linkedNode.status === 'warning' ? 'warning' : 'error'}
                                  />
                                </div>
                                {link && (
                                  <div style={{ marginTop: 4, color: '#666', fontSize: 10 }}>
                                    延迟: {link.latency}ms | 带宽: {link.bandwidth}Mbps
                                  </div>
                                )}
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 面板控制按钮 */}
              <div style={{
                position: 'absolute',
                top: 16,
                left: showNodeList ? 312 : 16,
                zIndex: 15,
                display: 'flex',
                gap: 8
              }}>
                {!showStatsPanel && (
                  <Tooltip title="显示统计面板">
                    <Button
                      size="small"
                      icon={<SettingOutlined />}
                      onClick={() => setShowStatsPanel(true)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                    />
                  </Tooltip>
                )}
                {!showNodeList && (
                  <Tooltip title="显示节点列表">
                    <Button
                      size="small"
                      icon={<DragOutlined />}
                      onClick={() => setShowNodeList(true)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                    />
                  </Tooltip>
                )}
              </div>

              {/* SVG拓扑图 */}
              <svg
                ref={svgRef}
                width="100%"
                height="100%"
                viewBox="0 0 800 600"
                style={{
                  transform: `scale(${scale}) translate(${panX}px, ${panY}px)`,
                  cursor: dragRef.current ? 'grabbing' : 'grab'
                }}
              >
                {/* 定义箭头标记 - 优化尺寸，更小更精致 */}
                <defs>
                  <marker id="arrow-blue" markerWidth="6" markerHeight="6" refX="5" refY="2" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,4 L5,2 z" fill="#40a9ff" />
                  </marker>
                  <marker id="arrow-cyan" markerWidth="6" markerHeight="6" refX="5" refY="2" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,4 L5,2 z" fill="#36cfc9" />
                  </marker>
                  <marker id="arrow-red" markerWidth="6" markerHeight="6" refX="5" refY="2" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,4 L5,2 z" fill="#ff4d4f" />
                  </marker>
                </defs>

                {/* 先渲染连接线，作为底层 */}
                {visibleLinks.map(link => {
                  const sourceNode = visibleNodes.find(n => n.id === link.source);
                  const targetNode = visibleNodes.find(n => n.id === link.target);
                  if (!sourceNode || !targetNode) return null;

                  const active = link.bandwidth > 0;
                  const upColor = active ? '#40a9ff' : '#ff4d4f';
                  const downColor = active ? '#36cfc9' : '#ff4d4f';
                  const width = active ? Math.min(4, Math.max(2, 2 + link.bandwidth / 30)) : 1.5;

                  // 获取节点类型配置以计算节点半径
                  const sourceTypeConfig = getNodeTypeConfig(sourceNode.type);
                  const targetTypeConfig = getNodeTypeConfig(targetNode.type);

                  // 计算连线方向向量
                  const dx = targetNode.x - sourceNode.x;
                  const dy = targetNode.y - sourceNode.y;
                  const length = Math.hypot(dx, dy);

                  // 计算单位方向向量
                  const unitX = dx / length;
                  const unitY = dy / length;

                  // 计算双向连线的垂直偏移
                  const offsetX = (dy / length) * 3;
                  const offsetY = (-dx / length) * 3;

                  // 计算连线的起始和结束点，让连线在节点边缘处终止
                  // 上行连线：从源节点边缘到目标节点边缘
                  const upStartX = sourceNode.x + unitX * (sourceTypeConfig.size + 2) + offsetX;
                  const upStartY = sourceNode.y + unitY * (sourceTypeConfig.size + 2) + offsetY;
                  const upEndX = targetNode.x - unitX * (targetTypeConfig.size + 2) + offsetX;
                  const upEndY = targetNode.y - unitY * (targetTypeConfig.size + 2) + offsetY;

                  // 下行连线：从目标节点边缘到源节点边缘
                  const downStartX = targetNode.x - unitX * (targetTypeConfig.size + 2) - offsetX;
                  const downStartY = targetNode.y - unitY * (targetTypeConfig.size + 2) - offsetY;
                  const downEndX = sourceNode.x + unitX * (sourceTypeConfig.size + 2) - offsetX;
                  const downEndY = sourceNode.y + unitY * (sourceTypeConfig.size + 2) - offsetY;

                  return (
                    <g key={link.id}>
                      {/* 上行连线 */}
                      <line
                        x1={upStartX}
                        y1={upStartY}
                        x2={upEndX}
                        y2={upEndY}
                        stroke={upColor}
                        strokeWidth={width}
                        opacity={active ? 0.9 : 0.6}
                        strokeDasharray={active ? 'none' : '4,2'}
                        markerEnd={`url(#${active ? 'arrow-blue' : 'arrow-red'})`}
                      />
                      {/* 下行连线 */}
                      <line
                        x1={downStartX}
                        y1={downStartY}
                        x2={downEndX}
                        y2={downEndY}
                        stroke={downColor}
                        strokeWidth={width}
                        opacity={active ? 0.8 : 0.5}
                        strokeDasharray={active ? 'none' : '4,2'}
                        markerEnd={`url(#${active ? 'arrow-cyan' : 'arrow-red'})`}
                      />
                      {/* 连接标签 */}
                      {labelMode !== 'none' && (
                        <text
                          x={(sourceNode.x + targetNode.x) / 2}
                          y={(sourceNode.y + targetNode.y) / 2 - 6}
                          fill="#8c8c8c"
                          fontSize={10}
                          textAnchor="middle"
                        >
                          {labelMode === 'latency' && `${link.latency}ms`}
                          {labelMode === 'distance' && `${link.distance}m`}
                          {labelMode === 'rssi' && `${link.rssi}dBm`}
                          {labelMode === 'bandwidth' && `${link.bandwidth}Mbps`}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* 然后渲染节点，作为顶层，确保节点图标始终可见 */}
                {visibleNodes.map(node => {
                  const statusConfig = getStatusConfig(node.status);
                  const typeConfig = getNodeTypeConfig(node.type);

                  return (
                    <g
                      key={node.id}
                      style={{ cursor: 'pointer' }}
                      onMouseDown={(e) => onNodeMouseDown(node, e)}
                      onClick={() => handleNodeClick(node)}
                    >
                      {/* 节点光晕 */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={typeConfig.size + 3}
                        fill={typeConfig.color}
                        opacity={0.15}
                      />
                      {/* 节点主体 */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={typeConfig.size}
                        fill={typeConfig.color}
                        stroke={statusConfig.color}
                        strokeWidth={2}
                      />
                      {/* 节点名称 */}
                      <text
                        x={node.x + typeConfig.size + 6}
                        y={node.y + 4}
                        fill="#ffffff"
                        fontSize={12}
                      >
                        {node.name}
                      </text>
                      {/* 节点信息 */}
                      <text
                        x={node.x + typeConfig.size + 6}
                        y={node.y + 18}
                        fill="#8c8c8c"
                        fontSize={10}
                      >
                        {typeConfig.text} · RSSI {node.rssi}dBm
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* 缩放控制 */}
              <div className={styles.zoomControls}>
                <Button
                  size="small"
                  icon={<ZoomInOutlined />}
                  onClick={() => setScale(s => Math.min(2.5, s * 1.2))}
                  className={styles.zoomButton}
                />
                <div className={styles.zoomText}>
                  {Math.round(scale * 100)}%
                </div>
                <Button
                  size="small"
                  icon={<ZoomOutOutlined />}
                  onClick={() => setScale(s => Math.max(0.4, s / 1.2))}
                  className={styles.zoomButton}
                />
              </div>

              {/* 滚轮缩放提示 */}
              {!isTopologyFocused && (
                <div className={styles.scrollHint}>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px' }}>
                    点击此区域后可使用滚轮缩放
                  </Text>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TopologyManagement2;
