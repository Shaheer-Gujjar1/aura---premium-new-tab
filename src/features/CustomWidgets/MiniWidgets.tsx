import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../stores/useStore';
import { 
  StickyNote, Calculator as CalcIcon, Timer, Hourglass, Palette as PaletteIcon, 
  FileText, Globe, Cpu, Quote, CheckSquare, Droplets, Cookie, Dices, ArrowRightLeft, 
  Wind, Key, Type, Smile, Zap, Layers, Play, X, RotateCcw
} from 'lucide-react';

declare const chrome: any;

// --- DATA PERSISTENCE HOOK ---
const useWidgetData = (key: string, defaultValue: any) => {
  const { widgetData = {}, updateWidgetData } = useStore();
  const data = widgetData[key] ?? defaultValue;
  const setData = (newData: any) => updateWidgetData(key, newData);
  return [data, setData] as const;
};

// --- WIDGET IMPLEMENTATIONS ---

export const MiniNotes = () => {
  const [val, setVal] = useWidgetData('notes', 'Craft your ideas here...');
  return (
    <textarea 
      value={val}
      onChange={(e) => setVal(e.target.value)}
      className="bg-transparent border-none outline-none text-[11px] text-white/70 placeholder:text-white/20 w-44 h-24 resize-none custom-scrollbar p-1"
      placeholder="Write your thoughts..."
    />
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
    else if (sec === 0) setActive(false);
    return () => clearInterval(t);
  }, [active, sec]);
  return (
    <div className="flex flex-col items-center gap-2 p-2 w-44">
      <div className="text-2xl font-mono font-black text-white">{Math.floor(sec / 60)}:{String(sec % 60).padStart(2, '0')}</div>
      <div className="flex gap-1">
        <button onClick={() => setSec(s => s + 60)} className="text-[7px] font-black uppercase bg-white/5 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors">+1m</button>
        <button onClick={() => setActive(!active)} className={`text-[7px] font-black uppercase px-4 py-1 rounded-lg transition-all ${active ? 'bg-rose-500 text-white' : 'bg-[var(--accent-color)] text-black'}`}>{active ? 'Stop' : 'Start'}</button>
        <button onClick={() => {setSec(0); setActive(false)}} className="text-[7px] bg-white/5 p-1 rounded-lg hover:bg-white/10 transition-colors"><RotateCcw size={10}/></button>
      </div>
    </div>
  );
};

export const MiniPomodoro = () => {
  const [m, setM] = useState(25);
  const [s, setS] = useState(0);
  const [act, setAct] = useState(false);
  useEffect(() => {
    let t: any;
    if (act) t = setInterval(() => { if (s === 0) { if (m === 0) setAct(false); else { setM(m-1); setS(59); }} else setS(s-1); }, 1000);
    return () => clearInterval(t);
  }, [act, m, s]);
  return (
    <div className="flex flex-col items-center gap-1 p-2 w-44">
      <div className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em]">Focus Session</div>
      <div className="text-3xl font-mono text-white font-black">{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}</div>
      <button onClick={() => setAct(!act)} className="text-[8px] font-bold bg-white text-black px-6 py-1.5 rounded-full hover:scale-105 transition-transform">{act ? 'PAUSE' : 'START'}</button>
    </div>
  );
};

export const MiniWorldClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(i); }, []);
  return (
    <div className="flex flex-col gap-1.5 p-2 w-44">
      {[{n:'London',z:'Europe/London'},{n:'New York',z:'America/New_York'},{n:'Tokyo',z:'Asia/Tokyo'}].map(c => (
        <div key={c.n} className="flex justify-between items-center text-[9px] text-white/50 border-b border-white/5 pb-1">
          <span className="font-bold opacity-30">{c.n}</span>
          <span className="font-mono text-white/80">{new Intl.DateTimeFormat('en-GB', { hour:'2-digit', minute:'2-digit', timeZone:c.z }).format(time)}</span>
        </div>
      ))}
    </div>
  );
};

