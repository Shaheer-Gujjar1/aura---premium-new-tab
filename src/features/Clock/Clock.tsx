import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AnalogueClock } from './AnalogueClock';
import { useTime } from '../../hooks/useTime';
import { useStore } from '../../stores/useStore';
import { Music } from 'lucide-react';


const DateDisplay: React.FC<{ time: Date; userName: string }> = ({ time, userName }) => {
  const day = time.toLocaleDateString([], { weekday: 'long' });
  const dateStr = time.toLocaleDateString([], { month: 'long', day: 'numeric' });
  const hours = time.getHours();
  const greeting = hours < 12 ? 'Good morning' : hours < 18 ? 'Good afternoon' : 'Good evening';
  
  return (
    <div className="flex flex-col items-start leading-tight">
      <p className="text-[10px] md:text-xs font-black text-[var(--accent-color)] uppercase tracking-[0.2em] mb-2 opacity-80">
        {greeting}, {userName}
      </p>
      <p className="text-lg md:text-xl font-medium text-white/60 tracking-wide uppercase">
        {day},
      </p>
      <p className="text-sm md:text-base font-medium text-white/30 tracking-widest uppercase mt-0.5">
        {dateStr}
      </p>
    </div>
  );
};


const TrackDisplay: React.FC<{
  currentTrack: { title: string; artist: string };
  isMediaPlaying: boolean;
}> = ({ currentTrack }) => (
  <div className="flex flex-col items-center gap-1">
    <div className="flex flex-col items-center">
      <span className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] max-w-[150px] truncate text-center">
        {currentTrack.title}
      </span>
      <span className="text-[8px] font-medium text-white/30 uppercase tracking-widest text-center">
        {currentTrack.artist}
      </span>
    </div>
  </div>
);

const Visualizer: React.FC<{ isMediaPlaying: boolean; isAnalogue?: boolean }> = ({ isMediaPlaying, isAnalogue }) => (
  <div className={`relative z-0 pointer-events-none flex items-center justify-center ${isAnalogue ? 'mt-2 h-12 w-full' : 'mt-1 h-16 w-full'}`}>
    <div className="flex items-end justify-center gap-[2px] h-full w-full max-w-[240px]">
      {[...Array(isAnalogue ? 20 : 32)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-full bg-gradient-to-t from-[var(--accent-color)]/20 via-[var(--accent-color)]/60 to-[var(--glow-color)] shadow-[0_0_10px_var(--glow-color)]"
          initial={{ height: 4 }}
          animate={isMediaPlaying ? {
            height: [
              10 + Math.sin(i * 0.5 + 0) * 5,
              (isAnalogue ? 18 : 30) + Math.sin(i * 0.3 + 1) * 8,
              (isAnalogue ? 25 : 45) + Math.sin(i * 0.4 + 2) * 10,
              (isAnalogue ? 20 : 35) + Math.sin(i * 0.2 + 3) * 6,
              15 + Math.sin(i * 0.5 + 4) * 8,
              10 + Math.sin(i * 0.3 + 5) * 5,
              (isAnalogue ? 22 : 40) + Math.sin(i * 0.4 + 6) * 9,
              (isAnalogue ? 28 : 50) + Math.sin(i * 0.2 + 7) * 12,
              (isAnalogue ? 16 : 28) + Math.sin(i * 0.5 + 8) * 7,
              12 + Math.sin(i * 0.3 + 9) * 6,
              10 + Math.sin(i * 0.5 + 10) * 5
            ],
            opacity: [0.4, 0.7, 0.5, 0.8, 0.6, 0.9, 0.5, 0.8, 0.6, 0.7, 0.4],
          } : {
            height: 4,
            opacity: 0.3,
          }}
          transition={isMediaPlaying ? {
            duration: 12,
            repeat: Infinity,
            ease: "linear",
            delay: i * (isAnalogue ? 0.08 : 0.05),
          } : {
            duration: 0.5,
          }}
        />
      ))}
    </div>
  </div>
);

