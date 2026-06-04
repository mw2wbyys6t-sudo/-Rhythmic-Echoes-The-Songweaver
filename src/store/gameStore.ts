import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Character {
  id: string;
  name: string;
  description: string;
  health: number;
  maxHealth: number;
  damage: number;
  speed: number;
  skills: Skill[];
  image: string;
  clothes: string;
  skin: string;
  hair: string;
  gender: string;
  voiceType: string;
  language: string;
}

export interface Weapon {
  id: string;
  name: string;
  damage: number;
  fireRate: number;
  ammo: number;
  rhythmBonus: number;
  type: 'pistol' | 'shotgun' | 'rifle' | 'melee' | 'sniper' | 'rocket' | 'laser';
  bulletCount: number;
  bulletSpeed: number;
  bulletSize: number;
  color: string;
  element: 'none' | 'fire' | 'ice' | 'lightning' | 'poison' | 'holy' | 'shadow';
  elementEffect: string; // 元素效果描述
  elementChance: number; // 元素效果触发几率
  elementDuration: number; // 元素效果持续时间
  description: string;
  unlockLevel: number;
}

export interface Enemy {
  id: string;
  name: string;
  health: number;
  damage: number;
  speed: number;
  type: string;
  rhythmPattern: string[];
  x: number;
  y: number;
  size: number;
  color: string;
  element: 'none' | 'fire' | 'ice' | 'lightning' | 'poison' | 'holy' | 'shadow';
  resistances: {
    fire: number;
    ice: number;
    lightning: number;
    poison: number;
    holy: number;
    shadow: number;
  };
  frozen?: boolean;
  burning?: boolean;
  poisoned?: boolean;
  shocked?: boolean;
  // 元素效果持续时间
  burningDuration?: number;
  poisonedDuration?: number;
  shockedDuration?: number;
  frozenDuration?: number;
}

export interface PowerUp {
  id: string;
  type: 'health' | 'damage' | 'speed' | 'mana' | 'multishot' | 'rapidfire' | 'shield' | 'critical' | 'pierce' | 'lifeSteal' | 'invincibility';
  name: string;
  value: number;
  color: string;
  x: number;
  y: number;
  duration: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  damage: number;
  type: 'aoe' | 'single' | 'heal' | 'buff';
  icon: string;
  unlockLevel: number;
}

interface Map {
  id: string;
  name: string;
  image: string;
}

interface Song {
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
interface MusicPowerState {
  musicIntensity: number; // 0-100
  rhythmBonus: number; // Multiplier for on-beat hits
  shieldStrength: number; // Shield from music
  attackBoost: number; // Attack boost from music
  speedBoost: number; // Speed boost from music
  auraActive: boolean; // Music aura effect
  songPhase: 'build' | 'climax' | 'calm'; // Song phase
}

interface GameState {
  characters: Character[];
  selectedCharacter: Character | null;
  character: Character;
  setCharacter: (character: Character) => void;
  setSelectedCharacter: (character: Character) => void;
  
  weapons: Weapon[];
  selectedWeapon: Weapon | null;
  setSelectedWeapon: (weapon: Weapon) => void;
  
  skills: Skill[];
  addSkill: (skill: Skill) => void;
  unlockedSkills: string[];
  unlockSkill: (skillId: string) => void;
  
  selectedMap: Map | null;
  setSelectedMap: (map: Map) => void;
  
  playlist: Song[];
  addSong: (song: Song) => void;
  removeSong: (songId: string) => void;
  setPlaylist: (songs: Song[]) => void;
  
  currentLevel: number;
  setCurrentLevel: (level: number | ((prev: number) => number)) => void;
  score: number;
  setScore: (score: number | ((prev: number) => number)) => void;
  health: number;
  setHealth: (health: number | ((prev: number) => number)) => void;
  experience: number;
  setExperience: (experience: number | ((prev: number) => number)) => void;
  level: number;
  setLevel: (level: number | ((prev: number) => number)) => void;
  maxHealth: number;
  
