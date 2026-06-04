import React, { useEffect, useRef, useReducer, useCallback } from 'react';
import useGameStore from '../store/gameStore';
import { roguelikeGenerator } from '../utils/roguelikeGenerator';
import { musicAnalyzer } from '../utils/musicAnalyzer';
import { soundManager } from '../utils/soundManager';
import type { Enemy, Weapon, Skill, PowerUp } from '../store/gameStore';

// 空间分区相关类型和函数
interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  color: string;
  size: number;
  onBeat: boolean;
  weaponType: string;
  pierce: number;
}

interface GridCell {
  enemies: Enemy[];
  bullets: Bullet[];
}

// 空间分区类 - 优化版本
class SpatialGrid {
  private grid: Map<string, GridCell>;
  private cellSize: number;

  constructor(cellSize: number) {
    this.grid = new Map();
    this.cellSize = cellSize;
  }

  // 获取格子坐标
  private getCellKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

  // 清除网格 - 优化：复用数组
  clear(): void {
    // 复用现有数组，避免频繁创建新数组
    this.grid.forEach(cell => {
      cell.enemies.length = 0;
      cell.bullets.length = 0;
    });
  }

  // 添加敌人到网格
  addEnemy(enemy: Enemy): void {
    const key = this.getCellKey(enemy.x, enemy.y);
    let cell = this.grid.get(key);
    if (!cell) {
      cell = { enemies: [], bullets: [] };
      this.grid.set(key, cell);
    }
    cell.enemies.push(enemy);
  }

  // 添加子弹到网格
  addBullet(bullet: Bullet): void {
    const key = this.getCellKey(bullet.x, bullet.y);
    let cell = this.grid.get(key);
    if (!cell) {
      cell = { enemies: [], bullets: [] };
      this.grid.set(key, cell);
    }
    cell.bullets.push(bullet);
  }

  // 获取相邻格子的敌人和子弹
  getNearbyObjects(x: number, y: number): { enemies: Enemy[]; bullets: Bullet[] } {
    const nearbyEnemies: Enemy[] = [];
    const nearbyBullets: Bullet[] = [];

    // 检查当前格子和周围8个格子
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = this.getCellKey(x + dx * this.cellSize, y + dy * this.cellSize);
        const cell = this.grid.get(key);
        if (cell) {
          nearbyEnemies.push(...cell.enemies);
          nearbyBullets.push(...cell.bullets);
        }
      }
    }

    return { enemies: nearbyEnemies, bullets: nearbyBullets };
  }

  // 获取特定区域的对象 - 新增方法
  getObjectsInArea(x: number, y: number, radius: number): { enemies: Enemy[]; bullets: Bullet[] } {
    const nearbyEnemies: Enemy[] = [];
    const nearbyBullets: Bullet[] = [];
    const cellsToCheck = Math.ceil(radius / this.cellSize);

    for (let dx = -cellsToCheck; dx <= cellsToCheck; dx++) {
      for (let dy = -cellsToCheck; dy <= cellsToCheck; dy++) {
        const key = this.getCellKey(x + dx * this.cellSize, y + dy * this.cellSize);
        const cell = this.grid.get(key);
        if (cell) {
          // 只添加在半径内的对象
          cell.enemies.forEach(enemy => {
            const dx = enemy.x - x;
            const dy = enemy.y - y;
            if (Math.sqrt(dx * dx + dy * dy) <= radius) {
              nearbyEnemies.push(enemy);
            }
          });
          cell.bullets.forEach(bullet => {
            const dx = bullet.x - x;
            const dy = bullet.y - y;
            if (Math.sqrt(dx * dx + dy * dy) <= radius) {
              nearbyBullets.push(bullet);
            }
          });
        }
      }
    }

    return { enemies: nearbyEnemies, bullets: nearbyBullets };
  }
}

// 游戏状态类型定义
interface GameState {
  isPaused: boolean;
  isInvincible: boolean;
  combo: number;
  maxCombo: number;
  showCombo: boolean;
  bullets: Bullet[];
  powerUps: PowerUp[];
  player: { x: number; y: number };
  isShooting: boolean;
  screenShake: number;
  particles: Particle[];
  skillCooldowns: SkillCooldown;
  showLevelUp: boolean;
  lastLevel: number;
  mousePos: { x: number; y: number };
  activeEffects: string[];
  shield: number;
  levelCompleted: boolean;
  musicIntensity: number;
  isOnBeat: boolean;
  beatDetected: boolean;
  isMobile: boolean;
  joystickActive: boolean;
  joystickTouchId: number | null;
  shootTouchId: number | null;
  joystickPos: { x: number; y: number };
  joystickStart: { x: number; y: number };
  joystickOffset: { x: number; y: number };
}

// Action类型定义
type GameAction =
  | { type: 'SET_PAUSED'; payload: boolean }
  | { type: 'SET_INVINCIBLE'; payload: boolean }
  | { type: 'SET_COMBO'; payload: number }
  | { type: 'SET_MAX_COMBO'; payload: number }
  | { type: 'SET_SHOW_COMBO'; payload: boolean }
  | { type: 'SET_BULLETS'; payload: Bullet[] }
  | { type: 'SET_POWER_UPS'; payload: PowerUp[] }
  | { type: 'SET_PLAYER'; payload: { x: number; y: number } }
  | { type: 'SET_IS_SHOOTING'; payload: boolean }
  | { type: 'SET_SCREEN_SHAKE'; payload: number }
  | { type: 'SET_PARTICLES'; payload: Particle[] }
  | { type: 'SET_SKILL_COOLDOWNS'; payload: SkillCooldown }
  | { type: 'SET_SHOW_LEVEL_UP'; payload: boolean }
  | { type: 'SET_LAST_LEVEL'; payload: number }
  | { type: 'SET_MOUSE_POS'; payload: { x: number; y: number } }
  | { type: 'SET_ACTIVE_EFFECTS'; payload: string[] }
  | { type: 'SET_SHIELD'; payload: number }
  | { type: 'SET_LEVEL_COMPLETED'; payload: boolean }
  | { type: 'SET_MUSIC_INTENSITY'; payload: number }
  | { type: 'SET_IS_ON_BEAT'; payload: boolean }
  | { type: 'SET_BEAT_DETECTED'; payload: boolean }
  | { type: 'SET_IS_MOBILE'; payload: boolean }
  | { type: 'SET_JOYSTICK_ACTIVE'; payload: boolean }
  | { type: 'SET_JOYSTICK_TOUCH_ID'; payload: number | null }
  | { type: 'SET_SHOOT_TOUCH_ID'; payload: number | null }
  | { type: 'SET_JOYSTICK_POS'; payload: { x: number; y: number } }
  | { type: 'SET_JOYSTICK_START'; payload: { x: number; y: number } }
  | { type: 'SET_JOYSTICK_OFFSET'; payload: { x: number; y: number } }
  | { type: 'RESET_GAME' };

// Reducer函数
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SET_PAUSED':
      return { ...state, isPaused: action.payload };
    case 'SET_INVINCIBLE':
      return { ...state, isInvincible: action.payload };
    case 'SET_COMBO':
      return { ...state, combo: action.payload };
    case 'SET_MAX_COMBO':
      return { ...state, maxCombo: action.payload };
    case 'SET_SHOW_COMBO':
      return { ...state, showCombo: action.payload };
    case 'SET_BULLETS':
      return { ...state, bullets: action.payload };
    case 'SET_POWER_UPS':
      return { ...state, powerUps: action.payload };
    case 'SET_PLAYER':
      return { ...state, player: action.payload };
    case 'SET_IS_SHOOTING':
      return { ...state, isShooting: action.payload };
    case 'SET_SCREEN_SHAKE':
      return { ...state, screenShake: action.payload };
    case 'SET_PARTICLES':
      return { ...state, particles: action.payload };
    case 'SET_SKILL_COOLDOWNS':
      return { ...state, skillCooldowns: action.payload };
    case 'SET_SHOW_LEVEL_UP':
      return { ...state, showLevelUp: action.payload };
    case 'SET_LAST_LEVEL':
      return { ...state, lastLevel: action.payload };
    case 'SET_MOUSE_POS':
      return { ...state, mousePos: action.payload };
    case 'SET_ACTIVE_EFFECTS':
      return { ...state, activeEffects: action.payload };
    case 'SET_SHIELD':
      return { ...state, shield: action.payload };
    case 'SET_LEVEL_COMPLETED':
      return { ...state, levelCompleted: action.payload };
    case 'SET_MUSIC_INTENSITY':
      return { ...state, musicIntensity: action.payload };
    case 'SET_IS_ON_BEAT':
      return { ...state, isOnBeat: action.payload };
    case 'SET_BEAT_DETECTED':
      return { ...state, beatDetected: action.payload };
    case 'SET_IS_MOBILE':
      return { ...state, isMobile: action.payload };
    case 'SET_JOYSTICK_ACTIVE':
      return { ...state, joystickActive: action.payload };
    case 'SET_JOYSTICK_TOUCH_ID':
      return { ...state, joystickTouchId: action.payload };
    case 'SET_SHOOT_TOUCH_ID':
      return { ...state, shootTouchId: action.payload };
    case 'SET_JOYSTICK_POS':
      return { ...state, joystickPos: action.payload };
    case 'SET_JOYSTICK_START':
      return { ...state, joystickStart: action.payload };
    case 'SET_JOYSTICK_OFFSET':
      return { ...state, joystickOffset: action.payload };
    case 'RESET_GAME':
      return initialGameState;
    default:
      return state;
  }
};

// 初始游戏状态
const initialGameState: GameState = {
  isPaused: false,
  isInvincible: false,
  combo: 0,
  maxCombo: 0,
  showCombo: false,
  bullets: [],
  powerUps: [],
  player: { x: 400, y: 300 },
  isShooting: false,
  screenShake: 0,
  particles: [],
  skillCooldowns: {},
  showLevelUp: false,
  lastLevel: 1,
  mousePos: { x: 400, y: 300 },
  activeEffects: [],
  shield: 0,
  levelCompleted: false,
  musicIntensity: 0,
  isOnBeat: false,
  beatDetected: false,
  isMobile: false,
  joystickActive: false,
  joystickTouchId: null,
  shootTouchId: null,
  joystickPos: { x: 0, y: 0 },
  joystickStart: { x: 0, y: 0 },
  joystickOffset: { x: 0, y: 0 }
};

// 10个难度等级的配置（与roguelikeGenerator中一致）
const difficultyNames = [
  '简单', '普通', '困难', '噩梦', '地狱', '炼狱', '炼狱I', '炼狱II', '炼狱III', '炼狱X'
];
const difficultyColors = [
  '#4CAF50', '#8BC34A', '#FFEB3B', '#FF9800', '#FF5722', '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5'
];

interface GameProps {
  onReturnToMain?: () => void;
  onLevelComplete?: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  opacity: number;
  life: number;
}