export const Clock: React.FC = () => {
  const { time } = useTime();
  const { 
    preferences,
    isMediaPlaying,
    currentTrack,
    lastMediaActionTime,
    setLastMediaActionTime
  } = useStore();
  
  const [showMedia, setShowMedia] = useState(false);
  const isAnalogue = preferences.clockType === 'analogue';

  // Handle media visibility persistence
  useEffect(() => {
    const checkVisibility = () => {
      if (isMediaPlaying) {
        setShowMedia(true);
        return;
      }
      if (lastMediaActionTime) {
        const fiveMinutes = 5 * 60 * 1000;
        if (Date.now() - lastMediaActionTime < fiveMinutes) {
          setShowMedia(true);
        } else {
          setShowMedia(false);
          setLastMediaActionTime(null);
        }
      } else {
        setShowMedia(false);
      }
    };
    checkVisibility();
    const interval = setInterval(checkVisibility, 2000);
    return () => clearInterval(interval);
  }, [isMediaPlaying, lastMediaActionTime, setLastMediaActionTime]);


  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();
  
  const displayHours = preferences.clockFormat === '12h' ? (hours % 12 || 12) : hours;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const displaySeconds = seconds < 10 ? `0${seconds}` : seconds;


  return (
    <div
      className={`relative select-none ${isAnalogue ? 'flex flex-row items-center justify-center gap-8 md:gap-16' : 'flex flex-col items-center justify-center gap-0'}`}
    >
      {isAnalogue ? (
        <>
          {/* Center: Clock */}
          <div className="relative w-[240px] h-[240px] md:w-[280px] md:h-[280px] flex items-center justify-center">
            <AnalogueClock />
          </div>

          {/* Right Side: Date & Media (Fixed width column) */}
          <div className="hidden md:flex flex-col items-start gap-6 w-[200px]">
            <DateDisplay time={time} userName={preferences.userName || 'User'} />
            <AnimatePresence mode="wait">
              {showMedia ? (
                <motion.div
                  key="media"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col items-center w-full"
                >
                  <TrackDisplay 
                    currentTrack={currentTrack}
                    isMediaPlaying={isMediaPlaying}
                  />
                  <Visualizer isMediaPlaying={isMediaPlaying} isAnalogue={true} />
                </motion.div>
              ) : (
                <div className="p-2 text-white/10">
                  <Music className="w-4 h-4" />
                </div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Mobile Date below */}
          <div className="md:hidden absolute -bottom-12 left-1/2 -translate-x-1/2 w-full text-center flex justify-center">
             <DateDisplay time={time} userName={preferences.userName || 'User'} />
          </div>
        </>
      ) : (
        <>
          {/* Digital View: Increased Width Container */}
          <div className="relative min-w-[320px] md:min-w-[440px] h-[240px] md:h-[280px] flex items-center justify-center">
            {/* Digital Time Center */}
            <div className="flex flex-col items-center justify-center z-10">
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={displayHours}
                      initial={{ y: 20, opacity: 0, filter: 'blur(10px)' }}
                      animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                      exit={{ y: -20, opacity: 0, filter: 'blur(10px)' }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="text-7xl md:text-8xl font-display font-bold tracking-tighter drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
                    >
                      {displayHours}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-7xl md:text-8xl font-display font-bold tracking-tighter opacity-20 mx-1">:</span>
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={displayMinutes}
                      initial={{ y: 20, opacity: 0, filter: 'blur(10px)' }}
                      animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                      exit={{ y: -20, opacity: 0, filter: 'blur(10px)' }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="text-7xl md:text-8xl font-display font-bold tracking-tighter drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
                    >
                      {displayMinutes}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-7xl md:text-8xl font-display font-bold tracking-tighter opacity-20 mx-1">:</span>
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={displaySeconds}
                      initial={{ y: 20, opacity: 0, filter: 'blur(10px)' }}
                      animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                      exit={{ y: -20, opacity: 0, filter: 'blur(10px)' }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="text-7xl md:text-8xl font-display font-bold tracking-tighter drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
                    >
                      {displaySeconds}
                    </motion.span>
                  </AnimatePresence>
                </div>
                {preferences.clockFormat === '12h' && (
                  <span className="text-sm md:text-base font-bold text-white/30 uppercase tracking-[0.3em] vertical-text ml-2">
                    {ampm}
                  </span>
                )}
              </div>
              
              <AnimatePresence mode="wait">
                {showMedia && (
                  <motion.div
                    key="media-digital"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex flex-col items-center mt-6"
                  >
                    <TrackDisplay 
                      currentTrack={currentTrack}
                      isMediaPlaying={isMediaPlaying}
                    />
                    <Visualizer isMediaPlaying={isMediaPlaying} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* 3. Date Div (Center column, same width as parent) */}
          <div className="flex justify-center w-full mt-8">
            <DateDisplay time={time} userName={preferences.userName || 'User'} />
          </div>
        </>
      )}
    </div>
  );
};
