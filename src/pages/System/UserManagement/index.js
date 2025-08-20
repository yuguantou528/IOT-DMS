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
  Avatar,
  Tooltip,
  Row,
  Col,
  Statistic,
  Divider
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  ReloadOutlined,
  KeyOutlined,
  PoweroffOutlined,
  CheckCircleOutlined,
  StopOutlined,
  TeamOutlined
} from '@ant-design/icons';
import {
  getUserList,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
  toggleUserStatus,
  getUserStatistics,
  userStatuses,
  departments
} from '../../../services/userManagement';
import { getRoleOptions } from '../../../services/roleManagement';
// import styles from './index.module.css';

const { Search } = Input;
const { Option } = Select;

const UserManagement = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchParams, setSearchParams] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [roleOptions, setRoleOptions] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    departmentStats: []
  });

  // 获取数据
  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const response = await getUserList({
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
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取统计数据
  const fetchStatistics = async () => {
    try {
      const response = await getUserStatistics();
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  // 获取角色选项
  const fetchRoleOptions = async () => {
    try {
      const response = await getRoleOptions();
      if (response.success) {
        setRoleOptions(response.data);
      }
    } catch (error) {
      console.error('获取角色选项失败:', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchStatistics();
    fetchRoleOptions();
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

  // 新增用户
  const handleAdd = () => {
    setEditingRecord(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  // 编辑用户
  const handleEdit = (record) => {
    setEditingRecord(record);
    setIsModalVisible(true);
    form.setFieldsValue({
      ...record,
      password: undefined // 编辑时不显示密码
    });
  };

  // 保存用户
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      let response;
      if (editingRecord) {
        response = await updateUser(editingRecord.id, values);
      } else {
        response = await createUser(values);
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

  // 删除用户
  const handleDelete = async (record) => {
    try {
      const response = await deleteUser(record.id);
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

  // 重置密码
  const handleResetPassword = async (record) => {
    try {
      const response = await resetPassword(record.id, '123456');
      if (response.success) {
        message.success('密码重置成功，新密码为：123456');
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('密码重置失败');
    }
  };

  // 切换用户状态
  const handleToggleStatus = async (record) => {
    try {
      const response = await toggleUserStatus(record.id);
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

  // 表格列定义
  const columns = [
    {
      title: '用户信息',
      key: 'userInfo',
      width: 200,
      render: (_, record) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.realName}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>@{record.username}</div>
          </div>
        </Space>
      )
    },
    {
      title: '联系方式',
      key: 'contact',
      width: 180,
      render: (_, record) => (
        <div>
          <div>{record.email}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.phone}</div>
        </div>
      )
    },
    {
      title: '部门/职位',
      key: 'department',
      width: 150,
      render: (_, record) => (
        <div>
          <div>{record.department}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.position}</div>
        </div>
      )
    },
    {
      title: '角色',
      dataIndex: 'roleNames',
      key: 'roleNames',
      width: 150,
      render: (roleNames) => (
        <div>
          {roleNames?.map(roleName => (
            <Tag key={roleName} color="blue" size="small">
              {roleName}
            </Tag>
          ))}
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => {
        const statusConfig = userStatuses.find(s => s.value === status);
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
      title: '最后登录',
      dataIndex: 'lastLoginTime',
      key: 'lastLoginTime',
      width: 150,
      render: (time) => time || '从未登录'
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
          
          <Tooltip title="重置密码">
            <Popconfirm
              title="确定要重置密码吗？"
              description="密码将重置为：123456"
              onConfirm={() => handleResetPassword(record)}
            >
              <Button
                size="small"
                icon={<KeyOutlined />}
              />
            </Popconfirm>
          </Tooltip>

          <Tooltip title={record.status === 'active' ? '禁用' : '启用'}>
            <Popconfirm
              title={`确定要${record.status === 'active' ? '禁用' : '启用'}该用户吗？`}
              onConfirm={() => handleToggleStatus(record)}
            >
              <Button
                size="small"
                icon={<PoweroffOutlined />}
                danger={record.status === 'active'}
              />
            </Popconfirm>
          </Tooltip>

          <Tooltip title="删除">
            <Popconfirm
              title="确定要删除该用户吗？"
              description="删除后无法恢复"
              onConfirm={() => handleDelete(record)}
            >
              <Button
                size="small"
                icon={<DeleteOutlined />}
                danger
                disabled={record.username === 'admin'}
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
              title="用户总数"
              value={statistics.total}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="启用用户"
              value={statistics.active}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="禁用用户"
              value={statistics.inactive}
              prefix={<StopOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="部门数量"
              value={statistics.departmentStats?.length || 0}
              prefix={<TeamOutlined />}
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
              placeholder="搜索用户名、姓名、邮箱、手机号"
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
              {userStatuses.map(status => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="选择部门"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilter('department', value)}
              value={searchParams.department}
            >
              {departments.map(dept => (
                <Option key={dept.value} value={dept.value}>
                  {dept.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="选择角色"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilter('roleId', value)}
              value={searchParams.roleId}
            >
              {roleOptions.map(role => (
                <Option key={role.value} value={role.value}>
                  {role.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Space>
              <Button onClick={handleReset}>重置</Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleAdd}
              >
                新增用户
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

      {/* 用户列表 */}
      <Card
        title={
          <span>
            <UserOutlined style={{ marginRight: 8 }} />
            用户列表
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
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingRecord ? '编辑用户' : '新增用户'}
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
                label="用户名"
                name="username"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { pattern: /^[a-zA-Z0-9_]{3,20}$/, message: '用户名只能包含字母、数字、下划线，长度3-20位' }
                ]}
              >
                <Input placeholder="请输入用户名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="真实姓名"
                name="realName"
                rules={[{ required: true, message: '请输入真实姓名' }]}
              >
                <Input placeholder="请输入真实姓名" />
              </Form.Item>
            </Col>
          </Row>

          {!editingRecord && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="密码"
                  name="password"
                  rules={[
                    { required: true, message: '请输入密码' },
                    { min: 6, message: '密码至少6位' }
                  ]}
                >
                  <Input.Password placeholder="请输入密码" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="确认密码"
                  name="confirmPassword"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: '请确认密码' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('两次输入的密码不一致'));
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="请确认密码" />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="邮箱"
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入正确的邮箱格式' }
                ]}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="手机号"
                name="phone"
                rules={[
                  { required: true, message: '请输入手机号' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
                ]}
              >
                <Input placeholder="请输入手机号" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="部门"
                name="department"
                rules={[{ required: true, message: '请选择部门' }]}
              >
                <Select placeholder="请选择部门">
                  {departments.map(dept => (
                    <Option key={dept.value} value={dept.value}>
                      {dept.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="职位"
                name="position"
                rules={[{ required: true, message: '请输入职位' }]}
              >
                <Input placeholder="请输入职位" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="角色"
                name="roleIds"
                rules={[{ required: true, message: '请选择角色' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="请选择角色"
                  style={{ width: '100%' }}
                >
                  {roleOptions.map(role => (
                    <Option key={role.value} value={role.value}>
                      {role.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="状态"
                name="status"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  {userStatuses.map(status => (
                    <Option key={status.value} value={status.value}>
                      {status.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
