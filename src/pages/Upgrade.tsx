import React from 'react';
import useGameStore from '../store/gameStore';
import { roguelikeGenerator } from '../utils/roguelikeGenerator';
import type { PowerUp } from '../types/roguelike';

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
    setLevel,
    setCurrentLevel
  } = useGameStore();

  // 生成升级选项
  const powerUpOptions = [
    roguelikeGenerator.generatePowerUp(currentLevel, 0, 0),
    roguelikeGenerator.generatePowerUp(currentLevel, 0, 0),
    roguelikeGenerator.generatePowerUp(currentLevel, 0, 0)
  ];

  const handleSelectPowerUp = (powerUp: PowerUp) => {
    addPowerUp(powerUp);
    // 增加经验值和等级
    setExperience(prev => prev + 100);
    if (experience + 100 >= level * 100) {
      setLevel(prev => prev + 1);
    }
    // 增加当前关卡数
    setCurrentLevel(prev => prev + 1);
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

      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6 md:mb-8 relative z-10 px-4 text-center">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400">
          🎮 升级选择
        </span>
      </h1>

      <div className="text-white text-base sm:text-lg md:text-xl mb-6 sm:mb-8 relative z-10 px-4 text-center">
        关卡 {currentLevel} 完成！选择一个升级选项：
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-6xl relative z-10 w-full px-2">
        {powerUpOptions.map((powerUp) => (
          <div
            key={powerUp.id}
            className="bg-gray-800 border border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 cursor-pointer hover:bg-gray-700 transition-all duration-300 transform hover:scale-105"
            onClick={() => handleSelectPowerUp(powerUp)}
          >
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">✨</div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{powerUp.name}</h3>
            <div className="bg-purple-900 bg-opacity-50 p-2 sm:p-3 rounded-lg">
              <div className="text-xs sm:text-sm text-gray-300">效果</div>
              <div className="text-white font-bold">{powerUp.type} +{powerUp.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Upgrade;
