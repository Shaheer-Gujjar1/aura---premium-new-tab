import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface QuickLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
}

interface UserPreferences {
  theme: 'aura' | 'midnight' | 'sunset' | 'forest' | 'minimal' | 'cyberpunk' | 'glass';
  themeConfig: {
    fontFamily: string;
    borderRadius: string;
    glassOpacity: string;
    accentColor: string;
    glowColor: string;
    backgroundUrl: string;
    contentStyle: string;
    cardClass: string;
  };
  clockFormat: '12h' | '24h';
  backgroundType: 'dynamic' | 'static' | 'custom';
  customBackgroundUrl?: string;
  location: string;
  lat: number;
  lon: number;
  searchEngine: 'google' | 'bing' | 'duckduckgo' | 'brave';
  clockType: 'digital' | 'analogue';
  userName: string;
}

interface WidgetLayout {
  id: string;
  x: number;
  y: number;
  scale: number;
  visible: boolean;
}

interface AuraState {
  preferences: UserPreferences;
  todos: Todo[];
  links: QuickLink[];
  aiLinks: QuickLink[];
  bookmarks: QuickLink[];
  activeLinkCategory: 'quick' | 'ai';
  layout: WidgetLayout[];
  isLayoutModified: boolean;
  isEditMode: boolean;
  isSettingsOpen: boolean;
  isGoogleAppsOpen: boolean;
  isWeatherDetailOpen: boolean;
  isMediaPlaying: boolean;
  lastMediaActionTime: number | null;
  currentTrack: { title: string; artist: string };
  lastMediaTabId: number | null;
  activeWidgetSlots: (string | null)[];
  widgetData: Record<string, any>;
  isWidgetEditMode: boolean;
  isZenMode: boolean;
  
  // Actions
  setPreferences: (prefs: Partial<UserPreferences>) => void;
  setSettingsOpen: (open: boolean) => void;
  setGoogleAppsOpen: (open: boolean) => void;
  setWidgetInSlot: (slotIndex: number, widgetId: string | null) => void;
  updateWidgetData: (key: string, data: any) => void;
  toggleWidgetEditMode: () => void;
  setWeatherDetailOpen: (open: boolean) => void;
  setMediaPlaying: (playing: boolean) => void;
  setLastMediaActionTime: (time: number | null) => void;
  setCurrentTrack: (track: { title: string; artist: string }) => void;
  setActiveLinkCategory: (category: 'quick' | 'ai') => void;
  setEditMode: (edit: boolean) => void;
  setZenMode: (zen: boolean) => void;
  updateLayout: (id: string, x: number, y: number) => void;
  updateLayoutScale: (id: string, scale: number) => void;
  saveLayout: () => void;
  resetLayout: () => void;
  toggleWidget: (id: string) => void;
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;
  addLink: (link: QuickLink) => void;
  removeLink: (id: string) => void;
  addBookmark: (bookmark: QuickLink) => void;
  removeBookmark: (id: string) => void;
}

declare const chrome: any;

const generateId = () => {
  try {
    return (globalThis as any).crypto.randomUUID();
  } catch {
    return Math.random().toString(36).substring(2, 15);
  }
};

const storageWrapper = {
  getItem: (name: string): string | null => localStorage.getItem(name),
  setItem: (name: string, value: string): void => localStorage.setItem(name, value),
  removeItem: (name: string): void => localStorage.removeItem(name),
};

