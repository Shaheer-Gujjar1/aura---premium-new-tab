import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Plus, X, Trash2 } from 'lucide-react';
import { useStore } from '../../stores/useStore';

export const QuickLinks: React.FC = () => {
  const { links, aiLinks, activeLinkCategory, addLink, removeLink, addAiLink, removeAiLink } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newLink, setNewLink] = useState({ title: '', url: '' });

  const currentLinks = activeLinkCategory === 'quick' ? links : aiLinks;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLink.title && newLink.url) {
      let url = newLink.url;
      if (!url.startsWith('http')) {
        url = `https://${url}`;
      }
      const item = {
        id: crypto.randomUUID(),
        title: newLink.title,
        url: url
      };
      if (activeLinkCategory === 'ai') {
        addAiLink(item);
      } else {
        addLink(item);
      }
      setNewLink({ title: '', url: '' });
      setIsAdding(false);
    }
  };

  const handleDelete = (id: string) => {
    if (activeLinkCategory === 'ai') {
      removeAiLink(id);
    } else {
      removeLink(id);
    }
  };

  const getFavicon = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-2 transition-all">
      {currentLinks.map((link, index) => (
        <motion.div
          key={link.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="relative group"
        >
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 p-2.5 w-24 hover:scale-105 transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all overflow-hidden p-2 shadow-inner">
              <img 
                src={getFavicon(link.url) || ''} 
                alt={link.title}
                className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(link.title)}&background=random&color=fff`;
                }}
              />
            </div>
            <span className="text-[11px] font-medium text-white/60 group-hover:text-white truncate w-full text-center transition-colors">
              {link.title}
            </span>
          </a>
          <button
            onClick={() => handleDelete(link.id)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-20"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </motion.div>
      ))}

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.form
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onSubmit={handleAdd}
              className="glass-card p-3.5 flex flex-col gap-2.5 w-64 border-white/20 shadow-2xl relative z-10"
            >
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">New Shortcut</span>
                <button type="button" onClick={() => setIsAdding(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-3.5 h-3.5 text-white/30 hover:text-white" />
                </button>
              </div>
              <div className="space-y-2">
                <div className="space-y-0.5">
                  <input
                    type="text"
                    placeholder="Title (e.g. GitHub)"
                    value={newLink.title}
                    onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-white/30 transition-colors"
                    autoFocus
                  />
                </div>
                <div className="space-y-0.5">
                  <input
                    type="text"
                    placeholder="URL (e.g. github.com)"
                    value={newLink.url}
                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-white/30 transition-colors"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-white/10 hover:bg-white/20 text-white text-[9px] font-bold uppercase tracking-widest py-2 rounded-lg transition-all active:scale-95"
              >
                Create Shortcut
              </button>
            </motion.form>
          </div>
        )}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: currentLinks.length * 0.1 }}
          onClick={() => setIsAdding(true)}
          className="flex flex-col items-center justify-center gap-1.5 p-2.5 w-24 border-2 border-dashed border-white/5 hover:border-white/10 hover:bg-white/5 rounded-2xl transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 group-hover:bg-white/10 transition-colors">
            <Plus className="w-6 h-6 text-white/20 group-hover:text-white/40" />
          </div>
          <span className="text-[11px] font-medium text-white/20 group-hover:text-white/40 transition-colors">
            Add
          </span>
        </motion.button>
      </AnimatePresence>
    </div>
  );
};
