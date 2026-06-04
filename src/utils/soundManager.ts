// Enhanced Sound management system - Macross style
// Inspired by Macross's music as a weapon concept

// Voice lines for different languages and voice types - Macross style
const voiceLines = {
  zh: {
    loli: [
      "加油！你可以的！",
      "哇，好厉害！",
      "连击！连击！",
      "太棒了！",
      "小心背后！",
      "冲鸭！",
      "耶，我做到了！",
      "音乐就是力量！",
      "唱歌吧！战斗吧！",
      "不要放弃！",
      "为了希望而战！",
      "让歌声响彻战场！",
      "守护大家的笑容！",
      "我们的歌声会改变世界！"
    ],
    大叔: [
      "哈！干得漂亮！",
      "小子，不错嘛！",
      "继续保持！",
      "这才叫战斗！",
      "小心点，菜鸟！",
      "让他们尝尝厉害！",
      "痛快！",
      "音乐就是我们的武器！",
      "跟上节奏！",
      "让我们一起摇滚吧！",
      "战斗吧！歌姬！",
      "这就是我们的战斗！",
      "为了和平而战！",
      "用音乐拯救世界！"
    ],
    御姐: [
      "干得不错，亲爱的！",
      "继续，不要停！",
      "漂亮的连击！",
      "姐姐看好你！",
      "小心点，宝贝！",
      "加油，别让我失望！",
      "完美！",
      "音乐是灵魂的共鸣！",
      "让我们用歌声守护！",
      "勇敢前进！",
      "你是最棒的歌手！",
      "用你的歌声感动世界！",
      "相信音乐的力量！",
      "我们的歌声永不停止！"
    ],
    正太: [
      "看我的厉害！",
      "我是最棒的！",
      "连击数好高啊！",
      "耶！胜利！",
      "小心僵尸！",
      "冲啊！",
      "我做到了！",
      "音乐超酷！",
      "一起唱歌吧！",
      "战斗！战斗！",
      "用音乐打败他们！",
      "我也要成为歌手！",
      "歌声给我力量！",
      "让我们的歌声传遍宇宙！"
    ]
  },
  en: {
    loli: [
      "Go go go!",
      "Wow, amazing!",
      "Combo! Combo!",
      "Great job!",
      "Watch your back!",
      "Let's go!",
      "I did it!",
      "Music is power!",
      "Sing! Fight!",
      "Don't give up!",
      "Fight for hope!",
      "Let our song echo through the battlefield!",
      "Protect everyone's smile!",
      "Our song will change the world!"
    ],
    大叔: [
      "Ha! Nice one!",
      "Not bad, kid!",
      "Keep it up!",
      "Now that's a fight!",
      "Watch it, rookie!",
      "Show them who's boss!",
      "Satisfying!",
      "Music is our weapon!",
      "Feel the rhythm!",
      "Let's rock together!",
      "Fight! Diva!",
      "This is our battle!",
      "Fight for peace!",
      "Save the world with music!"
    ],
    御姐: [
      "Good job, honey!",
      "Keep going, don't stop!",
      "Beautiful combo!",
      "Sister is watching you!",
      "Be careful, baby!",
      "Come on, don't disappoint me!",
      "Perfect!",
      "Music is the resonance of souls!",
      "Let's protect with our song!",
      "Brave forward!",
      "You're the best singer!",
      "Touch the world with your voice!",
      "Believe in the power of music!",
      "Our song never stops!"
    ],
    正太: [
      "Watch me!",
      "I'm the best!",
      "High combo!",
      "Yay! Victory!",
      "Watch out for zombies!",
      "Charge!",
      "I did it!",
      "Music is awesome!",
      "Let's sing together!",
      "Fight! Fight!",
      "Beat them with music!",
      "I want to be a singer too!",
      "Songs give me strength!",
      "Let our song spread through the universe!"
    ]
  },
  ja: {
    loli: [
      "がんばれ！",
      "すごい！",
      "コンボ！コンボ！",
      "やったね！",
      "後ろに気をつけて！",
      "いくぞ！",
      "やった！",
      "歌は力！",
      "歌え！戦え！",
      "諦めないで！",
      "希望のために戦う！",
      "歌声を戦場に響かせよう！",
      "みんなの笑顔を守る！",
      "私たちの歌が世界を変える！"
    ],
    大叔: [
      "はは！いいぞ！",
      "まあまあだな、この子！",
      "続けろ！",
      "これが戦いだ！",
      "気をつけろ、新人！",
      "彼らに見せてやれ！",
      "気持ちいい！",
      "歌は武器だ！",
      "リズムを感じろ！",
      "一緒にロックしようぜ！",
      "戦え！歌姫！",
      "これが俺たちの戦いだ！",
      "平和のために戦う！",
      "歌で世界を救え！"
    ],
    御姐: [
      "よくやったわ、ダーリン！",
      "続けて、止めるな！",
      "美しいコンボ！",
      "お姉ちゃんが見てるよ！",
      "気をつけて、ベイビー！",
      "頑張って、がっかりさせないで！",
      "パーフェクト！",
      "歌は魂の共鳴！",
      "歌で守ろう！",
      "勇敢に前へ！",
      "あなたは最高の歌手！",
      "歌声で世界を感動させて！",
      "音楽の力を信じて！",
      "私たちの歌は終わらない！"
    ],
    正太: [
      "見てろよ！",
      "俺が一番！",
      "高いコンボだね！",
      "やったー！勝利！",
      "ゾンビに気をつけろ！",
      "突撃！",
      "やった！",
      "音楽超かっこいい！",
      "一緒に歌おう！",
      "戦え！戦え！",
      "音楽でやっつけろ！",
      "俺も歌手になりたい！",
      "歌声が力をくれる！",
      "俺たちの歌を宇宙に響かせよう！"
    ]
  }
};

