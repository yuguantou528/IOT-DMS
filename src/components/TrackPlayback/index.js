import React, { useState, useEffect, useRef } from 'react';
import { Button, Slider, Select, Space, Tooltip } from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  FastForwardOutlined,
  FastBackwardOutlined
} from '@ant-design/icons';
import styles from './index.module.css';

const { Option } = Select;

// 自定义停止图标组件
const StopIcon = ({ style = {} }) => (
  <svg
    viewBox="0 0 1024 1024"
    width="1em"
    height="1em"
    fill="currentColor"
    style={style}
  >
    <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"/>
    <path d="M464 336h96c4.4 0 8 3.6 8 8v336c0 4.4-3.6 8-8 8h-96c-4.4 0-8-3.6-8-8V344c0-4.4 3.6-8 8-8z"/>
  </svg>
);

const TrackPlayback = ({
  trackData = [],
  onPlaybackChange,
  onCurrentPointChange,
  visible = false,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playSpeed, setPlaySpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  // 播放速度选项
  const speedOptions = [
    { value: 0.5, label: '0.5x' },
    { value: 1, label: '1x' },
    { value: 2, label: '2x' },
    { value: 4, label: '4x' },
    { value: 8, label: '8x' }
  ];

  // 计算播放间隔时间（毫秒）
  const getPlayInterval = () => {
    const baseInterval = 1000; // 基础间隔1秒
    return baseInterval / playSpeed;
  };

  // 开始播放
  const startPlayback = () => {
    if (trackData.length === 0) return;
    
    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= trackData.length) {
          // 播放完成，停止播放
          stopPlayback();
          return prevIndex;
        }
        
        // 更新进度
        const newProgress = (nextIndex / (trackData.length - 1)) * 100;
        setProgress(newProgress);
        
        // 通知父组件当前播放点
        if (onCurrentPointChange) {
          onCurrentPointChange(trackData[nextIndex], nextIndex);
        }
        
        return nextIndex;
      });
    }, getPlayInterval());
  };

  // 暂停播放
  const pausePlayback = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // 停止播放
  const stopPlayback = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
    setProgress(0);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // 通知父组件回到起始点
    if (onCurrentPointChange && trackData.length > 0) {
      onCurrentPointChange(trackData[0], 0);
    }
  };

  // 播放/暂停切换
  const togglePlayback = () => {
    if (isPlaying) {
      pausePlayback();
    } else {
      startPlayback();
    }
  };

  // 快进
  const fastForward = () => {
    if (currentIndex < trackData.length - 1) {
      const newIndex = Math.min(currentIndex + 5, trackData.length - 1);
      setCurrentIndex(newIndex);
      const newProgress = (newIndex / (trackData.length - 1)) * 100;
      setProgress(newProgress);
      
      if (onCurrentPointChange) {
        onCurrentPointChange(trackData[newIndex], newIndex);
      }
    }
  };

  // 快退
  const fastBackward = () => {
    if (currentIndex > 0) {
      const newIndex = Math.max(currentIndex - 5, 0);
      setCurrentIndex(newIndex);
      const newProgress = (newIndex / (trackData.length - 1)) * 100;
      setProgress(newProgress);
      
      if (onCurrentPointChange) {
        onCurrentPointChange(trackData[newIndex], newIndex);
      }
    }
  };

  // 进度条拖拽
  const handleProgressChange = (value) => {
    const newIndex = Math.round((value / 100) * (trackData.length - 1));
    setCurrentIndex(newIndex);
    setProgress(value);
    
    if (onCurrentPointChange) {
      onCurrentPointChange(trackData[newIndex], newIndex);
    }
  };

  // 速度变化
  const handleSpeedChange = (speed) => {
    setPlaySpeed(speed);
    
    // 如果正在播放，重新启动以应用新速度
    if (isPlaying) {
      pausePlayback();
      setTimeout(() => {
        startPlayback();
      }, 100);
    }
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 当轨迹数据变化时重置播放状态
  useEffect(() => {
    stopPlayback();
  }, [trackData]);

  // 通知父组件播放状态变化
  useEffect(() => {
    if (onPlaybackChange) {
      onPlaybackChange({
        isPlaying,
        currentIndex,
        progress,
        playSpeed
      });
    }
  }, [isPlaying, currentIndex, progress, playSpeed, onPlaybackChange]);

  if (!visible || trackData.length === 0) {
    return null;
  }

  const currentPoint = trackData[currentIndex];

  return (
    <div className={`${styles.trackPlayback} ${className}`}>
      <div className={styles.playbackPanel}>
        {/* 播放控制按钮 */}
        <div className={styles.controlButtons}>
          <Space size={8}>
            <Tooltip title="快退">
              <Button
                type="text"
                icon={<FastBackwardOutlined />}
                onClick={fastBackward}
                disabled={currentIndex === 0}
                className={styles.controlBtn}
              />
            </Tooltip>
            
            <Tooltip title={isPlaying ? "暂停" : "播放"}>
              <Button
                type="primary"
                icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={togglePlayback}
                className={styles.playBtn}
              />
            </Tooltip>
            
            <Tooltip title="停止">
              <Button
                type="text"
                icon={<StopIcon />}
                onClick={stopPlayback}
                className={styles.stopBtn}
              />
            </Tooltip>
            
            <Tooltip title="快进">
              <Button
                type="text"
                icon={<FastForwardOutlined />}
                onClick={fastForward}
                disabled={currentIndex === trackData.length - 1}
                className={styles.controlBtn}
              />
            </Tooltip>
          </Space>
        </div>

        {/* 进度条 */}
        <div className={styles.progressSection}>
          <div className={styles.progressInfo}>
            <div className={styles.progressLeft}>
              <span className={styles.progressText}>
                {currentIndex + 1} / {trackData.length}
              </span>
            </div>
            <div className={styles.progressRight}>
              {currentPoint && (
                <span className={styles.currentTime}>
                  {new Date(currentPoint.timestamp).toLocaleString('zh-CN', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </span>
              )}
            </div>
          </div>
          <Slider
            value={progress}
            onChange={handleProgressChange}
            className={styles.progressSlider}
            tooltip={{
              formatter: (value) => `${Math.round(value)}%`
            }}
          />
        </div>

        {/* 播放速度控制 */}
        <div className={styles.speedControl}>
          <span className={styles.speedLabel}>速度:</span>
          <Select
            value={playSpeed}
            onChange={handleSpeedChange}
            size="small"
            className={styles.speedSelect}
          >
            {speedOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      {/* 当前播放信息 */}
      {currentPoint && (
        <div className={styles.currentInfo}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>时间:</span>
            <span className={styles.infoValue}>
              {new Date(currentPoint.timestamp).toLocaleString()}
            </span>
          </div>
          {currentPoint.speed && (
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>速度:</span>
              <span className={styles.infoValue}>
                {currentPoint.speed.toFixed(1)} km/h
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrackPlayback;