  powerUps: PowerUp[];
  addPowerUp: (powerUp: PowerUp) => void;
  
  enemies: Enemy[];
  setEnemies: (enemies: Enemy[] | ((prev: Enemy[]) => Enemy[])) => void;
  
  currentSong: Song | null;
  setCurrentSong: (song: Song | null) => void;
  rhythmPoints: number[];
  setRhythmPoints: (points: number[]) => void;
  
  isGameOver: boolean;
  setIsGameOver: (over: boolean) => void;
  resetGame: () => void;
  rewards: { type: string; value: number; name: string }[];
  setRewards: (rewards: { type: string; value: number; name: string }[]) => void;
  
  coins: number;
  setCoins: (coins: number | ((prev: number) => number)) => void;
  
  buffs: { [key: string]: { active: boolean; duration: number; value: number } };
  applyBuff: (type: string, duration: number, value: number) => void;
  updateBuffs: (deltaTime: number) => void;
  
  // Music power system - Macross style
  musicPower: MusicPowerState;
  setMusicPower: (power: Partial<MusicPowerState>) => void;
  
  // 游戏设置
  settings: {
    musicVolume: number;
    soundVolume: number;
    difficulty: number; // 1-10
    gameMode: 'normal' | 'endless' | 'bossRush';
  };
  setSettings: (settings: Partial<GameState['settings']>) => void;
  
