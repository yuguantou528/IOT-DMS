import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'antd';
import {
  HomeOutlined,
  SettingOutlined,
  AppstoreOutlined,
  MonitorOutlined,
  AlertOutlined,
  NodeIndexOutlined
} from '@ant-design/icons';
import styles from './index.module.css';

const NavigationBar = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [openKeys, setOpenKeys] = useState([]);

  // 菜单配置
  const menuItems = [
    {
      key: 'dashboard',
      icon: <HomeOutlined />,
      label: '首页',
      path: '/dashboard'
    },
    {
      key: 'visual-monitor',
      icon: <MonitorOutlined />,
      label: '可视化监控大屏',
      path: '/visual-monitor'
    },
    {
      key: 'device',
      icon: <AppstoreOutlined />,
      label: '设备管理',
      children: [
        {
          key: 'device-manufacturer',
          label: '设备厂商',
          path: '/device/manufacturer'
        },
        {
          key: 'device-model',
          label: '设备型号',
          path: '/device/model'
        },
        {
          key: 'device-management',
          label: '设备管理',
          path: '/device/management'
        },
        {
          key: 'product-management',
          label: '产品管理',
          path: '/device/product'
        },
        {
          key: 'thing-model',
          label: '物模型',
          path: '/device/thing-model'
        }
      ]
    },
    {
      key: 'topology',
      icon: <NodeIndexOutlined />,
      label: '拓扑图管理',
      children: [
        {
          key: 'topology-management',
          label: '拓扑图',
          path: '/topology/management'
        }
      ]
    },
    {
      key: 'topology2',
      icon: <NodeIndexOutlined />,
      label: '拓扑图管理二',
      children: [
        {
          key: 'topology-management2',
          label: '拓扑图二',
          path: '/topology/management2'
        }
      ]
    },
    {
      key: 'alarm',
      icon: <AlertOutlined />,
      label: '告警管理',
      children: [
        {
          key: 'alarm-messages',
          label: '告警消息管理',
          path: '/alarm/messages'
        },
        {
          key: 'alarm-rules',
          label: '告警规则配置',
          path: '/alarm/rules'
        }
      ]
    },
    {
      key: 'system',
      icon: <SettingOutlined />,
      label: '系统设置',
      children: [
        {
          key: 'user-list',
          label: '用户列表',
          path: '/system/users'
        },
        {
          key: 'role-management',
          label: '角色管理',
          path: '/system/roles'
        },
        {
          key: 'permission-management',
          label: '权限管理',
          path: '/system/permissions'
        }
      ]
    }
  ];

  // 路径到菜单key的映射
  const pathToKeyMap = {
    '/dashboard': 'dashboard',
    '/visual-monitor': 'visual-monitor',
    '/device/manufacturer': 'device-manufacturer',
    '/device/model': 'device-model',
    '/device/product': 'product-management',
    '/device/management': 'device-management',
    '/device/thing-model': 'thing-model',
    '/topology/management': 'topology-management',
    '/topology/management2': 'topology-management2',
    '/alarm/messages': 'alarm-messages',
    '/alarm/rules': 'alarm-rules',
    '/system/users': 'user-list',
    '/system/roles': 'role-management',
    '/system/permissions': 'permission-management'
  };

  // 获取父菜单key
  const getParentKey = (childKey) => {
    if (childKey.startsWith('device-')) return 'device';
    if (childKey === 'topology-management') return 'topology';
    if (childKey === 'topology-management2') return 'topology2';
    if (childKey.startsWith('alarm-')) return 'alarm';
    if (childKey.startsWith('system-')) return 'system';
    return null;
  };

  // 根据当前路径设置选中的菜单项
  useEffect(() => {
    const currentKey = pathToKeyMap[location.pathname];
    console.log('🔍 [NavigationBar] 路径变化检测:', {
      pathname: location.pathname,
      currentKey,
      currentOpenKeys: openKeys
    });

    if (currentKey) {
      setSelectedKeys([currentKey]);

      // 如果是子菜单项，只展开当前父菜单，关闭其他菜单
      const parentKey = getParentKey(currentKey);
      if (parentKey) {
        setOpenKeys([parentKey]);
        console.log('📂 [NavigationBar] 子菜单检测，只展开当前父菜单:', {
              currentKey,
          parentKey,
          newOpenKeys: [parentKey]
        });
      }
    }
  }, [location.pathname]);

  // 处理菜单点击
  const handleMenuClick = ({ key }) => {
    console.log('🖱️ [NavigationBar] 菜单点击事件:', {
      clickedKey: key,
      currentOpenKeys: openKeys,
      currentSelectedKeys: selectedKeys
    });

    const findMenuItem = (items, targetKey) => {
      for (const item of items) {
        if (item.key === targetKey) {
          return item;
        }
        if (item.children) {
          const found = findMenuItem(item.children, targetKey);
          if (found) return found;
        }
      }
      return null;
    };

    const menuItem = findMenuItem(menuItems, key);
    console.log('🔍 [NavigationBar] 查找菜单项结果:', {
      key,
      menuItem: menuItem ? { key: menuItem.key, label: menuItem.label, path: menuItem.path } : null
    });

    if (menuItem && menuItem.path) {
      // 可视化监控大屏在新标签页打开
      if (key === 'visual-monitor') {
        window.open(menuItem.path, '_blank');
      } else {
        navigate(menuItem.path);
      }
    }
  };

  // 处理子菜单展开/收起 - 修改为只允许一个菜单展开
  const handleOpenChange = (keys) => {
    const latestOpenKey = keys.find(key => openKeys.indexOf(key) === -1);
    
    if (latestOpenKey) {
      // 只展开当前点击的菜单，关闭其他菜单
      setOpenKeys([latestOpenKey]);
    } else {
      // 如果是收起操作，则清空openKeys
      setOpenKeys([]);
    }
    
    console.log('📋 [NavigationBar] 菜单展开状态变化:', {
      oldOpenKeys: openKeys,
      clickedKeys: keys,
      latestOpenKey,
      newOpenKeys: latestOpenKey ? [latestOpenKey] : []
    });
  };

  // 转换菜单数据格式
  const formatMenuItems = (items) => {
    return items.map(item => ({
      key: item.key,
      icon: item.icon,
      label: item.label,
      children: item.children ? formatMenuItems(item.children) : undefined
    }));
  };

  return (
    <div className={styles.navigationBar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <HomeOutlined />
        </div>
        {!collapsed && (
          <span className={styles.logoText}>物联网设备管理平台原型</span>
        )}
      </div>
      
      <Menu
        mode="inline"
        theme="light"
        selectedKeys={selectedKeys}
        openKeys={collapsed ? [] : openKeys}
        onOpenChange={handleOpenChange}
        onClick={handleMenuClick}
        items={formatMenuItems(menuItems)}
        className={styles.menu}
        inlineCollapsed={collapsed}
      />
    </div>
  );
};

export default NavigationBar;
