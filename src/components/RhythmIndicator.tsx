import React, { useEffect, useState } from 'react';

interface RhythmIndicatorProps {
  rhythmPoints: number[];
  currentTime: number;
}

const RhythmIndicator: React.FC<RhythmIndicatorProps> = ({ rhythmPoints, currentTime }) => {
  const [isBeat, setIsBeat] = useState(false);

  useEffect(() => {
    // 检测当前是否在节拍点
    const isCurrentBeat = rhythmPoints.some(point => {
      return Math.abs(point - currentTime) < 0.1;
    });

    if (isCurrentBeat && !isBeat) {
      setIsBeat(true);
      setTimeout(() => setIsBeat(false), 200);
    }
  }, [rhythmPoints, currentTime, isBeat]);

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <div className={`w-64 h-16 bg-black bg-opacity-70 rounded-full flex items-center justify-center transition-all duration-200 ${isBeat ? 'scale-110' : 'scale-100'}`}>
        <div className={`w-8 h-8 rounded-full ${isBeat ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></div>
        <div className="ml-4 flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i}
              className={`w-4 h-4 rounded-full ${isBeat && i === 1 ? 'bg-green-500' : 'bg-gray-600'}`}
            ></div>
          ))}
        </div>
        <div className="ml-4 text-white font-mono">
          {currentTime.toFixed(1)}
        </div>
      </div>
    </div>
  );
};

export default RhythmIndicator;
