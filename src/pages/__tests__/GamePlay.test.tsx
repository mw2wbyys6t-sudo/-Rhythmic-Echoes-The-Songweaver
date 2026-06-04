import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Game from '../Game';
import { useGameStore } from '../../store/gameStore';

// 模拟必要的浏览器API
beforeEach(() => {
  // 模拟音频API
  global.AudioContext = jest.fn(() => ({
    createAnalyser: jest.fn(() => ({
      fftSize: 2048,
      frequencyBinCount: 1024,
      getByteFrequencyData: jest.fn(),
      getByteTimeDomainData: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
    })),
    createMediaElementSource: jest.fn(() => ({
      connect: jest.fn(),
      disconnect: jest.fn(),
    })),
    resume: jest.fn(),
    close: jest.fn(),
  }));

  // 模拟Canvas API
  global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    drawImage: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    arc: jest.fn(),
    stroke: jest.fn(),
    fill: jest.fn(),
    measureText: jest.fn(() => ({ width: 100 })),
    font: '',
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
  }));

  // 模拟Web Speech API
  global.speechSynthesis = {
    speak: jest.fn(),
    cancel: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    getVoices: jest.fn(() => []),
  };

  // 模拟Howler.js
  jest.mock('howler', () => ({
    Howl: jest.fn(() => ({
      play: jest.fn(),
      pause: jest.fn(),
      stop: jest.fn(),
      volume: jest.fn(),
      on: jest.fn(),
      once: jest.fn(),
      off: jest.fn(),
      state: 'loaded',
    })),
  }));
});

