import React, { useState } from 'react';
import useGameStore from '../store/gameStore';

interface StoreProps {
  onNext: () => void;
  onReturnToMain: () => void;
}

const Store: React.FC<StoreProps> = ({ onNext, onReturnToMain }) => {
  const coins = useGameStore((state) => state.coins);
  const setCoins = useGameStore((state) => state.setCoins);
  const setHealth = useGameStore((state) => state.setHealth);
  const maxHealth = useGameStore((state) => state.maxHealth);
  const unlockedSkills = useGameStore((state) => state.unlockedSkills);
  const unlockSkill = useGameStore((state) => state.unlockSkill);
  const skills = useGameStore((state) => state.skills);
  const currentLevel = useGameStore((state) => state.currentLevel);
  
  const [message, setMessage] = useState('');

  // 商店商品
  const shopItems = [
    {
      id: 'health_potion',
      name: '生命药水',
      description: '恢复全部生命值',
      price: 50,
      icon: '❤️',
      effect: () => {
        setHealth(maxHealth);
        setMessage('✅ 生命值已恢复！');
      }
    },
    {
      id: 'max_health',
      name: '生命上限',
      description: '增加20点最大生命值',
      price: 100,
      icon: '💖',
      effect: () => {
        useGameStore.getState().setHealth(useGameStore.getState().maxHealth + 20);
        useGameStore.getState().setHealth(useGameStore.getState().maxHealth + 20);
        setMessage('✅ 生命上限已提升！');
      }
    },
    {
      id: 'damage_boost',
      name: '伤害提升',
      description: '永久增加10%伤害',
      price: 80,
      icon: '⚔️',
      effect: () => {
        useGameStore.getState().applyBuff('damage', Infinity, 0.1);
        setMessage('✅ 伤害已提升！');
      }
    },
    {
      id: 'speed_boost',
      name: '速度提升',
      description: '永久增加10%移动速度',
      price: 60,
      icon: '⚡',
      effect: () => {
        useGameStore.getState().applyBuff('speed', Infinity, 0.1);
        setMessage('✅ 速度已提升！');
      }
    },
    {
      id: 'skill_unlock',
      name: '技能解锁',
      description: '解锁一个随机技能',
      price: 150,
      icon: '🔓',
      effect: () => {
        const lockedSkills = skills.filter(skill => !unlockedSkills.includes(skill.id));
        if (lockedSkills.length > 0) {
          const randomSkill = lockedSkills[Math.floor(Math.random() * lockedSkills.length)];
          unlockSkill(randomSkill.id);
          setMessage(`✅ 解锁了技能: ${randomSkill.name}！`);
        } else {
          setMessage('❌ 所有技能都已解锁！');
        }
      }
    },
    {
      id: 'coin_double',
      name: '金币翻倍',
      description: '本局游戏金币获得翻倍',
      price: 200,
      icon: '💰',
      effect: () => {
        useGameStore.getState().applyBuff('coin_double', Infinity, 2);
        setMessage('✅ 金币获得已翻倍！');
      }
    }
  ];

  const handleBuy = (item: { id: string; name: string; description: string; price: number; icon: string; effect: () => void }) => {
    if (coins >= item.price) {
      setCoins(prev => prev - item.price);
      item.effect();
      setTimeout(() => setMessage(''), 2000);
    } else {
      setMessage('❌ 金币不足！');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
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

      <div className="w-full max-w-5xl bg-gray-800 bg-opacity-95 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl relative z-10 mx-2 sm:mx-0">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 sm:mb-6 md:mb-8">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400">
            商店
          </span>
        </h2>

        {message && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-gray-700 text-center">
            <p className="text-lg sm:text-xl font-bold">{message}</p>
          </div>
        )}

        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <div className="text-lg sm:text-xl md:text-2xl text-yellow-400 font-bold">
            💰 金币: {coins}
          </div>
          <div className="text-base sm:text-lg md:text-xl text-white">
            关卡: {currentLevel}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {shopItems.map((item) => (
            <div
              key={item.id}
              className={`bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 transition-all duration-300 ${coins >= item.price ? 'border-purple-400 hover:border-purple-300 cursor-pointer' : 'border-gray-600 opacity-70'}`}
              onClick={() => handleBuy(item)}
            >
              <div className="text-center mb-3 sm:mb-4">
                <span className="text-3xl sm:text-4xl md:text-5xl block mb-1 sm:mb-2">{item.icon}</span>
                <h3 className="text-lg sm:text-xl font-bold text-white">{item.name}</h3>
                <p className="text-sm sm:text-base text-gray-300 mt-1 sm:mt-2">{item.description}</p>
              </div>
              <div className="mt-3 sm:mt-4">
                <div className="text-center text-lg sm:text-xl md:text-2xl font-bold text-yellow-400">
                  {item.price} 💰
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <button
            onClick={onReturnToMain}
            className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-300 text-base sm:text-lg"
          >
            返回主菜单
          </button>
          <button
            onClick={onNext}
            className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-xl hover:from-green-400 hover:to-blue-400 transition-all duration-300 text-base sm:text-lg"
          >
            继续游戏
          </button>
        </div>
      </div>
    </div>
  );
};

export default Store;