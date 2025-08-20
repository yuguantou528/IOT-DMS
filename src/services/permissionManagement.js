// 权限管理服务
import moment from 'moment';

// 模拟权限数据（树形结构）
let permissionData = [
  {
    id: 1,
    permissionName: '系统管理',
    permissionCode: 'system',
    parentId: 0,
    type: 'menu',
    path: '/system',
    icon: 'SettingOutlined',
    sort: 1,
    status: 'active',
    description: '系统管理模块',
    createTime: '2024-01-15 10:00:00',
    children: [
      {
        id: 13,
        permissionName: '用户管理',
        permissionCode: 'system:user',
        parentId: 1,
        type: 'menu',
        path: '/system/users',
        icon: 'UserOutlined',
        sort: 1,
        status: 'active',
        description: '用户管理页面',
        createTime: '2024-01-15 10:00:00'
      },
      {
        id: 14,
        permissionName: '角色管理',
        permissionCode: 'system:role',
        parentId: 1,
        type: 'menu',
        path: '/system/roles',
        icon: 'TeamOutlined',
        sort: 2,
        status: 'active',
        description: '角色管理页面',
        createTime: '2024-01-15 10:00:00'
      },
      {
        id: 15,
        permissionName: '权限管理',
        permissionCode: 'system:permission',
        parentId: 1,
        type: 'menu',
        path: '/system/permissions',
        icon: 'SafetyOutlined',
        sort: 3,
        status: 'active',
        description: '权限管理页面',
        createTime: '2024-01-15 10:00:00'
      }
    ]
  },
  {
    id: 2,
    permissionName: '设备管理',
    permissionCode: 'device',
    parentId: 0,
    type: 'menu',
    path: '/device',
    icon: 'AppstoreOutlined',
    sort: 2,
    status: 'active',
    description: '设备管理模块',
    createTime: '2024-01-15 10:00:00',
    children: [
      {
        id: 3,
        permissionName: '设备厂商',
        permissionCode: 'device:manufacturer',
        parentId: 2,
        type: 'menu',
        path: '/device/manufacturer',
        icon: 'ShopOutlined',
        sort: 1,
        status: 'active',
        description: '设备厂商管理',
        createTime: '2024-01-15 10:00:00'
      },
      {
        id: 4,
        permissionName: '设备型号',
        permissionCode: 'device:model',
        parentId: 2,
        type: 'menu',
        path: '/device/model',
        icon: 'TagsOutlined',
        sort: 2,
        status: 'active',
        description: '设备型号管理',
        createTime: '2024-01-15 10:00:00'
      },
      {
        id: 5,
        permissionName: '设备管理',
        permissionCode: 'device:management',
        parentId: 2,
        type: 'menu',
        path: '/device/management',
        icon: 'SettingOutlined',
        sort: 3,
        status: 'active',
        description: '设备管理',
        createTime: '2024-01-15 10:00:00'
      },
      {
        id: 6,
        permissionName: '设备模板',
        permissionCode: 'device:product',
        parentId: 2,
        type: 'menu',
        path: '/device/product',
        icon: 'AppstoreOutlined',
        sort: 4,
        status: 'active',
        description: '设备模板管理',
        createTime: '2024-01-15 10:00:00'
      },
      {
        id: 7,
        permissionName: '物模型',
        permissionCode: 'device:thing-model',
        parentId: 2,
        type: 'menu',
        path: '/device/thing-model',
        icon: 'SettingOutlined',
        sort: 5,
        status: 'active',
        description: '物模型管理',
        createTime: '2024-01-15 10:00:00'
      }
    ]
  },
  {
    id: 8,
    permissionName: '可视化监控',
    permissionCode: 'monitor',
    parentId: 0,
    type: 'menu',
    path: '/visual-monitor',
    icon: 'MonitorOutlined',
    sort: 3,
    status: 'active',
    description: '可视化监控大屏',
    createTime: '2024-01-15 10:00:00'
  },
  {
    id: 9,
    permissionName: '拓扑图管理',
    permissionCode: 'topology',
    parentId: 0,
    type: 'menu',
    path: '/topology',
    icon: 'NodeIndexOutlined',
    sort: 4,
    status: 'active',
    description: '拓扑图管理',
    createTime: '2024-01-15 10:00:00'
  },
  {
    id: 10,
    permissionName: '告警管理',
    permissionCode: 'alarm',
    parentId: 0,
    type: 'menu',
    path: '/alarm',
    icon: 'AlertOutlined',
    sort: 5,
    status: 'active',
    description: '告警管理模块',
    createTime: '2024-01-15 10:00:00',
    children: [
      {
        id: 11,
        permissionName: '告警消息',
        permissionCode: 'alarm:messages',
        parentId: 10,
        type: 'menu',
        path: '/alarm/messages',
        icon: 'AlertOutlined',
        sort: 1,
        status: 'active',
        description: '告警消息管理',
        createTime: '2024-01-15 10:00:00'
      },
      {
        id: 12,
        permissionName: '告警规则',
        permissionCode: 'alarm:rules',
        parentId: 10,
        type: 'menu',
        path: '/alarm/rules',
        icon: 'SettingOutlined',
        sort: 2,
        status: 'active',
        description: '告警规则配置',
        createTime: '2024-01-15 10:00:00'
      }
    ]
  }
];

