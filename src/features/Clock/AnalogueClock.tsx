import React from 'react';
import { motion } from 'motion/react';
import { useTime } from '../../hooks/useTime';

export const AnalogueClock: React.FC = () => {
  const { time } = useTime();
  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  const secondDegrees = (seconds / 60) * 360;
  const minuteDegrees = ((minutes + seconds / 60) / 60) * 360;
  const hourDegrees = ((hours % 12 + minutes / 60) / 12) * 360;

  return (
    <div className="relative w-full h-full rounded-full bg-gray-900/40 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center justify-center transform-gpu">
      {/* Soft Inner Glow instead of complex shadows */}
      <div className="absolute inset-[4%] rounded-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      {/* Markers */}
      {[...Array(12)].map((_, i) => (
        <div key={i} className="absolute w-full h-full" style={{ transform: `rotate(${(i + 1) * 30}deg)` }}>
          <div className={`absolute top-[15px] left-1/2 -translate-x-1/2 rounded-full bg-gray-700 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5),inset_-1px_-1px_2px_rgba(255,255,255,0.1)] ${[2, 5, 8, 11].includes(i) ? 'w-2 h-2' : 'w-1.5 h-1.5'}`} />
        </div>
      ))}
      
      {/* Numbers */}
      {[...Array(12)].map((_, i) => (
        <div key={i} className="absolute w-full h-full text-center text-2xl font-semibold text-gray-400 [text-shadow:1px_1px_1px_rgba(0,0,0,0.5),-1px_-1px_1px_rgba(255,255,255,0.1)]" style={{ transform: `rotate(${(i + 1) * 30}deg)` }}>
          <span className="inline-block translate-y-[35px]" style={{ transform: `rotate(-${(i + 1) * 30}deg)` }}>{i + 1}</span>
        </div>
      ))}

      {/* Hands */}
      <motion.div
        className="absolute bottom-1/2 left-1/2 -translate-x-1/2 w-2 h-[50px] bg-gray-300 rounded-t-lg origin-bottom shadow-md z-10"
        style={{ rotate: hourDegrees }}
      />
      <motion.div
        className="absolute bottom-1/2 left-1/2 -translate-x-1/2 w-1.5 h-[80px] bg-gray-400 rounded-t-lg origin-bottom shadow-md z-20"
        style={{ rotate: minuteDegrees }}
      />
      <motion.div
        className="absolute bottom-1/2 left-1/2 -translate-x-1/2 w-1 h-[100px] bg-red-500 rounded-t-lg origin-bottom shadow-md z-30"
        style={{ rotate: secondDegrees }}
      />
      
      {/* Center pin */}
      <div className="absolute w-5 h-5 bg-gray-800 rounded-full z-40 shadow-[inset_3px_3px_6px_rgba(0,0,0,0.5),inset_-3px_-3px_6px_rgba(255,255,255,0.1)]" />
      <div className="absolute w-1.5 h-1.5 bg-gray-300 rounded-full z-50" />
    </div>
  );
};