  // 存档功能
  saveGame: () => boolean;
  loadGame: () => boolean;
  deleteSave: () => boolean;
}

const defaultCharacter: Character = {
  id: 'default',
  name: '默认角色',
  description: '默认角色',
  health: 100,
  maxHealth: 100,
  damage: 15,
  speed: 6,
  skills: [],
  image: 'default.png',
  clothes: 'default',
  skin: 'default',
  hair: 'default',
  gender: 'male',
  voiceType: '大叔',
  language: 'zh'
};

const weapons: Weapon[] = [
  {
    id: 'pistol',
    name: '音乐手枪',
    damage: 20,
    fireRate: 0.5,
    ammo: Infinity,
    rhythmBonus: 1.5,
    type: 'pistol',
    bulletCount: 1,
    bulletSpeed: 12,
    bulletSize: 5,
    color: '#FFD700',
    element: 'none',
    elementEffect: '无元素效果',
    elementChance: 0,
    elementDuration: 0,
    description: '基础武器，稳定可靠',
    unlockLevel: 1
  },
  {
    id: 'shotgun',
    name: '节拍喷子',
    damage: 35,
    fireRate: 0.8,
    ammo: Infinity,
    rhythmBonus: 2.0,
    type: 'shotgun',
    bulletCount: 5,
    bulletSpeed: 10,
    bulletSize: 4,
    color: '#FF6B6B',
    element: 'fire',
    elementEffect: '燃烧效果，持续造成伤害',
    elementChance: 0.6,
    elementDuration: 3000,
    description: '近距离威力巨大，发射多颗子弹',
    unlockLevel: 2
  },
  {
    id: 'guitar',
    name: '电吉他',
    damage: 50,
    fireRate: 1.2,
    ammo: Infinity,
    rhythmBonus: 2.5,
    type: 'melee',
    bulletCount: 1,
    bulletSpeed: 0,
    bulletSize: 30,
    color: '#00FFFF',
    element: 'lightning',
    elementEffect: '电击效果，减速敌人',
    elementChance: 0.8,
    elementDuration: 2000,
    description: '近战武器，攻击范围大',
    unlockLevel: 3
  },
  {
    id: 'rifle',
    name: '节奏步枪',
    damage: 40,
    fireRate: 0.2,
    ammo: Infinity,
    rhythmBonus: 1.8,
    type: 'rifle',
    bulletCount: 1,
    bulletSpeed: 18,
    bulletSize: 6,
    color: '#00FF00',
    element: 'poison',
    elementEffect: '中毒效果，持续造成伤害',
    elementChance: 0.7,
    elementDuration: 4000,
    description: '射速极快，适合远距离打击',
    unlockLevel: 5
  },
  {
    id: 'sniper',
    name: '旋律狙击',
    damage: 150,
    fireRate: 2.0,
    ammo: Infinity,
    rhythmBonus: 3.0,
    type: 'sniper',
    bulletCount: 1,
    bulletSpeed: 25,
    bulletSize: 10,
    color: '#9932CC',
    element: 'ice',
    elementEffect: '冰冻效果，停止敌人移动',
    elementChance: 1.0,
    elementDuration: 2000,
    description: '单发伤害极高，穿透敌人',
    unlockLevel: 8
  },
  {
    id: 'rocket',
    name: '摇滚火箭炮',
    damage: 200,
    fireRate: 3.0,
    ammo: Infinity,
    rhythmBonus: 3.5,
    type: 'rocket',
    bulletCount: 1,
    bulletSpeed: 8,
    bulletSize: 20,
    color: '#FF4500',
    element: 'fire',
    elementEffect: '爆炸燃烧效果，范围伤害',
    elementChance: 1.0,
    elementDuration: 4000,
    description: '爆炸伤害，范围攻击',
    unlockLevel: 12
  },
  {
    id: 'laser',
    name: '激光琴',
    damage: 80,
    fireRate: 0.1,
    ammo: Infinity,
    rhythmBonus: 2.2,
    type: 'laser',
    bulletCount: 1,
    bulletSpeed: 30,
    bulletSize: 8,
    color: '#FF00FF',
    element: 'lightning',
    elementEffect: '持续电击效果，大幅减速',
    elementChance: 0.9,
    elementDuration: 3000,
    description: '持续发射激光，酷炫视觉效果',
    unlockLevel: 15
  }
];

const skills: Skill[] = [
  {
    id: 'aoe_clear',
    name: '音浪风暴',
    description: '清除所有靠近的敌人',
    cooldown: 10,
    damage: 500,
    type: 'aoe',
    icon: '🌊',
    unlockLevel: 1
  },
  {
    id: 'heal',
    name: '节奏治愈',
    description: '恢复所有生命值',
    cooldown: 20,
    damage: 0,
    type: 'heal',
    icon: '💚',
    unlockLevel: 3
  },
  {
    id: 'rapid_fire',
    name: '急速乐章',
    description: '5秒内射速提升300%',
    cooldown: 15,
    damage: 0,
    type: 'buff',
    icon: '⚡',
    unlockLevel: 5
  },
  {
    id: 'shield',
    name: '音符护盾',
    description: '生成3秒无敌护盾',
    cooldown: 25,
    damage: 0,
    type: 'buff',
    icon: '🛡️',
    unlockLevel: 7
  },
  {
    id: 'damage_boost',
    name: '死亡旋律',
    description: '8秒内伤害提升200%',
    cooldown: 18,
    damage: 0,
    type: 'buff',
    icon: '💥',
    unlockLevel: 10
  },
  {
    id: 'black_hole',
    name: '黑洞引力',
    description: '将所有敌人吸引到一点',
    cooldown: 30,
    damage: 200,
    type: 'aoe',
    icon: '🌀',
    unlockLevel: 15
  },
  {
    id: 'speed_boost',
    name: '音速冲刺',
    description: '10秒内移动速度提升100%',
    cooldown: 20,
    damage: 0,
    type: 'buff',
    icon: '💨',
    unlockLevel: 8
  },
  {
    id: 'multishot',
    name: '多重射击',
    description: '10秒内每次射击发射额外2发子弹',
    cooldown: 15,
    damage: 0,
    type: 'buff',
    icon: '🔫',
    unlockLevel: 12
  },
  {
    id: 'time_stop',
    name: '时间停止',
    description: '冻结所有敌人3秒',
    cooldown: 25,
    damage: 0,
    type: 'aoe',
    icon: '⏸️',
    unlockLevel: 18
  },
  {
    id: 'explosion',
    name: '爆炸音符',
    description: '在指定位置引发爆炸，造成巨大伤害',
    cooldown: 20,
    damage: 800,
    type: 'aoe',
    icon: '💣',
    unlockLevel: 20
  }
];

const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      characters: [
        {
          id: 'idol',
          name: '偶像歌手',
          description: '通过音乐增强战斗力的歌手',
          health: 100,
          maxHealth: 100,
          damage: 15,
          speed: 6,
          skills: [],
          image: 'idol.png',
          clothes: 'default',
          skin: 'default',
          hair: 'default',
          gender: 'female',
          voiceType: 'loli',
          language: 'zh'
        },
        {
          id: 'guitarist',
          name: '吉他手',
          description: '使用吉他作为武器的摇滚战士',
          health: 120,
          maxHealth: 120,
          damage: 25,
          speed: 5,
          skills: [],
          image: 'guitarist.png',
          clothes: 'combat',
          skin: 'tan',
          hair: 'spiky',
          gender: 'male',
          voiceType: '大叔',
          language: 'zh'
        }
      ],
      selectedCharacter: null,
      setSelectedCharacter: (selectedCharacter) => set({ selectedCharacter }),
      character: defaultCharacter,
      setCharacter: (character) => set({ character }),
      
