import type { Level, Enemy } from '../types/roguelike';

interface DifficultyConfig {
  name: string;
  speedMultiplier: number;
  damageMultiplier: number;
  healthMultiplier: number;
  enemyCountMultiplier: number;
  description: string;
}

class RoguelikeGenerator {
  // 10个难度等级的配置
  private difficultyConfigs: DifficultyConfig[] = [
    { name: '简单', speedMultiplier: 0.8, damageMultiplier: 0.7, healthMultiplier: 0.7, enemyCountMultiplier: 0.8, description: '适合新手，敌人很弱' },
    { name: '普通', speedMultiplier: 1.0, damageMultiplier: 1.0, healthMultiplier: 1.0, enemyCountMultiplier: 1.0, description: '标准难度，正常体验' },
    { name: '困难', speedMultiplier: 1.2, damageMultiplier: 1.3, healthMultiplier: 1.3, enemyCountMultiplier: 1.2, description: '有点挑战性了' },
    { name: '噩梦', speedMultiplier: 1.5, damageMultiplier: 1.6, healthMultiplier: 1.6, enemyCountMultiplier: 1.4, description: '敌人变快变强' },
    { name: '地狱', speedMultiplier: 1.8, damageMultiplier: 2.0, healthMultiplier: 2.0, enemyCountMultiplier: 1.6, description: '疯狂的敌人' },
    { name: '炼狱', speedMultiplier: 2.2, damageMultiplier: 2.5, healthMultiplier: 2.3, enemyCountMultiplier: 1.8, description: '准备好迎接挑战' },
    { name: '炼狱I', speedMultiplier: 2.6, damageMultiplier: 3.0, healthMultiplier: 2.6, enemyCountMultiplier: 2.0, description: 'Boss会出现了' },
    { name: '炼狱II', speedMultiplier: 3.0, damageMultiplier: 3.5, healthMultiplier: 2.9, enemyCountMultiplier: 2.2, description: 'Boss更强了' },
    { name: '炼狱III', speedMultiplier: 3.5, damageMultiplier: 4.0, healthMultiplier: 3.2, enemyCountMultiplier: 2.4, description: '最后的考验' },
    { name: '炼狱X', speedMultiplier: 4.0, damageMultiplier: 5.0, healthMultiplier: 3.5, enemyCountMultiplier: 2.6, description: '终极挑战！' }
  ];

  generateLevel(level: number, difficulty: number = 1): Level {
    const difficultyIndex = Math.min(difficulty - 1, 9);
    const config = this.difficultyConfigs[difficultyIndex];
    
    const enemyCount = Math.floor((5 + level * 3) * config.enemyCountMultiplier);
    const enemies: Enemy[] = [];
    
    for (let i = 0; i < enemyCount; i++) {
      enemies.push(this.generateEnemy(level, config));
    }
    
    let boss: Enemy | undefined;
    if (level % 3 === 0) {
      boss = this.generateBoss(level, config);
    }
    
    const layout = this.generateLayout();
    
    return {
      id: level,
      enemies,
      boss,
      layout
    };
  }
  
