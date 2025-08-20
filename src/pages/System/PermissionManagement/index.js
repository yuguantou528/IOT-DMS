import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Tooltip,
  Row,
  Col,
  Statistic,
  Tree,
  Tabs
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  SafetyOutlined,
  MenuOutlined,
  ApiOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  StopOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import {
  getPermissionTree,
  getPermissionList,
  getPermissionStatistics,
  permissionTypes,
  permissionStatuses
} from '../../../services/permissionManagement';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const PermissionManagement = () => {
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState([]);
  const [listData, setListData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchParams, setSearchParams] = useState({});
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    typeStats: []
  });
  const [activeTab, setActiveTab] = useState('tree');

  // 获取权限树数据
  const fetchTreeData = async (params = {}) => {
    setLoading(true);
    try {
      const response = await getPermissionTree(params);
      if (response.success) {
        // 转换为Tree组件需要的格式
        const convertToTreeData = (nodes) => {
          return nodes.map(node => ({
            title: (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>
                  {getTypeIcon(node.type)} {node.permissionName}
                </span>
                <div>
                  <Tag color={getTypeColor(node.type)} size="small">
                    {getTypeLabel(node.type)}
                  </Tag>
                  <Tag 
                    color={node.status === 'active' ? 'green' : 'red'} 
                    size="small"
                  >
                    {node.status === 'active' ? '启用' : '禁用'}
                  </Tag>
                </div>
              </div>
            ),
            key: node.id,
            children: node.children ? convertToTreeData(node.children) : undefined,
            data: node
          }));
        };
        setTreeData(convertToTreeData(response.data));
      }
    } catch (error) {
      console.error('获取权限树失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取权限列表数据
  const fetchListData = async (params = {}) => {
    setLoading(true);
    try {
      const response = await getPermissionList({
        ...searchParams,
        ...params,
        current: pagination.current,
        pageSize: pagination.pageSize
      });
      
      if (response.success) {
        setListData(response.data);
        setPagination({
          ...pagination,
          total: response.total,
          current: response.current,
          pageSize: response.pageSize
        });
      }
    } catch (error) {
      console.error('获取权限列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取统计数据
  const fetchStatistics = async () => {
    try {
      const response = await getPermissionStatistics();
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  useEffect(() => {
    fetchTreeData();
    fetchListData();
    fetchStatistics();
  }, []);

  // 获取类型图标
  const getTypeIcon = (type) => {
    const iconMap = {
      menu: <MenuOutlined />,
      button: <SettingOutlined />,
      api: <ApiOutlined />
    };
    return iconMap[type] || <AppstoreOutlined />;
  };

  // 获取类型颜色
  const getTypeColor = (type) => {
    const colorMap = {
      menu: 'blue',
      button: 'green',
      api: 'orange'
    };
    return colorMap[type] || 'default';
  };

  // 获取类型标签
  const getTypeLabel = (type) => {
    const typeConfig = permissionTypes.find(t => t.value === type);
    return typeConfig?.label || type;
  };

  // 搜索
  const handleSearch = (value) => {
    const newSearchParams = { ...searchParams, search: value };
    setSearchParams(newSearchParams);
    
    if (activeTab === 'tree') {
      fetchTreeData(newSearchParams);
    } else {
      setPagination({ ...pagination, current: 1 });
      fetchListData({ ...newSearchParams, current: 1 });
    }
  };

  // 筛选
  const handleFilter = (key, value) => {
    const newSearchParams = { ...searchParams, [key]: value };
    setSearchParams(newSearchParams);
    
    if (activeTab === 'tree') {
      fetchTreeData(newSearchParams);
    } else {
      setPagination({ ...pagination, current: 1 });
      fetchListData({ ...newSearchParams, current: 1 });
    }
  };

  // 重置搜索
  const handleReset = () => {
    setSearchParams({});
    if (activeTab === 'tree') {
      fetchTreeData();
    } else {
      setPagination({ ...pagination, current: 1 });
      fetchListData({ current: 1 });
    }
  };

  // 表格变化
  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
    fetchListData({
      current: newPagination.current,
      pageSize: newPagination.pageSize
    });
  };

  // 切换标签页
  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === 'tree') {
      fetchTreeData(searchParams);
    } else {
      fetchListData(searchParams);
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '权限名称',
      dataIndex: 'permissionName',
      key: 'permissionName',
      width: 200,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {getTypeIcon(record.type)} {text}
          </div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.permissionCode}</div>
        </div>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => {
        const typeConfig = permissionTypes.find(t => t.value === type);
        return (
          <Tag color={typeConfig?.color} icon={getTypeIcon(type)}>
            {typeConfig?.label}
          </Tag>
        );
      }
    },
    {
      title: '路径',
      dataIndex: 'path',
      key: 'path',
      width: 200,
      render: (path) => path || '-'
    },
    {
      title: '图标',
      dataIndex: 'icon',
      key: 'icon',
      width: 100,
      render: (icon) => icon || '-'
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 80
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => {
        const statusConfig = permissionStatuses.find(s => s.value === status);
        return (
          <Tag 
            color={statusConfig?.color} 
            icon={status === 'active' ? <CheckCircleOutlined /> : <StopOutlined />}
          >
            {statusConfig?.label}
          </Tag>
        );
      }
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 150
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="权限总数"
              value={statistics.total}
              prefix={<SafetyOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="启用权限"
              value={statistics.active}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="禁用权限"
              value={statistics.inactive}
              prefix={<StopOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="菜单权限"
              value={statistics.typeStats?.find(t => t.type === 'menu')?.count || 0}
              prefix={<MenuOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索筛选区域 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Search
              placeholder="搜索权限名称、编码、描述"
              allowClear
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="选择类型"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilter('type', value)}
              value={searchParams.type}
            >
              {permissionTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="选择状态"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilter('status', value)}
              value={searchParams.status}
            >
              {permissionStatuses.map(status => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={10}>
            <Space>
              <Button onClick={handleReset}>重置</Button>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => {
                  if (activeTab === 'tree') {
                    fetchTreeData();
                  } else {
                    fetchListData();
                  }
                }}
              >
                刷新
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 权限展示 */}
      <Card
        title={
          <span>
            <SafetyOutlined style={{ marginRight: 8 }} />
            权限管理
          </span>
        }
      >
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="树形结构" key="tree">
            <div style={{ maxHeight: 600, overflow: 'auto' }}>
              <Tree
                treeData={treeData}
                defaultExpandAll
                showLine
                loading={loading}
              />
            </div>
          </TabPane>
          
          <TabPane tab="列表视图" key="list">
            <Table
              columns={columns}
              dataSource={listData}
              rowKey="id"
              loading={loading}
              pagination={{
                ...pagination,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
              }}
              onChange={handleTableChange}
              scroll={{ x: 1200 }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default PermissionManagement;
