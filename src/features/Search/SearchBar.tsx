import React, { useState } from 'react';
import { Search as SearchIcon, ChevronDown, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../stores/useStore';

const ENGINES = [
  { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=', icon: 'https://www.google.com/favicon.ico' },
  { id: 'brave', name: 'Brave', url: 'https://search.brave.com/search?q=', icon: 'https://icon.horse/icon/brave.com' },
  { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q=', icon: 'https://www.bing.com/favicon.ico' },
  { id: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=', icon: 'https://duckduckgo.com/favicon.ico' },
];

export const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { preferences, setPreferences } = useStore();

  const currentEngine = ENGINES.find(e => e.id === preferences.searchEngine) || ENGINES[0];

  const handleSearch = (e: React.FormEvent, searchQuery?: string) => {
    e.preventDefault();
    const finalQuery = searchQuery || query;
    if (finalQuery.trim()) {
      window.location.href = `${currentEngine.url}${encodeURIComponent(finalQuery)}`;
    }
  };

  React.useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestionsJSONP = () => {
      const callbackName = `jsonp_cb_${Date.now()}_${Math.round(Math.random() * 100000)}`;
      
      const script = document.createElement('script');
      // Using DuckDuckGo's autocomplete API which supports JSONP callbacks
      script.src = `https://duckduckgo.com/ac/?callback=${callbackName}&q=${encodeURIComponent(query)}`;
      
      (window as any)[callbackName] = (data: any) => {
        if (Array.isArray(data)) {
          // DuckDuckGo JSONP returns: [{phrase: "suggestion1"}, {phrase: "suggestion2"}]
          const results = data.map((item: any) => item.phrase || item).filter(Boolean);
          setSuggestions(results.slice(0, 8));
        }
        cleanup();
      };
      
      const cleanup = () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
        delete (window as any)[callbackName];
      };
      
      script.onerror = () => {
        console.warn('JSONP search suggestions fetch failed.');
        cleanup();
      };

      document.head.appendChild(script);
    };

    const timeoutId = setTimeout(fetchSuggestionsJSONP, 150); // 150ms debounce
    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full max-w-2xl px-4 relative z-50"
    >
      <form 
        onSubmit={handleSearch}
        className="relative group rounded-2xl transition-shadow duration-500 focus-within:shadow-[0_8px_40px_var(--glow-color)] focus-within:ring-1 focus-within:ring-[var(--accent-color)]/30"
      >
        <div className={`absolute inset-0 ${preferences.themeConfig.cardClass} !rounded-2xl transition-all duration-300`} />
        <div className="relative flex items-center px-4 py-3">
          {/* Engine Selector */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors text-white/40 hover:text-white/70"
          >
            <img 
              src={currentEngine.icon} 
              alt={currentEngine.name} 
              className="w-4 h-4 rounded-sm opacity-60 group-hover:opacity-100"
              referrerPolicy="no-referrer"
            />
            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          <div className="w-px h-6 bg-white/10 mx-2" />

          <SearchIcon className="w-5 h-5 text-white/40 group-focus-within:text-white/70 transition-colors" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder={`Search with ${currentEngine.name}...`}
            className="flex-1 bg-transparent border-none outline-none px-4 text-white placeholder:text-white/30 text-lg"
            autoFocus
          />
          <button 
            type="submit"
            className="text-[10px] font-bold uppercase tracking-widest text-white/20 group-focus-within:text-white/60 transition-colors"
          >
            Enter
          </button>
        </div>

        {/* Engine Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute bottom-full left-0 mb-2 p-2 glass-card border-white/10 bg-black/40 backdrop-blur-2xl w-48 overflow-hidden z-[100]"
            >
              <div className="flex flex-col gap-1">
                {ENGINES.map((engine) => (
                  <button
                    key={engine.id}
                    type="button"
                    onClick={() => {
                      setPreferences({ searchEngine: engine.id as any });
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                      preferences.searchEngine === engine.id 
                        ? 'bg-white/10 text-white' 
                        : 'text-white/40 hover:bg-white/5 hover:text-white/70'
                    }`}
                  >
                    <img 
                      src={engine.icon} 
                      alt={engine.name} 
                      className="w-4 h-4 rounded-sm"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-xs font-bold uppercase tracking-widest">{engine.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Suggestions Menu */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="absolute top-full left-0 right-0 mt-2 p-2 glass-card border-white/10 bg-black/60 backdrop-blur-3xl overflow-hidden z-[90] shadow-2xl"
              onMouseLeave={() => setShowSuggestions(false)}
            >
              <div className="flex flex-col gap-0.5 max-h-[300px] overflow-y-auto scrollbar-hide">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      setQuery(suggestion);
                      setShowSuggestions(false);
                      handleSearch(e, suggestion);
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-white/50 hover:text-white hover:bg-white/5 transition-all group"
                  >
                    <SearchIcon className="w-3.5 h-3.5 opacity-30 group-hover:opacity-60" />
                    <span className="text-[13px] font-medium tracking-wide">{suggestion}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
};
