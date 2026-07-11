import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bookmark, Plus, X, Trash2, ExternalLink } from 'lucide-react';
import { useStore } from '../../stores/useStore';

declare const chrome: any;

export const Bookmarks: React.FC = () => {
  const { bookmarks, addBookmark, removeBookmark } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newBookmark, setNewBookmark] = useState({ title: '', url: '' });
  const [browserBookmarks, setBrowserBookmarks] = useState<Array<{ id: string; title: string; url: string }>>([]);
  const [hasChromeBookmarks, setHasChromeBookmarks] = useState(false);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.bookmarks) {
      setHasChromeBookmarks(true);
      const fetchBrowserBookmarks = () => {
        chrome.bookmarks.getTree((treeNode: any[]) => {
          const list: Array<{ id: string; title: string; url: string }> = [];
          const traverse = (nodes: any[]) => {
            for (const node of nodes) {
              if (node.url) {
                list.push({
                  id: node.id,
                  title: node.title || node.url,
                  url: node.url
                });
              }
              if (node.children) {
                traverse(node.children);
              }
            }
          };
          traverse(treeNode);
          setBrowserBookmarks(list);
        });
      };

      fetchBrowserBookmarks();

      if (chrome.bookmarks.onCreated) {
        chrome.bookmarks.onCreated.addListener(fetchBrowserBookmarks);
      }
      if (chrome.bookmarks.onRemoved) {
        chrome.bookmarks.onRemoved.addListener(fetchBrowserBookmarks);
      }
      if (chrome.bookmarks.onChanged) {
        chrome.bookmarks.onChanged.addListener(fetchBrowserBookmarks);
      }

      return () => {
        if (chrome.bookmarks.onCreated) {
          chrome.bookmarks.onCreated.removeListener(fetchBrowserBookmarks);
        }
        if (chrome.bookmarks.onRemoved) {
          chrome.bookmarks.onRemoved.removeListener(fetchBrowserBookmarks);
        }
        if (chrome.bookmarks.onChanged) {
          chrome.bookmarks.onChanged.removeListener(fetchBrowserBookmarks);
        }
      };
    }
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBookmark.title && newBookmark.url) {
      let url = newBookmark.url;
      if (!url.startsWith('http')) {
        url = `https://${url}`;
      }
      if (hasChromeBookmarks) {
        chrome.bookmarks.create({
          title: newBookmark.title,
          url: url
        });
      } else {
        addBookmark({
          id: crypto.randomUUID(),
          title: newBookmark.title,
          url: url
        });
      }
      setNewBookmark({ title: '', url: '' });
      setIsAdding(false);
    }
  };

  const handleDelete = (id: string) => {
    if (hasChromeBookmarks) {
      chrome.bookmarks.remove(id);
    } else {
      removeBookmark(id);
    }
  };

  const getFavicon = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://icon.horse/icon/${domain}`;
    } catch (e) {
      return null;
    }
  };

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname || url;
    } catch {
      return url;
    }
  };

  const displayBookmarks = hasChromeBookmarks ? browserBookmarks : bookmarks;

  return (
    <div className="w-64 max-h-[300px] flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-white/60">
          <Bookmark className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Bookmarks</span>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-1 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
        {displayBookmarks.length === 0 && !isAdding && (
          <p className="text-center py-8 text-xs text-white/20 uppercase tracking-widest">No bookmarks yet</p>
        )}

        <AnimatePresence initial={false}>
          {isAdding && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAdd}
              className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4 space-y-3 overflow-hidden"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Add Bookmark</span>
                <button type="button" onClick={() => setIsAdding(false)}>
                  <X className="w-3.5 h-3.5 text-white/40 hover:text-white" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Title"
                value={newBookmark.title}
                onChange={(e) => setNewBookmark({ ...newBookmark, title: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-white/30"
                autoFocus
              />
              <input
                type="text"
                placeholder="URL (e.g. google.com)"
                value={newBookmark.url}
                onChange={(e) => setNewBookmark({ ...newBookmark, url: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-white/30"
              />
              <button
                type="submit"
                className="w-full bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold uppercase tracking-widest py-2 rounded-lg transition-colors"
              >
                Save Bookmark
              </button>
            </motion.form>
          )}

          {displayBookmarks.map((bookmark) => (
            <motion.div
              key={bookmark.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="group flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
            >
              <a 
                href={bookmark.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 flex-1 min-w-0"
              >
                <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-white/40 group-hover:text-white transition-colors overflow-hidden p-1">
                  <img 
                    src={getFavicon(bookmark.url) || ''} 
                    alt={bookmark.title}
                    className="w-full h-full object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bookmark.title)}&background=random&color=fff`;
                    }}
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium text-white/80 group-hover:text-white truncate">
                    {bookmark.title}
                  </span>
                  <span className="text-[8px] text-white/30 truncate">
                    {getHostname(bookmark.url)}
                  </span>
                </div>
              </a>
              <button
                onClick={() => handleDelete(bookmark.id)}
                className="p-1 text-white/10 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
