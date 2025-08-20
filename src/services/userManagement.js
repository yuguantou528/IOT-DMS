// 用户管理服务
import moment from 'moment';

// 模拟用户数据
let userData = [
  {
    id: 1,
    username: 'admin',
    realName: '系统管理员',
    email: 'admin@example.com',
    phone: '13800138001',
    status: 'active',
    roleIds: [1],
    roleNames: ['系统管理员'],
    lastLoginTime: '2024-01-21 14:30:00',
    createTime: '2024-01-15 10:00:00',
    updateTime: '2024-01-21 14:30:00',
    avatar: null,
    department: '技术部',
    position: '系统管理员'
  },
  {
    id: 2,
    username: 'operator',
    realName: '运维人员',
    email: 'operator@example.com',
    phone: '13800138002',
    status: 'active',
    roleIds: [2],
    roleNames: ['设备运维'],
    lastLoginTime: '2024-01-21 13:45:00',
    createTime: '2024-01-16 09:00:00',
    updateTime: '2024-01-21 13:45:00',
    avatar: null,
    department: '运维部',
    position: '运维工程师'
  },
  {
    id: 3,
    username: 'monitor',
    realName: '监控人员',
    email: 'monitor@example.com',
    phone: '13800138003',
    status: 'active',
    roleIds: [3],
    roleNames: ['监控调度'],
    lastLoginTime: '2024-01-21 12:20:00',
    createTime: '2024-01-17 14:30:00',
    updateTime: '2024-01-21 12:20:00',
    avatar: null,
    department: '监控中心',
    position: '监控员'
  },
  {
    id: 4,
    username: 'guest',
    realName: '访客用户',
    email: 'guest@example.com',
    phone: '13800138004',
    status: 'inactive',
    roleIds: [4],
    roleNames: ['访客'],
    lastLoginTime: '2024-01-20 16:00:00',
    createTime: '2024-01-18 11:00:00',
    updateTime: '2024-01-20 16:00:00',
    avatar: null,
    department: '外部',
    position: '访客'
  }
];

// 用户状态选项
export const userStatuses = [
  { value: 'active', label: '启用', color: 'green' },
  { value: 'inactive', label: '禁用', color: 'red' }
];

// 部门选项
export const departments = [
  { value: '技术部', label: '技术部' },
  { value: '运维部', label: '运维部' },
  { value: '监控中心', label: '监控中心' },
  { value: '管理部', label: '管理部' },
  { value: '外部', label: '外部' }
];

// 模拟延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 获取用户列表
export const getUserList = async (params = {}) => {
  await delay(300);
  
  let filteredData = [...userData];
  
  // 搜索过滤
  if (params.search) {
    const searchText = params.search.toLowerCase();
    filteredData = filteredData.filter(user => 
      user.username.toLowerCase().includes(searchText) ||
      user.realName.toLowerCase().includes(searchText) ||
      user.email.toLowerCase().includes(searchText) ||
      user.phone.includes(searchText)
    );
  }
  
  // 状态过滤
  if (params.status) {
    filteredData = filteredData.filter(user => user.status === params.status);
  }
  
  // 角色过滤
  if (params.roleId) {
    filteredData = filteredData.filter(user => 
      user.roleIds.includes(parseInt(params.roleId))
    );
  }
  
  // 部门过滤
  if (params.department) {
    filteredData = filteredData.filter(user => user.department === params.department);
  }
  
  // 分页处理
  const { current = 1, pageSize = 10 } = params;
  const start = (current - 1) * pageSize;
  const end = start + pageSize;
  const paginatedData = filteredData.slice(start, end);
  
  return {
    success: true,
    data: paginatedData,
    total: filteredData.length,
    current,
    pageSize
  };
};

// 获取用户详情
export const getUserDetail = async (id) => {
  await delay(200);
  
  const user = userData.find(item => item.id === parseInt(id));
  if (!user) {
    return {
      success: false,
      message: '用户不存在'
    };
  }
  
  return {
    success: true,
    data: user
  };
};

