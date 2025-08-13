// 设备厂商API服务

// 模拟数据
let manufacturerData = [
  {
    id: 1,
    name: '华为技术有限公司',
    code: 'HUAWEI',
    contact: '张三',
    phone: '13800138001',
    email: 'zhangsan@huawei.com',
    address: '深圳市龙岗区坂田华为基地',
    status: 'active',
    description: '全球领先的ICT基础设施和智能终端提供商',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-20 14:20:00'
  },
  {
    id: 2,
    name: '小米科技有限责任公司',
    code: 'XIAOMI',
    contact: '李四',
    phone: '13800138002',
    email: 'lisi@xiaomi.com',
    address: '北京市海淀区清河中街68号',
    status: 'active',
    description: '以手机、智能硬件和IoT平台为核心的互联网公司',
    createTime: '2024-01-16 09:15:00',
    updateTime: '2024-01-18 16:45:00'
  },
  {
    id: 3,
    name: '海康威视数字技术股份有限公司',
    code: 'HIKVISION',
    contact: '王五',
    phone: '13800138003',
    email: 'wangwu@hikvision.com',
    address: '杭州市滨江区阡陌路555号',
    status: 'inactive',
    description: '以视频为核心的智能物联网解决方案和大数据服务提供商',
    createTime: '2024-01-10 11:20:00',
    updateTime: '2024-01-12 13:30:00'
  },
  {
    id: 4,
    name: '大华技术股份有限公司',
    code: 'DAHUA',
    contact: '赵六',
    phone: '13800138004',
    email: 'zhaoliu@dahua.com',
    address: '杭州市滨江区滨安路1187号',
    status: 'active',
    description: '全球领先的以视频为核心的智慧物联解决方案提供商',
    createTime: '2024-01-12 14:30:00',
    updateTime: '2024-01-15 10:20:00'
  },
  {
    id: 5,
    name: '中兴通讯股份有限公司',
    code: 'ZTE',
    contact: '孙七',
    phone: '13800138005',
    email: 'sunqi@zte.com',
    address: '深圳市南山区高新技术产业园',
    status: 'active',
    description: '全球领先的综合通信解决方案提供商',
    createTime: '2024-01-08 16:45:00',
    updateTime: '2024-01-10 09:30:00'
  }
];

// 模拟API延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 获取厂商列表
export const getManufacturerList = async (params = {}) => {
  await delay(500);
  
  let filteredData = [...manufacturerData];
  
  // 按名称搜索
  if (params.name) {
    filteredData = filteredData.filter(item => 
      item.name.toLowerCase().includes(params.name.toLowerCase())
    );
  }
  
  // 按状态筛选
  if (params.status) {
    filteredData = filteredData.filter(item => item.status === params.status);
  }
  
  // 按日期范围筛选
  if (params.startDate && params.endDate) {
    filteredData = filteredData.filter(item => {
      const createTime = new Date(item.createTime);
      const startDate = new Date(params.startDate);
      const endDate = new Date(params.endDate);
      return createTime >= startDate && createTime <= endDate;
    });
  }
  
  // 分页
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    success: true,
    data: {
      list: filteredData.slice(startIndex, endIndex),
      total: filteredData.length,
      page,
      pageSize
    }
  };
};

// 获取厂商详情
export const getManufacturerDetail = async (id) => {
  await delay(300);
  
  const manufacturer = manufacturerData.find(item => item.id === parseInt(id));
  
  if (manufacturer) {
    return {
      success: true,
      data: manufacturer
    };
  } else {
    return {
      success: false,
      message: '厂商不存在'
    };
  }
};

// 创建厂商
export const createManufacturer = async (data) => {
  await delay(800);
  
  // 检查编码是否重复
  const existingCode = manufacturerData.find(item => item.code === data.code);
  if (existingCode) {
    return {
      success: false,
      message: '厂商编码已存在'
    };
  }
  
  // 检查名称是否重复
  const existingName = manufacturerData.find(item => item.name === data.name);
  if (existingName) {
    return {
      success: false,
      message: '厂商名称已存在'
    };
  }
  
  const newManufacturer = {
    id: Math.max(...manufacturerData.map(item => item.id)) + 1,
    ...data,
    createTime: new Date().toLocaleString('zh-CN'),
    updateTime: new Date().toLocaleString('zh-CN')
  };
  
  manufacturerData.push(newManufacturer);
  
  return {
    success: true,
    data: newManufacturer,
    message: '创建成功'
  };
};

// 更新厂商
export const updateManufacturer = async (id, data) => {
  await delay(800);
  
  const index = manufacturerData.findIndex(item => item.id === parseInt(id));
  
  if (index === -1) {
    return {
      success: false,
      message: '厂商不存在'
    };
  }
  
  // 检查编码是否重复（排除自己）
  const existingCode = manufacturerData.find(item => 
    item.code === data.code && item.id !== parseInt(id)
  );
  if (existingCode) {
    return {
      success: false,
      message: '厂商编码已存在'
    };
  }
  
  // 检查名称是否重复（排除自己）
  const existingName = manufacturerData.find(item => 
    item.name === data.name && item.id !== parseInt(id)
  );
  if (existingName) {
    return {
      success: false,
      message: '厂商名称已存在'
    };
  }
  
  manufacturerData[index] = {
    ...manufacturerData[index],
    ...data,
    updateTime: new Date().toLocaleString('zh-CN')
  };
  
  return {
    success: true,
    data: manufacturerData[index],
    message: '更新成功'
  };
};

// 删除厂商
export const deleteManufacturer = async (id) => {
  await delay(500);
  
  const index = manufacturerData.findIndex(item => item.id === parseInt(id));
  
  if (index === -1) {
    return {
      success: false,
      message: '厂商不存在'
    };
  }
  
  manufacturerData.splice(index, 1);
  
  return {
    success: true,
    message: '删除成功'
  };
};

// 批量删除厂商
export const batchDeleteManufacturer = async (ids) => {
  await delay(800);
  
  manufacturerData = manufacturerData.filter(item => !ids.includes(item.id));
  
  return {
    success: true,
    message: `成功删除 ${ids.length} 个厂商`
  };
};

// 导出厂商数据
export const exportManufacturerData = async (params = {}) => {
  await delay(1000);
  
  // 这里可以实现真实的导出逻辑
  // 返回下载链接或直接触发下载
  
  return {
    success: true,
    data: {
      downloadUrl: '/api/download/manufacturers.xlsx',
      filename: `厂商数据_${new Date().toISOString().split('T')[0]}.xlsx`
    },
    message: '导出成功'
  };
};
