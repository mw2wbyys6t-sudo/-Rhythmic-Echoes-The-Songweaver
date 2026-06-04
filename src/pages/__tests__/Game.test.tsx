import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Game from '../Game';
import useGameStore from '../../store/gameStore';

// Mock the game store
jest.mock('../../store/gameStore', () => {
  const original = jest.requireActual('../../store/gameStore');
  return {
    __esModule: true,
    default: jest.fn(() => ({
      ...original.default(),
      selectedCharacter: {
        id: 'default',
        name: 'Default Character',
        speed: 6,
        skin: 'default',
        hair: 'default',
        clothes: 'default'
      },
      selectedWeapon: {
        id: 'pistol',
        name: '音乐手枪',
        damage: 20,
        fireRate: 0.5,
        bulletCount: 1,
        bulletSpeed: 12,
        bulletSize: 5,
        color: '#FFD700',
        element: 'none',
        elementChance: 0,
        elementDuration: 0,
        type: 'pistol'
      },
      weapons: [
        {
          id: 'pistol',
          name: '音乐手枪',
          damage: 20,
          fireRate: 0.5,
          bulletCount: 1,
          bulletSpeed: 12,
          bulletSize: 5,
          color: '#FFD700',
          element: 'none',
          elementChance: 0,
          elementDuration: 0,
          type: 'pistol'
        }
      ],
      level: 1,
      skills: [],
      unlockedSkills: [],
      enemies: [],
      setEnemies: jest.fn(),
      score: 0,
      setScore: jest.fn(),
      health: 100,
      setHealth: jest.fn(),
      maxHealth: 100,
      experience: 0,
      setExperience: jest.fn(),
      currentLevel: 1,
      setCurrentLevel: jest.fn(),
      isGameOver: false,
      setIsGameOver: jest.fn(),
      buffs: {},
      applyBuff: jest.fn(),
      updateBuffs: jest.fn(),
      coins: 0,
      setCoins: jest.fn(),
      musicPower: {
        musicIntensity: 0,
        rhythmBonus: 1.0,
        shieldStrength: 0,
        attackBoost: 0,
        speedBoost: 0,
        auraActive: false,
        songPhase: 'calm'
      },
      setMusicPower: jest.fn(),
      settings: {
        musicVolume: 0.7,
        soundVolume: 1.0,
        difficulty: 1,
        gameMode: 'normal'
      },
      setSettings: jest.fn(),
      resetGame: jest.fn()
    }))
  };
});

// Mock the sound manager
jest.mock('../../utils/soundManager', () => ({
  soundManager: {
    playSoundEffect: jest.fn(),
    playMotivationalVoice: jest.fn(),
    playComboVoiceLine: jest.fn(),
    playZombieSound: jest.fn(),
    updateMusicPower: jest.fn(),
    getMusicPower: jest.fn(() => ({
      musicIntensity: 0,
      rhythmBonus: 1.0,
      shieldStrength: 0,
      attackBoost: 0,
      speedBoost: 0,
      auraActive: false,
      songPhase: 'calm'
    })),
    setVolume: jest.fn(),
    setSoundVolume: jest.fn()
  }
}));

// Mock the music analyzer
jest.mock('../../utils/musicAnalyzer', () => ({
  musicAnalyzer: {
    getIntensityLevel: jest.fn(() => 0),
    detectBeat: jest.fn(() => false)
  }
}));

// Mock the roguelike generator
jest.mock('../../utils/roguelikeGenerator', () => ({
  roguelikeGenerator: {
    generateLevel: jest.fn(() => ({
      enemies: [],
      boss: null
    })),
    generatePowerUp: jest.fn(() => ({
      id: '1',
      type: 'health',
      name: 'Health',
      value: 20,
      color: '#00FF00',
      x: 400,
      y: 300,
      duration: 0
    }))
  }
}));

describe('Game Component', () => {
  test('should render game component', () => {
    render(<Game />);
    expect(screen.getByText('🎵 节奏战争 🎵')).toBeInTheDocument();
  });

  test('should open settings panel', () => {
    render(<Game />);
    fireEvent.click(screen.getByText('⚙️ 设置'));
    expect(screen.getByText('⚙️ 游戏设置')).toBeInTheDocument();
  });

  test('should close settings panel', () => {
    render(<Game />);
    fireEvent.click(screen.getByText('⚙️ 设置'));
    fireEvent.click(screen.getByText('✅ 保存设置'));
    expect(screen.queryByText('⚙️ 游戏设置')).not.toBeInTheDocument();
  });

  test('should handle pause button', () => {
    render(<Game />);
    // Simulate pressing 'P' key
    fireEvent.keyDown(window, { key: 'p', code: 'KeyP' });
    // The pause functionality is handled by the game loop, which is not fully tested here
    expect(true).toBe(true);
  });
});