// Macross-style motivational voice lines
const motivationalLines = {
  zh: {
    combo: [
      "{combo}连击！太厉害了！",
      "保持节奏！连击数还能更高！",
      "音乐与你同在！继续战斗！",
      "你的歌声正在创造奇迹！"
    ],
    levelUp: [
      "等级提升！你变得更强了！",
      "太棒了！新的力量觉醒了！",
      "成长的歌声！继续前进！",
      "恭喜！你离歌姬更近了一步！"
    ],
    boss: [
      "强敌出现！用你的歌声打败它！",
      "最终BOSS！让我们一起摇滚！",
      "这是最后的战斗！全力以赴！",
      "歌姬啊！现在是展现真正力量的时候！"
    ],
    victory: [
      "胜利！我们用音乐战胜了一切！",
      "太棒了！你的歌声感动了世界！",
      "战斗结束！但音乐永不停息！",
      "恭喜！你是真正的音乐战士！"
    ],
    lowHealth: [
      "小心！血量太低了！",
      "别放弃！歌声会给你力量！",
      "坚持住！我们都在支持你！",
      "治愈的歌声啊！请守护她！"
    ]
  },
  en: {
    combo: [
      "{combo} combo! Amazing!",
      "Keep the rhythm! You can get higher!",
      "Music is with you! Keep fighting!",
      "Your song is creating miracles!"
    ],
    levelUp: [
      "Level up! You're getting stronger!",
      "Awesome! New power awakens!",
      "Song of growth! Keep moving forward!",
      "Congratulations! You're one step closer to being a diva!"
    ],
    boss: [
      "Strong enemy appears! Beat it with your song!",
      "Final Boss! Let's rock together!",
      "This is the final battle! Give it your all!",
      "Diva! Now is the time to show your true power!"
    ],
    victory: [
      "Victory! We defeated everything with music!",
      "Amazing! Your song touched the world!",
      "Battle over! But music never stops!",
      "Congratulations! You're a true music warrior!"
    ],
    lowHealth: [
      "Careful! Health is too low!",
      "Don't give up! Song will give you strength!",
      "Hang in there! We're all with you!",
      "Healing song! Protect her!"
    ]
  },
  ja: {
    combo: [
      "{combo}コンボ！すごい！",
      "リズムをキープ！もっと高くできる！",
      "歌は君と共に！戦い続けよう！",
      "君の歌が奇跡を起こしている！"
    ],
    levelUp: [
      "レベルアップ！君は強くなった！",
      "すごい！新しい力が目覚めた！",
      "成長の歌！前に進み続けよう！",
      "おめでとう！歌姫に一歩近づいた！"
    ],
    boss: [
      "強敵出現！歌で倒せ！",
      "ラスボス！一緒にロックしよう！",
      "これが最後の戦い！全力を尽くせ！",
      "歌姫よ！真の力を見せる時だ！"
    ],
    victory: [
      "勝利！歌で全てを倒した！",
      "すごい！君の歌が世界を感動させた！",
      "戦い終了！でも歌は終わらない！",
      "おめでとう！君は真の音楽戦士だ！"
    ],
    lowHealth: [
      "危ない！血が少なすぎる！",
      "諦めないで！歌が力をくれる！",
      "耐えろ！みんなが君を応援してる！",
      "癒しの歌よ！彼女を守って！"
    ]
  }
};

