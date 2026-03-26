import React from 'react';
import { motion, useDragControls, AnimatePresence } from 'motion/react';
import { X, Maximize2, Minimize2, GripHorizontal } from 'lucide-react';
import { useStore } from '../stores/useStore';

interface DraggableWidgetProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export const DraggableWidget: React.FC<DraggableWidgetProps> = ({ id, children, className }) => {
  const { layout, updateLayout, updateLayoutScale, toggleWidget, isEditMode, preferences } = useStore();
  const widgetLayout = layout.find(l => l.id === id);
  const dragControls = useDragControls();

  if (!widgetLayout || !widgetLayout.visible) return null;

  const handleResize = (delta: number) => {
    const current = useStore.getState().layout.find(l => l.id === id);
    if (!current) return;
    const newScale = Math.max(0.3, Math.min(3, current.scale + delta));
    updateLayoutScale(id, newScale);
  };

  return (
    <motion.div
      drag={isEditMode}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      onDragEnd={(_, info) => {
        const newX = widgetLayout.x + info.offset.x;
        const newY = widgetLayout.y + info.offset.y;
        updateLayout(id, newX, newY);
      }}
      initial={{ x: widgetLayout.x, y: widgetLayout.y, scale: widgetLayout.scale }}
      animate={{ x: widgetLayout.x, y: widgetLayout.y, scale: widgetLayout.scale }}
      className={`relative group ${className}`}
    >
      {/* Controls Overlay - Only visible in Edit Mode */}
      <AnimatePresence>
        {isEditMode && (
          <>
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -top-6 right-0 flex gap-1 z-[100]"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleResize(0.1);
                }}
                className="w-8 h-8 rounded-full bg-white/30 hover:bg-white/50 border border-white/40 flex items-center justify-center text-white backdrop-blur-md shadow-2xl transition-all"
                title="Increase Size"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleResize(-0.1);
                }}
                className="w-8 h-8 rounded-full bg-white/30 hover:bg-white/50 border border-white/40 flex items-center justify-center text-white backdrop-blur-md shadow-2xl transition-all"
                title="Decrease Size"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>

            {/* Visual Drag Handle */}
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onPointerDown={(e) => dragControls.start(e)}
              className="absolute -top-6 left-0 p-1.5 bg-white/30 border border-white/40 rounded-full cursor-grab active:cursor-grabbing z-[100] backdrop-blur-md shadow-2xl transition-all hover:bg-white/50"
            >
              <GripHorizontal className="w-4 h-4 text-white" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className={`relative ${preferences.themeConfig.cardClass} p-3 w-fit h-fit min-w-max`}>
        {children}
      </div>
    </motion.div>
  );
};
