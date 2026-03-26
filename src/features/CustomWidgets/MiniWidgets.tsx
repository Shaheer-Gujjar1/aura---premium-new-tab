import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../stores/useStore';
import { 
  StickyNote, Calculator as CalcIcon, Timer, Hourglass, Palette as PaletteIcon, 
  FileText, Globe, Cpu, Quote, CheckSquare, Droplets, Cookie, Dices, ArrowRightLeft, 
  Wind, Key, Type, Smile, Zap, Layers, Play, X, RotateCcw, Plus,
  Bold, Italic, Underline, Trash2, Copy
} from 'lucide-react';
import { WORLD_CAPITALS } from './worldData';

declare const chrome: any;

const pushNotification = (title: string, body: string) => {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") new Notification(title, { body });
    });
  }
};

// --- DATA PERSISTENCE HOOK ---
const useWidgetData = (key: string, defaultValue: any) => {
  const { widgetData = {}, updateWidgetData } = useStore();
  const data = widgetData[key] ?? defaultValue;
  const setData = (newData: any) => updateWidgetData(key, newData);
  return [data, setData] as const;
};

// --- COMPONENTS ---

const QuoteDisplay = () => {
  const [quote, setQuote] = useState({ t: "Loading wisdom...", a: "Aura", c: "General" });
  
  const quotes = [
    { t: "The only way to do great work is to love what you do.", a: "Steve Jobs", c: "Inspirational" },
    { t: "Success is not final, failure is not fatal: it is the courage to continue that counts.", a: "Winston Churchill", c: "Attitude" },
    { t: "Happiness is not something readymade. It comes from your own actions.", a: "Dalai Lama", c: "Happiness" },
    { t: "The best way to predict the future is to invent it.", a: "Alan Kay", c: "Inspirational" },
    { t: "It does not matter how slowly you go as long as you do not stop.", a: "Confucius", c: "Moving On" },
    { t: "Your time is limited, so don't waste it living someone else's life.", a: "Steve Jobs", c: "Attitude" },
    { t: "Hardship often prepares an ordinary person for an extraordinary destiny.", a: "C.S. Lewis", c: "Moving On" },
    { t: "The purpose of our lives is to be happy.", a: "Dalai Lama", c: "Happiness" },
    { t: "Believe you can and you're halfway there.", a: "Theodore Roosevelt", c: "Attitude" },
    { t: "Spread love everywhere you go. Let no one ever come to you without leaving happier.", a: "Mother Teresa", c: "Happiness" },
    { t: "The future belongs to those who believe in the beauty of their dreams.", a: "Eleanor Roosevelt", c: "Inspirational" },
    { t: "Don't watch the clock; do what it does. Keep going.", a: "Sam Levenson", c: "Attitude" },
    { t: "Everything you've ever wanted is on the other side of fear.", a: "George Addair", c: "Moving On" }
  ];

  useEffect(() => {
    const today = new Date().toDateString();
    let hash = 0;
    for (let i = 0; i < today.length; i++) hash = today.charCodeAt(i) + ((hash << 5) - hash);
    const index = Math.abs(hash) % quotes.length;
    setQuote(quotes[index]);
  }, []);

  return (
    <>
      <div className="text-[7px] font-black text-[var(--accent-color)] uppercase tracking-widest opacity-50">{quote.c}</div>
      <div className="text-[10px] text-white/80 leading-relaxed italic">"{quote.t}"</div>
      <div className="text-[8px] text-white/30 font-bold self-end">— {quote.a}</div>
    </>
  );
};

