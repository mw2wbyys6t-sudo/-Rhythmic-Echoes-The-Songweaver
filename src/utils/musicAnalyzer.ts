class MusicAnalyzer {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private dataArray: Uint8Array;
  private beatHistory: number[] = [];
  private beatThreshold: number = 0.3;
  private beatDebounce: number = 0;
  
  constructor() {
    this.audioContext = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);
  }
  
  async loadAudio(url: string): Promise<HTMLAudioElement> {
    const audio = new Audio();
    audio.src = url;
    audio.crossOrigin = 'anonymous';
    
    await new Promise((resolve) => {
      audio.addEventListener('canplay', resolve);
    });
    
    const source = this.audioContext.createMediaElementSource(audio);
    source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
    
    return audio;
  }
  
  getFrequencyData(): Uint8Array {
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }
  
  getTimeDomainData(): Uint8Array {
    this.analyser.getByteTimeDomainData(this.dataArray);
    return this.dataArray;
  }
  
  // 获取音频能量
  getAudioEnergy(): number {
    const data = this.getFrequencyData();
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i];
    }
    return sum / data.length / 255;
  }
  
  // 检测节拍（改进版）
  detectBeat(): boolean {
    const energy = this.getAudioEnergy();
    
    // 简单的节拍检测
    if (energy > this.beatThreshold && Date.now() - this.beatDebounce > 200) {
      this.beatDebounce = Date.now();
      this.beatHistory.push(energy);
      if (this.beatHistory.length > 10) {
        this.beatHistory.shift();
      }
      return true;
    }
    
    // 自适应阈值
    if (this.beatHistory.length > 0) {
      const avg = this.beatHistory.reduce((a, b) => a + b, 0) / this.beatHistory.length;
      this.beatThreshold = avg * 1.5;
    }
    
    return false;
  }
  
  // 分析音乐节奏
  analyzeRhythm(audio: HTMLAudioElement): Promise<number[]> {
    return new Promise((resolve) => {
      const rhythmPoints: number[] = [];
      const interval = setInterval(() => {
        if (audio.paused) return;
        
        if (this.detectBeat()) {
          rhythmPoints.push(audio.currentTime);
        }
      }, 50);
      
      audio.addEventListener('ended', () => {
        clearInterval(interval);
        resolve(rhythmPoints);
      });
    });
  }
  
  // 获取当前音乐强度级别
  getIntensityLevel(): number {
    const energy = this.getAudioEnergy();
    if (energy < 0.1) return 0; // 安静
    if (energy < 0.3) return 1; // 低
    if (energy < 0.5) return 2; // 中
    if (energy < 0.7) return 3; // 高
    return 4; // 极高
  }
  
  // 生成基于音乐的敌人生成率
  getEnemySpawnRate(): number {
    const intensity = this.getIntensityLevel();
    const baseRate = 0.01;
    return baseRate * (1 + intensity * 0.5);
  }
  
  // 生成基于音乐的敌人属性
  getEnemyAttributes(): { speed: number, damage: number, health: number } {
    const intensity = this.getIntensityLevel();
    return {
      speed: 1 + intensity * 0.2,
      damage: 10 + intensity * 5,
      health: 50 + intensity * 30
    };
  }
}

export const musicAnalyzer = new MusicAnalyzer();
