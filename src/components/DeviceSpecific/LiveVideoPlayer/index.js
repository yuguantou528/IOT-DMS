import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Button,
  Space,
  Row,
  Col,
  Select,
  Slider,
  message,
  Spin,
  Alert,
  Tooltip,
  Switch
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  SoundOutlined,
  MutedOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  CameraOutlined,
  VideoCameraOutlined,
  ReloadOutlined,
  SettingOutlined
} from '@ant-design/icons';
import styles from './index.module.css';

const { Option } = Select;

const LiveVideoPlayer = ({ device }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoQuality, setVideoQuality] = useState('720p');
  const [isRecording, setIsRecording] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState(null);

  // 模拟视频流URL
  const getVideoStreamUrl = (quality) => {
    // 这里应该根据设备信息和质量参数生成实际的视频流URL
    return `rtmp://${device.ipAddress}:${device.port}/live/stream_${quality}`;
  };

  // 连接视频流
  const connectVideoStream = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 模拟连接延迟
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 模拟连接成功/失败
      const isSuccess = Math.random() > 0.2; // 80% 成功率

      if (isSuccess) {
        setConnectionStatus('connected');
        setIsPlaying(true);
        message.success(`视频流连接成功 - ${videoQuality}`);
      } else {
        throw new Error('连接失败');
      }
    } catch (error) {
      setConnectionStatus('error');
      setError(`无法连接到视频流，请检查设备状态和网络连接。设备IP: ${device.ipAddress}:${device.port}`);
      message.error('视频流连接失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 断开视频流
  const disconnectVideoStream = () => {
    setIsPlaying(false);
    setConnectionStatus('disconnected');
    setError(null);
    message.info('已断开视频流连接');
  };

  // 播放/暂停
  const togglePlay = () => {
    if (connectionStatus !== 'connected') {
      connectVideoStream();
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // 音量控制
  const handleVolumeChange = (value) => {
    setVolume(value);
    if (videoRef.current) {
      videoRef.current.volume = value / 100;
    }
  };

  // 静音切换
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  // 全屏切换
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (videoRef.current?.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  // 截图
  const takeScreenshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0);
      
      // 下载截图
      const link = document.createElement('a');
      link.download = `screenshot_${device.name}_${new Date().getTime()}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      message.success('截图已保存');
    }
  };

  // 开始/停止录制
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      message.success('开始录制视频');
    } else {
      message.success('录制已停止，视频已保存');
    }
  };

  // 切换视频质量
  const handleQualityChange = (quality) => {
    setVideoQuality(quality);
    if (connectionStatus === 'connected') {
      message.info(`正在切换到${quality}画质...`);
      // 这里应该重新连接新质量的视频流
    }
  };

  // 云台控制
  const handlePTZControl = (direction) => {
    if (connectionStatus !== 'connected') {
      message.warning('请先连接视频流');
      return;
    }

    message.info(`云台${direction}控制指令已发送`);
    // 这里应该发送实际的PTZ控制指令到设备
  };

  // 变焦控制
  const handleZoomControl = (type) => {
    if (connectionStatus !== 'connected') {
      message.warning('请先连接视频流');
      return;
    }

    message.info(`变焦${type}控制指令已发送`);
    // 这里应该发送实际的变焦控制指令到设备
  };

  useEffect(() => {
    // 组件卸载时断开连接
    return () => {
      if (connectionStatus === 'connected') {
        disconnectVideoStream();
      }
    };
  }, []);

  return (
    <div className={styles.liveVideoPlayer}>
      <Row gutter={16}>
        <Col span={18}>
          <Card 
            title={`实时视频 - ${device.name}`}
            className={styles.videoCard}
            extra={
              <Space>
                <Select
                  value={videoQuality}
                  onChange={handleQualityChange}
                  style={{ width: 80 }}
                  size="small"
                >
                  <Option value="1080p">1080P</Option>
                  <Option value="720p">720P</Option>
                  <Option value="480p">480P</Option>
                  <Option value="360p">360P</Option>
                </Select>
                <Button
                  icon={<ReloadOutlined />}
                  size="small"
                  onClick={connectVideoStream}
                  loading={isLoading}
                >
                  重连
                </Button>
              </Space>
            }
          >
            <div className={styles.videoContainer}>
              {error && (
                <Alert
                  message="视频流连接错误"
                  description={error}
                  type="error"
                  showIcon
                  style={{ marginBottom: 16 }}
                  action={
                    <Button size="small" onClick={connectVideoStream}>
                      重试连接
                    </Button>
                  }
                />
              )}
              
              <div className={styles.videoWrapper}>
                {isLoading && (
                  <div className={styles.loadingOverlay}>
                    <Spin size="large" />
                    <div style={{ marginTop: 16, color: '#666' }}>
                      正在连接视频流...
                    </div>
                  </div>
                )}
                
                <video
                  ref={videoRef}
                  className={styles.videoElement}
                  poster="/api/placeholder/640/360"
                  controls={false}
                  muted={isMuted}
                  volume={volume / 100}
                >
                  {connectionStatus === 'connected' && (
                    <source src={getVideoStreamUrl(videoQuality)} type="application/x-mpegURL" />
                  )}
                  您的浏览器不支持视频播放
                </video>
                
                {connectionStatus === 'disconnected' && !isLoading && (
                  <div className={styles.placeholderOverlay}>
                    <VideoCameraOutlined style={{ fontSize: 48, color: '#ccc' }} />
                    <div style={{ marginTop: 16, color: '#666' }}>
                      点击播放按钮开始观看实时视频
                    </div>
                  </div>
                )}
              </div>
              
              {/* 视频控制栏 */}
              <div className={styles.controlBar}>
                <Space>
                  <Button
                    type="primary"
                    icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                    onClick={togglePlay}
                    loading={isLoading}
                  >
                    {isPlaying ? '暂停' : '播放'}
                  </Button>
                  
                  <Button
                    icon={isMuted ? <MutedOutlined /> : <SoundOutlined />}
                    onClick={toggleMute}
                  />
                  
                  <div style={{ width: 100 }}>
                    <Slider
                      min={0}
                      max={100}
                      value={volume}
                      onChange={handleVolumeChange}
                      tooltip={{ formatter: (value) => `${value}%` }}
                    />
                  </div>
                  
                  <Tooltip title="截图">
                    <Button
                      icon={<CameraOutlined />}
                      onClick={takeScreenshot}
                      disabled={connectionStatus !== 'connected'}
                    />
                  </Tooltip>
                  
                  <Tooltip title={isRecording ? '停止录制' : '开始录制'}>
                    <Button
                      icon={<VideoCameraOutlined />}
                      onClick={toggleRecording}
                      disabled={connectionStatus !== 'connected'}
                      danger={isRecording}
                    >
                      {isRecording ? '录制中' : '录制'}
                    </Button>
                  </Tooltip>
                  
                  <Button
                    icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                    onClick={toggleFullscreen}
                    disabled={connectionStatus !== 'connected'}
                  />
                </Space>
              </div>
            </div>
          </Card>
        </Col>
        
        <Col span={6}>
          <Card title="设备信息" size="small">
            <div className={styles.deviceInfo}>
              <div className={styles.infoItem}>
                <span className={styles.label}>设备名称：</span>
                <span>{device.name}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>IP地址：</span>
                <span>{device.ipAddress}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>端口：</span>
                <span>{device.port}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>连接状态：</span>
                <span className={connectionStatus === 'connected' ? styles.connected : styles.disconnected}>
                  {connectionStatus === 'connected' ? '已连接' : 
                   connectionStatus === 'error' ? '连接错误' : '未连接'}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>视频质量：</span>
                <span>{videoQuality}</span>
              </div>
              {isRecording && (
                <div className={styles.infoItem}>
                  <span className={styles.label}>录制状态：</span>
                  <span className={styles.recording}>● 录制中</span>
                </div>
              )}
            </div>
          </Card>
          
          <Card title="云台控制" size="small" style={{ marginTop: 16 }}>
            <div className={styles.ptzControl}>
              <div className={styles.directionControl}>
                <div className={styles.controlRow}>
                  <Button size="small" onClick={() => handlePTZControl('左上')}>↖</Button>
                  <Button size="small" onClick={() => handlePTZControl('上')}>↑</Button>
                  <Button size="small" onClick={() => handlePTZControl('右上')}>↗</Button>
                </div>
                <div className={styles.controlRow}>
                  <Button size="small" onClick={() => handlePTZControl('左')}>←</Button>
                  <Button size="small" onClick={() => handlePTZControl('停止')}>●</Button>
                  <Button size="small" onClick={() => handlePTZControl('右')}>→</Button>
                </div>
                <div className={styles.controlRow}>
                  <Button size="small" onClick={() => handlePTZControl('左下')}>↙</Button>
                  <Button size="small" onClick={() => handlePTZControl('下')}>↓</Button>
                  <Button size="small" onClick={() => handlePTZControl('右下')}>↘</Button>
                </div>
              </div>

              <div className={styles.zoomControl}>
                <div className={styles.controlItem}>
                  <span>变焦：</span>
                  <Button.Group size="small">
                    <Button onClick={() => handleZoomControl('放大')}>+</Button>
                    <Button onClick={() => handleZoomControl('缩小')}>-</Button>
                  </Button.Group>
                </div>
                <div className={styles.controlItem}>
                  <span>聚焦：</span>
                  <Button.Group size="small">
                    <Button onClick={() => handleZoomControl('聚焦近')}>近</Button>
                    <Button onClick={() => handleZoomControl('聚焦远')}>远</Button>
                  </Button.Group>
                </div>
                <div className={styles.controlItem}>
                  <span>光圈：</span>
                  <Button.Group size="small">
                    <Button onClick={() => handleZoomControl('光圈大')}>+</Button>
                    <Button onClick={() => handleZoomControl('光圈小')}>-</Button>
                  </Button.Group>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LiveVideoPlayer;
