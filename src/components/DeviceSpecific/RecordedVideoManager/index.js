import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  DatePicker,
  Select,
  Input,
  Modal,
  message,
  Tag,
  Tooltip,
  Progress,
  Row,
  Col,
  Divider
} from 'antd';
import {
  PlayCircleOutlined,
  DownloadOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  CalendarOutlined,
  VideoCameraOutlined,
  FileOutlined,
  EyeOutlined
} from '@ant-design/icons';
import moment from 'moment';
import styles from './index.module.css';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;

const RecordedVideoManager = ({ device }) => {
  const [loading, setLoading] = useState(false);
  const [videoList, setVideoList] = useState([]);
  const [searchParams, setSearchParams] = useState({
    dateRange: [moment().subtract(7, 'days'), moment()],
    recordType: undefined,
    keyword: ''
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState({});

  // 生成模拟录像数据
  const generateMockVideoData = () => {
    const data = [];
    const recordTypes = ['scheduled', 'motion', 'alarm'];
    const qualities = ['1080p', '720p', '480p', '360p'];
    const statuses = ['completed', 'completed', 'completed', 'recording', 'error'];

    // 生成最近30天的录像数据
    for (let i = 0; i < 25; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const baseDate = moment().subtract(daysAgo, 'days');

      // 每天可能有多个录像
      const recordsPerDay = Math.floor(Math.random() * 4) + 1;

      for (let j = 0; j < recordsPerDay; j++) {
        const hour = Math.floor(Math.random() * 24);
        const minute = Math.floor(Math.random() * 60);
        const startTime = baseDate.clone().hour(hour).minute(minute).second(0);

        // 录像时长：15分钟到4小时
        const durationMinutes = Math.floor(Math.random() * 225) + 15;
        const duration = durationMinutes * 60;
        const endTime = startTime.clone().add(duration, 'seconds');

        const recordType = recordTypes[Math.floor(Math.random() * recordTypes.length)];
        const quality = qualities[Math.floor(Math.random() * qualities.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        // 根据画质和时长计算文件大小
        const qualityMultiplier = {
          '1080p': 1.0,
          '720p': 0.6,
          '480p': 0.3,
          '360p': 0.15
        };
        const baseSize = duration * 1024 * 1024 * 0.5; // 基础大小：每秒0.5MB
        const fileSize = Math.floor(baseSize * qualityMultiplier[quality]);

        const id = data.length + 1;
        const filename = `record_${startTime.format('YYYYMMDD_HHmmss')}.mp4`;

        data.push({
          id,
          filename,
          startTime: startTime.format('YYYY-MM-DD HH:mm:ss'),
          endTime: endTime.format('YYYY-MM-DD HH:mm:ss'),
          duration,
          fileSize,
          recordType,
          quality,
          status: i === 0 && j === 0 ? 'recording' : status, // 最新的一个设为录制中
          thumbnailUrl: `/api/placeholder/160/90?id=${id}`,
          description: recordType === 'alarm' ? '检测到异常活动' :
                      recordType === 'motion' ? '检测到移动物体' : '定时录制'
        });
      }
    }

    // 按时间倒序排列
    return data.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  };

  const mockVideoData = generateMockVideoData();

  // 获取录像列表
  const fetchVideoList = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 根据搜索条件过滤数据
      let filteredData = mockVideoData;
      
      if (searchParams.dateRange && searchParams.dateRange.length === 2) {
        const [startDate, endDate] = searchParams.dateRange;
        filteredData = filteredData.filter(video => {
          const videoDate = moment(video.startTime);
          return videoDate.isBetween(startDate, endDate, 'day', '[]');
        });
      }
      
      if (searchParams.recordType) {
        filteredData = filteredData.filter(video => video.recordType === searchParams.recordType);
      }
      
      if (searchParams.keyword) {
        filteredData = filteredData.filter(video => 
          video.filename.toLowerCase().includes(searchParams.keyword.toLowerCase())
        );
      }
      
      setVideoList(filteredData);
    } catch (error) {
      message.error('获取录像列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化时长
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 播放录像
  const playVideo = (video) => {
    setCurrentVideo(video);
    setIsPlayerVisible(true);
  };

  // 下载录像
  const downloadVideo = async (video) => {
    try {
      setDownloadProgress(prev => ({ ...prev, [video.id]: 0 }));
      
      // 模拟下载进度
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setDownloadProgress(prev => ({ ...prev, [video.id]: i }));
      }
      
      // 模拟下载完成
      const link = document.createElement('a');
      link.href = '#'; // 这里应该是实际的下载URL
      link.download = video.filename;
      link.click();
      
      message.success(`${video.filename} 下载完成`);
      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[video.id];
        return newProgress;
      });
    } catch (error) {
      message.error('下载失败');
      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[video.id];
        return newProgress;
      });
    }
  };

  // 删除录像
  const deleteVideo = async (video) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除录像文件 "${video.filename}" 吗？此操作不可恢复。`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 模拟删除API调用
          await new Promise(resolve => setTimeout(resolve, 500));
          
          setVideoList(prev => prev.filter(item => item.id !== video.id));
          message.success('录像删除成功');
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  // 批量删除
  const batchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的录像');
      return;
    }
    
    Modal.confirm({
      title: '批量删除确认',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个录像文件吗？此操作不可恢复。`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 模拟批量删除API调用
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          setVideoList(prev => prev.filter(item => !selectedRowKeys.includes(item.id)));
          setSelectedRowKeys([]);
          message.success(`成功删除 ${selectedRowKeys.length} 个录像文件`);
        } catch (error) {
          message.error('批量删除失败');
        }
      }
    });
  };

  // 搜索
  const handleSearch = () => {
    fetchVideoList();
  };

  // 重置搜索
  const handleReset = () => {
    setSearchParams({
      dateRange: [moment().subtract(7, 'days'), moment()],
      recordType: undefined,
      keyword: ''
    });
  };

  // 表格列定义
  const columns = [
    {
      title: '缩略图',
      dataIndex: 'thumbnailUrl',
      key: 'thumbnail',
      width: 100,
      render: (url, record) => (
        <div className={styles.thumbnail}>
          <img src={url} alt="缩略图" />
          <div className={styles.duration}>{formatDuration(record.duration)}</div>
        </div>
      )
    },
    {
      title: '文件名',
      dataIndex: 'filename',
      key: 'filename',
      ellipsis: true
    },
    {
      title: '录制时间',
      key: 'recordTime',
      width: 180,
      render: (_, record) => (
        <div>
          <div>{record.startTime}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>至 {record.endTime}</div>
        </div>
      )
    },
    {
      title: '录制类型',
      dataIndex: 'recordType',
      key: 'recordType',
      width: 120,
      render: (type, record) => {
        const typeMap = {
          scheduled: { color: 'blue', text: '定时录制', icon: '⏰' },
          motion: { color: 'orange', text: '移动侦测', icon: '🏃' },
          alarm: { color: 'red', text: '报警录制', icon: '🚨' }
        };
        const config = typeMap[type] || { color: 'default', text: type, icon: '📹' };
        return (
          <div>
            <Tag color={config.color}>
              {config.icon} {config.text}
            </Tag>
            {record.description && (
              <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                {record.description}
              </div>
            )}
          </div>
        );
      }
    },
    {
      title: '画质',
      dataIndex: 'quality',
      key: 'quality',
      width: 80
    },
    {
      title: '文件大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      width: 100,
      render: (size) => formatFileSize(size)
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          completed: { color: 'green', text: '已完成' },
          recording: { color: 'blue', text: '录制中' },
          error: { color: 'red', text: '错误' }
        };
        const config = statusMap[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="播放">
            <Button
              type="primary"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => playVideo(record)}
              disabled={record.status !== 'completed'}
            />
          </Tooltip>
          
          <Tooltip title="下载">
            {downloadProgress[record.id] !== undefined ? (
              <div style={{ width: 60 }}>
                <Progress
                  percent={downloadProgress[record.id]}
                  size="small"
                  status={downloadProgress[record.id] === 100 ? 'success' : 'active'}
                />
              </div>
            ) : (
              <Button
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => downloadVideo(record)}
                disabled={record.status !== 'completed'}
              />
            )}
          </Tooltip>
          
          <Tooltip title="删除">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => deleteVideo(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    getCheckboxProps: (record) => ({
      disabled: record.status === 'recording'
    })
  };

  useEffect(() => {
    fetchVideoList();
  }, []);

  return (
    <div className={styles.recordedVideoManager}>
      {/* 搜索区域 */}
      <Card size="small" className={styles.searchCard}>
        <Row gutter={16}>
          <Col span={8}>
            <RangePicker
              value={searchParams.dateRange}
              onChange={(dates) => setSearchParams(prev => ({ ...prev, dateRange: dates }))}
              style={{ width: '100%' }}
              placeholder={['开始日期', '结束日期']}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="请选择录制类型"
              value={searchParams.recordType}
              onChange={(value) => setSearchParams(prev => ({ ...prev, recordType: value }))}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="scheduled">定时录制</Option>
              <Option value="motion">移动侦测</Option>
              <Option value="alarm">报警录制</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Search
              placeholder="搜索文件名"
              value={searchParams.keyword}
              onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
              onSearch={handleSearch}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 操作栏 */}
      <Card size="small" className={styles.actionCard}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={batchDelete}
                disabled={selectedRowKeys.length === 0}
              >
                批量删除 ({selectedRowKeys.length})
              </Button>
            </Space>
          </Col>
          <Col>
            <Space split={<Divider type="vertical" />}>
              <span style={{ color: '#666' }}>
                共 {videoList.length} 个录像文件
              </span>
              <span style={{ color: '#666' }}>
                总大小 {formatFileSize(videoList.reduce((sum, video) => sum + video.fileSize, 0))}
              </span>
              <span style={{ color: '#666' }}>
                总时长 {formatDuration(videoList.reduce((sum, video) => sum + video.duration, 0))}
              </span>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 录像列表 */}
      <Card className={styles.tableCard}>
        <Table
          columns={columns}
          dataSource={videoList}
          rowKey="id"
          loading={loading}
          rowSelection={rowSelection}
          pagination={{
            total: videoList.length,
            pageSize: 15,
            pageSizeOptions: ['10', '15', '20', '50'],
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条录像文件`
          }}
        />
      </Card>

      {/* 视频播放器模态框 */}
      <Modal
        title={`播放录像 - ${currentVideo?.filename}`}
        open={isPlayerVisible}
        onCancel={() => setIsPlayerVisible(false)}
        width={800}
        footer={null}
        destroyOnClose
      >
        {currentVideo && (
          <div className={styles.videoPlayer}>
            <video
              controls
              width="100%"
              height="400"
              poster={currentVideo.thumbnailUrl}
            >
              <source src="#" type="video/mp4" />
              您的浏览器不支持视频播放
            </video>
            <div className={styles.videoInfo}>
              <Row gutter={16}>
                <Col span={12}>
                  <div><strong>录制时间：</strong>{currentVideo.startTime} - {currentVideo.endTime}</div>
                  <div><strong>时长：</strong>{formatDuration(currentVideo.duration)}</div>
                </Col>
                <Col span={12}>
                  <div><strong>文件大小：</strong>{formatFileSize(currentVideo.fileSize)}</div>
                  <div><strong>画质：</strong>{currentVideo.quality}</div>
                </Col>
              </Row>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RecordedVideoManager;
