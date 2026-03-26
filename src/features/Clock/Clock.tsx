import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, SkipBack, SkipForward, Music } from 'lucide-react';
import { AnalogueClock } from './AnalogueClock';
import { useTime } from '../../hooks/useTime';
import { useStore } from '../../stores/useStore';

const TRACKS = [
  { title: "Midnight Rain", artist: "Lofi Girl" },
  { title: "Neon Dreams", artist: "Synthwave Pro" },
  { title: "Ocean Waves", artist: "Nature Sounds" }
];

const DateDisplay: React.FC<{ time: Date }> = ({ time }) => {
  const day = time.toLocaleDateString([], { weekday: 'long' });
  const dateStr = time.toLocaleDateString([], { month: 'long', day: 'numeric' });
  
  return (
    <div className="flex flex-col items-start leading-tight">
      <p className="text-lg md:text-xl font-medium text-white/60 tracking-wide uppercase">
        {day},
      </p>
      <p className="text-sm md:text-base font-medium text-white/30 tracking-widest uppercase mt-0.5">
        {dateStr}
      </p>
    </div>
  );
};

const MediaControls: React.FC<{
  currentTrack: { title: string; artist: string };
  isMediaPlaying: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToggle: () => void;
}> = ({ currentTrack, isMediaPlaying, onPrev, onNext, onToggle }) => (
  <div className="flex flex-col items-center gap-2">
    <div className="flex flex-col items-center">
      <span className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] max-w-[150px] truncate text-center">
        {currentTrack.title}
      </span>
      <span className="text-[8px] font-medium text-white/30 uppercase tracking-widest text-center">
        {currentTrack.artist}
      </span>
    </div>
    <div className="flex items-center gap-4">
      <button onClick={onPrev} className="text-white/30 hover:text-white transition-colors">
        <SkipBack className="w-3.5 h-3.5" />
      </button>
      <button 
        onClick={onToggle}
        className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
      >
        {isMediaPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
      </button>
      <button onClick={onNext} className="text-white/30 hover:text-white transition-colors">
        <SkipForward className="w-3.5 h-3.5" />
      </button>
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
              10 + Math.sin(i * 0.5) * 5,
              (isAnalogue ? 25 : 45) + Math.sin(i * 0.3 + 2) * 10,
              15 + Math.sin(i * 0.4 + 4) * 8,
              10 + Math.sin(i * 0.5) * 5
            ],
            opacity: [0.4, 0.8, 0.5, 0.9, 0.4],
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
    setMediaPlaying, 
    lastMediaActionTime,
    setLastMediaActionTime,
    currentTrack, 
    setCurrentTrack 
  } = useStore();
  
  const [trackIndex, setTrackIndex] = useState(0);
  const [mediaProgress, setMediaProgress] = useState(0);
  const [showMedia, setShowMedia] = useState(false);

  const isAnalogue = preferences.clockType === 'analogue';

  // Simulated media progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMediaPlaying) {
      interval = setInterval(() => {
        setMediaProgress(prev => (prev >= 100 ? 0 : prev + 0.2));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMediaPlaying]);

  // Sync with real media playback if possible
  useEffect(() => {
    const updateMediaState = () => {
      if ('mediaSession' in navigator) {
        const state = navigator.mediaSession.playbackState;
        if (state === 'playing') {
          setMediaPlaying(true);
          setShowMedia(true);
        } else if (state === 'paused') {
          setMediaPlaying(false);
        }
      }
    };

    const interval = setInterval(updateMediaState, 1000);
    return () => clearInterval(interval);
  }, [setMediaPlaying]);

  // Handle media visibility persistence
  useEffect(() => {
    const checkVisibility = () => {
      // If actually playing, always show
      if (isMediaPlaying) {
        setShowMedia(true);
        return;
      }

      // If paused but was recently active, show for 5 mins
      if (lastMediaActionTime) {
        const fiveMinutes = 5 * 60 * 1000;
        const timeSinceLastAction = Date.now() - lastMediaActionTime;
        if (timeSinceLastAction < fiveMinutes) {
          setShowMedia(true);
        } else {
          setShowMedia(false);
          setLastMediaActionTime(null);
        }
      } else {
        // Only hide if not playing and no recent action
        if (!isMediaPlaying) {
          setShowMedia(false);
        }
      }
    };

    checkVisibility();
    const interval = setInterval(checkVisibility, 2000);
    return () => clearInterval(interval);
  }, [isMediaPlaying, lastMediaActionTime]);

  const nextTrack = () => {
    const next = (trackIndex + 1) % TRACKS.length;
    setTrackIndex(next);
    setCurrentTrack(TRACKS[next]);
    setMediaProgress(0);
    setLastMediaActionTime(Date.now());
  };

  const prevTrack = () => {
    const prev = (trackIndex - 1 + TRACKS.length) % TRACKS.length;
    setTrackIndex(prev);
    setCurrentTrack(TRACKS[prev]);
    setMediaProgress(0);
    setLastMediaActionTime(Date.now());
  };

  const togglePlay = () => {
    const newState = !isMediaPlaying;
    setMediaPlaying(newState);
    setLastMediaActionTime(Date.now());
    
    // Try to control real media if any
    if ('mediaSession' in navigator) {
      if (newState) {
        // This is tricky as we can't "start" external media, 
        // but we can update our internal state
      }
    }
  };

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
            <DateDisplay time={time} />
            <AnimatePresence mode="wait">
              {showMedia ? (
                <motion.div
                  key="media"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col items-center"
                >
                  <MediaControls 
                    currentTrack={currentTrack}
                    isMediaPlaying={isMediaPlaying}
                    onPrev={prevTrack}
                    onNext={nextTrack}
                    onToggle={togglePlay}
                  />
                  <Visualizer isMediaPlaying={isMediaPlaying} isAnalogue={true} />
                </motion.div>
              ) : (
                <motion.button 
                  key="music-toggle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => {
                    setMediaPlaying(true);
                    setShowMedia(true);
                  }}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/30 hover:text-white transition-all group"
                  title="Play Music"
                >
                  <Music className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          
          {/* Mobile Date below */}
          <div className="md:hidden absolute -bottom-8 left-1/2 -translate-x-1/2 w-full text-center">
             <DateDisplay time={time} />
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
                {showMedia ? (
                  <div className="flex flex-col items-center mt-6">
                    <MediaControls 
                      currentTrack={currentTrack}
                      isMediaPlaying={isMediaPlaying}
                      onPrev={prevTrack}
                      onNext={nextTrack}
                      onToggle={togglePlay}
                    />
                    <Visualizer isMediaPlaying={isMediaPlaying} />
                  </div>
                ) : (
                  <motion.div
                    key="clock-info"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center mt-1"
                  >
                    <button 
                      onClick={() => {
                        setMediaPlaying(true);
                        setShowMedia(true);
                      }}
                      className="mt-1 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/30 hover:text-white transition-all group"
                      title="Play Music"
                    >
                      <Music className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* 3. Date Div (Center column, same width as parent) */}
          <div className="flex justify-center w-full mt-6">
            <DateDisplay time={time} />
          </div>
        </>
      )}
    </div>
  );
};
