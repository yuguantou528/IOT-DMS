import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Space,
  Typography,
  Badge,
  Progress,
  message,
  Divider
} from 'antd';
import {
  PhoneOutlined,
  SoundOutlined,
  MutedOutlined,
  CloseOutlined,
  MinusOutlined
} from '@ant-design/icons';
import { initiateCall, answerCall, endCall, getDeviceAudioStatus } from '../../services/audioDispatchService';
import styles from './index.module.css';

const { Title, Text } = Typography;

const AudioCallModal = ({
  visible,
  onCancel,
  device,
  onCallStatusChange,
  isMinimized = false,
  onMinimize,
  onRestore
}) => {
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, talking, ended
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [signalStrength, setSignalStrength] = useState(0);
  const [currentCallId, setCurrentCallId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [wasMinimized, setWasMinimized] = useState(false); // 追踪是否曾经被最小化

  // 计时器
  useEffect(() => {
    let timer;
    if (callStatus === 'talking') {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [callStatus]);

  // 同步状态变化到父组件
  useEffect(() => {
    if (onCallStatusChange && callStatus !== 'idle') {
      onCallStatusChange(callStatus, {
        callId: currentCallId,
        duration: callDuration
      });
    }
  }, [callStatus, callDuration, currentCallId, onCallStatusChange]);

  // 获取设备音频状态
  useEffect(() => {
    if (visible && device) {
      fetchDeviceAudioStatus();
    }
  }, [visible, device]);

  // 监听最小化状态变化
  useEffect(() => {
    if (isMinimized) {
      setWasMinimized(true);
    }
  }, [isMinimized]);

  // 监听弹窗打开状态，只在全新会话时重置组件状态
  useEffect(() => {
    if (visible && !isMinimized) {
      // 只有在全新打开（不是从最小化恢复）时才重置状态
      if (!wasMinimized) {
        setCallStatus('idle');
        setCallDuration(0);
        setIsMuted(false);
        setCurrentCallId(null);
        setLoading(false);
      }
      // 如果是从最小化恢复，不重置状态，保持当前通话状态
    }
  }, [visible, isMinimized, wasMinimized]);

  // 监听弹窗完全关闭，清理所有状态
  useEffect(() => {
    if (!visible) {
      // 只有在弹窗完全关闭时才重置状态和最小化标记
      setCallStatus('idle');
      setCallDuration(0);
      setIsMuted(false);
      setCurrentCallId(null);
      setLoading(false);
      setWasMinimized(false); // 重置最小化标记
    }
  }, [visible]);

  const fetchDeviceAudioStatus = async () => {
    try {
      const deviceId = device.deviceId || device.id.toString();
      const response = await getDeviceAudioStatus(deviceId);
      if (response.success) {
        setSignalStrength(response.data.signalStrength);
      }
    } catch (error) {
      console.error('获取设备音频状态失败:', error);
      // 设置默认信号强度用于演示
      setSignalStrength(85);
    }
  };

  // 发起呼叫
  const handleInitiateCall = async () => {
    if (!device) return;

    setLoading(true);
    try {
      const deviceId = device.deviceId || device.id.toString();
      console.log('发起呼叫，设备ID:', deviceId, '设备信息:', device);
      const response = await initiateCall(deviceId, 'single');
      
      if (response.success) {
        setCallStatus('calling');
        setCurrentCallId(response.data.callId);
        message.success('正在呼叫中...');
        
        // 模拟对方接听
        setTimeout(() => {
          handleAnswerCall(response.data.callId);
        }, 3000 + Math.random() * 2000); // 3-5秒后自动接听
        
        if (onCallStatusChange) {
          onCallStatusChange('calling', response.data);
        }
      }
    } catch (error) {
      message.error(error.message || '呼叫发起失败');
    } finally {
      setLoading(false);
    }
  };

  // 接听呼叫
  const handleAnswerCall = async (callId) => {
    try {
      const response = await answerCall(callId);
      if (response.success) {
        setCallStatus('talking');
        setCallDuration(0);
        message.success('通话已接通');
        
        if (onCallStatusChange) {
          onCallStatusChange('talking', { callId });
        }
      }
    } catch (error) {
      message.error('接听失败');
    }
  };

  // 结束呼叫
  const handleEndCall = async () => {
    if (!currentCallId) return;
    
    setLoading(true);
    try {
      const response = await endCall(currentCallId);
      if (response.success) {
        setCallStatus('ended');
        message.success('通话已结束');
        
        if (onCallStatusChange) {
          onCallStatusChange('ended', { callId: currentCallId, duration: callDuration });
        }
        
        // 2秒后关闭弹窗并重置状态
        setTimeout(() => {
          // 先重置状态再关闭
          setCallStatus('idle');
          setCallDuration(0);
          setIsMuted(false);
          setCurrentCallId(null);
          onCancel();
        }, 2000);
      }
    } catch (error) {
      message.error('结束通话失败');
    } finally {
      setLoading(false);
    }
  };

  // 切换静音
  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    message.info(isMuted ? '已取消静音' : '已静音');
  };

  // 关闭弹窗
  const handleClose = () => {
    // 如果正在通话中，先结束通话
    if (callStatus === 'talking' || callStatus === 'calling') {
      handleEndCall();
      return;
    }

    // 立即重置所有状态
    setCallStatus('idle');
    setCallDuration(0);
    setIsMuted(false);
    setCurrentCallId(null);
    setLoading(false);
    onCancel();
  };

  // 格式化通话时长
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 渲染信号强度指示器
  const renderSignalBars = (strength) => {
    const bars = [];
    for (let i = 1; i <= 4; i++) {
      bars.push(
        <div
          key={i}
          className={`${styles.signalBar} ${strength >= i * 25 ? styles.active : ''}`}
        />
      );
    }
    return <div className={styles.signalBars}>{bars}</div>;
  };

  // 获取状态文本
  const getStatusText = () => {
    switch (callStatus) {
      case 'calling':
        return '呼叫中...';
      case 'talking':
        return '通话中';
      case 'ended':
        return '通话已结束';
      default:
        return '准备呼叫';
    }
  };

  if (!device) return null;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PhoneOutlined />
            <span>语音呼叫</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button
              type="text"
              size="small"
              icon={<MinusOutlined />}
              onClick={onMinimize}
              className={styles.minimizeBtn}
              title="最小化"
            />
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={handleClose}
              className={styles.closeBtn}
              title="关闭"
            />
          </div>
        </div>
      }
      open={visible && !isMinimized}
      onCancel={handleClose}
      footer={null}
      width={400}
      className={styles.audioCallModal}
      maskClosable={false}
      closeIcon={false}
    >
      <div className={styles.callContent}>
        {/* 设备信息 */}
        <div className={styles.deviceInfo}>
          <div className={styles.deviceIcon}>
            📷
          </div>
          <div className={styles.deviceDetails}>
            <Title level={4} style={{ margin: 0, color: '#ffffff' }}>
              {device.name}
            </Title>
            <Space direction="vertical" size="small">
              <Badge
                status={device.status === 'online' ? 'success' : 'error'}
                text={
                  <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    {device.status === 'online' ? '在线' : '离线'}
                  </span>
                }
              />
              <div className={styles.signalStrength}>
                {renderSignalBars(signalStrength)}
                <span>信号强度 {signalStrength}%</span>
              </div>
            </Space>
          </div>
        </div>

        <Divider />

        {/* 通话状态 */}
        <div className={styles.callStatus}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {(callStatus === 'calling' || callStatus === 'talking') && (
                <div className={`${styles.statusIndicator} ${styles[callStatus]}`}></div>
              )}
              <Text style={{ fontSize: '18px', color: '#ffffff', fontWeight: 500 }}>
                {getStatusText()}
              </Text>
            </div>
          </div>

          {/* 通话时长 */}
          {callStatus === 'talking' && (
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div className={styles.durationDisplay}>
                {formatDuration(callDuration)}
              </div>
            </div>
          )}

          {/* 呼叫进度 */}
          {callStatus === 'calling' && (
            <div style={{ marginBottom: '16px' }}>
              <Progress 
                percent={100} 
                status="active" 
                showInfo={false}
                strokeColor="#1890ff"
              />
            </div>
          )}
        </div>

        {/* 控制按钮 */}
        <div className={styles.callControls}>
          {callStatus === 'idle' && (
            <Button
              type="primary"
              shape="circle"
              size="large"
              icon={<PhoneOutlined />}
              onClick={handleInitiateCall}
              loading={loading}
              disabled={device.status !== 'online'}
              className={styles.callButton}
            />
          )}

          {(callStatus === 'calling' || callStatus === 'talking') && (
            <>
              {callStatus === 'talking' && (
                <Button
                  type={isMuted ? 'primary' : 'default'}
                  shape="circle"
                  size="large"
                  icon={isMuted ? <MutedOutlined /> : <SoundOutlined />}
                  onClick={handleToggleMute}
                  className={styles.muteButton}
                />
              )}

              <Button
                type="primary"
                danger
                shape="circle"
                size="large"
                icon={<CloseOutlined />}
                onClick={handleEndCall}
                loading={loading}
                className={styles.endCallButton}
              />
            </>
          )}
        </div>

        {/* 提示信息 */}
        <div className={styles.callTips}>
          {callStatus === 'idle' && device.status !== 'online' && (
            <div>设备离线，无法发起呼叫</div>
          )}
          {callStatus === 'calling' && (
            <div>正在等待对方接听...</div>
          )}
          {callStatus === 'talking' && (
            <div>通话质量良好 · 加密通信</div>
          )}
          {callStatus === 'ended' && (
            <div>通话已结束</div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AudioCallModal;
