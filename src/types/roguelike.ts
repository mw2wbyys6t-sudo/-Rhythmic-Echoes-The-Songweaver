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
  burningDuration?: number;
  poisonedDuration?: number;
  shockedDuration?: number;
  frozenDuration?: number;
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
  description: string;
  unlockLevel: number;
}

export interface Level {
  id: number;
  enemies: Enemy[];
  boss?: Enemy;
  layout: string[][];
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
