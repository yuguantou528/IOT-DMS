import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DeviceTrack from './DeviceTrack';
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
      base_station: '📶'
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

// 地图控制组件
const MapController = ({ mapType, devices, onDeviceClick }) => {
  const map = useMap();

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
  center = [39.9042, 116.4074], // 北京坐标
  zoom = 10,
  height = '100%',
  className = '',
  showTracks = false,
  selectedDeviceId = null
}) => {
  const [mapInstance, setMapInstance] = useState(null);

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

  // 调试信息
  console.log('LeafletMap 渲染:', { 
    devices: devices.length, 
    mapType, 
    center, 
    zoom,
    showTracks,
    selectedDeviceId,
    devicesWithPosition: devices.filter(d => d.position && d.position.length >= 2).length
  });

  // 调试轨迹渲染条件
  if (showTracks) {
    console.log('轨迹渲染条件检查:', {
      showTracks,
      selectedDeviceId,
      devicesCount: devices.length,
      devicesWithPosition: devices.filter(d => d.position && d.position.length >= 2).map(d => ({ id: d.id, name: d.name, position: d.position }))
    });
  }

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
        />
        
        {/* 渲染设备轨迹 */}
        {showTracks && devices.map((device, index) => {
          // 如果指定了特定设备ID，只显示该设备的轨迹
          if (selectedDeviceId && device.id !== selectedDeviceId) {
            return null;
          }
          
          // 如果没有指定设备ID，显示所有设备的轨迹
          if (!device.position || device.position.length < 2) {
            return null;
          }

          return (
            <DeviceTrack
              key={`track-${device.id || index}`}
              device={device}
              visible={true}
            />
          );
        })}

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
    </div>
  );
};

export default LeafletMap; 