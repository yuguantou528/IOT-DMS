import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, Table, Tag, Space, Progress, Alert, Button } from 'antd';
import {
  WifiOutlined,
  DisconnectOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  NodeIndexOutlined,
  MonitorOutlined,
  ThunderboltOutlined,
  SignalFilled,
  VideoCameraOutlined,
  RadarChartOutlined,
  ExperimentOutlined,
  GlobalOutlined,
  AppstoreOutlined,
  EyeOutlined,
  LineChartOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import styles from './index.module.css';

const Dashboard = ({ title = '首页' }) => {
  const navigate = useNavigate();
  const [deviceStats, setDeviceStats] = useState({
    totalDevices: 0,
    onlineDevices: 0,
    offlineDevices: 0,
    alertDevices: 0,
    cameraDevices: 0,
    radioDevices: 0,
    sensorDevices: 0,
    baseStationDevices: 0
  });

  // 模拟获取设备统计数据
  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setDeviceStats({
        totalDevices: 156,
        onlineDevices: 142,
        offlineDevices: 14,
        alertDevices: 8,
        cameraDevices: 45,
        radioDevices: 38,
        sensorDevices: 42,
        baseStationDevices: 31
      });
    }, 1000);
  }, []);

  // 跳转到设备管理页面
  const handleViewAllDevices = () => {
    navigate('/device/management');
  };

  // 计算在线率
  const onlineRate = deviceStats.totalDevices > 0 ?
    Math.round((deviceStats.onlineDevices / deviceStats.totalDevices) * 100) : 0;

  // 设备状态趋势图数据（过去7天）
  const deviceTrendData = [
    { date: '2024-01-15', online: 135, offline: 12, alert: 5 },
    { date: '2024-01-16', online: 142, offline: 8, alert: 6 },
    { date: '2024-01-17', online: 138, offline: 15, alert: 3 },
    { date: '2024-01-18', online: 145, offline: 7, alert: 4 },
    { date: '2024-01-19', online: 140, offline: 11, alert: 5 },
    { date: '2024-01-20', online: 142, offline: 14, alert: 8 },
    { date: '2024-01-21', online: deviceStats.onlineDevices, offline: deviceStats.offlineDevices, alert: deviceStats.alertDevices }
  ];

  // 设备状态趋势图配置
  const trendChartOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: function(params) {
        let result = `${params[0].axisValue}<br/>`;
        params.forEach(param => {
          result += `${param.marker}${param.seriesName}: ${param.value}台<br/>`;
        });
        return result;
      }
    },
    legend: {
      data: ['在线设备', '离线设备', '告警设备'],
      top: 10,
      left: 'center',
      orient: 'horizontal',
      itemGap: 20,
      textStyle: {
        fontSize: 12
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '18%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: deviceTrendData.map(item => item.date.slice(5)),
      axisLabel: {
        color: '#666'
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#666',
        formatter: '{value}台'
      }
    },
    series: [
      {
        name: '在线设备',
        type: 'line',
        smooth: true,
        data: deviceTrendData.map(item => item.online),
        itemStyle: {
          color: '#52c41a'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(82, 196, 26, 0.3)'
            }, {
              offset: 1, color: 'rgba(82, 196, 26, 0.1)'
            }]
          }
        }
      },
      {
        name: '离线设备',
        type: 'line',
        smooth: true,
        data: deviceTrendData.map(item => item.offline),
        itemStyle: {
          color: '#faad14'
        }
      },
      {
        name: '告警设备',
        type: 'line',
        smooth: true,
        data: deviceTrendData.map(item => item.alert),
        itemStyle: {
          color: '#f5222d'
        }
      }
    ]
  };

  // 设备类型分布饼图数据
  const deviceTypeData = [
    { name: '摄像头设备', value: deviceStats.cameraDevices, color: '#1890ff' },
    { name: 'Mesh电台', value: deviceStats.radioDevices, color: '#52c41a' },
    { name: '传感器设备', value: deviceStats.sensorDevices, color: '#faad14' },
    { name: '基站设备', value: deviceStats.baseStationDevices, color: '#f5222d' }
  ];

  // 设备类型分布饼图配置
  const pieChartOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}台 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 5,
      top: 'middle',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        fontSize: 11
      },
      data: deviceTypeData.map(item => item.name)
    },
    series: [
      {
        name: '设备类型',
        type: 'pie',
        radius: ['35%', '65%'],
        center: ['35%', '55%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: deviceTypeData.map(item => ({
          name: item.name,
          value: item.value,
          itemStyle: {
            color: item.color
          }
        }))
      }
    ]
  };

  // 设备在线率仪表盘配置
  const onlineRateGaugeOption = {
    tooltip: {
      formatter: function(params) {
        return `设备在线率: ${params.value}%<br/>在线设备: ${deviceStats.onlineDevices}台<br/>总设备: ${deviceStats.totalDevices}台`;
      }
    },
    series: [
      {
        name: '在线率',
        type: 'gauge',
        center: ['50%', '55%'],
        radius: '70%',
        min: 0,
        max: 100,
        splitNumber: 10,
        axisLine: {
          lineStyle: {
            width: 8,
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
          distance: -8,
          length: 6,
          lineStyle: {
            color: '#fff',
            width: 1
          }
        },
        splitLine: {
          distance: -12,
          length: 12,
          lineStyle: {
            color: '#fff',
            width: 2
          }
        },
        axisLabel: {
          color: '#666',
          fontSize: 10,
          distance: -20,
          formatter: function(value) {
            return value + '%';
          }
        },
        detail: {
          fontSize: 18,
          fontWeight: 'bold',
          color: '#262626',
          valueAnimation: true,
          formatter: '{value}%',
          offsetCenter: [0, '75%']
        },
        data: [
          {
            value: onlineRate || 0,
            name: '在线率'
          }
        ]
      }
    ]
  };

  // 设备统计数据
  const statsData = [
    {
      title: '设备总数',
      value: deviceStats.totalDevices,
      icon: <NodeIndexOutlined />,
      color: '#1890ff'
    },
    {
      title: '在线设备',
      value: deviceStats.onlineDevices,
      icon: <WifiOutlined />,
      color: '#52c41a'
    },
    {
      title: '离线设备',
      value: deviceStats.offlineDevices,
      icon: <DisconnectOutlined />,
      color: '#faad14'
    },
    {
      title: '告警设备',
      value: deviceStats.alertDevices,
      icon: <WarningOutlined />,
      color: '#f5222d'
    }
  ];

  // 最近设备数据
  const recentDevicesData = [
    {
      key: '1',
      deviceName: 'Mesh电台-001',
      deviceType: 'Mesh电台',
      location: '北京市朝阳区监控点A',
      status: 'online',
      lastOnline: '2024-01-15 14:30:25',
      signalStrength: -45
    },
    {
      key: '2',
      deviceName: '网络摄像头-002',
      deviceType: '网络摄像头',
      location: '上海市浦东新区监控点B',
      status: 'offline',
      lastOnline: '2024-01-15 12:15:10',
      signalStrength: -999
    },
    {
      key: '3',
      deviceName: 'Mesh电台-003',
      deviceType: 'Mesh电台',
      location: '广州市天河区监控点C',
      status: 'online',
      lastOnline: '2024-01-15 14:32:18',
      signalStrength: -52
    },
    {
      key: '4',
      deviceName: '370M基站-004',
      deviceType: '370M基站',
      location: '深圳市南山区监控点D',
      status: 'alert',
      lastOnline: '2024-01-15 14:25:45',
      signalStrength: -68
    },
    {
      key: '5',
      deviceName: '卫星通信-005',
      deviceType: '卫星通信',
      location: '成都市高新区监控点E',
      status: 'online',
      lastOnline: '2024-01-15 14:33:02',
      signalStrength: -38
    }
  ];

  const columns = [
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
      width: 150,
    },
    {
      title: '设备类型',
      dataIndex: 'deviceType',
      key: 'deviceType',
      width: 120,
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          online: { color: 'green', text: '在线', icon: <WifiOutlined /> },
          offline: { color: 'red', text: '离线', icon: <DisconnectOutlined /> },
          alert: { color: 'orange', text: '告警', icon: <WarningOutlined /> }
        };
        const { color, text, icon } = statusMap[status] || {};
        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
      }
    },
    {
      title: '信号强度',
      dataIndex: 'signalStrength',
      key: 'signalStrength',
      width: 120,
      render: (strength) => {
        if (strength === -999) return '-';
        const getSignalColor = (rssi) => {
          if (rssi >= -50) return '#52c41a';
          if (rssi >= -60) return '#faad14';
          return '#f5222d';
        };
        return (
          <span style={{ color: getSignalColor(strength) }}>
            <SignalFilled /> {strength}dBm
          </span>
        );
      }
    },
    {
      title: '最后在线时间',
      dataIndex: 'lastOnline',
      key: 'lastOnline',
      width: 160,
    }
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>{title}</h2>
        <p className={styles.pageDescription}>
          欢迎使用物联网设备管理平台原型，实时监控您的设备状态
        </p>
      </div>

      {/* 设备统计卡片 */}
      <Row gutter={[16, 16]} className={styles.statsRow} style={{ marginBottom: '20px' }}>
        {statsData.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card className={`${styles.statCard} ${styles[`stat${index + 1}`]}`} bordered={false}>
              <div className={styles.statIcon} style={{ backgroundColor: stat.color }}>
                {stat.icon}
              </div>
              <Statistic
                title={<span className={styles.statTitle}>{stat.title}</span>}
                value={stat.value}
                valueStyle={{ color: stat.color }}
                loading={deviceStats.totalDevices === 0}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 设备类型分布 */}
      <Row gutter={[16, 16]} className={styles.deviceTypeRow} style={{ marginBottom: '20px' }}>
        <Col xs={12} sm={6} lg={6}>
          <Card className={`${styles.deviceTypeCard} ${styles.cameraCard}`} bordered={false}>
            <div className={styles.deviceTypeContent}>
              <div className={styles.deviceTypeIcon}>
                <VideoCameraOutlined />
              </div>
              <div className={styles.deviceTypeStat}>
                <div className={styles.deviceTypeTitle}>摄像头设备</div>
                <div className={styles.deviceTypeValue}>{deviceStats.cameraDevices}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={6}>
          <Card className={`${styles.deviceTypeCard} ${styles.radioCard}`} bordered={false}>
            <div className={styles.deviceTypeContent}>
              <div className={styles.deviceTypeIcon}>
                <RadarChartOutlined />
              </div>
              <div className={styles.deviceTypeStat}>
                <div className={styles.deviceTypeTitle}>Mesh电台</div>
                <div className={styles.deviceTypeValue}>{deviceStats.radioDevices}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={6}>
          <Card className={`${styles.deviceTypeCard} ${styles.sensorCard}`} bordered={false}>
            <div className={styles.deviceTypeContent}>
              <div className={styles.deviceTypeIcon}>
                <ExperimentOutlined />
              </div>
              <div className={styles.deviceTypeStat}>
                <div className={styles.deviceTypeTitle}>传感器设备</div>
                <div className={styles.deviceTypeValue}>{deviceStats.sensorDevices}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={6}>
          <Card className={`${styles.deviceTypeCard} ${styles.stationCard}`} bordered={false}>
            <div className={styles.deviceTypeContent}>
              <div className={styles.deviceTypeIcon}>
                <GlobalOutlined />
              </div>
              <div className={styles.deviceTypeStat}>
                <div className={styles.deviceTypeTitle}>基站设备</div>
                <div className={styles.deviceTypeValue}>{deviceStats.baseStationDevices}</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} className={styles.chartsRow} style={{ marginBottom: '20px' }}>
        <Col xs={24} sm={24} lg={10}>
          <Card
            title={
              <div className={styles.cardTitle}>
                <LineChartOutlined className={styles.cardTitleIcon} />
                设备状态趋势
              </div>
            }
            className={styles.chartCard}
            bordered={false}
          >
            <ReactECharts
              option={trendChartOption}
              style={{ height: '320px' }}
              opts={{ renderer: 'canvas' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={7}>
          <Card
            title={
              <div className={styles.cardTitle}>
                <PieChartOutlined className={styles.cardTitleIcon} />
                设备类型分布
              </div>
            }
            className={styles.chartCard}
            bordered={false}
          >
            <ReactECharts
              option={pieChartOption}
              style={{ height: '320px' }}
              opts={{ renderer: 'canvas' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={7}>
          <Card
            title={
              <div className={styles.cardTitle}>
                <MonitorOutlined className={styles.cardTitleIcon} />
                设备在线率
              </div>
            }
            className={styles.chartCard}
            bordered={false}
          >
            <ReactECharts
              option={onlineRateGaugeOption}
              style={{ height: '320px' }}
              opts={{ renderer: 'canvas' }}
            />
          </Card>
        </Col>
      </Row>



      {/* 最近设备状态表格 */}
      <Row gutter={[16, 16]} className={styles.tableRow}>
        <Col span={24}>
          <Card
            title={
              <div className={styles.cardTitle}>
                <AppstoreOutlined className={styles.cardTitleIcon} />
                最近设备状态
              </div>
            }
            className={styles.tableCard}
            extra={
              <Button
                type="link"
                icon={<EyeOutlined />}
                onClick={handleViewAllDevices}
              >
                查看全部设备
              </Button>
            }
            bordered={false}
          >
            <Table
              columns={columns}
              dataSource={recentDevicesData}
              pagination={{
                pageSize: 5,
                showSizeChanger: false,
                showQuickJumper: false,
                showTotal: (total, range) =>
                  `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
              }}
              scroll={{ x: 800 }}
              size="small"
              className={styles.deviceTable}
              rowClassName={(record) => {
                if (record.status === 'alert') return styles.alertRow;
                if (record.status === 'offline') return styles.offlineRow;
                return '';
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
