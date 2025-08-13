import React, { useEffect, useMemo } from 'react';
import { Polyline, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';

// 生成模拟轨迹数据
const generateTrackData = (device) => {
  try {
    if (!device || !device.position || device.position.length < 2) {
      console.warn('设备位置信息无效:', device);
      return [];
    }

    const basePosition = device.position;
    const trackPoints = [];
    const now = new Date();

  // 生成过去2小时的轨迹点（每10分钟一个点，共12个点）
  const trackLength = 12;
  for (let i = trackLength - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 10 * 60 * 1000); // 每10分钟一个点
    
    // 生成一个更明显的移动轨迹（螺旋或直线移动）
    const angle = (i / trackLength) * Math.PI * 2; // 螺旋角度
    const radius = 0.005 + (i / trackLength) * 0.003; // 螺旋半径递增
    
    const offsetLng = Math.cos(angle) * radius;
    const offsetLat = Math.sin(angle) * radius;
    
    trackPoints.push({
      position: [basePosition[1] + offsetLat, basePosition[0] + offsetLng], // 纬度，经度
      timestamp: time,
      speed: Math.random() * 30 + 20, // 20-50 km/h
      status: Math.random() > 0.15 ? 'normal' : 'alert'
    });
  }
  
  console.log(`生成设备 ${device.name} 的轨迹数据:`, trackPoints.length, '个点');

    return trackPoints;
  } catch (error) {
    console.error('生成轨迹数据时出错:', error, device);
    return [];
  }
};

const DeviceTrack = ({ device, visible = true }) => {
  console.log('DeviceTrack 渲染:', { device: device?.name, visible, hasPosition: !!device?.position });
  
  if (!visible || !device) {
    console.log('DeviceTrack 跳过:', { visible, hasDevice: !!device });
    return null;
  }

  // 使用useMemo缓存轨迹数据，避免重复计算
  const trackData = useMemo(() => {
    try {
      const data = generateTrackData(device);
      console.log(`设备 ${device.name} 轨迹数据生成:`, data.length, '个点');
      return data;
    } catch (error) {
      console.error('DeviceTrack: 生成轨迹数据失败:', error);
      return [];
    }
  }, [device?.id, device?.position]);
  
  if (!trackData || trackData.length < 2) {
    console.log(`设备 ${device.name} 轨迹数据不足:`, trackData?.length);
    return null;
  }

  // 轨迹线的位置数组
  const positions = useMemo(() => trackData.map(point => point.position), [trackData]);

  // 根据设备状态确定轨迹颜色
  const getTrackColor = () => {
    if (device.status === 'online') return '#52c41a';
    if (device.alarmCount > 0) return '#ff4d4f';
    return '#faad14';
  };

  // 轨迹样式
  const pathOptions = useMemo(() => ({
    color: getTrackColor(),
    weight: 4,
    opacity: 0.9,
    dashArray: device.status === 'offline' ? '8, 4' : null,
    lineCap: 'round',
    lineJoin: 'round'
  }), [device.status, device.alarmCount]);

  console.log(`渲染设备 ${device.name} 的轨迹:`, { positions: positions.length, pathOptions });

  return (
    <>
      {/* 轨迹线 */}
      <Polyline
        positions={positions}
        pathOptions={pathOptions}
      >
        <Popup>
          <div style={{ minWidth: '200px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#1890ff' }}>
              {device.name} - 轨迹信息
            </h4>
            <div style={{ fontSize: '12px', lineHeight: '1.5' }}>
              <div><strong>轨迹点数:</strong> {trackData.length}</div>
              <div><strong>时间范围:</strong> 过去2小时</div>
              <div><strong>总距离:</strong> 约 {(Math.random() * 50 + 10).toFixed(1)} km</div>
              <div><strong>平均速度:</strong> {Math.round(trackData.reduce((sum, p) => sum + p.speed, 0) / trackData.length)} km/h</div>
              <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
                💡 这是模拟轨迹数据，实际应用中应从后端获取真实轨迹
              </div>
            </div>
          </div>
        </Popup>
      </Polyline>

      {/* 轨迹起点和终点标记 */}
      {trackData.length > 0 && (
        <>
          {/* 起点 */}
          <CircleMarker
            center={trackData[0].position}
            radius={6}
            pathOptions={{
              color: '#52c41a',
              fillColor: '#52c41a',
              fillOpacity: 0.8,
              weight: 2
            }}
          >
            <Popup>
              <div style={{ textAlign: 'center' }}>
                <strong>轨迹起点</strong><br/>
                {trackData[0].timestamp.toLocaleString()}
              </div>
            </Popup>
          </CircleMarker>
          
          {/* 终点 */}
          <CircleMarker
            center={trackData[trackData.length - 1].position}
            radius={6}
            pathOptions={{
              color: '#ff4d4f',
              fillColor: '#ff4d4f',
              fillOpacity: 0.8,
              weight: 2
            }}
          >
            <Popup>
              <div style={{ textAlign: 'center' }}>
                <strong>轨迹终点</strong><br/>
                {trackData[trackData.length - 1].timestamp.toLocaleString()}
              </div>
            </Popup>
          </CircleMarker>
        </>
      )}
    </>
  );
};

export default DeviceTrack; 