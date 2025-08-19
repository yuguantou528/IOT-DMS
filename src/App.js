import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

// 配置 dayjs 为中文
dayjs.locale('zh-cn');
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import VisualMonitor from './pages/VisualMonitor';
import DeviceManufacturer from './pages/Device/Manufacturer';
import DeviceModel from './pages/Device/Model';
import ProductManagement from './pages/Device/Product';
import ProductDetail from './pages/Device/Product/ProductDetail';
import DeviceManagement from './pages/Device/Management';
import DeviceDetail from './pages/Device/Management/DeviceDetail';
import ThingModelManagement from './pages/Device/ThingModel';
import TopologyManagement from './pages/Topology/Management';
import TopologyManagement2 from './pages/Topology/Management2';
import AlarmMessages from './pages/Alarm/Messages';
import AlarmRules from './pages/Alarm/Rules';
import ElectronicFence from './pages/Alarm/ElectronicFence';
import NavigationBar from './components/NavigationBar';
import HeaderBar from './components/HeaderBar';
import Breadcrumb from './components/Breadcrumb';
import styles from './App.module.css';

const { Content, Sider } = Layout;

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // 检查登录状态
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogin = () => {
    localStorage.setItem('token', 'demo-token');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  // 如果在登录页面，显示登录页面
  if (location.pathname === '/login') {
    return <Login onLogin={handleLogin} />;
  }

  // 如果是全屏监控页面，直接显示，不需要登录验证
  if (location.pathname === '/visual-monitor') {
    return <VisualMonitor />;
  }

  // 如果未登录，重定向到登录页面
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={styles.appContainer}>
      {/* 固定侧边栏 */}
      <div className={`${styles.fixedSider} ${collapsed ? styles.collapsed : ''}`}>
        <NavigationBar collapsed={collapsed} />
      </div>

      {/* 主内容区域 */}
      <div className={`${styles.mainLayout} ${collapsed ? styles.siderCollapsed : ''}`}>
        <HeaderBar
          collapsed={collapsed}
          onToggle={toggleCollapsed}
          onLogout={handleLogout}
        />
        <div className={styles.contentWrapper}>
          <Breadcrumb />
          <div className={styles.pageContent}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/visual-monitor" element={<VisualMonitor />} />
              <Route path="/device/manufacturer" element={<DeviceManufacturer />} />
              <Route path="/device/model" element={<DeviceModel />} />
              <Route path="/device/product" element={<ProductManagement />} />
              <Route path="/device/product/detail/:id" element={<ProductDetail />} />
              <Route path="/device/management" element={<DeviceManagement />} />
              <Route path="/device/management/detail/:id" element={<DeviceDetail />} />
              <Route path="/device/thing-model" element={<ThingModelManagement />} />
              {/* <Route path="/topology/management" element={<TopologyManagement />} /> */}
              <Route path="/topology/management2" element={<TopologyManagement2 />} />
              <Route path="/alarm/electronic-fence" element={<ElectronicFence />} />
              <Route path="/alarm/messages" element={<AlarmMessages />} />
              <Route path="/alarm/rules" element={<AlarmRules />} />
              <Route path="/system/users" element={<Dashboard title="用户列表" />} />
              <Route path="/system/roles" element={<Dashboard title="角色管理" />} />
              <Route path="/system/permissions" element={<Dashboard title="权限管理" />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
