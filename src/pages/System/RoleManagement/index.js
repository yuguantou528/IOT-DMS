import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Modal,
  Form,
  message,
  Popconfirm,
  Tag,
  Tooltip,
  Row,
  Col,
  Statistic,
  Tree,
  Divider
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  PoweroffOutlined,
  CheckCircleOutlined,
  StopOutlined,
  TeamOutlined,
  SafetyOutlined,
  SettingOutlined
} from '@ant-design/icons';
import {
  getRoleList,
  createRole,
  updateRole,
  deleteRole,
  toggleRoleStatus,
  assignPermissions,
  getRoleStatistics,
  roleStatuses
} from '../../../services/roleManagement';
import { getPermissionTree } from '../../../services/permissionManagement';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const RoleManagement = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchParams, setSearchParams] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPermissionModalVisible, setIsPermissionModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [form] = Form.useForm();
  const [permissionTree, setPermissionTree] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalUsers: 0
  });

  // 获取数据
  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const response = await getRoleList({
        ...searchParams,
        ...params,
        current: pagination.current,
        pageSize: pagination.pageSize
      });
      
      if (response.success) {
        setDataSource(response.data);
        setPagination({
          ...pagination,
          total: response.total,
          current: response.current,
          pageSize: response.pageSize
        });
      }
    } catch (error) {
      message.error('获取角色列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取统计数据
  const fetchStatistics = async () => {
    try {
      const response = await getRoleStatistics();
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  // 获取权限树
  const fetchPermissionTree = async () => {
    try {
      const response = await getPermissionTree();
      if (response.success) {
        // 转换为Tree组件需要的格式
        const convertToTreeData = (nodes) => {
          return nodes.map(node => ({
            title: node.permissionName,
            key: node.id,
            children: node.children ? convertToTreeData(node.children) : undefined
          }));
        };
        setPermissionTree(convertToTreeData(response.data));
      }
    } catch (error) {
      console.error('获取权限树失败:', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchStatistics();
    fetchPermissionTree();
  }, []);

  // 搜索
  const handleSearch = (value) => {
    const newSearchParams = { ...searchParams, search: value };
    setSearchParams(newSearchParams);
    setPagination({ ...pagination, current: 1 });
    fetchData({ ...newSearchParams, current: 1 });
  };

  // 筛选
  const handleFilter = (key, value) => {
    const newSearchParams = { ...searchParams, [key]: value };
    setSearchParams(newSearchParams);
    setPagination({ ...pagination, current: 1 });
    fetchData({ ...newSearchParams, current: 1 });
  };

  // 重置搜索
  const handleReset = () => {
    setSearchParams({});
    setPagination({ ...pagination, current: 1 });
    fetchData({ current: 1 });
  };

  // 表格变化
  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
    fetchData({
      current: newPagination.current,
      pageSize: newPagination.pageSize
    });
  };

  // 新增角色
  const handleAdd = () => {
    setEditingRecord(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  // 编辑角色
  const handleEdit = (record) => {
    setEditingRecord(record);
    setIsModalVisible(true);
    form.setFieldsValue(record);
  };

  // 保存角色
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      let response;
      if (editingRecord) {
        response = await updateRole(editingRecord.id, values);
      } else {
        response = await createRole(values);
      }

      if (response.success) {
        message.success(response.message);
        setIsModalVisible(false);
        fetchData();
        fetchStatistics();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 删除角色
  const handleDelete = async (record) => {
    try {
      const response = await deleteRole(record.id);
      if (response.success) {
        message.success(response.message);
        fetchData();
        fetchStatistics();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 切换角色状态
  const handleToggleStatus = async (record) => {
    try {
      const response = await toggleRoleStatus(record.id);
      if (response.success) {
        message.success(response.message);
        fetchData();
        fetchStatistics();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('状态切换失败');
    }
  };

  // 分配权限
  const handleAssignPermissions = (record) => {
    setCurrentRole(record);
    setSelectedPermissions(record.permissionIds || []);
    setIsPermissionModalVisible(true);
  };

  // 保存权限分配
  const handleSavePermissions = async () => {
    try {
      const response = await assignPermissions(currentRole.id, selectedPermissions);
      if (response.success) {
        message.success(response.message);
        setIsPermissionModalVisible(false);
        fetchData();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('权限分配失败');
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '角色名称',
      dataIndex: 'roleName',
      key: 'roleName',
      width: 150,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.roleCode}</div>
        </div>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '用户数量',
      dataIndex: 'userCount',
      key: 'userCount',
      width: 100,
      render: (count) => (
        <Tag color="blue">{count} 人</Tag>
      )
    },
    {
      title: '权限数量',
      dataIndex: 'permissionIds',
      key: 'permissionIds',
      width: 100,
      render: (permissionIds) => (
        <Tag color="green">{permissionIds?.length || 0} 项</Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => {
        const statusConfig = roleStatuses.find(s => s.value === status);
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
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 150
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          
          <Tooltip title="分配权限">
            <Button
              size="small"
              icon={<SafetyOutlined />}
              onClick={() => handleAssignPermissions(record)}
            />
          </Tooltip>

          <Tooltip title={record.status === 'active' ? '禁用' : '启用'}>
            <Popconfirm
              title={`确定要${record.status === 'active' ? '禁用' : '启用'}该角色吗？`}
              onConfirm={() => handleToggleStatus(record)}
            >
              <Button
                size="small"
                icon={<PoweroffOutlined />}
                danger={record.status === 'active'}
                disabled={record.roleCode === 'admin'}
              />
            </Popconfirm>
          </Tooltip>

          <Tooltip title="删除">
            <Popconfirm
              title="确定要删除该角色吗？"
              description="删除后无法恢复"
              onConfirm={() => handleDelete(record)}
            >
              <Button
                size="small"
                icon={<DeleteOutlined />}
                danger
                disabled={record.roleCode === 'admin' || record.userCount > 0}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="角色总数"
              value={statistics.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="启用角色"
              value={statistics.active}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="禁用角色"
              value={statistics.inactive}
              prefix={<StopOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="关联用户"
              value={statistics.totalUsers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索筛选区域 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Search
              placeholder="搜索角色名称、编码、描述"
              allowClear
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="选择状态"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilter('status', value)}
              value={searchParams.status}
            >
              {roleStatuses.map(status => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={12}>
            <Space>
              <Button onClick={handleReset}>重置</Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleAdd}
              >
                新增角色
              </Button>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => fetchData()}
              >
                刷新
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 角色列表 */}
      <Card
        title={
          <span>
            <TeamOutlined style={{ marginRight: 8 }} />
            角色列表
          </span>
        }
      >
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingRecord ? '编辑角色' : '新增角色'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        confirmLoading={loading}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'active'
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="角色名称"
                name="roleName"
                rules={[{ required: true, message: '请输入角色名称' }]}
              >
                <Input placeholder="请输入角色名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="角色编码"
                name="roleCode"
                rules={[
                  { required: true, message: '请输入角色编码' },
                  { pattern: /^[a-zA-Z0-9_]{2,20}$/, message: '角色编码只能包含字母、数字、下划线，长度2-20位' }
                ]}
              >
                <Input placeholder="请输入角色编码" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="角色描述"
            name="description"
            rules={[{ required: true, message: '请输入角色描述' }]}
          >
            <TextArea 
              placeholder="请输入角色描述" 
              rows={3}
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              {roleStatuses.map(status => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 权限分配弹窗 */}
      <Modal
        title={`分配权限 - ${currentRole?.roleName}`}
        open={isPermissionModalVisible}
        onOk={handleSavePermissions}
        onCancel={() => setIsPermissionModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <div style={{ maxHeight: 400, overflow: 'auto' }}>
          <Tree
            checkable
            checkedKeys={selectedPermissions}
            onCheck={setSelectedPermissions}
            treeData={permissionTree}
            defaultExpandAll
          />
        </div>
      </Modal>
    </div>
  );
};

export default RoleManagement;
