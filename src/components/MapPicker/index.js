import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Input, Row, Col, message, Space } from 'antd';
import { EnvironmentOutlined, AimOutlined } from '@ant-design/icons';
import styles from './index.module.css';

const MapPicker = ({ 
  visible, 
  onCancel, 
  onConfirm, 
  initialPosition = { longitude: 116.397428, latitude: 39.90923 } 
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [tempPosition, setTempPosition] = useState(initialPosition);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // 初始化地图
  useEffect(() => {
    if (visible && mapRef.current && !mapInstanceRef.current) {
      // 这里使用高德地图作为示例，实际项目中可以根据需要选择其他地图服务
      // 注意：需要在 public/index.html 中引入高德地图 API
      if (window.AMap) {
        initMap();
      } else {
        // 如果地图API未加载，显示提示
        message.warning('地图服务未加载，请检查网络连接');
      }
    }
  }, [visible]);

  // 初始化地图实例
  const initMap = () => {
    const map = new window.AMap.Map(mapRef.current, {
      zoom: 15,
      center: [tempPosition.longitude, tempPosition.latitude],
      mapStyle: 'amap://styles/normal'
    });

    mapInstanceRef.current = map;

    // 添加标记
    const marker = new window.AMap.Marker({
      position: [tempPosition.longitude, tempPosition.latitude],
      icon: new window.AMap.Icon({
        size: new window.AMap.Size(25, 34),
        image: '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png',
        imageOffset: new window.AMap.Pixel(-9, -34)
      }),
      draggable: true
    });

    markerRef.current = marker;
    map.add(marker);

    // 地图点击事件
    map.on('click', (e) => {
      const { lng, lat } = e.lnglat;
      const newPosition = { longitude: lng, latitude: lat };
      setTempPosition(newPosition);
      marker.setPosition([lng, lat]);
    });

    // 标记拖拽事件
    marker.on('dragend', (e) => {
      const { lng, lat } = e.lnglat;
      const newPosition = { longitude: lng, latitude: lat };
      setTempPosition(newPosition);
    });
  };

  // 清理地图实例
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // 手动输入坐标
  const handleCoordinateChange = (field, value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      const newPosition = { ...tempPosition, [field]: numValue };
      setTempPosition(newPosition);
      
      // 更新地图中心和标记位置
      if (mapInstanceRef.current && markerRef.current) {
        const center = [newPosition.longitude, newPosition.latitude];
        mapInstanceRef.current.setCenter(center);
        markerRef.current.setPosition(center);
      }
    }
  };

  // 获取当前位置
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          const newPosition = { longitude, latitude };
          setTempPosition(newPosition);
          
          if (mapInstanceRef.current && markerRef.current) {
            const center = [longitude, latitude];
            mapInstanceRef.current.setCenter(center);
            markerRef.current.setPosition(center);
          }
          
          message.success('已获取当前位置');
        },
        (error) => {
          message.error('获取位置失败，请检查浏览器定位权限');
        }
      );
    } else {
      message.error('浏览器不支持定位功能');
    }
  };

  // 确认选择
  const handleConfirm = () => {
    setPosition(tempPosition);
    onConfirm(tempPosition);
  };

  // 取消选择
  const handleCancel = () => {
    setTempPosition(position);
    onCancel();
  };

  // 经纬度格式验证
  const validateLongitude = (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= -180 && num <= 180;
  };

  const validateLatitude = (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= -90 && num <= 90;
  };

  return (
    <Modal
      title="选择设备位置"
      open={visible}
      onCancel={handleCancel}
      onOk={handleConfirm}
      width={800}
      height={600}
      destroyOnClose
      className={styles.mapPickerModal}
    >
      <div className={styles.mapPickerContainer}>
        {/* 坐标输入区域 */}
        <div className={styles.coordinateInput}>
          <Row gutter={16} align="middle">
            <Col span={8}>
              <Space>
                <span>经度:</span>
                <Input
                  value={tempPosition.longitude.toFixed(6)}
                  onChange={(e) => handleCoordinateChange('longitude', e.target.value)}
                  placeholder="请输入经度"
                  style={{ width: 120 }}
                  status={!validateLongitude(tempPosition.longitude) ? 'error' : ''}
                />
              </Space>
            </Col>
            <Col span={8}>
              <Space>
                <span>纬度:</span>
                <Input
                  value={tempPosition.latitude.toFixed(6)}
                  onChange={(e) => handleCoordinateChange('latitude', e.target.value)}
                  placeholder="请输入纬度"
                  style={{ width: 120 }}
                  status={!validateLatitude(tempPosition.latitude) ? 'error' : ''}
                />
              </Space>
            </Col>
            <Col span={8}>
              <Button 
                type="primary" 
                icon={<AimOutlined />}
                onClick={getCurrentLocation}
              >
                获取当前位置
              </Button>
            </Col>
          </Row>
        </div>

        {/* 地图容器 */}
        <div className={styles.mapContainer}>
          <div ref={mapRef} className={styles.map}></div>
          {!window.AMap && (
            <div className={styles.mapPlaceholder}>
              <EnvironmentOutlined style={{ fontSize: 48, color: '#ccc' }} />
              <p>地图服务未加载</p>
              <p>请在 public/index.html 中引入地图API</p>
            </div>
          )}
        </div>

        {/* 操作提示 */}
        <div className={styles.mapTips}>
          <p>💡 操作提示：</p>
          <ul>
            <li>点击地图任意位置设置设备位置</li>
            <li>拖拽标记调整精确位置</li>
            <li>手动输入经纬度坐标</li>
            <li>点击"获取当前位置"使用GPS定位</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default MapPicker;
