import React, { useEffect, useMemo, useState } from 'react';
import { Polyline, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import './DeviceTrack.css';

// 计算两个经纬度点之间的距离（使用Haversine公式）
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // 地球半径（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // 距离（公里）
};

// 计算轨迹总距离
const calculateTotalDistance = (trackData) => {
  if (!trackData || trackData.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 1; i < trackData.length; i++) {
    const prev = trackData[i - 1];
    const curr = trackData[i];

    if (prev.position && curr.position &&
        prev.position.length >= 2 && curr.position.length >= 2) {
      const distance = calculateDistance(
        prev.position[0], prev.position[1], // 前一点的纬度、经度
        curr.position[0], curr.position[1]  // 当前点的纬度、经度
      );
      totalDistance += distance;
    }
  }

  return totalDistance;
};

// 计算平均速度
const calculateAverageSpeed = (trackData) => {
  if (!trackData || trackData.length === 0) return 0;

  // 方法1：如果轨迹点有speed字段，计算平均值
  const speedValues = trackData.filter(point => point.speed && point.speed > 0);
  if (speedValues.length > 0) {
    const totalSpeed = speedValues.reduce((sum, point) => sum + point.speed, 0);
    return totalSpeed / speedValues.length;
  }

  // 方法2：基于总距离和总时长计算
  if (trackData.length >= 2) {
    const totalDistance = calculateTotalDistance(trackData);
    const startTime = new Date(trackData[0].timestamp).getTime();
    const endTime = new Date(trackData[trackData.length - 1].timestamp).getTime();
    const totalTimeHours = (endTime - startTime) / (1000 * 60 * 60); // 转换为小时

    if (totalTimeHours > 0) {
      return totalDistance / totalTimeHours;
    }
  }

  return 0;
};

// 生成模拟轨迹数据
const generateTrackData = (device) => {
  try {
    if (!device || !device.position || device.position.length < 2) {
      return [];
    }

    const basePosition = device.position;
    const trackPoints = [];
    const now = new Date();

  // 生成模拟轨迹点（每10分钟一个点，共12个点，约2小时的数据）
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
  
    return trackPoints;
  } catch (error) {
    return [];
  }
};

