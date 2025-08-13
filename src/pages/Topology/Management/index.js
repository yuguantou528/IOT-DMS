import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  List,
  Tree,
  Typography,
  Badge,
  Divider,
  Space,
  Button,
  Input,
  Empty
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  NodeIndexOutlined,
  BankOutlined,
  FolderOutlined,
  FileOutlined
} from '@ant-design/icons';
import styles from './index.module.css';
import MeshRadioManager from '../../../components/DeviceSpecific/MeshRadio';
import TopologyRenderer from '../../../components/TopologyRenderer';

const { Search } = Input;
const { Title, Text } = Typography;

const TopologyManagement = () => {
  const [loading, setLoading] = useState(false);
  const [selectedTopology, setSelectedTopology] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [expandedKeys, setExpandedKeys] = useState(['company-1', 'company-2']);
  const [selectedKeys, setSelectedKeys] = useState([]);

  // 模拟公司和拓扑图数据
  const mockCompanyData = [
    {
      key: 'company-1',
      title: '华为技术有限公司',
      icon: <BankOutlined />,
      children: [
        {
          key: 'topology-1-1',
          title: '5G基站网络拓扑',
          icon: <FileOutlined />,
          deviceCount: 12,
          status: 'online',
          lastUpdate: '2024-01-21 15:30:00',
          description: '华为5G基站Mesh网络拓扑图',
          mockDevice: {
            id: 1,
            name: '华为5G基站-001',
            deviceType: 'mesh_radio'
          },
          topologyType: 'star' // 星型拓扑
        },
        {
          key: 'topology-1-2',
          title: 'Mesh电台网络',
          icon: <FileOutlined />,
          deviceCount: 8,
          status: 'online',
          lastUpdate: '2024-01-21 14:20:00',
          description: '华为Mesh电台通信网络拓扑',
          mockDevice: {
            id: 2,
            name: '华为Mesh电台-002',
            deviceType: 'mesh_radio'
          },
          topologyType: 'mesh' // 网状拓扑
        }
      ]
    },
    {
      key: 'company-2',
      title: '海康威视数字技术股份有限公司',
      icon: <BankOutlined />,
      children: [
        {
          key: 'topology-2-1',
          title: '监控网络拓扑',
          icon: <FileOutlined />,
          deviceCount: 15,
          status: 'online',
          lastUpdate: '2024-01-21 16:10:00',
          description: '海康威视监控设备网络拓扑',
          mockDevice: {
            id: 3,
            name: '海康监控网关-003',
            deviceType: 'mesh_radio'
          },
          topologyType: 'tree' // 树型拓扑
        },
        {
          key: 'topology-2-2',
          title: '智能安防拓扑',
          icon: <FileOutlined />,
          deviceCount: 20,
          status: 'warning',
          lastUpdate: '2024-01-21 13:45:00',
          description: '智能安防系统网络拓扑图',
          mockDevice: {
            id: 4,
            name: '智能安防网关-004',
            deviceType: 'mesh_radio'
          },
          topologyType: 'ring' // 环型拓扑
        }
      ]
    },
    {
      key: 'company-3',
      title: '大华技术股份有限公司',
      icon: <BankOutlined />,
      children: [
        {
          key: 'topology-3-1',
          title: '视频监控拓扑',
          icon: <FileOutlined />,
          deviceCount: 18,
          status: 'offline',
          lastUpdate: '2024-01-20 18:30:00',
          description: '大华视频监控网络拓扑',
          mockDevice: {
            id: 5,
            name: '大华监控主机-005',
            deviceType: 'mesh_radio'
          },
          topologyType: 'bus' // 总线型拓扑
        }
      ]
    }
  ];

  // 获取所有拓扑图数据（用于搜索）
  const getAllTopologies = () => {
    const topologies = [];
    mockCompanyData.forEach(company => {
      company.children.forEach(topology => {
        topologies.push({
          ...topology,
          companyName: company.title
        });
      });
    });
    return topologies;
  };

  // 过滤拓扑图数据
  const getFilteredData = () => {
    if (!searchValue) return mockCompanyData;

    const filteredData = [];
    mockCompanyData.forEach(company => {
      const filteredChildren = company.children.filter(topology =>
        topology.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        company.title.toLowerCase().includes(searchValue.toLowerCase())
      );
      
      if (filteredChildren.length > 0) {
        filteredData.push({
          ...company,
          children: filteredChildren
        });
      }
    });
    return filteredData;
  };

  // 处理拓扑图选择
  const handleTopologySelect = (selectedKeys, info) => {
    if (selectedKeys.length > 0) {
      const selectedKey = selectedKeys[0];
      // 只处理拓扑图节点，忽略公司节点
      if (selectedKey.startsWith('topology-')) {
        const allTopologies = getAllTopologies();
        const topology = allTopologies.find(t => t.key === selectedKey);
        if (topology) {
          setSelectedTopology(topology);
          setSelectedKeys([selectedKey]);
        }
      }
    }
  };

  // 初始化：选中第一个拓扑图
  useEffect(() => {
    if (!selectedTopology) {
      const allTopologies = getAllTopologies();
      if (allTopologies.length > 0) {
        const firstTopology = allTopologies[0];
        setSelectedTopology(firstTopology);
        setSelectedKeys([firstTopology.key]);
      }
    }
  }, []);

  // 获取状态颜色
  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'success';
      case 'warning': return 'warning';
      case 'offline': return 'error';
      default: return 'default';
    }
  };

  // 获取状态文本
  const getStatusText = (status) => {
    switch (status) {
      case 'online': return '正常';
      case 'warning': return '告警';
      case 'offline': return '离线';
      default: return '未知';
    }
  };

  // 刷新数据
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className={styles.container}>
      <Row gutter={16} style={{ height: '100%' }}>
        {/* 左侧公司和拓扑图列表 */}
        <Col span={6}>
          <Card
            title={
              <Space>
                <NodeIndexOutlined />
                <span>拓扑图列表</span>
              </Space>
            }
            extra={
              <Space>
                <Button
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  loading={loading}
                >
                  刷新
                </Button>
              </Space>
            }
            className={styles.listCard}
            bodyStyle={{ padding: 0 }}
          >
            <div className={styles.searchArea}>
              <Search
                placeholder="搜索公司或拓扑图"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                allowClear
                size="small"
              />
            </div>

            <div className={styles.treeContainer}>
              <Tree
                showIcon
                expandedKeys={expandedKeys}
                selectedKeys={selectedKeys}
                onExpand={setExpandedKeys}
                onSelect={handleTopologySelect}
                treeData={getFilteredData()}
                titleRender={(nodeData) => {
                  if (nodeData.key && nodeData.key.startsWith('topology-')) {
                    // 拓扑图节点 - 不显示子项统计
                    return (
                      <div className={styles.topologyItem}>
                        <div className={styles.topologyTitle}>
                          <span>{nodeData.title}</span>
                          <Badge
                            status={getStatusColor(nodeData.status)}
                            text={getStatusText(nodeData.status)}
                            style={{ marginLeft: 8 }}
                          />
                        </div>
                        <div className={styles.topologyMeta}>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            设备数量: {nodeData.deviceCount} | 更新: {nodeData.lastUpdate}
                          </Text>
                        </div>
                      </div>
                    );
                  } else {
                    // 公司节点 - 显示拓扑图数量统计
                    return (
                      <div className={styles.companyItem}>
                        <Text strong>{nodeData.title}</Text>
                        <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                          ({nodeData.children?.length || 0}个拓扑图)
                        </Text>
                      </div>
                    );
                  }
                }}
              />
            </div>
          </Card>
        </Col>

        {/* 右侧拓扑图显示区域 */}
        <Col span={18}>
          <Card
            title={
              selectedTopology ? (
                <Space>
                  <NodeIndexOutlined />
                  <span>{selectedTopology.title}</span>
                  <Badge
                    status={getStatusColor(selectedTopology.status)}
                    text={getStatusText(selectedTopology.status)}
                  />
                </Space>
              ) : (
                <Space>
                  <NodeIndexOutlined />
                  <span>拓扑图详情</span>
                </Space>
              )
            }
            extra={
              selectedTopology && (
                <Space>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    所属公司: {selectedTopology.companyName}
                  </Text>
                </Space>
              )
            }
            className={styles.topologyCard}
            bodyStyle={{ padding: 0, height: 'calc(100vh - 200px)' }}
          >
            {selectedTopology ? (
              <div className={styles.topologyContent}>
                {/* 拓扑图信息栏 */}
                <div className={styles.topologyInfo}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Space>
                        <Text strong>描述:</Text>
                        <Text>{selectedTopology.description}</Text>
                      </Space>
                    </Col>
                    <Col span={6}>
                      <Space>
                        <Text strong>设备数量:</Text>
                        <Text>{selectedTopology.deviceCount}</Text>
                      </Space>
                    </Col>
                    <Col span={6}>
                      <Space>
                        <Text strong>最后更新:</Text>
                        <Text>{selectedTopology.lastUpdate}</Text>
                      </Space>
                    </Col>
                  </Row>
                </div>

                <Divider style={{ margin: '12px 0' }} />

                {/* 拓扑图显示区域 */}
                <div className={styles.topologyDisplay}>
                  {selectedTopology.topologyType === 'mesh' ? (
                    <MeshRadioManager
                      device={selectedTopology.mockDevice}
                      mode="topology"
                      onParameterUpdate={() => {}}
                    />
                  ) : (
                    <TopologyRenderer
                      topologyType={selectedTopology.topologyType}
                      deviceInfo={selectedTopology.mockDevice}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="请从左侧选择一个拓扑图进行查看"
                >
                  <Text type="secondary">
                    选择公司下的拓扑图，即可在此区域查看详细的网络拓扑结构
                  </Text>
                </Empty>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TopologyManagement; 