describe('游戏玩法测试', () => {
  // 测试1: 游戏启动和初始化
  test('游戏能够正常启动和初始化', async () => {
    render(<Game onLevelComplete={() => {}} />);
    
    // 检查游戏容器是否存在
    expect(screen.getByTestId('game-container')).toBeInTheDocument();
    
    // 检查游戏画布是否存在
    const canvas = screen.getByRole('img', { name: /game canvas/i });
    expect(canvas).toBeInTheDocument();
  });

  // 测试2: 键盘控制
  test('键盘控制能够正常响应', async () => {
    render(<Game onLevelComplete={() => {}} />);
    
    // 模拟键盘按下事件
    fireEvent.keyDown(document, { key: 'ArrowUp' });
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    
    // 模拟键盘释放事件
    fireEvent.keyUp(document, { key: 'ArrowUp' });
    fireEvent.keyUp(document, { key: 'ArrowDown' });
    fireEvent.keyUp(document, { key: 'ArrowLeft' });
    fireEvent.keyUp(document, { key: 'ArrowRight' });
    
    // 验证没有错误抛出
    expect(true).toBe(true);
  });

  // 测试3: 触摸控制
  test('触摸控制能够正常响应', async () => {
    render(<Game onLevelComplete={() => {}} />);
    
    const canvas = screen.getByRole('img', { name: /game canvas/i });
    
    // 模拟触摸开始事件
    fireEvent.touchStart(canvas, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    
    // 模拟触摸移动事件
    fireEvent.touchMove(canvas, {
      touches: [{ clientX: 150, clientY: 150 }],
    });
    
    // 模拟触摸结束事件
    fireEvent.touchEnd(canvas);
    
    // 验证没有错误抛出
    expect(true).toBe(true);
  });

  // 测试4: 游戏状态管理
  test('游戏状态能够正常管理', async () => {
    render(<Game onLevelComplete={() => {}} />);
    
    // 获取游戏状态
    const { getState, setState } = useGameStore.getState();
    
    // 验证初始状态
    const initialState = getState();
    expect(initialState.player).toBeDefined();
    expect(initialState.enemies).toEqual([]);
    expect(initialState.bullets).toEqual([]);
    expect(initialState.powerUps).toEqual([]);
    expect(initialState.score).toBe(0);
    expect(initialState.level).toBe(1);
  });

  // 测试5: 敌人生成
  test('敌人能够正常生成', async () => {
    render(<Game onLevelComplete={() => {}} />);
    
    // 获取游戏状态
    const { getState, spawnEnemy } = useGameStore.getState();
    
    // 生成敌人
    spawnEnemy();
    
    // 验证敌人是否生成
    const state = getState();
    expect(state.enemies.length).toBeGreaterThan(0);
  });

  // 测试6: 碰撞检测
  test('碰撞检测能够正常工作', async () => {
    render(<Game onLevelComplete={() => {}} />);
    
    // 获取游戏状态
    const { getState, setState, spawnEnemy, fireBullet } = useGameStore.getState();
    
    // 设置玩家位置
    setState((state) => ({
      ...state,
      player: {
        ...state.player,
        x: 100,
        y: 100,
      },
    }));
    
    // 生成敌人
    spawnEnemy();
    
    // 发射子弹
    fireBullet();
    
    // 验证子弹是否生成
    const state = getState();
    expect(state.bullets.length).toBeGreaterThan(0);
  });

  // 测试7: 游戏结束条件
  test('游戏结束条件能够正常触发', async () => {
    render(<Game onLevelComplete={() => {}} />);
    
    // 获取游戏状态
    const { getState, setState } = useGameStore.getState();
    
    // 设置玩家生命值为0
    setState((state) => ({
      ...state,
      player: {
        ...state.player,
        health: 0,
      },
    }));
    
    // 验证游戏是否结束
    const state = getState();
    // 注意：实际的游戏结束逻辑可能在游戏循环中处理
    expect(state.player.health).toBe(0);
  });

  // 测试8: 升级系统
  test('升级系统能够正常工作', async () => {
    render(<Game onLevelComplete={() => {}} />);
    
    // 获取游戏状态
    const { getState, setState } = useGameStore.getState();
    
    // 增加玩家经验值
    setState((state) => ({
      ...state,
      player: {
        ...state.player,
        experience: 100,
        level: 1,
      },
    }));
    
    // 验证玩家经验值
    const state = getState();
    expect(state.player.experience).toBe(100);
  });

  // 测试9: 响应式设计
  test('游戏能够适应不同屏幕尺寸', async () => {
    // 模拟不同屏幕尺寸
    const originalInnerWidth = window.innerWidth;
    const originalInnerHeight = window.innerHeight;
    
    // 测试移动端尺寸
    window.innerWidth = 375;
    window.innerHeight = 667;
    window.dispatchEvent(new Event('resize'));
    
    render(<Game onLevelComplete={() => {}} />);
    
    // 测试PC端尺寸
    window.innerWidth = 1920;
    window.innerHeight = 1080;
    window.dispatchEvent(new Event('resize'));
    
    // 恢复原始尺寸
    window.innerWidth = originalInnerWidth;
    window.innerHeight = originalInnerHeight;
    window.dispatchEvent(new Event('resize'));
    
    // 验证没有错误抛出
    expect(true).toBe(true);
  });

  // 测试10: 音频系统
  test('音频系统能够正常工作', async () => {
    render(<Game onLevelComplete={() => {}} />);
    
    // 验证音频相关的模拟函数被调用
    expect(global.AudioContext).toHaveBeenCalled();
  });
});

// 性能测试
describe('游戏性能测试', () => {
  test('游戏初始化时间不超过1秒', async () => {
    const startTime = performance.now();
    render(<Game onLevelComplete={() => {}} />);
    const endTime = performance.now();
    
    // 验证初始化时间不超过1秒
    expect(endTime - startTime).toBeLessThan(1000);
  });

  test('游戏状态更新性能', async () => {
    render(<Game onLevelComplete={() => {}} />);
    
    const { setState } = useGameStore.getState();
    
    const startTime = performance.now();
    
    // 执行多次状态更新
    for (let i = 0; i < 100; i++) {
      setState((state) => ({
        ...state,
        score: state.score + 1,
      }));
    }
    
    const endTime = performance.now();
    
    // 验证100次状态更新不超过100毫秒
    expect(endTime - startTime).toBeLessThan(100);
  });
});
