import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Breadcrumb as AntBreadcrumb } from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  TeamOutlined,
  SafetyOutlined,
  AppstoreOutlined,
  ShopOutlined,
  TagsOutlined,
  SettingOutlined,
  MonitorOutlined,
  AlertOutlined,
  NodeIndexOutlined
} from '@ant-design/icons';
import styles from './index.module.css';

const Breadcrumb = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 路由映射配置
  const routeMap = {
    '/dashboard': {
      title: '首页',
      icon: <HomeOutlined />,
      path: '/dashboard'
    },
    '/visual-monitor': {
      title: '可视化监控大屏',
      icon: <MonitorOutlined />,
      path: '/visual-monitor'
    },
    '/device/manufacturer': {
      title: '设备厂商',
      icon: <ShopOutlined />,
      parent: '/dashboard',
      path: '/device/manufacturer'
    },
    '/device/model': {
      title: '设备型号',
      icon: <TagsOutlined />,
      parent: '/dashboard',
      path: '/device/model'
    },
    '/device/product': {
      title: '设备模板',
      icon: <AppstoreOutlined />,
      parent: '/dashboard',
      path: '/device/product'
    },
    '/device/management': {
      title: '设备管理',
      icon: <SettingOutlined />,
      parent: '/dashboard',
      path: '/device/management'
    },
    '/device/thing-model': {
      title: '物模型',
      icon: <SettingOutlined />,
      parent: '/dashboard',
      path: '/device/thing-model'
    },
    // '/topology/management': {
    //   title: '拓扑图',
    //   icon: <NodeIndexOutlined />,
    //   parent: '/dashboard',
    //   path: '/topology/management'
    // },
    '/topology/management2': {
      title: '拓扑图二',
      icon: <NodeIndexOutlined />,
      parent: '/dashboard',
      path: '/topology/management2'
    },
    '/alarm/electronic-fence': {
      title: '电子围栏管理',
      icon: <AlertOutlined />,
      parent: '/dashboard',
      path: '/alarm/electronic-fence'
    },
    '/alarm/messages': {
      title: '告警消息管理',
      icon: <AlertOutlined />,
      parent: '/dashboard',
      path: '/alarm/messages'
    },
    '/alarm/rules': {
      title: '告警规则配置',
      icon: <SettingOutlined />,
      parent: '/dashboard',
      path: '/alarm/rules'
    },
    '/system/users': {
      title: '用户列表',
      icon: <UserOutlined />,
      parent: '/dashboard',
      path: '/system/users'
    },
    '/system/roles': {
      title: '角色管理',
      icon: <TeamOutlined />,
      parent: '/dashboard',
      path: '/system/roles'
    },
    '/system/permissions': {
      title: '权限管理',
      icon: <SafetyOutlined />,
      parent: '/dashboard',
      path: '/system/permissions'
    }
  };

  // 生成面包屑路径
  const generateBreadcrumbItems = () => {
    const currentRoute = routeMap[location.pathname];
    
    if (!currentRoute) {
      return [
        {
          title: (
            <span>
              <HomeOutlined />
              <span style={{ marginLeft: 8 }}>首页</span>
            </span>
          )
        }
      ];
    }

    const items = [];

    // 添加首页
    items.push({
      title: (
        <span 
          onClick={() => navigate('/dashboard')}
          style={{ cursor: 'pointer' }}
        >
          <HomeOutlined />
          <span style={{ marginLeft: 8 }}>首页</span>
        </span>
      )
    });

    // 如果当前页面不是仪表板，添加当前页面
    if (location.pathname !== '/dashboard') {
      // 如果是系统设置下的子页面，先添加系统设置
      if (location.pathname.startsWith('/system/')) {
        items.push({
          title: '系统设置'
        });
      }

      // 如果是设备管理下的子页面，先添加设备管理
      if (location.pathname.startsWith('/device/')) {
        items.push({
          title: '设备管理'
        });
      }

      // 添加当前页面
      items.push({
        title: (
          <span>
            {currentRoute.icon}
            <span style={{ marginLeft: 8 }}>{currentRoute.title}</span>
          </span>
        )
      });
    }

    return items;
  };

  const breadcrumbItems = generateBreadcrumbItems();

  // 如果只有一个项目（首页），不显示面包屑
  if (breadcrumbItems.length <= 1 && location.pathname === '/dashboard') {
    return null;
  }

  return (
    <div className={styles.breadcrumbContainer}>
      <AntBreadcrumb 
        items={breadcrumbItems}
        className={styles.breadcrumb}
      />
    </div>
  );
};

export default Breadcrumb;