export const MiniStats = () => {
  const [cpu, setCpu] = useState(0);
  const [ram, setRam] = useState(0);
  useEffect(() => {
    let lastCpuInfo: any = null;
    const fetchStats = () => {
      if (typeof chrome !== 'undefined' && chrome.system && chrome.system.memory) {
        chrome.system.memory.getInfo((info: any) => setRam(Math.round(((info.capacity - info.availableCapacity) / info.capacity) * 100)));
      }
      if (typeof chrome !== 'undefined' && chrome.system && chrome.system.cpu) {
        chrome.system.cpu.getInfo((info: any) => {
          if (lastCpuInfo) {
            let u = 0, t = 0;
            for (let i = 0; i < info.processors.length; i++) {
              u += (info.processors[i].usage.user - lastCpuInfo.processors[i].usage.user) + (info.processors[i].usage.kernel - lastCpuInfo.processors[i].usage.kernel);
              t += info.processors[i].usage.total - lastCpuInfo.processors[i].usage.total;
            }
            if (t > 0) setCpu(Math.round((u / t) * 100));
          }
          lastCpuInfo = info;
        });
      }
    };
    fetchStats(); const i = setInterval(fetchStats, 2000); return () => clearInterval(i);
  }, []);
  return (
    <div className="flex flex-col gap-3 p-2 w-44">
      {[['CPU', cpu, 'bg-blue-500'], ['RAM', ram, 'bg-purple-500']].map(([l, v, c]) => (
        <div key={l as string} className="space-y-1">
          <div className="flex justify-between text-[7px] font-black text-white/40 uppercase"><span>{l as string}</span><span>{v}%</span></div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden"><div className={`h-full ${c as string} transition-all duration-1000`} style={{ width: `${v}%` }} /></div>
        </div>
      ))}
    </div>
  );
};