  private generateEnemy(level: number, config: DifficultyConfig): Enemy {
    const enemyTypes = [
      {
        name: '僵尸',
        health: Math.floor((50 + level * 15) * config.healthMultiplier),
        damage: Math.floor((10 + level * 2) * config.damageMultiplier),
        speed: (2 + level * 0.1) * config.speedMultiplier,
        type: 'melee',
        size: 25,
        color: '#FF6B6B',
        element: 'poison' as const
      },
      {
        name: '骷髅',
        health: Math.floor((40 + level * 12) * config.healthMultiplier),
        damage: Math.floor((15 + level * 3) * config.damageMultiplier),
        speed: (3 + level * 0.15) * config.speedMultiplier,
        type: 'melee',
        size: 22,
        color: '#D4A76A',
        element: 'none' as const
      },
      {
        name: '蝙蝠',
        health: Math.floor((30 + level * 8) * config.healthMultiplier),
        damage: Math.floor((8 + level * 1) * config.damageMultiplier),
        speed: (4 + level * 0.2) * config.speedMultiplier,
        type: 'ranged',
        size: 18,
        color: '#4ECDC4',
        element: 'ice' as const
      },
      {
        name: '幽灵',
        health: Math.floor((35 + level * 10) * config.healthMultiplier),
        damage: Math.floor((12 + level * 2) * config.damageMultiplier),
        speed: (3.5 + level * 0.18) * config.speedMultiplier,
        type: 'ranged',
        size: 24,
        color: '#9B59B6',
        element: 'shadow' as const
      },
      {
        name: '骷髅王',
        health: Math.floor((80 + level * 20) * config.healthMultiplier),
        damage: Math.floor((20 + level * 4) * config.damageMultiplier),
        speed: (1.5 + level * 0.08) * config.speedMultiplier,
        type: 'melee',
        size: 35,
        color: '#F39C12',
        element: 'fire' as const
      },
      {
        name: '闪电法师',
        health: Math.floor((45 + level * 14) * config.healthMultiplier),
        damage: Math.floor((18 + level * 3) * config.damageMultiplier),
        speed: (2.5 + level * 0.12) * config.speedMultiplier,
        type: 'ranged',
        size: 26,
        color: '#FFFF00',
        element: 'lightning' as const
      },
      {
        name: '毒蜘蛛',
        health: Math.floor((35 + level * 9) * config.healthMultiplier),
        damage: Math.floor((10 + level * 2) * config.damageMultiplier),
        speed: (3 + level * 0.16) * config.speedMultiplier,
        type: 'melee',
        size: 20,
        color: '#4CAF50',
        element: 'poison' as const
      },
      {
        name: '冰元素',
        health: Math.floor((55 + level * 16) * config.healthMultiplier),
        damage: Math.floor((14 + level * 2.5) * config.damageMultiplier),
        speed: (2 + level * 0.09) * config.speedMultiplier,
        type: 'ranged',
        size: 28,
        color: '#00BFFF',
        element: 'ice' as const
      },
      {
        name: '炎魔',
        health: Math.floor((65 + level * 18) * config.healthMultiplier),
        damage: Math.floor((22 + level * 4) * config.damageMultiplier),
        speed: (1.8 + level * 0.1) * config.speedMultiplier,
        type: 'melee',
        size: 32,
        color: '#FF4500',
        element: 'fire' as const
      },
      {
        name: '神圣骑士',
        health: Math.floor((70 + level * 19) * config.healthMultiplier),
        damage: Math.floor((16 + level * 3) * config.damageMultiplier),
        speed: (2.2 + level * 0.11) * config.speedMultiplier,
        type: 'melee',
        size: 30,
        color: '#FFFFFF',
        element: 'holy' as const
      }
    ];
    
    const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    
    let x, y;
    const side = Math.floor(Math.random() * 4);
    switch(side) {
      case 0: x = Math.random() * 700 + 50; y = -50; break;
      case 1: x = 850; y = Math.random() * 500 + 50; break;
      case 2: x = Math.random() * 700 + 50; y = 650; break;
      default: x = -50; y = Math.random() * 500 + 50; break;
    }
    
    // 生成元素抗性
    const resistances = {
      fire: 0,
      ice: 0,
      lightning: 0,
      poison: 0,
      holy: 0,
      shadow: 0
    };
    
    // 根据敌人元素类型设置抗性
    if (type.element !== 'none') {
      resistances[type.element as keyof typeof resistances] = 0.5; // 对自身元素有50%抗性
    }
    
    return {
      id: `enemy-${Date.now()}-${Math.random()}`,
      name: type.name,
      health: type.health,
      damage: type.damage,
      speed: type.speed,
      type: type.type,
      rhythmPattern: this.generateRhythmPattern(),
      x,
      y,
      size: type.size,
      color: type.color,
      element: type.element,
      resistances
    };
  }
  