interface SkillCooldown {
  [key: string]: number;
}

const Game: React.FC<GameProps> = ({ onReturnToMain, onLevelComplete }) => {
  const gameStore = useGameStore();
  const { 
    selectedCharacter,
    selectedWeapon,
    weapons,
    level: playerLevel,
    skills,
    unlockedSkills,
    setSelectedWeapon,
    enemies,
    setEnemies,
    score,
    setScore,
    health,
    setHealth,
    maxHealth,
    experience,
    setExperience,
    currentLevel,
    setCurrentLevel,
    isGameOver,
    setIsGameOver,
    buffs,
    applyBuff,
    updateBuffs,
    coins,
    setCoins,
    musicPower,
    setMusicPower,
    settings,
    setSettings
  } = gameStore;

  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const {
    isPaused,
    isInvincible,
    combo,
    maxCombo,
    showCombo,
    bullets,
    powerUps,
    player,
    isShooting,
    screenShake,
    particles,
    skillCooldowns,
    showLevelUp,
    lastLevel,
    mousePos,
    activeEffects,
    shield,
    levelCompleted,
    musicIntensity,
    isOnBeat,
    beatDetected,
    isMobile,
    joystickActive,
    joystickTouchId,
    shootTouchId,
    joystickPos,
    joystickStart,
    joystickOffset
  } = state;
  
  const [showSettings, setShowSettings] = React.useState(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysPressed = useRef<Set<string>>(new Set());
  const lastShootTime = useRef(0);
  const animationFrameId = useRef<number>();
  const spatialGrid = useRef(new SpatialGrid(100)); // 100x100的网格单元格

  useEffect(() => {
    // 检测是否为移动设备
    const checkMobile = () => {
      dispatch({ type: 'SET_IS_MOBILE', payload: window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) });
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // 设置虚拟摇杆初始位置
    if (canvasContainerRef.current) {
      const rect = canvasContainerRef.current.getBoundingClientRect();
      dispatch({ type: 'SET_JOYSTICK_START', payload: { x: 100, y: rect.height - 100 } });
      dispatch({ type: 'SET_JOYSTICK_POS', payload: { x: 100, y: rect.height - 100 } });
    }
    
    // 初始化默认播放列表
    soundManager.initDefaultPlaylist().catch(() => {
      // 静默处理错误，确保游戏能正常启动
    });
    
    const initLevel = () => {
      const levelData = roguelikeGenerator.generateLevel(currentLevel, settings.difficulty);
      setEnemies([...levelData.enemies, ...(levelData.boss ? [levelData.boss] : [])]);
      if (!selectedWeapon && weapons.length > 0) {
        setSelectedWeapon(weapons[0]);
      }
      // 重置子弹、道具和粒子效果
      dispatch({ type: 'SET_BULLETS', payload: [] });
      dispatch({ type: 'SET_POWER_UPS', payload: [] });
      dispatch({ type: 'SET_PARTICLES', payload: [] });
      // 重置玩家位置到中央
      dispatch({ type: 'SET_PLAYER', payload: { x: 400, y: 300 } });
      dispatch({ type: 'SET_COMBO', payload: 0 });
      dispatch({ type: 'SET_LEVEL_COMPLETED', payload: false });
    };
    initLevel();
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [currentLevel, setEnemies, selectedWeapon, weapons, setSelectedWeapon, settings.difficulty]);

  useEffect(() => {
    if (playerLevel > lastLevel) {
      dispatch({ type: 'SET_SHOW_LEVEL_UP', payload: true });
      dispatch({ type: 'SET_LAST_LEVEL', payload: playerLevel });
      // 播放升级音效
      soundManager.playSoundEffect('levelUp');
      // Macross style motivational voice for level up
      soundManager.playMotivationalVoice('levelUp');
      setTimeout(() => dispatch({ type: 'SET_SHOW_LEVEL_UP', payload: false }), 3000);
    }
  }, [playerLevel, lastLevel]);
  
  // 监听设置变化，更新音量
  useEffect(() => {
    soundManager.setVolume(settings.musicVolume);
    soundManager.setSoundVolume(settings.soundVolume);
  }, [settings.musicVolume, settings.soundVolume]);

  // 对象池管理 - 优化版本
  const particlePool = useRef<Particle[]>([]);
  const bulletPool = useRef<Bullet[]>([]);
  const MAX_POOL_SIZE = 200; // 限制对象池大小

  const addParticles = useCallback((x: number, y: number, count: number, color: string, options?: {
    size?: number;
    speed?: number;
    life?: number;
  }) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      let particle: Particle;
      
      // 从对象池获取粒子
      if (particlePool.current.length > 0) {
        particle = particlePool.current.pop()!;
        // 重置粒子属性
        particle.id = Date.now() + i;
        particle.x = x;
        particle.y = y;
        particle.opacity = 1;
        particle.life = options?.life || 60;
      } else {
        // 创建新粒子
        particle = {
          id: Date.now() + i,
          x,
          y,
          vx: 0,
          vy: 0,
          color,
          size: 0,
          opacity: 1,
          life: options?.life || 60
        };
      }
      
      const angle = Math.random() * Math.PI * 2;
      const speed = (options?.speed || 3) + Math.random() * 3;
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.color = color;
      particle.size = (options?.size || 3) + Math.random() * 2;
      
      newParticles.push(particle);
    }
    dispatch({ type: 'SET_PARTICLES', payload: [...particles, ...newParticles] });
  }, [particles]);

  const addShootParticles = useCallback((x: number, y: number, color: string) => {
    addParticles(x, y, 5, color, { size: 4, speed: 4 });
  }, [addParticles]);

  const addExplosionParticles = useCallback((x: number, y: number) => {
    addParticles(x, y, 30, '#FF6B6B', { size: 8, speed: 8, life: 80 });
    addParticles(x, y, 20, '#FFD700', { size: 6, speed: 6, life: 60 });
    addParticles(x, y, 15, '#FF4500', { size: 5, speed: 5, life: 50 });
    dispatch({ type: 'SET_SCREEN_SHAKE', payload: 8 });
  }, [addParticles]);

  const addHitParticles = useCallback((x: number, y: number, color: string = '#FF6B6B') => {
    addParticles(x, y, 10, color, { size: 5, speed: 5 });
  }, [addParticles]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleShooting = useCallback((weapon: Weapon, isOnBeat: boolean) => {
    const now = Date.now();
    let fireRate = weapon.fireRate;
    
    if (buffs.rapidfire?.active) {
      fireRate = fireRate * buffs.rapidfire.value;
    }
    if (buffs.rapidfireSkill?.active) {
      fireRate = fireRate * 0.3;
    }
    
    if (now - lastShootTime.current < fireRate * 500) return;
    lastShootTime.current = now;

    let damage = weapon.damage * (isOnBeat ? weapon.rhythmBonus : 1);
    
    if (buffs.damage?.active) {
      damage = damage * (1 + buffs.damage.value);
    }
    if (buffs.damageBoost?.active) {
      damage = damage * 3;
    }
    
    // Music power attack boost - Macross style
    if (musicPower.attackBoost > 0) {
      damage = damage * (1 + musicPower.attackBoost);
    }

    let bulletCount = weapon.bulletCount;
    if (buffs.multishot?.active) {
      bulletCount = bulletCount + buffs.multishot.value;
    }
    if (buffs.multishotSkill?.active) {
      bulletCount = bulletCount + buffs.multishotSkill.value;
    }

    const newBullets: Bullet[] = [];
    for (let i = 0; i < bulletCount; i++) {
      let bullet: Bullet;
      
      // 从对象池获取子弹
      if (bulletPool.current.length > 0) {
        bullet = bulletPool.current.pop()!;
        // 重置子弹属性
        bullet.id = Date.now() + i;
        bullet.x = player.x;
        bullet.y = player.y;
        bullet.pierce = weapon.type === 'sniper' ? 3 : 0;
      } else {
        // 创建新子弹
        bullet = {
          id: Date.now() + i,
          x: player.x,
          y: player.y,
          vx: 0,
          vy: 0,
          damage,
          color: isOnBeat ? '#FF00FF' : weapon.color,
          size: weapon.bulletSize,
          onBeat: isOnBeat,
          weaponType: weapon.type,
          pierce: weapon.type === 'sniper' ? 3 : 0
        };
      }
      
      let angle = -Math.PI / 2;
      
      if (bulletCount > 1) {
        angle = -Math.PI / 2 + (i - (bulletCount - 1) / 2) * 0.3;
      }
      
      const dx = mousePos.x - player.x;
      const dy = mousePos.y - player.y;
      angle = Math.atan2(dy, dx);
      
      const spread = bulletCount > 1 ? (i - (bulletCount - 1) / 2) * 0.2 : 0;
      
      bullet.vx = Math.cos(angle + spread) * weapon.bulletSpeed;
      bullet.vy = Math.sin(angle + spread) * weapon.bulletSpeed;
      bullet.damage = damage;
      bullet.color = isOnBeat ? '#FF00FF' : weapon.color;
      bullet.size = weapon.bulletSize;
      bullet.onBeat = isOnBeat;
      bullet.weaponType = weapon.type;
      
      newBullets.push(bullet);
    }

    dispatch({ type: 'SET_BULLETS', payload: [...bullets, ...newBullets] });
    addShootParticles(player.x, player.y, weapon.color);
    
    // 播放射击音效
    soundManager.playSoundEffect('shoot');
  }, [player, mousePos, buffs, addShootParticles, bullets, musicPower.attackBoost]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const activateSkill = useCallback((skill: Skill) => {
    if (skillCooldowns[skill.id] > 0 || !unlockedSkills.includes(skill.id)) return;

    dispatch({ type: 'SET_SKILL_COOLDOWNS', payload: { ...skillCooldowns, [skill.id]: skill.cooldown } });
    dispatch({ type: 'SET_SCREEN_SHAKE', payload: 10 });

    switch (skill.type) {
      case 'aoe':
        if (skill.id === 'aoe_clear') {
          dispatch({ type: 'SET_ACTIVE_EFFECTS', payload: [...activeEffects, 'wave'] });
          setTimeout(() => dispatch({ type: 'SET_ACTIVE_EFFECTS', payload: activeEffects.filter(e => e !== 'wave') }), 500);
          
          setEnemies(prev => {
            const remaining = prev.filter(enemy => {
              const dx = player.x - enemy.x;
              const dy = player.y - enemy.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 250) {
                addExplosionParticles(enemy.x, enemy.y);
                return false;
              }
              return true;
            });
            return remaining;
          });
          setScore(prev => prev + 500);
        } else if (skill.id === 'black_hole') {
          dispatch({ type: 'SET_ACTIVE_EFFECTS', payload: [...activeEffects, 'blackhole'] });
          setTimeout(() => dispatch({ type: 'SET_ACTIVE_EFFECTS', payload: activeEffects.filter(e => e !== 'blackhole') }), 3000);
          
          setEnemies(prev => prev.map(enemy => {
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 30) {
              const angle = Math.atan2(dy, dx);
              return {
                ...enemy,
                x: enemy.x + Math.cos(angle) * 15,
                y: enemy.y + Math.sin(angle) * 15
              };
            } else {
              addExplosionParticles(enemy.x, enemy.y);
              return { ...enemy, health: enemy.health - skill.damage };
            }
          }).filter(e => e.health > 0));
        } else if (skill.id === 'time_stop') {
          dispatch({ type: 'SET_ACTIVE_EFFECTS', payload: [...activeEffects, 'time_stop'] });
          setTimeout(() => dispatch({ type: 'SET_ACTIVE_EFFECTS', payload: activeEffects.filter(e => e !== 'time_stop') }), 3000);
          
          // 冻结敌人3秒
          setEnemies(prev => prev.map(enemy => ({
            ...enemy,
            frozen: true
          })));
          
          setTimeout(() => {
            setEnemies(prev => prev.map(enemy => ({
              ...enemy,
              frozen: false
            })));
          }, 3000);
        } else if (skill.id === 'explosion') {
          // 在鼠标位置引发爆炸
          dispatch({ type: 'SET_ACTIVE_EFFECTS', payload: [...activeEffects, 'explosion'] });
          setTimeout(() => dispatch({ type: 'SET_ACTIVE_EFFECTS', payload: activeEffects.filter(e => e !== 'explosion') }), 500);
          
          addExplosionParticles(mousePos.x, mousePos.y);
          
          setEnemies(prev => prev.filter(enemy => {
            const dx = mousePos.x - enemy.x;
            const dy = mousePos.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
              addExplosionParticles(enemy.x, enemy.y);
              return false;
            }
            return true;
          }));
          setScore(prev => prev + 800);
        }
        break;
      
      case 'heal':
        setHealth(maxHealth);
        addParticles(player.x, player.y, 30, '#00FF00', { size: 10, life: 100 });
        dispatch({ type: 'SET_ACTIVE_EFFECTS', payload: [...activeEffects, 'heal'] });
        setTimeout(() => dispatch({ type: 'SET_ACTIVE_EFFECTS', payload: activeEffects.filter(e => e !== 'heal') }), 500);
        break;
      
      case 'buff':
        if (skill.id === 'rapid_fire') {
          applyBuff('rapidfireSkill', 5000, 0.3);
        } else if (skill.id === 'shield') {
          dispatch({ type: 'SET_INVINCIBLE', payload: true });
          dispatch({ type: 'SET_SHIELD', payload: 3000 });
          setTimeout(() => {
            dispatch({ type: 'SET_INVINCIBLE', payload: false });
          }, 3000);
        } else if (skill.id === 'damage_boost') {
          applyBuff('damageBoost', 8000, 2);
        } else if (skill.id === 'speed_boost') {
          applyBuff('speed', 10000, 1);
          dispatch({ type: 'SET_ACTIVE_EFFECTS', payload: [...activeEffects, 'speed_boost'] });
          setTimeout(() => dispatch({ type: 'SET_ACTIVE_EFFECTS', payload: activeEffects.filter(e => e !== 'speed_boost') }), 10000);
        } else if (skill.id === 'multishot') {
          applyBuff('multishotSkill', 10000, 2);
          dispatch({ type: 'SET_ACTIVE_EFFECTS', payload: [...activeEffects, 'multishot'] });
          setTimeout(() => dispatch({ type: 'SET_ACTIVE_EFFECTS', payload: activeEffects.filter(e => e !== 'multishot') }), 10000);
        }
        break;
    }
  }, [skillCooldowns, unlockedSkills, player, addParticles, addExplosionParticles, setHealth, maxHealth, applyBuff, mousePos, activeEffects]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
      
      if (e.key.toLowerCase() === 'p') {
        dispatch({ type: 'SET_PAUSED', payload: !isPaused });
      }
      
      const num = parseInt(e.key);
      if (num >= 1 && num <= 7) {
        const weaponIndex = num - 1;
        if (weapons[weaponIndex] && weapons[weaponIndex].unlockLevel <= playerLevel) {
          setSelectedWeapon(weapons[weaponIndex]);
        }
      }
      
      const skillKeys = ['q', 'e', 'r', 'f', 'g', 'h'];
      const skillIndex = skillKeys.indexOf(e.key.toLowerCase());
      if (skillIndex !== -1 && skills[skillIndex]) {
        activateSkill(skills[skillIndex]);
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
  }, [weapons, playerLevel, skills, activateSkill, setSelectedWeapon]);

  // 触摸事件优化：添加事件节流
  const throttle = (func: Function, limit: number) => {
    let inThrottle: boolean;
    return function(this: any, ...args: any[]) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  // 移动端控制事件
  const handleJoystickStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (touch) {
      dispatch({ type: 'SET_JOYSTICK_TOUCH_ID', payload: touch.identifier });
      dispatch({ type: 'SET_JOYSTICK_ACTIVE', payload: true });
      
      const rect = e.currentTarget.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      dispatch({ type: 'SET_JOYSTICK_START', payload: { x: 80, y: 80 } }); // 适配更大的摇杆区域
      dispatch({ type: 'SET_JOYSTICK_POS', payload: { x, y } });
    }
  };

  // 触摸事件节流：每16ms触发一次（约60fps）
  const handleJoystickMove = throttle((e: React.TouchEvent) => {
    e.preventDefault();
    if (!joystickActive) return;
    
    const touch = Array.from(e.touches).find((t: Touch) => t.identifier === joystickTouchId);
    if (!touch) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    let x = touch.clientX - rect.left;
    let y = touch.clientY - rect.top;
    
    // 限制摇杆在圆形区域内
    const maxDistance = 60; // 适配更大的摇杆区域
    const dx = x - 80;
    const dy = y - 80;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > maxDistance) {
      const angle = Math.atan2(dy, dx);
      x = 80 + Math.cos(angle) * maxDistance;
      y = 80 + Math.sin(angle) * maxDistance;
    }
    
    dispatch({ type: 'SET_JOYSTICK_POS', payload: { x, y } });
    dispatch({ type: 'SET_JOYSTICK_OFFSET', payload: { x: (x - 80) / 30, y: (y - 80) / 30 } }); // 调整灵敏度
  }, 16);

  const handleJoystickEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_JOYSTICK_ACTIVE', payload: false });
    dispatch({ type: 'SET_JOYSTICK_TOUCH_ID', payload: null });
    dispatch({ type: 'SET_JOYSTICK_POS', payload: { x: 80, y: 80 } });
    dispatch({ type: 'SET_JOYSTICK_OFFSET', payload: { x: 0, y: 0 } });
  };

  const handleShootStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (touch) {
      dispatch({ type: 'SET_SHOOT_TOUCH_ID', payload: touch.identifier });
      dispatch({ type: 'SET_IS_SHOOTING', payload: true });
      
      // 更新射击方向
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        dispatch({ type: 'SET_MOUSE_POS', payload: {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top
        }});
      }
    }
  };

  // 触摸事件节流：每16ms触发一次（约60fps）
  const handleShootMove = throttle((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = Array.from(e.touches).find((t: Touch) => t.identifier === shootTouchId);
    if (!touch) return;
    
    // 更新射击方向
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      dispatch({ type: 'SET_MOUSE_POS', payload: {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      }});
    }
  }, 16);

  const handleShootEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_IS_SHOOTING', payload: false });
    dispatch({ type: 'SET_SHOOT_TOUCH_ID', payload: null });
  };



  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 鼠标控制
    const handleMouseDown = () => {
      if (!isPaused) {
        dispatch({ type: 'SET_IS_SHOOTING', payload: true });
      }
    };

    const handleMouseUp = () => {
      dispatch({ type: 'SET_IS_SHOOTING', payload: false });
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      dispatch({ type: 'SET_MOUSE_POS', payload: {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }});
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [isPaused]);

  // 游戏逻辑辅助函数
  const updateBullets = useCallback((bullets: Bullet[]): Bullet[] => {
    const updatedBullets: Bullet[] = [];
    
    bullets.forEach(bullet => {
      // 更新子弹位置
      bullet.x += bullet.vx;
      bullet.y += bullet.vy;
      
      // 检查子弹是否在屏幕内
      if (bullet.y > -50 && bullet.y < 650 && bullet.x > -50 && bullet.x < 850) {
        // 子弹还在屏幕内，继续使用
        updatedBullets.push(bullet);
      } else {
        // 子弹超出屏幕，回收回对象池
        bulletPool.current.push(bullet);
      }
    });
    
    return updatedBullets;
  }, []);

  const updateEnemies = useCallback((enemies: Enemy[], player: { x: number; y: number }, deltaTime: number): Enemy[] => {
    return enemies.map(enemy => {
      // 处理元素状态效果和持续时间
      const updatedEnemy = { ...enemy };
      
      // 元素效果持续时间管理
      if (updatedEnemy.burning) {
        if (updatedEnemy.burningDuration) {
          updatedEnemy.burningDuration -= deltaTime;
          if (updatedEnemy.burningDuration <= 0) {
            updatedEnemy.burning = false;
            updatedEnemy.burningDuration = undefined;
          } else {
            updatedEnemy.health -= 5; // 燃烧伤害
          }
        }
      }
      
      if (updatedEnemy.poisoned) {
        if (updatedEnemy.poisonedDuration) {
          updatedEnemy.poisonedDuration -= deltaTime;
          if (updatedEnemy.poisonedDuration <= 0) {
            updatedEnemy.poisoned = false;
            updatedEnemy.poisonedDuration = undefined;
          } else {
            updatedEnemy.health -= 3; // 中毒伤害
          }
        }
      }
      
      if (updatedEnemy.shocked) {
        if (updatedEnemy.shockedDuration) {
          updatedEnemy.shockedDuration -= deltaTime;
          if (updatedEnemy.shockedDuration <= 0) {
            updatedEnemy.shocked = false;
            updatedEnemy.shockedDuration = undefined;
          } else {
            updatedEnemy.speed *= 0.5; // 减速效果
          }
        }
      }
      
      if (updatedEnemy.frozen) {
        if (updatedEnemy.frozenDuration) {
          updatedEnemy.frozenDuration -= deltaTime;
          if (updatedEnemy.frozenDuration <= 0) {
            updatedEnemy.frozen = false;
            updatedEnemy.frozenDuration = undefined;
          } else {
            return updatedEnemy; // 冻结状态下不移动
          }
        }
      }
      
      const dx = player.x - updatedEnemy.x;
      const dy = player.y - updatedEnemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 0) {
        const angle = Math.atan2(dy, dx);
        return {
          ...updatedEnemy,
          x: updatedEnemy.x + Math.cos(angle) * updatedEnemy.speed,
          y: updatedEnemy.y + Math.sin(angle) * updatedEnemy.speed
        };
      }
      return updatedEnemy;
    });
  }, []);

  const handleCollisionDetection = useCallback((updatedEnemies: Enemy[], updatedBullets: Bullet[]): { 
    finalEnemies: Enemy[]; 
    filteredBullets: Bullet[]; 
    scoreToAdd: number; 
    comboToAdd: number; 
    deadEnemies: Enemy[]; 
    hitBullets: Set<number>; 
  } => {
    let scoreToAdd = 0;
    let comboToAdd = 0;
    const deadEnemies: Enemy[] = [];
    const hitEnemies = new Set<number>();
    const hitBullets = new Set<number>();

    // 清空并重新填充空间网格
    spatialGrid.current.clear();
    
    // 添加所有敌人到空间网格
    updatedEnemies.forEach(enemy => {
      spatialGrid.current.addEnemy(enemy);
    });
    
    // 添加所有子弹到空间网格
    updatedBullets.forEach(bullet => {
      spatialGrid.current.addBullet(bullet);
    });

    // 使用空间分区优化碰撞检测
    updatedEnemies.forEach((enemy, enemyIndex) => {
      // 只获取敌人周围的子弹进行碰撞检测
      const { bullets: nearbyBullets } = spatialGrid.current.getNearbyObjects(enemy.x, enemy.y);
      
      nearbyBullets.forEach((bullet, bulletIndex) => {
        const dx = bullet.x - enemy.x;
        const dy = bullet.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < enemy.size + bullet.size) {
          if (bullet.pierce > 0) {
            if (!hitBullets.has(bulletIndex)) {
              bullet.pierce--;
              hitBullets.add(bulletIndex);
            }
          } else {
            hitBullets.add(bulletIndex);
          }
          
          if (!hitEnemies.has(enemyIndex)) {
            // 获取武器元素属性
            const weapon = selectedWeapon || weapons[0];
            const element = weapon?.element || 'none';
            
            // 计算元素伤害
            let damage = bullet.damage;
            if (element !== 'none' && enemy.resistances) {
              const resistance = enemy.resistances[element as keyof typeof enemy.resistances];
              damage = damage * (1 - resistance);
            }
            
            enemy.health -= damage;
            hitEnemies.add(enemyIndex);
            
            // 应用元素效果
            if (element !== 'none' && Math.random() < weapon.elementChance) {
              switch (element) {
                case 'fire':
                  enemy.burning = true;
                  enemy.burningDuration = weapon.elementDuration;
                  break;
                case 'ice':
                  enemy.frozen = true;
                  enemy.frozenDuration = weapon.elementDuration;
                  break;
                case 'lightning':
                  enemy.shocked = true;
                  enemy.shockedDuration = weapon.elementDuration;
                  break;
                case 'poison':
                  enemy.poisoned = true;
                  enemy.poisonedDuration = weapon.elementDuration;
                  break;
              }
            }
            
            if (bullet.weaponType === 'rocket') {
              addExplosionParticles(enemy.x, enemy.y);
            } else {
              addHitParticles(enemy.x, enemy.y, bullet.color);
            }
          }
        }
      });
    });

    const finalEnemies = updatedEnemies.filter(enemy => {
      if (enemy.health <= 0) {
        deadEnemies.push(enemy);
        scoreToAdd += enemy.name.includes('王') || enemy.name.includes('魔') || enemy.name.includes('巨') ? 500 : 100;
        comboToAdd++;
        addExplosionParticles(enemy.x, enemy.y);
        // 播放敌人死亡音效
        soundManager.playZombieSound();
        return false;
      }
      return true;
    });

    const filteredBullets = updatedBullets.filter((_, i) => !hitBullets.has(i));

    return { finalEnemies, filteredBullets, scoreToAdd, comboToAdd, deadEnemies, hitBullets };
  }, [selectedWeapon, weapons, addExplosionParticles, addHitParticles]);

  const handleScoreAndRewards = useCallback((scoreToAdd: number, comboToAdd: number, deadEnemies: Enemy[]) => {
    setScore(prev => prev + scoreToAdd);
    setExperience(prev => prev + scoreToAdd * 0.5);
    setCoins(prev => prev + Math.floor(scoreToAdd / 10));
    
    const newCombo = combo + comboToAdd;
    dispatch({ type: 'SET_COMBO', payload: newCombo });
    dispatch({ type: 'SET_MAX_COMBO', payload: Math.max(maxCombo, newCombo) });
    dispatch({ type: 'SET_SHOW_COMBO', payload: true });
    setTimeout(() => dispatch({ type: 'SET_SHOW_COMBO', payload: false }), 800);
    
    // Macross style combo voice lines
    soundManager.playComboVoiceLine(newCombo);

    deadEnemies.forEach(enemy => {
      if (Math.random() > 0.6) {
        const powerUp = roguelikeGenerator.generatePowerUp(currentLevel, enemy.x, enemy.y);
        dispatch({ type: 'SET_POWER_UPS', payload: [...powerUps, powerUp] });
      }
    });
  }, [combo, maxCombo, currentLevel, powerUps, setScore, setExperience, setCoins]);

  const handlePlayerCollision = useCallback((finalEnemies: Enemy[]) => {
    if (!isInvincible) {
      let gotHit = false;
      
      finalEnemies.forEach(enemy => {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < enemy.size + 20) {
          gotHit = true;
          addHitParticles(player.x, player.y, '#FF4444');
        }
      });
      
      if (gotHit) {
        let damage = 20;
        if (shield > 0) {
          damage = 0;
        }
        
        // Music power shield - Macross style
        if (musicPower.shieldStrength > 0) {
          damage = Math.max(0, damage - musicPower.shieldStrength);
        }
        
        setHealth(prev => Math.max(0, prev - damage));
        dispatch({ type: 'SET_COMBO', payload: 0 });
        dispatch({ type: 'SET_INVINCIBLE', payload: true });
        dispatch({ type: 'SET_SCREEN_SHAKE', payload: 15 });
        setTimeout(() => dispatch({ type: 'SET_INVINCIBLE', payload: false }), 2000);
        
        // Play motivational voice if health is low
        if (health - damage < maxHealth * 0.3) {
          soundManager.playMotivationalVoice('lowHealth');
        }
      }
    }
  }, [isInvincible, player, shield, musicPower.shieldStrength, health, maxHealth, addHitParticles, setHealth]);

  const updatePowerUps = useCallback((powerUps: PowerUp[]): PowerUp[] => {
    return powerUps.filter(powerUp => {
      const dx = player.x - powerUp.x;
      const dy = player.y - powerUp.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 40) {
        switch (powerUp.type) {
          case 'health':
            setHealth(prev => Math.min(maxHealth, prev + powerUp.value));
            break;
          case 'damage':
            applyBuff('damage', powerUp.duration, powerUp.value);
            break;
          case 'speed':
            applyBuff('speed', powerUp.duration, powerUp.value);
            break;
          case 'multishot':
            applyBuff('multishot', powerUp.duration, powerUp.value);
            break;
          case 'rapidfire':
            applyBuff('rapidfire', powerUp.duration, powerUp.value);
            break;
          case 'shield':
            dispatch({ type: 'SET_SHIELD', payload: powerUp.value });
            break;
          case 'critical':
            applyBuff('critical', powerUp.duration, powerUp.value);
            break;
          case 'pierce':
            applyBuff('pierce', powerUp.duration, powerUp.value);
            break;
          case 'lifeSteal':
            applyBuff('lifeSteal', powerUp.duration, powerUp.value);
            break;
          case 'invincibility':
            dispatch({ type: 'SET_INVINCIBLE', payload: true });
            setTimeout(() => dispatch({ type: 'SET_INVINCIBLE', payload: false }), powerUp.duration);
            break;
        }
        addParticles(powerUp.x, powerUp.y, 15, powerUp.color, { size: 8 });
        // 播放道具收集音效
        soundManager.playSoundEffect('powerUp');
        return false;
      }
      return true;
    });
  }, [player, maxHealth, setHealth, applyBuff, addParticles]);

  const checkGameOver = useCallback(() => {
    if (health <= 0) {
      setIsGameOver(true);
      // 播放游戏结束音效
      soundManager.playSoundEffect('gameOver');
    }
  }, [health, setIsGameOver]);

  // 音乐分析频率控制
  const musicAnalysisTimer = useRef(0);
  const musicAnalysisInterval = 50; // 每50ms分析一次，约20FPS

  const updateMusicAnalysis = useCallback(() => {
    const now = Date.now();
    if (now - musicAnalysisTimer.current < musicAnalysisInterval) {
      return;
    }
    musicAnalysisTimer.current = now;

    // 音乐分析
    const intensity = musicAnalyzer.getIntensityLevel();
    dispatch({ type: 'SET_MUSIC_INTENSITY', payload: intensity });
    
    const beat = musicAnalyzer.detectBeat();
    if (beat) {
      dispatch({ type: 'SET_BEAT_DETECTED', payload: true });
      dispatch({ type: 'SET_IS_ON_BEAT', payload: true });
      setTimeout(() => {
        dispatch({ type: 'SET_BEAT_DETECTED', payload: false });
        dispatch({ type: 'SET_IS_ON_BEAT', payload: false });
      }, 200);
    }
  }, []);

  const checkLevelComplete = useCallback((finalEnemies: Enemy[]) => {
    if (finalEnemies.length === 0 && !isGameOver && enemies.length > 0 && !levelCompleted) {
      dispatch({ type: 'SET_LEVEL_COMPLETED', payload: true });
      // 波次完成，显示波次奖励
      const waveRewards = {
        coins: Math.floor(Math.random() * 50) + 20 + currentLevel * 10,
        experience: Math.floor(Math.random() * 100) + 50 + currentLevel * 20,
        items: Math.random() > 0.5 ? ['health_potion', 'damage_boost'] : ['speed_boost', 'shield']
      };
      // 发放奖励
      setCoins(prev => prev + waveRewards.coins);
      setExperience(prev => prev + waveRewards.experience);
      
      // Macross style victory voice
      soundManager.playMotivationalVoice('victory');
      soundManager.playSoundEffect('victory');
      
      // 延迟调用onLevelComplete，确保状态更新完成
      setTimeout(() => {
        onLevelComplete?.();
      }, 500);
    }
  }, [isGameOver, enemies, levelCompleted, currentLevel, setCoins, setExperience, onLevelComplete]);

  const updateParticles = useCallback(() => {
    const updatedParticles: Particle[] = [];
    
    particles.forEach(particle => {
      // 更新粒子属性
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.opacity -= 0.02;
      particle.size *= 0.98;
      particle.life -= 1;
      
      if (particle.opacity > 0 && particle.life > 0) {
        // 粒子还活着，继续使用
        updatedParticles.push(particle);
      } else {
        // 粒子死亡，回收回对象池（限制池大小）
        if (particlePool.current.length < MAX_POOL_SIZE) {
          particlePool.current.push(particle);
        }
      }
    });
    
    dispatch({ type: 'SET_PARTICLES', payload: updatedParticles });
  }, [particles]);

  const updatePlayer = useCallback(() => {
    let newX = player.x;
    let newY = player.y;
    let speed = selectedCharacter?.speed || 4;
    
    if (buffs.speed?.active) {
      speed = speed * (1 + buffs.speed.value);
    }
    
    // Music power speed boost - Macross style
    if (musicPower.speedBoost > 0) {
      speed = speed * (1 + musicPower.speedBoost);
    }

    // 键盘控制
    if (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) newY -= speed;
    if (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) newY += speed;
    if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) newX -= speed;
    if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) newX += speed;

    // 虚拟摇杆控制
    if (isMobile) {
      newX += joystickOffset.x * speed;
      newY += joystickOffset.y * speed;
    }

    newX = Math.max(30, Math.min(770, newX));
    newY = Math.max(30, Math.min(570, newY));

    dispatch({ type: 'SET_PLAYER', payload: { x: newX, y: newY } });
  }, [player, selectedCharacter, buffs, musicPower.speedBoost, isMobile, joystickOffset]);

  // 游戏主循环
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 性能优化：设置Canvas像素比
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 800 * dpr;
    canvas.height = 600 * dpr;
    ctx.scale(dpr, dpr);

    // 性能优化：帧率控制
    const targetFPS = 60;
    const frameTime = 1000 / targetFPS;
    let lastTime = performance.now();
    let accumulatedTime = 0;

    // 性能优化：对象池
    const particlePool: Particle[] = [];
    const bulletPool: Bullet[] = [];

    const gameLoop = (time: number) => {
      try {
        const deltaTime = time - lastTime;
        lastTime = time;
        accumulatedTime += deltaTime;

        // 帧率控制
        while (accumulatedTime >= frameTime) {
          try {
            accumulatedTime -= frameTime;

            if (isPaused) {
              animationFrameId.current = requestAnimationFrame(gameLoop);
              return;
            }

            updateBuffs(frameTime);
            
            dispatch({ type: 'SET_SHIELD', payload: Math.max(0, shield - frameTime) });
            
            // Update music power system - Macross style
            try {
              soundManager.updateMusicPower(musicIntensity, isOnBeat);
              const newMusicPower = soundManager.getMusicPower();
              setMusicPower(newMusicPower);
            } catch (error) {
              // 音乐系统错误不影响游戏运行
            }

            const newCooldowns: SkillCooldown = {};
            Object.keys(skillCooldowns).forEach(key => {
              newCooldowns[key] = Math.max(0, skillCooldowns[key] - frameTime / 1000);
            });
            dispatch({ type: 'SET_SKILL_COOLDOWNS', payload: newCooldowns });

            // 更新玩家位置
            updatePlayer();

            // 处理射击
            if (isShooting && selectedWeapon) {
              try {
                handleShooting(selectedWeapon, isOnBeat);
              } catch (error) {
                // 射击错误不影响游戏运行
              }
            }

            // 更新子弹
            try {
              const updatedBullets = updateBullets(bullets);
              dispatch({ type: 'SET_BULLETS', payload: updatedBullets });
            } catch (error) {
              // 子弹更新错误不影响游戏运行
            }

            // 更新敌人
            try {
              const updatedEnemies = updateEnemies(enemies, player, frameTime);

              // 处理碰撞检测
              try {
                const { finalEnemies, filteredBullets, scoreToAdd, comboToAdd, deadEnemies, hitBullets } = handleCollisionDetection(updatedEnemies, bullets);
                
                if (hitBullets.size > 0) {
                  dispatch({ type: 'SET_BULLETS', payload: filteredBullets });
                }
                
                setEnemies(finalEnemies);

                // 处理得分和奖励
                if (scoreToAdd > 0) {
                  handleScoreAndRewards(scoreToAdd, comboToAdd, deadEnemies);
                }

                // 处理玩家碰撞
                handlePlayerCollision(finalEnemies);

                // 检查关卡完成
                checkLevelComplete(finalEnemies);
              } catch (error) {
                // 碰撞检测错误不影响游戏运行
              }
            } catch (error) {
              // 敌人更新错误不影响游戏运行
            }

            // 更新道具
            try {
              const remainingPowerUps = updatePowerUps(powerUps);
              dispatch({ type: 'SET_POWER_UPS', payload: remainingPowerUps });
            } catch (error) {
              // 道具更新错误不影响游戏运行
            }

            // 检查游戏结束
            checkGameOver();

            // 音乐分析
            try {
              updateMusicAnalysis();
            } catch (error) {
              // 音乐分析错误不影响游戏运行
            }

            // 更新粒子效果
            try {
              updateParticles();
            } catch (error) {
              // 粒子更新错误不影响游戏运行
            }
          } catch (error) {
            // 帧更新错误不影响游戏继续运行
            console.error('Game loop error:', error);
          }
        }

        // 渲染部分
        try {
          ctx.save();
          
          let shakeX = 0, shakeY = 0;
          if (screenShake > 0) {
            shakeX = (Math.random() - 0.5) * screenShake;
            shakeY = (Math.random() - 0.5) * screenShake;
            dispatch({ type: 'SET_SCREEN_SHAKE', payload: screenShake - deltaTime / 50 });
          }
          ctx.translate(shakeX, shakeY);

          // 性能优化：使用clearRect替代重绘背景 - 使用逻辑坐标
          ctx.clearRect(0, 0, 800, 600);
          drawBackground(ctx);

          drawPowerUps(ctx);
          drawEnemies(ctx, enemies);
          drawBullets(ctx);
          drawParticles(ctx);
          drawActiveEffects(ctx);
          drawPlayer(ctx);
          drawUI(ctx);

          ctx.restore();
        } catch (error) {
          // 渲染错误不影响游戏运行
          console.error('Render error:', error);
        }

        animationFrameId.current = requestAnimationFrame(gameLoop);
      } catch (error) {
        // 游戏循环错误不影响游戏继续运行
        console.error('Game loop fatal error:', error);
        animationFrameId.current = requestAnimationFrame(gameLoop);
      }
    };

    animationFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [
    isPaused, 
    isInvincible, 
    isShooting,
    player, 
    bullets, 
    enemies, 
    health, 
    maxHealth,
    currentLevel, 
    particles, 
    selectedWeapon, 
    weapons, 
    selectedCharacter,
    isGameOver, 
    onLevelComplete,
    buffs,
    updateBuffs,
    applyBuff,
    setScore,
    setHealth,
    setEnemies,
    setExperience,
    setCoins,
    combo,
    shield,
    mousePos,
    powerUps,
    skillCooldowns,
    musicIntensity,
    isOnBeat,
    levelCompleted,
    settings.gameMode,
    setCurrentLevel,
    setMusicPower,
    handleShooting,
    updateBullets,
    updateEnemies,
    handleCollisionDetection,
    handleScoreAndRewards,
    handlePlayerCollision,
    updatePowerUps,
    checkGameOver,
    updateMusicAnalysis,
    checkLevelComplete,
    updateParticles,
    updatePlayer
  ]);

  const drawBackground = (ctx: CanvasRenderingContext2D) => {
    const now = Date.now();
    
    // 直接绘制渐变背景
    const gradient = ctx.createLinearGradient(0, 0, 0, 600);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);

    // 绘制星点
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 15; i++) {
      const x = (i * 53) % 800;
      const y = (i * 37) % 600;
      const size = 2 + Math.sin(now / 500 + i) * 1.5;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // 绘制网格
    ctx.strokeStyle = '#0f3460';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.15;
    for (let x = 0; x < 800; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 600);
      ctx.stroke();
    }
    for (let y = 0; y < 600; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(800, y);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    
    // 无敌状态闪烁效果
    if (isInvincible) {
      ctx.globalAlpha = 0.4 + Math.sin(Date.now() / 80) * 0.4;
    }

    ctx.imageSmoothingEnabled = false;

    // 护盾效果
    if (shield > 0) {
      ctx.beginPath();
      ctx.arc(player.x, player.y, 45, 0, Math.PI * 2);
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 5;
      ctx.globalAlpha = 0.7 + Math.sin(Date.now() / 150) * 0.3;
      ctx.stroke();
      
      // 内发光
      ctx.beginPath();
      ctx.arc(player.x, player.y, 40, 0, Math.PI * 2);
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.4 + Math.sin(Date.now() / 100) * 0.2;
      ctx.stroke();
      
      // 恢复 alpha
      ctx.globalAlpha = isInvincible ? 0.4 + Math.sin(Date.now() / 80) * 0.4 : 1;
    }

    // 根据角色属性设置颜色
    const skinColors = {
      default: '#FFDAB9',
      light: '#F5DEB3',
      medium: '#DEB887',
      tan: '#D2B48C',
      dark: '#A0522D'
    };

    const hairColors = {
      default: '#8B4513',
      short: '#654321',
      long: '#556B2F',
      spiky: '#32CD32',
      ponytail: '#FF69B4',
      curly: '#8A2BE2',
      afro: '#4B0082',
      mohawk: '#FF4500',
      bun: '#9370DB',
      braids: '#2E8B57',
      fauxhawk: '#FFD700',
      shaved: '#000000'
    };

    const shirtColors = {
      default: '#FF6B6B',
      casual: '#4ECDC4',
      combat: '#45B7D1',
      scifi: '#9B59B6',
      ninja: '#2C3E50',
      pirate: '#8E44AD',
      mage: '#943126',
      knight: '#7F8C8D',
      viking: '#C0392B',
      samurai: '#34495E',
      space: '#3498DB',
      punk: '#E74C3C',
      angel: '#F1C40F',
      devil: '#E67E22',
      cyberpunk: '#1ABC9C',
      cowboy: '#D35400'
    };

    const faceColor = skinColors[selectedCharacter?.skin as keyof typeof skinColors] || skinColors.default;
    const hairColor = hairColors[selectedCharacter?.hair as keyof typeof hairColors] || hairColors.default;
    const shirtColor = shirtColors[selectedCharacter?.clothes as keyof typeof shirtColors] || shirtColors.default;
    const pantsColor = '#34495e';
    const shoeColor = '#2c3e50';

    // 头发 - 更立体
    ctx.fillStyle = hairColor;
    ctx.fillRect(player.x - 16, player.y - 32, 32, 8);
    ctx.fillRect(player.x - 18, player.y - 28, 36, 6);
    // 刘海
    ctx.fillStyle = hairColor + '80';
    ctx.fillRect(player.x - 14, player.y - 20, 4, 4);
    ctx.fillRect(player.x + 10, player.y - 20, 4, 4);

    // 头部
    ctx.fillStyle = faceColor;
    ctx.fillRect(player.x - 12, player.y - 24, 24, 24);
    // 脸部阴影
    ctx.fillStyle = faceColor + '80';
    ctx.fillRect(player.x + 6, player.y - 24, 6, 24);

    // 眼睛
    ctx.fillStyle = '#333';
    ctx.fillRect(player.x - 6, player.y - 18, 4, 4);
    ctx.fillRect(player.x + 2, player.y - 18, 4, 4);
    // 高光
    ctx.fillStyle = '#fff';
    ctx.fillRect(player.x - 5, player.y - 17, 2, 2);
    ctx.fillRect(player.x + 3, player.y - 17, 2, 2);

    // 嘴巴
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(player.x - 3, player.y - 10, 6, 2);

    // 身体
    ctx.fillStyle = faceColor;
    ctx.fillRect(player.x - 10, player.y, 20, 24);

    // 衬衫 - 带细节
    ctx.fillStyle = shirtColor;
    ctx.fillRect(player.x - 14, player.y, 28, 20);
    // 衣领
    ctx.fillStyle = '#fff';
    ctx.fillRect(player.x - 8, player.y - 2, 4, 6);
    ctx.fillRect(player.x, player.y - 2, 4, 6);
    // 纽扣
    ctx.fillStyle = '#333';
    ctx.fillRect(player.x - 2, player.y + 4, 4, 4);
    ctx.fillRect(player.x - 2, player.y + 10, 4, 4);

    // 手臂
    ctx.fillStyle = faceColor;
    ctx.fillRect(player.x - 18, player.y + 4, 8, 16);
    ctx.fillRect(player.x + 10, player.y + 4, 8, 16);
    // 手臂阴影
    ctx.fillStyle = faceColor + '80';
    ctx.fillRect(player.x - 18, player.y + 8, 8, 12);
    ctx.fillRect(player.x + 14, player.y + 4, 4, 16);

    // 裤子
    ctx.fillStyle = pantsColor;
    ctx.fillRect(player.x - 8, player.y + 20, 16, 12);

    // 鞋子
    ctx.fillStyle = shoeColor;
    ctx.fillRect(player.x - 10, player.y + 32, 8, 6);
    ctx.fillRect(player.x + 2, player.y + 32, 8, 6);

    // 特殊服装效果
    if (selectedCharacter?.clothes === 'angel') {
      // 天使翅膀
      ctx.fillStyle = '#F1C40F';
      ctx.beginPath();
      ctx.moveTo(player.x - 20, player.y);
      ctx.bezierCurveTo(player.x - 40, player.y - 30, player.x - 30, player.y - 50, player.x - 10, player.y - 30);
      ctx.bezierCurveTo(player.x - 5, player.y - 20, player.x - 15, player.y - 10, player.x - 20, player.y);
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(player.x + 20, player.y);
      ctx.bezierCurveTo(player.x + 40, player.y - 30, player.x + 30, player.y - 50, player.x + 10, player.y - 30);
      ctx.bezierCurveTo(player.x + 5, player.y - 20, player.x + 15, player.y - 10, player.x + 20, player.y);
      ctx.fill();
    } else if (selectedCharacter?.clothes === 'devil') {
      // 恶魔角
      ctx.fillStyle = '#E67E22';
      ctx.beginPath();
      ctx.moveTo(player.x - 8, player.y - 32);
      ctx.lineTo(player.x - 12, player.y - 40);
      ctx.lineTo(player.x - 4, player.y - 36);
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(player.x + 8, player.y - 32);
      ctx.lineTo(player.x + 12, player.y - 40);
      ctx.lineTo(player.x + 4, player.y - 36);
      ctx.fill();
    }

    // 武器
    const weapon = selectedWeapon || weapons[0];
    if (weapon) {
      if (weapon.type === 'melee') {
        // 近战武器 - 更立体
        ctx.fillStyle = weapon.color + '80';
        ctx.fillRect(player.x - 5, player.y + 22, 10, 30);
        ctx.fillStyle = weapon.color;
        ctx.fillRect(player.x - 2, player.y + 24, 4, 25);
        // 武器光泽
        ctx.fillStyle = weapon.color + '40';
        ctx.fillRect(player.x - 1, player.y + 24, 2, 25);
      } else {
        // 远程武器 - 更立体
        const angle = Math.atan2(mousePos.y - player.y, mousePos.x - player.x);
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(angle);
        // 枪身
        ctx.fillStyle = '#333';
        ctx.fillRect(5, -4, 25, 8);
        // 枪管
        ctx.fillStyle = weapon.color;
        ctx.fillRect(25, -2, 12, 4);
        // 枪托
        ctx.fillStyle = '#666';
        ctx.fillRect(5, -6, 8, 12);
        // 光泽
        ctx.fillStyle = '#555';
        ctx.fillRect(6, -3, 24, 2);
        ctx.fillStyle = weapon.color + '80';
        ctx.fillRect(30, -1, 7, 2);
        ctx.restore();
      }
    }

    ctx.restore();
  };

  const drawEnemies = (ctx: CanvasRenderingContext2D, enemies: Enemy[]) => {
    enemies.forEach(enemy => {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      
      ctx.fillStyle = enemy.color;
      ctx.fillRect(enemy.x - enemy.size/2, enemy.y - enemy.size/2, enemy.size, enemy.size);
      
      ctx.strokeStyle = '#cc4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(enemy.x - enemy.size/3, enemy.y - enemy.size/3, enemy.size * 2/3, enemy.size * 2/3);
      
      ctx.fillStyle = '#fff';
      ctx.fillRect(enemy.x - 8, enemy.y - 6, 6, 6);
      ctx.fillRect(enemy.x + 2, enemy.y - 4, 4, 4);
      
      ctx.fillStyle = '#000';
      ctx.fillRect(enemy.x - 6, enemy.y - 4, 2, 2);
      ctx.fillRect(enemy.x + 4, enemy.y - 2, 2, 2);
      
      ctx.fillStyle = '#000';
      ctx.fillRect(enemy.x - 6, enemy.y + 4, 12, 2);
      
      ctx.fillStyle = enemy.color;
      ctx.fillRect(enemy.x - enemy.size/2 - 6, enemy.y - 2, 6, 10);
      ctx.fillRect(enemy.x + enemy.size/2, enemy.y - 2, 6, 10);
      
      ctx.fillRect(enemy.x - enemy.size/3, enemy.y + enemy.size/2, 6, 10);
      ctx.fillRect(enemy.x + enemy.size/6, enemy.y + enemy.size/2, 6, 10);

      const healthPercent = enemy.health / (enemy.name.includes('王') || enemy.name.includes('魔') || enemy.name.includes('巨') ? 500 : 100);
      ctx.fillStyle = '#333';
      ctx.fillRect(enemy.x - enemy.size/2, enemy.y - enemy.size/2 - 15, enemy.size, 6);
      ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.25 ? '#FFC107' : '#F44336';
      ctx.fillRect(enemy.x - enemy.size/2, enemy.y - enemy.size/2 - 15, enemy.size * healthPercent, 6);

      ctx.restore();
    });
  };

  const drawBullets = (ctx: CanvasRenderingContext2D) => {
    bullets.forEach(bullet => {
      ctx.save();
      
      if (bullet.onBeat) {
        ctx.shadowColor = '#FF00FF';
        ctx.shadowBlur = 15;
      }
      
      ctx.fillStyle = bullet.color;
      
      if (bullet.weaponType === 'rocket') {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.size * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (bullet.weaponType === 'laser') {
        ctx.fillStyle = bullet.color + '80';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.size * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = bullet.color;
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    });
  };

  const drawPowerUps = (ctx: CanvasRenderingContext2D) => {
    powerUps.forEach(powerUp => {
      ctx.save();
      
      ctx.globalAlpha = 0.3 + Math.sin(Date.now() / 200) * 0.2;
      ctx.fillStyle = powerUp.color;
      ctx.beginPath();
      ctx.arc(powerUp.x, powerUp.y, 25, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.globalAlpha = 1;
      ctx.fillStyle = powerUp.color;
      ctx.beginPath();
      ctx.arc(powerUp.x, powerUp.y, 15, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const icons: { [key: string]: string } = {
        health: '❤️',
        damage: '⚔️',
        speed: '⚡',
        multishot: '🔫',
        rapidfire: '💨',
        shield: '🛡️'
      };
      ctx.fillText(icons[powerUp.type] || '✨', powerUp.x, powerUp.y);
      
      ctx.restore();
    });
  };

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    particles.forEach(particle => {
      ctx.save();
      ctx.globalAlpha = particle.opacity;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  };

  const drawActiveEffects = (ctx: CanvasRenderingContext2D) => {
    activeEffects.forEach(effect => {
      if (effect === 'wave') {
        ctx.save();
        for (let i = 0; i < 3; i++) {
          const radius = 50 + i * 80;
          ctx.beginPath();
          ctx.arc(player.x, player.y, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0, 255, 255, ${0.5 - i * 0.15})`;
          ctx.lineWidth = 5 - i;
          ctx.stroke();
        }
        ctx.restore();
      } else if (effect === 'blackhole') {
        ctx.save();
        const gradient = ctx.createRadialGradient(player.x, player.y, 0, player.x, player.y, 150);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
        gradient.addColorStop(0.5, 'rgba(75, 0, 130, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(player.x, player.y, 150, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (effect === 'heal') {
        ctx.save();
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const radius = 50 + Math.sin(Date.now() / 100) * 10;
          ctx.fillStyle = '#00FF00';
          ctx.font = 'bold 20px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('+', player.x + Math.cos(angle) * radius, player.y + Math.sin(angle) * radius);
        }
        ctx.restore();
      } else if (effect === 'time_stop') {
        ctx.save();
        const gradient = ctx.createRadialGradient(player.x, player.y, 0, player.x, player.y, 300);
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(player.x, player.y, 300, 0, Math.PI * 2);
        ctx.fill();
        
        // 时钟图案
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(player.x, player.y, 50, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(player.x, player.y - 30);
        ctx.lineTo(player.x, player.y + 30);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(player.x - 30, player.y);
        ctx.lineTo(player.x + 30, player.y);
        ctx.stroke();
        ctx.restore();
      } else if (effect === 'explosion') {
        ctx.save();
        const gradient = ctx.createRadialGradient(mousePos.x, mousePos.y, 0, mousePos.x, mousePos.y, 150);
        gradient.addColorStop(0, 'rgba(255, 105, 180, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 69, 0, 0.6)');
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mousePos.x, mousePos.y, 150, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (effect === 'speed_boost') {
        ctx.save();
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const radius = 40 + Math.sin(Date.now() / 50) * 10;
          ctx.fillStyle = '#FFD700';
          ctx.beginPath();
          ctx.arc(player.x + Math.cos(angle) * radius, player.y + Math.sin(angle) * radius, 5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      } else if (effect === 'multishot') {
        ctx.save();
        ctx.fillStyle = '#FF69B4';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🔫', player.x, player.y - 40);
        ctx.restore();
      }
    });
  };

  const drawUI = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = '#333333';
    ctx.fillRect(10, 10, 200, 24);
    ctx.fillStyle = '#FF4444';
    ctx.fillRect(10, 10, (health / maxHealth) * 200, 24);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 200, 24);
    
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText(`HP: ${health}/${maxHealth}`, 20, 22);

    const expNeeded = playerLevel * 100;
    ctx.fillStyle = '#333333';
    ctx.fillRect(10, 38, 200, 12);
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(10, 38, (experience / expNeeded) * 200, 12);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 38, 200, 12);
    ctx.fillStyle = '#fff';
    ctx.font = '10px monospace';
    ctx.fillText(`Level ${playerLevel} - ${Math.floor(experience)}/${expNeeded}`, 20, 44);

    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`分数: ${score}`, 250, 25);
    
    const difficultyIndex = Math.min(currentLevel - 1, 9);
    const difficultyName = difficultyNames[difficultyIndex];
    const difficultyColor = difficultyColors[difficultyIndex];
    ctx.fillStyle = difficultyColor;
    ctx.fillText(`关卡: ${currentLevel} (${difficultyName})`, 250, 45);
    
    ctx.fillStyle = '#FFC107';
    ctx.fillText(`金币: ${coins}`, 400, 25);

    if (combo > 0) {
      ctx.fillStyle = '#FF69B4';
      ctx.fillText(`连击: ${combo}`, 400, 45);
    }

    const buffList = Object.keys(buffs).filter(key => buffs[key]?.active);
    if (buffList.length > 0) {
      ctx.fillStyle = '#333';
      ctx.globalAlpha = 0.8;
      ctx.fillRect(250, 55, 200, buffList.length * 20 + 10);
      ctx.globalAlpha = 1;
      ctx.font = '11px monospace';
      buffList.forEach((key, i) => {
        const buffNames: { [key: string]: string } = {
          damage: '伤害提升',
          speed: '速度提升',
          multishot: '多重射击',
          rapidfire: '急速射击',
          rapidfireSkill: '技能-急速',
          damageBoost: '技能-伤害'
        };
        ctx.fillStyle = '#4CAF50';
        ctx.fillText(`${buffNames[key] || key}: ${Math.ceil(buffs[key].duration / 1000)}秒`, 260, 70 + i * 20);
      });
    }

    if (selectedWeapon) {
      ctx.fillStyle = '#333';
      ctx.globalAlpha = 0.8;
      ctx.fillRect(600, 10, 180, 120);
      ctx.globalAlpha = 1;
      
      ctx.fillStyle = '#98FB98';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`武器: ${selectedWeapon.name}`, 610, 30);
      
      ctx.fillStyle = '#ccc';
      ctx.font = '11px monospace';
      ctx.fillText(`伤害: ${selectedWeapon.damage}`, 610, 50);
      ctx.fillText(`射速: ${(1/selectedWeapon.fireRate).toFixed(1)}/秒`, 610, 65);
      ctx.fillText(`节奏加成: x${selectedWeapon.rhythmBonus}`, 610, 80);
      ctx.fillText(`类型: ${selectedWeapon.type}`, 610, 95);
      
      ctx.fillStyle = '#888';
      ctx.font = '10px monospace';
      ctx.fillText('1-7: 切换武器', 610, 115);
    }

    // Music power system - Macross style visualization
    ctx.fillStyle = '#333';
    ctx.globalAlpha = 0.8;
    ctx.fillRect(600, 135, 190, 120);
    ctx.globalAlpha = 1;
    
    // Music power title
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('🎵 音乐力量', 610, 155);
    
    // Music intensity bar
    ctx.fillStyle = '#444';
    ctx.fillRect(610, 165, 170, 15);
    
    // Color based on song phase
    let intensityColor: string;
    switch (musicPower.songPhase) {
      case 'calm':
        intensityColor = '#4CAF50';
        break;
      case 'build':
        intensityColor = '#FF9800';
        break;
      case 'climax':
        intensityColor = '#F44336';
        break;
      default:
        intensityColor = '#4CAF50';
    }
    
    ctx.fillStyle = intensityColor;
    ctx.fillRect(610, 165, (musicPower.musicIntensity / 100) * 170, 15);
    
    ctx.fillStyle = '#fff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.floor(musicPower.musicIntensity)}% - ${
      musicPower.songPhase === 'calm' ? '平静' :
      musicPower.songPhase === 'build' ? '渐入' : '高潮'
    }`, 695, 176);
    ctx.textAlign = 'left';
    
    // Music power effects
    ctx.fillStyle = '#ccc';
    ctx.font = '11px monospace';
    let effectY = 195;
    
    if (musicPower.attackBoost > 0) {
      ctx.fillStyle = '#FF6B6B';
      ctx.fillText(`⚔️ 攻击: +${Math.floor(musicPower.attackBoost * 100)}%`, 610, effectY);
      effectY += 18;
    }
    
    if (musicPower.speedBoost > 0) {
      ctx.fillStyle = '#00BCD4';
      ctx.fillText(`💨 速度: +${Math.floor(musicPower.speedBoost * 100)}%`, 610, effectY);
      effectY += 18;
    }
    
    if (musicPower.shieldStrength > 0) {
      ctx.fillStyle = '#9C27B0';
      ctx.fillText(`🛡️ 护盾: -${Math.floor(musicPower.shieldStrength)}`, 610, effectY);
      effectY += 18;
    }
    
    if (musicPower.auraActive) {
      ctx.fillStyle = '#FFD700';
      ctx.fillText('✨ 音乐光环激活!', 610, effectY);
    }

    ctx.fillStyle = '#333';
    ctx.globalAlpha = 0.8;
    ctx.fillRect(10, 55, 200, 200);
    ctx.globalAlpha = 1;
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('技能 (Q/R/F/G/H):', 20, 72);
    
    const skillKeys = ['Q', 'E', 'R', 'F', 'G', 'H'];
    skills.forEach((skill, i) => {
      if (i >= 6) return;
      
      const y = 92 + i * 30;
      const isUnlocked = unlockedSkills.includes(skill.id);
      const cooldown = skillCooldowns[skill.id] || 0;
      const isReady = isUnlocked && cooldown <= 0;
      
      if (!isUnlocked) {
        ctx.fillStyle = '#666';
      } else if (isReady) {
        ctx.fillStyle = '#4CAF50';
      } else {
        ctx.fillStyle = '#F44336';
      }
      
      ctx.fillRect(20, y, 180, 25);
      
      ctx.fillStyle = '#fff';
      ctx.font = '11px monospace';
      ctx.fillText(`${skillKeys[i]} - ${skill.name}`, 30, y + 15);
      
      if (!isUnlocked) {
        ctx.fillStyle = '#FFC107';
        ctx.fillText(`Lv.${skill.unlockLevel}解锁`, 140, y + 15);
      } else if (cooldown > 0) {
        ctx.fillText(`${cooldown.toFixed(1)}s`, 150, y + 15);
      } else {
        ctx.fillText('就绪', 150, y + 15);
      }
    });

    if (showCombo && combo > 0) {
      ctx.save();
      const scale = 1 + Math.sin(Date.now() * 0.01) * 0.1;
      ctx.translate(400, 300);
      ctx.scale(scale, scale);
      
      ctx.font = 'bold 48px monospace';
      ctx.fillStyle = '#FFD700';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#FF8C00';
      ctx.lineWidth = 4;
      ctx.strokeText(`${combo} COMBO!`, 0, 0);
      ctx.fillText(`${combo} COMBO!`, 0, 0);
      
      ctx.restore();
    }

    if (showLevelUp) {
      ctx.save();
      const scale = 1 + Math.sin(Date.now() * 0.015) * 0.15;
      ctx.translate(400, 250);
      ctx.scale(scale, scale);
      
      ctx.font = 'bold 52px monospace';
      ctx.fillStyle = '#FFD700';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#FF6B00';
      ctx.lineWidth = 5;
      ctx.strokeText(`升级! Lv.${playerLevel}`, 0, 0);
      ctx.fillText(`升级! Lv.${playerLevel}`, 0, 0);
      
      const newSkills = skills.filter(s => s.unlockLevel === playerLevel);
      if (newSkills.length > 0) {
        ctx.font = 'bold 24px monospace';
        ctx.fillStyle = '#4CAF50';
        ctx.fillText(`解锁新技能: ${newSkills.map(s => s.name).join(', ')}`, 0, 40);
      }
      
      ctx.restore();
    }

    ctx.restore();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-gray-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
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

      <div className="flex justify-between items-center w-full max-w-4xl mb-2 relative z-10 px-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400">
            🎵 节奏战争 🎵
          </span>
        </h1>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="bg-purple-700 hover:bg-purple-600 text-white px-3 sm:px-4 md:px-6 py-1 sm:py-2 rounded-full text-lg sm:text-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/30"
        >
          ⚙️ 设置
        </button>
      </div>
      <div className="w-48 sm:w-56 md:w-64 h-6 sm:h-8 bg-gray-700 rounded-full mb-4 sm:mb-6 relative z-10 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-200 ease-out ${beatDetected ? 'animate-pulse' : ''}`}
          style={{
            width: `${(musicIntensity / 4) * 100}%`,
            background: `linear-gradient(90deg, ${beatDetected ? '#ff00ff' : '#4CAF50'}, ${beatDetected ? '#8a2be2' : '#2196F3'})`
          }}
        />
      </div>

      <div className="game-canvas-container relative z-10 w-full max-w-4xl px-2 sm:px-0">
        <div className="w-full" style={{ aspectRatio: '4/3' }}>
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full h-full border-2 sm:border-4 border-purple-500 rounded-xl sm:rounded-2xl shadow-2xl shadow-purple-500/50 cursor-crosshair"
          />
        </div>

        {/* 移动端虚拟控制 */}
        {isMobile && (
          <div className="absolute inset-0 pointer-events-none">
            {/* 虚拟摇杆 */}
            <div 
              className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 pointer-events-auto" 
              onTouchStart={handleJoystickStart}
              onTouchMove={handleJoystickMove}
              onTouchEnd={handleJoystickEnd}
              onTouchCancel={handleJoystickEnd}
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full bg-gray-800 bg-opacity-50 flex items-center justify-center">
                <div 
                  className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-purple-600 bg-opacity-70 transition-all duration-100"
                  style={{
                    transform: `translate(${joystickPos.x - joystickStart.x}px, ${joystickPos.y - joystickStart.y}px)`
                  }}
                />
              </div>
            </div>
            
            {/* 射击按钮 */}
            <div 
              className="absolute bottom-4 sm:bottom-8 right-4 sm:right-8 pointer-events-auto"
              onTouchStart={handleShootStart}
              onTouchMove={handleShootMove}
              onTouchEnd={handleShootEnd}
              onTouchCancel={handleShootEnd}
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full bg-blue-600 bg-opacity-60 flex items-center justify-center">
                <div className="text-2xl sm:text-3xl md:text-4xl">🔫</div>
              </div>
            </div>
            
            {/* 技能按钮 */}
            <div className="absolute top-4 sm:top-8 right-4 sm:right-8 pointer-events-auto flex flex-col gap-2 sm:gap-3 md:gap-4">
              {skills.slice(0, 3).map((skill, index) => {
                const isUnlocked = unlockedSkills.includes(skill.id);
                const cooldown = skillCooldowns[skill.id] || 0;
                const isReady = isUnlocked && cooldown <= 0;
                
                return (
                  <div
                    key={skill.id}
                    className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center ${isReady ? 'bg-green-600 bg-opacity-60' : 'bg-gray-600 bg-opacity-40'}`}
                    onClick={() => isReady && activateSkill(skill)}
                  >
                    <div className="text-sm sm:text-lg md:text-xl lg:text-2xl">{['Q', 'E', 'R'][index]}</div>
                  </div>
                );
              })}
            </div>
            
            {/* 额外的技能按钮 - 适配大屏幕 */}
            {skills.length > 3 && (
              <div className="absolute top-4 sm:top-8 left-4 sm:left-8 pointer-events-auto flex flex-col gap-2 sm:gap-3 md:gap-4">
                {skills.slice(3, 6).map((skill, index) => {
                  const isUnlocked = unlockedSkills.includes(skill.id);
                  const cooldown = skillCooldowns[skill.id] || 0;
                  const isReady = isUnlocked && cooldown <= 0;
                  
                  return (
                    <div
                      key={skill.id}
                      className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center ${isReady ? 'bg-green-600 bg-opacity-60' : 'bg-gray-600 bg-opacity-40'}`}
                      onClick={() => isReady && activateSkill(skill)}
                    >
                      <div className="text-sm sm:text-lg md:text-xl lg:text-2xl">{['F', 'G', 'H'][index]}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {isPaused && (
          <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center rounded-2xl backdrop-blur-md">
            <div className="text-center p-6 sm:p-8 md:p-12 bg-gradient-to-br from-gray-800 to-gray-90 rounded-3xl border-2 border-purple-500 shadow-2xl shadow-purple-900/50 max-w-md w-full mx-4">
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6 sm:mb-8 md:mb-10">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 animate-pulse">
                  ⏸️ 游戏暂停
                </span>
              </h2>
              <div className="text-gray-300 text-base sm:text-lg md:text-xl mb-6 sm:mb-8 md:mb-10">
                休息一下，准备好了再继续！
              </div>
              <div className="flex flex-col gap-4 sm:gap-5 justify-center items-center">
                <button
                  onClick={() => dispatch({ type: 'SET_PAUSED', payload: false })}
                  className="w-full max-w-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-5 rounded-2xl text-lg sm:text-xl md:text-2xl font-bold hover:from-green-400 hover:to-emerald-500 transition-all duration-300 transform hover:scale-105 shadow-xl shadow-green-500/30"
                >
                  ▶️ 继续游戏
                </button>
                <button
                  onClick={() => {
                    gameStore.resetGame();
                    dispatch({ type: 'SET_PAUSED', payload: false });
                    onReturnToMain?.();
                  }}
                  className="w-full max-w-sm bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-5 rounded-2xl text-lg sm:text-xl md:text-2xl font-bold hover:from-green-400 hover:to-emerald-500 transition-all duration-300 transform hover:scale-105 shadow-xl shadow-gray-500/30"
                >
                  🏠 返回主页
                </button>
              </div>
            </div>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center rounded-2xl backdrop-blur-md">
            <div className="text-center p-6 sm:p-8 md:p-12 bg-gradient-to-br from-gray-800 to-gray-90 rounded-3xl border-2 border-red-600 shadow-2xl shadow-red-900/50 max-w-md w-full mx-4">
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6 sm:mb-8">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 animate-pulse">
                💀 游戏结束
              </span>
              </h2>
              <div className="bg-gray-700/50 rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 md:mb-10 border border-gray-600">
                <div className="text-white text-base sm:text-lg md:text-2xl space-y-3 sm:space-y-4">
                  <p className="flex items-center justify-center gap-2 sm:gap-3">
                    <span className="text-2xl sm:text-3xl">🎯</span>
                    <span>最终分数: <span className="text-yellow-400 font-bold">{score}</span></span>
                  </p>
                  <p className="flex items-center justify-center gap-2 sm:gap-3">
                    <span className="text-2xl sm:text-3xl">🔥</span>
                    <span>最高连击: <span className="text-orange-400 font-bold">{maxCombo}</span></span>
                  </p>
                  <p className="flex items-center justify-center gap-2 sm:gap-3">
                    <span className="text-2xl sm:text-3xl">🏆</span>
                    <span>到达关卡: <span className="text-blue-400 font-bold">{currentLevel}</span></span>
                  </p>
                  <p className="flex items-center justify-center gap-2 sm:gap-3">
                    <span className="text-2xl sm:text-3xl">💰</span>
                    <span>获得金币: <span className="text-amber-400 font-bold">{coins}</span></span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  gameStore.resetGame();
                  onReturnToMain?.();
                }}
                className="w-full max-w-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-5 rounded-2xl text-lg sm:text-xl md:text-2xl font-bold hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 transform hover:scale-105 shadow-xl shadow-purple-500/30"
              >
                🏠 返回主页
              </button>
            </div>
          </div>
        )}
        
        {showSettings && (
          <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center rounded-2xl backdrop-blur-md">
            <div className="text-center p-6 sm:p-8 md:p-12 bg-gradient-to-br from-gray-800 to-gray-90 rounded-3xl border-2 border-purple-500 shadow-2xl shadow-purple-900/50 max-w-md w-full mx-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400">
                  ⚙️ 游戏设置
                </span>
              </h2>
              
              <div className="space-y-8">
                {/* 音乐音量 */}
                <div className="text-left">
                  <label className="block text-white text-xl mb-3 flex items-center gap-2">
                    <span>🎵 音乐音量</span>
                    <span className="text-gray-400">{Math.round(settings.musicVolume * 100)}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.musicVolume}
                    onChange={(e) => setSettings({ musicVolume: parseFloat(e.target.value) })}
                    className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                {/* 音效音量 */}
                <div className="text-left">
                  <label className="block text-white text-xl mb-3 flex items-center gap-2">
                    <span>🔊 音效音量</span>
                    <span className="text-gray-400">{Math.round(settings.soundVolume * 100)}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.soundVolume}
                    onChange={(e) => setSettings({ soundVolume: parseFloat(e.target.value) })}
                    className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                {/* 游戏难度 */}
                <div className="text-left">
                  <label className="block text-white text-xl mb-3 flex items-center gap-2">
                    <span>⚔️ 游戏难度</span>
                    <span className="text-gray-400">{difficultyNames[settings.difficulty - 1]}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={settings.difficulty}
                    onChange={(e) => setSettings({ difficulty: parseInt(e.target.value) })}
                    className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>简单</span>
                    <span>普通</span>
                    <span>困难</span>
                    <span>噩梦</span>
                    <span>地狱</span>
                  </div>
                </div>
                
                {/* 游戏模式 */}
                <div className="text-left">
                  <label className="block text-white text-xl mb-3">🎮 游戏模式</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setSettings({ gameMode: 'normal' })}
                      className={`p-3 rounded-xl transition-all duration-300 ${settings.gameMode === 'normal' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                      普通
                    </button>
                    <button
                      onClick={() => setSettings({ gameMode: 'endless' })}
                      className={`p-3 rounded-xl transition-all duration-300 ${settings.gameMode === 'endless' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                      无尽
                    </button>
                    <button
                      onClick={() => setSettings({ gameMode: 'bossRush' })}
                      className={`p-3 rounded-xl transition-all duration-300 ${settings.gameMode === 'bossRush' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                      BOSS Rush
                    </button>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowSettings(false)}
                className="mt-6 sm:mt-8 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl text-lg sm:text-xl font-bold hover:from-green-400 hover:to-emerald-500 transition-all duration-300 transform hover:scale-105 shadow-xl shadow-green-500/30"
              >
                ✅ 保存设置
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 sm:mt-8 bg-gray-800 bg-opacity-85 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-purple-400 relative z-10 max-w-4xl mx-2 sm:mx-0">
        <h3 className="text-xl sm:text-2xl text-white font-bold mb-4 sm:mb-6 text-center">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
            🎮 操作说明
          </span>
        </h3>
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-gray-700 bg-opacity-50 p-3 sm:p-4 rounded-xl">
            <h4 className="text-lg sm:text-xl text-white font-bold mb-3 sm:mb-4">PC端操作</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-gray-300">
              <div className="space-y-2">
                <p className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl">🕹️</span>
                  <strong className="text-white text-base sm:text-lg">移动</strong>: <span className="text-sm sm:text-base">WASD / 方向键</span>
                </p>
                <p className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl">🔫</span>
                  <strong className="text-white text-base sm:text-lg">射击</strong>: <span className="text-sm sm:text-base">鼠标左键按住</span>
                </p>
                <p className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl">🔄</span>
                  <strong className="text-white text-base sm:text-lg">切换武器</strong>: <span className="text-sm sm:text-base">1-7 数字键</span>
                </p>
              </div>
              <div className="space-y-2">
                <p className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl">✨</span>
                  <strong className="text-white text-base sm:text-lg">使用技能</strong>: <span className="text-sm sm:text-base">Q E R F G H</span>
                </p>
                <p className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl">⏸️</span>
                  <strong className="text-white text-base sm:text-lg">暂停</strong>: <span className="text-sm sm:text-base">P键</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700 bg-opacity-50 p-3 sm:p-4 rounded-xl">
            <h4 className="text-lg sm:text-xl text-white font-bold mb-3 sm:mb-4">移动端操作</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-gray-300">
              <div className="space-y-2">
                <p className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl">🕹️</span>
                  <strong className="text-white text-base sm:text-lg">移动</strong>: <span className="text-sm sm:text-base">左下角虚拟摇杆</span>
                </p>
                <p className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl">🔫</span>
                  <strong className="text-white text-base sm:text-lg">射击</strong>: <span className="text-sm sm:text-base">右下角射击按钮</span>
                </p>
              </div>
              <div className="space-y-2">
                <p className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl">✨</span>
                  <strong className="text-white text-base sm:text-lg">使用技能</strong>: <span className="text-sm sm:text-base">右上角技能按钮</span>
                </p>
                <p className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl">📱</span>
                  <strong className="text-white text-base sm:text-lg">适配</strong>: <span className="text-sm sm:text-base">自动适配屏幕大小</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
