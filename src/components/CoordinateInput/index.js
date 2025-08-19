import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  InputNumber,
  Button,
  Space,
  Row,
  Col,
  Divider,
  Typography,
  Alert,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  RadiusUpleftOutlined
} from '@ant-design/icons';
import styles from './index.module.css';

const { Text } = Typography;

const CoordinateInput = ({
  fenceType,
  coordinates,
  center,
  radius,
  onChange,
  className = '',
  isEditing = false // 新增参数：是否为编辑模式
}) => {
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [circleCenter, setCircleCenter] = useState({ lng: '', lat: '' });
  const [circleRadius, setCircleRadius] = useState('');


  // 初始化数据和同步外部变化
  useEffect(() => {
    if (fenceType === 'polygon') {
      if (coordinates && coordinates.length > 0) {
        const points = coordinates.map(coord => ({
          lng: coord[1], // 经度
          lat: coord[0]  // 纬度
        }));
        setPolygonPoints(points);
      } else if (isEditing && polygonPoints.length === 0) {
        // 只在编辑模式下且没有坐标时，初始化默认点
        setPolygonPoints([
          { lng: 110.35, lat: 29.25 },
          { lng: 110.36, lat: 29.25 },
          { lng: 110.36, lat: 29.26 }
        ]);
      } else if (!isEditing) {
        // 新增模式下，清空坐标点
        setPolygonPoints([]);
      }
    } else if (fenceType === 'circle') {
      if (center && center.length === 2) {
        setCircleCenter({
          lat: center[0],
          lng: center[1]
        });
      } else if (!isEditing) {
        // 新增模式下，重置为空值
        setCircleCenter({ lng: '', lat: '' });
      }
      if (radius !== undefined && radius !== null) {
        setCircleRadius(radius);
      } else if (!isEditing) {
        // 新增模式下，重置半径
        setCircleRadius('');
      }
    }
  }, [fenceType, coordinates, center, radius, isEditing]);

  // 当围栏类型改变时，通知父组件初始数据
  useEffect(() => {
    if (fenceType && onChange && isEditing) {
      // 只在编辑模式下才自动触发初始数据
      if (fenceType === 'polygon' && polygonPoints.length >= 3) {
        const coords = polygonPoints.map(point => [point.lat, point.lng]);
        onChange({
          type: 'polygon',
          coordinates: coords,
          center: null,
          radius: null
        });
      } else if (fenceType === 'circle' && circleCenter.lat && circleCenter.lng && circleRadius) {
        onChange({
          type: 'circle',
          coordinates: null,
          center: [circleCenter.lat, circleCenter.lng],
          radius: circleRadius
        });
      }
    }
  }, [fenceType, isEditing]); // 在围栏类型或编辑模式改变时触发

  // 坐标验证函数
  const validateLongitude = (value) => {
    return value >= -180 && value <= 180;
  };

  const validateLatitude = (value) => {
    return value >= -90 && value <= 90;
  };

  const validateRadius = (value) => {
    return value >= 10 && value <= 100000; // 10米到100公里
  };

  // 多边形点变化处理
  const handlePolygonPointChange = (index, field, value) => {
    const newPoints = [...polygonPoints];
    newPoints[index] = { ...newPoints[index], [field]: value };
    setPolygonPoints(newPoints);

    // 只有当有有效坐标时才通知父组件
    if (onChange) {
      const validPoints = newPoints.filter(point =>
        point.lat !== '' && point.lng !== '' &&
        !isNaN(point.lat) && !isNaN(point.lng) &&
        point.lat !== null && point.lng !== null
      );

      if (validPoints.length >= 3) {
        const coords = validPoints.map(point => [point.lat, point.lng]);
        onChange({
          type: 'polygon',
          coordinates: coords,
          center: null,
          radius: null
        });
      }
    }
  };

  // 添加多边形点
  const addPolygonPoint = () => {
    const newPoint = { lng: '', lat: '' }; // 新增点不带默认值
    const newPoints = [...polygonPoints, newPoint];
    setPolygonPoints(newPoints);

    // 只有当所有点都有有效坐标时才触发onChange
    if (onChange) {
      const validPoints = newPoints.filter(point =>
        point.lat !== '' && point.lng !== '' &&
        !isNaN(point.lat) && !isNaN(point.lng)
      );

      if (validPoints.length >= 3) {
        const coords = validPoints.map(point => [point.lat, point.lng]);
        onChange({
          type: 'polygon',
          coordinates: coords,
          center: null,
          radius: null
        });
      }
    }
  };

  // 删除多边形点
  const removePolygonPoint = (index) => {
    const newPoints = polygonPoints.filter((_, i) => i !== index);
    setPolygonPoints(newPoints);

    // 只有当有有效坐标时才通知父组件
    if (onChange) {
      const validPoints = newPoints.filter(point =>
        point.lat !== '' && point.lng !== '' &&
        !isNaN(point.lat) && !isNaN(point.lng) &&
        point.lat !== null && point.lng !== null
      );

      if (validPoints.length >= 3) {
        const coords = validPoints.map(point => [point.lat, point.lng]);
        onChange({
          type: 'polygon',
          coordinates: coords,
          center: null,
          radius: null
        });
      } else {
        // 如果有效点少于3个，清空围栏数据
        onChange({
          type: 'polygon',
          coordinates: null,
          center: null,
          radius: null
        });
      }
    }
  };

  // 圆形中心点变化处理
  const handleCircleCenterChange = (field, value) => {
    const newCenter = { ...circleCenter, [field]: value };
    setCircleCenter(newCenter);

    // 只有当中心点和半径都有有效值时才通知父组件
    if (onChange && newCenter.lat !== '' && newCenter.lng !== '' &&
        !isNaN(newCenter.lat) && !isNaN(newCenter.lng) &&
        newCenter.lat !== null && newCenter.lng !== null &&
        circleRadius !== '' && circleRadius !== null && !isNaN(circleRadius)) {
      onChange({
        type: 'circle',
        coordinates: null,
        center: [newCenter.lat, newCenter.lng],
        radius: circleRadius
      });
    }
  };

  // 圆形半径变化处理
  const handleCircleRadiusChange = (value) => {
    setCircleRadius(value);

    // 只有当中心点和半径都有有效值时才通知父组件
    if (onChange && circleCenter.lat !== '' && circleCenter.lng !== '' &&
        !isNaN(circleCenter.lat) && !isNaN(circleCenter.lng) &&
        circleCenter.lat !== null && circleCenter.lng !== null &&
        value !== '' && value !== null && !isNaN(value)) {
      onChange({
        type: 'circle',
        coordinates: null,
        center: [circleCenter.lat, circleCenter.lng],
        radius: value
      });
    }
  };

  return (
    <div className={`${styles.coordinateInput} ${className}`}>
          {fenceType === 'polygon' && (
            <div className={styles.polygonInput}>
              <div className={styles.inputHeader}>
                <Space>
                  <EnvironmentOutlined style={{ color: '#1890ff' }} />
                  <Text strong>多边形顶点坐标</Text>
                  <Text type="secondary">({polygonPoints.length} 个点)</Text>
                </Space>
                <Button
                  type="dashed"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={addPolygonPoint}
                >
                  添加顶点
                </Button>
              </div>

              <div className={styles.pointsList}>
                {polygonPoints.map((point, index) => (
                  <Card
                    key={index}
                    size="small"
                    className={styles.pointCard}
                    title={`顶点 ${index + 1}`}
                    extra={
                      polygonPoints.length > 3 && (
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removePolygonPoint(index)}
                        />
                      )
                    }
                  >
                    <Row gutter={8}>
                      <Col span={12}>
                        <div className={styles.inputGroup}>
                          <Text type="secondary" className={styles.inputLabel}>
                            经度 (Lng)
                          </Text>
                          <InputNumber
                            value={point.lng}
                            onChange={(value) => handlePolygonPointChange(index, 'lng', value)}
                            placeholder="请输入经度"
                            precision={6}
                            step={0.000001}
                            min={-180}
                            max={180}
                            status={!validateLongitude(point.lng) ? 'error' : ''}
                            style={{ width: '100%' }}
                          />
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className={styles.inputGroup}>
                          <Text type="secondary" className={styles.inputLabel}>
                            纬度 (Lat)
                          </Text>
                          <InputNumber
                            value={point.lat}
                            onChange={(value) => handlePolygonPointChange(index, 'lat', value)}
                            placeholder="请输入纬度"
                            precision={6}
                            step={0.000001}
                            min={-90}
                            max={90}
                            status={!validateLatitude(point.lat) ? 'error' : ''}
                            style={{ width: '100%' }}
                          />
                        </div>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {fenceType === 'circle' && (
            <div className={styles.circleInput}>
              <div className={styles.inputHeader}>
                <Space>
                  <RadiusUpleftOutlined style={{ color: '#52c41a' }} />
                  <Text strong>圆形围栏参数</Text>
                </Space>
              </div>

              <Card size="small" className={styles.circleCard}>
                <Row gutter={16}>
                  <Col span={8}>
                    <div className={styles.inputGroup}>
                      <Text type="secondary" className={styles.inputLabel}>
                        中心点经度 (Lng)
                      </Text>
                      <InputNumber
                        value={circleCenter.lng}
                        onChange={(value) => handleCircleCenterChange('lng', value)}
                        placeholder="请输入经度"
                        precision={6}
                        step={0.000001}
                        min={-180}
                        max={180}
                        status={!validateLongitude(circleCenter.lng) ? 'error' : ''}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className={styles.inputGroup}>
                      <Text type="secondary" className={styles.inputLabel}>
                        中心点纬度 (Lat)
                      </Text>
                      <InputNumber
                        value={circleCenter.lat}
                        onChange={(value) => handleCircleCenterChange('lat', value)}
                        placeholder="请输入纬度"
                        precision={6}
                        step={0.000001}
                        min={-90}
                        max={90}
                        status={!validateLatitude(circleCenter.lat) ? 'error' : ''}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className={styles.inputGroup}>
                      <Text type="secondary" className={styles.inputLabel}>
                        半径 (米)
                      </Text>
                      <InputNumber
                        value={circleRadius}
                        onChange={handleCircleRadiusChange}
                        placeholder="请输入半径"
                        min={10}
                        max={100000}
                        status={!validateRadius(circleRadius) ? 'error' : ''}
                        style={{ width: '100%' }}
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      />
                    </div>
                  </Col>
                </Row>
              </Card>
            </div>
          )}

          <Alert
            message="坐标格式说明"
            description={
              <div className={styles.formatInfo}>
                <div><strong>经度范围：</strong>-180° 到 180°（东经为正，西经为负）</div>
                <div><strong>纬度范围：</strong>-90° 到 90°（北纬为正，南纬为负）</div>
                <div><strong>精度建议：</strong>保留6位小数可达到米级精度</div>
                <div><strong>示例坐标：</strong>张家界 (110.479191, 29.127401)</div>
                {fenceType === 'polygon' && (
                  <div><strong>多边形要求：</strong>至少需要3个顶点，按顺序连接形成封闭图形</div>
                )}
                {fenceType === 'circle' && (
                  <div><strong>半径范围：</strong>10米 到 100公里</div>
                )}
              </div>
            }
            type="info"
            showIcon
            style={{ marginTop: '12px' }}
          />
    </div>
  );
};

export default CoordinateInput;
