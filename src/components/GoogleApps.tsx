import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search } from 'lucide-react';
import { useStore } from '../stores/useStore';

const GOOGLE_APPS = [
  { name: 'Web Store', url: 'https://chrome.google.com/webstore', icon: 'https://imgs.search.brave.com/qnamV7kCUSH_wAMhKTiy2IIqVM1Oz8dbPrG310AT4RE/rs:fit:32:32:1:0/g:ce/aHR0cDovL2Zhdmlj/b25zLnNlYXJjaC5i/cmF2ZS5jb20vaWNv/bnMvY2Y5NGQyMmMx/YjQyZDE2OGQ4Yzc1/NjkyMmJiMWYzZDIw/YjRlODY1NDJhYjAw/Mzc5ZDIyMTc5ZDZl/MTc5NWE2Ni9jaHJv/bWV3ZWJzdG9yZS5n/b29nbGUuY29tLw' },
  { name: 'Search', url: 'https://www.google.com', icon: 'https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png' },
  { name: 'Gmail', url: 'https://mail.google.com', icon: 'https://logodownload.org/wp-content/uploads/2018/03/gmail-logo-0.png' },
  { name: 'Drive', url: 'https://drive.google.com', icon: 'https://www.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png' },
  { name: 'Calendar', url: 'https://calendar.google.com', icon: 'https://www.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_31_2x.png' },
  { name: 'Meet', url: 'https://meet.google.com', icon: 'https://www.gstatic.com/images/branding/product/1x/meet_2020q4_32dp.png' },
  { name: 'Maps', url: 'https://maps.google.com', icon: 'https://www.gstatic.com/images/branding/product/1x/maps_48dp.png' },
  { name: 'YouTube', url: 'https://www.youtube.com', icon: 'https://www.gstatic.com/images/branding/product/1x/youtube_32dp.png' },
  { name: 'Photos', url: 'https://photos.google.com', icon: 'https://www.gstatic.com/images/branding/product/1x/photos_32dp.png' },
  { name: 'Translate', url: 'https://translate.google.com', icon: 'https://www.gstatic.com/images/branding/product/1x/translate_32dp.png' },
  { name: 'News', url: 'https://news.google.com', icon: 'https://www.gstatic.com/images/branding/product/1x/news_32dp.png' },
  { name: 'Keep', url: 'https://keep.google.com', icon: 'https://www.gstatic.com/images/branding/product/1x/keep_32dp.png' },
  { name: 'Docs', url: 'https://docs.google.com', icon: 'https://www.gstatic.com/images/branding/product/1x/docs_2020q4_48dp.png' },
  { name: 'Sheets', url: 'https://docs.google.com/spreadsheets', icon: 'https://www.gstatic.com/images/branding/product/1x/sheets_2020q4_48dp.png' },
  { name: 'Slides', url: 'https://docs.google.com/presentation', icon: 'https://www.gstatic.com/images/branding/product/1x/slides_2020q4_48dp.png' },
  { name: 'Forms', url: 'https://docs.google.com/forms', icon: 'https://www.gstatic.com/images/branding/product/1x/forms_2020q4_32dp.png' },
  { name: 'Chat', url: 'https://chat.google.com', icon: 'https://www.gstatic.com/images/branding/product/1x/chat_2020q4_32dp.png' },
  { name: 'Contacts', url: 'https://contacts.google.com', icon: 'https://www.gstatic.com/images/branding/product/1x/contacts_2020q4_32dp.png' },
  { name: 'Play', url: 'https://play.google.com', icon: 'https://www.gstatic.com/images/branding/product/1x/play_32dp.png' },
  { name: 'Classroom', url: 'https://classroom.google.com', icon: 'https://www.gstatic.com/images/branding/product/1x/classroom_32dp.png' },
  { name: 'Ads', url: 'https://ads.google.com', icon: 'https://www.gstatic.com/images/branding/product/1x/ads_32dp.png' },
  { name: 'Analytics', url: 'https://analytics.google.com', icon: 'https://www.gstatic.com/images/branding/product/1x/analytics_32dp.png' },
  { name: 'Cloud', url: 'https://console.cloud.google.com', icon: 'https://www.gstatic.com/images/branding/product/1x/cloud_32dp.png' },
  { name: 'Finance', url: 'https://www.google.com/finance', icon: 'https://www.gstatic.com/images/branding/product/1x/finance_32dp.png' },
  { name: 'Books', url: 'https://books.google.com', icon: 'https://www.gstatic.com/images/branding/product/1x/play_books_48dp.png' },
  { name: 'Flights', url: 'https://www.google.com/flights', icon: 'https://www.gstatic.com/images/branding/product/1x/flights_32dp.png' },
  { name: 'Shopping', url: 'https://www.google.com/shopping', icon: 'https://www.gstatic.com/images/branding/product/1x/shopping_32dp.png' },
  { name: 'Podcasts', url: 'https://podcasts.google.com', icon: 'https://www.gstatic.com/images/branding/product/1x/podcasts_32dp.png' },
  { name: 'Gemini', url: 'https://gemini.google.com', icon: 'https://www.gstatic.com/lamda/images/favicon_v1_15011fcf502b5e26.png' },
  { name: 'Colab', url: 'https://colab.research.google.com', icon: 'https://colab.research.google.com/img/favicon.ico' },
  { name: 'Search Console', url: 'https://search.google.com/search-console', icon: 'https://www.gstatic.com/images/branding/product/1x/search_console_48dp.png' },
  { name: 'Trends', url: 'https://trends.google.com', icon: 'https://www.gstatic.com/images/branding/product/1x/trends_48dp.png' },
  { name: 'One', url: 'https://one.google.com', icon: 'https://www.gstatic.com/images/branding/product/1x/google_one_48dp.png' },
];

export const GoogleApps: React.FC = () => {
  const { isGoogleAppsOpen, setGoogleAppsOpen, preferences } = useStore();

  return (
    <AnimatePresence>
      {isGoogleAppsOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className={`fixed top-24 right-8 w-[340px] ${preferences.themeConfig.cardClass} glass-glow overflow-hidden z-[100000] shadow-2xl`}
        >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Search className="w-4 h-4 text-white/70" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/50">Google Ecosystem</h3>
            </div>
            <button
              onClick={() => setGoogleAppsOpen(false)}
              className="p-2 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-3 gap-4">
              {GOOGLE_APPS.map((app) => (
                <a
                  key={app.name}
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-white/5 transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all shadow-lg overflow-hidden">
                    <img 
                      src={app.icon} 
                      alt={app.name} 
                      className="w-7 h-7 object-contain group-hover:scale-110 transition-transform" 
                      referrerPolicy="no-referrer" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(app.name)}&background=random&color=fff&size=64&bold=true`;
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-white/40 group-hover:text-white/70 transition-colors text-center truncate w-full uppercase tracking-tighter">
                    {app.name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-white/5 border-t border-white/5 flex justify-center">
          <a 
            href="https://about.google/products/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors"
          >
            More from Google
          </a>
        </div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};