// 创建用户
export const createUser = async (data) => {
  await delay(800);
  
  // 检查用户名是否重复
  const existingUser = userData.find(item => item.username === data.username);
  if (existingUser) {
    return {
      success: false,
      message: '用户名已存在'
    };
  }
  
  // 检查邮箱是否重复
  const existingEmail = userData.find(item => item.email === data.email);
  if (existingEmail) {
    return {
      success: false,
      message: '邮箱已存在'
    };
  }
  
  const newUser = {
    id: Math.max(...userData.map(item => item.id)) + 1,
    ...data,
    roleNames: [], // 需要根据roleIds获取角色名称
    lastLoginTime: null,
    createTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    updateTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    avatar: null
  };
  
  userData.unshift(newUser);
  
  return {
    success: true,
    data: newUser,
    message: '用户创建成功'
  };
};

// 更新用户
export const updateUser = async (id, data) => {
  await delay(600);
  
  const index = userData.findIndex(item => item.id === parseInt(id));
  if (index === -1) {
    return {
      success: false,
      message: '用户不存在'
    };
  }
  
  // 检查用户名是否重复（排除自己）
  const existingUser = userData.find(item => 
    item.username === data.username && item.id !== parseInt(id)
  );
  if (existingUser) {
    return {
      success: false,
      message: '用户名已存在'
    };
  }
  
  // 检查邮箱是否重复（排除自己）
  const existingEmail = userData.find(item => 
    item.email === data.email && item.id !== parseInt(id)
  );
  if (existingEmail) {
    return {
      success: false,
      message: '邮箱已存在'
    };
  }
  
  userData[index] = {
    ...userData[index],
    ...data,
    updateTime: moment().format('YYYY-MM-DD HH:mm:ss')
  };
  
  return {
    success: true,
    data: userData[index],
    message: '用户更新成功'
  };
};

// 删除用户
export const deleteUser = async (id) => {
  await delay(500);
  
  const index = userData.findIndex(item => item.id === parseInt(id));
  if (index === -1) {
    return {
      success: false,
      message: '用户不存在'
    };
  }
  
  // 不能删除管理员账号
  if (userData[index].username === 'admin') {
    return {
      success: false,
      message: '不能删除管理员账号'
    };
  }
  
  userData.splice(index, 1);
  
  return {
    success: true,
    message: '用户删除成功'
  };
};

// 重置密码
export const resetPassword = async (id, newPassword) => {
  await delay(500);
  
  const index = userData.findIndex(item => item.id === parseInt(id));
  if (index === -1) {
    return {
      success: false,
      message: '用户不存在'
    };
  }
  
  userData[index].updateTime = moment().format('YYYY-MM-DD HH:mm:ss');
  
  return {
    success: true,
    message: '密码重置成功'
  };
};

// 切换用户状态
export const toggleUserStatus = async (id) => {
  await delay(300);
  
  const index = userData.findIndex(item => item.id === parseInt(id));
  if (index === -1) {
    return {
      success: false,
      message: '用户不存在'
    };
  }
  
  // 不能禁用管理员账号
  if (userData[index].username === 'admin' && userData[index].status === 'active') {
    return {
      success: false,
      message: '不能禁用管理员账号'
    };
  }
  
  userData[index].status = userData[index].status === 'active' ? 'inactive' : 'active';
  userData[index].updateTime = moment().format('YYYY-MM-DD HH:mm:ss');
  
  return {
    success: true,
    data: userData[index],
    message: `用户${userData[index].status === 'active' ? '启用' : '禁用'}成功`
  };
};

// 获取用户统计信息
export const getUserStatistics = async () => {
  await delay(200);
  
  const total = userData.length;
  const active = userData.filter(user => user.status === 'active').length;
  const inactive = userData.filter(user => user.status === 'inactive').length;
  
  // 按部门统计
  const departmentStats = departments.map(dept => ({
    department: dept.value,
    count: userData.filter(user => user.department === dept.value).length
  }));
  
  return {
    success: true,
    data: {
      total,
      active,
      inactive,
      departmentStats
    }
  };
};
