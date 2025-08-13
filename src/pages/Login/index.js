import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message, Space, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined, ReloadOutlined, LoginOutlined } from '@ant-design/icons';
import styles from './index.module.css';

const { Title, Text } = Typography;

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [autoLoginLoading, setAutoLoginLoading] = useState(false);
  const [captcha, setCaptcha] = useState('ABCD');
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    // 组件挂载时自动预填演示账号
    form.setFieldsValue({
      username: 'admin',
      password: '123456',
      captcha: captcha
    });
  }, [captcha, form]);

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(result);
  };

  const onFinish = async (values) => {
    setLoading(true);
    
    // 模拟登录验证
    if (values.username === 'admin' && values.password === '123456') {
      if (values.captcha.toUpperCase() === captcha) {
        message.success('登录成功！');
        onLogin();
        navigate('/dashboard');
      } else {
        message.error('验证码错误！');
        generateCaptcha();
      }
    } else {
      message.error('用户名或密码错误！');
    }
    
    setLoading(false);
  };
  
  // 一键自动登录
  const handleAutoLogin = () => {
    setAutoLoginLoading(true);
    
    setTimeout(() => {
      onLogin();
      message.success('演示账号登录成功！');
      navigate('/dashboard');
      setAutoLoginLoading(false);
    }, 800);
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <Card className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <Title level={2} className={styles.title}>
              物联网设备管理平台原型登录
            </Title>
            <Text type="secondary">
              欢迎使用物联网设备管理平台原型
            </Text>
          </div>
          
          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
            initialValues={{
              username: 'admin',
              password: '123456',
              captcha: captcha
            }}
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: '请输入用户名!' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="用户名"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
              />
            </Form.Item>

            <Form.Item>
              <Space.Compact style={{ width: '100%' }}>
                <Form.Item
                  name="captcha"
                  noStyle
                  rules={[
                    { required: true, message: '请输入验证码!' }
                  ]}
                >
                  <Input
                    placeholder="验证码"
                    style={{ width: '60%' }}
                  />
                </Form.Item>
                <div className={styles.captchaBox}>
                  <span className={styles.captchaText}>{captcha}</span>
                  <Button
                    type="text"
                    icon={<ReloadOutlined />}
                    onClick={generateCaptcha}
                    className={styles.refreshBtn}
                  />
                </div>
              </Space.Compact>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className={styles.loginBtn}
              >
                登录
              </Button>
            </Form.Item>
            
            <Divider style={{ margin: '16px 0' }}>或者</Divider>
            
            <Form.Item>
              <Button
                type="default"
                block
                icon={<LoginOutlined />}
                onClick={handleAutoLogin}
                loading={autoLoginLoading}
                className={styles.autoLoginBtn}
              >
                一键登录演示账号
              </Button>
            </Form.Item>
          </Form>

          <div className={styles.demoInfo}>
            <Text type="secondary">
              演示账号：admin / 123456（已自动填充）
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
