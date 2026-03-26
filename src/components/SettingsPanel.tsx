import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Clock as ClockIcon, Eye, Image as ImageIcon } from 'lucide-react';
import { useStore } from '../stores/useStore';

export const SettingsPanel: React.FC = () => {
  const { preferences, setPreferences, isSettingsOpen, setSettingsOpen, layout, toggleWidget } = useStore();

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSettingsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={`${preferences.themeConfig.cardClass} w-full max-w-md p-8 relative glass-glow`}
            onClick={(e) => e.stopPropagation()}
          >
          <button
            onClick={() => setSettingsOpen(false)}
            className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-2xl font-display font-bold mb-8 tracking-tight">Preferences</h2>

          <div className="space-y-8">

            {/* Display Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-white/50 mb-2">
                <ClockIcon className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Display</span>
              </div>
              
              <div className="space-y-4">
                {preferences.clockType !== 'analogue' && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white/70">Clock Format</span>
                    <div className="flex bg-white/5 rounded-lg p-1">
                      {(['12h', '24h'] as const).map((format) => (
                        <button
                          key={format}
                          onClick={() => setPreferences({ clockFormat: format })}
                          className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                            preferences.clockFormat === format
                              ? 'bg-white text-black'
                              : 'text-white/50 hover:text-white'
                          }`}
                        >
                          {format.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white/70">Clock Type</span>
                  <div className="flex bg-white/5 rounded-lg p-1">
                    {(['digital', 'analogue'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setPreferences({ clockType: type })}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                          preferences.clockType === type
                            ? 'bg-white text-black'
                            : 'text-white/50 hover:text-white'
                        }`}
                      >
                        {type.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium text-white/70">Theme Selection</span>
                  <div className="grid grid-cols-2 gap-2">
                    {(['aura', 'midnight', 'sunset', 'forest', 'minimal', 'cyberpunk', 'glass'] as const).map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setPreferences({ theme })}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border ${
                          preferences.theme === theme
                            ? 'bg-white text-black border-white'
                            : 'bg-white/5 text-white/50 border-white/10 hover:border-white/30'
                        }`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Widgets Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-white/50 mb-2">
                <Eye className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Visibility</span>
              </div>
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">Show Weather</span>
                  <input
                    type="checkbox"
                    checked={layout.find(l => l.id === 'weather')?.visible}
                    onChange={() => toggleWidget('weather')}
                    className="w-5 h-5 rounded-lg bg-white/5 border-white/10 checked:bg-white transition-all"
                  />
                </label>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-6 border-t border-white/10 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
              Aura Premium Workspace
            </p>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};