export const MiniNotes = () => {
  const [html, setHtml] = useWidgetData('notes_html', 'Craft your ideas here...');
  const editorRef = useRef<HTMLDivElement>(null);

  const exec = (cmd: string) => {
    document.execCommand(cmd, false, undefined);
    if (editorRef.current) setHtml(editorRef.current.innerHTML);
  };

  const copy = () => {
    if (editorRef.current) {
      navigator.clipboard.writeText(editorRef.current.innerText);
      pushNotification("Copied", "Notes copied to clipboard");
    }
  };

  const clear = () => {
    if (window.confirm("Clear all notes?")) {
      setHtml('');
      if (editorRef.current) editorRef.current.innerHTML = '';
    }
  };

  const getStats = () => {
    const text = editorRef.current?.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    return { chars: text.length, words };
  };

  const stats = getStats();

  return (
    <div className="flex flex-col gap-2 p-2 w-44 h-48 bg-white/5 rounded-2xl border border-white/5">
      <div className="flex justify-between items-center bg-black/20 p-1 rounded-lg border border-white/5">
        <div className="flex gap-1">
          <button onClick={() => exec('bold')} title="Bold" className="p-1 hover:bg-white/10 rounded transition-colors text-white/50 hover:text-white"><Bold size={10}/></button>
          <button onClick={() => exec('italic')} title="Italic" className="p-1 hover:bg-white/10 rounded transition-colors text-white/50 hover:text-white"><Italic size={10}/></button>
          <button onClick={() => exec('underline')} title="Underline" className="p-1 hover:bg-white/10 rounded transition-colors text-white/50 hover:text-white"><Underline size={10}/></button>
        </div>
        <div className="flex gap-1">
          <button onClick={copy} title="Copy All" className="p-1 hover:bg-white/10 rounded transition-colors text-white/30 hover:text-[var(--accent-color)]"><Copy size={10}/></button>
          <button onClick={clear} title="Clear All" className="p-1 hover:bg-white/10 rounded transition-colors text-white/30 hover:text-rose-500"><Trash2 size={10}/></button>
        </div>
      </div>
      
      <div 
        ref={editorRef}
        contentEditable
        dangerouslySetInnerHTML={{ __html: html }}
        onInput={(e: any) => setHtml(e.currentTarget.innerHTML)}
        className="flex-1 text-[11px] text-white/70 outline-none overflow-y-auto custom-scrollbar p-1 min-h-0"
        placeholder="Start typing..."
      />

      <div className="flex justify-between items-center text-[7px] font-black text-white/20 uppercase tracking-widest pt-1 border-t border-white/5">
        <span>{stats.words} Words</span>
        <span>{stats.chars} Chars</span>
      </div>
    </div>
  );
};

