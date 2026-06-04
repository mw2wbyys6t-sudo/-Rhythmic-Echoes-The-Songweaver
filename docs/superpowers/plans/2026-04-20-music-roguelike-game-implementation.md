# 音乐 Roguelike 游戏实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建一个融合音乐节奏和 Roguelike 元素的动作游戏，玩家可以通过音乐节奏提升战斗力。

**Architecture:** 基于现有的 React + TypeScript + Vite 项目结构，添加音乐分析模块、游戏引擎模块和节奏系统，实现 Roguelike 游戏玩法。

**Tech Stack:** React, TypeScript, Vite, Zustand, Tailwind CSS, Canvas 2D, Web Audio API

---

## 文件结构

### 新增文件
- `src/utils/musicAnalyzer.ts` - 音乐分析模块
- `src/utils/roguelikeGenerator.ts` - Roguelike 关卡生成器
- `src/pages/CharacterSelect.tsx` - 角色选择页面
- `src/pages/Upgrade.tsx` - 升级页面
- `src/components/RhythmIndicator.tsx` - 节奏指示器组件
- `src/components/CharacterCard.tsx` - 角色卡片组件
- `src/types/roguelike.ts` - 游戏类型定义

### 修改文件
- `src/store/gameStore.ts` - 扩展游戏状态管理
- `src/pages/Game.tsx` - 重构游戏逻辑，添加节奏系统
- `src/pages/Home.tsx` - 更新首页布局
- `src/App.tsx` - 更新路由和页面结构

## 任务分解

### 任务 1: 扩展游戏状态管理

**Files:**
- Modify: `src/store/gameStore.ts`
- Create: `src/types/roguelike.ts`

- [ ] **Step 1: 创建游戏类型定义**

```typescript
// src/types/roguelike.ts
export interface Character {
  id: string;
  name: string;
  description: string;
  health: number;
  damage: number;
  speed: number;
  skills: Skill[];
  image: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  damage: number;
  rhythmRequired: boolean;
}

export interface Enemy {
  id: string;
  name: string;
  health: number;
  damage: number;
  speed: number;
  type: string;
  rhythmPattern: string[];
}

export interface Weapon {
  id: string;
  name: string;
  damage: number;
  fireRate: number;
  ammo: number;
  rhythmBonus: number;
  type: 'melee' | 'ranged';
}

export interface Level {
  id: number;
  enemies: Enemy[];
  boss?: Enemy;
  layout: string[][];
}

export interface PowerUp {
  id: string;
  name: string;
  description: string;
  effect: string;
  value: number;
}
```

- [ ] **Step 2: 扩展游戏状态管理**

```typescript
// src/store/gameStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Character, Enemy, Weapon, Level, PowerUp } from '../types/roguelike';

interface GameState {
  // 角色信息
  characters: Character[];
  selectedCharacter: Character | null;
  setSelectedCharacter: (character: Character) => void;
  
  // 游戏状态
  currentLevel: number;
  setCurrentLevel: (level: number) => void;
  score: number;
  setScore: (score: number) => void;
  health: number;
  setHealth: (health: number) => void;
  experience: number;
  setExperience: (experience: number) => void;
  level: number;
  setLevel: (level: number) => void;
  
  // 武器信息
  weapons: Weapon[];
  selectedWeapon: Weapon | null;
  setSelectedWeapon: (weapon: Weapon) => void;
  
  // 技能信息
  skills: any[];
  addSkill: (skill: any) => void;
  
  // 道具信息
  powerUps: PowerUp[];
  addPowerUp: (powerUp: PowerUp) => void;
  
  // 敌人信息
  enemies: Enemy[];
  setEnemies: (enemies: Enemy[]) => void;
  
  // 音乐信息
  currentSong: any;
  setCurrentSong: (song: any) => void;
  rhythmPoints: number[];
  setRhythmPoints: (points: number[]) => void;
  
  // 游戏流程
  isGameOver: boolean;
  setIsGameOver: (over: boolean) => void;
  resetGame: () => void;
}

const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      // 角色列表
      characters: [
        {
          id: 'idol',
          name: '偶像歌手',
          description: '通过音乐增强战斗力的歌手',
          health: 100,
          damage: 15,
          speed: 8,
          skills: [
            {
              id: 'harmony',
              name: '和声冲击',
              description: '在节拍点释放，造成范围伤害',
              cooldown: 5,
              damage: 50,
              rhythmRequired: true
            }
          ],
          image: 'idol.png'
        },
        {
          id: 'guitarist',
          name: '吉他手',
          description: '使用吉他作为武器的摇滚战士',
          health: 120,
          damage: 25,
          speed: 6,
          skills: [
            {
              id: 'riff',
              name: '吉他riff',
              description: '连续攻击，节拍点伤害翻倍',
              cooldown: 3,
              damage: 30,
              rhythmRequired: true
            }
          ],
          image: 'guitarist.png'
        }
      ],
      selectedCharacter: null,
      setSelectedCharacter: (selectedCharacter) => set({ selectedCharacter }),
      
      // 游戏状态默认值
      currentLevel: 1,
      setCurrentLevel: (currentLevel) => set({ currentLevel }),
      score: 0,
      setScore: (score) => set({ score }),
      health: 100,
      setHealth: (health) => set({ health }),
      experience: 0,
      setExperience: (experience) => set({ experience }),
      level: 1,
      setLevel: (level) => set({ level }),
      
      // 武器默认值
      weapons: [
        {
          id: 'microphone',
          name: '麦克风',
          damage: 20,
          fireRate: 0.5,
          ammo: Infinity,
          rhythmBonus: 1.5,
          type: 'ranged'
        },
        {
          id: 'guitar',
          name: '电吉他',
          damage: 30,
          fireRate: 0.3,
          ammo: Infinity,
          rhythmBonus: 2.0,
          type: 'melee'
        }
      ],
      selectedWeapon: null,
      setSelectedWeapon: (selectedWeapon) => set({ selectedWeapon }),
      
      // 技能默认值
      skills: [],
      addSkill: (skill) => set((state) => ({ skills: [...state.skills, skill] })),
      
      // 道具默认值
      powerUps: [],
      addPowerUp: (powerUp) => set((state) => ({ powerUps: [...state.powerUps, powerUp] })),
      
      // 敌人默认值
      enemies: [],
      setEnemies: (enemies) => set({ enemies }),
      
      // 音乐默认值
      currentSong: null,
      setCurrentSong: (currentSong) => set({ currentSong }),
      rhythmPoints: [],
      setRhythmPoints: (rhythmPoints) => set({ rhythmPoints }),
      
      // 游戏流程
      isGameOver: false,
      setIsGameOver: (isGameOver) => set({ isGameOver }),
      
      // 重置游戏
      resetGame: () => set({
        currentLevel: 1,
        score: 0,
        health: 100,
        experience: 0,
        level: 1,
        enemies: [],
        skills: [],
        powerUps: [],
        isGameOver: false
      })
    }),
    {
      name: 'music-roguelike-game'
    }
  )
);

export default useGameStore;
```

