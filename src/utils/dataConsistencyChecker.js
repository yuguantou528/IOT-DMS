// 数据一致性检查工具
import { getDeviceList } from '../services/deviceManagement';
import { getProductList } from '../services/productManagement';

/**
 * 检查设备与产品关联关系的数据一致性
 */
export const checkDeviceProductConsistency = async () => {
  try {
    console.log('🔍 开始检查设备与产品关联关系的数据一致性...');
    
    // 获取所有设备和产品数据
    const deviceResponse = await getDeviceList({ page: 1, pageSize: 1000 });
    const productResponse = await getProductList({ page: 1, pageSize: 1000 });
    
    if (!deviceResponse.success || !productResponse.success) {
      console.error('❌ 获取数据失败');
      return { success: false, message: '获取数据失败' };
    }
    
    const devices = deviceResponse.data.list;
    const products = productResponse.data.list;
    
    const issues = [];
    
    // 1. 检查设备关联的产品是否存在
    console.log('📋 检查设备关联的产品是否存在...');
    devices.forEach(device => {
      if (device.productId) {
        const product = products.find(p => p.id === device.productId);
        if (!product) {
          issues.push({
            type: 'DEVICE_PRODUCT_NOT_FOUND',
            message: `设备 "${device.name}" (ID: ${device.id}) 关联的产品 (ID: ${device.productId}) 不存在`,
            deviceId: device.id,
            deviceName: device.name,
            productId: device.productId
          });
        } else if (product.deviceType !== device.deviceType) {
          issues.push({
            type: 'DEVICE_PRODUCT_TYPE_MISMATCH',
            message: `设备 "${device.name}" (类型: ${device.deviceType}) 与关联产品 "${product.name}" (类型: ${product.deviceType}) 类型不匹配`,
            deviceId: device.id,
            deviceName: device.name,
            deviceType: device.deviceType,
            productId: product.id,
            productName: product.name,
            productType: product.deviceType
          });
        }
      }
    });
    
    // 2. 检查产品的关联设备列表是否与设备数据一致
    console.log('📋 检查产品的关联设备列表是否与设备数据一致...');
    products.forEach(product => {
      if (product.linkedDevices && product.linkedDevices.length > 0) {
        product.linkedDevices.forEach(linkedDevice => {
          const actualDevice = devices.find(d => d.id === linkedDevice.id);
          if (!actualDevice) {
            issues.push({
              type: 'PRODUCT_LINKED_DEVICE_NOT_FOUND',
              message: `产品 "${product.name}" (ID: ${product.id}) 关联的设备 (ID: ${linkedDevice.id}) 在设备列表中不存在`,
              productId: product.id,
              productName: product.name,
              linkedDeviceId: linkedDevice.id,
              linkedDeviceName: linkedDevice.name
            });
          } else if (actualDevice.productId !== product.id) {
            issues.push({
              type: 'PRODUCT_DEVICE_ASSOCIATION_MISMATCH',
              message: `产品 "${product.name}" (ID: ${product.id}) 关联了设备 "${actualDevice.name}" (ID: ${actualDevice.id})，但该设备的productId为 ${actualDevice.productId}`,
              productId: product.id,
              productName: product.name,
              deviceId: actualDevice.id,
              deviceName: actualDevice.name,
              deviceProductId: actualDevice.productId
            });
          }
        });
      }
    });
    
    // 3. 检查设备关联了产品但产品的关联设备列表中没有该设备
    console.log('📋 检查设备关联了产品但产品的关联设备列表中没有该设备...');
    devices.forEach(device => {
      if (device.productId) {
        const product = products.find(p => p.id === device.productId);
        if (product) {
          const isInLinkedDevices = product.linkedDevices && 
            product.linkedDevices.some(ld => ld.id === device.id);
          
          if (!isInLinkedDevices) {
            issues.push({
              type: 'DEVICE_NOT_IN_PRODUCT_LINKED_LIST',
              message: `设备 "${device.name}" (ID: ${device.id}) 关联了产品 "${product.name}" (ID: ${product.id})，但产品的关联设备列表中没有该设备`,
              deviceId: device.id,
              deviceName: device.name,
              productId: product.id,
              productName: product.name
            });
          }
        }
      }
    });
    
    // 输出检查结果
    if (issues.length === 0) {
      console.log('✅ 数据一致性检查通过，没有发现问题');
      return { success: true, message: '数据一致性检查通过', issues: [] };
    } else {
      console.log(`❌ 发现 ${issues.length} 个数据一致性问题:`);
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. [${issue.type}] ${issue.message}`);
      });
      return { success: false, message: `发现 ${issues.length} 个数据一致性问题`, issues };
    }
    
  } catch (error) {
    console.error('❌ 数据一致性检查失败:', error);
    return { success: false, message: '数据一致性检查失败', error };
  }
};

/**
 * 自动修复数据一致性问题
 */
export const autoFixDataConsistency = async () => {
  console.log('🔧 开始自动修复数据一致性问题...');

  const checkResult = await checkDeviceProductConsistency();
  if (checkResult.success) {
    console.log('✅ 没有发现需要修复的问题');
    return { success: true, message: '没有发现需要修复的问题' };
  }

  const { updateProductLinkedDevices } = await import('../services/productManagement');
  const { updateDevice } = await import('../services/deviceManagement');
  const fixedIssues = [];

  for (const issue of checkResult.issues) {
    try {
      if (issue.type === 'DEVICE_NOT_IN_PRODUCT_LINKED_LIST') {
        // 将设备添加到产品的关联设备列表中
        await updateProductLinkedDevices(issue.productId, {
          id: issue.deviceId,
          name: issue.deviceName
        }, 'add');

        fixedIssues.push(issue);
        console.log(`✅ 已修复: 将设备 "${issue.deviceName}" 添加到产品 "${issue.productName}" 的关联列表中`);
      } else if (issue.type === 'PRODUCT_DEVICE_ASSOCIATION_MISMATCH') {
        // 修复产品关联了设备但设备的productId不匹配的问题
        // 这种情况下，我们以产品的关联列表为准，更新设备的productId
        const deviceResponse = await getDeviceList({ page: 1, pageSize: 1000 });
        if (deviceResponse.success) {
          const device = deviceResponse.data.list.find(d => d.id === issue.deviceId);
          if (device) {
            await updateDevice(issue.deviceId, {
              ...device,
              productId: issue.productId,
              productName: issue.productName,
              productCode: issue.productCode || null
            });

            fixedIssues.push(issue);
            console.log(`✅ 已修复: 更新设备 "${issue.deviceName}" 的产品关联为 "${issue.productName}"`);
          }
        }
      }
    } catch (error) {
      console.error(`❌ 修复失败 [${issue.type}]:`, error);
    }
  }

  console.log(`🔧 自动修复完成，共修复 ${fixedIssues.length} 个问题`);
  return {
    success: true,
    message: `自动修复完成，共修复 ${fixedIssues.length} 个问题`,
    fixedIssues
  };
};

/**
 * 验证双向数据同步
 * 在产品或设备关联关系变更后调用此函数验证数据一致性
 */
export const verifyBidirectionalSync = async (deviceId, productId, action) => {
  console.log('🔍 验证双向数据同步:', { deviceId, productId, action });

  try {
    const { getDeviceList } = await import('../services/deviceManagement');
    const { getProductList } = await import('../services/productManagement');

    // 获取设备和产品数据
    const deviceResponse = await getDeviceList({ page: 1, pageSize: 1000 });
    const productResponse = await getProductList({ page: 1, pageSize: 1000 });

    if (!deviceResponse.success || !productResponse.success) {
      return { success: false, message: '获取数据失败' };
    }

    const device = deviceResponse.data.list.find(d => d.id === deviceId);
    const product = productResponse.data.list.find(p => p.id === productId);

    if (!device) {
      return { success: false, message: `设备 ID ${deviceId} 不存在` };
    }

    if (productId && !product) {
      return { success: false, message: `产品 ID ${productId} 不存在` };
    }

    const issues = [];

    if (action === 'associate') {
      // 验证关联操作
      if (device.productId !== productId) {
        issues.push(`设备的productId (${device.productId}) 与预期的产品ID (${productId}) 不匹配`);
      }

      if (product && !product.linkedDevices.some(ld => ld.id === deviceId)) {
        issues.push(`产品的关联设备列表中没有设备 ID ${deviceId}`);
      }
    } else if (action === 'disassociate') {
      // 验证取消关联操作
      if (device.productId !== null) {
        issues.push(`设备的productId应该为null，但实际为 ${device.productId}`);
      }

      if (product && product.linkedDevices.some(ld => ld.id === deviceId)) {
        issues.push(`产品的关联设备列表中仍然包含设备 ID ${deviceId}`);
      }
    }

    if (issues.length === 0) {
      console.log('✅ 双向数据同步验证通过');
      return { success: true, message: '双向数据同步验证通过' };
    } else {
      console.log('❌ 双向数据同步验证失败:', issues);
      return { success: false, message: '双向数据同步验证失败', issues };
    }

  } catch (error) {
    console.error('❌ 双向数据同步验证异常:', error);
    return { success: false, message: '双向数据同步验证异常', error };
  }
};

/**
 * 测试双向数据同步功能
 * 这个函数可以用来测试从产品侧移除设备关联后，设备侧是否正确更新
 */
export const testBidirectionalSync = async () => {
  console.log('🧪 开始测试双向数据同步功能...');

  try {
    const { getDeviceList } = await import('../services/deviceManagement');
    const { getProductList, updateProductLinkedDevices } = await import('../services/productManagement');

    // 获取测试数据
    const deviceResponse = await getDeviceList({ page: 1, pageSize: 1000 });
    const productResponse = await getProductList({ page: 1, pageSize: 1000 });

    if (!deviceResponse.success || !productResponse.success) {
      return { success: false, message: '获取测试数据失败' };
    }

    // 找到一个有关联设备的产品进行测试
    const testProduct = productResponse.data.list.find(p =>
      p.linkedDevices && p.linkedDevices.length > 0
    );

    if (!testProduct) {
      return { success: false, message: '没有找到有关联设备的产品进行测试' };
    }

    const testDevice = testProduct.linkedDevices[0];
    console.log('🧪 测试目标:', {
      productId: testProduct.id,
      productName: testProduct.name,
      deviceId: testDevice.id,
      deviceName: testDevice.name
    });

    // 1. 验证初始状态
    console.log('🔍 验证初始关联状态...');
    const initialCheck = await verifyBidirectionalSync(testDevice.id, testProduct.id, 'associate');
    if (!initialCheck.success) {
      console.log('⚠️ 初始状态存在问题:', initialCheck.issues);
      return {
        success: false,
        message: '初始状态验证失败',
        details: initialCheck.issues
      };
    }

    console.log('✅ 初始状态验证通过');

    // 2. 模拟从产品侧移除设备关联
    console.log('🔄 模拟从产品侧移除设备关联...');
    const removeResult = await updateProductLinkedDevices(testProduct.id, testDevice.id, 'remove');
    if (!removeResult.success) {
      return { success: false, message: '移除设备关联失败', error: removeResult.message };
    }

    // 3. 验证移除后的状态
    console.log('🔍 验证移除后的状态...');
    const afterRemoveCheck = await verifyBidirectionalSync(testDevice.id, null, 'disassociate');

    // 4. 恢复测试数据（重新关联）
    console.log('🔄 恢复测试数据...');
    await updateProductLinkedDevices(testProduct.id, testDevice, 'add');

    if (afterRemoveCheck.success) {
      console.log('✅ 双向数据同步测试通过');
      return {
        success: true,
        message: '双向数据同步测试通过',
        testDetails: {
          productId: testProduct.id,
          productName: testProduct.name,
          deviceId: testDevice.id,
          deviceName: testDevice.name
        }
      };
    } else {
      console.log('❌ 双向数据同步测试失败:', afterRemoveCheck.issues);
      return {
        success: false,
        message: '双向数据同步测试失败',
        issues: afterRemoveCheck.issues,
        testDetails: {
          productId: testProduct.id,
          productName: testProduct.name,
          deviceId: testDevice.id,
          deviceName: testDevice.name
        }
      };
    }

  } catch (error) {
    console.error('❌ 双向数据同步测试异常:', error);
    return { success: false, message: '双向数据同步测试异常', error };
  }
};

/**
 * 测试产品管理两个入口的数据同步一致性
 * 验证列表页面和详情页面的子设备管理功能是否都能正确进行双向数据同步
 */
export const testProductManagementConsistency = async () => {
  console.log('🧪 开始测试产品管理两个入口的数据同步一致性...');

  try {
    const { getDeviceList } = await import('../services/deviceManagement');
    const { getProductList } = await import('../services/productManagement');

    // 获取测试数据
    const deviceResponse = await getDeviceList({ page: 1, pageSize: 1000 });
    const productResponse = await getProductList({ page: 1, pageSize: 1000 });

    if (!deviceResponse.success || !productResponse.success) {
      return { success: false, message: '获取测试数据失败' };
    }

    // 找到一个有关联设备的产品进行测试
    const testProduct = productResponse.data.list.find(p =>
      p.linkedDevices && p.linkedDevices.length > 0
    );

    if (!testProduct) {
      return { success: false, message: '没有找到有关联设备的产品进行测试' };
    }

    const testDevice = testProduct.linkedDevices[0];
    console.log('🧪 测试目标:', {
      productId: testProduct.id,
      productName: testProduct.name,
      deviceId: testDevice.id,
      deviceName: testDevice.name
    });

    // 验证初始状态
    console.log('🔍 验证初始关联状态...');
    const initialCheck = await verifyBidirectionalSync(testDevice.id, testProduct.id, 'associate');
    if (!initialCheck.success) {
      return {
        success: false,
        message: '初始状态验证失败',
        details: initialCheck.issues
      };
    }

    console.log('✅ 产品管理两个入口的数据同步一致性测试准备完成');

    return {
      success: true,
      message: '产品管理两个入口的数据同步一致性测试准备完成',
      testDetails: {
        productId: testProduct.id,
        productName: testProduct.name,
        deviceId: testDevice.id,
        deviceName: testDevice.name,
        instructions: [
          '1. 在产品管理列表页面，点击该产品的"子设备管理"按钮',
          '2. 移除该设备的关联，保存后检查设备管理页面',
          '3. 重新关联该设备',
          '4. 进入产品详情页面，在"子设备管理"标签页中移除该设备的关联',
          '5. 检查设备管理页面是否正确显示"未关联"状态',
          '6. 两个入口的行为应该完全一致'
        ]
      }
    };

  } catch (error) {
    console.error('❌ 产品管理一致性测试异常:', error);
    return { success: false, message: '产品管理一致性测试异常', error };
  }
};
