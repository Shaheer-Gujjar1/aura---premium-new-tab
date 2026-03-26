import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTime } from '../../hooks/useTime';
import { useStore } from '../../stores/useStore';

const backgrounds = {
  morning: {
    clear: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&q=80&w=2070',
    cloudy: 'https://images.unsplash.com/photo-1541675154750-0444c7d51e8e?auto=format&fit=crop&q=80&w=2070',
    rainy: 'https://images.unsplash.com/photo-1511316695145-4992006ffddb?auto=format&fit=crop&q=80&w=2070',
    snowy: 'https://images.unsplash.com/photo-1478265409131-1f65c88f965c?auto=format&fit=crop&q=80&w=2070',
  },
  noon: {
    clear: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2070',
    cloudy: 'https://images.unsplash.com/photo-1534067783941-51c9c23eccfd?auto=format&fit=crop&q=80&w=2070',
    rainy: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&q=80&w=2070',
    snowy: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&q=80&w=2070',
  },
  afternoon: {
    clear: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2070',
    cloudy: 'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?auto=format&fit=crop&q=80&w=2070',
    rainy: 'https://images.unsplash.com/photo-1534274988757-a28bf1f539cf?auto=format&fit=crop&q=80&w=2070',
    snowy: 'https://images.unsplash.com/photo-1517299321926-318738bd1f5d?auto=format&fit=crop&q=80&w=2070',
  },
  evening: {
    clear: 'https://images.unsplash.com/photo-1472120482482-d44b5e47f182?auto=format&fit=crop&q=80&w=2070',
    cloudy: 'https://images.unsplash.com/photo-1502082553248-035343040a44?auto=format&fit=crop&q=80&w=2070',
    rainy: 'https://images.unsplash.com/photo-1428592953211-077101b2021b?auto=format&fit=crop&q=80&w=2070',
    snowy: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?auto=format&fit=crop&q=80&w=2070',
  },
  night: {
    clear: 'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?auto=format&fit=crop&q=80&w=2070',
    cloudy: 'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?auto=format&fit=crop&q=80&w=2070',
    rainy: 'https://images.unsplash.com/photo-1534274988757-a28bf1f539cf?auto=format&fit=crop&q=80&w=2070',
    snowy: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&q=80&w=2070',
  },
};

export const BackgroundManager: React.FC = () => {
  const { greeting } = useTime();
  const { preferences } = useStore();
  const [weatherCode, setWeatherCode] = useState<number | null>(null);

  useEffect(() => {
    const fetchWeatherCode = async () => {
      if (preferences.lat === undefined || preferences.lon === undefined) return;
      
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${preferences.lat}&longitude=${preferences.lon}&current_weather=true`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Status: ${response.status}, Body: ${errorText}`);
        }
        const data = await response.json();
        if (data.current_weather) {
          setWeatherCode(data.current_weather.weathercode);
        }
      } catch (error) {
        console.error(`Failed to fetch weather code for background from ${url}:`, error);
      }
    };

    fetchWeatherCode();
    const interval = setInterval(fetchWeatherCode, 600000); // 10 mins
    return () => clearInterval(interval);
  }, [preferences.lat, preferences.lon]);
  
  const getBg = () => {
    // If theme has a specific background, use it
    if (preferences.themeConfig?.backgroundUrl) {
      return preferences.themeConfig.backgroundUrl;
    }

    let timeOfDay: keyof typeof backgrounds = 'night';
    if (greeting.includes('Morning')) timeOfDay = 'morning';
    else if (greeting.includes('Afternoon')) {
      const hour = new Date().getHours();
      timeOfDay = (hour >= 11 && hour <= 14) ? 'noon' : 'afternoon';
    }
    else if (greeting.includes('Evening')) timeOfDay = 'evening';

    let condition: keyof typeof backgrounds['morning'] = 'clear';
    if (weatherCode !== null) {
      if (weatherCode >= 1 && weatherCode <= 3) condition = 'cloudy';
      else if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) condition = 'rainy';
      else if (weatherCode >= 71 && weatherCode <= 77) condition = 'snowy';
    }

    return backgrounds[timeOfDay][condition];
  };

  return (
    <div className="fixed inset-0 -z-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={getBg()}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${getBg()})` }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        </motion.div>
      </AnimatePresence>
      <div className="noise-bg" />
    </div>
  );
};
