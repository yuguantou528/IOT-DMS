import moment from 'moment';

// 模拟延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟当前用户数据
const mockCurrentUser = {
  id: 1,
  username: 'admin',
  realName: '系统管理员',
  email: 'admin@example.com',
  phone: '13800138000',
  department: '技术部',
  position: '系统管理员',
  roleName: '超级管理员',
  avatar: null,
  bio: '负责系统的整体管理和维护工作，确保系统稳定运行。',
  status: 'active',
  createTime: '2024-01-01 09:00:00',
  updateTime: '2024-01-20 15:30:00',
  lastLoginTime: '2024-01-20 15:30:00',
  passwordUpdateTime: '2024-01-15 10:20:00'
};

// 模拟登录历史数据
const mockLoginHistory = [
  {
    id: 1,
    loginTime: '2024-01-20 15:30:25',
    ip: '192.168.1.100',
    location: '北京市朝阳区',
    userAgent: 'Chrome 120.0.0.0',
    status: 'success'
  },
  {
    id: 2,
    loginTime: '2024-01-20 09:15:42',
    ip: '192.168.1.100',
    location: '北京市朝阳区',
    userAgent: 'Chrome 120.0.0.0',
    status: 'success'
  },
  {
    id: 3,
    loginTime: '2024-01-19 18:45:30',
    ip: '192.168.1.100',
    location: '北京市朝阳区',
    userAgent: 'Chrome 120.0.0.0',
    status: 'success'
  },
  {
    id: 4,
    loginTime: '2024-01-19 09:20:15',
    ip: '192.168.1.100',
    location: '北京市朝阳区',
    userAgent: 'Chrome 120.0.0.0',
    status: 'success'
  },
  {
    id: 5,
    loginTime: '2024-01-18 16:30:00',
    ip: '192.168.1.100',
    location: '北京市朝阳区',
    userAgent: 'Chrome 120.0.0.0',
    status: 'success'
  },
  {
    id: 6,
    loginTime: '2024-01-18 08:45:20',
    ip: '192.168.1.100',
    location: '北京市朝阳区',
    userAgent: 'Chrome 120.0.0.0',
    status: 'success'
  },
  {
    id: 7,
    loginTime: '2024-01-17 17:20:35',
    ip: '192.168.1.100',
    location: '北京市朝阳区',
    userAgent: 'Chrome 120.0.0.0',
    status: 'success'
  },
  {
    id: 8,
    loginTime: '2024-01-17 09:10:50',
    ip: '192.168.1.100',
    location: '北京市朝阳区',
    userAgent: 'Chrome 120.0.0.0',
    status: 'success'
  },
  {
    id: 9,
    loginTime: '2024-01-16 15:55:12',
    ip: '192.168.1.100',
    location: '北京市朝阳区',
    userAgent: 'Chrome 120.0.0.0',
    status: 'success'
  },
  {
    id: 10,
    loginTime: '2024-01-16 08:30:45',
    ip: '192.168.1.100',
    location: '北京市朝阳区',
    userAgent: 'Chrome 120.0.0.0',
    status: 'success'
  }
];

// 获取当前用户信息
export const getCurrentUser = async () => {
  await delay(300);
  
  return {
    success: true,
    data: { ...mockCurrentUser }
  };
};

// 更新个人信息
export const updateProfile = async (data) => {
  await delay(800);
  
  // 验证邮箱格式
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return {
      success: false,
      message: '邮箱格式不正确'
    };
  }
  
  // 验证手机号格式
  if (data.phone && !/^1[3-9]\d{9}$/.test(data.phone)) {
    return {
      success: false,
      message: '手机号格式不正确'
    };
  }
  
  // 更新用户信息
  Object.assign(mockCurrentUser, {
    ...data,
    updateTime: moment().format('YYYY-MM-DD HH:mm:ss')
  });
  
  return {
    success: true,
    data: { ...mockCurrentUser },
    message: '个人信息更新成功'
  };
};

// 修改密码
export const changePassword = async (data) => {
  await delay(1000);
  
  const { currentPassword, newPassword } = data;
  
  // 验证当前密码（这里简单模拟，实际应该验证真实密码）
  if (currentPassword !== 'admin123') {
    return {
      success: false,
      message: '当前密码不正确'
    };
  }
  
  // 验证新密码强度
  if (newPassword.length < 6) {
    return {
      success: false,
      message: '新密码长度至少6位'
    };
  }
  
  // 更新密码修改时间
  mockCurrentUser.passwordUpdateTime = moment().format('YYYY-MM-DD HH:mm:ss');
  mockCurrentUser.updateTime = moment().format('YYYY-MM-DD HH:mm:ss');
  
  return {
    success: true,
    message: '密码修改成功'
  };
};

// 获取登录历史
export const getLoginHistory = async (params = {}) => {
  await delay(500);
  
  const { current = 1, pageSize = 10 } = params;
  
  // 分页处理
  const start = (current - 1) * pageSize;
  const end = start + pageSize;
  const paginatedData = mockLoginHistory.slice(start, end);
  
  return {
    success: true,
    data: paginatedData,
    total: mockLoginHistory.length,
    current,
    pageSize
  };
};

// 上传头像
export const uploadAvatar = async (file) => {
  await delay(1500);
  
  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      message: '只支持 JPG、PNG 格式的图片'
    };
  }
  
  // 验证文件大小（2MB）
  if (file.size > 2 * 1024 * 1024) {
    return {
      success: false,
      message: '文件大小不能超过 2MB'
    };
  }
  
  // 模拟上传成功，返回头像URL
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${mockCurrentUser.username}`;
  
  // 更新用户头像
  mockCurrentUser.avatar = avatarUrl;
  mockCurrentUser.updateTime = moment().format('YYYY-MM-DD HH:mm:ss');
  
  return {
    success: true,
    data: {
      url: avatarUrl
    },
    message: '头像上传成功'
  };
};

// 获取用户统计信息
export const getUserStats = async () => {
  await delay(300);
  
  return {
    success: true,
    data: {
      loginCount: mockLoginHistory.length,
      lastLoginTime: mockCurrentUser.lastLoginTime,
      accountAge: moment().diff(moment(mockCurrentUser.createTime), 'days'),
      profileCompleteness: 85 // 资料完整度百分比
    }
  };
};

// 验证当前密码
export const verifyCurrentPassword = async (password) => {
  await delay(500);
  
  // 简单模拟密码验证
  const isValid = password === 'admin123';
  
  return {
    success: isValid,
    message: isValid ? '密码验证成功' : '密码不正确'
  };
};

// 获取安全设置
export const getSecuritySettings = async () => {
  await delay(300);
  
  return {
    success: true,
    data: {
      twoFactorEnabled: false,
      lastPasswordChange: mockCurrentUser.passwordUpdateTime,
      loginNotification: true,
      securityQuestions: false
    }
  };
};

// 更新安全设置
export const updateSecuritySettings = async (settings) => {
  await delay(500);
  
  return {
    success: true,
    message: '安全设置更新成功'
  };
};