const DeviceTrack = ({
  device,
  visible = true,
  trackData: externalTrackData,
  playbackState = null, // 播放状态：{ isPlaying, currentIndex, progress, playSpeed }
  currentPlaybackPoint = null // 当前播放点信息
}) => {
  // 使用外部传入的轨迹数据，如果没有则生成模拟数据
  const trackData = useMemo(() => {
    if (!visible || !device) {
      return [];
    }

    try {
      if (externalTrackData && externalTrackData.length > 0) {
        // 使用外部传入的轨迹数据，转换格式
        const convertedData = externalTrackData.map(point => ({
          position: [point.position[1], point.position[0]], // 转换为 [纬度, 经度]
          timestamp: new Date(point.timestamp),
          speed: point.speed || 0,
          status: 'normal'
        }));
        return convertedData;
      } else {
        // 使用模拟数据
        const data = generateTrackData(device);
        return data;
      }
    } catch (error) {
      return [];
    }
  }, [visible, device?.id, device?.position, externalTrackData]);

  // 轨迹线的位置数组
  const positions = useMemo(() => trackData.map(point => point.position), [trackData]);

  // 根据设备状态确定轨迹颜色
  const getTrackColor = useMemo(() => {
    if (!device) return '#faad14';
    if (device.status === 'online') return '#52c41a';
    if (device.alarmCount > 0) return '#ff4d4f';
    return '#faad14';
  }, [device?.status, device?.alarmCount]);

  // 轨迹样式
  const pathOptions = useMemo(() => ({
    color: getTrackColor,
    weight: 4,
    opacity: 0.9,
    dashArray: device?.status === 'offline' ? '8, 4' : null,
    lineCap: 'round',
    lineJoin: 'round'
  }), [getTrackColor, device?.status]);

  // 计算轨迹统计信息
  const trackStats = useMemo(() => {
    const totalDistance = calculateTotalDistance(trackData);
    const averageSpeed = calculateAverageSpeed(trackData);

    return {
      totalDistance: totalDistance.toFixed(1),
      averageSpeed: averageSpeed.toFixed(1)
    };
  }, [trackData]);

  // 如果不应该显示轨迹，返回null
  if (!visible || !device || !trackData || trackData.length === 0) {
    return null;
  }

  return (
    <>
      {/* 轨迹线 - 只有在有至少2个点时才显示 */}
      {trackData.length >= 2 && (
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
              <div><strong>时间范围:</strong> {
                trackData.length > 1 ?
                  `${new Date(trackData[0].timestamp).toLocaleString('zh-CN')} 至 ${new Date(trackData[trackData.length - 1].timestamp).toLocaleString('zh-CN')}` :
                  trackData.length === 1 ?
                    new Date(trackData[0].timestamp).toLocaleString('zh-CN') :
                    '无数据'
              }</div>
              <div><strong>总距离:</strong> {trackStats.totalDistance} km</div>
              <div><strong>平均速度:</strong> {trackStats.averageSpeed} km/h</div>
            </div>
          </div>
        </Popup>
      </Polyline>
      )}

      {/* 所有轨迹点标记 */}
      {trackData.length > 0 && trackData.map((point, index) => {
        const isStartPoint = index === 0;
        const isEndPoint = index === trackData.length - 1;
        const isMiddlePoint = !isStartPoint && !isEndPoint;
        const isCurrentPlaybackPoint = playbackState && playbackState.currentIndex === index;

        // 根据点的类型确定样式
        let pointStyle;
        let pointLabel;
        let pointRadius;

        if (isCurrentPlaybackPoint) {
          // 当前播放点 - 高亮显示
          pointStyle = {
            color: '#faad14',
            fillColor: '#faad14',
            fillOpacity: 1,
            weight: 3
          };
          pointLabel = `当前播放点 (${index + 1})`;
          pointRadius = 8;
        } else if (isStartPoint) {
          pointStyle = {
            color: '#52c41a',
            fillColor: '#52c41a',
            fillOpacity: 0.8,
            weight: 2
          };
          pointLabel = '轨迹起点';
          pointRadius = 6;
        } else if (isEndPoint) {
          pointStyle = {
            color: '#ff4d4f',
            fillColor: '#ff4d4f',
            fillOpacity: 0.8,
            weight: 2
          };
          pointLabel = '轨迹终点';
          pointRadius = 6;
        } else {
          pointStyle = {
            color: '#1890ff',
            fillColor: '#1890ff',
            fillOpacity: 0.6,
            weight: 1.5
          };
          pointLabel = `轨迹点 ${index + 1}`;
          pointRadius = 4;
        }

        return (
          <CircleMarker
            key={`track-point-${index}`}
            center={point.position}
            radius={pointRadius}
            pathOptions={pointStyle}
          >
            <Popup>
              <div style={{ textAlign: 'center', minWidth: '150px' }}>
                <strong>{pointLabel}</strong><br/>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>
                  <div>时间: {point.timestamp.toLocaleString()}</div>
                  {point.speed && <div>速度: {point.speed.toFixed(1)} km/h</div>}
                  {point.status && <div>状态: {point.status === 'normal' ? '正常' : '告警'}</div>}
                  {isCurrentPlaybackPoint && (
                    <div style={{ color: '#faad14', fontWeight: 'bold', marginTop: '4px' }}>
                      正在播放...
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      {/* 播放过程中的移动图标 */}
      {playbackState && playbackState.isPlaying && currentPlaybackPoint && (
        <CircleMarker
          center={currentPlaybackPoint.position}
          radius={10}
          pathOptions={{
            color: '#faad14',
            fillColor: '#faad14',
            fillOpacity: 0.9,
            weight: 3,
            className: 'playback-moving-point'
          }}
        >
          <Popup>
            <div style={{ textAlign: 'center', minWidth: '150px' }}>
              <strong>播放中</strong><br/>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>
                <div>时间: {new Date(currentPlaybackPoint.timestamp).toLocaleString()}</div>
                {currentPlaybackPoint.speed && (
                  <div>速度: {currentPlaybackPoint.speed.toFixed(1)} km/h</div>
                )}
                <div style={{ color: '#faad14', fontWeight: 'bold', marginTop: '4px' }}>
                  播放速度: {playbackState.playSpeed}x
                </div>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      )}
    </>
  );
};

export default DeviceTrack; 