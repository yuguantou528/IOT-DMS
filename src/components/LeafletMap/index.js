import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DeviceTrack from './DeviceTrack';
import TrackPlayback from '../TrackPlayback';
import styles from './index.module.css';

// 修复Leaflet默认图标问题
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// 自定义设备图标
const createDeviceIcon = (device) => {
  const isOnline = device.status === 'online';
  const hasAlarm = device.alarmCount > 0;
  
  // 根据设备类型选择图标
  const getIconText = (type) => {
    const icons = {
      camera: '📹',
      radio: '📡',
      sensor: '🔧',
      base_station: '📶',
      body_camera: '📷'
    };
    return icons[type] || '📱';
  };

  // 创建自定义HTML图标
  const iconHtml = `
    <div class="${styles.deviceMarker} ${isOnline ? styles.onlineMarker : styles.offlineMarker}">
      <div class="${styles.markerIcon}">${getIconText(device.type)}</div>
      ${hasAlarm ? `<div class="${styles.markerAlarm}">${device.alarmCount}</div>` : ''}
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-device-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

// 地图比例尺和层级显示组件
const MapScaleAndZoom = ({ onScaleChange, onZoomChange }) => {
  const map = useMap();
  const [scale, setScale] = useState('');
  const [zoom, setZoom] = useState(map.getZoom());

  useEffect(() => {
    const updateScaleAndZoom = () => {
      const currentZoom = map.getZoom();
      setZoom(currentZoom);

      // 计算比例尺
      const center = map.getCenter();
      const bounds = map.getBounds();
      const distance = center.distanceTo(bounds.getNorthEast());

      // 根据距离计算合适的比例尺显示
      let scaleText = '';
      if (distance > 10000) {
        scaleText = `${Math.round(distance / 1000)}km`;
      } else if (distance > 1000) {
        scaleText = `${(distance / 1000).toFixed(1)}km`;
      } else {
        scaleText = `${Math.round(distance)}m`;
      }

      setScale(scaleText);

      // 回调通知父组件
      if (onScaleChange) onScaleChange(scaleText);
      if (onZoomChange) onZoomChange(currentZoom);
    };

    // 监听地图缩放和移动事件
    map.on('zoomend', updateScaleAndZoom);
    map.on('moveend', updateScaleAndZoom);

    // 初始化
    updateScaleAndZoom();

    return () => {
      map.off('zoomend', updateScaleAndZoom);
      map.off('moveend', updateScaleAndZoom);
    };
  }, [map, onScaleChange, onZoomChange]);

  return null; // 这个组件不渲染任何内容，只负责数据更新
};

// 地图控制组件
const MapController = ({ mapType, devices, onDeviceClick, mapCenter, mapZoom, trackData, isRealTimeTracking }) => {
  const map = useMap();
  const [hasSetInitialTrackingView, setHasSetInitialTrackingView] = useState(false);

  // 控制地图视图变化
  useEffect(() => {
    if (mapCenter && mapZoom) {
      if (isRealTimeTracking) {
        // 实时跟踪模式：只在第一次设置时执行
        if (!hasSetInitialTrackingView) {
          map.setView(mapCenter, mapZoom, {
            animate: true,
            duration: 1.5
          });
          setHasSetInitialTrackingView(true);
        }
      } else {
        // 非实时跟踪模式：正常执行
        map.setView(mapCenter, mapZoom, {
          animate: true,
          duration: 1.5
        });
      }
    }
  }, [map, mapCenter, mapZoom, isRealTimeTracking, hasSetInitialTrackingView]);

  // 重置实时跟踪视图标志
  useEffect(() => {
    if (!isRealTimeTracking) {
      setHasSetInitialTrackingView(false);
    }
  }, [isRealTimeTracking]);

  // 当轨迹数据变化时，自动调整地图视图以适应轨迹范围（仅限历史轨迹查询）
  useEffect(() => {
    // 只在非实时跟踪模式下才自动调整地图视图
    if (!isRealTimeTracking && trackData && trackData.length > 1) {
      try {
        // 创建轨迹点的边界
        const bounds = L.latLngBounds();
        trackData.forEach(point => {
          if (point.position && point.position.length >= 2) {
            // 轨迹数据格式：[经度, 纬度]，需要转换为 [纬度, 经度]
            bounds.extend([point.position[1], point.position[0]]);
          }
        });

        if (bounds.isValid()) {
          // 添加一些边距，确保轨迹完全可见
          map.fitBounds(bounds, {
            padding: [20, 20],
            animate: true,
            duration: 1.5
          });
        }
      } catch (error) {
        console.error('调整地图视图时出错:', error);
      }
    }
  }, [map, trackData, isRealTimeTracking]);

  useEffect(() => {
    // 根据地图类型切换图层
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileLayer;
    switch (mapType) {
      case 'satellite':
        // 卫星图层
        tileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        });
        break;
      case 'dark':
        // 暗色主题地图
        tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        });
        break;
      case 'tianditu':
        // 天地图
        tileLayer = L.tileLayer('http://t{s}.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=您的天地图密钥', {
          subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
          attribution: '&copy; 天地图'
        });
        break;
      default:
        // 默认OpenStreetMap
        tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });
    }

    tileLayer.addTo(map);
  }, [map, mapType]);

  // 自动调整地图视野以显示所有设备
  useEffect(() => {
    if (devices && devices.length > 0) {
      const bounds = L.latLngBounds();
      devices.forEach(device => {
        if (device.position && device.position.length >= 2) {
          bounds.extend([device.position[1], device.position[0]]); // 注意经纬度顺序
        }
      });
      
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [map, devices]);

  return null;
};

const LeafletMap = ({
  devices = [],
  onDeviceClick,
  mapType = 'normal',
  center = [29.2500, 110.3500], // 张家界国家森林公园坐标
  zoom = 12,
  height = '100%',
  className = '',
  showTracks = false,
  selectedDeviceId = null,
  trackData = [],
  mapCenter = null, // 动态地图中心点
  mapZoom = null, // 动态地图缩放级别
  showScaleAndZoom = true, // 是否显示比例尺和层级
  isRealTimeTracking = false, // 是否为实时轨迹跟踪
  enableTrackPlayback = false // 是否启用轨迹播放功能
}) => {
  const [currentScale, setCurrentScale] = useState('');
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [mapInstance, setMapInstance] = useState(null);

  // 轨迹播放状态
  const [playbackState, setPlaybackState] = useState(null);
  const [currentPlaybackPoint, setCurrentPlaybackPoint] = useState(null);

  // 处理设备点击事件
  const handleDeviceClick = (device) => {
    if (onDeviceClick) {
      onDeviceClick(device);
    }
  };

  // 获取设备状态文本
  const getDeviceStatusText = (device) => {
    const statusText = device.status === 'online' ? '在线' : '离线';
    const typeText = {
      camera: '摄像头',
      radio: '电台',
      sensor: '传感器',
      base_station: '基站'
    }[device.type] || '设备';

    return `${typeText} - ${statusText}`;
  };

  // 处理轨迹播放状态变化
  const handlePlaybackChange = (newPlaybackState) => {
    setPlaybackState(newPlaybackState);
  };

  // 处理当前播放点变化
  const handleCurrentPointChange = (point, index) => {
    setCurrentPlaybackPoint(point);
  };

  // 判断是否显示轨迹播放控制
  const shouldShowPlaybackControl = enableTrackPlayback &&
    !isRealTimeTracking &&
    trackData &&
    trackData.length > 1;



  return (
    <div className={`${styles.leafletMapContainer} ${className}`} style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className={styles.mapContainer}
        whenCreated={setMapInstance}
      >
        <MapController
          mapType={mapType}
          devices={devices}
          onDeviceClick={onDeviceClick}
          mapCenter={mapCenter}
          mapZoom={mapZoom}
          trackData={trackData}
          isRealTimeTracking={isRealTimeTracking}
        />

        {/* 比例尺和层级监控组件 */}
        {showScaleAndZoom && (
          <MapScaleAndZoom
            onScaleChange={setCurrentScale}
            onZoomChange={setCurrentZoom}
          />
        )}
        
        {/* 渲染设备轨迹 */}
        {showTracks && devices
          .filter((device) => {
            // 如果指定了特定设备ID，只显示该设备的轨迹
            if (selectedDeviceId && device.id !== selectedDeviceId) {
              return false;
            }

            // 如果没有指定设备ID，显示所有设备的轨迹
            if (!device.position || device.position.length < 2) {
              return false;
            }

            return true;
          })
          .map((device, index) => (
            <DeviceTrack
              key={`track-${device.id || index}`}
              device={device}
              visible={true}
              trackData={trackData}
              playbackState={playbackState}
              currentPlaybackPoint={currentPlaybackPoint}
            />
          ))}

        {/* 渲染设备标记 */}
        {devices.map((device, index) => {
          // 如果设备没有位置信息，使用默认位置或跳过
          if (!device.position || device.position.length < 2) {
            return null;
          }

          const position = [device.position[1], device.position[0]]; // 纬度，经度

          return (
            <Marker
              key={device.id || index}
              position={position}
              icon={createDeviceIcon(device)}
              eventHandlers={{
                click: () => handleDeviceClick(device)
              }}
            >
              <Popup className={styles.devicePopup}>
                <div className={styles.popupContent}>
                  <div className={styles.popupHeader}>
                    <span className={styles.popupTitle}>{device.name}</span>
                    <span className={`${styles.popupStatus} ${device.status === 'online' ? styles.online : styles.offline}`}>
                      {getDeviceStatusText(device)}
                    </span>
                  </div>
                  <div className={styles.popupInfo}>
                    <div className={styles.popupItem}>
                      <span className={styles.popupLabel}>设备ID:</span>
                      <span className={styles.popupValue}>{device.id}</span>
                    </div>
                    <div className={styles.popupItem}>
                      <span className={styles.popupLabel}>位置:</span>
                      <span className={styles.popupValue}>
                        {device.location || `${position[0].toFixed(4)}, ${position[1].toFixed(4)}`}
                      </span>
                    </div>
                    {device.alarmCount > 0 && (
                      <div className={styles.popupItem}>
                        <span className={styles.popupLabel}>告警:</span>
                        <span className={styles.popupValue} style={{ color: '#ff4d4f' }}>
                          {device.alarmCount} 条活跃告警
                        </span>
                      </div>
                    )}
                    {device.lastOnline && (
                      <div className={styles.popupItem}>
                        <span className={styles.popupLabel}>最后上线:</span>
                        <span className={styles.popupValue}>{device.lastOnline}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* 比例尺和层级显示 */}
      {showScaleAndZoom && (
        <div className={styles.mapScaleInfo}>
          <div className={styles.mapScale}>
            <div className={styles.scaleBar}>
              <div className={styles.scaleBarLine}></div>
              <div className={styles.scaleBarText}>{currentScale}</div>
            </div>
          </div>
          <div className={styles.mapZoomLevel}>
            缩放级别: {Math.round(currentZoom)}
          </div>
        </div>
      )}

      {/* 轨迹播放控制面板 */}
      {shouldShowPlaybackControl && (
        <TrackPlayback
          trackData={trackData}
          onPlaybackChange={handlePlaybackChange}
          onCurrentPointChange={handleCurrentPointChange}
          visible={true}
          className={styles.trackPlaybackControl}
        />
      )}
    </div>
  );
};

export default LeafletMap; 