export const useStore = create<AuraState>()(
  persist(
    (set, get) => ({
      preferences: {
        theme: 'aura',
        themeConfig: {
          fontFamily: 'Outfit',
          borderRadius: '40px',
          glassOpacity: '0.1',
          accentColor: '#fb7185',
          glowColor: 'rgba(251, 113, 133, 0.4)',
          backgroundUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1920',
          contentStyle: 'colorful',
          cardClass: 'aura-card',
        },
        clockFormat: '12h',
        backgroundType: 'dynamic',
        location: 'Lahore',
        lat: 31.5204,
        lon: 74.3587,
        searchEngine: 'google',
        clockType: 'digital',
        userName: 'Shaheer',
      },
      todos: [],
      links: [
        { id: '1', title: 'GitHub', url: 'https://github.com' },
        { id: '2', title: 'YouTube', url: 'https://youtube.com' },
        { id: '3', title: 'Gmail', url: 'https://gmail.com' },
      ],
      aiLinks: [
        { id: 'ai-1', title: 'Gemini', url: 'https://gemini.google.com' },
        { id: 'ai-2', title: 'ChatGPT', url: 'https://chat.openai.com' },
        { id: 'ai-3', title: 'Claude', url: 'https://claude.ai' },
        { id: 'ai-4', title: 'DeepSeek', url: 'https://chat.deepseek.com' },
        { id: 'ai-5', title: 'Grok', url: 'https://x.com/i/grok' },
        { id: 'ai-6', title: 'Qwen', url: 'https://chat.qwen.ai' },
      ],
      bookmarks: [],
      activeLinkCategory: 'quick',
      layout: [
        { id: 'weather', x: 0, y: 0, scale: 1, visible: true },
        { id: 'bookmarks', x: 0, y: 0, scale: 1, visible: true },
        { id: 'todo', x: 0, y: 0, scale: 1, visible: true },
        { id: 'clock', x: 0, y: 0, scale: 1, visible: true },
        { id: 'links', x: 0, y: 0, scale: 1, visible: true },
        { id: 'custom-0', x: 0, y: 0, scale: 1, visible: true },
        { id: 'custom-1', x: 0, y: 0, scale: 1, visible: true },
      ],
      isLayoutModified: false,
      isEditMode: false,
      isSettingsOpen: false,
      isGoogleAppsOpen: false,
      isWeatherDetailOpen: false,
      activeWidgetSlots: [null, null],
      isMediaPlaying: false,
      lastMediaActionTime: null,
      currentTrack: { title: 'No Media Playing', artist: 'System' },
      lastMediaTabId: null,
      widgetData: {},
      isWidgetEditMode: false,
      isZenMode: false,

      setPreferences: (prefs) => set((state) => {
        const newPrefs = { ...state.preferences, ...prefs };
        if (prefs.theme && prefs.theme !== state.preferences.theme) {
          const configs: Record<string, any> = {
            aura: { fontFamily: 'Outfit', borderRadius: '40px', glassOpacity: '0.1', accentColor: '#fb7185', glowColor: 'rgba(251, 113, 133, 0.4)', backgroundUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1920', contentStyle: 'colorful', cardClass: 'aura-card' },
            midnight: { fontFamily: 'Space Grotesk', borderRadius: '12px', glassOpacity: '0.2', accentColor: '#3b82f6', glowColor: 'rgba(59, 130, 246, 0.6)', backgroundUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=1920', contentStyle: 'neon', cardClass: 'neon-card' },
            sunset: { fontFamily: 'Outfit', borderRadius: '32px', glassOpacity: '0.15', accentColor: '#f59e0b', glowColor: 'rgba(245, 158, 11, 0.4)', backgroundUrl: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&q=80&w=1920', contentStyle: 'organic', cardClass: 'organic-card' },
            forest: { fontFamily: 'Inter', borderRadius: '20px', glassOpacity: '0.12', accentColor: '#10b981', glowColor: 'rgba(16, 185, 129, 0.4)', backgroundUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1920', contentStyle: 'organic', cardClass: 'organic-card' },
            minimal: { fontFamily: 'Inter', borderRadius: '8px', glassOpacity: '0.05', accentColor: '#ffffff', glowColor: 'rgba(255, 255, 255, 0.2)', backgroundUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1920', contentStyle: 'minimal', cardClass: 'minimal-card' },
            cyberpunk: { fontFamily: 'JetBrains Mono', borderRadius: '0px', glassOpacity: '0', accentColor: '#00ff00', glowColor: 'transparent', backgroundUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1920', contentStyle: 'brutalist', cardClass: 'brutalist-card' },
            glass: { fontFamily: 'Inter', borderRadius: '40px', glassOpacity: '0.02', accentColor: 'rgba(255, 255, 255, 0.8)', glowColor: 'rgba(255, 255, 255, 0.1)', backgroundUrl: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&q=80&w=1920', contentStyle: 'glass', cardClass: 'glass-card' }
          };
          if (prefs.theme && configs[prefs.theme]) {
            newPrefs.themeConfig = configs[prefs.theme];
          }
        }
        return { preferences: newPrefs };
      }),
      setSettingsOpen: (open) => set({ isSettingsOpen: open }),
      setGoogleAppsOpen: (open) => set({ isGoogleAppsOpen: open }),
      setWidgetInSlot: (index, id) => set((state) => {
        const slots = [...(state.activeWidgetSlots || [null, null])];
        if (index >= 0 && index < slots.length) slots[index] = id;
        return { activeWidgetSlots: slots };
      }),
      updateWidgetData: (key, data) => set((state) => ({
        widgetData: { ...state.widgetData, [key]: data }
      })),
      toggleWidgetEditMode: () => set((state) => ({
        isWidgetEditMode: !state.isWidgetEditMode
      })),
      setWeatherDetailOpen: (open) => set({ isWeatherDetailOpen: open }),
      setMediaPlaying: (playing) => set({ isMediaPlaying: playing, lastMediaActionTime: Date.now() }),
      setLastMediaActionTime: (time) => set({ lastMediaActionTime: time }),
      setCurrentTrack: (track) => set({ currentTrack: track }),
      setActiveLinkCategory: (category) => set({ activeLinkCategory: category }),
      setEditMode: (edit) => set({ isEditMode: edit }),
      setZenMode: (zen) => set({ isZenMode: zen }),
      updateLayout: (id, x, y) => set((state) => ({
        layout: (state.layout || []).map(l => l.id === id ? { ...l, x, y } : l),
        isLayoutModified: true
      })),
      updateLayoutScale: (id, scale) => set((state) => ({
        layout: (state.layout || []).map(l => l.id === id ? { ...l, scale } : l),
        isLayoutModified: true
      })),
      saveLayout: () => set({ isLayoutModified: false }),
      resetLayout: () => set((state) => ({
        layout: (state.layout || []).map(l => ({ ...l, x: 0, y: 0, scale: 1 })),
        isLayoutModified: false
      })),
      toggleWidget: (id) => set((state) => ({
        layout: (state.layout || []).map(l => l.id === id ? { ...l, visible: !l.visible } : l)
      })),
      addTodo: (text) => set((state) => ({
        todos: [...(state.todos || []), { id: generateId(), text, completed: false }]
      })),
      toggleTodo: (id) => set((state) => ({
        todos: (state.todos || []).map(t => t.id === id ? { ...t, completed: !t.completed } : t)
      })),
      removeTodo: (id) => set((state) => ({
        todos: (state.todos || []).filter(t => t.id !== id)
      })),
      addLink: (link) => set((state) => ({
        links: [...(state.links || []), link]
      })),
      removeLink: (id) => set((state) => ({
        links: (state.links || []).filter(l => l.id !== id)
      })),
      addBookmark: (bookmark) => set((state) => ({
        bookmarks: [...(state.bookmarks || []), bookmark]
      })),
      removeBookmark: (id) => set((state) => ({
        bookmarks: (state.bookmarks || []).filter(b => b.id !== id)
      })),
    }),
    {
      name: 'aura-storage-v26',
      storage: createJSONStorage(() => storageWrapper),
    }
  )
);