// Zombie sound effects
const zombieSounds = [
  "Groooaaarr!",
  "Braaaaains!",
  "Raaaawr!",
  "Urrrgh!",
  "Gnnnngh!"
];

// Enhanced sound effects - higher quality
const soundEffects: { [key: string]: string } = {};

export interface Song {
  id: string;
  title: string;
  artist: string;
  url: string;
  cover: string;
  genre?: string;
  tempo?: number;
  energy?: number;
}

// Music power system - Macross style
export interface MusicPowerState {
  musicIntensity: number; // 0-100
  rhythmBonus: number; // Multiplier for on-beat hits
  shieldStrength: number; // Shield from music
  attackBoost: number; // Attack boost from music
  speedBoost: number; // Speed boost from music
  auraActive: boolean; // Music aura effect
  songPhase: 'build' | 'climax' | 'calm'; // Song phase
}

export class SoundManager {
  private language: string;
  private voiceType: string;
  private audioContext: AudioContext | null = null;
  private backgroundMusic: HTMLAudioElement | null = null;
  private soundBuffers: { [key: string]: AudioBuffer } = {};
  private playlist: Song[] = [];
  private currentSongIndex: number = 0;
  private volume: number = 0.7;
  private soundVolume: number = 1.0;
  
  // Music power state
  private musicPower: MusicPowerState = {
    musicIntensity: 0,
    rhythmBonus: 1.0,
    shieldStrength: 0,
    attackBoost: 0,
    speedBoost: 0,
    auraActive: false,
    songPhase: 'calm'
  };
  
  // Analyzer nodes for visualizations
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  
  // Last voice time to prevent spam
  private lastVoiceTime = 0;
  private voiceCooldown = 3000; // 3 seconds
  
  // Sound effect limit
  private activeSounds: Set<AudioBufferSourceNode> = new Set();
  private maxActiveSounds = 10; // Maximum number of simultaneous sound effects

  constructor(language: string = 'zh', voiceType: string = 'loli') {
    this.language = language;
    this.voiceType = voiceType;
    this.initAudioContext();
    // 异步预加载音效，不阻塞构造函数
    this.preloadSoundEffects().catch(() => {
      // 静默处理错误，确保游戏能正常启动
    });
  }

  private initAudioContext() {
    if (typeof AudioContext !== 'undefined') {
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    }
  }

  // 资源管理：预加载声音效果
  private async preloadSoundEffects() {
    if (!this.audioContext) return;
    
    // 批量加载，限制并发请求数
    const batchSize = 3;
    const soundKeys = Object.keys(soundEffects);
    
    // 只有当有音效需要加载时才执行
    if (soundKeys.length > 0) {
      for (let i = 0; i < soundKeys.length; i += batchSize) {
        const batch = soundKeys.slice(i, i + batchSize);
        await Promise.all(batch.map(async (key) => {
          try {
            const url = soundEffects[key as keyof typeof soundEffects];
            const response = await fetch(url);
            if (!response.ok) {
              // Skip all error logging to reduce console noise
              return;
            }
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext?.decodeAudioData(arrayBuffer);
            if (audioBuffer) {
              this.soundBuffers[key] = audioBuffer;
            }
          } catch (error) {
            // Skip all error logging to reduce console noise
          }
        }));
      }
    }
  }

  // 资源管理：按需加载音效
  async loadSoundEffect(type: keyof typeof soundEffects): Promise<boolean> {
    if (!this.audioContext) return false;
    
    // 如果已经加载，直接返回
    if (this.soundBuffers[type]) return true;
    
    // 检查音效是否存在
    if (!soundEffects[type]) return false;
    
    try {
      const url = soundEffects[type];
      const response = await fetch(url);
      if (!response.ok) return false;
      
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      if (audioBuffer) {
        this.soundBuffers[type] = audioBuffer;
        return true;
      }
    } catch (error) {
      // Skip logging errors
    }
    return false;
  }

