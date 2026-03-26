import React from 'react';
import { 
  StickyNote, Calculator, Timer, Hourglass, Palette, 
  FileText, Globe, Cpu, Quote, CheckSquare, Droplets, Cookie, 
  Dices, ArrowRightLeft, Wind, Key, Type, Smile, Zap, Layers, Play, X, Plus
} from 'lucide-react';
import { useStore } from '../../stores/useStore';
import { motion, AnimatePresence } from 'motion/react';

export const WIDGET_LIBRARY = [
  { id: 'notes', name: 'Notes', icon: StickyNote, description: 'Persistent notepad' },
  { id: 'calculator', name: 'Calculator', icon: Calculator, description: 'Keyboard-aware' },
  { id: 'timer', name: 'Timer', icon: Timer, description: 'Simple countdown' },
  { id: 'pomodoro', name: 'Pomodoro', icon: Hourglass, description: 'Focus tool' },
  { id: 'palette', name: 'Colors', icon: Palette, description: 'HEX palette' },
  { id: 'worldclock', name: 'World Clock', icon: Globe, description: 'Local offsets' },
  { id: 'quotes', name: 'Inspiration', icon: Quote, description: 'Daily wisdom' },
  { id: 'hydration', name: 'Water', icon: Droplets, description: 'Drink tracker' },
  { id: 'dice', name: 'Dice', icon: Dices, description: 'Random roller' },
  { id: 'passgen', name: 'Password', icon: Key, description: 'Secure gen' },
  { id: 'counter', name: 'Counter', icon: Type, description: 'Char count' },
  { id: 'mood', name: 'Mood', icon: Smile, description: 'Mood log' },
  { id: 'priority', name: 'Priority', icon: Zap, description: 'Main goal' },
  { id: 'stopwatch', name: 'Stopwatch', icon: Play, description: 'Lap timer' },
];

export const WidgetLibrary: React.FC<{ isOpen: boolean; onClose: () => void; slotIndex: number }> = ({ isOpen, onClose, slotIndex }) => {
  const { setWidgetInSlot, activeWidgetSlots, preferences } = useStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`relative w-full max-w-2xl max-h-[80vh] ${preferences.themeConfig.cardClass} overflow-hidden flex flex-col shadow-2xl border border-white/10`}
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div>
                <h2 className="text-xl font-bold text-white mb-1 tracking-tight">Widget Library</h2>
                <p className="text-xs text-white/40 uppercase tracking-widest font-bold">21 Pro Features • Slot {slotIndex + 1}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-black/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {WIDGET_LIBRARY.map((widget) => {
                  const Icon = widget.icon;
                  const isSelected = activeWidgetSlots.includes(widget.id);
                  return (
                    <button
                      key={widget.id}
                      onClick={() => {
                        setWidgetInSlot(slotIndex, widget.id);
                        onClose();
                      }}
                      disabled={isSelected && activeWidgetSlots[slotIndex] !== widget.id}
                      className={`flex items-start gap-4 p-4 rounded-3xl border transition-all text-left group relative overflow-hidden ${
                        isSelected 
                          ? 'bg-white/20 border-white/40 cursor-default shadow-inner' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-[var(--accent-color)]/30'
                      }`}
                    >
                      <div className={`p-3 rounded-2xl ${isSelected ? 'bg-white text-black' : 'bg-white/10 text-white/70 group-hover:bg-[var(--accent-color)]/20 group-hover:text-white transition-all'}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-sm">{widget.name}</h3>
                        <p className="text-[10px] text-white/40">{widget.description}</p>
                      </div>
                      {!isSelected && (
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