export const MiniHabits = () => {
  const [habits, setHabits] = useWidgetData('habits', [false, false, false]);
  return (
    <div className="flex flex-col gap-2 p-1 w-44">
      {['Hydrate', 'Meditation', 'Deep Work'].map((h, i) => (
        <div key={h} className="flex justify-between items-center bg-white/5 p-2 rounded-xl cursor-pointer hover:bg-white/10" onClick={() => {
          const n = [...habits]; n[i] = !n[i]; setHabits(n);
        }}>
          <span className="text-[9px] font-bold text-white/60 uppercase tracking-wider">{h}</span>
          <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${habits[i] ? 'bg-[var(--accent-color)] border-[var(--accent-color)]' : 'border-white/10'}`} />
        </div>
      ))}
    </div>
  );
};

export const MiniCounter = () => {
  const [count, setCount] = useWidgetData('counter_val', 0);
  return (
    <div className="flex flex-col items-center gap-2 p-2 w-44">
      <div className="text-3xl font-black text-white">{count}</div>
      <div className="flex gap-2 text-[10px] font-black">
        <button onClick={() => setCount(count + 1)} className="px-5 py-1 bg-[var(--accent-color)] text-black rounded-lg">+</button>
        <button onClick={() => setCount(Math.max(0, count - 1))} className="px-5 py-1 bg-white/10 text-white rounded-lg">-</button>
      </div>
    </div>
  );
};

export const MiniDice = () => {
  const [v, setV] = useState(6);
  const [roll, setRoll] = useState(false);
  const doRoll = () => { setRoll(true); setTimeout(() => { setV(Math.floor(Math.random()*6)+1); setRoll(false); }, 500); };
  return (
    <div className="flex flex-col items-center justify-center p-4 cursor-pointer group" onClick={doRoll}>
      <div className={`text-4xl text-white transition-all duration-500 ${roll ? 'rotate-[720deg] scale-125' : ''}`}>
        {['⚀','⚁','⚂','⚃','⚄','⚅'][v-1]}
      </div>
      <div className="text-[7px] font-black text-white/20 uppercase tracking-[0.3em] mt-2 group-hover:text-[var(--accent-color)]">ROLL DICE</div>
    </div>
  );
};

export const MiniConverter = () => (
  <div className="flex flex-col gap-1 w-44 p-2 bg-white/5 rounded-2xl">
    {[['1kg', '2.2lb'], ['1m', '3.3ft'], ['1°C', '33.8°F']].map(([v1, v2]) => (
      <div key={v1} className="flex justify-between text-[10px] font-bold py-1 border-b border-white/5 last:border-0">
        <span className="text-white/30">{v1}</span><span className="text-white/70 italic">→ {v2}</span>
      </div>
    ))}
  </div>
);

export const MiniMood = () => {
  const [mood, setMood] = useWidgetData('mood_val', '😊');
  return (
    <div className="flex justify-around items-center w-44 p-3 bg-white/5 rounded-2xl">
      {['😖','😐','😊','🚀'].map(m=><span key={m} onClick={() => setMood(m)} className={`text-xl cursor-pointer hover:scale-125 transition-all ${mood === m ? 'drop-shadow-[0_0_10px_#fff]' : 'opacity-40 hover:opacity-100'}`}>{m}</span>)}
    </div>
  );
};

export const MiniPassGen = () => {
  const [p, setP] = useState('********');
  const gen = () => setP(Math.random().toString(36).slice(-8) + '!');
  return (
    <div className="flex flex-col items-center gap-2 p-2 w-44">
      <div className="bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 text-[var(--accent-color)] font-mono text-sm">{p}</div>
      <button onClick={gen} className="text-[7px] font-black uppercase text-white/30 hover:text-white transition-colors">Generate</button>
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

export const MiniMarkdown = () => {
  const [txt, setTxt] = useWidgetData('markdown_val', '**Bold** and *Italic*');
  return (
    <div className="flex flex-col gap-2 p-2 w-44 h-24">
      <textarea value={txt} onChange={e=>setTxt(e.target.value)} className="bg-white/5 flex-1 rounded-lg p-2 text-[9px] text-white/50 outline-none resize-none" />
    </div>
  );
};

export const MiniFlashcards = () => {
  const [flip, setFlip] = useState(false);
  return (
    <div className="w-44 h-24 cursor-pointer perspective-1000" onClick={() => setFlip(!flip)}>
      <div className={`relative w-full h-full transition-all duration-500 preserve-3d ${flip ? 'rotate-y-180' : ''}`}>
        <div className="absolute inset-0 backface-hidden bg-white/10 rounded-2xl flex items-center justify-center p-4 text-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Module: React</span>
        </div>
        <div className="absolute inset-0 backface-hidden bg-[var(--accent-color)]/20 rounded-2xl flex items-center justify-center p-4 text-center rotate-y-180">
          <span className="text-[10px] text-white">Hooks allow functional components to use state.</span>
        </div>
      </div>
    </div>
  );
};

export const MiniFortune = () => {
  const [f, setF] = useState('Click for wisdom');
  const quotes = ["Code is poetry.", "Less is more.", "Refactor often.", "Stay hungry.", "Zero waste design."];
  return (
    <div className="flex flex-col items-center gap-1 p-3 w-44 cursor-pointer" onClick={() => setF(quotes[Math.floor(Math.random()*quotes.length)])}>
      <div className="text-2xl">🥠</div>
      <div className="text-[9px] text-center italic text-white/50 leading-tight">"{f}"</div>
    </div>
  );
};

export const MiniPalette = () => {
  const [col, setCol] = useWidgetData('pal_col', '#fb7185');
  return (
    <div className="flex flex-col gap-2 p-2 w-44">
      <div className="grid grid-cols-4 gap-1.5">
        {['#fb7185', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#71717a'].map(c => (
          <div key={c} onClick={() => setCol(c)} className={`w-8 h-8 rounded-lg cursor-pointer transition-all border-2 ${col === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`} style={{ backgroundColor: c }} />
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
  const renderContent = () => {
    switch(id) {
      case 'notes': return <MiniNotes />;
      case 'calculator': return <MiniCalculator />;
      case 'timer': return <MiniTimer />;
      case 'pomodoro': return <MiniPomodoro />;
      case 'palette': return <MiniPalette />;
      case 'markdown': return <MiniMarkdown />;
      case 'worldclock': return <MiniWorldClock />;
      case 'system': return <MiniStats />;
      case 'quotes': return (
        <div className="italic text-[10px] text-white/70 w-44 p-4 border-l-2 border-[var(--accent-color)] bg-white/5 rounded-r-2xl leading-relaxed">
          "The future is already here — it's just not very evenly distributed."
        </div>
      );
      case 'habit': return <MiniHabits />;
      case 'hydration': return <MiniHydration />;
      case 'fortune': return <MiniFortune />;
      case 'dice': return <MiniDice />;
      case 'converter': return <MiniConverter />;
      case 'breathing': return (
        <div className="flex flex-col items-center gap-2 p-4">
          <div className="w-12 h-12 rounded-full border-2 border-[var(--accent-color)] animate-ping opacity-20" />
          <div className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] fixed mt-5">Inhale</div>
        </div>
      );
      case 'passgen': return <MiniPassGen />;
      case 'counter': return <MiniCounter />;
      case 'mood': return <MiniMood />;
      case 'priority': return <MiniPriority />;
      case 'flashcards': return <MiniFlashcards />;
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
      <button 
        onClick={onRemove} 
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20 backdrop-blur-md shadow-xl border border-white/20 hover:scale-110 active:scale-95"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      <div className="relative z-10">{renderContent()}</div>
    </div>
  );
};
