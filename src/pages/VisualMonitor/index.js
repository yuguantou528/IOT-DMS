import React, { useEffect } from 'react';
import StandaloneMonitor from './StandaloneMonitor';

const VisualMonitor = () => {
  // 设置页面标题和样式
  useEffect(() => {
    document.title = '可视化监控大屏 - 实时监控系统';

    // 隐藏页面滚动条，确保全屏效果
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // 清理函数
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  // 直接返回独立监控组件
  return <StandaloneMonitor />;
};

export default VisualMonitor;