  private generateBoss(level: number, config: DifficultyConfig): Enemy {
    const bossTypes = [
      {
        name: '音乐魔王',
        health: Math.floor((500 + level * 80) * config.healthMultiplier),
        damage: Math.floor((30 + level * 6) * config.damageMultiplier),
        speed: (2 + level * 0.1) * config.speedMultiplier,
        type: 'ranged',
        size: 50,
        color: '#9C27B0',
        element: 'shadow' as const
      },
      {
        name: '节奏巨人',
        health: Math.floor((600 + level * 100) * config.healthMultiplier),
        damage: Math.floor((40 + level * 8) * config.damageMultiplier),
        speed: (1.5 + level * 0.05) * config.speedMultiplier,
        type: 'melee',
        size: 60,
        color: '#FF5722',
        element: 'fire' as const
      },
      {
        name: '贝斯巨兽',
        health: Math.floor((450 + level * 70) * config.healthMultiplier),
        damage: Math.floor((50 + level * 10) * config.damageMultiplier),
        speed: (1.8 + level * 0.08) * config.speedMultiplier,
        type: 'melee',
        size: 55,
        color: '#2C3E50',
        element: 'none' as const
      },
      {
        name: '闪电龙王',
        health: Math.floor((550 + level * 85) * config.healthMultiplier),
        damage: Math.floor((35 + level * 7) * config.damageMultiplier),
        speed: (2.2 + level * 0.12) * config.speedMultiplier,
        type: 'ranged',
        size: 52,
        color: '#FFFF00',
        element: 'lightning' as const
      },
      {
        name: '冰霜女王',
        health: Math.floor((480 + level * 75) * config.healthMultiplier),
        damage: Math.floor((28 + level * 5) * config.damageMultiplier),
        speed: (2.5 + level * 0.15) * config.speedMultiplier,
        type: 'ranged',
        size: 48,
        color: '#00BFFF',
        element: 'ice' as const
      },
      {
        name: '神圣守护者',
        health: Math.floor((650 + level * 105) * config.healthMultiplier),
        damage: Math.floor((32 + level * 6) * config.damageMultiplier),
        speed: (1.6 + level * 0.06) * config.speedMultiplier,
        type: 'melee',
        size: 58,
        color: '#FFFFFF',
        element: 'holy' as const
      }
    ];
    
    const type = bossTypes[Math.floor(Math.random() * bossTypes.length)];
    
    // 生成元素抗性
    const resistances = {
      fire: 0,
      ice: 0,
      lightning: 0,
      poison: 0,
      holy: 0,
      shadow: 0
    };
    
    // 根据敌人元素类型设置抗性
    if (type.element !== 'none') {
      resistances[type.element] = 0.5; // 对自身元素有50%抗性
    }
    
    return {
      id: `boss-${Date.now()}`,
      name: type.name,
      health: type.health,
      damage: type.damage,
      speed: type.speed,
      type: type.type,
      rhythmPattern: this.generateRhythmPattern(),
      x: 400,
      y: 100,
      size: type.size,
      color: type.color,
      element: type.element,
      resistances
    };
  }
  
  private generateRhythmPattern(): string[] {
    const patterns = ['4/4', '3/4', '6/8', '2/4'];
    return [patterns[Math.floor(Math.random() * patterns.length)]];
  }
  
  private generateLayout(): string[][] {
    const width = 20;
    const height = 15;
    const layout: string[][] = [];
    
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
    
    layout[0][0] = 'empty';
    layout[height - 1][width - 1] = 'empty';
    
    return layout;
  }
  
  generatePowerUp(level: number, x: number, y: number): { id: string; type: 'health' | 'damage' | 'speed' | 'multishot' | 'rapidfire' | 'shield' | 'critical' | 'pierce' | 'lifeSteal' | 'invincibility'; name: string; value: number; color: string; x: number; y: number; duration: number } {
    const powerUps = [
      {
        id: `powerup-health-${Date.now()}`,
        type: 'health' as const,
        name: '生命恢复',
        value: 30 + level * 5,
        color: '#FF4444',
        x,
        y,
        duration: 0
      },
      {
        id: `powerup-damage-${Date.now()}`,
        type: 'damage' as const,
        name: '伤害提升',
        value: 0.3,
        color: '#FFAA00',
        x,
        y,
        duration: 10000
      },
      {
        id: `powerup-speed-${Date.now()}`,
        type: 'speed' as const,
        name: '速度提升',
        value: 0.5,
        color: '#44FF44',
        x,
        y,
        duration: 8000
      },
      {
        id: `powerup-multishot-${Date.now()}`,
        type: 'multishot' as const,
        name: '多重射击',
        value: 2,
        color: '#4488FF',
        x,
        y,
        duration: 12000
      },
      {
        id: `powerup-rapidfire-${Date.now()}`,
        type: 'rapidfire' as const,
        name: '急速射击',
        value: 0.3,
        color: '#FF44FF',
        x,
        y,
        duration: 8000
      },
      {
        id: `powerup-shield-${Date.now()}`,
        type: 'shield' as const,
        name: '护盾',
        value: 50,
        color: '#00FFFF',
        x,
        y,
        duration: 5000
      },
      {
        id: `powerup-critical-${Date.now()}`,
        type: 'critical' as const,
        name: '暴击提升',
        value: 0.3,
        color: '#FFD700',
        x,
        y,
        duration: 10000
      },
      {
        id: `powerup-pierce-${Date.now()}`,
        type: 'pierce' as const,
        name: '穿透提升',
        value: 2,
        color: '#9932CC',
        x,
        y,
        duration: 8000
      },
      {
        id: `powerup-lifeSteal-${Date.now()}`,
        type: 'lifeSteal' as const,
        name: '生命偷取',
        value: 0.2,
        color: '#8B0000',
        x,
        y,
        duration: 12000
      },
      {
        id: `powerup-invincibility-${Date.now()}`,
        type: 'invincibility' as const,
        name: '无敌状态',
        value: 1,
        color: '#FF69B4',
        x,
        y,
        duration: 5000
      }
    ];
    
    return powerUps[Math.floor(Math.random() * powerUps.length)];
  }
}

export const roguelikeGenerator = new RoguelikeGenerator();