      weapons: weapons,
      selectedWeapon: null,
      setSelectedWeapon: (selectedWeapon) => set({ selectedWeapon }),
      
      skills: skills,
      addSkill: (skill) => set((state) => ({ skills: [...state.skills, skill] })),
      unlockedSkills: ['aoe_clear'],
      unlockSkill: (skillId) => set((state) => ({ 
        unlockedSkills: [...state.unlockedSkills, skillId] 
      })),
      
      selectedMap: null,
      setSelectedMap: (selectedMap) => set({ selectedMap }),
      
      playlist: [],
      addSong: (song) => set((state) => ({ playlist: [...state.playlist, song] })),
      removeSong: (songId) => set((state) => ({
        playlist: state.playlist.filter(song => song.id !== songId)
      })),
      setPlaylist: (playlist) => set({ playlist }),
      
      currentLevel: 1,
      setCurrentLevel: (currentLevel) => set((state) => ({ 
        currentLevel: typeof currentLevel === 'function' ? currentLevel(state.currentLevel) : currentLevel 
      })),
      score: 0,
      setScore: (score) => set((state) => ({ 
        score: typeof score === 'function' ? score(state.score) : score 
      })),
      health: 100,
      maxHealth: 100,
      setHealth: (health) => set((state) => {
        const newHealth = typeof health === 'function' ? health(state.health) : health;
        return { health: Math.min(Math.max(0, newHealth), state.maxHealth) };
      }),
      experience: 0,
      setExperience: (experience) => set((state) => {
        let newLevel = state.level;
        let newExp = typeof experience === 'function' ? experience(state.experience) : experience;
        const requiredExp = state.level * 100;
        
        while (newExp >= requiredExp) {
          newLevel++;
          newExp -= requiredExp;
        }
        
        if (newLevel > state.level) {
          const newSkills = skills.filter(s => s.unlockLevel === newLevel);
          return { 
            experience: newExp, 
            level: newLevel,
            unlockedSkills: [...state.unlockedSkills, ...newSkills.map(s => s.id)]
          };
        }
        
        return { experience: newExp };
      }),
      level: 1,
      setLevel: (level) => set((state) => ({ 
        level: typeof level === 'function' ? level(state.level) : level 
      })),
      
      powerUps: [],
      addPowerUp: (powerUp) => set((state) => ({ powerUps: [...state.powerUps, powerUp] })),
      
      enemies: [],
      setEnemies: (enemies) => set((state) => ({ 
        enemies: typeof enemies === 'function' ? enemies(state.enemies) : enemies 
      })),
      
