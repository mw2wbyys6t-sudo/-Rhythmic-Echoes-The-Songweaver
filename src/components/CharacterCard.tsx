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