  // 资源管理：释放未使用的音效
  releaseUnusedSounds() {
    // 保留常用音效，释放不常用的
    const essentialSounds = ['shoot', 'hit', 'levelUp', 'powerUp'];
    Object.keys(this.soundBuffers).forEach(key => {
      if (!essentialSounds.includes(key)) {
        delete this.soundBuffers[key];
      }
    });
  }

  // Play sound effect with enhanced quality
  async playSoundEffect(type: keyof typeof soundEffects, volume: number = 1.0) {
    if (!this.audioContext) return;
    
    // 按需加载音效
    if (!this.soundBuffers[type]) {
      const loaded = await this.loadSoundEffect(type);
      if (!loaded) return;
    }
    
    // Limit the number of simultaneous sound effects
    if (this.activeSounds.size >= this.maxActiveSounds) return;
    
    const source = this.audioContext.createBufferSource();
    source.buffer = this.soundBuffers[type];
    
    // Enhanced audio processing
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = this.soundVolume * volume;
    
    // Add subtle reverb for better quality
    const biquadFilter = this.audioContext.createBiquadFilter();
    biquadFilter.type = 'lowpass';
    biquadFilter.frequency.value = 20000;
    
    source.connect(gainNode);
    gainNode.connect(biquadFilter);
    biquadFilter.connect(this.audioContext.destination);
    
    // Add to active sounds
    this.activeSounds.add(source);
    
    // Remove from active sounds when finished
    source.addEventListener('ended', () => {
      this.activeSounds.delete(source);
    });
    
    source.start();
  }

