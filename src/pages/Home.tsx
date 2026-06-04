import React, { useEffect, useState } from 'react';
import useGameStore from '../store/gameStore';
import Game from './Game';
import Upgrade from './Upgrade';
import Store from './Store';

// 激励人的标语
const motivationalSlogans = [
  "音乐点燃激情，勇气征服一切！",
  "在节奏中战斗，在胜利中欢笑！",
  "每一个节拍都是前进的动力！",
  "用音乐唤醒沉睡的战士！",
  "僵尸不可怕，可怕的是失去战斗的勇气！",
  "节奏不停，战斗不止！",
  "在音乐的海洋中，做自己的英雄！",
  "每一发子弹都是对胜利的渴望！",
  "让音乐成为你最强大的武器！",
  "在旋律中前进，在战斗中成长！"
];

const Home: React.FC = () => {
  const resetGame = useGameStore((state) => state.resetGame);
  const character = useGameStore((state) => state.character);
  const setCharacter = useGameStore((state) => state.setCharacter);
  const setSelectedCharacter = useGameStore((state) => state.setSelectedCharacter);
  const saveGame = useGameStore((state) => state.saveGame);
  const loadGame = useGameStore((state) => state.loadGame);
  const deleteSave = useGameStore((state) => state.deleteSave);
  const [slogan, setSlogan] = useState(motivationalSlogans[0]);
  const [showCharacter, setShowCharacter] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showStore, setShowStore] = useState(false);
  const [showSaveLoad, setShowSaveLoad] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // 从游戏返回主菜单的函数
  const handleReturnToMain = () => {
    setShowGame(false);
    setShowUpgrade(false);
    resetGame();
  };

  // 关卡完成时显示升级页面
  const handleLevelComplete = () => {
    setShowGame(false);
    setShowUpgrade(true);
  };

  // 升级完成后显示商店
  const handleUpgradeComplete = () => {
    setShowUpgrade(false);
    setShowStore(true);
  };

  // 商店完成后回到游戏
  const handleStoreComplete = () => {
    setShowStore(false);
    setShowGame(true);
  };

  // 初始化时随机选择标语
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * motivationalSlogans.length);
    setSlogan(motivationalSlogans[randomIndex]);
  }, []);

  const handleStartGame = () => {
    resetGame();
    setShowCharacter(true);
  };

  const handleSaveCharacter = () => {
    setShowCharacter(false);
    setShowMap(true);
    setSelectedCharacter(character);
  };

  const handleSaveMap = () => {
    setShowMap(false);
    setShowGame(true);
  };

  const handleImportPlaylist = () => {
    setShowPlaylist(true);
  };

  const handleSaveGame = () => {
    const success = saveGame();
    setSaveStatus(success ? '✅ 存档成功！' : '❌ 存档失败！');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const handleLoadGame = () => {
    const success = loadGame();
    if (success) {
      setSaveStatus('✅ 加载成功！');
      setTimeout(() => {
        setShowSaveLoad(false);
        setShowGame(true);
      }, 1000);
    } else {
      setSaveStatus('❌ 加载失败！');
    }
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const handleDeleteSave = () => {
    const success = deleteSave();
    setSaveStatus(success ? '✅ 存档已删除！' : '❌ 删除失败！');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  // 地图数据 - 添加更丰富的描述
  const maps: { id: string; name: string; description: string; icon: string; image: string }[] = [
    { id: 'city', name: '城市废墟', description: '在被僵尸占领的繁华城市中战斗，感受末日的苍凉', icon: '🏙️', image: 'city.png' },
    { id: 'forest', name: '神秘森林', description: '在茂密幽暗的森林中与僵尸周旋，每一棵树后都可能有危险', icon: '🌲', image: 'forest.png' },
    { id: 'lab', name: '恐怖实验室', description: '在封闭的生化实验室中与变异僵尸战斗，小心毒气泄漏！', icon: '🔬', image: 'lab.png' },
    { id: 'desert', name: '荒漠绿洲', description: '在广阔炎热的沙漠中与僵尸对决，寻找生存的希望！', icon: '🏜️', image: 'desert.png' }
  ];

  // 角色选项 - 更丰富的选择
  const genderOptions = [
    { value: 'male', label: '男', icon: '👨' },
    { value: 'female', label: '女', icon: '👩' }
  ];

  const hairOptions = [
    { value: 'default', label: '默认发型', icon: '💇' },
    { value: 'short', label: '精神短发', icon: '✂️' },
    { value: 'long', label: '飘逸长发', icon: '💇‍♀️' },
    { value: 'spiky', label: '酷炫刺头', icon: '🔥' },
    { value: 'ponytail', label: '清爽马尾', icon: '🎀' },
    { value: 'curly', label: '浪漫卷发', icon: '🌀' },
    { value: 'afro', label: '爆炸头', icon: '✊' },
    { value: 'mohawk', label: '莫霍克发型', icon: '🤘' },
    { value: 'bun', label: '丸子头', icon: '👱‍♀️' },
    { value: 'braids', label: '辫子', icon: '👧' },
    { value: 'fauxhawk', label: '伪莫霍克', icon: '😎' },
    { value: 'shaved', label: '寸头', icon: '🫡' }
  ];

  const clothesOptions = [
    { value: 'default', label: '默认服装', icon: '👕' },
    { value: 'casual', label: '休闲运动装', icon: '🎽' },
    { value: 'combat', label: '战术战斗装', icon: '🎖️' },
    { value: 'scifi', label: '未来科幻装', icon: '🚀' },
    { value: 'ninja', label: '神秘忍者装', icon: '🥷' },
    { value: 'pirate', label: '海盗冒险装', icon: '🏴‍☠️' },
    { value: 'mage', label: '魔法师长袍', icon: '🧙' },
    { value: 'knight', label: '骑士铠甲', icon: '⚔️' },
    { value: 'viking', label: '维京战士装', icon: '🛡️' },
    { value: 'samurai', label: '武士盔甲', icon: '🗡️' },
    { value: 'space', label: '太空宇航员', icon: '🚀' },
    { value: 'punk', label: '朋克摇滚装', icon: '🤘' },
    { value: 'angel', label: '天使翅膀装', icon: '👼' },
    { value: 'devil', label: '恶魔角装', icon: '😈' },
    { value: 'cyberpunk', label: '赛博朋克装', icon: '💻' },
    { value: 'cowboy', label: '西部牛仔装', icon: '🤠' }
  ];

  const skinOptions = [
    { value: 'default', label: '自然肤色', icon: '🧑' },
    { value: 'light', label: '白皙皮肤', icon: '👱' },
    { value: 'medium', label: '健康肤色', icon: '🧒' },
    { value: 'tan', label: '小麦肤色', icon: '🏃' },
    { value: 'dark', label: '古铜肤色', icon: '🏊' }
  ];

  // 声音选项
  const voiceTypeOptions = [
    { value: 'loli', label: '萝莉音', icon: '🎀' },
    { value: '大叔', label: '大叔音', icon: '🧔' },
    { value: '御姐', label: '御姐音', icon: '💄' },
    { value: '正太', label: '正太音', icon: '👦' }
  ];

  const languageOptions = [
    { value: 'zh', label: '中文', icon: '🇨🇳' },
    { value: 'en', label: 'English', icon: '🇺🇸' },
    { value: 'ja', label: '日本語', icon: '🇯🇵' }
  ];

  const selectedMap = useGameStore((state) => state.selectedMap);
  const setSelectedMap = useGameStore((state) => state.setSelectedMap);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-800 to-indigo-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* BanG Dream!风格的背景动画 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 动态光效 - 更鲜艳的色彩 */}
        {Array.from({ length: 15 }).map((_, index) => (
          <div
            key={index}
            className="absolute rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 opacity-30 animate-pulse"
            style={{
              width: `${Math.random() * 200 + 150}px`,
              height: `${Math.random() * 200 + 150}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 10 + 15}s`,
              animationDelay: `${Math.random() * 3}s`,
              filter: 'blur(40px)'
            }}
          />
        ))}
        
        {/* 音乐音符粒子 */}
        {Array.from({ length: 40 }).map((_, index) => (
          <div
            key={index}
            className="absolute text-2xl opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 8 + 12}s linear infinite`,
              animationDelay: `${Math.random() * 4}s`
            }}
          >
            {['🎵', '🎶', '🎸', '🎤', '✨'][Math.floor(Math.random() * 5)]}
          </div>
        ))}

        {/* 音乐波形背景 - 更动感 */}
        <div className="absolute inset-0 flex items-end justify-center gap-1 opacity-15">
          {Array.from({ length: 80 }).map((_, index) => (
            <div
              key={index}
              className="w-1.5 bg-gradient-to-t from-pink-500 via-purple-500 to-blue-500 rounded-t-full"
              style={{ 
                height: `${Math.random() * 70 + 30}%`,
                animation: `wave ${Math.random() * 1.5 + 0.8}s ease-in-out infinite alternate`,
                animationDelay: `${Math.random() * 1.5}s`,
                animationTimingFunction: 'ease-in-out'
              }}
            />
          ))}
        </div>

        {/* 网格装饰 */}
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full grid grid-cols-12 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="border-r border-white/10 h-full"></div>
            ))}
          </div>
          <div className="h-full w-full grid grid-rows-12 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="border-b border-white/10 w-full"></div>
            ))}
          </div>
        </div>
      </div>

      {showCharacter ? (
        <div className="w-full max-w-5xl bg-gray-800 bg-opacity-90 rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 sm:mb-8 text-center">🎨 创建你的专属角色</h2>
          
          {/* 角色预览 */}
          <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 p-4 sm:p-6 bg-gray-700 bg-opacity-50 rounded-2xl">
            <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
              <div className="text-5xl sm:text-6xl md:text-7xl">
                {character.gender === 'male' ? '👨' : '👩'}
              </div>
            </div>
            <div className="text-center md:text-left flex-1">
              <p className="text-lg sm:text-xl md:text-2xl text-white mb-1 sm:mb-2 font-bold">设计属于你自己的战士</p>
              <p className="text-sm sm:text-base text-gray-300">选择性别、发型、服装和肤色，打造独一无二的角色</p>
            </div>
          </div>

          {/* 自定义选项 */}
          <div className="space-y-6 sm:space-y-8 mb-6 sm:mb-8">
            {/* 性别选择 */}
            <div>
              <label className="block text-white text-lg sm:text-xl mb-3 sm:mb-4 font-semibold">👤 性别</label>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {genderOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setCharacter({ ...character, gender: option.value })}
                    className={`py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                      character.gender === option.value
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white ring-4 ring-purple-300 shadow-lg'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                  >
                    <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">{option.icon}</div>
                    <div className="text-base sm:text-lg font-bold">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 发型 */}
            <div>
              <label className="block text-white text-lg sm:text-xl mb-3 sm:mb-4 font-semibold">💇 发型</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 sm:gap-4">
                {hairOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setCharacter({ ...character, hair: option.value })}
                    className={`py-2 sm:py-3 px-3 sm:px-4 rounded-xl transition-all duration-300 flex items-center gap-2 sm:gap-3 ${
                      character.hair === option.value
                        ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white ring-2 ring-pink-300'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                  >
                    <span className="text-xl sm:text-2xl">{option.icon}</span>
                    <span className="text-sm sm:text-base font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 服装 */}
            <div>
              <label className="block text-white text-lg sm:text-xl mb-3 sm:mb-4 font-semibold">👕 服装</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                {clothesOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setCharacter({ ...character, clothes: option.value })}
                    className={`py-2 sm:py-3 px-2 sm:px-4 rounded-xl transition-all duration-300 flex flex-col items-center gap-1 sm:gap-2 ${
                      character.clothes === option.value
                        ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white ring-2 ring-green-300'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl">{option.icon}</span>
                    <span className="text-xs sm:text-sm font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 肤色 */}
            <div>
              <label className="block text-white text-lg sm:text-xl mb-3 sm:mb-4 font-semibold">🧑 肤色</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                {skinOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setCharacter({ ...character, skin: option.value })}
                    className={`py-2 sm:py-3 px-2 sm:px-4 rounded-xl transition-all duration-300 flex flex-col items-center gap-1 sm:gap-2 ${
                      character.skin === option.value
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white ring-2 ring-yellow-300'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl">{option.icon}</span>
                    <span className="text-xs sm:text-sm font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 声线选择 */}
            <div>
              <label className="block text-white text-lg sm:text-xl mb-3 sm:mb-4 font-semibold">🎤 声线</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-3 sm:gap-4">
                {voiceTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setCharacter({ ...character, voiceType: option.value })}
                    className={`py-2 sm:py-3 px-3 sm:px-4 rounded-xl transition-all duration-300 flex flex-col items-center gap-1 sm:gap-2 ${
                      character.voiceType === option.value
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white ring-2 ring-purple-300'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl">{option.icon}</span>
                    <span className="text-xs sm:text-sm font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 语言选择 */}
            <div>
              <label className="block text-white text-lg sm:text-xl mb-3 sm:mb-4 font-semibold">🌍 语言</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 sm:gap-4">
                {languageOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setCharacter({ ...character, language: option.value })}
                    className={`py-2 sm:py-3 px-3 sm:px-4 rounded-xl transition-all duration-300 flex flex-col items-center gap-1 sm:gap-2 ${
                      character.language === option.value
                        ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white ring-2 ring-blue-300'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl">{option.icon}</span>
                    <span className="text-xs sm:text-sm font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <button
              onClick={() => setShowCharacter(false)}
              className="flex-1 bg-gray-700 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-xl hover:bg-gray-600 transition-all duration-300 text-lg sm:text-xl"
            >
              返回
            </button>
            <button
              onClick={handleSaveCharacter}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-xl hover:shadow-xl transition-all duration-300 text-lg sm:text-xl"
            >
              保存并继续
            </button>
          </div>
        </div>
      ) : showMap ? (
        <div className="w-full max-w-6xl bg-gray-800 bg-opacity-90 rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 sm:mb-8 text-center">🗺️ 选择你的战场</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
            {maps.map((map) => (
              <div
                key={map.id}
                onClick={() => setSelectedMap(map)}
                className={`bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-4 sm:p-6 md:p-8 cursor-pointer transition-all duration-500 transform hover:-translate-y-2 sm:hover:-translate-y-4 hover:shadow-2xl border-2 ${
                  selectedMap?.id === map.id 
                    ? 'border-green-400 ring-4 ring-green-500/30'
                    : 'border-transparent hover:border-purple-400'
                }`}
              >
                <div className="text-center mb-4">
                  <span className="text-5xl sm:text-6xl md:text-7xl block mb-3 sm:mb-4">{map.icon}</span>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                    {map.name}
                  </h3>
                </div>
                <div className="bg-gray-900 bg-opacity-50 rounded-xl p-3 sm:p-4">
                  <p className="text-sm sm:text-base text-gray-300 text-center leading-relaxed">{map.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <button
              onClick={() => setShowMap(false)}
              className="flex-1 bg-gray-700 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-xl hover:bg-gray-600 transition-all duration-300 text-lg sm:text-xl"
            >
              返回
            </button>
            <button
              onClick={handleSaveMap}
              className="flex-1 bg-gradient-to-r from-red-600 to-purple-600 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-xl hover:shadow-xl transition-all duration-300 text-lg sm:text-xl"
            >
              开始战斗！
            </button>
          </div>
        </div>
      ) : showGame ? (
        <Game 
          onReturnToMain={handleReturnToMain} 
          onLevelComplete={handleLevelComplete}
        />
      ) : showUpgrade ? (
        <Upgrade onNext={handleUpgradeComplete} />
      ) : showStore ? (
        <Store onNext={handleStoreComplete} onReturnToMain={handleReturnToMain} />
      ) : showPlaylist ? (
        <div className="w-full max-w-5xl bg-gray-800 bg-opacity-90 rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 sm:mb-8 text-center">🎵 导入歌单</h2>
          <div className="space-y-6 sm:space-y-8">
            {/* 平台选择 */}
            <div className="bg-gray-700 bg-opacity-50 rounded-2xl p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">选择导入平台</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { platform: 'spotify', label: 'Spotify', icon: '🎵' },
                  { platform: 'apple', label: 'Apple Music', icon: '🍎' },
                  { platform: 'youtube', label: 'YouTube', icon: '🎬' },
                  { platform: 'local', label: '本地文件', icon: '💾' }
                ].map((item) => (
                  <button
                    key={item.platform}
                    onClick={() => {
                      if (item.platform === 'local') {
                        // 触发文件选择
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'audio/*';
                        input.multiple = true;
                        input.onchange = async (e) => {
                          const target = e.target as HTMLInputElement;
                          if (target.files) {
                            const files = Array.from(target.files);
                            if (files.length > 0) {
                              try {
                                const songs = await import('@/utils/soundManager').then(m => m.soundManager.importPlaylist('local', { files }));
                                alert(`成功导入 ${songs.length} 首歌曲！`);
                                setShowPlaylist(false);
                              } catch (error) {
                                console.error('导入失败:', error);
                                alert('导入失败，请重试');
                              }
                            }
                          }
                        };
                        input.click();
                      } else {
                        // 模拟其他平台导入
                        import('@/utils/soundManager').then(m => {
                          m.soundManager.importPlaylist(item.platform as any, {});
                          alert(`成功从 ${item.label} 导入歌单！`);
                          setShowPlaylist(false);
                        });
                      }
                    }}
                    className="bg-gray-800 text-white py-3 sm:py-4 px-4 rounded-xl hover:bg-gray-700 transition-all duration-300 flex flex-col items-center gap-2 sm:gap-3"
                  >
                    <span className="text-2xl sm:text-3xl">{item.icon}</span>
                    <span className="text-sm sm:text-base font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 导入说明 */}
            <div className="bg-gray-700 bg-opacity-30 rounded-2xl p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">导入说明</h3>
              <ul className="space-y-2 sm:space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span>本地文件：支持MP3、WAV等音频格式</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span>Spotify：导入您的播放列表（模拟）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span>Apple Music：导入您的音乐库（模拟）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span>YouTube：导入您的播放列表（模拟）</span>
                </li>
              </ul>
            </div>

            {/* 按钮 */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowPlaylist(false)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-xl hover:shadow-xl transition-all duration-300 text-lg sm:text-xl"
              >
                返回
              </button>
            </div>
          </div>
        </div>
      ) : showSaveLoad ? (
        <div className="w-full max-w-5xl bg-gray-800 bg-opacity-90 rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 sm:mb-8 text-center">💾 存档管理</h2>
          
          {saveStatus && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-gray-700 text-center">
              <p className="text-lg sm:text-xl font-bold">{saveStatus}</p>
            </div>
          )}
          
          <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
            <button
              onClick={handleSaveGame}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 sm:py-5 px-6 sm:px-8 rounded-xl hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 sm:gap-4"
            >
              <span className="text-2xl sm:text-3xl">💾</span>
              <span className="text-lg sm:text-xl font-bold">保存游戏</span>
            </button>
            
            <button
              onClick={handleLoadGame}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 sm:py-5 px-6 sm:px-8 rounded-xl hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 sm:gap-4"
            >
              <span className="text-2xl sm:text-3xl">📂</span>
              <span className="text-lg sm:text-xl font-bold">加载游戏</span>
            </button>
            
            <button
              onClick={handleDeleteSave}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-4 sm:py-5 px-6 sm:px-8 rounded-xl hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 sm:gap-4"
            >
              <span className="text-2xl sm:text-3xl">🗑️</span>
              <span className="text-lg sm:text-xl font-bold">删除存档</span>
            </button>
          </div>
          
          <button
            onClick={() => setShowSaveLoad(false)}
            className="w-full bg-gray-700 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-xl hover:bg-gray-600 transition-all duration-300 text-lg sm:text-xl"
          >
            返回主菜单
          </button>
        </div>
      ) : (
        <>
          {/* 游戏标题 - BanG Dream!风格 */}
          <div className="mb-8 sm:mb-12 md:mb-16 text-center relative z-10 px-4">
            <div className="inline-block">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-9xl font-bold mb-3 sm:mb-4 md:mb-6 tracking-wider relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-500 animate-pulse">节奏</span>
                <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">战争</span>
              </h1>
              {/* 装饰音符 */}
              <div className="absolute -top-4 sm:-top-6 md:-top-8 -right-8 sm:-right-12 md:-right-16 text-xl sm:text-2xl md:text-3xl lg:text-4xl text-pink-400 animate-bounce">🎵</div>
              <div className="absolute -bottom-4 sm:-bottom-6 md:-bottom-8 -left-8 sm:-left-12 md:-left-16 text-xl sm:text-2xl md:text-3xl lg:text-4xl text-blue-400 animate-bounce" style={{animationDelay: '1s'}}>🎸</div>
            </div>
            
            {/* 激励人的标语 */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-white mb-4 sm:mb-6 md:mb-8 font-light max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed">
              <span className="text-pink-300">{slogan}</span>
            </p>
          </div>

          {/* 三个按钮 - BanG Dream!风格 */}
          <div className="flex flex-col md:flex-row gap-4 sm:gap-6 w-full max-w-4xl relative z-10 px-4">
            <button
              onClick={handleImportPlaylist}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-5 sm:py-6 md:py-7 px-4 sm:px-6 rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-400 transform hover:-translate-y-2 sm:hover:-translate-y-4 group border-2 border-pink-400/50"
            >
              <div className="flex flex-col items-center gap-2 sm:gap-4">
                <span className="text-2xl sm:text-3xl md:text-4xl group-hover:scale-110 transition-transform duration-300">🎵</span>
                <span className="text-base sm:text-lg md:text-xl font-bold tracking-wide">导入歌单</span>
                <span className="text-xs sm:text-sm text-pink-200">音乐就是力量</span>
              </div>
            </button>
            
            <button
              onClick={handleStartGame}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-500 text-white py-5 sm:py-6 md:py-7 px-4 sm:px-6 rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-400 transform hover:-translate-y-2 sm:hover:-translate-y-4 group border-2 border-purple-400/50"
            >
              <div className="flex flex-col items-center gap-2 sm:gap-4">
                <span className="text-2xl sm:text-3xl md:text-4xl group-hover:scale-110 transition-transform duration-300">🎮</span>
                <span className="text-base sm:text-lg md:text-xl font-bold tracking-wide">开始游戏</span>
                <span className="text-xs sm:text-sm text-purple-200">节奏与战斗的融合</span>
              </div>
            </button>
            
            <button
              onClick={() => setShowSaveLoad(true)}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-5 sm:py-6 md:py-7 px-4 sm:px-6 rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-400 transform hover:-translate-y-2 sm:hover:-translate-y-4 group border-2 border-blue-400/50"
            >
              <div className="flex flex-col items-center gap-2 sm:gap-4">
                <span className="text-2xl sm:text-3xl md:text-4xl group-hover:scale-110 transition-transform duration-300">💾</span>
                <span className="text-base sm:text-lg md:text-xl font-bold tracking-wide">存档管理</span>
                <span className="text-xs sm:text-sm text-blue-200">保存你的冒险</span>
              </div>
            </button>
          </div>
        </>
      )}

      {/* 底部装饰 */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-500 via-blue-500 to-purple-500"></div>
    </div>
  );
};

export default Home;
