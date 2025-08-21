import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Avatar,
  Button,
  Form,
  Input,
  Select,
  Upload,
  message,
  Tabs,
  Descriptions,
  Tag,
  Space,
  Modal,
  Divider,
  Typography,
  Alert
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  CameraOutlined,
  KeyOutlined,
  SettingOutlined,
  SafetyOutlined,
  HistoryOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  TeamOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { getCurrentUser, updateProfile, changePassword, getLoginHistory } from '../../services/profileService';
import styles from './index.module.css';

const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { TextArea } = Input;

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('info');
  const [editMode, setEditMode] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const response = await getCurrentUser();
      if (response.success) {
        setUserInfo(response.data);
        form.setFieldsValue(response.data);
      }
    } catch (error) {
      message.error('获取用户信息失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取登录历史
  const fetchLoginHistory = async () => {
    try {
      const response = await getLoginHistory();
      if (response.success) {
        setLoginHistory(response.data);
      }
    } catch (error) {
      message.error('获取登录历史失败');
    }
  };

  useEffect(() => {
    fetchUserInfo();
    fetchLoginHistory();
  }, []);

  // 保存个人信息
  const handleSaveProfile = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const response = await updateProfile(values);
      if (response.success) {
        message.success('个人信息更新成功');
        setUserInfo({ ...userInfo, ...values });
        setEditMode(false);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('更新失败');
    } finally {
      setLoading(false);
    }
  };

  // 修改密码
  const handleChangePassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      setLoading(true);
      
      const response = await changePassword(values);
      if (response.success) {
        message.success('密码修改成功');
        setPasswordModalVisible(false);
        passwordForm.resetFields();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('密码修改失败');
    } finally {
      setLoading(false);
    }
  };

  // 头像上传
  const handleAvatarUpload = (info) => {
    if (info.file.status === 'done') {
      message.success('头像上传成功');
      setUserInfo({ ...userInfo, avatar: info.file.response.url });
      setAvatarModalVisible(false);
    } else if (info.file.status === 'error') {
      message.error('头像上传失败');
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    form.setFieldsValue(userInfo);
    setEditMode(false);
  };

  if (!userInfo) {
    return <div>加载中...</div>;
  }

  return (
    <div className={styles.profile}>
      <div className={styles.pageHeader}>
        <Title level={2}>个人中心</Title>
        <Text type="secondary">管理您的个人信息和账户设置</Text>
      </div>

      <Row gutter={24}>
        {/* 左侧用户信息卡片 */}
        <Col xs={24} lg={8}>
          <Card className={styles.userCard}>
            <div className={styles.userHeader}>
              <div className={styles.avatarContainer}>
                <Avatar
                  size={80}
                  src={userInfo.avatar}
                  icon={<UserOutlined />}
                  className={styles.avatar}
                />
                <Button
                  type="primary"
                  shape="circle"
                  size="small"
                  icon={<CameraOutlined />}
                  className={styles.avatarBtn}
                  onClick={() => setAvatarModalVisible(true)}
                />
              </div>
              <div className={styles.userBasic}>
                <Title level={4} className={styles.userName}>
                  {userInfo.realName}
                </Title>
                <Text type="secondary">@{userInfo.username}</Text>
                <div className={styles.userRole}>
                  <Tag color="blue">{userInfo.roleName || '系统管理员'}</Tag>
                </div>
              </div>
            </div>

            <Divider />

            <Descriptions column={1} size="small">
              <Descriptions.Item 
                label={<><PhoneOutlined /> 手机号码</>}
              >
                {userInfo.phone || '未设置'}
              </Descriptions.Item>
              <Descriptions.Item 
                label={<><MailOutlined /> 邮箱地址</>}
              >
                {userInfo.email || '未设置'}
              </Descriptions.Item>
              <Descriptions.Item 
                label={<><TeamOutlined /> 所属部门</>}
              >
                {userInfo.department || '未设置'}
              </Descriptions.Item>
              <Descriptions.Item 
                label={<><HomeOutlined /> 职位</>}
              >
                {userInfo.position || '未设置'}
              </Descriptions.Item>
              <Descriptions.Item 
                label={<><CalendarOutlined /> 创建时间</>}
              >
                {userInfo.createTime}
              </Descriptions.Item>
              <Descriptions.Item 
                label={<><ClockCircleOutlined /> 最后登录</>}
              >
                {userInfo.lastLoginTime || '首次登录'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* 右侧详细信息 */}
        <Col xs={24} lg={16}>
          <Card>
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              tabBarExtraContent={
                activeTab === 'info' && (
                  <Space>
                    {editMode ? (
                      <>
                        <Button onClick={handleCancelEdit}>
                          取消
                        </Button>
                        <Button 
                          type="primary" 
                          loading={loading}
                          onClick={handleSaveProfile}
                        >
                          保存
                        </Button>
                      </>
                    ) : (
                      <Button 
                        type="primary" 
                        icon={<EditOutlined />}
                        onClick={() => setEditMode(true)}
                      >
                        编辑信息
                      </Button>
                    )}
                  </Space>
                )
              }
            >
              <TabPane 
                tab={
                  <span>
                    <UserOutlined />
                    基本信息
                  </span>
                } 
                key="info"
              >
                <Form
                  form={form}
                  layout="vertical"
                  disabled={!editMode}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="真实姓名"
                        name="realName"
                        rules={[{ required: true, message: '请输入真实姓名' }]}
                      >
                        <Input placeholder="请输入真实姓名" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="用户名"
                        name="username"
                      >
                        <Input disabled placeholder="用户名不可修改" />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="手机号码"
                        name="phone"
                        rules={[
                          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
                        ]}
                      >
                        <Input placeholder="请输入手机号码" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="邮箱地址"
                        name="email"
                        rules={[
                          { type: 'email', message: '请输入正确的邮箱地址' }
                        ]}
                      >
                        <Input placeholder="请输入邮箱地址" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="所属部门"
                        name="department"
                      >
                        <Select placeholder="请选择部门">
                          <Select.Option value="技术部">技术部</Select.Option>
                          <Select.Option value="运营部">运营部</Select.Option>
                          <Select.Option value="市场部">市场部</Select.Option>
                          <Select.Option value="财务部">财务部</Select.Option>
                          <Select.Option value="人事部">人事部</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="职位"
                        name="position"
                      >
                        <Input placeholder="请输入职位" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    label="个人简介"
                    name="bio"
                  >
                    <TextArea 
                      rows={4} 
                      placeholder="请输入个人简介"
                      maxLength={200}
                      showCount
                    />
                  </Form.Item>
                </Form>
              </TabPane>

              <TabPane 
                tab={
                  <span>
                    <SafetyOutlined />
                    安全设置
                  </span>
                } 
                key="security"
              >
                <div className={styles.securitySettings}>
                  <Alert
                    message="安全提示"
                    description="为了您的账户安全，建议定期修改密码，并启用双因素认证。"
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                  />

                  <Card size="small" style={{ marginBottom: 16 }}>
                    <div className={styles.securityItem}>
                      <div className={styles.securityInfo}>
                        <KeyOutlined className={styles.securityIcon} />
                        <div>
                          <div className={styles.securityTitle}>登录密码</div>
                          <div className={styles.securityDesc}>
                            上次修改时间：{userInfo.passwordUpdateTime || '未知'}
                          </div>
                        </div>
                      </div>
                      <Button 
                        type="primary"
                        onClick={() => setPasswordModalVisible(true)}
                      >
                        修改密码
                      </Button>
                    </div>
                  </Card>

                  <Card size="small">
                    <div className={styles.securityItem}>
                      <div className={styles.securityInfo}>
                        <SafetyOutlined className={styles.securityIcon} />
                        <div>
                          <div className={styles.securityTitle}>双因素认证</div>
                          <div className={styles.securityDesc}>
                            增强账户安全性，防止未授权访问
                          </div>
                        </div>
                      </div>
                      <Button disabled>
                        即将开放
                      </Button>
                    </div>
                  </Card>
                </div>
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <HistoryOutlined />
                    登录历史
                  </span>
                }
                key="history"
              >
                <div className={styles.loginHistory}>
                  <div style={{ marginBottom: 16 }}>
                    <Text type="secondary">
                      显示最近10次登录记录，帮助您了解账户的使用情况
                    </Text>
                  </div>
                  {loginHistory.map((record, index) => (
                    <Card size="small" key={index} style={{ marginBottom: 12 }}>
                      <Row align="middle">
                        <Col span={6}>
                          <div>
                            <Text strong>{record.loginTime}</Text>
                          </div>
                        </Col>
                        <Col span={5}>
                          <div>
                            <EnvironmentOutlined style={{ marginRight: 4, color: '#1890ff' }} />
                            <Text>{record.ip}</Text>
                          </div>
                        </Col>
                        <Col span={6}>
                          <Text type="secondary">{record.location}</Text>
                        </Col>
                        <Col span={4}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {record.userAgent}
                          </Text>
                        </Col>
                        <Col span={3}>
                          <Tag
                            color={record.status === 'success' ? 'green' : 'red'}
                            icon={record.status === 'success' ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
                          >
                            {record.status === 'success' ? '成功' : '失败'}
                          </Tag>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </div>
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <SettingOutlined />
                    系统偏好
                  </span>
                }
                key="preferences"
              >
                <div className={styles.preferences}>
                  <Alert
                    message="个性化设置"
                    description="根据您的使用习惯调整系统设置，提升使用体验。"
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                  />

                  <Row gutter={24}>
                    <Col span={12}>
                      <Card size="small" title="界面设置" style={{ marginBottom: 16 }}>
                        <Form layout="vertical" size="small">
                          <Form.Item label="主题模式">
                            <Select defaultValue="light" style={{ width: '100%' }}>
                              <Select.Option value="light">浅色模式</Select.Option>
                              <Select.Option value="dark">深色模式</Select.Option>
                              <Select.Option value="auto">跟随系统</Select.Option>
                            </Select>
                          </Form.Item>
                          <Form.Item label="语言设置">
                            <Select defaultValue="zh-CN" style={{ width: '100%' }}>
                              <Select.Option value="zh-CN">简体中文</Select.Option>
                              <Select.Option value="en-US">English</Select.Option>
                            </Select>
                          </Form.Item>
                          <Form.Item label="侧边栏默认状态">
                            <Select defaultValue="expanded" style={{ width: '100%' }}>
                              <Select.Option value="expanded">展开</Select.Option>
                              <Select.Option value="collapsed">收起</Select.Option>
                            </Select>
                          </Form.Item>
                        </Form>
                      </Card>
                    </Col>

                    <Col span={12}>
                      <Card size="small" title="通知设置" style={{ marginBottom: 16 }}>
                        <Form layout="vertical" size="small">
                          <Form.Item label="邮件通知">
                            <Select defaultValue="important" style={{ width: '100%' }}>
                              <Select.Option value="all">所有通知</Select.Option>
                              <Select.Option value="important">重要通知</Select.Option>
                              <Select.Option value="none">关闭通知</Select.Option>
                            </Select>
                          </Form.Item>
                          <Form.Item label="短信通知">
                            <Select defaultValue="urgent" style={{ width: '100%' }}>
                              <Select.Option value="all">所有通知</Select.Option>
                              <Select.Option value="urgent">紧急通知</Select.Option>
                              <Select.Option value="none">关闭通知</Select.Option>
                            </Select>
                          </Form.Item>
                          <Form.Item label="浏览器通知">
                            <Select defaultValue="enabled" style={{ width: '100%' }}>
                              <Select.Option value="enabled">启用</Select.Option>
                              <Select.Option value="disabled">禁用</Select.Option>
                            </Select>
                          </Form.Item>
                        </Form>
                      </Card>
                    </Col>
                  </Row>

                  <Card size="small" title="数据设置">
                    <Form layout="vertical" size="small">
                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item label="数据刷新频率">
                            <Select defaultValue="30" style={{ width: '100%' }}>
                              <Select.Option value="10">10秒</Select.Option>
                              <Select.Option value="30">30秒</Select.Option>
                              <Select.Option value="60">1分钟</Select.Option>
                              <Select.Option value="300">5分钟</Select.Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item label="默认时间范围">
                            <Select defaultValue="24h" style={{ width: '100%' }}>
                              <Select.Option value="1h">最近1小时</Select.Option>
                              <Select.Option value="6h">最近6小时</Select.Option>
                              <Select.Option value="24h">最近24小时</Select.Option>
                              <Select.Option value="7d">最近7天</Select.Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item label="分页大小">
                            <Select defaultValue="20" style={{ width: '100%' }}>
                              <Select.Option value="10">10条/页</Select.Option>
                              <Select.Option value="20">20条/页</Select.Option>
                              <Select.Option value="50">50条/页</Select.Option>
                              <Select.Option value="100">100条/页</Select.Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>

                      <div style={{ marginTop: 16 }}>
                        <Button type="primary">
                          保存设置
                        </Button>
                        <Button style={{ marginLeft: 8 }}>
                          重置为默认
                        </Button>
                      </div>
                    </Form>
                  </Card>
                </div>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {/* 修改密码弹窗 */}
      <Modal
        title="修改密码"
        open={passwordModalVisible}
        onOk={handleChangePassword}
        onCancel={() => {
          setPasswordModalVisible(false);
          passwordForm.resetFields();
        }}
        confirmLoading={loading}
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item
            label="当前密码"
            name="currentPassword"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password placeholder="请输入当前密码" />
          </Form.Item>
          
          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度至少6位' }
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          
          <Form.Item
            label="确认新密码"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 头像上传弹窗 */}
      <Modal
        title="更换头像"
        open={avatarModalVisible}
        onCancel={() => setAvatarModalVisible(false)}
        footer={null}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Upload
            name="avatar"
            listType="picture-card"
            className={styles.avatarUploader}
            showUploadList={false}
            action="/api/upload/avatar"
            onChange={handleAvatarUpload}
          >
            <div>
              <CameraOutlined />
              <div style={{ marginTop: 8 }}>上传头像</div>
            </div>
          </Upload>
          <div style={{ marginTop: 16, color: '#666' }}>
            支持 JPG、PNG 格式，文件大小不超过 2MB
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
