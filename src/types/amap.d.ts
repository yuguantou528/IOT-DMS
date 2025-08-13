// 高德地图API类型声明
declare global {
  interface Window {
    AMap: any;
    openVideo?: (deviceId: number) => void;
    viewDeviceDetail?: (deviceId: number) => void;
    handleAlarm?: (alarmId: number) => void;
  }
}

export {};