- [ ] **Step 3: 提交更改**

```bash
git add src/types/roguelike.ts src/store/gameStore.ts
git commit -m "feat: extend game state for roguelike"
```

### 任务 2: 创建音乐分析模块

**Files:**
- Create: `src/utils/musicAnalyzer.ts`

- [ ] **Step 1: 实现音乐分析功能**

```typescript
// src/utils/musicAnalyzer.ts
class MusicAnalyzer {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private dataArray: Uint8Array;
  
  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
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
  
  // 检测节拍
  detectBeats(): number[] {
    const data = this.getTimeDomainData();
    const beats: number[] = [];
    
    // 简单的节拍检测算法
    for (let i = 1; i < data.length; i++) {
      const current = data[i];
      const previous = data[i - 1];
      
      // 检测上升沿
      if (current > 128 && previous <= 128) {
        beats.push(i);
      }
    }
    
    return beats;
  }
  
  // 分析音乐节奏
  analyzeRhythm(audio: HTMLAudioElement): Promise<number[]> {
    return new Promise((resolve) => {
      const rhythmPoints: number[] = [];
      const interval = setInterval(() => {
        if (audio.paused) return;
        
        const beats = this.detectBeats();
        if (beats.length > 0) {
          rhythmPoints.push(audio.currentTime);
        }
      }, 100);
      
      audio.addEventListener('ended', () => {
        clearInterval(interval);
        resolve(rhythmPoints);
      });
    });
  }
}

export const musicAnalyzer = new MusicAnalyzer();
```

- [ ] **Step 2: 提交更改**

```bash
git add src/utils/musicAnalyzer.ts
git commit -m "feat: add music analyzer module"
```

### 任务 3: 创建 Roguelike 关卡生成器

**Files:**
- Create: `src/utils/roguelikeGenerator.ts`

- [ ] **Step 1: 实现关卡生成功能**

```typescript
// src/utils/roguelikeGenerator.ts
import type { Level, Enemy } from '../types/roguelike';

class RoguelikeGenerator {
  // 生成随机关卡
  generateLevel(level: number): Level {
    const enemyCount = 5 + level * 2;
    const enemies: Enemy[] = [];
    
    // 生成普通敌人
    for (let i = 0; i < enemyCount; i++) {
      enemies.push(this.generateEnemy(level));
    }
    
    // 生成 Boss
    let boss: Enemy | undefined;
    if (level % 5 === 0) {
      boss = this.generateBoss(level);
    }
    
    // 生成关卡布局
    const layout = this.generateLayout();
    
    return {
      id: level,
      enemies,
      boss,
      layout
    };
  }
  
  // 生成普通敌人
  private generateEnemy(level: number): Enemy {
    const enemyTypes = [
      {
        name: '僵尸',
        health: 50 + level * 10,
        damage: 10 + level * 2,
        speed: 2 + level * 0.1,
        type: 'melee'
      },
      {
        name: '骷髅',
        health: 40 + level * 8,
        damage: 15 + level * 3,
        speed: 3 + level * 0.15,
        type: 'melee'
      },
      {
        name: '蝙蝠',
        health: 30 + level * 5,
        damage: 8 + level * 1,
        speed: 4 + level * 0.2,
        type: 'ranged'
      }
    ];
    
    const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    
    return {
      id: `enemy-${Date.now()}-${Math.random()}`,
      name: type.name,
      health: type.health,
      damage: type.damage,
      speed: type.speed,
      type: type.type,
      rhythmPattern: this.generateRhythmPattern()
    };
  }
  
  // 生成 Boss
  private generateBoss(level: number): Enemy {
    const bossTypes = [
      {
        name: '音乐魔王',
        health: 500 + level * 50,
        damage: 30 + level * 5,
        speed: 2 + level * 0.1,
        type: 'ranged'
      },
      {
        name: '节奏巨人',
        health: 600 + level * 60,
        damage: 40 + level * 6,
        speed: 1.5 + level * 0.05,
        type: 'melee'
      }
    ];
    
    const type = bossTypes[Math.floor(Math.random() * bossTypes.length)];
    
    return {
      id: `boss-${Date.now()}`,
      name: type.name,
      health: type.health,
      damage: type.damage,
      speed: type.speed,
      type: type.type,
      rhythmPattern: this.generateRhythmPattern()
    };
  }
  
  // 生成节奏模式
  private generateRhythmPattern(): string[] {
    const patterns = ['4/4', '3/4', '6/8'];
    return [patterns[Math.floor(Math.random() * patterns.length)]];
  }
  
  // 生成关卡布局
  private generateLayout(): string[][] {
    const width = 20;
    const height = 15;
    const layout: string[][] = [];
    
    // 生成随机布局
    for (let y = 0; y < height; y++) {
      const row: string[] = [];
      for (let x = 0; x < width; x++) {
        if (Math.random() > 0.7) {
          row.push('wall');
        } else {
          row.push('empty');
        }
      }
      layout.push(row);
    }
    
    // 确保有路径
    layout[0][0] = 'empty';
    layout[height - 1][width - 1] = 'empty';
    
    return layout;
  }
  
  // 生成随机道具
  generatePowerUp(level: number): any {
    const powerUps = [
      {
        name: '攻击力提升',
        description: '增加10%攻击力',
        effect: 'damage',
        value: 0.1
      },
      {
        name: '生命值提升',
        description: '增加20点生命值',
        effect: 'health',
        value: 20
      },
      {
        name: '速度提升',
        description: '增加10%移动速度',
        effect: 'speed',
        value: 0.1
      },
      {
        name: '节奏大师',
        description: '节奏攻击伤害加成提升',
        effect: 'rhythmBonus',
        value: 0.5
      }
    ];
    
    const powerUp = powerUps[Math.floor(Math.random() * powerUps.length)];
    
    return {
      id: `powerup-${Date.now()}-${Math.random()}`,
      ...powerUp
    };
  }
}

export const roguelikeGenerator = new RoguelikeGenerator();
```