  // Generate speech using Web Speech API
  private speak(text: string, priority: boolean = false) {
    const now = Date.now();
    if (!priority && now - this.lastVoiceTime < this.voiceCooldown) return;
    
    this.lastVoiceTime = now;
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.getLanguageCode(this.language);
      utterance.voice = this.getSelectedVoice();
      utterance.volume = this.soundVolume;
      utterance.rate = 1.0;
      utterance.pitch = this.getVoicePitch();
      
      speechSynthesis.speak(utterance);
    }
  }

  private getLanguageCode(language: string): string {
    const codeMap: { [key: string]: string } = {
      zh: 'zh-CN',
      en: 'en-US',
      ja: 'ja-JP'
    };
    return codeMap[language] || 'zh-CN';
  }

  private getSelectedVoice(): SpeechSynthesisVoice | undefined {
    const voices = speechSynthesis.getVoices();
    const langCode = this.getLanguageCode(this.language);
    
    // Filter voices by language
    const langVoices = voices.filter(voice => voice.lang.startsWith(langCode));
    
    if (langVoices.length === 0) return voices[0];
    
    // Select voice based on voice type
    switch (this.voiceType) {
      case 'loli':
        return langVoices.find(voice => voice.name.toLowerCase().includes('female')) || langVoices[0];
      case '大叔':
        return langVoices.find(voice => voice.name.toLowerCase().includes('male')) || langVoices[0];
      case '御姐':
        return langVoices.find(voice => voice.name.toLowerCase().includes('female')) || langVoices[0];
      case '正太':
        return langVoices.find(voice => voice.name.toLowerCase().includes('male')) || langVoices[0];
      default:
        return langVoices[0];
    }
  }

  private getVoicePitch(): number {
    switch (this.voiceType) {
      case 'loli':
        return 1.5;
      case '大叔':
        return 0.8;
      case '御姐':
        return 1.2;
      case '正太':
        return 1.3;
      default:
        return 1;
    }
  }

  // Play random character voice line
  playRandomVoiceLine() {
    const lines = voiceLines[this.language as keyof typeof voiceLines]?.[this.voiceType as keyof typeof voiceLines.zh];
    if (lines && lines.length > 0) {
      const randomLine = lines[Math.floor(Math.random() * lines.length)];
      this.speak(randomLine);
    }
  }

  // Play combo voice line based on combo count
  playComboVoiceLine(combo: number) {
    if (combo >= 5 && combo % 5 === 0) {
      const lines = voiceLines[this.language as keyof typeof voiceLines]?.[this.voiceType as keyof typeof voiceLines.zh];
      if (lines && lines.length > 0) {
        // Select lines that are more excited
        const excitedLines = lines.filter((_, index) => [1, 3, 6].includes(index));
        const randomLine = excitedLines[Math.floor(Math.random() * excitedLines.length)];
        this.speak(randomLine, combo >= 20); // Priority for high combos
      }
    }
    
    // Play motivational combo lines
    if (combo >= 10 && combo % 10 === 0) {
      const motivLines = motivationalLines[this.language as keyof typeof motivationalLines]?.combo;
      if (motivLines) {
        const randomLine = motivLines[Math.floor(Math.random() * motivLines.length)];
        this.speak(randomLine.replace('{combo}', combo.toString()), true);
      }
    }
  }

  // Play motivational voice line for specific event
  playMotivationalVoice(event: 'levelUp' | 'boss' | 'victory' | 'lowHealth') {
    const lines = motivationalLines[this.language as keyof typeof motivationalLines]?.[event];
    if (lines && lines.length > 0) {
      const randomLine = lines[Math.floor(Math.random() * lines.length)];
      this.speak(randomLine, true);
    }
  }

  // Play zombie sound
  playZombieSound() {
    const randomSound = zombieSounds[Math.floor(Math.random() * zombieSounds.length)];
    this.speak(randomSound);
  }

  // Music power system methods
  updateMusicPower(intensity: number, isOnBeat: boolean) {
    this.musicPower.musicIntensity = Math.min(100, Math.max(0, intensity));
    
    // Update song phase based on intensity
    if (this.musicPower.musicIntensity < 30) {
      this.musicPower.songPhase = 'calm';
    } else if (this.musicPower.musicIntensity < 70) {
      this.musicPower.songPhase = 'build';
    } else {
      this.musicPower.songPhase = 'climax';
    }
    
    // Calculate bonuses based on phase and intensity
    const phaseMultipliers = {
      calm: 1.0,
      build: 1.5,
      climax: 2.5
    };
    
    const baseIntensity = this.musicPower.musicIntensity / 100;
    const phaseMultiplier = phaseMultipliers[this.musicPower.songPhase];
    
    this.musicPower.rhythmBonus = isOnBeat ? 2.0 : 1.0;
    this.musicPower.attackBoost = baseIntensity * phaseMultiplier;
    this.musicPower.speedBoost = baseIntensity * 0.5;
    this.musicPower.shieldStrength = baseIntensity * 20;
    
    // Activate aura when intensity is high
    this.musicPower.auraActive = this.musicPower.musicIntensity >= 50;
    
    // Play music note sound on beat
    if (isOnBeat && intensity > 20) {
      this.playSoundEffect('melodyNote', 0.3);
    }
  }

  getMusicPower(): MusicPowerState {
    return { ...this.musicPower };
  }

  // Enhanced background music functions
  async playBackgroundMusic(url: string): Promise<boolean> {
    try {
      // 恢复音频上下文（如果被暂停）
      if (this.audioContext?.state === 'suspended') {
        await this.audioContext.resume();
      } else if (!this.audioContext) {
        // 如果音频上下文不存在，初始化一个
        this.initAudioContext();
      }
      
      // 停止当前播放的音乐
      if (this.backgroundMusic) {
        this.backgroundMusic.pause();
        this.backgroundMusic = null;
      }

      // 创建新的音频元素
      this.backgroundMusic = new Audio(url);
      this.backgroundMusic.loop = true;
      this.backgroundMusic.volume = this.volume;
      
      // 处理音频加载错误
      this.backgroundMusic.addEventListener('error', (e) => {
        console.log('音频加载失败，游戏仍可继续', e);
      });
      
      // 连接到音频上下文用于分析
      if (this.audioContext && this.analyser) {
        try {
          const source = this.audioContext.createMediaElementSource(this.backgroundMusic);
          source.connect(this.analyser);
          this.analyser.connect(this.audioContext.destination);
        } catch (error) {
          console.log('音频分析连接失败，但不影响播放');
        }
      }
      
      // 尝试播放
      await this.backgroundMusic.play();
      return true;
    } catch (error) {
      console.log('音乐播放失败，游戏仍可正常进行', error);
      return false;
    }
  }

  // Get frequency data for visualization
  getFrequencyData(): Uint8Array | null {
    if (this.analyser && this.dataArray) {
      this.analyser.getByteFrequencyData(this.dataArray);
      return this.dataArray;
    }
    return null;
  }

  pauseBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
    }
  }

  resumeBackgroundMusic() {
    if (this.backgroundMusic && this.backgroundMusic.paused) {
      this.backgroundMusic.play();
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = this.volume;
    }
  }

  setSoundVolume(volume: number) {
    this.soundVolume = Math.max(0, Math.min(1, volume));
  }

  // 默认音乐播放列表 - 使用本地音乐文件
  private defaultPlaylist: Song[] = [
    {
      id: 'theme-1',
      title: '游戏主题曲',
      artist: 'Game Soundtrack',
      url: '/music/theme.mp3',
      cover: 'https://via.placeholder.com/150',
      genre: 'electronic',
      tempo: 120,
      energy: 0.8
    },
    {
      id: 'battle-1',
      title: '战斗音乐',
      artist: 'Game Soundtrack',
      url: '/music/battle.mp3',
      cover: 'https://via.placeholder.com/150',
      genre: 'rock',
      tempo: 140,
      energy: 0.9
    }
  ];

  // Playlist functions
  setPlaylist(songs: Song[]) {
    this.playlist = songs;
    this.currentSongIndex = 0;
  }

  // 初始化默认播放列表
  async initDefaultPlaylist() {
    this.setPlaylist(this.defaultPlaylist);
    // 尝试播放第一首歌，但失败也不影响游戏
    if (this.defaultPlaylist.length > 0) {
      try {
        await this.playSong(0);
      } catch (error) {
        console.log('默认音乐播放失败，游戏仍可正常进行');
      }
    }
  }

  async playNextSong(): Promise<Song | null> {
    if (this.playlist.length === 0) return null;
    
    this.currentSongIndex = (this.currentSongIndex + 1) % this.playlist.length;
    const song = this.playlist[this.currentSongIndex];
    await this.playBackgroundMusic(song.url);
    return song;
  }

  async playPreviousSong(): Promise<Song | null> {
    if (this.playlist.length === 0) return null;
    
    this.currentSongIndex = (this.currentSongIndex - 1 + this.playlist.length) % this.playlist.length;
    const song = this.playlist[this.currentSongIndex];
    await this.playBackgroundMusic(song.url);
    return song;
  }

  async playSong(index: number): Promise<Song | null> {
    if (index >= 0 && index < this.playlist.length) {
      this.currentSongIndex = index;
      const song = this.playlist[index];
      await this.playBackgroundMusic(song.url);
      return song;
    }
    return null;
  }

  getCurrentSong(): Song | null {
    if (this.playlist.length === 0) return null;
    return this.playlist[this.currentSongIndex];
  }

  getPlaylist(): Song[] {
    return this.playlist;
  }

  // Import playlist from various platforms
  async importPlaylist(platform: 'spotify' | 'apple' | 'youtube' | 'local', data: { files?: File[] }): Promise<Song[]> {
    const songs: Song[] = [];
    
    switch (platform) {
      case 'local':
        if (data.files) {
          for (const file of data.files) {
            songs.push({
              id: `local-${Date.now()}-${Math.random()}`,
              title: file.name,
              artist: 'Local Artist',
              url: URL.createObjectURL(file),
              cover: 'https://via.placeholder.com/150',
              genre: 'unknown',
              tempo: 120,
              energy: 0.5
            });
          }
        }
        break;
      case 'spotify':
      case 'apple':
      case 'youtube':
        // Mock data for demonstration - Macross style songs
        songs.push(
          {
            id: `mock-${platform}-1`,
            title: '爱·おぼえていますか',
            artist: 'Lynn Minmay',
            url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            cover: 'https://via.placeholder.com/150',
            genre: 'anime',
            tempo: 130,
            energy: 0.8
          },
          {
            id: `mock-${platform}-2`,
            title: 'My Soul, Your Beats!',
            artist: 'Miku Hatsune',
            url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
            cover: 'https://via.placeholder.com/150',
            genre: 'anime',
            tempo: 140,
            energy: 0.9
          },
          {
            id: `mock-${platform}-3`,
            title: 'ライオン',
            artist: 'Sheryl & Ranka',
            url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
            cover: 'https://via.placeholder.com/150',
            genre: 'anime',
            tempo: 150,
            energy: 1.0
          }
        );
        break;
    }
    
    this.setPlaylist(songs);
    return songs;
  }

  // Set language
  setLanguage(language: string) {
    this.language = language;
  }

  // Set voice type
  setVoiceType(voiceType: string) {
    this.voiceType = voiceType;
  }
}

// Export singleton instance
export const soundManager = new SoundManager();