      currentSong: null,
      setCurrentSong: (currentSong) => set({ currentSong }),
      rhythmPoints: [],
      setRhythmPoints: (rhythmPoints) => set({ rhythmPoints }),
      
      isGameOver: false,
      setIsGameOver: (isGameOver) => set({ isGameOver }),
      rewards: [],
      setRewards: (rewards) => set({ rewards }),
      
      coins: 0,
      setCoins: (coins) => set((state) => ({ 
        coins: typeof coins === 'function' ? coins(state.coins) : coins 
      })),
      
      buffs: {},
      applyBuff: (type: string, duration: number, value: number) => 
        set((state) => ({ 
          buffs: { 
            ...state.buffs, 
            [type]: { active: true, duration, value } 
          } 
        })),
      updateBuffs: (deltaTime: number) => 
        set((state) => {
          const newBuffs = { ...state.buffs };
          Object.keys(newBuffs).forEach(key => {
            if (newBuffs[key].active) {
              newBuffs[key].duration -= deltaTime;
              if (newBuffs[key].duration <= 0) {
                newBuffs[key].active = false;
              }
            }
          });
          return { buffs: newBuffs };
        }),
      
      // Music power system - Macross style
      musicPower: {
        musicIntensity: 0,
        rhythmBonus: 1.0,
        shieldStrength: 0,
        attackBoost: 0,
        speedBoost: 0,
        auraActive: false,
        songPhase: 'calm'
      },
      setMusicPower: (power) => set((state) => ({
        musicPower: { ...state.musicPower, ...power }
      })),
      
      // 游戏设置
      settings: {
        musicVolume: 0.7,
        soundVolume: 1.0,
        difficulty: 1,
        gameMode: 'normal'
      },
      setSettings: (settings) => set((state) => ({
        settings: { ...state.settings, ...settings }
      })),
      
      resetGame: () => set({
        currentLevel: 1,
        score: 0,
        health: 100,
        experience: 0,
        level: 1,
        maxHealth: 100,
        enemies: [],
        powerUps: [],
        isGameOver: false,
        character: defaultCharacter,
        buffs: {},
        coins: get().coins,
        musicPower: {
          musicIntensity: 0,
          rhythmBonus: 1.0,
          shieldStrength: 0,
          attackBoost: 0,
          speedBoost: 0,
          auraActive: false,
          songPhase: 'calm'
        }
      }),
      
      // 存档功能
      saveGame: () => {
        const state = get();
        const saveData = {
          timestamp: Date.now(),
          character: state.character,
          selectedCharacter: state.selectedCharacter,
          selectedWeapon: state.selectedWeapon,
          level: state.level,
          experience: state.experience,
          currentLevel: state.currentLevel,
          score: state.score,
          coins: state.coins,
          unlockedSkills: state.unlockedSkills,
          playlist: state.playlist,
          maxHealth: state.maxHealth
        };
        localStorage.setItem('rhythm-warfare-save', JSON.stringify(saveData));
        return true;
      },
      
      loadGame: () => {
        const saveData = localStorage.getItem('rhythm-warfare-save');
        if (saveData) {
          try {
            const data = JSON.parse(saveData);
            set({
              character: data.character,
              selectedCharacter: data.selectedCharacter,
              selectedWeapon: data.selectedWeapon,
              level: data.level,
              experience: data.experience,
              currentLevel: data.currentLevel,
              score: data.score,
              coins: data.coins,
              unlockedSkills: data.unlockedSkills,
              playlist: data.playlist,
              maxHealth: data.maxHealth
            });
            return true;
          } catch (error) {
            console.error('Failed to load save data:', error);
            return false;
          }
        }
        return false;
      },
      
      deleteSave: () => {
        localStorage.removeItem('rhythm-warfare-save');
        return true;
      }
    }),
    {
      name: 'rhythm-warfare-game'
    }
  )
);

export default useGameStore;
