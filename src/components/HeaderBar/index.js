import React from 'react';
import { Layout, Button, Dropdown, Avatar, Space, Typography } from 'antd';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined, 
  UserOutlined, 
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons';
import styles from './index.module.css';

const { Header } = Layout;
const { Text } = Typography;

const HeaderBar = ({ collapsed, onToggle, onLogout }) => {
  // 用户菜单项
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '个人设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: onLogout,
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      onLogout();
    }
    // 其他菜单项的处理逻辑可以在这里添加
  };

  return (
    <Header className={styles.header}>
      <div className={styles.headerLeft}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          className={styles.triggerBtn}
        />
      </div>
      
      <div className={styles.headerRight}>
        <Dropdown
          menu={{
            items: userMenuItems,
            onClick: handleMenuClick,
          }}
          placement="bottomRight"
          arrow
        >
          <div className={styles.userInfo}>
            <Space>
              <Avatar 
                size="small" 
                icon={<UserOutlined />} 
                className={styles.avatar}
              />
              <div className={styles.userDetails}>
                <Text className={styles.username}>管理员</Text>
                <Text type="secondary" className={styles.role}>
                  系统管理员
                </Text>
              </div>
            </Space>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default HeaderBar;
