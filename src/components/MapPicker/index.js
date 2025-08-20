import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Input, Row, Col, message, Space } from 'antd';
import { EnvironmentOutlined, AimOutlined, GlobalOutlined } from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './index.module.css';

// 修复Leaflet默认图标问题
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// 地图点击事件处理组件
const MapClickHandler = ({ onPositionChange }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onPositionChange({ latitude: lat, longitude: lng });
    }
  });
  return null;
};

// 地图中心控制组件
const MapCenterController = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView([center.latitude, center.longitude], map.getZoom());
    }
  }, [map, center]);

  return null;
};

const MapPicker = ({
  visible,
  onCancel,
  onConfirm,
  initialPosition = { longitude: 110.3500, latitude: 29.2500 } // 改为张家界坐标
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [tempPosition, setTempPosition] = useState(initialPosition);
  const [mapKey, setMapKey] = useState(0);
  const [currentTileSource, setCurrentTileSource] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [networkError, setNetworkError] = useState(false);
  const [shouldRenderMap, setShouldRenderMap] = useState(false);

  // 多个地图瓦片源，提供备用选项
  const tileSources = [
    {
      url: "https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
      attribution: '&copy; 高德地图',
      name: '高德地图'
    },
    {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      name: 'OpenStreetMap'
    },
    {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
      attribution: '&copy; Esri',
      name: 'Esri地图'
    }
  ];

  // 当弹窗打开时，重置临时位置
  useEffect(() => {
    if (visible) {
      setTempPosition(position);
      setMapKey(prev => prev + 1); // 强制重新渲染地图
      setShouldRenderMap(false);

      // 延迟渲染地图，确保弹窗完全打开
      const timer = setTimeout(() => {
        setShouldRenderMap(true);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setShouldRenderMap(false);
    }
  }, [visible, position]);

  // 当地图实例创建后，强制调整尺寸
  useEffect(() => {
    if (mapInstance && shouldRenderMap) {
      // 立即调整
      mapInstance.invalidateSize();

      // 多次延迟执行，确保地图正确渲染
      const timers = [
        setTimeout(() => mapInstance.invalidateSize(), 50),
        setTimeout(() => mapInstance.invalidateSize(), 200),
        setTimeout(() => mapInstance.invalidateSize(), 500),
        setTimeout(() => mapInstance.invalidateSize(), 1000)
      ];

      return () => timers.forEach(timer => clearTimeout(timer));
    }
  }, [mapInstance, shouldRenderMap]);

  // 处理地图点击位置变化
  const handlePositionChange = (newPosition) => {
    setTempPosition(newPosition);
  };

  // 手动输入坐标
  const handleCoordinateChange = (field, value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      const newPosition = { ...tempPosition, [field]: numValue };
      setTempPosition(newPosition);
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
      afterOpenChange={(open) => {
        if (open && mapInstance) {
          // 弹窗打开后，延迟重新计算地图尺寸
          setTimeout(() => {
            mapInstance.invalidateSize();
          }, 100);
          setTimeout(() => {
            mapInstance.invalidateSize();
          }, 300);
        }
      }}
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
          {/* 地图源切换按钮 */}
          <div className={styles.mapControls}>
            <Button
              size="small"
              icon={<GlobalOutlined />}
              onClick={() => {
                const nextSource = (currentTileSource + 1) % tileSources.length;
                setCurrentTileSource(nextSource);
                setNetworkError(false);
                setMapLoaded(false);
                message.info(`切换到${tileSources[nextSource].name}`);
              }}
              title={`当前: ${tileSources[currentTileSource].name}，点击切换`}
            >
              {tileSources[currentTileSource].name}
            </Button>
          </div>
          {(!shouldRenderMap || (!mapLoaded && !networkError)) && (
            <div className={styles.mapLoading}>
              <div className={styles.loadingSpinner}></div>
              <p>{!shouldRenderMap ? '准备地图中...' : `正在加载${tileSources[currentTileSource].name}...`}</p>
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#8c8c8c' }}>
                {!shouldRenderMap ? '请稍候' : '如果加载时间过长，请稍后重试'}
              </div>
            </div>
          )}

          {networkError && (
            <div className={styles.mapLoading}>
              <div style={{ color: '#ff4d4f', fontSize: '16px', marginBottom: '8px' }}>⚠️</div>
              <p style={{ color: '#ff4d4f' }}>地图加载失败</p>
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#8c8c8c', marginBottom: '16px' }}>
                请检查网络连接或稍后重试
              </div>
              <Button
                type="primary"
                icon={<GlobalOutlined />}
                onClick={() => {
                  setNetworkError(false);
                  setMapLoaded(false);
                  setCurrentTileSource(0);
                }}
              >
                重新加载地图
              </Button>
            </div>
          )}
          {shouldRenderMap && (
            <MapContainer
            key={mapKey}
            center={[tempPosition.latitude, tempPosition.longitude]}
            zoom={15}
            style={{ height: '450px', width: '100%' }}
            className={styles.map}
            whenCreated={(mapInstance) => {
              // 保存地图实例引用
              setMapInstance(mapInstance);

              // 监听地图加载完成事件
              mapInstance.on('load', () => {
                setMapLoaded(true);
              });

              // 设置超时，防止一直加载
              setTimeout(() => {
                setMapLoaded(true);
              }, 3000);

              // 延迟调整地图尺寸，确保容器已经渲染完成
              setTimeout(() => {
                mapInstance.invalidateSize();
              }, 200);
            }}
          >
            <TileLayer
              key={currentTileSource}
              url={tileSources[currentTileSource].url}
              attribution={tileSources[currentTileSource].attribution}
              errorTileUrl="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
              maxZoom={18}
              minZoom={1}
              eventHandlers={{
                loading: () => setMapLoaded(false),
                load: () => setMapLoaded(true),
                tileerror: () => {
                  // 如果当前瓦片源加载失败，尝试下一个
                  if (currentTileSource < tileSources.length - 1) {
                    console.log('地图瓦片加载失败，尝试备用源...');
                    setCurrentTileSource(prev => prev + 1);
                    setNetworkError(false);
                  } else {
                    setNetworkError(true);
                    setMapLoaded(true); // 停止加载指示器
                  }
                }
              }}
            />

            {/* 地图点击事件处理 */}
            <MapClickHandler onPositionChange={handlePositionChange} />

            {/* 地图中心控制 */}
            <MapCenterController center={tempPosition} />

            {/* 位置标记 */}
            <Marker
              position={[tempPosition.latitude, tempPosition.longitude]}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const { lat, lng } = e.target.getLatLng();
                  handlePositionChange({ latitude: lat, longitude: lng });
                }
              }}
            />
          </MapContainer>
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