- [ ] **Step 2: 提交更改**

```bash
git add src/utils/roguelikeGenerator.ts
git commit -m "feat: add roguelike level generator"
```

### 任务 4: 创建角色选择页面

**Files:**
- Create: `src/pages/CharacterSelect.tsx`
- Create: `src/components/CharacterCard.tsx`

- [ ] **Step 1: 创建角色卡片组件**

```tsx
// src/components/CharacterCard.tsx
import React from 'react';
import type { Character } from '../types/roguelike';

interface CharacterCardProps {
  character: Character;
  selected: boolean;
  onSelect: (character: Character) => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character, selected, onSelect }) => {
  return (
    <div 
      className={`relative p-6 rounded-2xl transition-all duration-300 cursor-pointer ${selected ? 'bg-purple-700 border-2 border-purple-400' : 'bg-gray-800 border border-gray-700 hover:bg-gray-700'}`}
      onClick={() => onSelect(character)}
    >
      <div className="flex flex-col items-center">
        <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl">🎤</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{character.name}</h3>
        <p className="text-gray-300 text-center mb-4">{character.description}</p>
        <div className="grid grid-cols-2 gap-2 w-full">
          <div className="bg-gray-700 p-2 rounded text-center">
            <span className="text-gray-300">生命值</span>
            <div className="text-white font-bold">{character.health}</div>
          </div>
          <div className="bg-gray-700 p-2 rounded text-center">
            <span className="text-gray-300">攻击力</span>
            <div className="text-white font-bold">{character.damage}</div>
          </div>
          <div className="bg-gray-700 p-2 rounded text-center">
            <span className="text-gray-300">速度</span>
            <div className="text-white font-bold">{character.speed}</div>
          </div>
          <div className="bg-gray-700 p-2 rounded text-center">
            <span className="text-gray-300">技能</span>
            <div className="text-white font-bold">{character.skills.length}</div>
          </div>
        </div>
      </div>
      {selected && (
        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
          已选择
        </div>
      )}
    </div>
  );
};

export default CharacterCard;
```

- [ ] **Step 2: 创建角色选择页面**

```tsx
// src/pages/CharacterSelect.tsx
import React from 'react';
import useGameStore from '../store/gameStore';
import CharacterCard from '../components/CharacterCard';

interface CharacterSelectProps {
  onNext: () => void;
  onBack: () => void;
}

const CharacterSelect: React.FC<CharacterSelectProps> = ({ onNext, onBack }) => {
  const { characters, selectedCharacter, setSelectedCharacter } = useGameStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-gray-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-10 animate-pulse"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 5 + 3}s`,
              animationDelay: `${Math.random() * 2}s`,
              filter: 'blur(20px)'
            }}
          />
        ))}
      </div>

      <h1 className="text-4xl font-bold text-white mb-8 relative z-10">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400">
          🎮 选择角色
        </span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl relative z-10">
        {characters.map((character) => (
          <CharacterCard
            key={character.id}
            character={character}
            selected={selectedCharacter?.id === character.id}
            onSelect={setSelectedCharacter}
          />
        ))}
      </div>

      <div className="mt-12 flex gap-6 relative z-10">
        <button
          onClick={onBack}
          className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          ← 返回
        </button>
        <button
          onClick={onNext}
          disabled={!selectedCharacter}
          className={`px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg ${selectedCharacter ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-400 hover:to-green-500' : 'bg-gray-500 text-gray-300 cursor-not-allowed'}`}
        >
          下一步 →
        </button>
      </div>
    </div>
  );
};

export default CharacterSelect;
```

- [ ] **Step 3: 提交更改**

```bash
git add src/components/CharacterCard.tsx src/pages/CharacterSelect.tsx
git commit -m "feat: add character select page"
```

### 任务 5: 创建升级页面

**Files:**
- Create: `src/pages/Upgrade.tsx`

- [ ] **Step 1: 创建升级页面**

```tsx
// src/pages/Upgrade.tsx
import React from 'react';
import useGameStore from '../store/gameStore';
import { roguelikeGenerator } from '../utils/roguelikeGenerator';

interface UpgradeProps {
  onNext: () => void;
}

