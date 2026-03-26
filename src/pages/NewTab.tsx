import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BackgroundManager } from '../features/Background/BackgroundManager';
import { Clock } from '../features/Clock/Clock';

declare const chrome: any;
import { TodoList } from '../features/Todo/TodoList';
import { QuickLinks } from '../features/QuickLinks/QuickLinks';
import { Bookmarks } from '../features/Bookmarks/Bookmarks';
import { Weather } from '../features/Weather/Weather';
import { GoogleApps } from '../components/GoogleApps';
import { SearchBar } from '../features/Search/SearchBar';
import { Settings, Maximize2, ListTodo, Minimize2, Bookmark, Sparkles, Link, Save, RotateCcw, Palette, GripHorizontal, Plus, X } from 'lucide-react';

import { SettingsPanel } from '../components/SettingsPanel';
import { WeatherDetail } from '../features/Weather/WeatherDetail';
import { DraggableWidget } from '../components/DraggableWidget';
import { useStore } from '../stores/useStore';
import { WidgetLibrary } from '../features/CustomWidgets/WidgetLibrary';
import { WidgetRenderer } from '../features/CustomWidgets/MiniWidgets';

const NewTab: React.FC = () => {
  const { 
    preferences, 
    setSettingsOpen, 
    isGoogleAppsOpen,
    setGoogleAppsOpen,
    toggleWidget,
    layout,
    activeLinkCategory,
    setActiveLinkCategory,
    isLayoutModified,
    saveLayout,
    resetLayout,
    setPreferences,
    isEditMode,
    setEditMode,
    activeWidgetSlots,
    setWidgetInSlot
  } = useStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [librarySlot, setLibrarySlot] = useState<number | null>(null);

  const themes = [
    { id: 'aura', name: 'Aura', colors: 'from-indigo-900/40 via-purple-900/40 to-pink-900/40' },
    { id: 'midnight', name: 'Midnight', colors: 'from-slate-900 via-blue-950 to-slate-900' },
    { id: 'sunset', name: 'Sunset', colors: 'from-orange-900/40 via-red-900/40 to-purple-900/40' },
    { id: 'forest', name: 'Forest', colors: 'from-emerald-900/40 via-teal-900/40 to-cyan-900/40' },
    { id: 'minimal', name: 'Minimal', colors: 'from-zinc-900 via-zinc-800 to-zinc-900' },
  ];

  const currentTheme = themes.find(t => t.id === preferences.theme) || themes[0];
  const isBookmarksVisible = layout.find(l => l.id === 'bookmarks')?.visible;
  const isTodoVisible = layout.find(l => l.id === 'todo')?.visible;

  useEffect(() => {
    const root = document.documentElement;
    const config = preferences.themeConfig;
    if (config) {
      root.style.setProperty('--font-main', config.fontFamily);
      root.style.setProperty('--border-radius', config.borderRadius);
      root.style.setProperty('--glass-opacity', config.glassOpacity);
      root.style.setProperty('--accent-color', config.accentColor);
      root.style.setProperty('--glow-color', config.glowColor);
      
      // Apply font family globally
      document.body.style.fontFamily = config.fontFamily;
    }
  }, [preferences.themeConfig]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as any;
      setIsFullscreen(!!(doc.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);
  
  // Extended Cross-Tab Media Detection
  useEffect(() => {
    // Only works when running as a Chrome Extension with "tabs" permission
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      const detectAudibleTab = async () => {
        try {
          const audibleTabs = await chrome.tabs.query({ audible: true });
          if (audibleTabs.length > 0) {
            const activeTab = audibleTabs[0];
            const title = activeTab.title || 'Unknown Media';
            
            // Basic extraction: "Video Title - YouTube" -> "Video Title"
            const cleanedTitle = title.split(' - ')[0].replace(/\(\d+\)\s/, '');
            const artist = title.includes(' - ') ? title.split(' - ')[1] : 'Audible Tab';
            
            useStore.getState().setCurrentTrack({
              title: cleanedTitle,
              artist: artist
            });
            useStore.getState().setMediaPlaying(true);
            if (activeTab.id) {
              useStore.setState({ lastMediaTabId: activeTab.id });
            }
          } else {
            useStore.getState().setMediaPlaying(false);
          }
        } catch (e) {
          console.error('Cross-Tab detection failed:', e);
        }
      };

      const interval = setInterval(detectAudibleTab, 2000);
      return () => clearInterval(interval);
    } else {
      // Fallback for web-only dev environment (using local MediaSession)
      if ('mediaSession' in navigator) {
        const updateMediaInfo = () => {
          const metadata = navigator.mediaSession.metadata;
          if (metadata) {
            useStore.getState().setCurrentTrack({
              title: metadata.title || 'Unknown Title',
              artist: metadata.artist || 'Unknown Artist'
            });
          }
          const state = navigator.mediaSession.playbackState;
          if (state) {
            useStore.getState().setMediaPlaying(state === 'playing');
          }
        };
        const interval = setInterval(updateMediaInfo, 1000);
        return () => clearInterval(interval);
      }
    }
  }, []);

  const toggleFullscreen = async () => {
    try {
      const doc = document as any;
      const isFullscreen = !!(doc.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement);

      if (!isFullscreen) {
        const docEl = document.documentElement as any;
        const requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        
        if (requestFullScreen) {
          await requestFullScreen.call(docEl);
        } else {
          alert('Fullscreen is not supported by your browser.');
        }
      } else {
        const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        if (cancelFullScreen) {
          await cancelFullScreen.call(doc);
        }
      }
    } catch (error) {
      console.error('Fullscreen toggle failed:', error);
      alert('An error occurred while toggling fullscreen. This might be restricted by your browser.');
    }
  };

  return (
    <div className={`relative h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden style-${preferences.themeConfig.contentStyle}`}>
      <BackgroundManager />
      <GoogleApps />
      
      {/* Theme Overlay - Tint the background image with the theme colors */}
      <div className={`absolute inset-0 z-0 transition-colors duration-1000 bg-gradient-to-br ${currentTheme.colors} opacity-60 pointer-events-none`} />

      <SettingsPanel />
      <WeatherDetail />
      
      {/* Top Bar */}
      <div className="absolute top-4 left-4 right-4 md:top-8 md:left-8 md:right-8 flex justify-between items-start z-50">
        <div className="flex flex-col gap-2 items-start shrink-0">
          <DraggableWidget id="weather">
            <Weather />
          </DraggableWidget>
          <DraggableWidget id="bookmarks">
            <Bookmarks />
          </DraggableWidget>
          <DraggableWidget id="todo">
            <TodoList />
          </DraggableWidget>
        </div>

        
        <div className="flex flex-col items-end gap-3">
          {/* First Line: System Controls */}
          <div className="flex flex-wrap justify-end gap-2 md:gap-3">
            <AnimatePresence>
              {isLayoutModified && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex gap-2"
                >
                  <button 
                    onClick={saveLayout}
                    className={`${preferences.themeConfig.cardClass} p-2 md:p-3 bg-emerald-500/20 border-emerald-500/30 hover:bg-emerald-500/30 text-emerald-400 transition-all flex items-center gap-2`}
                    title="Save Layout"
                  >
                    <Save className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden md:inline text-[10px] font-bold uppercase tracking-widest">Save</span>
                  </button>
                  <button 
                    onClick={resetLayout}
                    className={`${preferences.themeConfig.cardClass} p-2 md:p-3 bg-red-500/20 border-red-500/30 hover:bg-red-500/30 text-red-400 transition-all flex items-center gap-2`}
                    title="Reset Layout"
                  >
                    <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden md:inline text-[10px] font-bold uppercase tracking-widest">Reset</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              onClick={() => setEditMode(!isEditMode)}
              className={`${preferences.themeConfig.cardClass} p-2 md:p-3 hover:bg-white/10 transition-all group flex items-center gap-2 ${isEditMode ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : 'text-white/70'}`}
              title={isEditMode ? "Exit Edit Mode" : "Edit Layout"}
            >
              <GripHorizontal className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden md:inline text-[10px] font-bold uppercase tracking-widest">{isEditMode ? 'Done' : 'Edit'}</span>
            </button>

            <button 
              onClick={() => toggleWidget('bookmarks')}
              className={`${preferences.themeConfig.cardClass} p-2 md:p-3 hover:bg-white/10 transition-all group ${isBookmarksVisible ? 'bg-white/20 border-white/30' : ''}`}
              title="Toggle Bookmarks"
            >
              <Bookmark className={`w-4 h-4 md:w-5 md:h-5 transition-all ${isBookmarksVisible ? 'text-white' : 'text-white/70'}`} />
            </button>
            <button 
              onClick={() => toggleWidget('todo')}
              className={`${preferences.themeConfig.cardClass} p-2 md:p-3 hover:bg-white/10 transition-all group ${isTodoVisible ? 'bg-white/20 border-white/30' : ''}`}
              title="Toggle Tasks"
            >
              <ListTodo className={`w-4 h-4 md:w-5 md:h-5 transition-all ${isTodoVisible ? 'text-white' : 'text-white/70'}`} />
            </button>
            <button 
              onClick={toggleFullscreen}
              className={`${preferences.themeConfig.cardClass} p-2 md:p-3 hover:bg-white/10 transition-all`}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 md:w-5 md:h-5 text-white/70" />
              ) : (
                <Maximize2 className="w-4 h-4 md:w-5 md:h-5 text-white/70" />
              )}
            </button>
            <button 
              onClick={() => setSettingsOpen(true)}
              className={`${preferences.themeConfig.cardClass} p-2 md:p-3 hover:bg-white/10 transition-all`}
              title="Settings"
            >
              <Settings className="w-4 h-4 md:w-5 md:h-5 text-white/70" />
            </button>
          </div>

          {/* Second Line: Mode & Google Apps */}
          <div className="flex justify-end gap-2 md:gap-3">
            <button 
              onClick={() => setGoogleAppsOpen(!isGoogleAppsOpen)}
              className={`${preferences.themeConfig.cardClass} p-2 md:p-3 hover:bg-white/10 transition-all group flex items-center gap-2 ${isGoogleAppsOpen ? 'bg-white/20 border-white/30' : ''}`}
              title="Google Ecosystem"
            >
              <div className="grid grid-cols-3 gap-0.5">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className={`w-1 h-1 rounded-full transition-colors ${isGoogleAppsOpen ? 'bg-white' : 'bg-white/50 group-hover:bg-white'}`} />
                ))}
              </div>
              <span className="hidden md:inline text-[10px] font-bold uppercase tracking-widest text-white/70">Apps</span>
            </button>
            
            <button 
              onClick={() => setActiveLinkCategory(activeLinkCategory === 'quick' ? 'ai' : 'quick')}
              className={`${preferences.themeConfig.cardClass} p-2 md:p-3 hover:bg-white/10 transition-all group flex items-center gap-2 ${activeLinkCategory === 'ai' ? 'bg-indigo-500/20 border-indigo-500/30' : ''}`}
              title={activeLinkCategory === 'quick' ? "Switch to AI Tools" : "Switch to Quick Links"}
            >
              {activeLinkCategory === 'quick' ? (
                <>
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-indigo-400" />
                  <span className="hidden md:inline text-[10px] font-bold uppercase tracking-widest text-white/70">AI Mode</span>
                </>
              ) : (
                <>
                  <Link className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
                  <span className="hidden md:inline text-[10px] font-bold uppercase tracking-widest text-white/70">Quick Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
 
      {/* Main Content */}
      <main className="relative z-20 flex flex-col items-center justify-center gap-3 md:gap-6 w-full max-w-6xl h-full py-8 scale-[0.85] md:scale-100">
        <DraggableWidget id="clock">
          <Clock />
        </DraggableWidget>

        <div className="flex flex-col items-center gap-6 w-full">
          <SearchBar />
          <DraggableWidget id="links">
            <QuickLinks />
          </DraggableWidget>
        </div>
      </main>

      {/* Bottom Widgets */}
      <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 z-10 flex flex-col gap-4 items-start">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          className="text-[10px] font-bold uppercase tracking-[0.3em] text-white"
        >
          Aura Workspace v1.5
        </motion.div>
      </div>

      <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 z-50 flex flex-col gap-4 items-end">
        <div className="flex flex-col gap-4">
        </div>
      </div>

      {/* Custom Widget Slots - Root-Level Bottom Right (Vertical) */}
      <div className="absolute right-4 bottom-4 md:right-8 md:bottom-8 z-50 flex flex-col gap-4 items-end pointer-events-none">
        <AnimatePresence mode="popLayout">
          {preferences.theme !== 'minimal' && [0, 1].map((idx) => {
            const activeId = activeWidgetSlots[idx];
            const isVisible = activeId || useStore.getState().isWidgetEditMode;
            
            if (!isVisible) return null;

            return (
              <motion.div
                key={`slot-${idx}`}
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                className="pointer-events-auto"
              >
                <DraggableWidget id={`custom-${idx}`}>
                  <div className="flex flex-col gap-2">
                    {activeId ? (
                      <div className="relative group">
                        <WidgetRenderer 
                          id={activeId} 
                          onRemove={() => setWidgetInSlot(idx, null)} 
                        />
                      </div>
                    ) : (
                      <button 
                        onClick={() => setLibrarySlot(idx)}
                        className={`p-4 border-dashed border-2 border-[var(--accent-color)]/30 hover:border-[var(--accent-color)] bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all duration-300 flex flex-col items-center justify-center gap-2 group min-w-[140px] min-h-[80px] rounded-2xl relative overflow-hidden backdrop-blur-sm`}
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-[7px] font-bold uppercase tracking-widest opacity-50">Add Tool</span>
                      </button>
                    )}
                  </div>
                </DraggableWidget>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Floating Edit Toggle */}
        <button 
          onClick={() => useStore.getState().toggleWidgetEditMode()}
          className={`pointer-events-auto p-3 rounded-full transition-all shadow-2xl group relative ${
            useStore.getState().isWidgetEditMode 
              ? 'bg-[var(--accent-color)] text-black rotate-45 scale-110' 
              : 'bg-white/5 hover:bg-white/10 text-white/40 hover:text-white scale-90'
          }`}
        >
          <Plus className="w-5 h-5" />
          <div className="absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/80">
              {useStore.getState().isWidgetEditMode ? 'Close Editor' : 'Customize Widgets'}
            </span>
          </div>
        </button>
      </div>

      <WidgetLibrary 
        isOpen={librarySlot !== null} 
        slotIndex={librarySlot || 0} 
        onClose={() => setLibrarySlot(null)} 
      />
    </div>
  );
};

export default NewTab;
