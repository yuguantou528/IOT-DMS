import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { 
  MonitorOutlined, 
  CheckCircleOutlined, 
  DisconnectOutlined, 
  WarningOutlined,
  VideoCameraOutlined,
  RadarChartOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import styles from './index.module.css';

const DeviceOverviewCharts = ({ stats }) => {
  // 计算在线率
  const onlineRate = stats.totalDevices > 0 ? 
    Math.round((stats.onlineDevices / stats.totalDevices) * 100) : 0;



  // 设备类型分布柱状图配置
  const typeBarOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#3b82f6',
      borderWidth: 1,
      textStyle: {
        color: '#ffffff'
      },
      formatter: function(params) {
        return `${params[0].name}<br/>${params[0].marker}数量: ${params[0].value}台`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['摄像头', 'Mesh电台', '网关设备', '基站'],
      axisLabel: {
        color: '#ffffff',
        fontSize: 11,
        interval: 0, // 强制显示所有标签
        rotate: 0 // 不旋转标签
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.3)'
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#ffffff',
        fontSize: 11,
        formatter: '{value}台'
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.3)'
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    series: [
      {
        name: '设备数量',
        type: 'bar',
        barWidth: '60%',
        data: [
          {
            value: stats.deviceTypes?.camera || 0,
            name: '摄像头',
            itemStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: '#1890ff' },
                  { offset: 1, color: '#40a9ff' }
                ]
              }
            }
          },
          {
            value: stats.deviceTypes?.radio || 0,
            name: 'Mesh电台',
            itemStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: '#52c41a' },
                  { offset: 1, color: '#73d13d' }
                ]
              }
            }
          },
          {
            value: stats.deviceTypes?.sensor || 0,
            name: '传感器',
            itemStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: '#faad14' },
                  { offset: 1, color: '#ffc53d' }
                ]
              }
            }
          },
          {
            value: stats.deviceTypes?.base_station || 0,
            name: '基站',
            itemStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: '#f5222d' },
                  { offset: 1, color: '#ff4d4f' }
                ]
              }
            }
          }
        ]
      }
    ]
  };

  // 在线率仪表盘配置
  const gaugeOption = {
    series: [
      {
        name: '在线率',
        type: 'gauge',
        center: ['50%', '55%'],
        radius: '75%',
        min: 0,
        max: 100,
        splitNumber: 10,
        axisLine: {
          lineStyle: {
            width: 10,
            color: [
              [0.3, '#f5222d'],
              [0.7, '#faad14'],
              [1, '#52c41a']
            ]
          }
        },
        pointer: {
          itemStyle: {
            color: '#1890ff'
          }
        },
        axisTick: {
          distance: -12,
          length: 8,
          lineStyle: {
            color: '#fff',
            width: 2
          }
        },
        splitLine: {
          distance: -18,
          length: 18,
          lineStyle: {
            color: '#fff',
            width: 3
          }
        },
        axisLabel: {
          color: '#ffffff',
          fontSize: 11,
          distance: -25,
          fontWeight: 'normal',
          formatter: function(value) {
            return value + '%';
          }
        },
        detail: {
          fontSize: 22,
          fontWeight: 'bold',
          color: '#ffffff',
          valueAnimation: true,
          formatter: '{value}%',
          offsetCenter: [0, '70%']
        },
        title: {
          show: true,
          offsetCenter: [0, '40%'],
          fontSize: 14,
          color: '#ffffff',
          fontWeight: 'bold'
        },
        data: [
          {
            value: onlineRate,
            name: '设备在线率'
          }
        ]
      }
    ]
  };

  return (
    <div className={styles.deviceOverviewCharts}>
      {/* 核心统计卡片 */}
      <Row gutter={[12, 12]} className={styles.statsCards}>
        <Col span={12}>
          <Card className={styles.statCard} bodyStyle={{ padding: '12px' }}>
            <Statistic
              title={<span className={styles.statTitle}>设备总数</span>}
              value={stats.totalDevices}
              prefix={<MonitorOutlined className={styles.statIcon} />}
              valueStyle={{ color: '#1890ff', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card className={styles.statCard} bodyStyle={{ padding: '12px' }}>
            <Statistic
              title={<span className={styles.statTitle}>在线设备</span>}
              value={stats.onlineDevices}
              prefix={<CheckCircleOutlined className={styles.statIcon} />}
              valueStyle={{ color: '#52c41a', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card className={styles.statCard} bodyStyle={{ padding: '12px' }}>
            <Statistic
              title={<span className={styles.statTitle}>离线设备</span>}
              value={stats.offlineDevices}
              prefix={<DisconnectOutlined className={styles.statIcon} />}
              valueStyle={{ color: '#faad14', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card className={styles.statCard} bodyStyle={{ padding: '12px' }}>
            <Statistic
              title={<span className={styles.statTitle}>告警设备</span>}
              value={stats.alarmDevices || 0}
              prefix={<WarningOutlined className={styles.statIcon} />}
              valueStyle={{ color: '#f5222d', fontSize: '20px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[12, 12]} className={styles.chartsRow}>
        <Col span={24}>
          <Card
            title={<span className={styles.chartTitle}>设备在线率</span>}
            className={styles.chartCard}
            bodyStyle={{ padding: '8px' }}
          >
            <ReactECharts
              option={gaugeOption}
              style={{ height: '180px' }}
              opts={{ renderer: 'canvas' }}
            />
          </Card>
        </Col>
        <Col span={24}>
          <Card
            title={<span className={styles.chartTitle}>设备类型分布</span>}
            className={styles.chartCard}
            bodyStyle={{ padding: '8px' }}
          >
            <ReactECharts
              option={typeBarOption}
              style={{ height: '140px' }}
              opts={{ renderer: 'canvas' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DeviceOverviewCharts;