const Upgrade: React.FC<UpgradeProps> = ({ onNext }) => {
  const { 
    currentLevel, 
    addPowerUp, 
    experience, 
    setExperience,
    level, 
    setLevel
  } = useGameStore();

  // 生成升级选项
  const powerUpOptions = [
    roguelikeGenerator.generatePowerUp(currentLevel),
    roguelikeGenerator.generatePowerUp(currentLevel),
    roguelikeGenerator.generatePowerUp(currentLevel)
  ];

  const handleSelectPowerUp = (powerUp: any) => {
    addPowerUp(powerUp);
    // 增加经验值和等级
    setExperience(prev => prev + 100);
    if (experience + 100 >= level * 100) {
      setLevel(prev => prev + 1);
    }
    onNext();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-gray-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-10 animate-pulse"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 5 + 3}s`,
              animationDelay: `${Math.random() * 2}s`,
              filter: 'blur(20px)'
            }}
          />
        ))}
      </div>

      <h1 className="text-4xl font-bold text-white mb-8 relative z-10">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400">
          🎮 升级选择
        </span>
      </h1>

      <div className="text-white text-xl mb-8 relative z-10">
        关卡 {currentLevel} 完成！选择一个升级选项：
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl relative z-10">
        {powerUpOptions.map((powerUp) => (
          <div
            key={powerUp.id}
            className="bg-gray-800 border border-gray-700 rounded-2xl p-6 cursor-pointer hover:bg-gray-700 transition-all duration-300 transform hover:scale-105"
            onClick={() => handleSelectPowerUp(powerUp)}
          >
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-bold text-white mb-2">{powerUp.name}</h3>
            <p className="text-gray-300 mb-4">{powerUp.description}</p>
            <div className="bg-purple-900 bg-opacity-50 p-3 rounded-lg">
              <div className="text-sm text-gray-300">效果</div>
              <div className="text-white font-bold">{powerUp.effect} +{powerUp.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Upgrade;
```

- [ ] **Step 2: 提交更改**

```bash
git add src/pages/Upgrade.tsx
git commit -m "feat: add upgrade page"
```

### 任务 6: 创建节奏指示器组件

**Files:**
- Create: `src/components/RhythmIndicator.tsx`

- [ ] **Step 1: 创建节奏指示器组件**

```tsx
// src/components/RhythmIndicator.tsx
import React, { useEffect, useState } from 'react';

interface RhythmIndicatorProps {
  rhythmPoints: number[];
  currentTime: number;
}

const RhythmIndicator: React.FC<RhythmIndicatorProps> = ({ rhythmPoints, currentTime }) => {
  const [isBeat, setIsBeat] = useState(false);

  useEffect(() => {
    // 检测当前是否在节拍点
    const isCurrentBeat = rhythmPoints.some(point => {
      return Math.abs(point - currentTime) < 0.1;
    });

    if (isCurrentBeat && !isBeat) {
      setIsBeat(true);
      setTimeout(() => setIsBeat(false), 200);
    }
  }, [rhythmPoints, currentTime, isBeat]);

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <div className={`w-64 h-16 bg-black bg-opacity-70 rounded-full flex items-center justify-center transition-all duration-200 ${isBeat ? 'scale-110' : 'scale-100'}`}>
        <div className={`w-8 h-8 rounded-full ${isBeat ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></div>
        <div className="ml-4 flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i}
              className={`w-4 h-4 rounded-full ${isBeat && i === 1 ? 'bg-green-500' : 'bg-gray-600'}`}
            ></div>
          ))}
        </div>
        <div className="ml-4 text-white font-mono">
          {currentTime.toFixed(1)}
        </div>
      </div>
    </div>
  );
};

export default RhythmIndicator;
```

- [ ] **Step 2: 提交更改**

```bash
git add src/components/RhythmIndicator.tsx
git commit -m "feat: add rhythm indicator component"
```

### 任务 7: 重构游戏页面，添加节奏系统

**Files:**
- Modify: `src/pages/Game.tsx`

- [ ] **Step 1: 重构游戏页面**

```tsx
// src/pages/Game.tsx
import React, { useEffect, useRef, useState } from 'react';
import useGameStore from '../store/gameStore';
import { soundManager } from '../utils/soundManager';
import { musicAnalyzer } from '../utils/musicAnalyzer';
import { roguelikeGenerator } from '../utils/roguelikeGenerator';
import RhythmIndicator from '../components/RhythmIndicator';

interface GameProps {
  onReturnToMain?: () => void;
  onLevelComplete?: () => void;
}

const Game: React.FC<GameProps> = ({ onReturnToMain, onLevelComplete }) => {
  const gameStore = useGameStore();
  const { 
    selectedCharacter, 
    currentLevel, 
    setCurrentLevel, 
    score, 
    setScore, 
    health, 
    setHealth, 
    weapons, 
    selectedWeapon, 
    setSelectedWeapon, 
    addPowerUp, 
    playlist, 
    selectedMap, 
    enemies, 
    setEnemies, 
    rhythmPoints, 
    setRhythmPoints,
    currentSong, 
    setCurrentSong,
    isGameOver, 
    setIsGameOver
  } = gameStore;

  const [isPaused, setIsPaused] = useState(false);
  const [isInvincible, setIsInvincible] = useState(false);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [bullets, setBullets] = useState<any[]>([]);
  const [player, setPlayer] = useState({ x: 50, y: 50 });
  const [currentTime, setCurrentTime] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysPressed = useRef<Set<string>>(new Set());
  const lastShootTime = useRef(0);
  const animationFrameId = useRef<number>();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 初始化游戏
  useEffect(() => {
    if (!selectedCharacter) return;

    // 初始化声音管理器
    soundManager.setLanguage('zh');
    soundManager.setVoiceType('loli');
    
    // 生成敌人
    const level = roguelikeGenerator.generateLevel(currentLevel);
    setEnemies(level.enemies);

    if (!selectedWeapon && weapons.length > 0) {
      setSelectedWeapon(weapons[0]);
    }
    
    // 加载音乐
    if (playlist.length > 0) {
      loadMusic(playlist[0]);
    }
    
    // 游戏开始时播放欢迎语音
    setTimeout(() => {
      soundManager.playRandomVoiceLine();
    }, 1000);
  }, [currentLevel, selectedCharacter, selectedWeapon, weapons, playlist]);

  // 加载音乐
  const loadMusic = async (song: any) => {
    try {
      const audio = await musicAnalyzer.loadAudio(song.url);
      audioRef.current = audio;
      setCurrentSong(song);
      
      // 分析音乐节奏
      const points = await musicAnalyzer.analyzeRhythm(audio);
      setRhythmPoints(points);
      
      // 播放音乐
      audio.play();
    } catch (error) {
      console.error('Failed to load music:', error);
    }
  };

  // 键盘事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
      
      if (e.key === ' ' && !isPaused) {
        e.preventDefault();
      }
      
      if (e.key.toLowerCase() === 'p') {
        setIsPaused(prev => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // 粒子系统状态
  const [particles, setParticles] = useState<any[]>([]);

  // 游戏主循环
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = 0;

    const gameLoop = (time: number) => {
      if (isPaused) {
        animationFrameId.current = requestAnimationFrame(gameLoop);
        return;
      }

      // 更新当前时间
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }

      // 背景绘制
      drawBackground(ctx);

      // 更新玩家位置
      const updatePlayer = () => {
        setPlayer(prev => {
          let newX = prev.x;
          let newY = prev.y;
          const speed = selectedCharacter?.speed || 4;

          if (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) newY -= speed;
          if (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) newY += speed;
          if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) newX -= speed;
          if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) newX += speed;

          newX = Math.max(20, Math.min(780, newX));
          newY = Math.max(20, Math.min(580, newY));

          return { x: newX, y: newY };
        });
      };
      updatePlayer();

      // 射击
      if (keysPressed.current.has(' ')) {
        const now = Date.now();
        const weapon = selectedWeapon || weapons[0];
        const shootInterval = weapon.fireRate * 500;
        
        if (now - lastShootTime.current > shootInterval) {
          lastShootTime.current = now;
          
          // 检测是否在节奏点
          const isOnBeat = rhythmPoints.some(point => {
            return Math.abs(point - currentTime) < 0.1;
          });
          
          const bulletCount = weapon.type === 'melee' ? 1 : 3;
          
          for (let i = 0; i < bulletCount; i++) {
            setBullets(prev => [...prev, {
              id: Date.now() + i,
              x: player.x,
              y: player.y,
              vx: (Math.random() - 0.5) * 2,
              vy: -10,
              damage: isOnBeat ? weapon.damage * weapon.rhythmBonus : weapon.damage,
              color: weapon.type === 'melee' ? '#00ffff' : '#ffff00',
              size: weapon.type === 'melee' ? 8 : 5,
              onBeat: isOnBeat
            }]);
            
            // 添加射击粒子效果
            addShootParticles(player.x, player.y, weapon.type === 'melee' ? '#00ffff' : '#ffff00');
          }
        }
      }

      // 更新子弹
      setBullets(prev => prev.filter(bullet => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        return bullet.y > -20 && bullet.x > -20 && bullet.x < 820;
      }));

      // 更新敌人
      setEnemies(prev => {
        return prev.map(enemy => {
          const dx = player.x - enemy.x;
          const dy = player.y - enemy.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist > 0) {
            enemy.x += (dx / dist) * enemy.speed;
            enemy.y += (dy / dist) * enemy.speed;
          }

          return enemy;
        });
      });

      // 碰撞检测 - 子弹打敌人
      let scoreToAdd = 0;
      let comboToAdd = 0;
      let newEnemies = [...enemies];
      
      setBullets(prevBullets => {
        const remainingBullets = prevBullets.filter(bullet => {
          let hit = false;
          
          newEnemies = newEnemies.map(enemy => {
            const dx = bullet.x - enemy.x;
            const dy = bullet.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 20 + bullet.size) {
              hit = true;
              enemy.health -= bullet.damage;
              if (enemy.health <= 0) {
                scoreToAdd += 100;
                comboToAdd++;
                // 添加爆炸粒子效果
                addExplosionParticles(enemy.x, enemy.y);
              } else {
                // 添加受伤粒子效果
                addHitParticles(enemy.x, enemy.y);
              }
            }
            return enemy;
          }).filter(enemy => enemy.health > 0);

          return !hit;
        });
        
        return remainingBullets;
      });

      // 更新敌人状态
      setEnemies(newEnemies);

      if (scoreToAdd > 0) {
        setScore(prev => prev + scoreToAdd);
        setCombo(prev => {
          const newCombo = prev + comboToAdd;
          setMaxCombo(prevMax => Math.max(prevMax, newCombo));
          setShowCombo(true);
          setTimeout(() => setShowCombo(false), 800);
          
          // 播放连击语音
          if (newCombo % 5 === 0) {
            soundManager.playComboVoiceLine(newCombo);
          }
          
          return newCombo;
        });
        
        // 随机播放僵尸死亡声音
        if (Math.random() > 0.7) {
          soundManager.playZombieSound();
        }
      }

      // 碰撞检测 - 敌人打玩家
      if (!isInvincible) {
        let gotHit = false;
        
        setEnemies(prevEnemies => {
          return prevEnemies.filter(enemy => {
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 20 + 20) {
              gotHit = true;
              // 添加受伤粒子效果
              addHitParticles(player.x, player.y, '#ff4444');
              return false;
            }
            return true;
          });
        });

        if (gotHit) {
          setHealth(prev => Math.max(0, prev - 20));
          setCombo(0);
          setIsInvincible(true);
          setTimeout(() => setIsInvincible(false), 2000);
        }
      }

      // 检查游戏结束
      if (health <= 0) {
        setIsGameOver(true);
        if (audioRef.current) {
          audioRef.current.pause();
        }
      }

      // 检查关卡完成
      if (enemies.length === 0 && !isGameOver) {
        onLevelComplete?.();
      }

      // 更新粒子
      setParticles(prev => {
        return prev
          .map(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.opacity -= 0.02;
            particle.size *= 0.98;
            return particle;
          })
          .filter(particle => particle.opacity > 0 && particle.size > 0.5);
      });

      // 绘制
      drawEnemies(ctx);
      drawBullets(ctx);
      drawParticles(ctx);
      drawPlayer(ctx);
      drawUI(ctx);

      animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    animationFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [isPaused, isInvincible, player, bullets, enemies, health, currentLevel, particles, selectedWeapon, weapons, selectedCharacter, selectedMap, rhythmPoints, currentTime, isGameOver, onLevelComplete]);

  // 添加射击粒子效果
  const addShootParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < 5; i++) {
      setParticles(prev => [...prev, {
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3 + 5,
        color: color,
        size: Math.random() * 3 + 2,
        opacity: 1
      }]);
    }
  };

  // 添加爆炸粒子效果
  const addExplosionParticles = (x: number, y: number) => {
    for (let i = 0; i < 15; i++) {
      setParticles(prev => [...prev, {
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        color: `hsl(${Math.random() * 60 + 0}, 100%, 50%)`,
        size: Math.random() * 4 + 2,
        opacity: 1
      }]);
    }
  };

  // 添加受伤粒子效果
  const addHitParticles = (x: number, y: number, color: string = '#ff6b6b') => {
    for (let i = 0; i < 8; i++) {
      setParticles(prev => [...prev, {
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        color: color,
        size: Math.random() * 3 + 1,
        opacity: 1
      }]);
    }
  };

  // 绘制粒子
  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    particles.forEach(particle => {
      ctx.globalAlpha = particle.opacity;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  };

  // 绘制背景
  const drawBackground = (ctx: CanvasRenderingContext2D) => {
    let gradient;
    let bgColor1, bgColor2;

    switch (selectedMap?.id) {
      case 'forest':
        bgColor1 = '#2d5a27';
        bgColor2 = '#1a3d15';
        break;
      case 'desert':
        bgColor1 = '#e6c9a3';
        bgColor2 = '#c4a076';
        break;
      case 'lab':
        bgColor1 = '#252540';
        bgColor2 = '#1a1a2e';
        break;
      case 'city':
      default:
        bgColor1 = '#3a3a3a';
        bgColor2 = '#1f1f1f';
    }

    gradient = ctx.createLinearGradient(0, 0, 0, 600);
    gradient.addColorStop(0, bgColor1);
    gradient.addColorStop(1, bgColor2);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);
  };

  // 绘制玩家
  const drawPlayer = (ctx: CanvasRenderingContext2D) => {
    if (isInvincible) {
      ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.3;
    }

    // 身体
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 22, 0, Math.PI * 2);
    ctx.fill();

    // 身体高光效果
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(player.x - 6, player.y - 6, 8, 0, Math.PI * 2);
    ctx.fill();

    // 脸部
    ctx.fillStyle = '#FFDAB9';
    ctx.beginPath();
    ctx.arc(player.x, player.y - 12, 14, 0, Math.PI * 2);
    ctx.fill();

    // 眼睛
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(player.x - 5, player.y - 14, 3, 0, Math.PI * 2);
    ctx.arc(player.x + 5, player.y - 14, 3, 0, Math.PI * 2);
    ctx.fill();

    // 眼睛高光
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(player.x - 4, player.y - 15, 1.5, 0, Math.PI * 2);
    ctx.arc(player.x + 6, player.y - 15, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 微笑
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(player.x, player.y - 8, 6, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();

    // 武器
    const weapon = selectedWeapon || weapons[0];
    if (weapon.type === 'melee') {
      // 光剑效果
      const glow = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
      ctx.strokeStyle = `rgba(0, 255, 255, ${glow})`;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(player.x, player.y + 22);
      ctx.lineTo(player.x, player.y + 55);
      ctx.stroke();
      
      // 光剑核心
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(player.x, player.y + 22);
      ctx.lineTo(player.x, player.y + 55);
      ctx.stroke();
    } else {
      // 枪械
      ctx.fillStyle = '#333';
      ctx.fillRect(player.x + 15, player.y - 2, 22, 10);
      ctx.fillStyle = '#666';
      ctx.fillRect(player.x + 32, player.y, 8, 6);
    }

    ctx.globalAlpha = 1;
  };

  // 绘制敌人
  const drawEnemies = (ctx: CanvasRenderingContext2D) => {
    enemies.forEach(enemy => {
      // 敌人身体
      ctx.fillStyle = '#ff6b6b';
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, 20, 0, Math.PI * 2);
      ctx.fill();

      // 敌人身体纹路
      ctx.strokeStyle = '#cc4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, 14, 0, Math.PI * 2);
      ctx.stroke();

      // 眼睛
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(enemy.x - 8, enemy.y - 4, 6, 0, Math.PI * 2);
      ctx.arc(enemy.x + 8, enemy.y - 4, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(enemy.x - 8, enemy.y - 4, 3, 0, Math.PI * 2);
      ctx.arc(enemy.x + 8, enemy.y - 4, 3, 0, Math.PI * 2);
      ctx.fill();

      // 嘴巴
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(enemy.x - 8, enemy.y + 6);
      ctx.quadraticCurveTo(enemy.x, enemy.y + 12, enemy.x + 8, enemy.y + 6);
      ctx.stroke();
    });
  };

  // 绘制子弹
  const drawBullets = (ctx: CanvasRenderingContext2D) => {
    bullets.forEach(bullet => {
      ctx.fillStyle = bullet.onBeat ? '#ff00ff' : bullet.color;
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  // 绘制UI
  const drawUI = (ctx: CanvasRenderingContext2D) => {
    // 生命值条
    const healthGradient = ctx.createLinearGradient(20, 20, 220, 20);
    healthGradient.addColorStop(0, '#ff6b6b');
    healthGradient.addColorStop(0.5, '#ee5a5a');
    healthGradient.addColorStop(1, '#cc4444');
    
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(15, 15, 210, 30);
    ctx.fillStyle = '#333';
    ctx.fillRect(20, 20, 200, 20);
    ctx.fillStyle = healthGradient;
    ctx.fillRect(20, 20, (health / 100) * 200, 20);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, 200, 20);

    // 文字
    ctx.textBaseline = 'middle';
    
    // HP
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`❤️ HP: ${health}`, 30, 30);
    
    // 分数
    const scoreGradient = ctx.createLinearGradient(250, 25, 350, 25);
    scoreGradient.addColorStop(0, '#ffd700');
    scoreGradient.addColorStop(1, '#ffed4e');
    ctx.fillStyle = scoreGradient;
    ctx.font = 'bold 18px Arial';
    ctx.fillText(`⭐ Score: ${score}`, 250, 30);
    
    // 关卡
    ctx.fillStyle = '#87ceeb';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`🎯 Level: ${currentLevel}`, 400, 30);
    
    // 连击
    if (combo > 0) {
      ctx.fillStyle = '#ff69b4';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`🔥 Combo: ${combo}`, 520, 30);
    }
    
    // 武器
    ctx.fillStyle = '#98fb98';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`🔫 ${selectedWeapon?.name || 'Weapon'}`, 650, 30);

    // 连击提示
    if (showCombo && combo > 0) {
      ctx.save();
      const scale = 1 + Math.sin(Date.now() * 0.01) * 0.1;
      ctx.translate(400, 300);
      ctx.scale(scale, scale);
      
      ctx.font = 'bold 48px Arial';
      ctx.fillStyle = '#ffd700';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#ff8c00';
      ctx.lineWidth = 3;
      ctx.strokeText(`${combo} COMBO!`, 0, 0);
      ctx.fillText(`${combo} COMBO!`, 0, 0);
      
      ctx.restore();
    }
    
    ctx.textBaseline = 'alphabetic';
  };

  // 处理武器选择
  useEffect(() => {
    const handleWeaponSwitch = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '5') {
        const index = parseInt(e.key) - 1;
        if (weapons[index]) {
          setSelectedWeapon(weapons[index]);
        }
      }
    };

    window.addEventListener('keydown', handleWeaponSwitch);
    return () => window.removeEventListener('keydown', handleWeaponSwitch);
  }, [weapons, setSelectedWeapon]);

  if (!selectedCharacter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-gray-900 flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold text-white mb-6">
          请先选择角色
        </h1>
        <button
          onClick={onReturnToMain}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-10 py-4 rounded-2xl text-xl font-bold hover:from-green-400 hover:to-green-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          返回主菜单
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-gray-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-10 animate-pulse"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 5 + 3}s`,
              animationDelay: `${Math.random() * 2}s`,
              filter: 'blur(20px)'
            }}
          />
        ))}
      </div>

      <h1 className="text-4xl font-bold text-white mb-6 relative z-10">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400">
          🎮 音乐 Roguelike
        </span>
      </h1>

      <div className="relative z-10">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border-4 border-purple-500 rounded-2xl shadow-2xl shadow-purple-500/50"
        />

        {/* 暂停菜单 */}
        {isPaused && (
          <div className="absolute inset-0 bg-black bg-opacity-85 flex items-center justify-center rounded-2xl backdrop-blur-sm">
            <div className="text-center p-8 bg-gray-800 bg-opacity-90 rounded-3xl border-2 border-purple-500">
              <h2 className="text-5xl font-bold text-white mb-8">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                  ⏸️ 游戏暂停
                </span>
              </h2>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setIsPaused(false)}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-10 py-4 rounded-2xl text-xl font-bold hover:from-green-400 hover:to-green-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  ▶️ 继续游戏
                </button>
                <button
                  onClick={() => {
                    // 重置游戏状态
                    gameStore.resetGame();
                    setIsPaused(false);
                    // 返回主菜单
                    onReturnToMain?.();
                  }}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-10 py-4 rounded-2xl text-xl font-bold hover:from-red-400 hover:to-red-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  🏠 返回主页
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 游戏结束菜单 */}
        {isGameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-85 flex items-center justify-center rounded-2xl backdrop-blur-sm">
            <div className="text-center p-8 bg-gray-800 bg-opacity-90 rounded-3xl border-2 border-red-500">
              <h2 className="text-5xl font-bold text-white mb-8">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-purple-400">
                  💀 游戏结束
                </span>
              </h2>
              <div className="text-white text-2xl mb-8">
                <p>最终得分: {score}</p>
                <p>最高连击: {maxCombo}</p>
                <p>到达关卡: {currentLevel}</p>
              </div>
              <button
                onClick={() => {
                  // 重置游戏状态
                  gameStore.resetGame();
                  // 返回主菜单
                  onReturnToMain?.();
                }}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-10 py-4 rounded-2xl text-xl font-bold hover:from-green-400 hover:to-green-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                🏠 返回主页
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 节奏指示器 */}
      <RhythmIndicator rhythmPoints={rhythmPoints} currentTime={currentTime} />

      {/* 控制说明 */}
      <div className="mt-8 bg-gray-800 bg-opacity-85 p-8 rounded-3xl border border-purple-400 relative z-10 max-w-4xl">
        <h3 className="text-2xl text-white font-bold mb-6 text-center">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
            🎯 游戏说明
          </span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
          <div className="space-y-3">
            <p className="flex items-center gap-3">
              <span className="text-2xl">🎮</span>
              <strong className="text-white text-lg">移动</strong>: <span>WASD 或 方向键</span>
            </p>
            <p className="flex items-center gap-3">
              <span className="text-2xl">🔫</span>
              <strong className="text-white text-lg">射击</strong>: <span>空格键</span>
            </p>
            <p className="flex items-center gap-3">
              <span className="text-2xl">🔄</span>
              <strong className="text-white text-lg">切换武器</strong>: <span>1-5</span>
            </p>
          </div>
          <div className="space-y-3">
            <p className="flex items-center gap-3">
              <span className="text-2xl">⏸️</span>
              <strong className="text-white text-lg">暂停</strong>: <span>P键</span>
            </p>
            <p className="flex items-center gap-3">
              <span className="text-2xl">🎵</span>
              <strong className="text-white text-lg">节奏攻击</strong>: <span>在节拍点攻击获得伤害加成</span>
            </p>
            <p className="flex items-center gap-3">
              <span className="text-2xl">💡</span>
              <strong className="text-white text-lg">提示</strong>: <span>注意节奏指示器，跟随音乐节奏战斗</span>
            </p>
          </div>
        </div>
      </div>

      {/* 音乐播放器 */}
      {currentSong && (
        <div className="mt-8 bg-gray-800 bg-opacity-85 p-6 rounded-3xl border border-pink-400 flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center animate-pulse shadow-lg">
            <span className="text-3xl">🎵</span>
          </div>
          <div className="flex-1">
            <div className="text-white font-bold text-lg">{currentSong.title}</div>
            <div className="text-gray-400">{currentSong.artist}</div>
          </div>
          <button 
            onClick={() => {
              if (audioRef.current) {
                if (audioRef.current.paused) {
                  audioRef.current.play();
                } else {
                  audioRef.current.pause();
                }
              }
            }}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-full hover:from-green-400 hover:to-green-500 transition-all duration-300 transform hover:scale-110 shadow-lg"
          >
            <span className="text-2xl">▶️</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Game;

- [ ] **Step 2: 提交更改**

```bash
git add src/pages/Game.tsx
git commit -m "feat: refactor game page with rhythm system"
```

### 任务 8: 更新首页和 App.tsx

**Files:**
- Modify: `src/pages/Home.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: 更新首页**

```tsx
// src/pages/Home.tsx
import React, { useState } from 'react';
import useGameStore from '../store/gameStore';

interface HomeProps {
  onStartGame: () => void;
  onCharacterSelect: () => void;
  onPlaylistImport: () => void;
}

const Home: React.FC<HomeProps> = ({ onStartGame, onCharacterSelect, onPlaylistImport }) => {
  const { resetGame } = useGameStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-gray-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-10 animate-pulse"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 5 + 3}s`,
              animationDelay: `${Math.random() * 2}s`,
              filter: 'blur(20px)'
            }}
          />
        ))}
      </div>

      <h1 className="text-6xl font-bold text-white mb-12 relative z-10 text-center">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400">
          🎵 音乐 Roguelike
        </span>
      </h1>

      <div className="grid grid-cols-1 gap-6 max-w-md relative z-10">
        <button
          onClick={onCharacterSelect}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-6 rounded-2xl text-2xl font-bold hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-4"
        >
          <span className="text-3xl">🎮</span>
          选择角色
        </button>
        <button
          onClick={onPlaylistImport}
          className="bg-gradient-to-r from-pink-600 to-red-600 text-white px-8 py-6 rounded-2xl text-2xl font-bold hover:from-pink-500 hover:to-red-500 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-4"
        >
          <span className="text-3xl">🎵</span>
          导入歌单
        </button>
        <button
          onClick={onStartGame}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-6 rounded-2xl text-2xl font-bold hover:from-green-500 hover:to-emerald-500 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-4"
        >
          <span className="text-3xl">▶️</span>
          开始游戏
        </button>
      </div>

      <div className="mt-12 text-gray-300 text-center relative z-10">
        <p>融合音乐节奏与 Roguelike 玩法的全新体验</p>
        <p className="mt-2">跟随音乐节拍，击败敌人，升级角色！</p>
      </div>
    </div>
  );
};

