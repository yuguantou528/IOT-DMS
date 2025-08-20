// 角色管理服务
import moment from 'moment';

// 模拟角色数据
let roleData = [
  {
    id: 1,
    roleName: '系统管理员',
    roleCode: 'admin',
    description: '系统管理员，拥有所有权限',
    permissionIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    status: 'active',
    userCount: 1,
    createTime: '2024-01-15 10:00:00',
    updateTime: '2024-01-15 10:00:00',
    sort: 1
  },
  {
    id: 2,
    roleName: '设备运维',
    roleCode: 'device_operator',
    description: '设备运维人员，负责设备管理和维护',
    permissionIds: [2, 3, 4, 5, 6, 7],
    status: 'active',
    userCount: 1,
    createTime: '2024-01-16 09:00:00',
    updateTime: '2024-01-16 09:00:00',
    sort: 2
  },
  {
    id: 3,
    roleName: '监控调度',
    roleCode: 'monitor_dispatcher',
    description: '监控调度人员，负责实时监控和应急调度',
    permissionIds: [8, 9, 10, 11],
    status: 'active',
    userCount: 1,
    createTime: '2024-01-17 14:30:00',
    updateTime: '2024-01-17 14:30:00',
    sort: 3
  },
  {
    id: 4,
    roleName: '访客',
    roleCode: 'guest',
    description: '访客用户，只有基本查看权限',
    permissionIds: [8],
    status: 'active',
    userCount: 1,
    createTime: '2024-01-18 11:00:00',
    updateTime: '2024-01-18 11:00:00',
    sort: 4
  }
];

// 角色状态选项
export const roleStatuses = [
  { value: 'active', label: '启用', color: 'green' },
  { value: 'inactive', label: '禁用', color: 'red' }
];

// 模拟延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 获取角色列表
export const getRoleList = async (params = {}) => {
  await delay(300);
  
  let filteredData = [...roleData];
  
  // 搜索过滤
  if (params.search) {
    const searchText = params.search.toLowerCase();
    filteredData = filteredData.filter(role => 
      role.roleName.toLowerCase().includes(searchText) ||
      role.roleCode.toLowerCase().includes(searchText) ||
      role.description.toLowerCase().includes(searchText)
    );
  }
  
  // 状态过滤
  if (params.status) {
    filteredData = filteredData.filter(role => role.status === params.status);
  }
  
  // 按排序字段排序
  filteredData.sort((a, b) => a.sort - b.sort);
  
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

// 获取所有角色选项（用于用户管理）
export const getRoleOptions = async () => {
  await delay(100);
  
  const options = roleData
    .filter(role => role.status === 'active')
    .map(role => ({
      value: role.id,
      label: role.roleName,
      code: role.roleCode
    }));
  
  return {
    success: true,
    data: options
  };
};

// 获取角色详情
export const getRoleDetail = async (id) => {
  await delay(200);
  
  const role = roleData.find(item => item.id === parseInt(id));
  if (!role) {
    return {
      success: false,
      message: '角色不存在'
    };
  }
  
  return {
    success: true,
    data: role
  };
};

// 创建角色
export const createRole = async (data) => {
  await delay(800);
  
  // 检查角色名称是否重复
  const existingName = roleData.find(item => item.roleName === data.roleName);
  if (existingName) {
    return {
      success: false,
      message: '角色名称已存在'
    };
  }
  
  // 检查角色编码是否重复
  const existingCode = roleData.find(item => item.roleCode === data.roleCode);
  if (existingCode) {
    return {
      success: false,
      message: '角色编码已存在'
    };
  }
  
  const newRole = {
    id: Math.max(...roleData.map(item => item.id)) + 1,
    ...data,
    userCount: 0,
    createTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    updateTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    sort: roleData.length + 1
  };
  
  roleData.push(newRole);
  
  return {
    success: true,
    data: newRole,
    message: '角色创建成功'
  };
};

// 更新角色
export const updateRole = async (id, data) => {
  await delay(600);
  
  const index = roleData.findIndex(item => item.id === parseInt(id));
  if (index === -1) {
    return {
      success: false,
      message: '角色不存在'
    };
  }
  
  // 检查角色名称是否重复（排除自己）
  const existingName = roleData.find(item => 
    item.roleName === data.roleName && item.id !== parseInt(id)
  );
  if (existingName) {
    return {
      success: false,
      message: '角色名称已存在'
    };
  }
  
  // 检查角色编码是否重复（排除自己）
  const existingCode = roleData.find(item => 
    item.roleCode === data.roleCode && item.id !== parseInt(id)
  );
  if (existingCode) {
    return {
      success: false,
      message: '角色编码已存在'
    };
  }
  
  roleData[index] = {
    ...roleData[index],
    ...data,
    updateTime: moment().format('YYYY-MM-DD HH:mm:ss')
  };
  
  return {
    success: true,
    data: roleData[index],
    message: '角色更新成功'
  };
};

// 删除角色
export const deleteRole = async (id) => {
  await delay(500);
  
  const index = roleData.findIndex(item => item.id === parseInt(id));
  if (index === -1) {
    return {
      success: false,
      message: '角色不存在'
    };
  }
  
  // 不能删除系统管理员角色
  if (roleData[index].roleCode === 'admin') {
    return {
      success: false,
      message: '不能删除系统管理员角色'
    };
  }
  
  // 检查是否有用户使用该角色
  if (roleData[index].userCount > 0) {
    return {
      success: false,
      message: '该角色下还有用户，不能删除'
    };
  }
  
  roleData.splice(index, 1);
  
  return {
    success: true,
    message: '角色删除成功'
  };
};

// 切换角色状态
export const toggleRoleStatus = async (id) => {
  await delay(300);
  
  const index = roleData.findIndex(item => item.id === parseInt(id));
  if (index === -1) {
    return {
      success: false,
      message: '角色不存在'
    };
  }
  
  // 不能禁用系统管理员角色
  if (roleData[index].roleCode === 'admin' && roleData[index].status === 'active') {
    return {
      success: false,
      message: '不能禁用系统管理员角色'
    };
  }
  
  roleData[index].status = roleData[index].status === 'active' ? 'inactive' : 'active';
  roleData[index].updateTime = moment().format('YYYY-MM-DD HH:mm:ss');
  
  return {
    success: true,
    data: roleData[index],
    message: `角色${roleData[index].status === 'active' ? '启用' : '禁用'}成功`
  };
};

// 分配权限
export const assignPermissions = async (roleId, permissionIds) => {
  await delay(500);
  
  const index = roleData.findIndex(item => item.id === parseInt(roleId));
  if (index === -1) {
    return {
      success: false,
      message: '角色不存在'
    };
  }
  
  roleData[index].permissionIds = permissionIds;
  roleData[index].updateTime = moment().format('YYYY-MM-DD HH:mm:ss');
  
  return {
    success: true,
    data: roleData[index],
    message: '权限分配成功'
  };
};

// 获取角色统计信息
export const getRoleStatistics = async () => {
  await delay(200);
  
  const total = roleData.length;
  const active = roleData.filter(role => role.status === 'active').length;
  const inactive = roleData.filter(role => role.status === 'inactive').length;
  const totalUsers = roleData.reduce((sum, role) => sum + role.userCount, 0);
  
  return {
    success: true,
    data: {
      total,
      active,
      inactive,
      totalUsers
    }
  };
};
