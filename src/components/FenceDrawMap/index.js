import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Polygon, Circle, Polyline, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Button, Space, message, Tooltip, Spin } from 'antd';
import { UndoOutlined, ClearOutlined, CheckOutlined, EditOutlined, LoadingOutlined, GlobalOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
import 'leaflet/dist/leaflet.css';
import styles from './index.module.css';

// 修复Leaflet默认图标问题
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// 地图事件处理组件
const MapEventHandler = ({
  drawMode,
  onPolygonPointAdd,
  onCircleCreate,
  onCircleUpdate,
  isEditing,
  editingFence,
  onMouseMove,
  onPolygonComplete
}) => {
  const map = useMap();
  const [isDrawingCircle, setIsDrawingCircle] = useState(false);
  const [circleCenter, setCircleCenter] = useState(null);
  const [clickTimeout, setClickTimeout] = useState(null);

  useMapEvents({
    click: (e) => {
      if (!isEditing) {
        if (drawMode === 'polygon') {
          // 使用延时来区分单击和双击
          if (clickTimeout) {
            clearTimeout(clickTimeout);
            setClickTimeout(null);
            return; // 这是双击的第二次点击，忽略
          }

          const timeout = setTimeout(() => {
            onPolygonPointAdd(e.latlng);
            setClickTimeout(null);
          }, 300); // 300ms延时

          setClickTimeout(timeout);
        } else if (drawMode === 'circle') {
          if (!isDrawingCircle) {
            // 开始绘制圆形 - 设置中心点
            setCircleCenter(e.latlng);
            setIsDrawingCircle(true);
            onCircleCreate(e.latlng, 100); // 默认100米半径
          }
        }
      }
    },
    mousemove: (e) => {
      if (drawMode === 'circle' && isDrawingCircle && circleCenter) {
        // 计算半径
        const radius = circleCenter.distanceTo(e.latlng);
        onCircleUpdate(circleCenter, radius);
      } else if (drawMode === 'polygon' && onMouseMove) {
        // 多边形绘制时的鼠标移动
        onMouseMove(e.latlng);
      }
    },
    dblclick: (e) => {
      if (drawMode === 'circle' && isDrawingCircle) {
        // 双击完成圆形绘制
        const radius = circleCenter.distanceTo(e.latlng);
        onCircleUpdate(circleCenter, radius);
        setIsDrawingCircle(false);
        setCircleCenter(null);
      } else if (drawMode === 'polygon' && !isEditing) {
        // 清除单击的延时
        if (clickTimeout) {
          clearTimeout(clickTimeout);
          setClickTimeout(null);
        }

        // 双击完成多边形绘制
        if (onPolygonComplete) {
          onPolygonComplete();
        }
      }
    }
  });

  return null;
};

// 围栏绘制地图组件
const FenceDrawMap = ({
  center = [29.2500, 110.3500], // 张家界坐标
  zoom = 12,
  height = '400px',
  onFenceChange,
  initialFence = null, // 初始围栏数据（编辑模式）
  readOnly = false, // 只读模式
  drawMode: externalDrawMode = null, // 外部传入的绘制模式
  hideTypeSelector = false, // 是否隐藏类型选择器
  hideEditButton = false // 是否隐藏编辑按钮
}) => {
  const [drawMode, setDrawMode] = useState(externalDrawMode); // 'polygon' | 'circle' | null
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [circleData, setCircleData] = useState(null); // { center, radius }
  const [isEditing, setIsEditing] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentTileSource, setCurrentTileSource] = useState(0);
  const [networkError, setNetworkError] = useState(false);
  const [mousePosition, setMousePosition] = useState(null); // 鼠标位置，用于预览线条
  const [isPolygonComplete, setIsPolygonComplete] = useState(false); // 多边形是否已完成
  const [isFullscreen, setIsFullscreen] = useState(false); // 全屏状态

  const mapRef = useRef(null);
  const containerRef = useRef(null); // 容器引用，用于全屏
  const mapInstanceRef = useRef(null); // 地图实例引用

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
    },
    {
      url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      name: 'CartoDB浅色'
    }
  ];

  // 同步外部传入的绘制模式
  useEffect(() => {
    if (externalDrawMode) {
      setDrawMode(externalDrawMode);
    }
  }, [externalDrawMode]);

  // 初始化围栏数据
  useEffect(() => {
    if (initialFence) {
      if (initialFence.type === 'polygon' && initialFence.coordinates) {
        setPolygonPoints(initialFence.coordinates.map(coord => ({ lat: coord[0], lng: coord[1] })));
        setDrawMode('polygon');
        setIsPolygonComplete(true); // 标记为完成状态
      } else if (initialFence.type === 'circle' && initialFence.center && initialFence.radius) {
        setCircleData({
          center: { lat: initialFence.center[0], lng: initialFence.center[1] },
          radius: initialFence.radius
        });
        setDrawMode('circle');
      }
    }
  }, [initialFence]);

  // 开始绘制多边形
  const startPolygonDraw = useCallback(() => {
    if (readOnly) return;
    setDrawMode('polygon');
    setPolygonPoints([]);
    setCircleData(null);
    setIsEditing(false);
    setMousePosition(null);
    setIsPolygonComplete(false);
    message.info('请在地图上点击设置多边形顶点，双击完成绘制');
  }, [readOnly]);

  // 开始绘制圆形
  const startCircleDraw = useCallback(() => {
    if (readOnly) return;
    setDrawMode('circle');
    setPolygonPoints([]);
    setCircleData(null);
    setIsEditing(false);
    setMousePosition(null);
    setIsPolygonComplete(false);
    message.info('请在地图上点击设置圆心，然后移动鼠标调整半径，双击完成');
  }, [readOnly]);

  // 处理鼠标移动（用于预览线条）
  const handleMouseMove = useCallback((latlng) => {
    if (drawMode === 'polygon' && polygonPoints.length > 0 && !isEditing && !isPolygonComplete) {
      setMousePosition(latlng);
    }
  }, [drawMode, polygonPoints.length, isEditing, isPolygonComplete]);

  // 添加多边形顶点
  const handlePolygonPointAdd = useCallback((latlng) => {
    const newPoints = [...polygonPoints, latlng];
    setPolygonPoints(newPoints);

    // 通知父组件
    if (onFenceChange) {
      onFenceChange({
        type: 'polygon',
        coordinates: newPoints.map(point => [point.lat, point.lng]),
        center: null,
        radius: null
      });
    }
  }, [polygonPoints, onFenceChange]);

  // 完成多边形绘制
  const handlePolygonComplete = useCallback(() => {
    if (polygonPoints.length >= 3) {
      setMousePosition(null); // 清除预览线条
      setIsPolygonComplete(true); // 标记多边形已完成
      message.success('多边形围栏绘制完成');
    } else {
      message.warning('多边形至少需要3个顶点，请继续添加顶点');
    }
  }, [polygonPoints]);

  // 创建圆形
  const handleCircleCreate = useCallback((center, radius) => {
    const newCircleData = { center, radius };
    setCircleData(newCircleData);

    // 通知父组件
    if (onFenceChange) {
      onFenceChange({
        type: 'circle',
        coordinates: null,
        center: [center.lat, center.lng],
        radius: radius
      });
    }
  }, [onFenceChange]);

  // 更新圆形
  const handleCircleUpdate = useCallback((center, radius) => {
    const newCircleData = { center, radius };
    setCircleData(newCircleData);

    // 通知父组件
    if (onFenceChange) {
      onFenceChange({
        type: 'circle',
        coordinates: null,
        center: [center.lat, center.lng],
        radius: radius
      });
    }
  }, [onFenceChange]);

  // 撤销最后一个点
  const undoLastPoint = useCallback(() => {
    if (drawMode === 'polygon' && polygonPoints.length > 0) {
      const newPoints = polygonPoints.slice(0, -1);
      setPolygonPoints(newPoints);

      if (onFenceChange) {
        onFenceChange({
          type: 'polygon',
          coordinates: newPoints.map(point => [point.lat, point.lng]),
          center: null,
          radius: null
        });
      }
    }
  }, [drawMode, polygonPoints, onFenceChange]);

  // 清除绘制
  const clearDraw = useCallback(() => {
    setDrawMode(null);
    setPolygonPoints([]);
    setCircleData(null);
    setIsEditing(false);
    setMousePosition(null);
    setIsPolygonComplete(false);

    if (onFenceChange) {
      onFenceChange(null);
    }
  }, [onFenceChange]);

  // 完成绘制
  const finishDraw = useCallback(() => {
    if (drawMode === 'polygon' && polygonPoints.length >= 3) {
      message.success('多边形围栏绘制完成');
      setIsEditing(false);
    } else if (drawMode === 'circle' && circleData) {
      message.success('圆形围栏绘制完成');
      setIsEditing(false);
    } else {
      message.warning('请完成围栏绘制');
    }
  }, [drawMode, polygonPoints, circleData]);

  // 编辑围栏
  const editFence = useCallback(() => {
    setIsEditing(true);
    message.info('进入编辑模式，可以拖拽调整围栏');
  }, []);

  // 切换地图源
  const switchTileSource = useCallback(() => {
    const nextSource = (currentTileSource + 1) % tileSources.length;
    setCurrentTileSource(nextSource);
    setMapLoaded(false);
    message.info(`已切换到${tileSources[nextSource].name}`);
  }, [currentTileSource, tileSources]);
  // 全屏功能
  const enterFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (containerRef.current.requestFullscreen) {
        await containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        await containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.mozRequestFullScreen) {
        await containerRef.current.mozRequestFullScreen();
      } else if (containerRef.current.msRequestFullscreen) {
        await containerRef.current.msRequestFullscreen();
      }
    } catch (error) {
      console.error('进入全屏失败:', error);
      message.error('进入全屏失败，请检查浏览器设置');
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        await document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }
    } catch (error) {
      console.error('退出全屏失败:', error);
      message.error('退出全屏失败');
    }
  }, []);

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );

      setIsFullscreen(isCurrentlyFullscreen);

      // 全屏状态改变时，重新调整地图尺寸
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 100);
    };

    // 添加全屏状态变化监听器
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      // 清理监听器
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // ESC键退出全屏
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isFullscreen, exitFullscreen]);





  return (
    <div
      ref={containerRef}
      className={`${styles.fenceDrawMapContainer} ${isFullscreen ? styles.fullscreenContainer : ''}`}
      style={{ height, minHeight: height }}
    >
      {/* 绘制工具栏 */}
      <div className={styles.drawToolbar}>
        <Space>
          {!readOnly && !hideTypeSelector && (
            <>
              <Tooltip title="绘制多边形围栏">
                <Button
                  type={drawMode === 'polygon' ? 'primary' : 'default'}
                  onClick={startPolygonDraw}
                  disabled={isEditing}
                >
                  多边形
                </Button>
              </Tooltip>
              <Tooltip title="绘制圆形围栏">
                <Button
                  type={drawMode === 'circle' ? 'primary' : 'default'}
                  onClick={startCircleDraw}
                  disabled={isEditing}
                >
                  圆形
                </Button>
              </Tooltip>
            </>
          )}
          <Tooltip title="切换地图源">
            <Button
              icon={<GlobalOutlined />}
              onClick={switchTileSource}
              disabled={isEditing}
            />
          </Tooltip>
          <Tooltip title={isFullscreen ? "退出全屏" : "进入全屏"}>
            <Button
              icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              onClick={isFullscreen ? exitFullscreen : enterFullscreen}
              disabled={isEditing}
            />
          </Tooltip>

          {!readOnly && (
            <>
              {drawMode === 'polygon' && polygonPoints.length > 0 && (
                <Tooltip title="撤销最后一个点">
                  <Button
                    icon={<UndoOutlined />}
                    onClick={undoLastPoint}
                    disabled={isEditing}
                  />
                </Tooltip>
              )}
              {(polygonPoints.length > 0 || circleData) && (
                <>
                  <Tooltip title="清除绘制">
                    <Button
                      icon={<ClearOutlined />}
                      onClick={clearDraw}
                      disabled={isEditing}
                    />
                  </Tooltip>
                  <Tooltip title="完成绘制">
                    <Button
                      type="primary"
                      icon={<CheckOutlined />}
                      onClick={finishDraw}
                      disabled={isEditing}
                    />
                  </Tooltip>
                  {!isEditing && !hideEditButton && (
                    <Tooltip title="编辑围栏">
                      <Button
                        icon={<EditOutlined />}
                        onClick={editFence}
                      />
                    </Tooltip>
                  )}
                </>
              )}
            </>
          )}
        </Space>
      </div>

      {/* 地图容器 */}
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className={styles.mapContainer}
        ref={mapRef}
        whenCreated={(mapInstance) => {
          // 保存地图实例引用
          mapInstanceRef.current = mapInstance;

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

        {/* 地图事件处理 */}
        <MapEventHandler
          drawMode={drawMode}
          onPolygonPointAdd={handlePolygonPointAdd}
          onCircleCreate={handleCircleCreate}
          onCircleUpdate={handleCircleUpdate}
          isEditing={isEditing}
          editingFence={initialFence}
          onMouseMove={handleMouseMove}
          onPolygonComplete={handlePolygonComplete}
        />

        {/* 渲染多边形围栏 */}
        {drawMode === 'polygon' && (
          <>
            {/* 渲染已设置的顶点标记（非只读模式） */}
            {!readOnly && polygonPoints.map((point, index) => (
              <Marker
                key={index}
                position={point}
                icon={L.divIcon({
                  className: 'polygon-vertex-marker',
                  html: `<div style="
                    width: 8px;
                    height: 8px;
                    background: #1890ff;
                    border: 2px solid #fff;
                    border-radius: 50%;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                  "></div>`,
                  iconSize: [12, 12],
                  iconAnchor: [6, 6]
                })}
              />
            ))}

            {/* 渲染顶点之间的连接线（非只读模式） */}
            {!readOnly && polygonPoints.length > 1 && (
              <Polyline
                positions={polygonPoints}
                pathOptions={{
                  color: '#1890ff',
                  weight: 2,
                  opacity: 0.8,
                  dashArray: '5, 5'
                }}
              />
            )}

            {/* 渲染鼠标预览线条（非只读模式） */}
            {!readOnly && polygonPoints.length > 0 && mousePosition && !isEditing && !isPolygonComplete && (
              <Polyline
                positions={[polygonPoints[polygonPoints.length - 1], mousePosition]}
                pathOptions={{
                  color: '#1890ff',
                  weight: 2,
                  opacity: 0.5,
                  dashArray: '10, 5'
                }}
              />
            )}

            {/* 渲染完整的多边形（当有足够顶点时） */}
            {polygonPoints.length >= 3 && (
              <Polygon
                positions={polygonPoints}
                pathOptions={{
                  color: readOnly ? '#52c41a' : '#1890ff',
                  fillColor: readOnly ? '#52c41a' : '#1890ff',
                  fillOpacity: readOnly ? 0.25 : 0.2,
                  weight: readOnly ? 3 : 2
                }}
              />
            )}
          </>
        )}

        {/* 渲染圆形围栏 */}
        {drawMode === 'circle' && circleData && (
          <Circle
            center={circleData.center}
            radius={circleData.radius}
            pathOptions={{
              color: readOnly ? '#52c41a' : '#1890ff',
              fillColor: readOnly ? '#52c41a' : '#1890ff',
              fillOpacity: readOnly ? 0.25 : 0.2,
              weight: readOnly ? 3 : 2
            }}
          />
        )}
      </MapContainer>

      {/* 地图加载指示器 */}
      {!mapLoaded && !networkError && (
        <div className={styles.mapLoadingOverlay}>
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
            tip={`正在加载${tileSources[currentTileSource].name}...`}
          />
          <div style={{ marginTop: '16px', fontSize: '12px', color: '#8c8c8c' }}>
            如果加载时间过长，请点击地图源切换按钮尝试其他地图服务
          </div>
        </div>
      )}

      {/* 网络错误提示 */}
      {networkError && (
        <div className={styles.mapErrorOverlay}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
          <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
            地图服务暂时无法访问
          </div>
          <div style={{ fontSize: '14px', color: '#8c8c8c', marginBottom: '16px' }}>
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

      {/* 绘制状态信息 - 只在非只读模式下显示 */}
      {drawMode && !readOnly && (
        <div className={styles.drawStatus}>
          {drawMode === 'polygon' && (
            <div>
              多边形围栏 - 已设置 {polygonPoints.length} 个顶点
              {polygonPoints.length >= 3 && <span className={styles.statusSuccess}> (可完成绘制)</span>}
            </div>
          )}
          {drawMode === 'circle' && circleData && (
            <div>
              圆形围栏 - 半径: {Math.round(circleData.radius)}米
              <span className={styles.statusSuccess}> (可完成绘制)</span>
            </div>
          )}
        </div>
      )}


    </div>
  );
};

export default FenceDrawMap;