export default Home;
```

- [ ] **Step 2: 更新 App.tsx**

```tsx
// src/App.tsx
import React, { useState } from 'react';
import Home from './pages/Home';
import CharacterSelect from './pages/CharacterSelect';
import PlaylistImport from './pages/PlaylistImport';
import Game from './pages/Game';
import Upgrade from './pages/Upgrade';
import './index.css';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'character' | 'playlist' | 'game' | 'upgrade'>('home');

  const handleStartGame = () => {
    setCurrentPage('game');
  };

  const handleCharacterSelect = () => {
    setCurrentPage('character');
  };

  const handlePlaylistImport = () => {
    setCurrentPage('playlist');
  };

  const handleReturnToMain = () => {
    setCurrentPage('home');
  };

  const handleLevelComplete = () => {
    setCurrentPage('upgrade');
  };

  const handleUpgradeComplete = () => {
    setCurrentPage('game');
  };

  const handleBack = () => {
    setCurrentPage('home');
  };

  const handleNextFromCharacter = () => {
    setCurrentPage('playlist');
  };

  const handleNextFromPlaylist = () => {
    setCurrentPage('game');
  };

  return (
    <div className="App">
      {currentPage === 'home' && (
        <Home
          onStartGame={handleStartGame}
          onCharacterSelect={handleCharacterSelect}
          onPlaylistImport={handlePlaylistImport}
        />
      )}
      {currentPage === 'character' && (
        <CharacterSelect
          onNext={handleNextFromCharacter}
          onBack={handleBack}
        />
      )}
      {currentPage === 'playlist' && (
        <PlaylistImport
          onNext={handleNextFromPlaylist}
          onBack={handleBack}
        />
      )}
      {currentPage === 'game' && (
        <Game
          onReturnToMain={handleReturnToMain}
          onLevelComplete={handleLevelComplete}
        />
      )}
      {currentPage === 'upgrade' && (
        <Upgrade
          onNext={handleUpgradeComplete}
        />
      )}
    </div>
  );
}

export default App;
```

- [ ] **Step 3: 提交更改**

```bash
git add src/pages/Home.tsx src/App.tsx
git commit -m "feat: update home page and app structure"
```

### 任务 9: 构建和部署

**Files:**
- No files to modify

- [ ] **Step 1: 构建项目**

```bash
npm run build
```

- [ ] **Step 2: 部署到 GitHub Pages**

```bash
npm run deploy
```

- [ ] **Step 3: 验证部署**

访问部署后的网站，确保游戏能够正常运行。

## 执行计划

**Plan complete and saved to `docs/superpowers/plans/2026-04-20-music-roguelike-game-implementation.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**