export const MiniCalculator = () => {
  const [expr, setExpr] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const handleInput = (val: string) => {
    if (val === '=') {
      try {
        const sanitized = expr.replace(/[^-+/*0-9.]/g, '');
        if (!sanitized) return;
        const result = new Function(`return ${sanitized}`)();
        setExpr(String(Number(result).toLocaleString(undefined, { maximumFractionDigits: 4 })));
      } catch { setExpr('Error'); }
    } else if (val === 'C') setExpr('');
    else if (val === 'back') setExpr(prev => prev.slice(0, -1));
    else setExpr(prev => prev + val);
  };
  useEffect(() => {
    if (!isHovered) return;
    const handleKey = (e: KeyboardEvent) => {
      const allowed = '0123456789+-*/.EnterBackspaceEscape=';
      if (!allowed.includes(e.key)) return;
      e.preventDefault();
      if (e.key === 'Enter' || e.key === '=') handleInput('=');
      else if (e.key === 'Backspace') handleInput('back');
      else if (e.key === 'Escape') handleInput('C');
      else handleInput(e.key);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isHovered, expr]);
  return (
    <div className="flex flex-col gap-1 w-44 p-1" onPointerEnter={() => setIsHovered(true)} onPointerLeave={() => setIsHovered(false)}>
      <div className={`bg-black/40 p-2 rounded-lg text-right text-white font-mono text-sm mb-1 border transition-all ${isHovered ? 'border-[var(--accent-color)]' : 'border-white/5'} truncate h-9`}>
        {expr || '0'}
      </div>
      <div className="grid grid-cols-4 gap-1">
        {['7','8','9','/','4','5','6','*','1','2','3','-','0','.','C','='].map(k => (
          <button key={k} onClick={() => handleInput(k)} className={`h-8 rounded-lg text-[10px] transition-all font-bold ${k === '=' ? 'bg-[var(--accent-color)] text-black' : 'bg-white/5 hover:bg-white/20 text-white/70'}`}>
            {k}
          </button>
        ))}
      </div>
    </div>
  );
};

export const MiniTimer = () => {
  const [sec, setSec] = useState(0);
  const [active, setActive] = useState(false);
  useEffect(() => {
    let t: any;
    if (active && sec > 0) t = setInterval(() => setSec(s => s - 1), 1000);
    else if (sec === 0 && active) {
      setActive(false);
      pushNotification("Timer Finished", "Your countdown has ended!");
    }
    return () => clearInterval(t);
  }, [active, sec]);
  return (
    <div className="flex flex-col items-center gap-2 p-2 w-44">
      <div className="text-2xl font-mono font-black text-white">{Math.floor(sec / 60)}:{String(sec % 60).padStart(2, '0')}</div>
      <div className="flex flex-wrap justify-center gap-1">
        <button onClick={() => setSec(s => s + 300)} className="text-[7px] font-black uppercase bg-white/5 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors">+5m</button>
        <button onClick={() => setSec(s => s + 60)} className="text-[7px] font-black uppercase bg-white/5 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors">+1m</button>
        <button onClick={() => setSec(s => Math.max(0, s - 60))} className="text-[7px] font-black uppercase bg-white/5 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors">-1m</button>
        <button onClick={() => setActive(!active)} className={`text-[7px] font-black uppercase px-4 py-1 rounded-lg transition-all ${active ? 'bg-rose-500 text-white' : 'bg-[var(--accent-color)] text-black'}`}>{active ? 'Stop' : 'Start'}</button>
        <button onClick={() => {setSec(0); setActive(false)}} className="text-[7px] bg-white/5 p-1 rounded-lg hover:bg-white/10 transition-colors"><RotateCcw size={10}/></button>
      </div>
    </div>
  );
};

export const MiniPomodoro = () => {
  const [mode, setMode] = useState<'work' | 'short' | 'long'>('work');
  const [timer, setTimer] = useState(25 * 60);
  const [act, setAct] = useState(false);

  useEffect(() => {
    let t: any;
    if (act && timer > 0) {
      t = setInterval(() => setTimer(v => v - 1), 1000);
    } else if (timer === 0 && act) {
      setAct(false);
      pushNotification("Pomodoro Finished", `${mode.toUpperCase()} session is complete!`);
    }
    return () => clearInterval(t);
  }, [act, timer, mode]);

  const switchMode = (m: 'work' | 'short' | 'long', time: number) => {
    setMode(m);
    setTimer(time * 60);
    setAct(false);
  };

  const m = Math.floor(timer / 60);
  const s = timer % 60;

  return (
    <div className="flex flex-col items-center gap-1.5 p-2 w-44">
      <div className="flex gap-1 bg-white/5 p-0.5 rounded-lg border border-white/5">
        {[['W', 'work', 25], ['S', 'short', 5], ['L', 'long', 15]].map(([l, v, t]) => (
          <button 
            key={v as string} 
            onClick={() => switchMode(v as any, t as number)}
            className={`text-[7px] font-bold px-2 py-0.5 rounded ${mode === v ? 'bg-white text-black' : 'text-white/30 hover:text-white'}`}
          >
            {l as string}
          </button>
        ))}
      </div>
      <div className="text-3xl font-mono text-white font-black">{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}</div>
      <button onClick={() => setAct(!act)} className={`text-[8px] font-bold px-6 py-1.5 rounded-full hover:scale-105 transition-transform ${act ? 'bg-rose-500 text-white' : 'bg-white text-black'}`}>
        {act ? 'PAUSE' : 'START'}
      </button>
    </div>
  );
};

export const MiniWorldClock = () => {
  const [time, setTime] = useState(new Date());
  const [clocks, setClocks] = useWidgetData('world_clocks', [
    {n:'London',z:'Europe/London'},
    {n:'New York',z:'America/New_York'},
    {n:'Tokyo',z:'Asia/Tokyo'}
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  
  const zones = (Intl as any).supportedValuesOf ? (Intl as any).supportedValuesOf('timeZone') : [];
  
  const filteredZones = search.length > 0
    ? [
        ...WORLD_CAPITALS.filter(c => 
          c.city.toLowerCase().includes(search.toLowerCase()) || 
          c.country.toLowerCase().includes(search.toLowerCase())
        ).map(c => ({ n: c.city, z: c.zone, sub: c.country })),
        ...zones.filter(z => z.toLowerCase().includes(search.toLowerCase()) && !WORLD_CAPITALS.find(c => c.zone === z))
                .map(z => ({ n: z.split('/').pop()?.replace(/_/g, ' ') || z, z }))
      ].slice(0, 50)
    : [
        { n: 'London', z: 'Europe/London' },
        { n: 'New York', z: 'America/New_York' },
        { n: 'Tokyo', z: 'Asia/Tokyo' },
        { n: 'Dubai', z: 'Asia/Dubai' },
        { n: 'Paris', z: 'Europe/Paris' },
        { n: 'Sydney', z: 'Australia/Sydney' },
        { n: 'Singapore', z: 'Asia/Singapore' },
      ].filter(item => !clocks.find((c: any) => c.z === item.z));

  useEffect(() => { const i = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(i); }, []);

  const addClock = (z: string, name?: string) => {
    const n = name || z.split('/').pop()?.replace(/_/g, ' ') || z;
    if (!clocks.find((c: any) => c.z === z)) {
      setClocks([...clocks, { n, z }]);
    }
    setShowAdd(false);
    setSearch('');
  };

  const removeClock = (z: string) => setClocks(clocks.filter((c: any) => c.z !== z));

  return (
    <div className="flex flex-col gap-1.5 p-2 w-44 h-48 overflow-hidden bg-white/5 rounded-2xl border border-white/5">
      {!showAdd ? (
        <>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-1">
            {clocks.map((c: any) => (
              <div key={c.z} className="group/clk flex justify-between items-center text-[9px] text-white/50 border-b border-white/5 pb-1 h-7">
                <div className="flex gap-1.5 items-center">
                  <button 
                    onClick={() => removeClock(c.z)} 
                    className="w-4 h-4 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shrink-0"
                  >
                    <X size={10}/>
                  </button>
                  <span className="font-bold opacity-30 truncate max-w-[60px]">{c.n}</span>
                </div>
                <span className="font-mono text-white/80">{new Intl.DateTimeFormat('en-GB', { hour:'2-digit', minute:'2-digit', timeZone:c.z }).format(time)}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setShowAdd(true)} className="text-[8px] text-white/20 hover:text-white/50 transition-colors py-1.5 bg-white/5 rounded-lg border border-white/5 mt-1 font-black uppercase tracking-widest">+ Add Clock</button>
        </>
      ) : (
        <div className="flex flex-col gap-2 h-full">
          <div className="flex gap-2 items-center">
            <input 
              autoFocus
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search Capital/Country..." 
              className="flex-1 bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-[8px] text-white outline-none focus:border-[var(--accent-color)]/50"
            />
            <button onClick={() => {setShowAdd(false); setSearch('');}} className="text-white/30 hover:text-white"><X size={12}/></button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-0.5">
            <div className="text-[7px] text-white/20 uppercase font-black mb-1 px-1">{search ? 'Search Results' : 'Global Hubs'}</div>
            {filteredZones.map((item: any) => (
              <button 
                key={item.z} 
                onClick={() => addClock(item.z, item.n)}
                className="w-full text-left text-[8px] text-white/40 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all flex justify-between items-center group"
              >
                <div className="flex flex-col min-w-0">
                  <span className="truncate font-bold">{item.n}</span>
                  {item.sub && <span className="text-[6px] opacity-30 uppercase truncate">{item.sub}</span>}
                </div>
                <Plus size={8} className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black rounded-full" />
              </button>
            ))}
            {filteredZones.length === 0 && <div className="text-[7px] text-white/20 italic text-center py-4">No cities found</div>}
          </div>
        </div>
      )}
    </div>
  );
};



export const MiniCounter = () => {
  const [count, setCount] = useWidgetData('counter_val', 0);
  const [step, setStep] = useState(1);
  return (
    <div className="flex flex-col items-center gap-2 p-2 w-44">
      <div className="text-3xl font-black text-white">{count}</div>
      <div className="flex gap-2 text-[10px] font-black w-full">
        <button onClick={() => setCount(count + step)} className="flex-1 px-4 py-1.5 bg-[var(--accent-color)] text-black rounded-lg active:scale-95 transition-all">+{step}</button>
        <button onClick={() => setCount(Math.max(0, count - step))} className="flex-1 px-4 py-1.5 bg-white/10 text-white rounded-lg active:scale-95 transition-all">-{step}</button>
        <button onClick={() => setCount(0)} className="px-2 py-1.5 bg-rose-500/20 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"><RotateCcw size={12}/></button>
      </div>
      <div className="flex items-center gap-2 w-full px-2">
        <span className="text-[7px] font-black text-white/20 uppercase">Step</span>
        <input type="range" min="1" max="10" value={step} onChange={e => setStep(parseInt(e.target.value))} className="flex-1 h-1 accent-[var(--accent-color)]" />
        <span className="text-[8px] font-mono text-white/40">{step}</span>
      </div>
    </div>
  );
};

export const MiniDice = () => {
  const [v, setV] = useState(6);
  const [roll, setRoll] = useState(false);
  const doRoll = () => { 
    if (roll) return;
    setRoll(true); 
    const interval = setInterval(() => setV(Math.floor(Math.random()*6)+1), 50);
    setTimeout(() => { 
      clearInterval(interval);
      setV(Math.floor(Math.random()*6)+1); 
      setRoll(false); 
    }, 600); 
  };
  return (
    <div className="flex flex-col items-center justify-center p-4 cursor-pointer group" onClick={doRoll}>
      <div className={`w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-2xl font-black text-white border border-white/10 transition-all duration-300 ${roll ? 'scale-110 border-[var(--accent-color)] shadow-[0_0_20px_rgba(251,113,133,0.2)] rotate-12' : ''}`}>
        {v}
      </div>
      <div className="text-[7px] font-black text-white/20 uppercase tracking-[0.3em] mt-3 group-hover:text-[var(--accent-color)]">TAP TO ROLL</div>
    </div>
  );
};


export const MiniMood = () => {
  const [mood, setMood] = useWidgetData('mood_val', '😊');
  return (
    <div className="flex justify-around items-center w-44 p-3 bg-white/5 rounded-2xl">
      {['😖','😐','😊','🚀'].map(m=><span key={m} onClick={() => setMood(m)} className={`text-xl cursor-pointer hover:scale-125 transition-all ${mood === m ? 'drop-shadow-[0_0_10px_#fff]' : 'opacity-40 hover:opacity-100'}`}>{m}</span>)}
    </div>
  );
};

export const MiniPassGen = () => {
  const [pass, setPass] = useState('********');
  const [vault, setVault] = useWidgetData('pass_vault', []);
  const [len, setLen] = useState(12);
  const [view, setView] = useState<'gen' | 'vault'>('gen');
  const [service, setService] = useState('');

  const gen = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let p = "";
    for (let i = 0; i < len; i++) p += chars.charAt(Math.floor(Math.random() * chars.length));
    setPass(p);
  };

  const save = () => {
    if (pass === '********') return;
    setVault([{ id: Date.now(), pass, service: service || 'Unnamed', date: new Date().toLocaleDateString() }, ...vault]);
    setService('');
    pushNotification("Password Saved", `Stored for ${service || 'Unnamed'}`);
  };

  return (
    <div className="flex flex-col gap-2 p-2 w-44">
      <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/5">
        <button onClick={() => setView('gen')} className={`flex-1 text-[8px] font-bold py-1 rounded ${view === 'gen' ? 'bg-white text-black shadow-lg' : 'text-white/30 hover:text-white'}`}>GEN</button>
        <button onClick={() => setView('vault')} className={`flex-1 text-[8px] font-bold py-1 rounded ${view === 'vault' ? 'bg-white text-black shadow-lg' : 'text-white/30 hover:text-white'}`}>VAULT ({vault.length})</button>
      </div>

      {view === 'gen' ? (
        <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <input 
            value={service} 
            onChange={e => setService(e.target.value)} 
            placeholder="Service/Title..." 
            className="bg-white/5 border border-white/5 rounded-lg px-2 py-1 text-[9px] text-white outline-none focus:border-[var(--accent-color)]/50"
          />
          <div className="bg-black/40 px-3 py-2 rounded-lg border border-white/5 text-[var(--accent-color)] font-mono text-[10px] break-all min-h-[32px] flex items-center justify-center text-center">
            {pass}
          </div>
          <div className="flex items-center gap-2">
            <input type="range" min="8" max="24" value={len} onChange={e => setLen(parseInt(e.target.value))} className="flex-1 accent-[var(--accent-color)] h-1" />
            <span className="text-[9px] text-white/40 font-mono">{len}</span>
          </div>
          <div className="flex gap-1">
            <button onClick={gen} className="flex-1 bg-white text-black text-[8px] font-black py-1.5 rounded-lg active:scale-95 transition-transform hover:bg-[#eee]">GENERATE</button>
            <button onClick={save} className="bg-white/10 text-white text-[8px] px-2 rounded-lg hover:bg-white/20 transition-colors" title="Save to Vault"><Plus size={10}/></button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1 max-h-32 overflow-y-auto custom-scrollbar animate-in fade-in duration-300">
          {vault.map((v: any) => (
            <div key={v.id} className="group/item flex flex-col bg-white/5 p-1.5 rounded-lg border border-white/5 relative hover:border-[var(--accent-color)]/30 transition-colors">
              <span className="text-[7px] font-black text-[var(--accent-color)] uppercase truncate pr-6">{v.service}</span>
              <span className="text-[9px] font-mono text-white/80 truncate pr-6">{v.pass}</span>
              <span className="text-[7px] text-white/20">{v.date}</span>
              <button 
                onClick={() => setVault(vault.filter((i: any) => i.id !== v.id))}
                className="absolute top-1 right-1 opacity-0 group-hover/item:opacity-100 text-rose-500 hover:scale-110 transition-all p-0.5"
              >
                <X size={8}/>
              </button>
              <button 
                onClick={() => { navigator.clipboard.writeText(v.pass); pushNotification("Copied", "Password copied to clipboard."); }}
                className="absolute bottom-1 right-1 opacity-0 group-hover/item:opacity-100 text-[var(--accent-color)] hover:scale-110 transition-all text-[7px] font-black"
              >
                COPY
              </button>
            </div>
          ))}
          {vault.length === 0 && <div className="text-[8px] text-white/20 text-center py-4 italic">No saved passwords</div>}
        </div>
      )}
    </div>
  );
};

export const MiniCalendar = () => {
  const [now] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [events, setEvents] = useWidgetData('calendar_events', []); 
  const [selDay, setSelDay] = useState<number | null>(null); 
  const [newEvTitle, setNewEvTitle] = useState('');
  const [newEvTime, setNewEvTime] = useState('12:00');

  const month = viewDate.getMonth();
  const year = viewDate.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthName = viewDate.toLocaleString('default', { month: 'long' });

  useEffect(() => {
    const i = setInterval(() => {
      const cur = new Date();
      const curD = cur.toISOString().split('T')[0];
      const curT = cur.getHours().toString().padStart(2,'0') + ':' + cur.getMinutes().toString().padStart(2,'0');
      
      const newEvs = events.map((e: any) => {
        if (e.date === curD && e.time === curT && !e.notified) {
          pushNotification("Calendar Alert", e.title);
          return { ...e, notified: true };
        }
        return e;
      });
      if (JSON.stringify(newEvs) !== JSON.stringify(events)) setEvents(newEvs);
    }, 15000);
    return () => clearInterval(i);
  }, [events]);

  const addEv = () => {
    if (selDay === null || !newEvTitle) return;
    const d = new Date(year, month, selDay).toISOString().split('T')[0];
    setEvents([...events, { id: Date.now(), date: d, time: newEvTime, title: newEvTitle, notified: false }]);
    setNewEvTitle('');
    setSelDay(null);
  };

  const deleteEv = (id: number) => setEvents(events.filter((e: any) => e.id !== id));

  const dayEvents = (d: number) => {
    const ds = new Date(year, month, d).toISOString().split('T')[0];
    return events.filter((e: any) => e.date === ds);
  };

  return (
    <div className="flex flex-col gap-2 p-2 w-44 h-64 bg-white/5 rounded-2xl border border-white/5 relative overflow-hidden">
      {selDay !== null ? (
        <div className="flex flex-col gap-2 h-full animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex justify-between items-center text-[8px] font-black uppercase text-white/30 tracking-widest border-b border-white/5 pb-1">
            <span>{monthName} {selDay}</span>
            <button onClick={() => setSelDay(null)} className="hover:text-white"><X size={10}/></button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
            {dayEvents(selDay).map((e: any) => (
              <div key={e.id} className="bg-white/5 p-1.5 rounded-lg border border-white/5 flex justify-between items-center group/ev transition-all hover:border-[var(--accent-color)]/30">
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-bold text-white/80 truncate">{e.title}</span>
                  <span className="text-[7px] text-white/30">{e.time}</span>
                </div>
                <button onClick={() => deleteEv(e.id)} className="opacity-0 group-hover/ev:opacity-100 text-rose-500 hover:scale-110 transition-all"><X size={8}/></button>
              </div>
            ))}
            {dayEvents(selDay).length === 0 && <div className="text-[8px] text-white/10 italic text-center py-4">No events today</div>}
          </div>
          <div className="flex flex-col gap-1.5 bg-black/40 p-2 rounded-xl border border-white/5">
            <input value={newEvTitle} onChange={e=>setNewEvTitle(e.target.value)} placeholder="Title..." className="bg-white/5 border border-white/5 rounded-lg px-2 py-1 text-[9px] text-white outline-none focus:border-[var(--accent-color)]/50" />
            <div className="flex gap-1">
              <input type="time" value={newEvTime} onChange={e=>setNewEvTime(e.target.value)} className="bg-white/5 border border-white/5 rounded-lg px-2 py-1 text-[9px] text-white outline-none flex-1" />
              <button onClick={addEv} className="bg-white text-black text-[8px] font-black px-3 rounded-lg active:scale-95 transition-transform hover:bg-[#eee]">ADD</button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center text-[8px] font-black uppercase text-white/30 tracking-[0.2em] mb-1">
            <button onClick={() => setViewDate(new Date(year, month - 1))} className="hover:text-white transition-colors p-1"><RotateCcw size={10} className="rotate-0"/></button>
            <span>{monthName} {year}</span>
            <button onClick={() => setViewDate(new Date(year, month + 1))} className="hover:text-white transition-colors p-1"><RotateCcw size={10} className="rotate-180"/></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[7px] font-black text-white/20 mb-1">
            {['S','M','T','W','T','F','S'].map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1 flex-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const d = i + 1;
              const isToday = now.getDate() === d && now.getMonth() === month && now.getFullYear() === year;
              const hasEv = dayEvents(d).length > 0;
              return (
                <button 
                  key={d} 
                  onClick={() => setSelDay(d)}
                  className={`relative h-6 rounded-lg flex items-center justify-center text-[9px] font-bold transition-all hover:bg-white/10 ${isToday ? 'bg-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color)]/20' : 'text-white/50'}`}
                >
                  {d}
                  {hasEv && <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-rose-500 animate-pulse" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export const MiniStopwatch = () => {
  const [t, setT] = useState(0);
  const [r, setR] = useState(false);
  useEffect(() => { if(r) { const i = setInterval(()=>setT(v=>v+10),10); return ()=>clearInterval(i); } }, [r]);
  const f = (ms: number) => { const s = Math.floor(ms/1000); return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}.${Math.floor((ms%1000)/10)}`; };
  return (
    <div className="flex flex-col items-center gap-2 p-2 w-44">
      <div className="text-2xl font-mono text-white font-black">{f(t)}</div>
      <div className="flex gap-2">
        <button onClick={()=>setR(!r)} className={`text-[8px] font-black uppercase px-4 py-1 rounded-lg ${r?'bg-rose-500 text-white':'bg-white text-black'}`}>{r?'STOP':'START'}</button>
        <button onClick={()=>{setT(0);setR(false)}} className="text-white/20 hover:text-white"><RotateCcw size={14}/></button>
      </div>
    </div>
  );
};




export const MiniPalette = () => {
  const [col, setCol] = useWidgetData('pal_col', '#fb7185');
  const [copying, setCopying] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const copy = () => {
    navigator.clipboard.writeText(col);
    setCopying(true);
    setTimeout(() => setCopying(false), 1000);
  };

  return (
    <div className="flex flex-col gap-2 p-2 w-44">
      <input 
        ref={inputRef}
        type="color" 
        value={col} 
        onChange={(e) => setCol(e.target.value)} 
        className="invisible absolute -left-[200px] top-0 w-0 h-0" 
      />
      <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/10 hover:border-[var(--accent-color)]/30 transition-all cursor-pointer group/pal" onClick={() => inputRef.current?.click()}>
        <div className="w-8 h-8 rounded-lg border-2 border-white/20 shadow-inner shrink-0 group-hover/pal:scale-110 transition-transform" style={{ backgroundColor: col }} />
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-[10px] font-mono font-bold text-white/80 truncate">{col.toUpperCase()}</span>
          <button 
            onClick={(e) => { e.stopPropagation(); copy(); }}
            className="text-[7px] font-black uppercase text-white/30 hover:text-[var(--accent-color)] text-left transition-colors truncate"
          >
            {copying ? 'COPIED!' : 'COPY HEX'}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {['#fb7185', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#71717a'].map(c => (
          <div key={c} onClick={() => setCol(c)} className={`w-8 h-8 rounded-lg cursor-pointer transition-all border-2 ${col === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-20 hover:opacity-100'}`} style={{ backgroundColor: c }} />
        ))}
      </div>
    </div>
  );
};


export const MiniHydration = () => {
  const [cups, setCups] = useWidgetData('water', 0);
  return (
    <div className="flex flex-col items-center gap-2 p-2 w-44">
      <div className="flex gap-1.5">
        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} onClick={() => setCups(i)} className={`w-2.5 h-4.5 rounded-sm cursor-pointer transition-all ${i <= cups ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]' : 'bg-white/10'}`} />
        ))}
      </div>
      <div className="text-[8px] font-black text-white/20 uppercase">{cups} of 8 glasses</div>
    </div>
  );
};

export const MiniPriority = () => {
  const [p, setP] = useWidgetData('priority', '');
  return (
    <div className="flex flex-col gap-1 p-3 w-44 bg-white/5 rounded-2xl border border-white/10">
      <div className="text-[7px] font-black text-[var(--accent-color)] uppercase tracking-widest mb-1">Directive</div>
      <input value={p} onChange={e=>setP(e.target.value)} className="bg-transparent border-none outline-none text-[11px] font-bold text-white placeholder:text-white/10" placeholder="Focus..." />
    </div>
  );
};

// --- MAIN RENDERER ---

export const WidgetRenderer: React.FC<{ id: string; onRemove: () => void }> = ({ id, onRemove }) => {
  const { isWidgetEditMode } = useStore();
  const renderContent = () => {
    switch(id) {
      case 'notes': return <MiniNotes />;
      case 'calculator': return <MiniCalculator />;
      case 'timer': return <MiniTimer />;
      case 'pomodoro': return <MiniPomodoro />;
      case 'palette': return <MiniPalette />;
      case 'worldclock': return <MiniWorldClock />;
      case 'quotes': return (
        <div className="flex flex-col gap-2 p-3 w-44 bg-white/5 rounded-2xl border border-white/10 animate-in fade-in duration-700">
          <QuoteDisplay />
        </div>
      );
      case 'hydration': return <MiniHydration />;
      case 'dice': return <MiniDice />;
      case 'calendar': return <MiniCalendar />;
      case 'passgen': return <MiniPassGen />;
      case 'counter': return <MiniCounter />;
      case 'mood': return <MiniMood />;
      case 'priority': return <MiniPriority />;
      case 'stopwatch': return <MiniStopwatch />;
      default: return (
        <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-2xl border border-white/10 w-44">
          <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">Unknown Module</div>
        </div>
      );
    }
  };

  return (
    <div className="relative group">
      {isWidgetEditMode && (
        <button 
          onClick={onRemove} 
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20 backdrop-blur-md shadow-xl border border-white/20 hover:scale-110 active:scale-95"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
      <div className="relative z-10">{renderContent()}</div>
    </div>
  );
};