// 权限类型选项
export const permissionTypes = [
  { value: 'menu', label: '菜单', color: 'blue' },
  { value: 'button', label: '按钮', color: 'green' },
  { value: 'api', label: 'API', color: 'orange' }
];

// 权限状态选项
export const permissionStatuses = [
  { value: 'active', label: '启用', color: 'green' },
  { value: 'inactive', label: '禁用', color: 'red' }
];

// 模拟延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 将树形数据扁平化
const flattenPermissions = (permissions, result = []) => {
  permissions.forEach(permission => {
    result.push(permission);
    if (permission.children && permission.children.length > 0) {
      flattenPermissions(permission.children, result);
    }
  });
  return result;
};

// 获取权限树形列表
export const getPermissionTree = async (params = {}) => {
  await delay(300);
  
  let filteredData = [...permissionData];
  
  // 搜索过滤（需要递归处理）
  if (params.search) {
    const searchText = params.search.toLowerCase();
    const filterTree = (nodes) => {
      return nodes.filter(node => {
        const matches = node.permissionName.toLowerCase().includes(searchText) ||
                       node.permissionCode.toLowerCase().includes(searchText);
        
        if (node.children) {
          node.children = filterTree(node.children);
          return matches || node.children.length > 0;
        }
        
        return matches;
      });
    };
    
    filteredData = filterTree(filteredData);
  }
  
  // 状态过滤
  if (params.status) {
    const filterByStatus = (nodes) => {
      return nodes.filter(node => {
        if (node.children) {
          node.children = filterByStatus(node.children);
        }
        return node.status === params.status;
      });
    };
    
    filteredData = filterByStatus(filteredData);
  }
  
  return {
    success: true,
    data: filteredData
  };
};

// 获取权限列表（扁平化）
export const getPermissionList = async (params = {}) => {
  await delay(300);
  
  const flatData = flattenPermissions(permissionData);
  let filteredData = [...flatData];
  
  // 搜索过滤
  if (params.search) {
    const searchText = params.search.toLowerCase();
    filteredData = filteredData.filter(permission => 
      permission.permissionName.toLowerCase().includes(searchText) ||
      permission.permissionCode.toLowerCase().includes(searchText) ||
      permission.description.toLowerCase().includes(searchText)
    );
  }
  
  // 状态过滤
  if (params.status) {
    filteredData = filteredData.filter(permission => permission.status === params.status);
  }
  
  // 类型过滤
  if (params.type) {
    filteredData = filteredData.filter(permission => permission.type === params.type);
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

// 获取权限选项（用于角色分配）
export const getPermissionOptions = async () => {
  await delay(100);
  
  const flatData = flattenPermissions(permissionData);
  const options = flatData
    .filter(permission => permission.status === 'active')
    .map(permission => ({
      value: permission.id,
      label: permission.permissionName,
      code: permission.permissionCode,
      type: permission.type,
      parentId: permission.parentId
    }));
  
  return {
    success: true,
    data: options
  };
};

// 获取权限详情
export const getPermissionDetail = async (id) => {
  await delay(200);
  
  const flatData = flattenPermissions(permissionData);
  const permission = flatData.find(item => item.id === parseInt(id));
  
  if (!permission) {
    return {
      success: false,
      message: '权限不存在'
    };
  }
  
  return {
    success: true,
    data: permission
  };
};

// 获取权限统计信息
export const getPermissionStatistics = async () => {
  await delay(200);
  
  const flatData = flattenPermissions(permissionData);
  const total = flatData.length;
  const active = flatData.filter(permission => permission.status === 'active').length;
  const inactive = flatData.filter(permission => permission.status === 'inactive').length;
  
  // 按类型统计
  const typeStats = permissionTypes.map(type => ({
    type: type.value,
    label: type.label,
    count: flatData.filter(permission => permission.type === type.value).length
  }));
  
  return {
    success: true,
    data: {
      total,
      active,
      inactive,
      typeStats
    }
  };
};
